import { Badge } from '@/components/ui/badge';
import { TypographySmall } from '@/lib/typography';

interface AdminStatusItemProps {
  label: string;
  value: string | React.ReactNode;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

export function AdminStatusItem({ label, value, variant = 'secondary' }: AdminStatusItemProps) {
  return (
    <div className="flex items-center justify-between">
      <TypographySmall className="font-medium text-foreground">{label}</TypographySmall>
      {typeof value === 'string' ? (
        <Badge variant={variant}>{value}</Badge>
      ) : (
        <TypographySmall className="text-muted-foreground">{value}</TypographySmall>
      )}
    </div>
  );
}