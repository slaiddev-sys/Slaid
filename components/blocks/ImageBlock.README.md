# ImageBlock Component

A simple, flexible image component designed for AI-controlled presentations. This component replaces the complex variant-based system with clear, predictable props.

## Features

- **Simple API**: 8 clear props instead of complex variant logic
- **AI-Optimized**: Predictable behavior perfect for AI-controlled presentations
- **Semantic HTML**: Uses `<figure>` and `<figcaption>` for proper structure
- **Responsive**: Built-in responsive sizing and alignment
- **TypeScript**: Fully typed with clear interfaces

## Props

### Required
- `src: string` - Image URL
- `alt: string` - Alt text for accessibility

### Optional
- `size?: "xs" | "sm" | "md" | "lg" | "xl" | "full"` - Image size (default: "md")
- `fit?: "cover" | "contain" | "fill" | "scale-down"` - How image fits container (default: "cover")
- `align?: "left" | "center" | "right"` - Image alignment (default: "center")
- `rounded?: boolean | "sm" | "md" | "lg" | "xl" | "full"` - Border radius control (default: false)
- `shadow?: boolean` - Enable/disable shadow (default: false)
- `shadowColor?: string` - Custom shadow color in HEX format (e.g., "#2563eb", "#f97316")
- `caption?: string` - Optional caption below image
- `className?: string` - Additional CSS classes
- `onClick?: () => void` - Click handler

## Size Reference

| Size | Max Width | Use Case |
|------|-----------|----------|
| `xs` | 96px | Very small thumbnails, icons |
| `sm` | 160px | Small images, avatars |
| `md` | 256px | Standard content images (default) |
| `lg` | 320px | Featured images |
| `xl` | 384px | Hero images, showcases |
| `full` | 100% | Responsive full-width |

## Usage Examples

### Basic Image
```jsx
<ImageBlock 
  src="/images/photo.jpg" 
  alt="Description" 
/>
```
*Result: 256px centered image*

### Small Icon
```jsx
<ImageBlock 
  src="/images/icon.png" 
  alt="Feature icon" 
  size="xs" 
  fit="contain" 
/>
```
*Result: 96px icon that scales to fit*

### Hero Banner
```jsx
<ImageBlock 
  src="/images/hero.jpg" 
  alt="Company hero" 
  size="xl" 
  fit="cover" 
/>
```
*Result: 384px hero image that fills container*

### Profile Photo with Caption
```jsx
<ImageBlock 
  src="/images/profile.jpg" 
  alt="Team member" 
  size="md" 
  rounded={true} 
  shadow={true} 
  caption="John Smith, CEO" 
/>
```
*Result: Rounded 256px profile with shadow and caption*

### Left-Aligned Logo
```jsx
<ImageBlock 
  src="/images/logo.png" 
  alt="Company logo" 
  size="sm" 
  align="left" 
  fit="contain" 
/>
```
*Result: 160px logo aligned to left*

### Full-Width Banner
```jsx
<ImageBlock 
  src="/images/banner.jpg" 
  alt="Company banner" 
  size="full" 
  fit="cover" 
/>
```
*Result: 100% width banner*

### Custom Shadow Colors
```jsx
<ImageBlock 
  src="/images/product.jpg" 
  alt="Product showcase" 
  size="md" 
  shadow={true} 
  shadowColor="#2563eb" 
/>
```
*Result: Product image with blue brand shadow*

```jsx
<ImageBlock 
  src="/images/profile.jpg" 
  alt="Team member" 
  size="lg" 
  rounded="full" 
  shadow={true} 
  shadowColor="#f97316" 
/>
```
*Result: Circular profile photo with warm orange glow*

```jsx
<ImageBlock 
  src="/images/artwork.jpg" 
  alt="Featured artwork" 
  size="xl" 
  shadow={true} 
  shadowColor="#a855f7" 
  caption="Exhibition Piece" 
/>
```
*Result: Large artwork with purple accent shadow and caption*

## AI Integration

This component is optimized for AI-controlled presentations with:

### Predictable Props
- AI knows exactly what props to use
- No complex variant decision trees
- Clear prop names and values

### Simple Decision Making
- "Make image small" → `size="sm"`
- "Add rounded photo" → `rounded={true}`
- "Create full banner" → `size="full", fit="cover"`
- "Align logo left" → `align="left"`
- "Add shadow to image" → `shadow={true}`
- "Give it a blue shadow" → `shadow={true}, shadowColor="#2563eb"`
- "Make it glow orange" → `shadow={true}, shadowColor="#f97316"`

### Consistent Output
- Always predictable HTML structure
- Semantic `<figure>` with `<figcaption>` when caption provided
- Consistent class application

## Migration from Old Variant System

### Before (Complex)
```jsx
<ImageBlock 
  variant="product" 
  aspectRatio="square" 
  objectFit="contain" 
  size="lg" 
  src="/images/product.jpg" 
  alt="Product" 
/>
```

### After (Simple)
```jsx
<ImageBlock 
  src="/images/product.jpg" 
  alt="Product" 
  size="lg" 
  fit="contain" 
  shadow={true} 
/>
```

## HTML Output

### Without Caption
```html
<div class="max-w-64 mx-auto">
  <img 
    src="/images/photo.jpg" 
    alt="Description" 
    class="w-full h-auto object-cover" 
    loading="lazy"
  />
</div>
```

### With Caption
```html
<figure class="max-w-64 mx-auto">
  <img 
    src="/images/photo.jpg" 
    alt="Description" 
    class="w-full h-auto object-cover rounded-xl shadow-md" 
    loading="lazy"
  />
  <figcaption class="mt-2 text-center text-gray-600 text-sm">
    Photo caption
  </figcaption>
</figure>
```

## Benefits

✅ **80% Less Complex** - Single component logic instead of 7 variant branches  
✅ **AI-Friendly** - Predictable props perfect for AI control  
✅ **Developer-Friendly** - Clear, obvious prop names  
✅ **Maintainable** - Single source of truth for image rendering  
✅ **Semantic** - Proper HTML structure with figure/figcaption  
✅ **Flexible** - Handles all image use cases with simple props  

## TypeScript Interface

```typescript
export interface ImageBlockProps {
  src: string;
  alt: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  fit?: 'cover' | 'contain' | 'fill' | 'scale-down';
  align?: 'left' | 'center' | 'right';
  rounded?: boolean;
  shadow?: boolean;
  caption?: string;
  className?: string;
  onClick?: () => void;
}
```

This refactored ImageBlock component provides all the flexibility you need with a simple, predictable API that's perfect for both AI-controlled presentations and manual usage! 