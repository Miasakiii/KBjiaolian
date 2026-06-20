'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// 旧的 token-based 重置已废弃，验证码流程已在 /forgot-password 页面完成
export default function ResetPasswordPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/forgot-password');
  }, [router]);
  return null;
}
