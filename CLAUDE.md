# Vector X Website Documentation

## Project Overview
Vector X is a professional single-page website for a UK-based SaaS product development company. The website showcases the company's products, services, and expertise in building enterprise-grade SaaS solutions.

## Technology Stack
- **Framework**: Next.js 15.5.4 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 with shadcn/ui components
- **Icons**: Lucide React
- **Theme**: next-themes for dark/light mode support
- **Package Manager**: npm

## Project Structure
```
vector-x/
├── app/
│   ├── globals.css       # Global styles and animations
│   ├── layout.tsx        # Root layout with theme provider
│   └── page.tsx          # Main landing page
├── components/
│   ├── theme-provider.tsx # Theme context provider
│   ├── theme-toggle.tsx   # Theme toggle button
│   └── ui/               # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       └── switch.tsx
├── public/
│   └── logo.svg          # Vector X logo
└── lib/
    └── utils.ts          # Utility functions
```

## Key Features
1. **Dark/Light Mode Toggle**: Automatic system theme detection with manual override
2. **Smooth Scrolling**: Animated navigation between sections
3. **Responsive Design**: Mobile-first approach with breakpoints
4. **Animations**: Subtle fade-in and bounce animations
5. **SEO Optimized**: Meta tags, Open Graph, and structured data

## Components

### Navigation
- Fixed header with transparent to solid background transition on scroll
- Smooth scroll navigation to different sections
- Theme toggle button
- Responsive mobile/desktop layouts

### Sections
1. **Hero Section**: Eye-catching intro with logo, tagline, and CTAs
2. **About Section**: Company mission, vision, and overview
3. **Products Section**: Showcase of SaaS products including VectorWitch
4. **Why Choose Us**: Key differentiators and features
5. **Footer**: Contact information, links, and company details

## Styling Guidelines
- **Colors**: Monochrome palette with system-aware theming
- **Typography**: Inter font for clean, modern look
- **Spacing**: Consistent use of Tailwind spacing utilities
- **Animations**: Subtle, professional transitions

## Development

### Installation
```bash
npm install
```

### Development Server (Port 3008)
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Production Start
```bash
npm start
```

## Configuration

### Environment Variables
No environment variables required for basic setup.

### Port Configuration
The application is configured to run on port 3008 (defined in package.json).

## Customization

### Adding New Sections
1. Add section to `app/page.tsx`
2. Add navigation link in the header
3. Use consistent spacing and animation classes

### Modifying Theme
1. Edit CSS variables in `app/globals.css`
2. Update light/dark mode values in `:root` and `.dark` selectors

### Adding Products
1. Duplicate existing Card component in Products section
2. Update content, icon, and links
3. Maintain consistent styling

## Best Practices
1. Always use shadcn/ui components when available
2. Maintain TypeScript type safety
3. Use semantic HTML elements
4. Ensure accessibility with ARIA labels
5. Test on multiple devices and browsers
6. Keep animations subtle and professional

## Deployment
Ready for deployment to Vercel, Netlify, or any Node.js hosting platform.

## Maintenance
- Regular dependency updates
- Monitor Core Web Vitals
- Update product information as needed
- Review and update SEO metadata

## Contact
For questions or modifications, contact the Vector X development team.