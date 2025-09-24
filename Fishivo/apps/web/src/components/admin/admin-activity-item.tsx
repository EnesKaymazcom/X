import { Badge } from '@/components/ui/badge';
import { TypographySmall } from '@/lib/typography';

interface AdminActivityItemProps {
  title: string;
  time: string;
  badge: {
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  dotColor?: 'primary' | 'destructive';
}

export function AdminActivityItem({ title, time, badge, dotColor = 'primary' }: AdminActivityItemProps) {
  const dotColorClass = dotColor === 'destructive' ? 'bg-destructive' : 'bg-primary';
  
  return (
    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
      <div className={`w-2 h-2 ${dotColorClass} rounded-full`}></div>
      <div className="flex-1">
        <TypographySmall className="font-medium text-foreground">{title}</TypographySmall>
        <TypographySmall className="text-muted-foreground">{time}</TypographySmall>
      </div>
      <Badge variant={badge.variant || 'secondary'}>{badge.text}</Badge>
    </div>
  );
}