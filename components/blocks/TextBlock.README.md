# TextBlock Component

A versatile text component optimized for AI-generated presentations in SlaidAI. Built with TypeScript, React, and Tailwind CSS for professional typography and responsive design.

## Features

- 🎯 **AI-Optimized**: Designed specifically for Claude Sonnet-generated content  
- 📱 **Responsive**: Scales beautifully across all device sizes
- 🎨 **Flexible Styling**: Multiple variants, colors, and alignment options
- ♿ **Accessible**: Uses semantic HTML elements (h1, h2, p) for proper document structure
- 🔧 **TypeScript**: Full type safety and IntelliSense support

## Installation

```tsx
import TextBlock from '@/components/blocks/TextBlock';
```

## Basic Usage

```tsx
// Simple body text
<TextBlock>
  This is basic body text content.
</TextBlock>

// Title with center alignment
<TextBlock variant="title" align="center">
  Presentation Title
</TextBlock>

// Heading with custom color
<TextBlock variant="heading" color="text-blue-600">
  Section Heading
</TextBlock>
```

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | - | The text content to display (**required**) |
| `variant` | `'title' \| 'heading' \| 'body' \| 'caption'` | `'body'` | Text size and weight variant |
| `align` | `'left' \| 'center' \| 'right'` | `'left'` | Text alignment |
| `color` | `string` | `'text-gray-900'` | Text color (Tailwind class) |
| `className` | `string` | - | Additional CSS classes |

### Variants

#### `title`
- **Element**: `<h1>`
- **Size**: `text-4xl md:text-5xl lg:text-6xl`
- **Weight**: `font-bold`
- **Use case**: Main slide titles, presentation headers

#### `heading`  
- **Element**: `<h2>`
- **Size**: `text-2xl md:text-3xl lg:text-4xl`
- **Weight**: `font-semibold`
- **Use case**: Section headings, slide subtitles

#### `body`
- **Element**: `<p>`
- **Size**: `text-base md:text-lg`
- **Weight**: `normal`
- **Use case**: Main content, paragraphs, descriptions

#### `caption`
- **Element**: `<p>`
- **Size**: `text-sm md:text-base`
- **Weight**: `normal`
- **Opacity**: `text-opacity-80`
- **Use case**: Image captions, footnotes, supplementary text

## Examples

### All Variants

```tsx
<TextBlock variant="title">
  Main Presentation Title
</TextBlock>

<TextBlock variant="heading">
  Section Heading
</TextBlock>

<TextBlock variant="body">
  This is the main content of your slide. It provides detailed information 
  and explanations that support your presentation narrative.
</TextBlock>

<TextBlock variant="caption">
  Source: SlaidAI Analytics 2024
</TextBlock>
```

### Alignment Options

```tsx
<TextBlock variant="title" align="left">Left Aligned Title</TextBlock>
<TextBlock variant="title" align="center">Centered Title</TextBlock>
<TextBlock variant="title" align="right">Right Aligned Title</TextBlock>
```

### Color Variations

```tsx
{/* Standard colors */}
<TextBlock color="text-gray-900">Default dark text</TextBlock>
<TextBlock color="text-blue-600">Blue accent text</TextBlock>
<TextBlock color="text-green-700">Success text</TextBlock>
<TextBlock color="text-red-500">Error text</TextBlock>

{/* Light colors for dark backgrounds */}
<TextBlock color="text-white">White text</TextBlock>
<TextBlock color="text-gray-100">Light gray text</TextBlock>
<TextBlock color="text-gray-300">Muted light text</TextBlock>
```

### Dark Background Usage

```tsx
<div className="bg-gray-900 p-8 rounded-lg">
  <TextBlock variant="title" color="text-white" align="center">
    Dark Theme Title
  </TextBlock>
  
  <TextBlock variant="body" color="text-gray-100">
    Content that's readable on dark backgrounds with proper contrast.
  </TextBlock>
  
  <TextBlock variant="caption" color="text-gray-300">
    Muted caption text
  </TextBlock>
</div>
```

### Custom Styling

```tsx
<TextBlock 
  variant="heading"
  className="font-mono bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500"
  color="text-blue-800"
>
  Custom Styled Heading
</TextBlock>
```

## AI Integration

### Claude Sonnet Usage

When generating presentations with Claude, use these patterns:

```json
{
  "type": "TextBlock",
  "props": {
    "variant": "title",
    "align": "center",
    "color": "text-white",
    "children": "AI-Generated Title"
  }
}
```

### Recommended AI Prompts

- **Titles**: `variant="title"` with `align="center"`
- **Headings**: `variant="heading"` for section breaks
- **Content**: `variant="body"` for main text blocks
- **Credits**: `variant="caption"` with muted colors

## Responsive Behavior

The component automatically scales across breakpoints:

- **Mobile** (`default`): Base text sizes
- **Tablet** (`md:`): Increased sizes for better readability
- **Desktop** (`lg:`): Maximum sizes for large displays

## Accessibility

- Uses semantic HTML elements (`h1`, `h2`, `p`)
- Maintains proper heading hierarchy
- Ensures sufficient color contrast ratios
- Supports screen readers and keyboard navigation

## Best Practices

### ✅ Do

- Use `title` variant sparingly (one per slide)
- Maintain proper heading hierarchy (title → heading → body)
- Choose colors with sufficient contrast
- Use `caption` for supplementary information

### ❌ Don't

- Use multiple `title` variants on the same slide
- Skip heading levels (title → body without heading)
- Use low-contrast color combinations
- Override semantic elements unnecessarily

## Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)  
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- Lightweight: No external dependencies
- Fast rendering: Optimized CSS classes
- Tree-shakeable: Import only what you need
- Minimal bundle impact: ~2KB gzipped

---

**Built for SlaidAI** - Professional presentations powered by Claude Sonnet 4 