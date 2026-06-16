import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import LazyImage from '../LazyImage';

// 模拟 IntersectionObserver
const mockObserve = vi.fn();
const mockDisconnect = vi.fn();

class MockIntersectionObserver {
  observe = mockObserve;
  unobserve = vi.fn();
  disconnect = mockDisconnect;
}

describe('LazyImage 组件', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.IntersectionObserver = MockIntersectionObserver as any;
  });

  it('应该渲染容器', () => {
    const { container } = render(
      <LazyImage
        src="/test-image.jpg"
        alt="测试图片"
        width={200}
        height={200}
      />
    );

    // 应该有容器 div
    const div = container.querySelector('div');
    expect(div).toBeInTheDocument();
  });

  it('应该显示占位符', () => {
    render(
      <LazyImage
        src="/test-image.jpg"
        alt="测试图片"
        width={200}
        height={200}
      />
    );

    // 应该有 SVG 占位符
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('应该调用 IntersectionObserver', () => {
    render(
      <LazyImage
        src="/test-image.jpg"
        alt="测试图片"
        width={200}
        height={200}
      />
    );

    // 应该调用 observe
    expect(mockObserve).toHaveBeenCalled();
  });
});
