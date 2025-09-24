import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';
import { TypographySmall } from '@/lib/typography';

interface AdminQuickActionProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
}

export function AdminQuickAction({ title, description, icon: Icon, href }: AdminQuickActionProps) {
  return (
    <div className="group">
      <Button
        variant="outline"
        className="w-full h-auto p-4 flex flex-col items-start space-y-2 hover:shadow-md transition-all"
        onClick={() => window.location.href = href}
      >
        <div className="flex items-center gap-2 w-full">
          <Icon className="h-5 w-5 text-primary" />
          <TypographySmall className="font-medium">{title}</TypographySmall>
        </div>
        <TypographySmall className="text-muted-foreground text-left">
          {description}
        </TypographySmall>
      </Button>
    </div>
  );
}