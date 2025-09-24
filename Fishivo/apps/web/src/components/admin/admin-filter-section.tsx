'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingButton } from '@/components/ui/loading-button';
import { Search, Filter } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterField {
  id: string;
  label: string;
  type: 'search' | 'select';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  options?: FilterOption[];
}

interface AdminFilterSectionProps {
  title?: string;
  fields: FilterField[];
  onFilter?: () => void;
  loading?: boolean;
  showFilterButton?: boolean;
}

export function AdminFilterSection({ 
  title, 
  fields, 
  onFilter, 
  loading = false,
  showFilterButton = false
}: AdminFilterSectionProps) {
  const { t } = useI18n();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          {title || t('common.filters')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-3">
          {fields.map((field) => (
            <div key={field.id} className="space-y-2">
              <Label htmlFor={field.id}>{field.label}</Label>
              {field.type === 'search' ? (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id={field.id}
                    placeholder={field.placeholder}
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    className="pl-10 h-10"
                  />
                </div>
              ) : (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger id={field.id} className="h-10">
                    <SelectValue placeholder={field.placeholder || t('common.select')} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          ))}
          
          {showFilterButton && onFilter && (
            <div className="flex items-end">
              <LoadingButton 
                onClick={onFilter} 
                loading={loading}
                className="w-full h-10"
              >
                {t('admin.filter')}
              </LoadingButton>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}