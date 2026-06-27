import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import db from './database.js';
import logger from './logger.js';
import { sendVerificationEmail } from './email.js';
import type { Request, Response, NextFunction } from 'express';
import type { UserRow, VerificationCodeRow, AppError } from './types.js';

// JWT_SECRET 必须从环境变量读取，不允许硬编码后备值（安全要求）
const JWT_SECRET: string = process.env.JWT_SECRET ?? '';
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET 环境变量未设置。请在 .env 文件中配置安全的密钥。');
}
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '7d';

// 验证码配置
const CODE_LENGTH = 6;
const CODE_EXPIRE_MS = 5 * 60 * 1000; // 5 分钟
const CODE_COOLDOWN_MS = 60 * 1000; // 60 秒冷却

// 验证邮箱格式（RFC 5322 简化版）
function isValidEmail(email: string): boolean {
  return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/.test(email);
}

// 验证密码强度：6-100 字符，且必须同时包含字母和数字
function isValidPassword(password: string): boolean {
  if (typeof password !== 'string' || password.length < 6 || password.length > 100) {
    return false;
  }
  // 至少包含一个字母和一个数字
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasDigit = /\d/.test(password);
  return hasLetter && hasDigit;
}

// 生成 JWT Token
function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });
}

// 生成用户 ID（使用 crypto.randomUUID 避免可预测与碰撞）
function generateUserId(): string {
  return crypto.randomUUID();
}

// 生成 6 位数字验证码
function generateCode(): string {
  return crypto.randomInt(100000, 999999).toString();
}

// 预编译 SQL 语句
const stmts = {
  findUserByEmail: db.prepare<unknown[], UserRow>('SELECT * FROM users WHERE email = ?'),
  findUserById: db.prepare<unknown[], UserRow>('SELECT * FROM users WHERE id = ?'),
  findUserByOpenId: db.prepare<unknown[], UserRow>('SELECT * FROM users WHERE open_id = ?'),
  createUser: db.prepare('INSERT INTO users (id, email, password, nickname) VALUES (?, ?, ?, ?)'),
  createWechatUser: db.prepare('INSERT INTO users (id, open_id, nickname, plan, email, password) VALUES (?, ?, ?, ?, ?, ?)'),
  updateUserOpenId: db.prepare('UPDATE users SET open_id = ?, updated_at = ? WHERE id = ?'),
  updatePassword: db.prepare('UPDATE users SET password = ?, updated_at = ? WHERE id = ?'),
  createResetToken: db.prepare('INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)'),
  findResetToken: db.prepare('SELECT * FROM password_resets WHERE token = ? AND used = 0 AND expires_at > ?'),
  markTokenUsed: db.prepare('UPDATE password_resets SET used = 1 WHERE id = ?'),
  cleanExpiredTokens: db.prepare('DELETE FROM password_resets WHERE expires_at < ?'),

  // 验证码相关
  insertCode: db.prepare('INSERT INTO verification_codes (email, code, type, expires_at) VALUES (?, ?, ?, ?)'),
  // 查找当前有效的验证码记录（不校验 code 值，在 JS 层比对以防爆破）
  findActiveCode: db.prepare<unknown[], VerificationCodeRow>(`
    SELECT * FROM verification_codes
    WHERE email = ? AND type = ? AND used = 0 AND expires_at > ?
    ORDER BY created_at DESC LIMIT 1
  `),
  incrementAttempts: db.prepare('UPDATE verification_codes SET attempts = attempts + 1 WHERE id = ?'),
  markCodeUsed: db.prepare('UPDATE verification_codes SET used = 1 WHERE id = ?'),
  findRecentCode: db.prepare<unknown[], VerificationCodeRow>(`
    SELECT * FROM verification_codes
    WHERE email = ? AND type = ? AND created_at > ?
    ORDER BY created_at DESC LIMIT 1
  `),
  cleanExpiredCodes: db.prepare('DELETE FROM verification_codes WHERE expires_at < ?'),
};

// === 发送验证码 ===
export async function sendVerificationCode(req: Request, res: Response) {
  try {
    const { email, type = 'register' } = req.body;

    if (!email) {
      return res.status(400).json({ error: '请提供邮箱' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: '邮箱格式不正确' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 注册类型：检查邮箱是否已注册
    if (type === 'register') {
      const existing = stmts.findUserByEmail.get(normalizedEmail);
      if (existing) {
        return res.status(409).json({ error: '该邮箱已注册' });
      }
    }

    // 冷却检查：60 秒内只能发一次
    const cooldown = Date.now() - CODE_COOLDOWN_MS;
    const recent = stmts.findRecentCode.get(normalizedEmail, type, cooldown);
    if (recent) {
      return res.status(429).json({ error: '验证码发送过于频繁，请稍后再试' });
    }

    // 清理过期验证码
    stmts.cleanExpiredCodes.run(Date.now());

    // 生成并存储验证码
    const code = generateCode();
    const expiresAt = Date.now() + CODE_EXPIRE_MS;
    stmts.insertCode.run(normalizedEmail, code, type, expiresAt);

    // 发送验证码邮件（开发模式打印到控制台，生产模式通过 Resend 真实发送）
    await sendVerificationEmail(normalizedEmail, code, type);

    res.json({
      message: '验证码已发送',
      // 开发模式返回提示
      ...(process.env.NODE_ENV !== 'production' && {
        devHint: `验证码已打印到后端控制台 (邮箱: ${normalizedEmail})`,
      }),
    });
  } catch (err) {
    logger.error({ err }, '发送验证码失败');
    res.status(500).json({ error: '发送验证码失败，请稍后重试' });
  }
}

// === 验证验证码（不立即标记已用，由调用方在动作成功后调用 markCodeUsed） ===
const MAX_CODE_ATTEMPTS = 5;

export function verifyCode(email: string, code: string, type: 'register' | 'reset' = 'register') {
  const normalizedEmail = email.toLowerCase().trim();
  const record = stmts.findActiveCode.get(normalizedEmail, type, Date.now());

  if (!record) {
    return { valid: false, error: '验证码无效或已过期' };
  }

  // 已达最大尝试次数
  if (record.attempts >= MAX_CODE_ATTEMPTS) {
    return { valid: false, error: '验证码错误次数过多，请重新获取' };
  }

  // 验证码匹配
  if (record.code === code) {
    return { valid: true, codeId: record.id };
  }

  // 验证码错误：递增尝试次数
  stmts.incrementAttempts.run(record.id);
  if (record.attempts + 1 >= MAX_CODE_ATTEMPTS) {
    // 达到上限，锁定该验证码
    stmts.markCodeUsed.run(record.id);
    return { valid: false, error: '验证码错误次数过多，请重新获取' };
  }

  return { valid: false, error: '验证码无效或已过期' };
}

// 标记验证码已用
export function markCodeUsed(codeId: number): void {
  if (!codeId) return;
  stmts.markCodeUsed.run(codeId);
}

// === 注册（需要验证码）===
export async function register(req: Request, res: Response) {
  try {
    const { email, password, nickname, code } = req.body;

    // 输入校验
    if (!email || !password || !code) {
      return res.status(400).json({ error: '请提供邮箱、密码和验证码' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: '邮箱格式不正确' });
    }
    if (!isValidPassword(password)) {
      return res.status(400).json({ error: '密码需要 6-100 个字符，且必须包含字母和数字' });
    }

    // 验证码校验（不立即标记已用）
    const normalizedEmail = email.toLowerCase().trim();
    const codeResult = verifyCode(normalizedEmail, code, 'register');
    if (!codeResult.valid) {
      return res.status(400).json({ error: codeResult.error });
    }

    // 检查邮箱是否已注册（双重检查）
    const existingUser = stmts.findUserByEmail.get(normalizedEmail);
    if (existingUser) {
      return res.status(409).json({ error: '该邮箱已注册' });
    }

    try {
      // 创建用户
      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = generateUserId();
      const userNickname = (nickname || email.split('@')[0]).substring(0, 50);

      stmts.createUser.run(userId, normalizedEmail, hashedPassword, userNickname);

      // 注册成功后才标记验证码已用
      markCodeUsed(codeResult.codeId!);

      // 生成 token
      const token = generateToken(userId);

      res.status(201).json({
        token,
        user: {
          id: userId,
          email: normalizedEmail,
          nickname: userNickname,
        },
      });
    } catch (err) {
      // 注册过程失败，不标记验证码已用，用户可重试
      if ((err as any).code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return res.status(409).json({ error: '该邮箱已注册' });
      }
      throw err;
    }
  } catch (err) {
    logger.error({ err }, '注册失败');
    res.status(500).json({ error: '注册失败，请稍后重试' });
  }
}

// === 登录（不需要验证码）===
// 预生成的固定 bcrypt 哈希，用于不存在用户时的时序攻击防御
const DUMMY_HASH = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: '请提供邮箱和密码' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = stmts.findUserByEmail.get(normalizedEmail);

    // 无论用户是否存在都执行一次 bcrypt 比较，避免用户枚举的时序攻击
    const isValid = await bcrypt.compare(password, user?.password || DUMMY_HASH);

    if (!user || !isValid) {
      return res.status(401).json({ error: '邮箱或密码错误' });
    }

    const token = generateToken(user.id);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
      },
    });
  } catch (err) {
    logger.error({ err }, '登录失败');
    res.status(500).json({ error: '登录失败，请稍后重试' });
  }
}

// === 微信小程序登录（wx.login → code2Session → 换 token）===
const WECHAT_APPID: string = process.env.WECHAT_APPID ?? '';
const WECHAT_APPSECRET: string = process.env.WECHAT_APPSECRET ?? '';

export async function wechatLogin(req: Request, res: Response) {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: '缺少登录凭证 code' });
    }

    // ===== 本地开发 Mock 模式 =====
    // 在 .env 中配置 MOCK_WECHAT_LOGIN=true 即可跳过真实微信 API 调用
    const isMock = process.env.MOCK_WECHAT_LOGIN === 'true';
    let openid;

    if (isMock) {
      openid = `mock_${code}`;
    } else {
      if (!WECHAT_APPID || !WECHAT_APPSECRET) {
        logger.error('WECHAT_APPID 或 WECHAT_APPSECRET 环境变量未配置');
        return res.status(500).json({ error: '服务器配置错误，请联系管理员' });
      }

      // 调用微信 code2Session 接口
      const wechatUrl = `https://api.weixin.qq.com/sns/jscode2session?appid=${WECHAT_APPID}&secret=${WECHAT_APPSECRET}&js_code=${code}&grant_type=authorization_code`;

      let wechatRes;
      try {
        wechatRes = await fetch(wechatUrl);
      } catch (err) {
        logger.error({ err }, '调用微信 code2Session 失败');
        return res.status(502).json({ error: '无法连接微信登录服务，请稍后重试' });
      }

      const wechatData = await wechatRes.json() as Record<string, any>;

      if (wechatData.errcode) {
        logger.error({ errcode: wechatData.errcode, errmsg: wechatData.errmsg }, '微信 code2Session 错误');
        return res.status(400).json({ error: `微信登录失败: ${wechatData.errmsg}` });
      }

      openid = wechatData.openid;
    }

    if (!openid) {
      return res.status(400).json({ error: '获取微信用户身份失败' });
    }

    // 查找是否已有关联用户
    let user = stmts.findUserByOpenId.get(openid);

    if (!user) {
      // 新用户：创建账号
      const userId = generateUserId();
      const randomSuffix = crypto.randomInt(1000, 9999).toString();
      const nickname = isMock ? `测试用户${randomSuffix}` : `KB用户${randomSuffix}`;

      stmts.createWechatUser.run(userId, openid, nickname, 'free', `wechat_${userId}@local.dev`, '__WECHAT_NO_PW__');
      user = stmts.findUserByOpenId.get(openid);
    }

    if (!user) {
      return res.status(500).json({ error: '创建用户失败' });
    }

    // 生成 JWT
    const token = generateToken(user.id);

    // 返回格式需与小程序 utils/auth.js 的解析逻辑匹配
    res.json({
      access_token: token,
      user: {
        id: user.id,
        nickname: user.nickname,
        plan: user.plan || 'free',
      },
    });
  } catch (err) {
    logger.error({ err }, '微信登录失败');
    res.status(500).json({ error: '登录失败，请稍后重试' });
  }
}

// === 获取当前用户信息 ===
export function getProfile(req: Request, res: Response) {
  try {
    const user = stmts.findUserById.get(req.userId);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json({
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      plan: user.plan || 'free',
      planExpiresAt: user.plan_expires_at,
      createdAt: user.created_at,
    });
  } catch (err) {
    logger.error({ err }, '获取用户信息失败');
    res.status(500).json({ error: '获取用户信息失败' });
  }
}

// === 忘记密码 — 发送重置验证码 ===
export async function forgotPassword(req: Request, res: Response) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: '请提供邮箱' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = stmts.findUserByEmail.get(normalizedEmail);

    // 安全考虑：无论邮箱是否存在都返回成功
    if (!user) {
      return res.json({ message: '如果该邮箱已注册，验证码已发送' });
    }

    // 冷却检查
    const cooldown = Date.now() - CODE_COOLDOWN_MS;
    const recent = stmts.findRecentCode.get(normalizedEmail, 'reset', cooldown);
    if (recent) {
      return res.json({ message: '如果该邮箱已注册，验证码已发送' });
    }

    // 清理过期验证码
    stmts.cleanExpiredCodes.run(Date.now());

    // 生成重置验证码
    const code = generateCode();
    const expiresAt = Date.now() + CODE_EXPIRE_MS;
    stmts.insertCode.run(normalizedEmail, code, 'reset', expiresAt);

    // 发送重置密码验证码邮件
    await sendVerificationEmail(normalizedEmail, code, 'reset');

    res.json({
      message: '如果该邮箱已注册，验证码已发送',
      ...(process.env.NODE_ENV !== 'production' && {
        devHint: `验证码已打印到后端控制台 (邮箱: ${normalizedEmail})`,
      }),
    });
  } catch (err) {
    logger.error({ err }, '忘记密码失败');
    res.status(500).json({ error: '操作失败，请稍后重试' });
  }
}

// === 重置密码（需要验证码）===
export async function resetPassword(req: Request, res: Response) {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: '请提供邮箱、验证码和新密码' });
    }

    if (!isValidPassword(newPassword)) {
      return res.status(400).json({ error: '密码需要 6-100 个字符，且必须包含字母和数字' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = stmts.findUserByEmail.get(normalizedEmail);
    if (!user) {
      return res.status(400).json({ error: '验证码无效或已过期' });
    }

    // 验证码校验（不立即标记已用）
    const codeResult = verifyCode(normalizedEmail, code, 'reset');
    if (!codeResult.valid) {
      return res.status(400).json({ error: codeResult.error });
    }

    try {
      // 更新密码
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      stmts.updatePassword.run(hashedPassword, Date.now(), user.id);

      // 重置成功后才标记验证码已用
      markCodeUsed(codeResult.codeId!);

      res.json({ message: '密码重置成功，请使用新密码登录' });
    } catch (err) {
      // 重置过程失败，不标记验证码已用，用户可重试
      throw err;
    }
  } catch (err) {
    logger.error({ err }, '重置密码失败');
    res.status(500).json({ error: '重置失败，请稍后重试' });
  }
}

// === JWT 认证中间件 ===
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.get('Authorization') || (req.headers['authorization'] as string | undefined) || (req.headers['Authorizaton'] as string | undefined);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '请先登录' });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.userId = decoded.userId;
    next();
    } catch (err) {
      const e = err as Error;
      logger.warn({ err: { name: e.name, message: e.message } }, '[authMiddleware] JWT 校验失败');
      if (e.name === 'TokenExpiredError') {
        return res.status(401).json({ error: '登录已过期，请重新登录' });
      }
      return res.status(401).json({ error: '无效的认证信息' });
    }
}
