# Secret Message - Pay-to-Open Messages

## Overview

Secret Message is a playful web application that enables users to send paywalled messages. Senders create messages with custom pricing, and recipients must pay the specified amount to unlock and view the message content. The platform acts as a payment processor, collecting payments via Stripe, deducting a platform fee ($1.69 + 6.9% of the message price), and facilitating manual payouts to senders via Venmo, CashApp, or cryptocurrency. The application features an Instagram-inspired dark mode aesthetic with deep black backgrounds, high-contrast white text, purple-pink gradient accents, and rounded pill-shaped elements.

The platform supports authenticated senders using password-based authentication (email + password sign-up and login) who can create and manage multiple paywalled messages, set up payout addresses, and track earnings after platform fees. Recipients can access messages without requiring an account. Messages can be either text-based (converted to images for privacy) or file uploads (any file type up to 10MB), both protected behind payment. Files are stored securely in Replit Object Storage with ACL-based access control. When recipients provide a valid email address, they automatically receive beautifully styled email notifications with direct links to unlock their messages.

## User Preferences

Preferred communication style: Simple, everyday language.

**Platform Administrator**: message4u@secretmessage4u.com (has admin access to /admin dashboard)

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript, built using Vite for fast development and optimized production builds.

**UI Component Library**: Shadcn UI (Radix UI primitives) with Tailwind CSS for styling. The component library uses the "new-york" style variant with an Instagram-inspired dark mode color palette featuring pure black backgrounds (#000000), high-contrast white text, and purple-pink gradient accents (270° to 330° hue range).

**Routing**: wouter for lightweight client-side routing with protected routes based on authentication status.

**State Management**: TanStack Query (React Query) for server state management, providing caching, synchronization, and background updates. No global state library is used; authentication state is managed through React Query.

**Form Handling**: React Hook Form with Zod schema validation for type-safe form inputs.

**Design System**: Custom design tokens defined in Tailwind config and CSS variables, implementing an Instagram-inspired dark mode aesthetic with:
- Custom fonts: Poppins for headings, DM Sans for body text
- Color palette: Pure black background (#000000), white text (#FFFFFF), dark gray cards (#1C1C1C)
- Instagram gradient (purple-pink): Applied via `bg-gradient-instagram` utility to primary CTAs and logo
- Rounded corners and pill-shaped buttons (rounded-full)
- High contrast for accessibility
- Mobile-first responsive design
- Dark mode enabled permanently via `class="dark"` on HTML element

### Backend Architecture

**Runtime**: Node.js with Express.js handling HTTP requests and middleware.

**API Design**: RESTful API endpoints with session-based authentication:
- `/api/auth/signup` - Create new account with email and password
- `/api/auth/login` - Authenticate with email and password
- `/api/auth/user` - Get current authenticated user information
- `/api/auth/logout` - Destroy user session
- `/api/auth/payout` - Update sender payout information (Venmo/CashApp/Crypto address)
- `/api/messages` - CRUD operations for messages
- `/api/create-payment-intent` - Stripe checkout session creation
- `/api/messages/:slug/check-payment` - Payment verification with platform fee calculation
- `/api/objects/upload` - Get presigned upload URL for file uploads
- `/api/messages/:id/file` - Save file metadata after upload
- `/objects/*` - Serve uploaded files with ACL-based access control

**Authentication**: Password-based authentication using bcrypt for secure password hashing. Users create accounts with email and password (minimum 8 characters). Passwords are hashed with bcrypt (10 salt rounds) before storage. Sessions are stored in PostgreSQL using connect-pg-simple middleware. HTTP-only cookies are used for session management with a 7-day TTL. Cookies use `secure` flag in production and `sameSite: lax` for CSRF protection. Environment variable: `SESSION_SECRET`.

**Image Generation**: Server-side canvas rendering converts message text into images using the `canvas` library. Images are generated asynchronously after message creation and stored in the public directory.

**Payment Processing**: Stripe Checkout integration for secure payment handling. The platform acts as the payment processor, collecting the full payment amount from recipients. A platform fee of $1.69 + 6.9% of the message price is calculated using integer cents arithmetic to ensure penny-accurate calculations. Sender earnings (amount minus platform fee) are tracked in the database. The flow uses server-side session creation and client-side redirection, with payment verification on the unlocked page. Payouts to senders are handled manually by the platform operator to the sender's specified Venmo @username, CashApp $tag, or cryptocurrency wallet address.

### Data Storage

**Database**: PostgreSQL via Neon serverless driver for WebSocket-based connections.

**ORM**: Drizzle ORM for type-safe database queries and schema management. Schema definitions are shared between client and server via the `@shared/schema` module.

**Schema Design**:
- `users` - Stores user authentication and profile data (id, email, passwordHash, payoutMethod, payoutAddress, createdAt, updatedAt)
- `messages` - Paywalled message data (id, slug, userId, title, recipientIdentifier, messageBody, price, imageUrl, fileUrl, fileType, unlocked, active, expiresAt)
- `payments` - Payment transaction records with platform fee tracking (id, messageId, amount, stripeSessionId, platformFee, senderEarnings, createdAt)
- `sessions` - Express session storage for authentication

**Object Storage**: Replit App Storage integration for secure file uploads. Files are stored in Google Cloud Storage with ACL-based access control. Environment variables: `DEFAULT_OBJECT_STORAGE_BUCKET_ID`, `PUBLIC_OBJECT_SEARCH_PATHS`, `PRIVATE_OBJECT_DIR`.

**Migrations**: Managed through Drizzle Kit with migrations stored in the `/migrations` directory.

### External Dependencies

**Authentication System**: Password-based authentication (self-hosted) - Traditional email + password authentication using bcrypt for secure password hashing. No external authentication provider required. Environment variable: `SESSION_SECRET`.

**Payment Gateway**: Stripe - Processes payments and manages checkout sessions. Uses test mode for development. Environment variables: `STRIPE_SECRET_KEY` (server), `VITE_STRIPE_PUBLIC_KEY` (client).

**Email Service**: Resend - Transactional email API for sending message unlock notifications to recipients. Optional for core functionality. Environment variable: `RESEND_API_KEY`. Uses verified testing domain `[email protected]` for development. Email URLs are constructed using Replit environment variables with precedence: `REPLIT_APP_URL` (production) → `REPLIT_DEV_DOMAIN` (hosted dev) → `REPLIT_DOMAINS` (fallback) → localhost (local dev only when `REPL_ID` is absent).

**Database Provider**: Neon (PostgreSQL) - Serverless PostgreSQL database with WebSocket connections for low-latency queries. Environment variable: `DATABASE_URL`.

**Object Storage Provider**: Google Cloud Storage via Replit App Storage - Serverless object storage for file uploads with ACL-based access control. Supports any file type up to 10MB. Environment variables: `DEFAULT_OBJECT_STORAGE_BUCKET_ID`, `PUBLIC_OBJECT_SEARCH_PATHS`, `PRIVATE_OBJECT_DIR`.

**UI Component Library**: Radix UI - Provides accessible, unstyled primitives for building the component system. Integrated with Shadcn UI's opinionated design patterns.

**File Upload Library**: Uppy - Modern file upload library with drag-and-drop support and AWS S3-compatible uploads. Integrated with Replit Object Storage via presigned URLs.

**Styling Framework**: Tailwind CSS - Utility-first CSS framework with custom configuration for the playful design system.

**Font Provider**: Google Fonts - Serves Poppins and DM Sans typefaces for consistent typography.

**Development Tools**: 
- Replit-specific plugins for vite (cartographer, dev-banner, runtime-error-modal)
- TypeScript for type safety across the stack
- ESBuild for server-side bundling in production