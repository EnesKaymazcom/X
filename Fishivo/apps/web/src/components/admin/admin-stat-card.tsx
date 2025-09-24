import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { TypographySmall, TypographyLarge } from '@/lib/typography';

interface AdminStatCardProps {
  title: string;
  value: number | string;
  description: string;
  icon: LucideIcon;
  loading?: boolean;
}

export function AdminStatCard({ title, value, description, icon: Icon, loading }: AdminStatCardProps) {
  // Hydration sorununu önlemek için client-side formatting
  const [isMounted, setIsMounted] = React.useState(false);
  
  React.useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const displayValue = React.useMemo(() => {
    if (loading) return '...';
    if (!isMounted) return value.toString();
    if (typeof value === 'number') {
      return value.toLocaleString('tr-TR');
    }
    return value;
  }, [value, loading, isMounted]);
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>
          <TypographySmall className="text-muted-foreground font-medium">{title}</TypographySmall>
        </CardTitle>
        <div className="p-2 rounded-md bg-muted">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <TypographyLarge className="font-bold text-foreground">
          {displayValue}
        </TypographyLarge>
        <TypographySmall className="text-muted-foreground mt-1">
          {description}
        </TypographySmall>
      </CardContent>
    </Card>
  );
}