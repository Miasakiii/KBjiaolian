import React from 'react';
import * as LucideIcons from 'lucide-react';

interface DynamicIconProps extends LucideIcons.LucideProps {
  name: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const iconMap = LucideIcons as unknown as Record<string, React.FC<any> | undefined>;

/**
 * 根据图标名称字符串动态渲染对应的 Lucide 图标组件
 * 如果找不到对应的图标，返回 null
 */
export function DynamicIcon({ name, ...props }: DynamicIconProps) {
  const IconComponent = iconMap[name];
  if (!IconComponent) return null;
  return <IconComponent {...props} />;
}

export default DynamicIcon;
