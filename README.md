# Sentinelr Frontend

A Next.js security application with authentication features built using Next.js Pages Router, TailwindCSS, Formik, and Material-UI Icons.

## Features

- 🔐 User Authentication (Login & Signup)
- 🎨 Modern UI with TailwindCSS
- ✅ Form validation with Formik and Yup
- 🔑 Password strength indicator
- 📱 Responsive design
- 🎯 Material-UI Icons integration

## Tech Stack

- **Framework:** Next.js 14 (Pages Router)
- **Language:** JavaScript
- **Styling:** TailwindCSS 3
- **Form Management:** Formik
- **Validation:** Yup
- **Icons:** Material-UI Icons
- **State Management:** React Context API

## Project Structure

```
sentinelr-frontend/
├── pages/
│   ├── _app.js           # App wrapper with providers
│   ├── _document.js      # Custom HTML document
│   ├── index.js          # Home page (redirects to login)
│   ├── login.js          # Login page
│   └── signup.js         # Signup page
├── components/           # Reusable components
├── context/
│   └── AuthContext.js    # Authentication context
├── public/
│   └── lock.svg          # Static assets
├── styles/
│   └── globals.css       # Global styles
├── next.config.js        # Next.js configuration
├── tailwind.config.js    # TailwindCSS configuration
├── postcss.config.js     # PostCSS configuration
└── package.json          # Dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd sentinelr-frontend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

The application will automatically redirect to the login page.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production bundle
- `npm start` - Start production server
- `npm run export` - Export static site

## Pages

### Login Page (`/login`)
- Email and password authentication
- Form validation
- Social login options (Google, Apple)
- Forgot password link
- Redirect to signup

### Signup Page (`/signup`)
- Email and password registration
- Real-time password strength validation
- Password visibility toggle using MUI icons
- Terms and conditions checkbox
- Social signup options
- Redirect to login

## Authentication

The app uses a Context API-based authentication system (`AuthContext.js`). Currently configured with mock authentication for demonstration purposes.

### Auth Methods:
- `login(email, password)` - Authenticate user
- `signup(email, password)` - Register new user
- `logout()` - Clear user session
- `user` - Current user object
- `loading` - Authentication loading state

**Note:** Replace the mock authentication with your actual API integration.

## Customization

### Styling
- Global styles are in `styles/globals.css`
- TailwindCSS utility classes are used throughout components
- Custom colors are defined inline (e.g., `#4A4742`, `#0E4B68`)

### Add New Pages
1. Create a new file in the `pages/` directory
2. Export a default React component
3. Access via the filename route (e.g., `dashboard.js` → `/dashboard`)

### Add Components
1. Create reusable components in the `components/` directory
2. Import and use in pages or other components

## Environment Variables

Create a `.env.local` file for environment-specific variables:

```env
NEXT_PUBLIC_API_URL=your_api_url_here
```

## Deployment

### Vercel (Recommended)
1. Push code to GitHub/GitLab/Bitbucket
2. Import project in [Vercel](https://vercel.com)
3. Configure environment variables
4. Deploy

### Other Platforms
```bash
npm run build
npm start
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is private and proprietary.

## Contributing

Please follow the existing code style and structure when contributing to this project.
