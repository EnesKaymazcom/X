# Vector X - Building Tomorrow's SaaS Solutions

![Vector X](public/logo.svg)

## 🚀 About Vector X

Vector X is a UK-based SaaS product development company specializing in creating innovative software solutions for modern businesses. We combine British engineering excellence with global perspectives to deliver enterprise-grade products that drive digital transformation.

### 🌐 Live Demo
Visit [http://localhost:3008](http://localhost:3008) to see the website in action.

## ✨ Features

- **Modern Design**: Clean, minimalist interface with professional aesthetics
- **Dark/Light Mode**: Automatic theme detection with manual toggle
- **Responsive Layout**: Fully optimized for all devices and screen sizes
- **Smooth Animations**: Subtle fade-in effects and smooth scrolling
- **SEO Optimized**: Complete meta tags and Open Graph support
- **Performance**: Built with Next.js 15 for optimal loading speeds
- **Accessibility**: ARIA labels and keyboard navigation support

## 🛠️ Tech Stack

- **Framework**: [Next.js 15.5.4](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Theme Management**: [next-themes](https://github.com/pacocoursey/next-themes)

## 📁 Project Structure

```
vector-x/
├── app/                  # Next.js app directory
│   ├── globals.css      # Global styles and animations
│   ├── layout.tsx       # Root layout with providers
│   └── page.tsx         # Main landing page
├── components/          # React components
│   ├── theme-provider.tsx
│   ├── theme-toggle.tsx
│   └── ui/             # shadcn/ui components
├── public/             # Static assets
│   └── logo.svg        # Vector X logo
├── lib/                # Utility functions
└── CLAUDE.md          # Development documentation
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0 or higher
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/vectorx/website.git
cd vector-x
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server (Port 3008):
```bash
npm run dev
```

4. Open [http://localhost:3008](http://localhost:3008) in your browser

### Build for Production

```bash
npm run build
npm start
```

## 📝 Available Scripts

- `npm run dev` - Start development server on port 3008
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🎨 Customization

### Modifying Content
Edit `app/page.tsx` to update website content, sections, and layout.

### Styling
- Global styles: `app/globals.css`
- Theme colors: CSS variables in `:root` and `.dark` selectors
- Component styles: Tailwind utility classes

### Adding New Sections
1. Create new section component in `app/page.tsx`
2. Add navigation link in header
3. Apply consistent spacing and animations

## 📱 Sections

1. **Hero**: Company introduction with CTAs
2. **About**: Mission, vision, and company overview
3. **Products**: Showcase of SaaS products
4. **Why Choose Us**: Key features and differentiators
5. **Contact/Footer**: Company information and links

## 🌟 Key Products

- **VectorWitch**: Advanced analytics platform ([vectorwitch.com](https://vectorwitch.com))
- **Project Alpha**: Next-gen automation suite (Coming Soon)
- **SecureVault**: Enterprise security solution (In Development)

## 📞 Contact Information

**Vector X Ltd.**
128 City Road
London EC1V 2NX
United Kingdom

Email: hello@vectorx.co.uk

## 📄 License

© 2024 Vector X Ltd. All rights reserved.

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request.

## 🔗 Links

- [Website](https://vectorx.co.uk)
- [VectorWitch](https://vectorwitch.com)
- [LinkedIn](#)
- [Twitter](#)
- [GitHub](#)

---

Built with ❤️ by Vector X in London, UK
