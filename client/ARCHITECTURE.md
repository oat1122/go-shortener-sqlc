# Client Architecture

This project is a modern web application built with **Next.js 15** (App Router), designed for performance, scalability, and developer experience. It interacts with a Go (Chi) backend.

## Tech Stack

### Core

- **Framework**: [Next.js 15.5](https://nextjs.org/) (React 18+, App Router)
- **Language**: TypeScript 5.6
- **Build Tool**: Turbopack (dev), Next.js (build)

### UI & Styling

- **UI Component Library**: [HeroUI v2](https://heroui.com/) (formerly NextUI)
- **Styling Engine**: [Tailwind CSS v4](https://tailwindcss.com/)
  - Configured via `@theme` in CSS variables.
  - Uses `@tailwindcss/typography` for blog content.
- **Animation**: [Framer Motion 11](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Theme**: [Next Themes](https://github.com/pacocoursey/next-themes) (Dark/Light mode)
- **Rich Text**: [Tiptap](https://tiptap.dev/) (Headless wrapper)

### State Management

- **Server State**: [TanStack Query v5](https://tanstack.com/query/latest)
  - Handles API caching, revalidation, and optimistic updates.
  - Hydration boundary established in `app/providers.tsx` via `components/providers/QueryProvider`.
- **Client State**: [Zustand v5](https://github.com/pmndrs/zustand)
  - Used for global UI state (e.g., Sidebar toggle).

### Networking

- **HTTP Client**: [Axios](https://axios-http.com/)
  - Custom instance with interceptors for error handling and data normalization.

## Directory Structure

```
client/
├── app/                  # Next.js App Router (File-system routing)
│   ├── (public)/         # Public Routes Group
│   │   ├── blog/         # Blog listing and details
│   │   ├── login/        # Authentication page
│   │   ├── qrgenerate/   # QR Code generator tool
│   │   └── shotlinks/    # Short link management
│   ├── admin/            # Protected Admin Routes
│   │   ├── categories/   # Category management
│   │   ├── posts/        # Blog post CRUD
│   │   └── tags/         # Tag management
│   ├── _error.tsx        # Global error boundary
│   ├── layout.tsx        # Root layout (HTML/Body, Fonts)
│   ├── providers.tsx     # Global Context Providers Wrapper
│   └── ...SEO files (robots.ts, sitemap.ts)
├── components/           # UI Components
│   ├── editor/           # Tiptap specific components
│   ├── providers/        # Sub-providers (QueryClientProvider)
│   ├── icons.tsx         # SVG Icon registry
│   ├── navbar.tsx        # Top navigation
│   ├── sidebar.tsx       # Admin sidebar
│   ├── primitives.ts     # Shared Tailwind variant primitives (tv)
│   └── ...shared components
├── config/               # Static Configuration
│   └── site.ts           # Menus, site metadata
├── hooks/                # Custom React Hooks
├── lib/                  # Core Utilities & Libraries
│   ├── axios.ts          # Axios instance + Interceptors + Go Null Type Handling
│   └── utils.ts          # Class merging (clsx + tailwind-merge)
├── services/             # API Service Layer
│   ├── itemsService.ts   # (Example) Domain specific API calls
│   ├── postService.ts    # Blog/Post API
│   └── shortenerService.ts # URL Shortener API
├── store/                # Global Client Stores (Zustand)
│   └── useAppStore.ts    # UI State (Sidebar, etc.)
├── styles/               # CSS
│   └── globals.css       # Tailwind v4 import & Theme config
└── types/                # TypeScript Interfaces/Types
```

## Architecture Layers

The application uses a **Layered Architecture** to separate concerns:

### 1. UI Layer (`app/`, `components/`)

- **Responsibility**: Visual presentation and user interaction.
- **Pattern**: Server Components by default. Client Components (`"use client"`) only when interactivity (hooks, event listeners) is needed.
- **Composition**: Layouts wrap pages; Providers wrap the application root.

### 2. State & Data Layer (`hooks/`, `store/`)

- **Server State (React Query)**: Fetches and caches data. Stored in `QueryClient`.
- **Client State (Zustand)**: Ephemeral UI state.
  - _Example_: `useAppStore` tracks if the sidebar is open/closed.

### 3. Service Layer (`services/`)

- **Responsibility**: Pure TypeScript objects defining API methods.
- **Rule**: Components **never** import `axios` directly. They import a service.
  - ✅ `shortenerService.generateQR(...)`
  - ❌ `axios.post('/qr', ...)`

### 4. Infrastructure/Lib Layer (`lib/`)

- **Axios Configuration (`lib/axios.ts`)**:
  - **Base URL**: From `NEXT_PUBLIC_API_URL`.
  - **Credentials**: `withCredentials: true` for cookie-based auth.
  - **Data Normalization**: Automatically converts Go `sql.Null*` types (e.g., `{String: "foo", Valid: true}`) into native JS types (`"foo"`).
  - **Error Handling**: Global interceptor redirects to `/login` on `401 Unauthorized`.

## Key Architectural Decisions

### Handling Go `null` Types

The backend uses Go's `database/sql` Null types, which serialize to JSON as struct objects (e.g., `{"description": {"String": "text", "Valid": true}}`).
The frontend **Infrastructure Layer** (`lib/axios.ts`) intercepts responses and recursively normalizes these objects into simple values (`null`, `string`, `number`) before they reach the Service or UI layers.

### Authentication

- **Mechanism**: HttpOnly Cookies (handled by backend).
- **Client-Side**: The client doesn't manage tokens explicitly. It assumes the browser handles the cookie.
- **Protection**:
  - `middleware.ts` (if present) or Layout checks.
  - Axios interceptor catches `401` responses and forces a hard redirect to login.

### Styling (Tailwind v4)

- Configuration is handled effectively via CSS variables in `globals.css` using the `@theme` directive, removing the need for a complex `tailwind.config.js`.
- **HeroUI** integration requires specific plugin setup in `globals.css` (`@plugin '../hero.ts'`).

## Data Flow Example: QR Code Generation

1.  **User Interaction**: User uploads a logo and clicks "Generate" on `/qrgenerate` (Client Component).
2.  **Event Handler**: Calls `handleGenerate()`.
3.  **Service Call**: Invokes `shortenerService.generateQR(code, logo, options)`.
4.  **HTTP Request**:
    - `lib/axios` constructs a `multipart/form-data` request.
    - Request sent to `POST /api/shorten/{code}/qr`.
5.  **Response Handling**:
    - Backend returns a Blob (image).
    - Axios returns raw data (response type: `blob`).
6.  **UI Update**: Component creates a local URL (`URL.createObjectURL(blob)`) and displays the `<img src="..." />`.
