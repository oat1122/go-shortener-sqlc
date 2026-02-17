# Client Architecture

This project is a modern, high-performance web application built with **Next.js 15** (App Router). It serves as the frontend for a Go (Chi) backend, communicating via RESTful APIs protected by HttpOnly cookies.

## Tech Stack

### Core Framework

- **Framework**: [Next.js 15.5](https://nextjs.org/) (React 18.3+, App Router)
- **Language**: TypeScript 5.6
- **Build Tool**: Turbopack (dev), Next.js (build)
- **Package Manager**: npm

### UI & Styling

- **Component Library**: [HeroUI v2.2+](https://heroui.com/) (formerly NextUI)
  - Provides accessible, pre-styled components (Buttons, Inputs, Modals, etc.).
- **Styling Engine**: [Tailwind CSS v4.1](https://tailwindcss.com/)
  - **Zero-runtime**: Uses the new Rust-based compiler.
  - **Configuration**: Managed via strict CSS variables in `@theme` blocks within `globals.css` (no `tailwind.config.js`).
  - **Typography**: `@tailwindcss/typography` for rendering blog content.
- **Animation**: [Framer Motion 11](https://www.framer.com/motion/)
  - Used for complex animations and page transitions.
- **Icons**: [Lucide React](https://lucide.dev/)
- **Theme**: [Next Themes](https://github.com/pacocoursey/next-themes) for dark/light mode toggling.
- **Rich Text Editor**: [Tiptap](https://tiptap.dev/) (Headless, using Starter Kit + Image + Link extensions).

### State Management

- **Server State**: [TanStack Query v5](https://tanstack.com/query/latest)
  - **Role**: Manages all asynchronous data (API responses).
  - **Features**: Automatic caching, background refetching, optimistic updates.
  - **Configuration**: `QueryClient` is initialized in `components/providers/QueryProvider.tsx` with default stale times.
- **Client State**: [Zustand v5](https://github.com/pmndrs/zustand)
  - **Role**: Manages simple, synchronous global UI state.
  - **Persistence**: Uses `persist` middleware to save state to `localStorage`.
  - **Store**: `useAppStore` handles sidebar visibility (`isSidebarOpen`), user profile (`user`), and auth status (`isAuthenticated`).

### Networking

- **HTTP Client**: [Axios](https://axios-http.com/)
  - **Instance**: Centralized configuration in `lib/axios.ts`.
  - **Base URL**: Loaded from `NEXT_PUBLIC_API_URL`.
  - **Credentials**: `withCredentials: true` ensures HttpOnly cookies are sent with every request.
  - **Interceptors**:
    - **Response**: Normalizes Go `sql.Null*` types into native JS values.
    - **Error**: Globally handles `401 Unauthorized` by redirecting to `/login`.

## Directory Structure

```
client/
├── app/                      # Next.js App Router (File-system routing)
│   ├── (public)/             # Public Route Group (Marketing, Auth)
│   │   ├── blog/             # Blog listing & details (Server Components + Hydration)
│   │   ├── login/            # Login page (Client Component)
│   │   ├── qrgenerate/       # QR Generator tool
│   │   └── shotlinks/        # Public short link catalog
│   ├── admin/                # Protected Admin Area
│   │   ├── layout.tsx        # Admin layout (includes Sidebar + Navbar)
│   │   ├── categories/       # Category CRUD
│   │   ├── images/           # Image Gallery CRUD (upload, edit SEO, delete)
│   │   ├── posts/            # Blog Post Editor (Tiptap + ImagePicker)
│   │   └── tags/             # Tag CRUD
│   ├── _error.tsx            # Global Error Boundary
│   ├── layout.tsx            # Root Layout (HTML, Fonts, Global Providers)
│   ├── providers.tsx         # Client Component wrapping all context providers
│   └── ...                   # SEO files (robots.ts, sitemap.ts)
├── components/               # React Components
│   ├── editor/               # Tiptap toolbar and editor wrapper
│   ├── providers/            # Context Providers (QueryProvider, etc.)
│   ├── ui/                   # Reusable UI blocks (if any custom modifications)
│   ├── ImagePicker.tsx       # Reusable image select/upload modal
│   ├── navbar.tsx            # Main navigation bar
│   ├── sidebar.tsx           # Admin dashboard sidebar
│   ├── icons.tsx             # Centralized icon registry
│   └── primitives.ts         # Tailwind Variants (tv) definitions
├── config/                   # Static Configuration
│   └── site.ts               # Site metadata, menu links, admin nav items
├── hooks/                    # Custom React Hooks
│   ├── useImages.ts          # Image CRUD hooks (upload, list, update, delete)
│   ├── use-debounce.ts       # Debounce utility for inputs
│   └── ...                   # Other utility hooks
├── lib/                      # Infrastructure & Utilities
│   ├── axios.ts              # Axios instance & Null handling logic
│   └── utils.ts              # Styling utilities (clsx + tailwind-merge)
├── services/                 # API Service Layer (Pure TS)
│   ├── imageService.ts       # Image CRUD (upload via FormData, SEO metadata)
│   ├── postService.ts        # Blog post management
│   ├── shortenerService.ts   # URL shortening & QR generation
│   ├── categoryService.ts    # Admin category management
│   └── tagService.ts         # Admin tag management
├── store/                    # Global State Stores
│   └── useAppStore.ts        # Zustand store for UI & Auth state
├── styles/                   # Global CSS
│   └── globals.css           # Tailwind v4 @theme and @plugin configuration
└── types/                    # TypeScript Definitions
    └── index.ts              # Shared interfaces (e.g., SVGProps)
```

## Architecture Layers

The application follows a strict **Layered Architecture** to maintain separation of concerns:

### 1. Presentation Layer (UI)

- **Location**: `app/` and `components/`.
- **Strategy**:
  - **Server Components (RSC)** are the default for fetching initial data and layout.
  - **Client Components** (`"use client"`) are used for interactive elements (forms, toggles) and where hooks (`useQuery`, `useStore`) are needed.
- **Theme**: Powered by `next-themes` and `HeroUIProvider` in `app/providers.tsx`.

### 2. State Layer

- **Client State**: `useAppStore` (Zustand) implies a "single source of truth" for UI state like the sidebar. It persists to local storage so user preferences survive refreshes.
- **Server State**: Data fetching logic is moved out of components into **Custom Hooks** or used directly via `useQuery`.
  - _Note_: While not strictly enforced, complex queries are often wrapped in hooks (e.g., `usePosts`, `useCategories`).

### 3. Service Layer

- **Location**: `services/`.
- **Purpose**: Abstracts all HTTP communication. Components/Hooks **never** call `axios` directly; they call a service method.
- **Pattern**:
  - Export a const object (e.g., `shortenerService`).
  - Methods return typed Promises (e.g., `Promise<ShortenResponse>`).
  - Handles request payload formatting (e.g., `FormData` for file uploads).

### 4. Infrastructure Layer

- **Location**: `lib/`.
- **Axios (`lib/axios.ts`)**: The backbone of communication.
  - **Normalization**: Automatically recursively walks JSON responses. If it finds a Go-style Null object (e.g., `{ String: "foo", Valid: true }`), it unwraps it to `"foo"`. If `Valid` is false, it returns an appropriate default (empty string or 0).

## Key Architectural Decisions

### 1. Handling Go `sql.Null*` Types

The Go backend often returns nullable database fields as struct objects. To prevent the frontend from needing checks like `item.description?.Valid ? item.description.String : ''` everywhere:

- **Solution**: A recursive function `normalizeNullableFields` in the Axios response interceptor unwraps these objects into standard JavaScript primitives before the data ever reaches the component.

### 2. Authentication Strategy

- **Session**: HttpOnly cookies are used for security (preventing XSS access to tokens).
- **Client Awareness**: The `useAppStore` tracks an `isAuthenticated` boolean.
- **Enforcement**:
  - **Backend**: Returns `401 Unauthorized` if the cookie is missing/invalid.
  - **Frontend**: Axios interceptor watches for `401` status and performs a `window.location.href = "/login"` to force re-authentication.

### 3. Tailwind v4 Configuration

Instead of a large `tailwind.config.js`, the project leverages standard CSS variables.

- **`globals.css`**: Defines `@theme` blocks where colors, fonts, and spacing are mapped to CSS variables.
- **HeroUI**: Integrated via a plugin directive `@plugin '../hero.ts'` which likely points to a local typescript file defining the HeroUI theme tokens.

## Image System

The client manages images through the server's Image API, which stores files locally in 3 sizes (thumb/medium/original).

### Key Components

- **`imageService.ts`**: Handles upload (via `FormData`), list, get, updateMeta, and delete.
- **`useImages.ts`**: TanStack Query hooks wrapping the service with cache invalidation and toast notifications.
- **`ImagePicker.tsx`**: Reusable modal component with two tabs — **Library** (select existing) and **Upload New** (drag & drop with SEO fields).
- **`admin/images/page.tsx`**: Full gallery management page.

### Post Integration

Posts store `featured_image` as an **Image ID (UUID)**, not a URL. The edit post page resolves the ID to a URL via `useImage(id)` for preview. This decouples the image storage from the post, allowing images to be reused.

### Performance

Images are served by the Go backend with `Cache-Control: public, max-age=31536000, immutable` headers. UUID filenames ensure cache-busting only happens on actual changes. Next.js `remotePatterns` is configured via `.env.local` for image optimization.

## Data Flow Examples

### Example 1: Generating a QR Code

1.  **User**: Selects a logo file and sets color options in `app/(public)/qrgenerate/page.tsx`.
2.  **Component**: Calls `handleGenerate()` when button is clicked.
3.  **Service**: Calls `shortenerService.generateQR(code, logo, options)`.
    - Constructs `FormData`.
    - Appends file and options.
4.  **Network**: `POST /api/shorten/{code}/qr` `multipart/form-data`.
5.  **Backend**: Processes image and returns a `image/png` blob.
6.  **Axios**: Receives `Blob`.
7.  **Component**: `URL.createObjectURL(blob)` -> `<img src={url} />`.

### Example 2: Admin Sidebar Toggle

1.  **User**: Clicks the "Menu" icon in `Navbar`.
2.  **Action**: Calls `useAppStore.getState().toggleSidebar()`.
3.  **Store**: Updates `state.isSidebarOpen = !state.isSidebarOpen`.
4.  **Persistence**: Zustand middleware saves new state to `localStorage`.
5.  **UI**: `Sidebar` component (subscribed to store) re-renders, applying CSS classes to slide in/out.
