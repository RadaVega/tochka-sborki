// src/components/Icon.jsx
import {
  RocketLaunch, Student, Buildings, Handshake, Microscope,
  GitBranch, Brain, Wrench, Globe, Target, Users, Package,
  HardDrives, CreditCard, Lightning, SignIn, PlayCircle, Sparkle,
  ArrowRight, Compass
} from '@phosphor-icons/react';

const iconMap = {
  RocketLaunch, Student, Buildings, Handshake, Microscope,
  GitBranch, Brain, Wrench, Globe, Target, Users, Package,
  HardDrives, CreditCard, Lightning, SignIn, PlayCircle, Sparkle,
  ArrowRight, Compass
};

export function Icon({ name, size = 20, weight = "duotone", className = '', ...props }) {
  const Component = iconMap[name];
  if (!Component) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }
  return <Component size={size} weight={weight} className={className} {...props} />;
}