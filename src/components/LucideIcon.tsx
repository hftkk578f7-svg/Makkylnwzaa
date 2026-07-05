import React from 'react';
import * as Lucide from 'lucide-react';

interface LucideIconProps {
  name: string;
  className?: string;
  size?: number;
}

export const LucideIcon: React.FC<LucideIconProps> = ({ name, className = '', size = 20 }) => {
  // Safe mapping of string to Lucide React component
  const IconComponent = (Lucide as any)[name];

  if (!IconComponent) {
    // Fallback icon if not found
    return <Lucide.CircleEllipsis className={className} size={size} />;
  }

  return <IconComponent className={className} size={size} />;
};

export default LucideIcon;
