# Project Structure

This document outlines the organized and professional structure of the Sentinelr application.

## Directory Structure

```
sentinelr-Frontend/
├── components/               # Reusable components organized by feature
│   ├── auth/                # Authentication components
│   │   ├── LoginForm/
│   │   │   ├── LoginForm.js
│   │   │   ├── LoginForm.module.css
│   │   │   └── index.js
│   │   ├── SignUpForm/
│   │   │   ├── SignUpForm.js
│   │   │   ├── SignUpForm.module.css
│   │   │   └── index.js
│   │   └── index.js
│   ├── index.js             # Main barrel export
│   └── README.md
│
├── context/                  # React context providers
│   └── AuthContext.js
│
├── pages/                    # Next.js pages (kept simple)
│   ├── _app.js
│   ├── _document.js
│   ├── index.js
│   ├── login.js             # Simple wrapper for LoginForm
│   └── signup.js            # Simple wrapper for SignUpForm
│
├── public/                   # Static assets
│   └── assets/
│       └── images/
│           └── lock.svg
│
├── styles/                   # Global styles
│   └── globals.css
│
├── .gitignore
├── next.config.js
├── package.json
├── postcss.config.js
├── README.md
├── tailwind.config.js
└── PROJECT_STRUCTURE.md      # This file
```

## Architecture Principles

### 1. Separation of Concerns
- **Pages**: Simple, lightweight wrappers that only import and render components
- **Components**: Contain all UI logic, state management, and styling
- **Context**: Global state management and shared logic

### 2. Component Organization
Each component follows a consistent pattern:
```
ComponentName/
├── ComponentName.js          # Component logic
├── ComponentName.module.css  # Component styles (CSS Modules)
└── index.js                  # Barrel export
```

### 3. Benefits of This Structure

#### Clean Pages
Pages are now simple and focused on routing:
```javascript
// pages/login.js
import LoginForm from '../components/auth/LoginForm';

export default function Login() {
  return <LoginForm />;
}
```

#### Reusable Components
Components can be easily imported and reused:
```javascript
import { LoginForm, SignUpForm } from '@/components/auth';
```

#### Organized Styles
Each component has its own CSS module, preventing style conflicts:
```css
/* LoginForm.module.css */
.container { ... }
.title { ... }
```

#### Easy Testing
Components are isolated and can be tested independently from pages.

#### Scalability
New features can be added without cluttering the pages directory:
```
components/
├── auth/
├── dashboard/     # New feature
├── profile/       # New feature
└── shared/        # Shared components
```

## Styling Approach

The project uses a hybrid styling approach:

1. **Tailwind CSS**: For utility-first styling and global design system
2. **CSS Modules**: For component-specific, scoped styles
3. **Global Styles**: In `styles/globals.css` for base styles

### Font Configuration
- **Google Font**: Lato (configured in `_document.js`)
- **Tailwind Integration**: Lato added to font family in `tailwind.config.js`

## Import Patterns

### Recommended
```javascript
// Using barrel exports
import { LoginForm, SignUpForm } from '@/components/auth';

// Direct import for specific component
import LoginForm from '@/components/auth/LoginForm';
```

### Avoid
```javascript
// Don't import the component file directly
import LoginForm from '@/components/auth/LoginForm/LoginForm';
```

## Adding New Features

When adding a new feature:

1. **Create component folder** in appropriate category
2. **Create component files** (Component.js, Component.module.css, index.js)
3. **Update barrel exports** in parent index.js
4. **Create simple page wrapper** if needed
5. **Update this documentation**

## Code Organization Best Practices

### Component Files
- One component per file
- Component name matches file name
- PropTypes or TypeScript for type safety
- Clear, descriptive function/variable names

### CSS Modules
- Use semantic class names
- Leverage Tailwind's `@apply` directive
- Keep styles scoped to component
- Responsive design with Tailwind breakpoints

### Context
- One context per domain (auth, theme, etc.)
- Provide clear hook for consuming context
- Keep context focused and minimal

## File Naming Conventions

- **Components**: PascalCase (LoginForm.js)
- **Utilities**: camelCase (authUtils.js)
- **CSS Modules**: ComponentName.module.css
- **Context**: PascalCase (AuthContext.js)
- **Pages**: lowercase (login.js, signup.js)

## Future Improvements

- [ ] Add TypeScript for type safety
- [ ] Implement component testing with Jest/React Testing Library
- [ ] Add Storybook for component documentation
- [ ] Create shared/common components directory
- [ ] Add API service layer
- [ ] Implement error boundary components
- [ ] Add loading states and skeletons
