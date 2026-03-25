# Mission Control: Design Implementation Guide for Developers

**Companion Document to Design System**  
**Created:** March 24, 2026  
**Audience:** Frontend Developers & QA Engineers

---

## Overview

This guide translates the design system specifications into actionable implementation tasks. It covers:
- CSS/Tailwind token setup
- Component implementation priority
- Testing specifications
- Dark mode implementation
- Responsive design patterns
- Performance considerations

---

## Part 1: Design Token Implementation

### CSS Variables Setup

**File: `src/styles/tokens.css`**

```css
/* COLOR TOKENS - LIGHT MODE (default) */
:root {
  /* Neutrals - Grayscale Foundation */
  --color-bg-primary: #FFFFFF;
  --color-bg-secondary: #F6F8FB;
  --color-bg-tertiary: #F0F2F5;
  --color-border: #EAEEF2;
  --color-border-dark: #D0D7DE;
  --color-text-primary: #0D1117;
  --color-text-secondary: #57606A;
  --color-text-tertiary: #8B949E;
  --color-text-disabled: #8B949E;
  
  /* Brand / Accent Colors */
  --color-accent: #0969DA;
  --color-accent-hover: #0860CA;
  --color-accent-active: #033D8B;
  --color-accent-light: #DDF4FF;
  --color-accent-lighter: #EFF6FF;
  
  /* Semantic Colors */
  --color-success: #1A7F64;
  --color-success-bg: #E8F5E9;
  --color-warning: #9E6A03;
  --color-warning-bg: #FFF3CD;
  --color-critical: #DA3633;
  --color-critical-bg: #FDE7E7;
  --color-info: #54AFF0;
  --color-info-bg: #DBEAFE;
  
  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.08);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 20px 25px rgba(0, 0, 0, 0.15);
  --shadow-xl: 0 25px 50px rgba(0, 0, 0, 0.2);
  
  /* Typography */
  --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'Courier New', monospace;
  --text-h1-size: 32px;
  --text-h1-weight: 600;
  --text-h1-height: 1.25;
  --text-h2-size: 24px;
  --text-h2-weight: 600;
  --text-h2-height: 1.33;
  --text-h3-size: 18px;
  --text-h3-weight: 600;
  --text-h3-height: 1.33;
  --text-h4-size: 16px;
  --text-h4-weight: 600;
  --text-h4-height: 1.5;
  --text-body-lg-size: 15px;
  --text-body-lg-weight: 400;
  --text-body-lg-height: 1.5;
  --text-body-size: 13px;
  --text-body-weight: 400;
  --text-body-height: 1.5;
  --text-sm-size: 12px;
  --text-sm-weight: 400;
  --text-sm-height: 1.4;
  --text-xs-size: 11px;
  --text-xs-weight: 500;
  --text-xs-height: 1.4;
  
  /* Spacing (8pt base unit) */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 12px;
  --space-lg: 16px;
  --space-xl: 24px;
  --space-2xl: 32px;
  --space-3xl: 40px;
  --space-4xl: 48px;
  
  /* Sizing */
  --size-button-sm: 32px;
  --size-button-md: 36px;
  --size-button-lg: 44px;
  --size-input-sm: 32px;
  --size-input-md: 36px;
  --size-input-lg: 44px;
  --size-icon-sm: 16px;
  --size-icon-md: 20px;
  --size-icon-lg: 24px;
  
  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  --radius-full: 9999px;
  
  /* Z-Index Scale */
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-fixed: 300;
  --z-modal-backdrop: 400;
  --z-modal: 500;
  --z-toast: 600;
  --z-tooltip: 700;
  
  /* Transitions */
  --transition-fast: 100ms ease-out;
  --transition-base: 150ms ease-out;
  --transition-slow: 250ms ease-out;
  --transition-animation: 800ms linear;
}

/* DARK MODE */
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg-primary: #0D1117;
    --color-bg-secondary: #161B22;
    --color-bg-tertiary: #21262D;
    --color-border: #30363D;
    --color-border-dark: #444C56;
    --color-text-primary: #F0F6FC;
    --color-text-secondary: #C9D1D9;
    --color-text-tertiary: #8B949E;
    --color-text-disabled: #6E7681;
    
    --color-accent: #79C0FF;
    --color-accent-hover: #58A6FF;
    --color-accent-active: #3B82F6;
    --color-accent-light: #1F6FEB;
    --color-accent-lighter: #0969DA;
    
    --color-success: #3FB950;
    --color-success-bg: #033D12;
    --color-warning: #D29922;
    --color-warning-bg: #4D2D0C;
    --color-critical: #F85149;
    --color-critical-bg: #3D0E0A;
    --color-info: #79C0FF;
    --color-info-bg: #0D3B66;
    
    --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.3);
    --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.4);
    --shadow-lg: 0 20px 25px rgba(0, 0, 0, 0.5);
    --shadow-xl: 0 25px 50px rgba(0, 0, 0, 0.6);
  }
}

/* FORCED LIGHT MODE (for light mode toggle) */
[data-theme="light"] {
  --color-bg-primary: #FFFFFF;
  --color-bg-secondary: #F6F8FB;
  /* ... repeat all light mode values */
}

/* FORCED DARK MODE (for dark mode toggle) */
[data-theme="dark"] {
  --color-bg-primary: #0D1117;
  --color-bg-secondary: #161B22;
  /* ... repeat all dark mode values */
}
```

### Tailwind Configuration

**File: `tailwind.config.js`** (if using Tailwind CSS)

```javascript
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class', // or 'media' for system preference
  theme: {
    colors: {
      // Using CSS variables from tokens.css
      transparent: 'transparent',
      current: 'currentColor',
      
      // Background colors
      bg: {
        primary: 'var(--color-bg-primary)',
        secondary: 'var(--color-bg-secondary)',
        tertiary: 'var(--color-bg-tertiary)',
      },
      
      // Text colors
      text: {
        primary: 'var(--color-text-primary)',
        secondary: 'var(--color-text-secondary)',
        tertiary: 'var(--color-text-tertiary)',
        disabled: 'var(--color-text-disabled)',
      },
      
      // Accent
      accent: {
        DEFAULT: 'var(--color-accent)',
        hover: 'var(--color-accent-hover)',
        active: 'var(--color-accent-active)',
        light: 'var(--color-accent-light)',
      },
      
      // Semantic
      success: 'var(--color-success)',
      warning: 'var(--color-warning)',
      critical: 'var(--color-critical)',
      info: 'var(--color-info)',
      
      // Borders
      border: 'var(--color-border)',
    },
    
    spacing: {
      0: '0',
      px: '1px',
      xs: 'var(--space-xs)',
      sm: 'var(--space-sm)',
      md: 'var(--space-md)',
      lg: 'var(--space-lg)',
      xl: 'var(--space-xl)',
      '2xl': 'var(--space-2xl)',
      '3xl': 'var(--space-3xl)',
      '4xl': 'var(--space-4xl)',
    },
    
    fontSize: {
      xs: ['var(--text-xs-size)', { lineHeight: 'var(--text-xs-height)' }],
      sm: ['var(--text-sm-size)', { lineHeight: 'var(--text-sm-height)' }],
      base: ['var(--text-body-size)', { lineHeight: 'var(--text-body-height)' }],
      lg: ['var(--text-body-lg-size)', { lineHeight: 'var(--text-body-lg-height)' }],
      h4: ['var(--text-h4-size)', { lineHeight: 'var(--text-h4-height)', fontWeight: '600' }],
      h3: ['var(--text-h3-size)', { lineHeight: 'var(--text-h3-height)', fontWeight: '600' }],
      h2: ['var(--text-h2-size)', { lineHeight: 'var(--text-h2-height)', fontWeight: '600' }],
      h1: ['var(--text-h1-size)', { lineHeight: 'var(--text-h1-height)', fontWeight: '600' }],
    },
    
    borderRadius: {
      sm: 'var(--radius-sm)',
      md: 'var(--radius-md)',
      lg: 'var(--radius-lg)',
      xl: 'var(--radius-xl)',
      full: 'var(--radius-full)',
    },
    
    boxShadow: {
      none: 'none',
      sm: 'var(--shadow-sm)',
      md: 'var(--shadow-md)',
      lg: 'var(--shadow-lg)',
      xl: 'var(--shadow-xl)',
    },
    
    fontFamily: {
      sans: 'var(--font-primary)',
      mono: 'var(--font-mono)',
    },
    
    transitionDuration: {
      fast: 'var(--transition-fast)',
      base: 'var(--transition-base)',
      slow: 'var(--transition-slow)',
      animation: 'var(--transition-animation)',
    },
  },
  
  plugins: [
    // Custom plugin for component utilities (optional)
    function({ addComponents, theme }) {
      addComponents({
        '.btn-primary': {
          backgroundColor: theme('colors.accent.DEFAULT'),
          color: 'white',
          padding: `${theme('spacing.sm')} ${theme('spacing.lg')}`,
          borderRadius: theme('borderRadius.md'),
          transition: 'all var(--transition-fast)',
          '&:hover': {
            backgroundColor: theme('colors.accent.hover'),
            boxShadow: theme('boxShadow.md'),
          },
          '&:active': {
            backgroundColor: theme('colors.accent.active'),
            transform: 'scale(0.98)',
          },
        },
        '.card': {
          backgroundColor: theme('colors.bg.secondary'),
          border: `1px solid ${theme('colors.border')}`,
          borderRadius: theme('borderRadius.lg'),
          padding: theme('spacing.lg'),
          boxShadow: theme('boxShadow.sm'),
          transition: 'all var(--transition-base)',
        },
      });
    },
  ],
};
```

---

## Part 2: Component Implementation Checklist

### Phase 1: Foundation Components (Week 1)

**Button Component**
```typescript
// src/components/Button.tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  disabled,
  ...props
}) => {
  const baseClasses = 'font-medium rounded-md transition-all focus:outline-2 focus:outline-offset-2';
  
  const variantClasses = {
    primary: 'bg-accent text-white hover:bg-accent-hover active:bg-accent-active',
    secondary: 'border border-border text-text-primary hover:bg-bg-tertiary',
    tertiary: 'text-accent hover:bg-accent-light',
    danger: 'bg-critical text-white hover:opacity-90 active:opacity-100',
  };
  
  const sizeClasses = {
    sm: 'h-8 px-3 text-sm', // 32px
    md: 'h-9 px-4 text-base', // 36px
    lg: 'h-11 px-5 text-lg', // 44px
  };
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${isLoading ? 'opacity-70' : ''}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Spinner className="mr-2 h-4 w-4" />}
      {children}
    </button>
  );
};
```

**Input Component**
```typescript
// src/components/Input.tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  icon,
  id,
  ...props
}) => {
  return (
    <div className="flex flex-col gap-md">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-text-primary">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && <span className="absolute left-3 top-2.5">{icon}</span>}
        <input
          id={id}
          className={`w-full h-9 px-3 rounded-md border bg-bg-primary text-text-primary
            transition-all focus:outline-2 focus:outline-offset-0
            ${icon ? 'pl-10' : ''} ${error ? 'border-critical' : 'border-border'}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-critical">{error}</p>}
      {helperText && <p className="text-xs text-text-tertiary">{helperText}</p>}
    </div>
  );
};
```

**Card Component**
```typescript
// src/components/Card.tsx
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({
  elevated = false,
  interactive = false,
  className = '',
  children,
  ...props
}) => {
  return (
    <div
      className={`bg-bg-secondary border border-border rounded-lg p-lg
        ${elevated ? 'shadow-lg' : 'shadow-sm'}
        ${interactive ? 'hover:shadow-md transition-shadow cursor-pointer' : ''}
        ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
```

### Phase 2: Form Components

**Checkbox Component**
```typescript
// src/components/Checkbox.tsx
interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ label, id, ...props }) => {
  return (
    <div className="flex items-center gap-sm">
      <input
        type="checkbox"
        id={id}
        className="w-4 h-4 rounded cursor-pointer accent-accent"
        {...props}
      />
      {label && (
        <label htmlFor={id} className="text-sm text-text-primary cursor-pointer">
          {label}
        </label>
      )}
    </div>
  );
};
```

**Toggle Switch Component**
```typescript
// src/components/Toggle.tsx
interface ToggleProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Toggle: React.FC<ToggleProps> = ({ label, id, ...props }) => {
  const [checked, setChecked] = React.useState(props.checked || false);
  
  return (
    <div className="flex items-center gap-md">
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => setChecked(!checked)}
        className={`w-10 h-5 rounded-full transition-colors ${
          checked ? 'bg-accent' : 'bg-border'
        }`}
      >
        <div
          className={`w-4 h-4 rounded-full bg-white transition-transform
            ${checked ? 'translate-x-5' : 'translate-x-0.5'}`}
        />
      </button>
      {label && (
        <label htmlFor={id} className="text-sm text-text-primary">
          {label}
        </label>
      )}
    </div>
  );
};
```

### Phase 3: Layout Components

**Sidebar Navigation**
```typescript
// src/components/Sidebar.tsx
export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = React.useState(false);
  
  return (
    <aside
      className={`fixed left-0 top-16 bottom-0 bg-bg-secondary border-r border-border
        transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'}
        flex flex-col`}
    >
      <nav className="flex-1 p-lg space-y-sm overflow-y-auto">
        {/* Navigation items */}
      </nav>
      
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="p-md hover:bg-bg-tertiary rounded-md"
      >
        {collapsed ? '→' : '←'}
      </button>
    </aside>
  );
};
```

---

## Part 3: Dark Mode Implementation

### React Hook for Theme Toggle

```typescript
// src/hooks/useTheme.ts
type Theme = 'light' | 'dark' | 'system';

export const useTheme = () => {
  const [theme, setTheme] = React.useState<Theme>(() => {
    const stored = localStorage.getItem('mission-control-theme');
    return (stored as Theme) || 'system';
  });
  
  React.useEffect(() => {
    const html = document.documentElement;
    
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      html.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      html.setAttribute('data-theme', theme);
    }
    
    localStorage.setItem('mission-control-theme', theme);
  }, [theme]);
  
  return { theme, setTheme };
};
```

### Theme Provider Context

```typescript
// src/context/ThemeContext.tsx
interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

export const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark' || 
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => {
  const context = React.useContext(ThemeContext);
  if (!context) throw new Error('useThemeContext must be used within ThemeProvider');
  return context;
};
```

### Theme Toggle Component

```typescript
// src/components/ThemeToggle.tsx
export const ThemeToggle: React.FC = () => {
  const { theme, setTheme, isDark } = useThemeContext();
  
  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="p-md rounded-md hover:bg-bg-tertiary transition-colors"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
};
```

---

## Part 4: Responsive Design Implementation

### Mobile-First Breakpoint Utilities

```css
/* src/styles/responsive.css */

/* Mobile: < 640px (default) */
@media (min-width: 640px) {
  /* Tablet styles */
  .sidebar { width: 64px; } /* icon-only */
  .grid { grid-template-columns: repeat(2, 1fr); }
}

@media (min-width: 1024px) {
  /* Desktop styles */
  .sidebar { width: 240px; } /* full sidebar */
  .grid { grid-template-columns: repeat(3, 1fr); }
  .modal { max-width: 600px; } /* centered dialog */
}

@media (min-width: 1440px) {
  /* Large desktop */
  .grid { grid-template-columns: repeat(4, 1fr); }
}

/* Touch device specific */
@media (hover: none) and (pointer: coarse) {
  .btn-sm { min-height: 44px; } /* larger touch targets */
  .card { margin: 8px; } /* more spacing on touch */
}
```

### Responsive Image Component

```typescript
// src/components/ResponsiveImage.tsx
interface ResponsiveImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  width = 800,
  height = 600,
}) => {
  return (
    <picture>
      <source media="(max-width: 640px)" srcSet={`${src}?w=640`} />
      <source media="(max-width: 1024px)" srcSet={`${src}?w=1024`} />
      <source media="(min-width: 1024px)" srcSet={`${src}?w=1440`} />
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="w-full h-auto"
        loading="lazy"
      />
    </picture>
  );
};
```

---

## Part 5: Testing Specifications

### Component Snapshot Tests

```typescript
// __tests__/Button.test.tsx
import { render } from '@testing-library/react';
import { Button } from '../Button';

describe('Button Component', () => {
  it('renders primary button correctly', () => {
    const { getByRole } = render(<Button variant="primary">Click me</Button>);
    expect(getByRole('button')).toHaveClass('bg-accent');
  });
  
  it('applies size classes', () => {
    const { getByRole } = render(<Button size="lg">Large</Button>);
    expect(getByRole('button')).toHaveClass('h-11');
  });
  
  it('shows loading state', () => {
    const { getByRole } = render(<Button isLoading>Loading</Button>);
    expect(getByRole('button')).toBeDisabled();
  });
});
```

### Accessibility Tests

```typescript
// __tests__/accessibility.test.tsx
import { axe, toHaveNoViolations } from 'jest-axe';
import { render } from '@testing-library/react';

expect.extend(toHaveNoViolations);

describe('Accessibility', () => {
  it('Button has no accessibility violations', async () => {
    const { container } = render(<Button>Click</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  it('Input has associated label', () => {
    const { getByLabelText } = render(
      <Input id="test" label="Test Label" />
    );
    expect(getByLabelText('Test Label')).toBeInTheDocument();
  });
});
```

### Visual Regression Tests

```typescript
// __tests__/visual.test.tsx
import { render } from '@testing-library/react';

describe('Visual Regression', () => {
  it('Button primary state matches snapshot', () => {
    const { container } = render(<Button variant="primary">Submit</Button>);
    expect(container).toMatchSnapshot();
  });
  
  it('Card elevation renders correctly', () => {
    const { container } = render(
      <Card elevated>Elevated Card</Card>
    );
    expect(container).toMatchSnapshot();
  });
});
```

### Contrast Testing

```typescript
// __tests__/contrast.test.ts
import { Color } from 'polished';

// Helper function to test WCAG AA compliance
const getContrastRatio = (color1: string, color2: string): number => {
  // Implementation using WCAG formula
  // Returns contrast ratio (should be >= 4.5 for normal text)
  return ratio;
};

describe('Color Contrast Compliance', () => {
  it('Primary text meets WCAG AA standard', () => {
    const ratio = getContrastRatio('#0D1117', '#FFFFFF');
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });
  
  it('Secondary text meets WCAG AA standard', () => {
    const ratio = getContrastRatio('#57606A', '#FFFFFF');
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });
});
```

---

## Part 6: Performance Optimization Checklist

```
PERFORMANCE TARGETS
─────────────────────────────────────────

Metrics:
- First Contentful Paint (FCP):     < 1.8 seconds
- Largest Contentful Paint (LCP):   < 2.5 seconds
- Cumulative Layout Shift (CLS):    < 0.1
- Time to Interactive (TTI):        < 3.8 seconds

Bundle Size:
- CSS:         < 50 KB (gzipped)
- JS:          < 200 KB (gzipped per route)
- Images:      < 200 KB (gzipped per page)

Optimization Strategies:

☐ CSS
  ☐ Remove unused CSS (PurgeCSS/Tree-shake)
  ☐ Minify and gzip production builds
  ☐ Use CSS grid/flex instead of positioned elements
  ☐ GPU-accelerated animations (transform, opacity only)
  ☐ Reduce shadow/blur effects on animations

☐ JavaScript
  ☐ Code-split large components
  ☐ Lazy-load non-critical components
  ☐ Memoize expensive calculations
  ☐ Use React.lazy for route-based code splitting
  ☐ Remove console.logs in production

☐ Images
  ☐ Optimize and compress (TinyPNG, ImageOptim)
  ☐ Use WebP format with fallbacks
  ☐ Responsive images (srcset, sizes)
  ☐ Lazy-load below-fold images
  ☐ SVGs for icons (inline or external)

☐ Fonts
  ☐ Limit font weights (400, 600 primary)
  ☐ Subset fonts (Latin only for en-US)
  ☐ Use font-display: swap
  ☐ Load from CDN (Google Fonts or similar)

☐ Animations
  ☐ Use CSS animations, not JavaScript
  ☐ Limit animation on low-end devices
  ☐ Use transforms (translate, rotate, scale) not position
  ☐ Respect prefers-reduced-motion
```

---

## Part 7: Dark Mode CSS Media Query

### System Preference Detection

```css
/* Respects user's system dark mode preference */
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg-primary: #0D1117;
    --color-text-primary: #F0F6FC;
    /* ... dark mode values ... */
  }
}

/* User explicitly chose dark mode */
[data-theme="dark"] {
  --color-bg-primary: #0D1117;
  --color-text-primary: #F0F6FC;
  /* ... dark mode values ... */
}

/* Force light mode regardless of system preference */
[data-theme="light"] {
  --color-bg-primary: #FFFFFF;
  --color-text-primary: #0D1117;
  /* ... light mode values ... */
}
```

---

## Part 8: Accessibility Implementation

### ARIA Attributes for Components

```typescript
// Button with ARIA
<button
  aria-label="Save document"
  aria-pressed={isActive}
  aria-disabled={disabled}
>
  Save
</button>

// Form group with error
<div role="group" aria-labelledby="name-label">
  <label id="name-label">Name</label>
  <input aria-invalid={hasError} aria-describedby="name-error" />
  {hasError && <span id="name-error" role="alert">Name is required</span>}
</div>

// Modal dialog
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
  <h2 id="modal-title">Confirm Action</h2>
  <p id="modal-description">Are you sure?</p>
</div>
```

### Keyboard Navigation Setup

```typescript
// Skip to main content link
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>

// Tab order management
<div role="tablist">
  <button role="tab" aria-selected={true} tabIndex={0}>
    Tab 1
  </button>
  <button role="tab" aria-selected={false} tabIndex={-1}>
    Tab 2
  </button>
</div>

// Screen reader only text
<span className="sr-only">(required field)</span>
```

### Reduced Motion Support

```css
/* Disable animations for users who prefer reduced motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## Part 9: Deployment Checklist

Before shipping the design system:

```
DESIGN VERIFICATION
☐ All components tested in light and dark modes
☐ Responsive testing at 375px, 768px, 1024px, 1440px
☐ Contrast ratios verified (WCAG AA minimum 4.5:1)
☐ Touch targets 44px minimum on mobile
☐ No hardcoded colors (all use CSS variables)
☐ Hover/focus/active states on all interactive elements
☐ Loading and error states designed
☐ Empty states designed

CODE QUALITY
☐ TypeScript strict mode enabled
☐ ESLint rules configured
☐ Prettier formatting applied
☐ No console warnings
☐ No unused dependencies

PERFORMANCE
☐ CSS gzipped < 50KB
☐ JS bundle < 200KB
☐ Images optimized
☐ Lighthouse score > 90
☐ Core Web Vitals passing

ACCESSIBILITY
☐ Axe audit passing (0 violations)
☐ Keyboard navigation working
☐ Screen reader tested (NVDA, JAWS, VoiceOver)
☐ Color blind simulation passed
☐ ARIA labels on all controls
☐ Focus visible on all interactive elements

TESTING
☐ Unit tests > 80% coverage
☐ Component snapshot tests
☐ Visual regression tests
☐ E2E smoke tests
☐ Cross-browser tested (Chrome, Firefox, Safari, Edge)

DOCUMENTATION
☐ Component API documented
☐ Usage examples provided
☐ Design tokens documented
☐ Migration guide written (if replacing old design)
☐ Figma library exported and shared
```

---

## Implementation Timeline Estimate

```
Week 1: Foundation (Design Tokens + Basic Components)
  Mon-Tue: CSS variables, color system, typography tokens
  Wed-Thu: Button, Input, Checkbox, Toggle
  Fri:     Testing, refinement, documentation

Week 2: Navigation & Layout
  Mon-Tue: Sidebar, Top bar, Tabs
  Wed-Thu: Card, Modal, Dropdown
  Fri:     Dark mode implementation, testing

Week 3-4: Pages
  Week 3: Dashboard, Gap Analysis swimlanes
  Week 4: Team page, Reporting, Settings

Week 5: Polish & Testing
  Mon-Tue: Micro-interactions, animations
  Wed-Thu: Accessibility audit, responsive testing
  Fri:     Performance optimization, final QA

Week 6: Deployment
  Mon-Tue: Final testing, bug fixes
  Wed-Thu: Documentation, team training
  Fri:     Soft launch, monitoring
```

---

This implementation guide should be enough to get your development team started. Adjust timelines based on team size and complexity.
