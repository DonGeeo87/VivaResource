# UI Components - Viva Resource Foundation

Componentes reutilizables para mantener consistencia en todo el frontend.

## Button

```tsx
import { Button } from "@/components/ui";

// Variantes
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>

// Tamaños
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// Con iconos
<Button leftIcon={<Icon />}>Left Icon</Button>
<Button rightIcon={<Icon />}>Right Icon</Button>

// Full width
<Button fullWidth>Full Width</Button>
```

## Card

```tsx
import { Card } from "@/components/ui";

// Variantes
<Card variant="default">Default shadow</Card>
<Card variant="elevated">Elevated shadow</Card>
<Card variant="outlined">Bordered</Card>

// Padding
<Card padding="none">No padding</Card>
<Card padding="sm">Small padding</Card>
<Card padding="md">Medium padding</Card>
<Card padding="lg">Large padding</Card>

// Hover effect
<Card hover>Elevates on hover</Card>
```

## Input

```tsx
import { Input } from "@/components/ui";

// Básico
<Input label="Email" type="email" placeholder="Enter email" />

// Con error
<Input label="Email" error="Invalid email address" />

// Con helper text
<Input label="Email" helperText="We'll never share your email" />

// Con iconos
<Input label="Search" leftIcon={<Search />} />
<Input label="Password" rightIcon={<Eye />} />
```

## Hero

```tsx
import { Hero } from "@/components/ui";

// Gradient (default)
<Hero title="Title" subtitle="Subtitle" badge="Badge" />

// Con imagen de fondo
<Hero
  variant="image"
  backgroundImage="https://..."
  title="Title"
  subtitle="Subtitle"
  badge="Badge"
/>

// Con children (botones, etc.)
<Hero title="Title" subtitle="Subtitle">
  <Button>CTA</Button>
  <Button variant="outline">Secondary</Button>
</Hero>

// Centrado
<Hero title="Title" align="center" />
```

## Guías de Uso

### ✅ DO
- Usar estos componentes en lugar de estilos inline
- Usar variantes en lugar de custom classes
- Mantener la consistencia en toda la app

### ❌ DON'T
- No usar `bg-[#025689]` - usar `bg-primary`
- No usar `text-[#1a1c1c]` - usar `text-on-surface`
- No crear botones con estilos custom repetidos
