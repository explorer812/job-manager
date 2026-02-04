import type { CompanyType } from '../../types';
import { companyTypeMap } from '../../utils/mockData';

interface CompanyTagProps {
  type: CompanyType;
  size?: 'sm' | 'md';
}

export function CompanyTag({ type, size = 'sm' }: CompanyTagProps) {
  const config = companyTypeMap[type];
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${config.color} ${sizeClasses}`}>
      {config.label}
    </span>
  );
}
