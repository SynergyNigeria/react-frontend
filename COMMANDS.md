# Command Reference

## Initial Setup

```powershell
# Navigate to project directory
cd c:\Users\DELL\Desktop\react_front-end

# Install all dependencies (first time only)
npm install

# This will install:
# - React 18.2.0
# - React Router 6.20.0
# - Axios 1.6.2
# - TanStack Query 5.12.2
# - Zustand 4.4.7
# - React Hook Form 7.48.2
# - Yup 1.3.3
# - Tailwind CSS 3.3.6
# - Vite 5.0.7
# - And more...
```

## Development Commands

```powershell
# Start development server (http://localhost:3000)
npm run dev

# Stop development server
# Press Ctrl+C in the terminal
```

## Build Commands

```powershell
# Create production build
npm run build

# Preview production build locally
npm run preview

# Clean build cache (if needed)
Remove-Item -Recurse -Force node_modules\.vite
```

## Code Quality

```powershell
# Run ESLint to check code
npm run lint

# Format code (if prettier is added)
npm run format
```

## Dependency Management

```powershell
# Check for outdated packages
npm outdated

# Update all packages to latest compatible versions
npm update

# Install a new package
npm install package-name

# Install a dev dependency
npm install --save-dev package-name

# Remove a package
npm uninstall package-name
```

## Troubleshooting Commands

```powershell
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install

# Check Node and npm versions
node --version
npm --version

# Kill process on port 3000 (if port is in use)
netstat -ano | findstr :3000
# Find the PID from output, then:
taskkill /PID <PID> /F
```

## Git Commands (Optional)

```powershell
# Initialize git repository
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial React frontend setup"

# Add remote repository
git remote add origin <your-repo-url>

# Push to remote
git push -u origin main
```

## Environment Variables

```powershell
# Edit .env file
notepad .env

# Example .env content:
# VITE_API_URL=https://covu.onrender.com/api
# VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx
```

## Useful VS Code Extensions

If using VS Code, install these extensions:

- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- ESLint
- Prettier - Code formatter
- Auto Rename Tag
- Path Intellisense

## Quick Reference

| Command           | Purpose                  |
| ----------------- | ------------------------ |
| `npm install`     | Install dependencies     |
| `npm run dev`     | Start dev server         |
| `npm run build`   | Build for production     |
| `npm run preview` | Preview production build |
| `npm run lint`    | Check code quality       |

## Common Issues & Solutions

### Port 3000 already in use

```powershell
# Option 1: Kill the process
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Option 2: Use different port
npm run dev -- --port 3001
```

### Module not found errors

```powershell
# Reinstall dependencies
Remove-Item -Recurse -Force node_modules
npm install
```

### Build fails

```powershell
# Clear cache and rebuild
Remove-Item -Recurse -Force node_modules\.vite
Remove-Item -Recurse -Force dist
npm run build
```

### ESLint errors

```powershell
# Auto-fix fixable issues
npm run lint -- --fix
```

## Production Deployment

### Build and Deploy to Vercel

```powershell
# Install Vercel CLI
npm install -g vercel

# Build project
npm run build

# Deploy
vercel

# Or deploy with production flag
vercel --prod
```

### Build and Deploy to Netlify

```powershell
# Install Netlify CLI
npm install -g netlify-cli

# Build project
npm run build

# Deploy
netlify deploy

# Deploy to production
netlify deploy --prod
```

### Manual Deployment

```powershell
# Build project
npm run build

# The dist/ folder contains your production build
# Upload the contents of dist/ to your web server
```

## Performance Tips

```powershell
# Analyze bundle size
npm run build
# Check dist/ folder size

# If bundle is too large, consider:
# - Lazy loading routes
# - Code splitting
# - Optimizing images
# - Tree shaking unused code
```

## Getting Help

```powershell
# View npm command help
npm help

# View specific command help
npm help install

# Check package details
npm view package-name

# List installed packages
npm list
npm list --depth=0  # Top level only
```

---

## Quick Start (Copy & Paste)

```powershell
# Complete setup in 3 commands:
cd c:\Users\DELL\Desktop\react_front-end
npm install
npm run dev
```

Then open http://localhost:3000 in your browser!

---

**Need more help?** Check:

- `QUICK_START.md` - Setup guide
- `REACT_README.md` - Full documentation
- `DIRECTORY_STRUCTURE.md` - File organization
- `IMPLEMENTATION_SUMMARY.md` - Features overview
