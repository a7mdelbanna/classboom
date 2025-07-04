# ClassBoom Dark Theme Guidelines

## 🌓 Overview
ClassBoom supports both light and dark themes throughout the application. The theme system is powered by Tailwind CSS's dark mode support and custom CSS variables.

## 🎨 Core Principles

1. **Always provide dark mode variants** - Every UI element must work well in both light and dark themes
2. **Test both themes** - Check every component in both light and dark modes
3. **Maintain contrast** - Ensure text is readable and interactive elements are visible
4. **Consistent patterns** - Use the same dark mode approach across similar components

## 📋 Dark Theme Checklist

When creating or updating any component, ensure ALL of these elements have dark theme support:

### Text Colors
- `text-gray-900` → `dark:text-white` (primary text)
- `text-gray-800` → `dark:text-gray-200` (strong text)
- `text-gray-700` → `dark:text-gray-300` (regular text)
- `text-gray-600` → `dark:text-gray-400` (secondary text)
- `text-gray-500` → `dark:text-gray-400` (muted text)
- `text-gray-400` → `dark:text-gray-500` (subtle text)

### Background Colors
- `bg-white` → `dark:bg-gray-800` (cards, modals)
- `bg-gray-50` → `dark:bg-gray-800` (subtle backgrounds)
- `bg-gray-100` → `dark:bg-gray-700` (hover states)
- Page backgrounds: `bg-gray-50` → `dark:bg-gray-900`

### Border Colors
- `border-gray-200` → `dark:border-gray-700` (normal borders)
- `border-gray-300` → `dark:border-gray-600` (emphasized borders)
- `border-gray-100` → `dark:border-gray-700` (subtle borders)

### Form Elements
```jsx
// Input fields
className="border border-gray-300 dark:border-gray-600 
          bg-white dark:bg-gray-700 
          text-gray-900 dark:text-white"

// Select dropdowns
className="border border-gray-300 dark:border-gray-600 
          bg-white dark:bg-gray-800 
          text-gray-900 dark:text-white"

// Labels
className="text-gray-700 dark:text-gray-300"
```

### Status Colors
- Success: `bg-green-100 dark:bg-green-900/20`, `text-green-800 dark:text-green-300`
- Warning: `bg-orange-100 dark:bg-orange-900/20`, `text-orange-800 dark:text-orange-300`
- Error: `bg-red-100 dark:bg-red-900/20`, `text-red-800 dark:text-red-300`
- Info: `bg-blue-100 dark:bg-blue-900/20`, `text-blue-800 dark:text-blue-300`

### Interactive Elements
- Hover states: `hover:bg-gray-100 dark:hover:bg-gray-700`
- Active states: `bg-gray-200 dark:bg-gray-600`
- Focus rings: `focus:ring-orange-500/20 dark:focus:ring-orange-400/20`

## 🧩 Component Examples

### Cards
```jsx
<div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Title</h3>
  <p className="text-gray-600 dark:text-gray-400">Description</p>
</div>
```

### Buttons
```jsx
// Primary Button
<button className="bg-orange-500 hover:bg-orange-600 text-white">
  Primary Action
</button>

// Secondary Button
<button className="bg-gray-200 dark:bg-gray-700 
                   hover:bg-gray-300 dark:hover:bg-gray-600 
                   text-gray-700 dark:text-gray-200">
  Secondary Action
</button>
```

### Modal/Dialog
```jsx
<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl">
  <div className="border-b border-gray-200 dark:border-gray-700">
    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Modal Title</h2>
  </div>
  <div className="p-6">
    <p className="text-gray-600 dark:text-gray-400">Modal content</p>
  </div>
</div>
```

## 🛠️ Implementation Tips

1. **Use the Theme Context**
   ```jsx
   import { useTheme } from '../context/ThemeContext';
   const { isDarkMode } = useTheme();
   ```

2. **Dynamic Classes for Complex Logic**
   ```jsx
   className={`
     ${isDarkMode ? 'bg-gray-800' : 'bg-white'}
     ${isDarkMode ? 'text-white' : 'text-gray-900'}
   `}
   ```

3. **CSS Variables for Theme Colors**
   - `var(--classboom-primary)` - Primary brand color
   - `var(--classboom-secondary)` - Secondary brand color
   - These automatically adjust based on the selected theme

## ⚠️ Common Mistakes to Avoid

1. **Missing dark variants** - Always add dark: classes
2. **Poor contrast** - Test readability in dark mode
3. **Hardcoded colors** - Use Tailwind classes instead of hex values
4. **Forgetting hover/focus states** - These need dark variants too
5. **Missing border colors** - Borders often disappear in dark mode without proper colors

## 🧪 Testing Dark Theme

1. Toggle dark mode using the theme switch in the header
2. Check all text is readable
3. Verify all interactive elements are visible
4. Test form inputs and buttons
5. Check hover and focus states
6. Verify status messages and alerts
7. Test in different screen sizes

## 📝 Quick Reference

| Light Mode | Dark Mode | Usage |
|------------|-----------|--------|
| `text-gray-900` | `dark:text-white` | Primary headings |
| `text-gray-700` | `dark:text-gray-300` | Body text |
| `text-gray-500` | `dark:text-gray-400` | Muted text |
| `bg-white` | `dark:bg-gray-800` | Cards/containers |
| `bg-gray-50` | `dark:bg-gray-900` | Page background |
| `border-gray-200` | `dark:border-gray-700` | Borders |

Remember: When in doubt, check existing components for patterns and consistency!