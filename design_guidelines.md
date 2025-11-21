# Secret Message - Design Guidelines

## Design Approach
**Instagram-Inspired Dark Mode**: Modern, sleek dark aesthetic with purple-pink gradients and high contrast, inspired by Instagram's signature dark mode experience.

## Core Aesthetic Principles
- **Visual Style**: Sleek, modern, bold, and vibrant
- **Color Philosophy**: Deep blacks with electric purple-pink gradients for impact
- **Shape Language**: Soft rounded corners, pill-shaped buttons, clean and modern
- **Contrast**: High contrast for excellent readability and visual pop
- **Always Dark**: Dark mode is the default and only mode

## Typography
- **Headings**: Poppins Bold - clean, modern, and confident
- **Body Text**: DM Sans - highly readable sans-serif
- **NO EMOJIS**: Use Lucide icons instead for a more polished, professional aesthetic

## Color Palette

### Dark Mode (Default and Only Mode)
- **Background**: Deep black (#000000) or near-black (#0A0A0A) for maximum contrast
- **Cards/Panels**: Slightly elevated dark gray (#121212 to #1A1A1A)
- **Text**: High contrast white (#FAFAFA) with gray variations for hierarchy
- **Primary Accent**: Instagram purple-pink gradient (from #8B5CF6 to #EC4899)
- **Interactive Elements**: Purple (#8B5CF6) and pink (#EC4899) with glow effects
- **Borders**: Subtle dark gray (#262626) for separation without distraction

### Gradient Usage
- **Hero CTAs**: Purple-to-pink gradient for "Pay to Unlock" and primary actions
- **Hover States**: Subtle purple glow on interactive elements
- **Accents**: Use gradient sparingly for maximum impact

## Layout & Spacing
- **Spacing Units**: Tailwind units of 2, 4, 6, 8, 12, 16 for consistent rhythm
- **Cards**: Generous padding (p-6 to p-8), subtle borders with dark theme
- **Sections**: py-12 to py-20 for vertical spacing
- **Container**: max-w-6xl for main content, max-w-md for forms

## Component Library

### Navigation/Header
- Secret Message logo with icon
- Simple, rounded button for login/logout
- Dark background with subtle border

### Authentication Pages
- Two-column layout (desktop): Form on left, hero content on right
- Mobile: Stacked vertically
- Dark card backgrounds with purple-pink accent highlights
- Headings: "Welcome to Secret Message", "Send a Secure Paywalled Message"
- Form cards with dark backgrounds and purple accent borders

### Message Creation Card
- Dark card background with subtle border
- Purple-pink accents for active inputs
- Fields: Recipient identifier, Title, Message body (textarea), Price
- Large gradient "Create Message" button

### Public Paywall Page (/m/:slug)
- Dark background with gradient accents
- Message title prominently displayed in white
- Price clearly shown with gradient styling
- Blurred/pixelated placeholder for locked message (lock icon overlay)
- Hero "Pay to Unlock" button with purple-pink gradient
- Should NOT show message content before payment

### Unlocked View
- Display message as IMAGE (PNG generated from text) OR file download
- Image styling: Clean presentation on dark background
- Scale/fade-in animation when content appears
- Celebratory elements: subtle animations or glow effects
- Never expose raw text to frontend

### Sender Dashboard
- Dark card grid layout
- Message cards with status indicators:
  - Lock icon (🔒) for locked messages
  - Unlock icon for unlocked messages
  - Status badges with gradient styling
- Title, price, creation date
- Public link with copy button
- Optional "Deactivate" button with destructive styling
- Grid layout (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)

### Buttons
- **Primary CTA**: Pill-shaped, purple-pink gradient, generous padding (px-8 py-4)
- **Secondary**: Outlined with purple border on dark background
- **Ghost**: Transparent with purple hover glow
- **Copy Link**: Small icon button with subtle purple hover
- All buttons have rounded-full or rounded-xl styling

### Footer
- Simple footer note: "Secret Message – secure pay-to-open messaging"
- Centered text, muted gray color on dark background

## Images & Illustrations

### Message Image Rendering
- Generated server-side using node-canvas
- Background: Dark gradient or solid dark color
- Text: High contrast white/light text, clean modern font
- Decorative elements: Minimal, purple-pink accents
- Size: Optimized for mobile viewing but readable on desktop

## Animations
- **Minimal approach**: Use sparingly for polish
- **Unlocked reveal**: Scale and fade-in for message reveal (duration-300)
- **Glow effects**: Subtle purple glow on hover for interactive elements
- **Button hovers**: Gentle scale or glow shifts

## Accessibility
- Maintain WCAG AA contrast ratios with high contrast dark theme
- Form inputs with clear labels and validation messages
- Focus states visible on all interactive elements (purple ring)
- Touch targets minimum 44x44px for mobile

## Icons
- Use Lucide React icons exclusively - no emojis
- Icons: Lock, Unlock, DollarSign, Copy, FileText, Image, etc.
- Consistent icon sizing and stroke width
