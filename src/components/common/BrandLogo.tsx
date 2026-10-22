import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  whiteText?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ size = 'md', whiteText = false }) => {
  const iconSize = size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-9 h-9' : 'w-7 h-7';
  const textSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';

  return (
    <div className="flex items-center gap-2 select-none">
      <div className={`relative ${iconSize} flex items-center justify-center rounded-lg bg-[#0077b6] text-white shadow-sm`}>
        {/* Modern clinical cross */}
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current stroke-current stroke-1">
          <path d="M10 4a1 1 0 011-1h2a1 1 0 011 1v5h5a1 1 0 011 1v2a1 1 0 01-1 1h-5v5a1 1 0 01-1 1h-2a1 1 0 01-1-1v-5H5a1 1 0 01-1-1v-2a1 1 0 011-1h5V4z" />
        </svg>
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-white"></span>
      </div>
      <div className="leading-tight font-['Plus_Jakarta_Sans']">
        <span className={`font-bold tracking-tight ${textSize} ${whiteText ? 'text-white' : 'text-slate-900'}`}>
          medi-
        </span>
        <span className={`font-semibold tracking-tight ${textSize} ${whiteText ? 'text-sky-200' : 'text-[#005d90]'}`}>
          core
        </span>
      </div>
    </div>
  );
};
