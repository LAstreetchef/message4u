# Booty Call - Design Guidelines

## Design Approach
**Reference-Based Approach**: Cute messaging app aesthetic + comic-book/sticker culture, inspired by playful consumer apps like Duolingo, Headspace, and modern messaging platforms with cartoon illustration styles.

## Core Aesthetic Principles
- **Visual Style**: Cute cartoon, playful, colorful, and inclusive
- **Cultural Tone**: Global/multicultural vibe with diverse representation (different skin tones, hair textures, body types)
- **Illustration Style**: Hand-drawn/doodle elements (stars, hearts, squiggles, speech bubbles)
- **Shape Language**: Soft rounded corners, pill-shaped buttons, slightly chunky elements
- **Mobile-First**: Thumb-friendly interactions, optimized for touch

## Typography
- **Headings**: Chunky, fun, rounded typeface (consider: Fredoka, Baloo, Comic Neue, or Poppins Bold)
- **Body Text**: Clean sans-serif (Inter, DM Sans, or similar)
- **Emoji Integration**: Use emojis liberally in headings and buttons (💌 📱 💖 💸 👀 🔒 💕)

## Color Palette
- **Primary Colors**: Warm corals, peaches, soft purples
- **Accent Colors**: Teal accents for interactive elements
- **Backgrounds**: Cream/off-white backgrounds
- **Gradients**: Use sparingly for hero sections and important CTAs like "Pay to Unlock" button

## Layout & Spacing
- **Spacing Units**: Use Tailwind units of 2, 4, 6, 8, 12, 16 for consistent rhythm
- **Cards**: Generous padding (p-6 to p-8), doodle borders or playful border styles
- **Sections**: py-12 to py-20 for vertical spacing
- **Container**: max-w-6xl for main content, max-w-md for forms

## Component Library

### Navigation/Header
- Booty Call logo (small cartoon phone with speech bubble and heart)
- Playful tagline when appropriate
- Simple, rounded button for login/signup

### Authentication Pages
- Two-column layout (desktop): Form on left, illustrated hero on right
- Mobile: Stacked vertically
- Hero illustration: Diverse cartoon couple/friends texting
- Headings: "Welcome to Booty Call 💌", "Slide into the paywall"
- Form cards with soft shadows and rounded corners (rounded-2xl)

### Message Creation Card
- Doodle borders or playful border treatment
- Helper text with emojis ("How much should they pay to open this? 💸")
- Fields: Recipient identifier, Title, Message body (textarea), Price
- Large, gradient "Create" button with celebratory styling

### Public Paywall Page (/m/:slug)
- Large illustration of phone with lock and hearts
- Message title prominently displayed
- Price clearly shown with currency symbol
- Blurred/pixelated placeholder for locked message (lock icon 🔒 overlay)
- Hero "Pay to Unlock 👀" button with confetti/sparkles decoration
- Should NOT show message image before payment

### Unlocked View
- Display message as IMAGE (PNG generated from text)
- Image styling: Playful rounded font, soft background (peach/cream), optional doodle decorations in corners
- Scale/fade-in animation when image appears
- Celebratory elements: confetti or animated sparkles
- Never expose raw text to frontend

### Sender Dashboard
- Message cards with fun styling:
  - Small icons (💌 🔒 💸)
  - Status badges (grey "Locked", green "Unlocked")
  - Title, price, createdAt date
  - Public link with copy button
  - Optional "Deactivate" button
- Grid layout for message cards (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)

### Buttons
- **Primary CTA**: Pill-shaped, gradient backgrounds, generous padding (px-8 py-4)
- **Secondary**: Outlined with rounded borders
- **Copy Link**: Small icon button with tooltip
- All buttons have rounded-full or rounded-xl styling

### Footer
- Simple footer note: "Booty Call – pay-to-open messages with cute cartoon flavor 💕"
- Centered text, small size, soft color

## Images & Illustrations

### Required Illustrations
1. **Auth Pages Hero**: Diverse cartoon characters (different skin tones) using phones, texting, with hearts/speech bubbles around them
2. **Paywall Page**: Large cartoon phone with lock icon and decorative hearts
3. **Logo**: Small cartoon phone with speech bubble and subtle heart icon

### Message Image Rendering
- Generated server-side using node-canvas
- Background: Soft peach or cream color
- Text: Playful rounded font, adequate padding
- Decorative elements: Small hearts/stars in corners
- Size: Optimized for mobile viewing but readable on desktop

## Animations
- **Minimal approach**: Use sparingly
- **Unlocked reveal**: Scale and fade-in for message image (duration-300)
- **Confetti**: Brief celebratory animation on unlock (can use simple CSS or lightweight library)
- **Button hovers**: Subtle scale or color shifts

## Accessibility
- Maintain WCAG AA contrast ratios despite playful colors
- Form inputs with clear labels and validation messages
- Focus states visible on all interactive elements
- Touch targets minimum 44x44px for mobile

## Icons
- Use Heroicons or Font Awesome via CDN
- Supplement with emoji where appropriate
- Lock icon (🔒), heart (💕), money (💸), phone (📱), message (💌)