import { test, expect } from '@playwright/test';

const isMobile = (name: string) => name === 'mobile';

test.describe('落地页 — 通用（desktop + mobile）', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('页面加载并显示品牌名 KB教练', async ({ page }) => {
    await expect(page.locator('nav')).toContainText('KB教练');
  });

  test('Hero 区域显示主标题和副标题', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('拍一张照');
    await expect(page.locator('h1')).toContainText('Know Your Body');
  });

  test('Hero 区域有 CTA 按钮', async ({ page }) => {
    // Hero 区域的 "免费下载" 按钮（Pricing 区域也有同名链接）
    const heroSection = page.locator('section').first();
    const downloadBtn = heroSection.getByRole('link', { name: '免费下载' });
    await expect(downloadBtn).toBeVisible();
    await expect(downloadBtn).toHaveAttribute('href', '#download');

    const learnMore = heroSection.getByRole('link', { name: '了解更多' });
    await expect(learnMore).toBeVisible();
    await expect(learnMore).toHaveAttribute('href', '#features');
  });

  test('Stats 区域显示 4 个统计数字', async ({ page }) => {
    // RevealSection 使用 IntersectionObserver，需滚动到可见区域
    await page.getByText('评估维度').scrollIntoViewIfNeeded();
    await expect(page.getByText('评估维度', { exact: true })).toBeVisible();
    await expect(page.getByText('标准动作', { exact: true })).toBeVisible();
    await expect(page.getByText('恢复追踪', { exact: true })).toBeVisible();
    await expect(page.getByText('AI 在线', { exact: true })).toBeVisible();
  });

  test('Features 区域有 id="features" 且显示 4 个功能卡片', async ({ page }) => {
    const featuresSection = page.locator('#features');
    await expect(featuresSection).toBeVisible();
    await expect(page.getByText('四大核心功能')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'AI 体态分析' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '智能训练方案' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '饮食识别' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'AI 教练对话' })).toBeVisible();
  });

  test('How it works 区域显示 3 个步骤', async ({ page }) => {
    await expect(page.getByText('三步开始')).toBeVisible();
    await expect(page.getByRole('heading', { name: '拍照上传' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '获取报告' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '开始训练' })).toBeVisible();
  });

  test('Testimonials 区域显示 3 条用户评价', async ({ page }) => {
    await expect(page.getByText('用户说')).toBeVisible();
    await expect(page.getByText('小王')).toBeVisible();
    await expect(page.getByText('小李')).toBeVisible();
    await expect(page.getByText('张教练')).toBeVisible();
  });

  test('Pricing 区域有 id="pricing" 且显示 2 个套餐', async ({ page }) => {
    const pricingSection = page.locator('#pricing');
    await expect(pricingSection).toBeVisible();
    await expect(page.getByText('简单定价')).toBeVisible();
    await expect(page.getByRole('heading', { name: '免费版' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Pro 年度' })).toBeVisible();
  });

  test('Pro 年度套餐有"推荐"标签', async ({ page }) => {
    await expect(page.getByText('推荐', { exact: true })).toBeVisible();
  });

  test('Download 区域有 id="download" 且显示下载按钮', async ({ page }) => {
    const downloadSection = page.locator('#download');
    await expect(downloadSection).toBeVisible();
    await expect(page.getByText('立即下载 KB教练')).toBeVisible();
    const apkLink = page.getByRole('link', { name: '下载 APK 安装包' });
    await expect(apkLink).toBeVisible();
  });

  test('FAQ 区域显示 4 个常见问题', async ({ page }) => {
    await expect(page.getByText('常见问题')).toBeVisible();
    await expect(page.getByText('如何开始使用 KB教练？')).toBeVisible();
    await expect(page.getByText('AI 分析准确吗？')).toBeVisible();
    await expect(page.getByText('数据安全吗？')).toBeVisible();
    await expect(page.getByText('支持哪些设备？')).toBeVisible();
  });

  test('Footer 显示版权信息', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toContainText('KB教练');
    await expect(footer).toContainText('2026');
  });

  test('导航栏"下载 APP"按钮可见', async ({ page }) => {
    const navDownloadBtn = page.locator('nav').getByRole('link', { name: '下载 APP' });
    await expect(navDownloadBtn).toBeVisible();
  });
});

// ====================================================
// Desktop 专属测试
// ====================================================
test.describe('落地页 — Desktop 专属', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(isMobile(test.info().project.name), 'Desktop only');
    await page.goto('/');
  });

  test('导航栏显示"功能"和"定价"链接', async ({ page }) => {
    const featuresLink = page.locator('nav').getByRole('link', { name: '功能' });
    const pricingLink = page.locator('nav').getByRole('link', { name: '定价' });
    await expect(featuresLink).toBeVisible();
    await expect(pricingLink).toBeVisible();
  });

  test('点击"功能"链接滚动到 Features 区域', async ({ page }) => {
    const featuresLink = page.locator('nav').getByRole('link', { name: '功能' });
    await featuresLink.click();
    await expect(page.locator('#features')).toBeInViewport();
  });

  test('点击"定价"链接滚动到 Pricing 区域', async ({ page }) => {
    const pricingLink = page.locator('nav').getByRole('link', { name: '定价' });
    await pricingLink.click();
    await expect(page.locator('#pricing')).toBeInViewport();
  });

  test('Hero 区域显示手机 Mockup', async ({ page }) => {
    const mockup = page.locator('.animate-float');
    await expect(mockup).toBeVisible();
  });
});

// ====================================================
// Mobile 专属测试
// ====================================================
test.describe('落地页 — Mobile 专属', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!isMobile(test.info().project.name), 'Mobile only');
    await page.goto('/');
  });

  test('导航栏不显示"功能"和"定价"链接（移动端隐藏）', async ({ page }) => {
    // 只检查 nav 内的链接（footer 内的同名链接始终可见）
    const navFeaturesLink = page.locator('nav').getByRole('link', { name: '功能' });
    const navPricingLink = page.locator('nav').getByRole('link', { name: '定价' });
    await expect(navFeaturesLink).toBeHidden();
    await expect(navPricingLink).toBeHidden();
  });

  test('导航栏"下载 APP"按钮在移动端可见', async ({ page }) => {
    const navDownloadBtn = page.locator('nav').getByRole('link', { name: '下载 APP' });
    await expect(navDownloadBtn).toBeVisible();
  });

  test('Hero 区域不显示手机 Mockup（移动端隐藏）', async ({ page }) => {
    const mockup = page.locator('.animate-float');
    await expect(mockup).toBeHidden();
  });
});
