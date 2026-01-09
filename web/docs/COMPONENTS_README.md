# Components Directory

This directory contains all reusable components for the Sentinelr application, organized by feature/domain.

## Structure

```
components/
├── auth/                    # Authentication related components
│   ├── LoginForm/          # Login form component
│   │   ├── LoginForm.js
│   │   ├── LoginForm.module.css
│   │   └── index.js
│   ├── SignUpForm/         # Sign up form component
│   │   ├── SignUpForm.js
│   │   ├── SignUpForm.module.css
│   │   └── index.js
│   └── index.js            # Auth components barrel export
├── index.js                # Main components barrel export
└── README.md               # This file
```

## Component Organization

Each component follows a consistent folder structure:

- **ComponentName.js** - Main component file
- **ComponentName.module.css** - Component-specific styles using CSS modules
- **index.js** - Barrel export for cleaner imports

## Usage

Components can be imported in two ways:

### Direct Import
```javascript
import LoginForm from '@/components/auth/LoginForm';
import SignUpForm from '@/components/auth/SignUpForm';
```

### Barrel Import
```javascript
import { LoginForm, SignUpForm } from '@/components/auth';
```

## Adding New Components

When adding a new component:

1. Create a new folder with the component name (PascalCase)
2. Create the component file: `ComponentName.js`
3. Create the styles file: `ComponentName.module.css`
4. Create an index.js file that exports the component
5. Add the export to the parent index.js file

Example:
```javascript
// components/feature/NewComponent/NewComponent.js
export default function NewComponent() {
  return <div>...</div>;
}

// components/feature/NewComponent/index.js
export { default } from './NewComponent';

// components/feature/index.js
export { default as NewComponent } from './NewComponent';
```

## Best Practices

- Keep components focused and single-purpose
- Use CSS modules for component-specific styling
- Include PropTypes or TypeScript for type checking
- Document complex components with JSDoc comments
- Write components to be reusable across the application
