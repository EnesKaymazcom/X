import { ReactNode } from 'react';
import { TypographyH1, TypographyP } from '@/lib/typography';

interface AdminPageLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function AdminPageLayout({ children, title, description, actions }: AdminPageLayoutProps) {
  return (
    <div className="p-4 lg:p-8 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <TypographyH1>{title}</TypographyH1>
            {description && (
              <TypographyP className="text-muted-foreground mt-1">{description}</TypographyP>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-3">
              {actions}
            </div>
          )}
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  );
}