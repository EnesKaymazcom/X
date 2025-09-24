import { ReactNode } from 'react';
import { TypographyH3, TypographyMuted } from '@/lib/typography';

interface AdminPageHeaderProps {
  title: string | ReactNode;
  description?: string;
  actions?: ReactNode;
}

export function AdminPageHeader({ title, description, actions }: AdminPageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <TypographyH3 className="border-none pb-0">
          {typeof title === 'string' ? title : title}
        </TypographyH3>
        {description && (
          <TypographyMuted className="mt-1">{description}</TypographyMuted>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-3">
          {actions}
        </div>
      )}
    </div>
  );
}