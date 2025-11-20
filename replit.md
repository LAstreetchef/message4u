# Booty Call - Pay-to-Open Messages

## Overview

Booty Call is a playful web application that enables users to send paywalled messages. Senders create messages with custom pricing, and recipients must pay the specified amount to unlock and view the message content. The application features a cute, cartoon-inspired design with warm colors, rounded elements, and an inclusive multicultural aesthetic.

The platform supports authenticated senders who can create and manage multiple paywalled messages, while recipients can access messages without requiring an account. Messages are displayed as images after payment to enhance privacy and visual appeal.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript, built using Vite for fast development and optimized production builds.

**UI Component Library**: Shadcn UI (Radix UI primitives) with Tailwind CSS for styling. The component library uses the "new-york" style variant with a customized color palette featuring warm corals, peaches, soft purples, and teal accents.

**Routing**: wouter for lightweight client-side routing with protected routes based on authentication status.

**State Management**: TanStack Query (React Query) for server state management, providing caching, synchronization, and background updates. No global state library is used; authentication state is managed through React Query.

**Form Handling**: React Hook Form with Zod schema validation for type-safe form inputs.

**Design System**: Custom design tokens defined in Tailwind config and CSS variables, implementing a playful aesthetic with:
- Custom fonts: Poppins for headings, DM Sans for body text
- Rounded corners and pill-shaped buttons
- Gradient accents for CTAs
- Mobile-first responsive design

### Backend Architecture

**Runtime**: Node.js with Express.js handling HTTP requests and middleware.

**API Design**: RESTful API endpoints with session-based authentication:
- `/api/auth/*` - Authentication endpoints (Replit Auth integration)
- `/api/messages` - CRUD operations for messages
- `/api/create-payment-intent` - Stripe checkout session creation
- `/api/messages/:slug/check-payment` - Payment verification

**Authentication**: Replit Auth (OpenID Connect) with Passport.js strategy. Sessions are stored in PostgreSQL using connect-pg-simple middleware. HTTP-only secure cookies are used for session management with a 7-day TTL.

**Image Generation**: Server-side canvas rendering converts message text into images using the `canvas` library. Images are generated asynchronously after message creation and stored in the public directory.

**Payment Processing**: Stripe Checkout integration for secure payment handling. The flow uses server-side session creation and client-side redirection, with webhook-style verification on the unlocked page.

### Data Storage

**Database**: PostgreSQL via Neon serverless driver for WebSocket-based connections.

**ORM**: Drizzle ORM for type-safe database queries and schema management. Schema definitions are shared between client and server via the `@shared/schema` module.

**Schema Design**:
- `users` - Stores user profiles from Replit Auth (id, email, firstName, lastName, profileImageUrl)
- `messages` - Paywalled message data (id, slug, userId, title, recipientIdentifier, messageBody, price, imageUrl, unlocked, active)
- `payments` - Payment transaction records (messageId, amount, stripeSessionId, status)
- `sessions` - Express session storage for authentication

**Migrations**: Managed through Drizzle Kit with migrations stored in the `/migrations` directory.

### External Dependencies

**Authentication Service**: Replit Auth (OpenID Connect provider) - Handles user identity, authentication flows, and session establishment. Environment variable: `ISSUER_URL`, `REPL_ID`, `SESSION_SECRET`.

**Payment Gateway**: Stripe - Processes payments and manages checkout sessions. Uses test mode for development. Environment variables: `STRIPE_SECRET_KEY` (server), `VITE_STRIPE_PUBLIC_KEY` (client).

**Database Provider**: Neon (PostgreSQL) - Serverless PostgreSQL database with WebSocket connections for low-latency queries. Environment variable: `DATABASE_URL`.

**UI Component Library**: Radix UI - Provides accessible, unstyled primitives for building the component system. Integrated with Shadcn UI's opinionated design patterns.

**Styling Framework**: Tailwind CSS - Utility-first CSS framework with custom configuration for the playful design system.

**Font Provider**: Google Fonts - Serves Poppins and DM Sans typefaces for consistent typography.

**Development Tools**: 
- Replit-specific plugins for vite (cartographer, dev-banner, runtime-error-modal)
- TypeScript for type safety across the stack
- ESBuild for server-side bundling in production