# LayoutBlock - Precision Canvas-Fitted Layout System

A revolutionary layout component designed to fit **exactly** within slide canvas dimensions with **zero overflow or distortion**. Built for precise positioning and perfect content block placement.

## 🎯 **Core Purpose**

This LayoutBlock is specifically engineered to:
- **Fit exactly** within specified canvas dimensions (e.g., 1920x1080px)
- **Prevent overflow** and content distortion
- **Enable precise positioning** of content blocks (text, images, charts)
- **Maintain perfect proportions** across different screen sizes

## 📐 **Key Features**

### **Exact Dimension Control**
- Uses pixel-perfect width and height values
- No responsive scaling that could cause distortion
- Guaranteed fit within canvas boundaries

### **Overflow Prevention**
- Built-in `overflow-hidden` to prevent content spillage
- Precise gap control between layout sections
- Content stays within defined boundaries

### **Precision Positioning**
- Exact spacing values in pixels (8px, 16px, 24px, 32px)
- Perfect alignment control (start, center, end)
- Predictable layout behavior

## 🏗️ **Layout Variants**

### **Single Column** (`variant="single"`)
- Full canvas single column layout
- Perfect for centered content, titles, or focus slides
- Content vertically and horizontally centered

### **Split Layout** (`variant="split"`)
- Precise 50/50 horizontal split
- Perfect for side-by-side content
- Each half gets exactly half the canvas width

### **Grid Layout** (`variant="grid"`)
- 2x2 grid with equal quadrants
- Each section gets exactly 1/4 of canvas space
- Perfect for dashboards or comparison slides

### **Hero Layout** (`variant="hero"`)
- Stacked vertical layout with flexible content areas
- Great for title slides with multiple content sections
- Maintains vertical spacing precision

### **Stack Layout** (`variant="stack"`)
- Simple vertical stacking
- Perfect for lists or sequential content
- Controlled spacing between elements

## 🎛️ **Props Reference**

### **Required Props**
- `variant: 'single' | 'split' | 'grid' | 'hero' | 'stack'` - Layout structure
- `children: React.ReactNode` - Content to render

### **Canvas Control**
- `canvasWidth?: number` - Exact width in pixels (default: 1920)
- `canvasHeight?: number` - Exact height in pixels (default: 1080)
- `fullCanvas?: boolean` - Use full canvas dimensions (default: true)

### **Spacing & Alignment**
- `spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg'` - Internal spacing (default: 'md')
  - `none`: 0px
  - `xs`: 8px
  - `sm`: 16px
  - `md`: 24px
  - `lg`: 32px
- `contentAlign?: 'start' | 'center' | 'end'` - Content alignment (default: 'center')
- `className?: string` - Additional CSS classes

## 💡 **Usage Examples**

### **Standard Presentation Canvas**
```jsx
<LayoutBlock
  variant="single"
  canvasWidth={1920}
  canvasHeight={1080}
  spacing="lg"
>
  <TextBlock variant="title">Perfect Fit Title</TextBlock>
  <TextBlock variant="body">Content fits exactly within 1920x1080</TextBlock>
</LayoutBlock>
```

### **Split Screen Layout**
```jsx
<LayoutBlock
  variant="split"
  canvasWidth={1920}
  canvasHeight={1080}
  spacing="md"
>
  <div className="flex-1">
    {/* Left half - exactly 960px wide */}
    <TextBlock>Left content</TextBlock>
  </div>
  <div className="flex-1">
    {/* Right half - exactly 960px wide */}
    <ImageBlock src="/image.jpg" size="full" />
  </div>
</LayoutBlock>
```

### **Dashboard Grid**
```jsx
<LayoutBlock
  variant="grid"
  canvasWidth={1200}
  canvasHeight={800}
  spacing="sm"
>
  <div>{/* Top-left: 600x400px */}</div>
  <div>{/* Top-right: 600x400px */}</div>
  <div>{/* Bottom-left: 600x400px */}</div>
  <div>{/* Bottom-right: 600x400px */}</div>
</LayoutBlock>
```

### **Custom Dimensions**
```jsx
<LayoutBlock
  variant="hero"
  canvasWidth={800}
  canvasHeight={600}
  spacing="lg"
  contentAlign="start"
>
  <TextBlock variant="title">Custom Canvas</TextBlock>
  <TextBlock variant="body">Fits exactly in 800x600 space</TextBlock>
</LayoutBlock>
```

## 🎨 **Design Principles**

### **Pixel Perfect**
- All dimensions use exact pixel values
- No percentage-based sizing that could cause rounding errors
- Predictable behavior across all browsers

### **Canvas-First Design**
- Layout designed around specific canvas dimensions
- Content blocks positioned with precision
- No guesswork about final positioning

### **Content Block Ready**
- Perfect foundation for placing TextBlocks, ImageBlocks, etc.
- Precise spacing ensures content doesn't overlap
- Clean separation between layout and content

## 🔧 **Technical Implementation**

### **Dimension Calculation**
```typescript
const containerStyle = fullCanvas ? {
  width: `${canvasWidth}px`,
  height: `${canvasHeight}px`,
  maxWidth: `${canvasWidth}px`,
  maxHeight: `${canvasHeight}px`,
  minWidth: `${canvasWidth}px`,
  minHeight: `${canvasHeight}px`,
  gap: `${getSpacing(spacing)}px`
} : {
  gap: `${getSpacing(spacing)}px`
};
```

### **Overflow Control**
- `overflow-hidden` prevents content spillage
- Exact min/max dimensions ensure no stretching
- Gap spacing calculated in pixels for precision

### **Layout Variants**
Each variant uses specific CSS Grid or Flexbox configurations:
- **Single**: `flex flex-col` (vertical stack)
- **Split**: `flex flex-row` (horizontal split)
- **Grid**: `grid grid-cols-2 grid-rows-2` (2x2 grid)
- **Hero**: `flex flex-col` (vertical with flex-grow)
- **Stack**: `flex flex-col` (simple vertical stack)

## 🚀 **Benefits for Slide Design**

### **Predictable Positioning**
- Know exactly where content will appear
- No surprises with responsive scaling
- Perfect for design mockups and prototypes

### **Content Block Precision**
- TextBlocks positioned exactly where intended
- ImageBlocks fit perfectly within allocated space
- Charts and graphs maintain exact proportions

### **Professional Results**
- Slides look identical across all devices
- No distortion or overflow issues
- Clean, professional presentation layouts

## 📏 **Common Canvas Sizes**

| Format | Width | Height | Aspect Ratio | Use Case |
|--------|-------|--------|--------------|----------|
| Full HD | 1920 | 1080 | 16:9 | Standard presentations |
| HD | 1280 | 720 | 16:9 | Web presentations |
| 4K | 3840 | 2160 | 16:9 | High-res displays |
| Square | 1080 | 1080 | 1:1 | Social media |
| Portrait | 1080 | 1920 | 9:16 | Mobile presentations |

## 🎯 **Best Practices**

### **Choose Appropriate Variants**
- **Single**: For focused content, titles, quotes
- **Split**: For comparisons, before/after, text + image
- **Grid**: For dashboards, multiple data points
- **Hero**: For landing pages, title slides
- **Stack**: For lists, sequential content

### **Spacing Guidelines**
- **None**: When you need maximum space utilization
- **XS**: For tight, compact layouts
- **SM**: For standard spacing
- **MD**: For comfortable reading (recommended)
- **LG**: For generous whitespace, premium feel

### **Content Sizing**
- Size content blocks relative to canvas dimensions
- Use percentage widths within layout sections
- Consider text scaling for different canvas sizes

## 🔄 **Migration from Old System**

If migrating from the previous layout system:

```jsx
// OLD: Responsive layout with potential overflow
<div className="min-h-screen flex">
  <div className="w-1/2">Content</div>
  <div className="w-1/2">Content</div>
</div>

// NEW: Precision canvas-fitted layout
<LayoutBlock
  variant="split"
  canvasWidth={1920}
  canvasHeight={1080}
  spacing="md"
>
  <div>Content</div>
  <div>Content</div>
</LayoutBlock>
```

## 🎪 **Perfect for AI Generation**

This LayoutBlock system is ideal for AI-controlled presentations because:
- **Predictable behavior** - AI knows exactly what dimensions to expect
- **No overflow surprises** - Content always fits within bounds
- **Precise positioning** - AI can calculate exact placement
- **Clean API** - Simple props that AI can easily generate

---

**The LayoutBlock system provides the foundation for pixel-perfect slide design with complete dimensional control and zero overflow issues.** 🎯✨ 