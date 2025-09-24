import React from 'react';
import Svg, { Path, Circle, Line, Rect, Ellipse } from 'react-native-svg';

interface FishingIconProps {
  size?: number;
  color?: string;
}

// Yapay Yem (Wobbler/Lure) İkonu
export const FishingLure: React.FC<FishingIconProps> = ({ size = 20, color = '#000' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Lure body */}
    <Path
      d="M6 10c0-2 1.5-3.5 3.5-3.5h5c2 0 3.5 1.5 3.5 3.5v4c0 2-1.5 3.5-3.5 3.5h-5C7.5 17.5 6 16 6 14v-4z"
      fill={color}
      opacity="0.2"
    />
    <Path
      d="M6 10c0-2 1.5-3.5 3.5-3.5h5c2 0 3.5 1.5 3.5 3.5v4c0 2-1.5 3.5-3.5 3.5h-5C7.5 17.5 6 16 6 14v-4z"
      stroke={color}
      strokeWidth="1.5"
    />
    {/* Treble hooks */}
    <Path d="M12 17.5v2.5M10.5 19l1.5-1.5 1.5 1.5" stroke={color} strokeWidth="1" strokeLinecap="round" />
    <Path d="M6 12v2M4.5 13l1.5-1 1.5 1" stroke={color} strokeWidth="1" strokeLinecap="round" />
    {/* Eye */}
    <Circle cx="15" cy="10" r="1.5" stroke={color} strokeWidth="1" fill="none" />
    <Circle cx="15" cy="10" r="0.5" fill={color} />
    {/* Lip */}
    <Path d="M18 12c1 0 2-0.5 2-1.5s-1-1.5-2-1.5" stroke={color} strokeWidth="1.5" fill="none" />
  </Svg>
);

// Balık Kancası (Circle Hook) İkonu
export const FishingHook: React.FC<FishingIconProps> = ({ size = 20, color = '#000' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Hook shank */}
    <Path
      d="M12 2v8"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    {/* Hook eye */}
    <Circle cx="12" cy="3" r="1.2" stroke={color} strokeWidth="1.5" fill="none" />
    {/* Hook bend and point */}
    <Path
      d="M12 10c0 3.5-2.8 6.5-6.5 6.5-1.8 0-3.5-1-3.5-3 0-1.2 1-2.2 2.2-2.2 1 0 1.5 0.6 1.5 1.5"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
    {/* Barb */}
    <Path d="M5.5 15.5l-1.2 1.8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    {/* Gap guide line */}
    <Path d="M8 14c1-0.8 2.5-1.5 3.5-2" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.4" />
  </Svg>
);

// Misina İpi (Spool) İkonu
export const FishingLine: React.FC<FishingIconProps> = ({ size = 20, color = '#000' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Spool body */}
    <Ellipse cx="12" cy="12" rx="6" ry="4" stroke={color} strokeWidth="1.5" fill="none" />
    <Ellipse cx="12" cy="12" rx="6" ry="4" fill={color} opacity="0.1" />
    {/* Spool ends */}
    <Ellipse cx="12" cy="8" rx="6.5" ry="1.5" stroke={color} strokeWidth="1.5" fill="none" />
    <Ellipse cx="12" cy="16" rx="6.5" ry="1.5" stroke={color} strokeWidth="1.5" fill="none" />
    {/* Fishing line wound on spool */}
    <Path d="M6 11h12M6 13h12" stroke={color} strokeWidth="0.8" opacity="0.6" />
    <Path d="M7 10h10M7 14h10" stroke={color} strokeWidth="0.8" opacity="0.4" />
    {/* Line coming off spool */}
    <Path d="M18 12c2 0 3-1 3-2" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
    {/* Center hole */}
    <Circle cx="12" cy="12" r="1.5" stroke={color} strokeWidth="1" fill="none" />
  </Svg>
);

// Makine (Spinning Reel) İkonu
export const FishingReel: React.FC<FishingIconProps> = ({ size = 20, color = '#000' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Reel body */}
    <Circle cx="12" cy="12" r="6" stroke={color} strokeWidth="1.8" fill={color} opacity="0.1" />
    {/* Spool */}
    <Circle cx="12" cy="12" r="3.5" stroke={color} strokeWidth="1.5" fill="none" />
    <Circle cx="12" cy="12" r="2" stroke={color} strokeWidth="1" fill="none" />
    {/* Center */}
    <Circle cx="12" cy="12" r="0.8" fill={color} />
    {/* Handle */}
    <Path d="M18 12h2.5" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Circle cx="20.5" cy="12" r="1" fill={color} />
    {/* Bail */}
    <Path d="M8 8c-2 1-3 3-3 4s1 3 3 4" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
    {/* Rod attachment */}
    <Rect x="10.5" y="4" width="3" height="2" rx="0.5" stroke={color} strokeWidth="1.2" fill="none" />
    {/* Drag knob */}
    <Circle cx="12" cy="6" r="0.8" stroke={color} strokeWidth="1" fill="none" />
  </Svg>
);

// Olta Kamışı (Fishing Rod) İkonu
export const FishingRod: React.FC<FishingIconProps> = ({ size = 20, color = '#000' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Rod sections */}
    <Path d="M4 3l16 18" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <Path d="M6 4.5l12 13.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" opacity="0.6" />
    {/* Rod guides (rings) */}
    <Circle cx="7" cy="5.8" r="1" stroke={color} strokeWidth="1" fill="none" />
    <Circle cx="10" cy="9.5" r="1" stroke={color} strokeWidth="1" fill="none" />
    <Circle cx="13" cy="13.2" r="1" stroke={color} strokeWidth="1" fill="none" />
    <Circle cx="16" cy="16.9" r="1" stroke={color} strokeWidth="1" fill="none" />
    {/* Handle/grip */}
    <Path d="M4 3l2.5 2.9" stroke={color} strokeWidth="4" strokeLinecap="round" />
    {/* Reel seat */}
    <Rect x="5.5" y="5" width="2" height="1.5" rx="0.3" stroke={color} strokeWidth="1" fill="none" />
    {/* Tip */}
    <Circle cx="20" cy="21" r="0.5" fill={color} />
  </Svg>
);

// Aksesuarlar (Tackle Box) İkonu
export const FishingNet: React.FC<FishingIconProps> = ({ size = 20, color = '#000' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Tackle box base */}
    <Rect x="4" y="10" width="16" height="8" rx="1" stroke={color} strokeWidth="1.5" fill={color} opacity="0.1" />
    {/* Tackle box lid */}
    <Rect x="4" y="6" width="16" height="4" rx="1" stroke={color} strokeWidth="1.5" fill="none" />
    {/* Handle */}
    <Path d="M10 6V4.5c0-0.8 0.7-1.5 1.5-1.5h1c0.8 0 1.5 0.7 1.5 1.5V6" stroke={color} strokeWidth="1.5" fill="none" />
    {/* Compartments */}
    <Line x1="8" y1="10" x2="8" y2="18" stroke={color} strokeWidth="1" />
    <Line x1="12" y1="10" x2="12" y2="18" stroke={color} strokeWidth="1" />
    <Line x1="16" y1="10" x2="16" y2="18" stroke={color} strokeWidth="1" />
    <Line x1="4" y1="14" x2="20" y2="14" stroke={color} strokeWidth="1" />
    {/* Latch */}
    <Circle cx="18" cy="8" r="0.8" stroke={color} strokeWidth="1" fill="none" />
    {/* Small tackle items */}
    <Circle cx="6" cy="12" r="0.8" fill={color} opacity="0.6" />
    <Circle cx="10" cy="16" r="0.6" fill={color} opacity="0.6" />
    <Circle cx="14" cy="12" r="0.7" fill={color} opacity="0.6" />
  </Svg>
);

// Giyim & Güvenlik (Life Vest) İkonu
export const FishingVest: React.FC<FishingIconProps> = ({ size = 20, color = '#000' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Vest body */}
    <Path
      d="M7 8v12c0 1 0.5 1.5 1.5 1.5h7c1 0 1.5-0.5 1.5-1.5V8"
      stroke={color}
      strokeWidth="1.5"
      fill={color}
      opacity="0.1"
    />
    {/* Vest outline */}
    <Path
      d="M7 8v12c0 1 0.5 1.5 1.5 1.5h7c1 0 1.5-0.5 1.5-1.5V8"
      stroke={color}
      strokeWidth="1.5"
      fill="none"
    />
    {/* Shoulder straps */}
    <Path d="M7 8C7 6 8.5 4 10.5 4h3C15.5 4 17 6 17 8" stroke={color} strokeWidth="1.5" fill="none" />
    {/* Neck opening */}
    <Path d="M10.5 4c0.5-1 1-1.5 1.5-1.5s1 0.5 1.5 1.5" stroke={color} strokeWidth="1.5" fill="none" />
    {/* Zipper */}
    <Line x1="12" y1="8" x2="12" y2="20" stroke={color} strokeWidth="1.2" />
    {/* Pockets */}
    <Rect x="8.5" y="11" width="2.5" height="2" rx="0.3" stroke={color} strokeWidth="1" fill="none" />
    <Rect x="13" y="11" width="2.5" height="2" rx="0.3" stroke={color} strokeWidth="1" fill="none" />
    {/* Flotation panels */}
    <Path d="M8 15h2.5M13.5 15h2.5" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M8 17h2.5M13.5 17h2.5" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export default {
  FishingLure,
  FishingHook,
  FishingLine,
  FishingReel,
  FishingRod,
  FishingNet,
  FishingVest,
}; 