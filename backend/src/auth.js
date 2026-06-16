import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import db from './database.js';

// JWT_SECRET 必须从环境变量读取，不允许硬编码后备值（安全要求）
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET 环境变量未设置。请在 .env 文件中配置安全的密钥。');
}
const JWT_EXPIRES_IN = '7d';

// 验证邮箱格式
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// 验证密码强度
function isValidPassword(password) {
  return typeof password === 'string' && password.length >= 6 && password.length <= 100;
}

// 生成 JWT Token
function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// 生成用户 ID
function generateUserId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

// 预编译 SQL 语句
const stmts = {
  findUserByEmail: db.prepare('SELECT * FROM users WHERE email = ?'),
  findUserById: db.prepare('SELECT * FROM users WHERE id = ?'),
  createUser: db.prepare('INSERT INTO users (id, email, password, nickname) VALUES (?, ?, ?, ?)'),
};

// 注册
export async function register(req, res) {
  try {
    const { email, password, nickname } = req.body;

    // 输入校验
    if (!email || !password) {
      return res.status(400).json({ error: '请提供邮箱和密码' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: '邮箱格式不正确' });
    }
    if (!isValidPassword(password)) {
      return res.status(400).json({ error: '密码长度需要 6-100 个字符' });
    }

    // 检查邮箱是否已注册
    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = stmts.findUserByEmail.get(normalizedEmail);
    if (existingUser) {
      return res.status(409).json({ error: '该邮箱已注册' });
    }

    // 创建用户
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = generateUserId();
    const userNickname = (nickname || email.split('@')[0]).substring(0, 50);

    stmts.createUser.run(userId, normalizedEmail, hashedPassword, userNickname);

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
    console.error('注册失败:', err.message);
    res.status(500).json({ error: '注册失败，请稍后重试' });
  }
}

// 登录
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    // 输入校验
    if (!email || !password) {
      return res.status(400).json({ error: '请提供邮箱和密码' });
    }

    // 查找用户
    const normalizedEmail = email.toLowerCase().trim();
    const user = stmts.findUserByEmail.get(normalizedEmail);

    if (!user) {
      return res.status(401).json({ error: '邮箱或密码错误' });
    }

    // 验证密码
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: '邮箱或密码错误' });
    }

    // 生成 token
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
    console.error('登录失败:', err.message);
    res.status(500).json({ error: '登录失败，请稍后重试' });
  }
}

// 获取当前用户信息
export function getProfile(req, res) {
  const user = stmts.findUserById.get(req.userId);
  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }

  res.json({
    id: user.id,
    email: user.email,
    nickname: user.nickname,
    createdAt: user.created_at,
  });
}

// JWT 认证中间件
export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '请先登录' });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: '登录已过期，请重新登录' });
    }
    return res.status(401).json({ error: '无效的认证信息' });
  }
}
