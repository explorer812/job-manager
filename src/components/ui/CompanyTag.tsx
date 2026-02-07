import type { CompanyType } from '../../types';
import { companyTypeMap } from '../../utils/mockData';

interface CompanyTagProps {
  type: CompanyType;
  size?: 'sm' | 'md';
}

export function CompanyTag({ type, size = 'sm' }: CompanyTagProps) {
  const config = companyTypeMap[type];
  const sizeClasses = size === 'sm' ? 'px-2.5 py-1 text-[10px] tracking-widest uppercase' : 'px-3 py-1 text-xs tracking-wider uppercase';

  return (
    <span className={`inline-flex items-center rounded-full font-black ${config.color} ${sizeClasses}`}>
      {config.label}
    </span>
  );
}
