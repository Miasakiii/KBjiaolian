import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY;
const FROM = process.env.MAIL_FROM || 'KB教练 <noreply@kbcoach.app>';
const resend = apiKey ? new Resend(apiKey) : null;

/**
 * 发送验证码邮件
 * - 开发模式（无 RESEND_API_KEY 或非 production）：打印到控制台
 * - 生产模式：通过 Resend 真实发送 HTML 邮件
 *
 * @param {string} to - 收件人邮箱
 * @param {string} code - 6 位验证码
 * @param {'register'|'reset'} type - 注册 / 重置密码
 */
export async function sendVerificationEmail(to, code, type) {
  // 开发模式 fallback
  if (!resend || process.env.NODE_ENV !== 'production') {
    console.log('');
    console.log('='.repeat(50));
    console.log(`📧 验证码 [${type === 'register' ? '注册' : '重置密码'}]`);
    console.log(`   邮箱: ${to}`);
    console.log(`   验证码: ${code}`);
    console.log(`   有效期: 5 分钟`);
    console.log('='.repeat(50));
    console.log('');
    return { dev: true };
  }

  const subject = type === 'register'
    ? 'KB教练 — 注册验证码'
    : 'KB教练 — 重置密码验证码';

  const html = buildEmailHtml(code, type);

  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject,
    html,
  });

  if (error) {
    console.error('[email] Resend 发送失败:', error.message);
    throw new Error('邮件发送失败');
  }

  console.log(`[email] 验证码已发送至 ${to} [${type}]`);
}

/**
 * 构建验证码邮件 HTML（内联样式，邮件客户端兼容）
 */
function buildEmailHtml(code, type) {
  const title = type === 'register' ? '注册验证码' : '重置密码验证码';
  const intro = type === 'register'
    ? '感谢注册 KB 教练！请使用以下验证码完成注册：'
    : '您正在重置密码，请使用以下验证码完成操作：';

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f6f8f7;font-family:-apple-system,BlinkMacSystemFont,'PingFang SC','Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 2px 12px rgba(15,23,42,0.05);">
        <!-- 品牌条 -->
        <tr><td style="background:#0f766e;padding:24px 32px;">
          <span style="font-size:20px;font-weight:600;color:#ffffff;letter-spacing:1px;">KB 教练</span>
        </td></tr>
        <!-- 内容 -->
        <tr><td style="padding:32px;">
          <h1 style="font-size:22px;font-weight:600;color:#0f172a;margin:0 0 16px;">${title}</h1>
          <p style="font-size:15px;color:#475569;line-height:1.6;margin:0 0 24px;">${intro}</p>
          <div style="background:#ccfbf1;border-radius:12px;padding:24px;text-align:center;margin:0 0 24px;">
            <span style="font-size:32px;font-weight:600;color:#0f766e;letter-spacing:8px;font-variant-numeric:tabular-nums;">${code}</span>
          </div>
          <p style="font-size:13px;color:#94a3b8;line-height:1.5;margin:0;">验证码 5 分钟内有效。如非本人操作，请忽略此邮件。</p>
        </td></tr>
      </table>
      <p style="font-size:12px;color:#94a3b8;margin:16px 0 0;">KB 教练 · Know Your Body</p>
    </td></tr>
  </table>
</body>
</html>`;
}
