# Frontend Context - Job Tracker UI

This file provides context for Claude Code when working with the Job Tracker frontend.

## Tech Stack

### Core
- **React 18.2** - UI library with modern hooks
- **TypeScript 5.3+** - Type-safe JavaScript
- **Vite 5** - Fast build tool and dev server (NOT Create React App)

### Routing & State Management
- **React Router DOM 6** - Client-side routing
- **TanStack Query 5** (React Query) - Server state management with caching
- **React Context** - UI state (theme, auth)

### UI & Styling
- **Tailwind CSS 3** - Utility-first CSS framework
- **Dark Mode** - Class-based theme switching
- **@dnd-kit** - Modern drag-and-drop library (core, sortable, utilities)
- **Recharts 2** - Data visualization for analytics

### Data Fetching & API
- **Axios** - HTTP client with interceptors
- **date-fns 3** - Date formatting and manipulation

### Development Tools
- **ESLint** - Linting with TypeScript support
- **Prettier** - Code formatting
- **TypeScript ESLint** - TypeScript-specific linting
- **React Query DevTools** - Debugging server state

## Architecture

### Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── KanbanBoard/
│   │   │   ├── KanbanBoard.tsx     # Main board with drag-drop
│   │   │   ├── KanbanColumn.tsx    # Droppable column
│   │   │   └── JobCard.tsx         # Draggable job card
│   │   ├── JobForm/
│   │   │   └── JobFormModal.tsx    # Create/Edit modal
│   │   ├── Analytics/
│   │   │   └── Dashboard.tsx       # Charts and stats
│   │   ├── Auth/
│   │   │   ├── Login.tsx           # Login form
│   │   │   ├── Register.tsx        # Registration form
│   │   │   ├── GoogleCallback.tsx  # OAuth callback handler
│   │   │   └── index.ts
│   │   └── common/
│   │       ├── ProtectedRoute.tsx  # Auth guard
│   │       └── ThemeToggle.tsx     # Dark mode switcher
│   ├── hooks/
│   │   ├── useJobs.ts             # React Query hooks for jobs
│   │   └── useAnalytics.ts        # React Query hooks for analytics
│   ├── contexts/
│   │   ├── AuthContext.tsx        # Authentication state
│   │   └── ThemeContext.tsx       # Dark mode state
│   ├── services/
│   │   └── api.ts                 # Axios client & API functions
│   ├── types/
│   │   ├── job.ts                 # Job application interfaces
│   │   ├── analytics.ts           # Analytics data interfaces
│   │   └── user.ts                # User & auth interfaces
│   ├── App.tsx                    # Main app component
│   ├── main.tsx                   # Entry point (renders App)
│   └── index.css                  # Tailwind imports
├── public/                        # Static assets
├── dist/                          # Build output (Vite)
├── Dockerfile                     # Production Nginx image
├── nginx.conf                     # Nginx SPA configuration
├── vercel.json                    # Vercel deployment config
├── vite.config.ts                # Vite configuration
├── tailwind.config.js            # Tailwind customization
├── tsconfig.json                 # TypeScript config
└── package.json                  # Dependencies and scripts
```

### Key Features

**1. Kanban Board**
- Drag-and-drop job applications across status columns
- Uses `@dnd-kit/core` with `@dnd-kit/sortable`
- Optimistic updates for instant UI feedback
- Independent `order_index` per column

**2. Analytics Dashboard**
- Interactive charts with Recharts
- Application funnel visualization
- Timeline trends
- Status distribution

**3. Authentication**
- JWT-based auth with localStorage
- Email/password registration and login
- Google OAuth integration
- Protected routes with automatic redirect

**4. Dark Mode**
- System preference detection
- Manual toggle
- Persistent user preference (localStorage)
- Tailwind class-based theming

### Data Flow

**Server State (TanStack Query):**
- Automatic background refetching
- Optimistic updates for drag-drop
- Invalidation after mutations
- 1-minute stale time

**Local State:**
- Modal visibility
- Form inputs
- Active view (board vs analytics)
- Theme preference

**Authentication Flow:**
1. User logs in → receives JWT token
2. Token stored in localStorage
3. Axios interceptor adds `Authorization` header
4. 401 responses → auto-logout and redirect

## Deployment

### Vercel (Production)

**Platform:** Vercel (Serverless Edge Network)
**Build Command:** `npm run build`
**Output Directory:** `dist`
**Framework Preset:** Vite

**Environment Variables (Vercel Dashboard):**
```env
VITE_API_URL=https://your-backend.railway.app
```

**Deployment Process:**
1. Connect GitHub repository to Vercel
2. Vercel auto-detects Vite configuration
3. Builds static assets (`npm run build`)
4. Deploys to global CDN
5. Automatic HTTPS with custom domain support

**Vercel Configuration (`vercel.json`):**
- **Rewrites:** All routes → `index.html` (SPA support)
- **Headers:** Security headers (X-Content-Type-Options, X-Frame-Options, etc.)
- **Caching:** Static assets cached for 1 year

**Automatic Deployments:**
- **Production:** Pushes to `main` branch
- **Preview:** Pull requests get unique preview URLs
- **Rollback:** One-click rollback in Vercel dashboard

**Custom Domain:**
- Configure in Vercel → Project → Settings → Domains
- Automatic SSL/TLS certificates
- Global CDN distribution

### Vercel Environment Variables

**Setting Variables:**
1. Vercel Dashboard → Project → Settings → Environment Variables
2. Add `VITE_API_URL` with Railway backend URL
3. Variables are injected at build time (not runtime)
4. Redeploy required after changing variables

**Important:** Vite requires `VITE_` prefix for environment variables to be exposed to client code.

## Configuration

### Local Development

**Prerequisites:**
- Node.js 18+
- npm

**Setup:**
```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Configure .env
VITE_API_URL=http://localhost:8000

# Start dev server (hot reload on http://localhost:3000)
npm run dev
```

**Available Scripts:**
```bash
npm run dev         # Start Vite dev server with hot reload
npm run build       # Build for production (outputs to dist/)
npm run preview     # Preview production build locally
npm run lint        # Run ESLint
npm run format      # Format code with Prettier
npm run type-check  # TypeScript type checking (no emit)
```

**Vite Dev Server Features:**
- Hot Module Replacement (HMR)
- Fast refresh for React components
- Proxy to backend (`/api` → `http://localhost:8000`)
- Source maps for debugging

### Remote Development (Vercel Preview)

**Testing Against Production Backend:**
```env
# .env
VITE_API_URL=https://your-backend.railway.app
```

**Preview Deployments:**
- Every PR gets unique URL: `<branch>-<project>.vercel.app`
- Test changes before merging
- Share with stakeholders for review

### Docker (Local/Production)

**Multi-stage build with Nginx:**
```bash
# Build image
docker build -t job-tracker-frontend .

# Run container
docker run -p 80:80 job-tracker-frontend
```

**Docker Compose (Full Stack):**
```bash
# From project root
docker-compose up

# Frontend available at http://localhost:3000
```

## State Management

### TanStack Query (Server State)

**Jobs Data:**
```typescript
// hooks/useJobs.ts
const { data: jobs } = useQuery({
  queryKey: ['jobs'],
  queryFn: jobApplicationsApi.getAll,
});

// Mutation with optimistic update
const moveMutation = useMutation({
  mutationFn: ({ id, data }) => jobApplicationsApi.move(id, data),
  onMutate: async ({ id, data }) => {
    // Optimistic update logic
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['jobs'] });
  },
});
```

**Analytics Data:**
```typescript
// hooks/useAnalytics.ts
const { data: analytics } = useQuery({
  queryKey: ['analytics'],
  queryFn: analyticsApi.get,
});
```

**Configuration:**
- Stale time: 1 minute
- `refetchOnWindowFocus: false`
- Automatic retries on failure
- React Query DevTools in development

### Context API (UI State)

**AuthContext:**
```typescript
const { user, login, logout, isLoading } = useAuth();
```

**ThemeContext:**
```typescript
const { theme, toggleTheme } = useTheme();
```

## API Integration

### Axios Configuration

**Base Client (`services/api.ts`):**
```typescript
const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

**Request Interceptor (JWT):**
- Adds `Authorization: Bearer <token>` header
- Token retrieved from localStorage

**Response Interceptor (Auth Errors):**
- Detects 401 Unauthorized responses
- Clears token and redirects to `/login`

**API Functions:**
```typescript
// Job Applications
jobApplicationsApi.getAll()
jobApplicationsApi.create(data)
jobApplicationsApi.update(id, data)
jobApplicationsApi.move(id, data)  // Optimized for drag-drop
jobApplicationsApi.delete(id)

// Analytics
analyticsApi.get()

// Authentication
authApi.register(data)
authApi.login(data)
authApi.getMe()
authApi.getGoogleLoginUrl()
authApi.googleCallback(code)
```

## Common Development Tasks

### Adding a New Component

```bash
# Create component file
touch src/components/MyComponent/MyComponent.tsx

# Import and use in parent
import { MyComponent } from './components/MyComponent/MyComponent';
```

**Component Template:**
```typescript
interface MyComponentProps {
  title: string;
}

export function MyComponent({ title }: MyComponentProps) {
  return (
    <div className="p-4 bg-white dark:bg-gray-800">
      <h2 className="text-xl font-bold">{title}</h2>
    </div>
  );
}
```

### Adding a New API Endpoint

1. **Add API function in `services/api.ts`:**
   ```typescript
   export const myApi = {
     getData: async (): Promise<MyData> => {
       const response = await api.get<MyData>('/my-endpoint');
       return response.data;
     },
   };
   ```

2. **Create React Query hook:**
   ```typescript
   // hooks/useMyData.ts
   export function useMyData() {
     return useQuery({
       queryKey: ['myData'],
       queryFn: myApi.getData,
     });
   }
   ```

3. **Use in component:**
   ```typescript
   const { data, isLoading } = useMyData();
   ```

### Adding a New Type

```typescript
// types/myType.ts
export interface MyType {
  id: string;
  name: string;
  createdAt: string;
}

export interface MyTypeCreate {
  name: string;
}
```

### Styling with Tailwind

**Dark Mode:**
```tsx
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
  {/* Content */}
</div>
```

**Responsive:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Grid items */}
</div>
```

**Custom Colors (defined in `tailwind.config.js`):**
```tsx
<button className="bg-primary-600 hover:bg-primary-700">
  Click me
</button>
```

## Debugging

### Browser DevTools

**React Query DevTools:**
- Opens automatically in development
- View cached queries
- Inspect query state
- Manually trigger refetch

**Local Storage:**
- DevTools → Application → Local Storage
- Check `access_token` (JWT)
- Check `theme` preference

**Network Tab:**
- Monitor API requests
- Inspect headers (Authorization)
- View request/response payloads

### Common Issues

**Environment Variables Not Loading:**
```bash
# Must use VITE_ prefix
VITE_API_URL=http://localhost:8000  # ✅ Works
API_URL=http://localhost:8000       # ❌ Ignored by Vite

# Restart dev server after changing .env
npm run dev
```

**CORS Errors:**
- Check backend `CORS_ORIGINS` includes frontend URL
- Local: `http://localhost:3000`
- Vercel: `https://your-app.vercel.app`

**Authentication Loop:**
- Clear localStorage in DevTools
- Check JWT token expiration
- Verify backend `SECRET_KEY` hasn't changed

**Build Errors:**
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

## Deployment Best Practices

### Pre-Deployment Checklist

1. **Environment Variables:**
   - Set `VITE_API_URL` in Vercel dashboard
   - Use production backend URL (Railway)

2. **Build Test:**
   ```bash
   npm run build
   npm run preview  # Test production build locally
   ```

3. **Type Checking:**
   ```bash
   npm run type-check
   ```

4. **Linting:**
   ```bash
   npm run lint
   ```

### Vercel Deployment Steps

1. **Connect Repository:**
   - Go to Vercel Dashboard
   - Import Git Repository
   - Select your GitHub repo

2. **Configure Project:**
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Set Environment Variables:**
   - Add `VITE_API_URL` with Railway backend URL
   - Environment: Production, Preview, Development

4. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete
   - Visit deployment URL

### Monitoring

**Vercel Analytics:**
- Enable in Vercel Dashboard → Project → Analytics
- View page views, performance metrics
- Core Web Vitals tracking

**Error Tracking:**
- Check Vercel deployment logs
- Use browser console for client errors
- Monitor backend logs for API errors

## Important Notes

### Vite-Specific

- **Import Extensions:** Use `.tsx`/`.ts` in imports (Vite requirement)
- **Environment Variables:** Must start with `VITE_`
- **Build Output:** `dist/` directory (not `build/`)
- **HMR:** Much faster than webpack (Create React App)

### TanStack Query

- **No Redux/Zustand needed** - React Query handles server state
- **Optimistic updates** - UI feels instant
- **Automatic caching** - Reduces API calls
- **Background refetching** - Keeps data fresh

### Dark Mode

- **Class-based:** Requires `dark:` prefix in Tailwind classes
- **Persistence:** Saved to localStorage as `theme`
- **System preference:** Detects `prefers-color-scheme`

### Drag-and-Drop

- **@dnd-kit vs react-beautiful-dnd:**
  - @dnd-kit is actively maintained
  - Better performance
  - TypeScript support
  - Works with virtual scrolling

### Authentication

- **Token Storage:** localStorage (XSS risk mitigated by CSP)
- **Token Refresh:** Not implemented (consider adding for long sessions)
- **Logout:** Clears token and redirects to `/login`

### Vercel Specifics

- **Serverless:** No server-side rendering (pure SPA)
- **Edge Network:** Global CDN for fast loading
- **Build Time:** Environment variables injected at build (not runtime)
- **Automatic SSL:** HTTPS enforced
- **Preview Deployments:** Every PR gets unique URL

## Resources

- [React Documentation](https://react.dev/) - React 18 features
- [Vite Guide](https://vitejs.dev/guide/) - Build tool
- [TanStack Query](https://tanstack.com/query/latest) - Server state
- [Tailwind CSS](https://tailwindcss.com/docs) - Styling
- [dnd-kit](https://docs.dndkit.com/) - Drag-and-drop
- [Recharts](https://recharts.org/) - Charts
- [Vercel Docs](https://vercel.com/docs) - Deployment
- [React Router](https://reactrouter.com/) - Routing
