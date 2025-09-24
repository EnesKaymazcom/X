'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { AdminFilterSection } from '@/components/admin/admin-filter-section';
import { 
  Mail,
  Calendar,
  Download,
  Loader2,
  AlertTriangle,
  Copy,
  CheckCircle2
} from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

interface WaitlistEntry {
  id: string;
  email: string;
  created_at: string;
}

interface WaitlistStats {
  total: number;
  thisWeek: number;
  thisMonth: number;
}

const formatDate = (dateString: string, locale: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInMinutes < 60) {
    return locale === 'tr' ? `${diffInMinutes} dakika önce` : `${diffInMinutes} minutes ago`;
  } else if (diffInHours < 24) {
    return locale === 'tr' ? `${diffInHours} saat önce` : `${diffInHours} hours ago`;
  } else if (diffInDays < 30) {
    return locale === 'tr' ? `${diffInDays} gün önce` : `${diffInDays} days ago`;
  } else {
    return date.toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US');
  }
};

export default function WaitlistManagementPage() {
  const { t, locale } = useI18n();
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [stats, setStats] = useState<WaitlistStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  const fetchWaitlistData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/waitlist');
      if (!response.ok) throw new Error('Failed to fetch waitlist data');
      const data = await response.json();
      setEntries(data.entries || []);
      setStats(data.stats || null);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWaitlistData();
  }, []);

  const filteredEntries = entries.filter(entry =>
    entry.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const copyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    toast.success('Email kopyalandı');
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const exportEmails = () => {
    const emails = filteredEntries.map(entry => entry.email).join('\n');
    const blob = new Blob([emails], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fishivo-waitlist-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`${filteredEntries.length} email başarıyla export edildi`);
  };

  return (
    <>
      <Toaster position="bottom-right" richColors />
      <div className="p-4 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
        
          <AdminPageHeader 
            title={
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Waitlist Yönetimi
              </div>
            }
            description={loading ? 'Yükleniyor...' : `${stats?.total || 0} kayıtlı email`}
          />

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}

          <AdminFilterSection
            fields={[
              {
                id: 'search',
                label: 'Email Ara',
                type: 'search',
                placeholder: 'Email adresine göre ara...',
                value: searchTerm,
                onChange: setSearchTerm
              }
            ]}
            onFilter={fetchWaitlistData}
            loading={loading}
            extraActions={
              <Button
                onClick={exportEmails}
                disabled={filteredEntries.length === 0}
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Export ({filteredEntries.length})
              </Button>
            }
          />

          <Card>
            <CardHeader>
              <CardTitle>Waitlist Kayıtları</CardTitle>
              <CardDescription>
                Bekleme listesine kayıt olan kullanıcılar
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <div className="text-muted-foreground">Yükleniyor...</div>
                </div>
              ) : filteredEntries.length === 0 ? (
                <div className="text-center py-8">
                  <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <div className="text-muted-foreground">
                    {searchTerm ? 'Arama kriterlerine uygun kayıt bulunamadı' : 'Henüz kayıt yok'}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{entry.email}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => copyEmail(entry.email)}
                            >
                              {copiedEmail === entry.email ? (
                                <CheckCircle2 className="h-3 w-3 text-green-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(entry.created_at, locale)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </>
  );
}