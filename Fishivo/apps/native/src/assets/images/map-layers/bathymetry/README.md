# 🌊 Professional Marine Bathymetry Preview Assets

## Required Preview Images (140x80px - Optimized for cards)

### Image Specifications
- **Size**: 140x80 pixels (card aspect ratio)
- **Format**: PNG with transparency support
- **Quality**: High-resolution for Retina displays
- **Compression**: Optimized for mobile app bundle size

### Preview Images

#### 1. `none-preview.png`
- **Background**: Solid navy blue (#003366)
- **Icon**: Red "X" or crossed-out eye symbol (centered)
- **Text**: "OFF" in white bold text
- **Style**: Clean, minimal design

#### 2. `gebco-preview.png` (EMODnet)
- **Background**: Blue gradient from light blue (#4A90E2) to dark navy (#002A5C)
- **Pattern**: Smooth bathymetry contour lines
- **Style**: European coastal mapping style
- **Details**: Realistic depth visualization with gentle gradients

#### 3. `noaa-contours-preview.png`
- **Background**: Deep blue marine color (#004080)
- **Pattern**: Black/white contour lines in precise patterns
- **Style**: Professional NOAA navigation chart aesthetic
- **Details**: Clear depth line patterns for precise navigation

#### 4. `gebco-color-preview.png`
- **Background**: Colorful depth visualization
- **Gradient**: Cyan (#00FFFF) → Blue (#0066CC) → Navy (#000033)
- **Style**: GEBCO 2024 scientific visualization
- **Details**: Rainbow depth mapping for research use

#### 5. `gebco-grayscale-preview.png`
- **Background**: Grayscale depth shading
- **Gradient**: White (shallow) to black (deep)
- **Style**: High contrast monochrome for clarity
- **Details**: Professional scientific visualization

#### 6. `gebco-shade-preview.png`
- **Background**: Subtle blue tonal variations
- **Pattern**: Soft depth shading with shadow effects
- **Style**: EMODnet 3D-like terrain representation
- **Details**: Realistic underwater terrain visualization

#### 7. `marine-profile-preview.png`
- **Background**: Professional marine chart colors
- **Pattern**: Detailed contour profiles with depth markers
- **Style**: ArcGIS GEBCO professional marine navigation
- **Details**: Commercial-grade marine chart appearance

## Color Palette Reference
```
Shallow Water: #00FFFF (cyan)
Medium Depth:  #0066CC (blue)
Deep Ocean:    #000033 (navy)
Land Areas:    #F0F0F0 (light gray)
Contours:      #FFFFFF (white)
Grid Lines:    #CCCCCC (light gray)
```

## Design Guidelines
- Maintain professional marine navigation standards
- Use realistic bathymetry color schemes
- Ensure high contrast for mobile visibility
- Follow international marine charting conventions
- Optimize for React Native Image component

## Usage in Component
```typescript
previewImage: require('@/assets/images/bathymetry-previews/gebco-preview.png')
```

---
**Note**: These previews represent actual bathymetry layer styles used in professional marine navigation systems like Navionics, C-MAP, and other world-class marine applications.