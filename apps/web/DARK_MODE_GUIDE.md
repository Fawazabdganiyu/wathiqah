# Dark Mode Style Guide

This project uses a semantic token system to manage colors across Light and Dark modes. Instead of hardcoding colors like `bg-white` or `text-neutral-900`, we use semantic names that automatically adapt to the current theme.

## Core Semantic Tokens

### Backgrounds

- **`bg-background`**: The main page background. (White in Light, Dark Neutral in Dark)
- **`bg-card`**: Background for cards, modals, and isolated sections. (White in Light, Slightly lighter Neutral in Dark)
- **`bg-muted`**: Background for secondary content, inputs (sometimes), or subdued areas. (Light Grey in Light, Dark Grey in Dark)
- **`bg-primary`**: The main brand color. (Emerald in Light, Emerald in Dark)
- **`bg-secondary`**: Alternative brand color.
- **`bg-destructive`**: Background for error states or destructive actions.

### Text

- **`text-foreground`**: Primary text color. (Almost Black in Light, White in Dark)
- **`text-muted-foreground`**: Secondary text color. (Grey in Light, Lighter Grey in Dark)
- **`text-primary`**: Brand colored text.
- **`text-primary-foreground`**: Text that sits on top of `bg-primary`.
- **`text-destructive`**: Text color for errors.

### Borders

- **`border-border`**: Default border color.
- **`border-input`**: Border color for form inputs.

## Color Palette (OKLCH)

The project uses the `oklch` color space for better perceptional uniformity.

### Light Mode

- **Background**: `oklch(1 0 0)` (White)
- **Foreground**: `oklch(0.141 0.005 285.823)` (Neutral 950)
- **Primary**: `oklch(0.511 0.162 144.35)` (Emerald 600)

### Dark Mode

- **Background**: `oklch(0.12 0.005 285.823)` (~Neutral 950)
- **Foreground**: `oklch(0.985 0 0)` (White)
- **Card**: `oklch(0.17 0.005 285.823)` (~Neutral 900)
- **Primary**: `oklch(0.707 0.165 154.834)` (Emerald 400)

## How to Apply

### Do's

```tsx
// ✅ Correct
<div className="bg-card text-card-foreground border border-border rounded-xl p-4">
  <h2 className="text-foreground">Title</h2>
  <p className="text-muted-foreground">Description</p>
  <Button className="bg-primary text-primary-foreground">Action</Button>
</div>
```

### Don'ts

```tsx
// ❌ Avoid Hardcoded Colors
<div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4">
  <h2 className="text-neutral-900 dark:text-white">Title</h2>
  <p className="text-neutral-500">Description</p>
  <Button className="bg-emerald-600 text-white">Action</Button>
</div>
```

## Accessibility (WCAG 2.1 AA)

- The `text-foreground` on `bg-background` ensures a contrast ratio > 4.5:1.
- `text-muted-foreground` is carefully selected to maintain readability while being distinct from primary text.
- `bg-primary` buttons use `text-primary-foreground` (usually white or very dark) to ensure contrast.

## Updating the Theme

To modify the theme colors, edit `apps/web/src/styles.css`. The variables are defined in the `:root` and `.dark` blocks.
