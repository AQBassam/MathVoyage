import React from 'react';
import {
  FursanLogo,
  FursanSymbol,
  LogoVariant,
  LogoSize,
} from './FursanLogo.tsx';

export type { LogoVariant, LogoSize };

export interface JadwaliLogoProps {
  variant?: LogoVariant;
  size?: LogoSize;
  showSubtitle?: boolean;
  subtitle?: string;
  theme?: 'dark' | 'light' | 'monochrome';
  className?: string;
  interactive?: boolean;
  onClick?: () => void;
}

/**
 * محوّل التوافق للهوية الجديدة: «فرسان الحساب»
 */
export const JadwaliSymbol = FursanSymbol;

export const JadwaliLogo: React.FC<JadwaliLogoProps> = (props) => {
  return <FursanLogo {...props} />;
};

export { FursanLogo, FursanSymbol };
