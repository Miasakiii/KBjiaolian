import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Navbar from '../Navbar';

// 模拟 next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  usePathname: () => '/',
}));

// 模拟 auth 模块
vi.mock('@/lib/auth', () => ({
  getUser: vi.fn(() => ({
    id: '1',
    email: 'test@example.com',
    nickname: '测试用户',
  })),
  logout: vi.fn(),
  isAuthenticated: vi.fn(() => true),
}));

describe('Navbar 组件', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该渲染导航栏', async () => {
    render(<Navbar />);

    await waitFor(() => {
      expect(screen.getByText('KB教练')).toBeInTheDocument();
    });
  });

  it('应该显示导航链接', async () => {
    render(<Navbar />);

    await waitFor(() => {
      expect(screen.getByText('体态分析')).toBeInTheDocument();
      expect(screen.getByText('训练方案')).toBeInTheDocument();
    });
  });

  it('应该在登录后显示用户信息', async () => {
    render(<Navbar />);

    await waitFor(() => {
      expect(screen.getByText('测试用户')).toBeInTheDocument();
      expect(screen.getByText('退出')).toBeInTheDocument();
    });
  });

  it('应该在未登录时显示登录按钮', async () => {
    const { getUser } = await import('@/lib/auth');
    vi.mocked(getUser).mockReturnValue(null);

    render(<Navbar />);

    await waitFor(() => {
      expect(screen.getByText('登录')).toBeInTheDocument();
    });
  });
});
