---
applyTo: '**'
---

## 1. Core Architectural Principles (Apply Everywhere)

- **Clean & Modular Architecture**: Every piece of code should align with the established project structure. When generating files or code blocks, strictly adhere to the separation of concerns.
- **Mobile-First Design**: All UI components, layouts, and styles must be designed and implemented for mobile screens first. Use Tailwind CSS's responsive prefixes (like `md:`, `lg:`) only to scale *up* to larger screens, not down.
- **Service Layer Abstraction**: All external API calls, especially to Supabase, must be placed within the `src/services/` directory. Components should not call `supabase.from(...)` directly. They should use a function from a service file (e.g., `AuthService.js`, `ProfileService.js`).
- **Logic in Hooks**: All non-trivial component logic (data fetching, state management, form handling) should be extracted into custom hooks within the `src/hooks/` directory (e.g., `useAuth`, `useProfile`, `useFormValidation`). This keeps components lean and focused on rendering UI.

---
## 2. File and Folder Structure

When creating new files, place them in the correct directory according to this structure. Use barrel exports (`index.js`) in component subdirectories for cleaner imports.

```
src/
├── components/      # Reusable UI components
│   ├── common/      # Generic (Button, Modal, Input, ProtectedRoute)
│   ├── auth/        # Auth-specific (AuthButton, EmailRegistrationForm)
│   ├── profile/     # Profile-specific (ProfileHeader, Avatar)
│   └── links/       # Link-specific (LinkCard, LinkList, AddLinkModal)
├── pages/           # Route components (LandingPage, Dashboard, ProfilePage)
├── services/        # API calls (supabase.js, AuthService.js, ProfileService.js)
├── hooks/           # Custom React hooks (useAuth, useProfile, useLinks)
├── utils/           # Helper functions (validators.js, ErrorHandler.js)
├── contexts/        # React context providers (AuthContext.js)
├── constants/       # App constants (validationMessages.js)
└── styles/          # Global styles & Tailwind config
```

---
## 3. React Component Guidelines

- **Functional Components**: Always use functional components with hooks.
- **Single Responsibility**: Keep components small and focused on a single task. A component that fetches data, manages state, and renders a complex UI should be broken down.
- **PropTypes**: Since this is a JavaScript project, add `PropTypes` to all components to define the expected props, their types, and whether they are required. This ensures component API consistency.
- **Destructuring Props**: Always destructure props in the component's function signature.
- **Mobile-First JSX**: Structure the JSX and apply Tailwind classes for the mobile view first. Desktop adjustments should be additive using responsive prefixes.
- **Touch-Optimized Components**: All interactive elements (buttons, links, form inputs) must be easily tappable. Ensure they have sufficient padding to meet a minimum 44x44px touch target.

**Example Component Shell:**
```javascript
import React from 'react';
import PropTypes from 'prop-types';

// A lean component that gets its logic and data from props/hooks
const MyComponent = ({ title, onAction }) => {
  return (
    // Mobile-first classes are applied directly.
    // md: and lg: classes are used for larger screens.
    <div className="p-4 bg-white md:p-6">
      <h2 className="text-lg md:text-xl">{title}</h2>
      <button
        onClick={onAction}
        className="px-4 py-3 bg-blue-500 text-white rounded-lg" // py-3 makes it tall enough for touch
      >
        Action
      </button>
    </div>
  );
};

MyComponent.propTypes = {
  title: PropTypes.string.isRequired,
  onAction: PropTypes.func.isRequired,
};

export default MyComponent;
```

---
## 4. Supabase & Data Fetching Guidelines

- **Use Supabase MCP Client for Context**: The Supabase MCP client is connected to this workspace. You can use it to query the live database schema, Row Level Security (RLS) policies, and database functions. This should be your primary source of truth for any database-related questions to provide the most accurate and context-aware code suggestions.
- **Centralized Client**: The Supabase client must only be initialized once in `src/services/supabase.js` and exported for use in other service files. Do not initialize it in components.
- **Service Abstraction**: Create functions in service files that abstract the Supabase queries. This allows for easier mocking and testing.
  - **Bad (in a component):** `const { data } = await supabase.from('profiles').select('*')`
  - **Good (in a component):** `const profile = await ProfileService.getProfileByUsername(username);`
- **Row Level Security (RLS)**: Assume RLS is always enabled. All queries that modify data (`insert`, `update`, `delete`) must be performed by an authenticated user and will be protected by policies. Public data fetching (`select`) is allowed.
- **Error Handling**: Every call to a service function must be wrapped in a `try...catch` block or use promise-based `.then().catch()` handling within an `async` custom hook.

---
## 5. Styling with Tailwind CSS

- **Mobile-First Prefixes**: Write styles for the smallest screen size first, without any prefixes. Use `sm:`, `md:`, `lg:`, `xl:` to add or override styles for larger screens.
- **Theming**: Use theme values defined in `tailwind.config.js` for colors, fonts, and spacing whenever possible, instead of using arbitrary values.
- **Component-Based Styles**: Keep styles co-located with their components. Avoid global CSS except for base styles (e.g., body background, font smoothing).

---
## 6. State Management & Routing

- **Global State**: Use `React.Context` (`src/contexts/`) for genuinely global state, such as authentication status (`AuthContext`).
- **Local & Server State**: For local component state, use `useState` and `useReducer`. For server state (data fetched from Supabase), prefer custom hooks that manage fetching, caching, loading, and error states.
- **Protected Routes**: Use the `components/common/ProtectedRoute.jsx` component to wrap routes that require authentication. This component should use the `AuthContext` to check the user's session.
- **Dynamic Routes**: For pages like `/[username]`, use the routing library's (e.g., React Router) dynamic segment capabilities to extract the parameter from the URL.

