# Client Architecture

This project is a modern web application built with **Next.js 15** (App Router), designed for performance, scalability, and developer experience.

## Tech Stack

- **Framework**: [Next.js 15.5](https://nextjs.org/) (React 18+, App Router)
- **UI Library**: [HeroUI v2](https://heroui.com/) (formerly NextUI)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animation**: [Framer Motion](https://www.framer.com/motion/)
- **Rich Text Editor**: [Tiptap](https://tiptap.dev/)
- **State Management**:
  - **Global Client State**: [Zustand](https://github.com/pmndrs/zustand)
  - **Server State**: [TanStack Query](https://tanstack.com/query/latest) (React Query)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Theme**: [Next Themes](https://github.com/pacocoursey/next-themes)

## Directory Structure

```
client/
├── app/                  # Next.js App Router pages and layouts
│   ├── (public)/         # Publicly accessible routes
│   ├── admin/            # Admin dashboard routes
│   ├── api/              # Local API routes (if any)
│   ├── layout.tsx        # Root layout (HTML/Body structure)
│   ├── providers.tsx     # Global providers (HeroUI, Query, Theme)
│   ├── robots.ts         # SEO: Robots.txt generation
│   └── sitemap.ts        # SEO: Sitemap generation
├── components/           # Reusable UI components
│   ├── editor/           # Rich text editor (Tiptap) components
│   ├── navbar.tsx        # Main navigation bar
│   ├── sidebar.tsx       # Admin sidebar (if applicable)
│   ├── theme-switch.tsx  # Dark/Light mode toggle
│   ├── icons.tsx         # Icon registry
│   └── primitives.ts     # Tailwind variants/component primitives
├── config/               # Static configuration
│   └── site.ts           # Site metadata, nav links
├── hooks/                # Custom React hooks
├── lib/                  # Application-agnostic utilities
│   ├── axios.ts          # Configured Axios instance
│   └── utils.ts          # CN/Clsx helpers
├── services/             # API integration layer
│   ├── shortenerService.ts # URL shortening & QR logic
│   └── postService.ts    # Blog/Post management logic
├── store/                # Global client-state stores
│   └── useAppStore.ts    # UI state (e.g., sidebar)
├── styles/               # Global styles
│   └── globals.css       # Global Tailwind/CSS styles
└── types/                # TypeScript type definitions
```

## Architecture Layers

This application follows a **Layered Architecture** adapted for React/Next.js:

### 1. UI Layer (`components/`, `app/`)

- **Responsibility**: Rendering UI, handling user interactions.
- **Key Principle**: Components should be "dumb" whenever possible. Complex logic should be delegating to hooks or services.
- **Styling**: Uses Tailwind CSS v4 utility classes and HeroUI components.
- **Structure**:
  - **(public)**: Routes open to all users (Landing, Blog, etc).
  - **admin**: Protected routes for administration.

### 2. State Layer

- **Server State (TanStack Query)**:
  - Used for all asynchronous data buffering (API responses).
  - Handles caching, deduping, and revalidation automatically.
  - Code location: Inside custom hooks or directly in page components (via `useQuery`, `useMutation`).
- **Client State (Zustand)**:
  - Used for ephemeral UI state (e.g., "is sidebar open", "current modal step").
  - Code location: `store/` directory.

### 3. Service Layer (`services/`)

- **Responsibility**: Encapsulate API calls and data transformation.
- **Key Principle**: UI components should _never_ call `axios` directly. They should call a method from a service (e.g., `shortenerService.shorten(url)`).
- **Structure**: Grouped by domain (Shortener, Auth, Post).

## Data Flow

Typical flow for a user action (e.g., Shortening a URL):

1.  **User** enters URL in `Input` component.
2.  **Component** calls `useMutation` (TanStack Query).
3.  **Mutation** calls `shortenerService.shorten(url)`.
4.  **Service** uses `lib/axios` to make POST request to Backend API.
5.  **Backend** responds.
6.  **Service** returns data to Mutation.
7.  **Component** updates UI (Success message, display Short URL).

## Key Patterns

### Service Module Pattern

Instead of scattering `fetch` or `axios` calls, we define typed service objects.

```typescript
// services/exampleService.ts
export const exampleService = {
  getData: async () => {
    const res = await apiClient.get("/data");
    return res.data;
  },
};
```

### Component Composition

We favor composition over inheritance. We use `children` props and slot patterns common in React to build flexible UIs used by layouts and wrapper components.

### Rich Text Editing

We use **Tiptap** for rich text editing (e.g., creating blog posts). The editor components are encapsulated in `components/editor` to separate the complexity of the editor from the rest of the application.
