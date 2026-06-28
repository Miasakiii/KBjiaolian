/**
 * 微信支付 API v3 核心模块
 *
 * 功能：
 * - 生成 API 请求签名（SHA256-RSA2048）
 * - 验证微信回调签名
 * - 解密回调通知体（AEAD_AES_256_GCM）
 * - 统一下单（JSAPI / APP / Native）
 * - 查询订单 / 关闭订单
 *
 * 参考文档：https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_1_1.shtml
 */
import crypto from 'crypto';
import { readFileSync, existsSync } from 'fs';
import logger from './logger.js';

// ========== 配置 ==========

const config = {
  get merchantId(): string { return process.env.WECHATPAY_MCH_ID ?? ''; },
  get serialNo(): string { return process.env.WECHATPAY_SERIAL_NO ?? ''; },
  get apiV3Key(): string { return process.env.WECHATPAY_API_V3_KEY ?? ''; },
  get privateKeyPath(): string { return process.env.WECHATPAY_PRIVATE_KEY_PATH || './certs/apiclient_key.pem'; },
  get notifyUrl(): string { return process.env.WECHATPAY_NOTIFY_URL ?? ''; },
  get miniAppId(): string { return process.env.WECHAT_APPID ?? ''; },
  get appAppId(): string { return process.env.WECHAT_OPENPLATFORM_APPID ?? ''; },
  get isMock(): boolean { return process.env.MOCK_WECHAT_PAY === 'true'; },
};

let _privateKey: crypto.KeyObject | null = null;

/**
 * 获取商户私钥（带缓存）
 */
function getPrivateKey(): crypto.KeyObject {
  if (_privateKey) return _privateKey;
  const keyPath = config.privateKeyPath;
  if (!existsSync(keyPath)) {
    throw new Error(`微信支付私钥文件不存在: ${keyPath}`);
  }
  const pem = readFileSync(keyPath, 'utf8');
  _privateKey = crypto.createPrivateKey(pem);
  return _privateKey;
}

/**
 * 检查微信支付是否已配置（非 mock 模式）
 */
export function isWechatPayConfigured(): boolean {
  return !config.isMock
    && !!config.merchantId
    && !!config.serialNo
    && !!config.apiV3Key
    && !!config.notifyUrl;
}

// ========== 签名 / 验签 ==========

/**
 * 生成随机串
 */
function generateNonce(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * 构造签名串并签名
 * @param method - HTTP 方法（大写）
 * @param urlPath - 请求路径（含查询参数，不含域名）
 * @param timestamp - 时间戳（秒）
 * @param nonce - 随机串
 * @param body - 请求体（GET 为空字符串）
 * @returns Base64 编码的签名
 */
function sign(method: string, urlPath: string, timestamp: string, nonce: string, body: string): string {
  const message = `${method}\n${urlPath}\n${timestamp}\n${nonce}\n${body}\n`;
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(message);
  return signer.sign(getPrivateKey(), 'base64');
}

/**
 * 生成 Authorization 请求头
 * @param method - HTTP 方法
 * @param urlPath - 请求路径（含查询参数）
 * @param body - 请求体
 */
export function createAuthorizationHeader(method: string, urlPath: string, body: string = ''): { authorization: string; timestamp: string; nonce: string } {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = generateNonce();
  const signature = sign(method, urlPath, timestamp, nonce, body);

  const authorization = [
    'WECHATPAY2-SHA256-RSA2048',
    `mchid="${config.merchantId}"`,
    `nonce_str="${nonce}"`,
    `signature="${signature}"`,
    `timestamp="${timestamp}"`,
    `serial_no="${config.serialNo}"`,
  ].join(',');

  return { authorization, timestamp, nonce };
}

/**
 * 验证微信回调签名
 * @param headers - 请求头
 * @param body - 原始请求体（字符串）
 * @returns 签名是否有效
 */
export function verifyCallbackSignature(headers: Record<string, string | undefined>, body: string): boolean {
  const timestamp = headers['wechatpay-timestamp'];
  const nonce = headers['wechatpay-nonce'];
  const signature = headers['wechatpay-signature'];
  const serial = headers['wechatpay-serial'];

  if (!timestamp || !nonce || !signature || !serial) {
    logger.error('微信回调签名参数缺失');
    return false;
  }

  // 构造验签串
  const message = `${timestamp}\n${nonce}\n${body}\n`;

  // 用商户证书公钥验签（开发阶段）
  // 生产环境应使用微信支付平台证书公钥（需先下载平台证书）
  try {
    const publicKey = crypto.createPublicKey(getPrivateKey().export({ format: 'pem', type: 'pkcs1' }));
    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(message);
    return verifier.verify(publicKey, signature, 'base64');
  } catch (err) {
    const e = err as Error;
    logger.error({ err: e }, '验证微信回调签名失败');
    return false;
  }
}

// ========== 回调通知解密 ==========

interface NotificationResource {
  algorithm: string;
  ciphertext: string;
  nonce: string;
  associated_data?: string;
}

/**
 * 解密微信回调通知的加密数据（AEAD_AES_256_GCM）
 * @param resource - 通知中的 resource 对象
 * @returns 解密后的数据
 */
export function decryptNotification(resource: NotificationResource): Record<string, unknown> {
  const { algorithm, ciphertext, nonce, associated_data } = resource;

  if (algorithm !== 'AEAD_AES_256_GCM') {
    throw new Error(`不支持的加密算法: ${algorithm}`);
  }

  const key = Buffer.from(config.apiV3Key, 'utf8');
  const nonceBuf = Buffer.from(nonce, 'utf8');
  const aad = Buffer.from(associated_data || '', 'utf8');
  const ciphertextBuf = Buffer.from(ciphertext, 'base64');

  // AEAD_AES_256_GCM: 密文末尾 16 字节是 tag
  const encryptedData = ciphertextBuf.subarray(0, ciphertextBuf.length - 16);
  const authTag = ciphertextBuf.subarray(ciphertextBuf.length - 16);

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, nonceBuf);
  decipher.setAAD(aad);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encryptedData),
    decipher.final(),
  ]);

  return JSON.parse(decrypted.toString('utf8'));
}

// ========== 统一下单 ==========

const API_BASE = 'https://api.mch.weixin.qq.com';

/**
 * 发送微信支付 API 请求
 */
async function requestApi(method: string, path: string, body: Record<string, unknown> | null = null): Promise<Record<string, unknown>> {
  const bodyStr = body ? JSON.stringify(body) : '';
  const { authorization } = createAuthorizationHeader(method, path, bodyStr);

  const resp = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Authorization': authorization,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: bodyStr || undefined,
  });

  const data = await resp.json() as Record<string, unknown>;

  if (resp.status !== 200) {
    const errMsg = (data.message as string) || (data.code as string) || '未知错误';
    logger.error({ status: resp.status, data }, '微信支付 API 错误');
    throw new Error(`微信支付: ${errMsg}`);
  }

  return data;
}

interface JsapiOrderParams {
  orderId: string;
  amount: number;
  description: string;
  openid: string;
}

interface JsapiOrderResult {
  timeStamp: string;
  nonceStr: string;
  package: string;
  signType: string;
  paySign: string;
}

/**
 * 统一下单（JSAPI - 小程序支付）
 * @param params
 * @param params.orderId - 商户订单号
 * @param params.amount - 金额（分）
 * @param params.description - 商品描述
 * @param params.openid - 用户 openid（JSAPI 必填）
 * @returns 支付参数（用于 wx.requestPayment）
 */
export async function createJsapiOrder({ orderId, amount, description, openid }: JsapiOrderParams): Promise<JsapiOrderResult> {
  const body = {
    appid: config.miniAppId,
    mchid: config.merchantId,
    description: description.substring(0, 127),
    out_trade_no: orderId,
    notify_url: config.notifyUrl,
    amount: {
      total: amount,
      currency: 'CNY',
    },
    payer: {
      openid,
    },
  };

  const data = await requestApi('POST', '/v3/pay/transactions/jsapi', body);

  // 返回小程序 wx.requestPayment 所需参数
  const prepayId = data.prepay_id as string;
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonceStr = generateNonce();
  const packageStr = `prepay_id=${prepayId}`;

  // 签名：小程序的 paySign 用 RSA-SHA256 签名
  const signMessage = `${config.miniAppId}\n${timestamp}\n${nonceStr}\n${packageStr}\n`;
  const paySign = crypto.createSign('RSA-SHA256')
    .update(signMessage)
    .sign(getPrivateKey(), 'base64');

  return {
    timeStamp: timestamp,
    nonceStr,
    package: packageStr,
    signType: 'RSA',
    paySign,
  };
}

interface AppOrderParams {
  orderId: string;
  amount: number;
  description: string;
}

interface AppOrderResult {
  appid: string;
  partnerid: string;
  prepayid: string;
  package: string;
  noncestr: string;
  timestamp: string;
  sign: string;
}

/**
 * 统一下单（APP 支付）
 * @param params
 * @param params.orderId - 商户订单号
 * @param params.amount - 金额（分）
 * @param params.description - 商品描述
 * @returns 支付参数（用于 Flutter 微信 SDK）
 */
export async function createAppOrder({ orderId, amount, description }: AppOrderParams): Promise<AppOrderResult> {
  const body = {
    appid: config.appAppId,
    mchid: config.merchantId,
    description: description.substring(0, 127),
    out_trade_no: orderId,
    notify_url: config.notifyUrl,
    amount: {
      total: amount,
      currency: 'CNY',
    },
  };

  const data = await requestApi('POST', '/v3/pay/transactions/app', body);

  // 返回 App 端拉起支付所需的参数
  const prepayId = data.prepay_id as string;
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonceStr = generateNonce();
  const packageStr = `Sign=WXPay`;

  // APP 支付签名
  const signMessage = `${config.appAppId}\n${timestamp}\n${nonceStr}\n${prepayId}\n`;
  const signResult = crypto.createSign('RSA-SHA256')
    .update(signMessage)
    .sign(getPrivateKey(), 'base64');

  return {
    appid: config.appAppId,
    partnerid: config.merchantId,
    prepayid: prepayId,
    package: packageStr,
    noncestr: nonceStr,
    timestamp: timestamp,
    sign: signResult,
  };
}

// ========== 订单查询 / 关闭 ==========

/**
 * 查询订单（按商户订单号）
 * @param orderId - 商户订单号
 * @returns 订单信息
 */
export async function queryOrder(orderId: string): Promise<Record<string, unknown>> {
  const path = `/v3/pay/transactions/out-trade-no/${orderId}?mchid=${config.merchantId}`;
  return requestApi('GET', path);
}

/**
 * 关闭订单
 * @param orderId - 商户订单号
 */
export async function closeOrder(orderId: string): Promise<Record<string, unknown>> {
  const path = `/v3/pay/transactions/out-trade-no/${orderId}/close`;
  return requestApi('POST', path, {});
}
