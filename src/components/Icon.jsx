import {
  Wrench,
  Globe,
  Target,
  Users,
  Package,
  HardDrive,
  Circle,
} from 'lucide-react';

const iconMap = {
  Wrench,
  Globe,
  Target,
  Users,
  Package,
  HardDrives: HardDrive,
};

export function Icon({ name, size = 24, color = 'currentColor', className, strokeWidth = 2 }) {
  const LucideIcon = iconMap[name] || Circle;
  return (
    <LucideIcon
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      className={className}
    />
  );
}