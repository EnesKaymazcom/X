'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3,
  Users, 
  FileText, 
  AlertTriangle, 
  Fish,
  MapPin,
  Backpack,
  Settings,
  FileBarChart,
  Bell,
  Layers,
  Archive,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Mail,
  Target
} from 'lucide-react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { TypographyLarge, TypographySmall } from '@/lib/typography';

interface SidebarItem {
  title: string;
  href: string;
  icon: any;
  badge?: string;
  badgeColor?: string;
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

interface AdminSidebarProps {
  children: React.ReactNode;
}

export function AdminSidebar({ children }: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { t, locale } = useI18n();
  
  // Icon colors
  const getIconColor = (title: string): string => {
    const colorMap: Record<string, string> = {
      'Dashboard': 'text-blue-500',
      'Users': 'text-green-500',
      'Waitlist': 'text-purple-500',
      'Posts': 'text-orange-500',
      'Reports': 'text-red-500',
      'Fish Species': 'text-cyan-500',
      'Fishing Techniques': 'text-indigo-500',
      'Fishing Spots': 'text-teal-500',
      'Equipment': 'text-amber-500',
      'Notifications': 'text-pink-500',
      'Logs': 'text-indigo-500',
      'Settings': 'text-gray-500',
      'Analytics': 'text-violet-500',
      'Bulk Operations': 'text-emerald-500',
    };
    
    // Check for Turkish translations
    const trColorMap: Record<string, string> = {
      'Yönetim Paneli': 'text-blue-500',
      'Kullanıcılar': 'text-green-500',
      'Waitlist': 'text-purple-500',
      'Gönderiler': 'text-orange-500',
      'Raporlar': 'text-red-500',
      'Balık Türleri': 'text-cyan-500',
      'Balıkçılık Teknikleri': 'text-indigo-500',
      'Balıkçılık Noktaları': 'text-teal-500',
      'Ekipmanlar': 'text-amber-500',
      'Bildirimler': 'text-pink-500',
      'Loglar': 'text-indigo-500',
      'Ayarlar': 'text-gray-500',
      'Analitik': 'text-violet-500',
      'Toplu İşlemler': 'text-emerald-500',
    };
    
    return colorMap[title] || trColorMap[title] || 'text-muted-foreground';
  };

  const sidebarSections: SidebarSection[] = [
    {
      title: t('admin.dashboard.mainMenu'),
      items: [
        {
          title: t('admin.dashboard.dashboard'),
          href: `/${locale}/admin`,
          icon: BarChart3,
        },
      ],
    },
    {
      title: t('admin.dashboard.contentManagement'),
      items: [
        {
          title: t('admin.dashboard.users'),
          href: `/${locale}/admin/users`,
          icon: Users,
        },
        {
          title: 'Waitlist',
          href: `/${locale}/admin/waitlist`,
          icon: Mail,
        },
        {
          title: t('admin.dashboard.posts'),
          href: `/${locale}/admin/posts`,
          icon: FileText,
        },
        {
          title: t('admin.dashboard.reports'),
          href: `/${locale}/admin/reports`,
          icon: AlertTriangle,
          badge: '12',
          badgeColor: 'destructive',
        },
      ],
    },
    {
      title: t('admin.dashboard.dataManagement'),
      items: [
        {
          title: t('admin.dashboard.fishSpecies'),
          href: `/${locale}/admin/species`,
          icon: Fish,
        },
        {
          title: t('admin.dashboard.fishingTechniques'),
          href: `/${locale}/admin/fishing-techniques`,
          icon: Target,
        },
        {
          title: t('admin.dashboard.spots'),
          href: `/${locale}/admin/spots`,
          icon: MapPin,
        },
        {
          title: t('admin.dashboard.equipments'),
          href: `/${locale}/admin/equipment`,
          icon: Backpack,
        },
      ],
    },
    {
      title: t('admin.dashboard.system'),
      items: [
        {
          title: t('admin.dashboard.notifications'),
          href: `/${locale}/admin/notifications`,
          icon: Bell,
          badge: '3',
          badgeColor: 'destructive',
        },
        {
          title: t('admin.dashboard.logs'),
          href: `/${locale}/admin/logs`,
          icon: FileBarChart,
        },
        {
          title: t('admin.dashboard.settings'),
          href: `/${locale}/admin/settings`,
          icon: Settings,
        },
        {
          title: t('admin.dashboard.analytics'),
          href: `/${locale}/admin/analytics`,
          icon: Layers,
        },
        {
          title: t('admin.dashboard.bulkOperations'),
          href: `/${locale}/admin/bulk`,
          icon: Archive,
        },
      ],
    },
  ];

  const isActive = (href: string) => {
    if (href === `/${locale}/admin`) {
      return pathname === `/${locale}/admin`;
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <div className={`
        fixed left-0 z-40
        top-[var(--navbar-height)]
        bottom-0
        ${collapsed ? 'w-16' : 'w-64'} 
        bg-sidebar-background border-r border-sidebar-border
        transition-all duration-300 ease-in-out
        flex flex-col
      `}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <TypographyLarge className="font-bold text-sidebar-foreground">{t('admin.dashboard.management')}</TypographyLarge>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {sidebarSections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              {!collapsed && (
                <TypographySmall className="font-medium text-muted-foreground uppercase tracking-wider text-xs mb-2">
                  {section.title}
                </TypographySmall>
              )}
              
              <nav className="space-y-1">
                {section.items.map((item, itemIndex) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  
                  return (
                    <Link
                      key={itemIndex}
                      href={item.href}
                      className={`
                        flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
                        transition-colors duration-200
                        ${active 
                          ? 'bg-sidebar-accent text-sidebar-primary border border-sidebar-border' 
                          : 'text-sidebar-foreground hover:bg-sidebar-accent'
                        }
                        ${collapsed ? 'justify-center' : ''}
                      `}
                      title={collapsed ? item.title : undefined}
                    >
                      <Icon className={`h-4 w-4 flex-shrink-0 ${active ? 'text-primary' : getIconColor(item.title)}`} />
                      
                      {!collapsed && (
                        <>
                          <span className="flex-1">{item.title}</span>
                          {item.badge && (
                            <Badge 
                              variant={item.badgeColor as any || 'secondary'}
                              className="text-xs px-1.5 py-0.5"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border">
          <Button
            variant="ghost"
            size="sm"
            className={`
              w-full justify-start gap-3 text-sidebar-foreground
              ${collapsed ? 'justify-center' : ''}
            `}
            onClick={() => {
              router.push(`/${locale}`);
            }}
            title={collapsed ? t('admin.dashboard.logout') : undefined}
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            {!collapsed && <span>{t('admin.dashboard.logout')}</span>}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`
        flex-1 
        ${collapsed ? 'ml-16' : 'ml-64'} 
        transition-all duration-300 ease-in-out
        min-h-screen
      `}>
        {children}
      </div>
    </div>
  );
}