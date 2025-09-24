import React from 'react';
import {
  ArrowLeft,
  MoreHorizontal,
  MoreVertical,
  MapPin,
  Share2,
  Flag,
  UserX,
  X,
  Smartphone,
  Copy,
  Link,
  Download,
  Camera,
  Fish,
  Package,
  Settings,
  Search,
  Bell,
  Heart,
  MessageCircle,
  Plus,
  CheckCircle,
  Check,
  Edit2,
  ChevronRight,
  ChevronDown,
  Thermometer,
  Wind,
  Loader2,
  Activity,
  Sun,
  Moon,
  Clock,
  Calendar,
  Wrench,
  Briefcase,
  Box,
  Backpack,
  ShoppingBag,
  Home,
  Map,
  User,
  Satellite,
  Trees,
  Navigation,
  LocateFixed,
  Award,
  CreditCard,
  RotateCcw,
  Mail,
  Globe,
  Users,
  Trash2,
  UserPlus,
  AtSign,
  Cloud,
  Tag,
  Star,
  Sliders,
  Ruler,
  Play,
  Info,
  HelpCircle,
  LogOut,
  Anchor,
  Zap,
  Circle,
  Layers,
  Disc,
  Minus,
  Shield,
  Droplets,
  CloudRain,
  Crosshair,
  Compass,
  Edit,
  Bookmark,
  RotateCw,
  RefreshCw,
  Rotate3d,
  AlertTriangle,
  AlertCircle,
  Lock,
  HeartOff,
  Mountain,
  Utensils,
  Weight,
  Coffee,
  Target,
  Waves,
  BookOpen,
  List,
  Grid,
  Image,
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  Music,
  Eye,
  EyeOff,
  FileText,
  Phone,
  ShieldCheck,
  Crown,
  Send,
  ThumbsUp,
  ThumbsDown,
  Square,
  Monitor,
  Car
} from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import { FishingLure, FishingHook, FishingLine, FishingReel, FishingRod, FishingNet, FishingVest } from '@/components/ui/FishingIcons';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  filled?: boolean;
}

// Google Icon Component
const GoogleIcon: React.FC<{ size?: number }> = ({ size = 20 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <Path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <Path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <Path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </Svg>
  );
};

// X (Twitter) Icon Component
const XIcon: React.FC<{ size?: number; color?: string }> = ({ size = 20, color = '#000' }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 1200 1227" fill="none">
      <Path 
        d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z" 
        fill={color}
      />
    </Svg>
  );
};

// TikTok Icon Component
const TikTokIcon: React.FC<{ size?: number; color?: string }> = ({ size = 20, color = '#000' }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 448 512" fill="none">
      <Path 
        d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z" 
        fill={color}
      />
    </Svg>
  );
};

const iconMap = {
  'arrow-left': ArrowLeft,
  'more-horizontal': MoreHorizontal,
  'more-vertical': MoreVertical,
  'map-pin': MapPin,
  'share': Share2,
  'flag': Flag,
  'user-x': UserX,
  'x': X,
  'smartphone': Smartphone,
  'square': Square,
  'monitor': Monitor,
  'car': Car,
  'copy': Copy,
  'link': Link,
  'download': Download,
  'camera': Camera,
  'fish': Fish,
  'package': Package,
  'settings': Settings,
  'search': Search,
  'bell': Bell,
  'heart': Heart,
  'message-circle': MessageCircle,
  'plus': Plus,
  'check-circle': CheckCircle,
  'check': Check,
  'edit-2': Edit2,
  'chevron-right': ChevronRight,
  'chevron-down': ChevronDown,
  'thermometer': Thermometer,
  'wind': Wind,
  'activity': Activity,
  'loader-2': Loader2,
  'sun': Sun,
  'moon': Moon,
  'clock': Clock,
  'calendar': Calendar,
  'wrench': Wrench,
  'briefcase': Briefcase,
  'box': Box,
  'backpack': Backpack,
  'shopping-bag': ShoppingBag,
  'home': Home,
  'map': Map,
  'user': User,
  'satellite': Satellite,
  'trees': Trees,
  'navigation': Navigation,
  'my-location': LocateFixed,
  'place': MapPin,
  'close': X,
  'content-copy': Copy,
  'share-icon': Share2,
  'trophy': Award,
  // Yeni eklenenler
  'credit-card': CreditCard,
  'refresh-cw': RotateCcw,
  'mail': Mail,
  'globe': Globe,
  'users': Users,
  'trash-2': Trash2,
  'user-plus': UserPlus,
  'at-sign': AtSign,
  'cloud': Cloud,
  'tag': Tag,
  'star': Star,
  'sliders': Sliders,
  'ruler': Ruler,
  'play': Play,
  'info': Info,
  'help-circle': HelpCircle,
  'log-out': LogOut,
  'anchor': Anchor,
  'zap': Zap,
  'circle': Circle,
  'layers': Layers,
  'disc': Disc,
  'minus': Minus,
  'tool': Wrench,
  'shield': Shield,
  'droplets': Droplets,
  'cloud-rain': CloudRain,
  'compass': Compass,
  'edit': Edit,
  'fishing-lure': FishingLure,
  'fishing-hook': FishingHook,
  'fishing-line': FishingLine,
  'fishing-reel': FishingReel,
  'fishing-rod': FishingRod,
  'fishing-net': FishingNet,
  'fishing-vest': FishingVest,
  'fishing': Fish,
  'bookmark': Bookmark,
  // 3D and rotation controls
  '3d-rotation': Rotate3d,
  'rotate-right': RotateCw,
  'refresh': RefreshCw,
  'moon-stars': Moon,
  'alert-triangle': AlertTriangle,
  'alert-circle': AlertCircle,
  'lock': Lock,
  'heart-off': HeartOff,
  'mountain': Mountain,
  'utensils': Utensils,
  'weight': Weight,
  'coffee': Coffee,
  'target': Target,
  'waves': Waves,
  'book-open': BookOpen,
  'layout-list': List,
  'layout-grid': Grid,
  'image': Image,
  'instagram': Instagram,
  'facebook': Facebook,
  'youtube': Youtube,
  'twitter': Twitter,
  'music': Music,
  'x-logo': XIcon,
  'tiktok': TikTokIcon,
  'eye': Eye,
  'eye-off': EyeOff,
  'file-text': FileText,
  'phone': Phone,
  'award': Award,
  'shield-check': ShieldCheck,
  'crown': Crown,
  'google': GoogleIcon,
  'send': Send,
  'thumb-up': ThumbsUp,
  'thumb-down': ThumbsDown,
  'loader': Loader2
};

export const Icon: React.FC<IconProps> = ({ name, size = 20, color = '#000', filled = false }) => {
  const iconName = name as keyof typeof iconMap;
  const IconComponent = iconMap[iconName];
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  // Custom SVG icons (fishing icons and social media)
  if (name.startsWith('fishing-') || name === 'x-logo' || name === 'tiktok' || name === 'google') {
    return <IconComponent size={size} color={color} />;
  }

  // Regular Lucide icons - add fill prop for filled icons
  return <IconComponent size={size} color={color} fill={filled ? color : 'none'} />;
};

export default Icon; 