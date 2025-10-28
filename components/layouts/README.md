# SlaidAI Layout System - Slide Type Organization

A revolutionary layout system that organizes components by **slide type**, with each slide type containing multiple **layout variants** for maximum flexibility and organization.

## 🏗️ **System Architecture**

### **Slide Type Structure**
```
layouts/
├── Cover/                  ← Slide Type
│   ├── Cover_Hero.tsx      ← Layout Variant
│   ├── Cover_Split.tsx     ← Layout Variant
│   ├── Cover_Minimal.tsx   ← Layout Variant
│   ├── Cover_ImageLeft.tsx ← Layout Variant
│   ├── Cover_ImageRight.tsx← Layout Variant
│   ├── Cover_FullBackground.tsx ← Layout Variant
│   ├── Cover_Centered.tsx  ← Layout Variant
│   └── index.ts           ← Exports & Dynamic Mapping
├── Content/               ← Future Slide Type
├── Comparison/            ← Future Slide Type
├── Dashboard/             ← Future Slide Type
└── index.ts              ← Main System Index
```

## 🎯 **Current Implementation: Cover Slide Type**

### **Cover Layout Variants**

| Variant | File | Purpose |
|---------|------|---------|
| **Hero** | `Cover_Hero.tsx` | Hero-style cover layouts |
| **Split** | `Cover_Split.tsx` | Split-screen cover layouts |
| **Minimal** | `Cover_Minimal.tsx` | Clean, minimal cover layouts |
| **ImageLeft** | `Cover_ImageLeft.tsx` | Image on left, content on right |
| **ImageRight** | `Cover_ImageRight.tsx` | Image on right, content on left |
| **FullBackground** | `Cover_FullBackground.tsx` | Full background image/color |
| **Centered** | `Cover_Centered.tsx` | Centered content layouts |

### **Naming Convention**
- **File Name**: `Cover_[VariantName].tsx`
- **Component Name**: `Cover_[VariantName]`
- **Props Interface**: `Cover[VariantName]Props`

## 🔧 **Dynamic Loading System**

### **Component Mapping**
```typescript
// Get a specific Cover layout component
import { getCoverLayoutComponent } from './Cover';
const HeroLayout = getCoverLayoutComponent('Cover_Hero');

// Get any layout component
import { getLayoutComponent } from './layouts';
const Component = getLayoutComponent('Cover_Split');
```

### **Runtime Validation**
```typescript
// Check if a layout variant exists
import { isValidLayoutVariant } from './layouts';
if (isValidLayoutVariant('Cover_Hero')) {
  // Safe to use
}

// Get slide type from layout name
import { getSlideTypeFromLayout } from './layouts';
const slideType = getSlideTypeFromLayout('Cover_Hero'); // 'Cover'
```

## 📋 **Available Exports**

### **From `layouts/Cover/index.ts`:**
```typescript
// Individual components
export { Cover_Hero, Cover_Split, Cover_Minimal, ... }

// Type definitions
export type { CoverHeroProps, CoverSplitProps, ... }

// Dynamic mapping
export const CoverLayoutMap = { ... }
export type CoverLayoutVariant = keyof typeof CoverLayoutMap
export const CoverLayoutVariants: CoverLayoutVariant[]

// Helper functions
export function getCoverLayoutComponent(variant: CoverLayoutVariant)
export function isCoverLayoutVariant(variant: string)
```

### **From `layouts/index.ts`:**
```typescript
// All Cover exports
export * from './Cover'

// System-wide mapping
export const AllLayoutsMap = { ... }
export type AllLayoutVariant = keyof typeof AllLayoutsMap
export type SlideType = 'Cover' // | 'Content' | ...

// System configuration
export const SlideTypeConfig = { ... }

// Helper functions
export function getLayoutComponent(layoutName: AllLayoutVariant)
export function getSlideTypeFromLayout(layoutName: string)
export function isValidLayoutVariant(variant: string)
```

## 🚀 **Usage Examples**

### **Direct Import**
```tsx
import { Cover_Hero } from '../layouts/Cover';

<Cover_Hero className="custom-styling">
  {/* Content will go here */}
</Cover_Hero>
```

### **Dynamic Loading**
```tsx
import { getLayoutComponent } from '../layouts';

const layoutName = 'Cover_Split'; // From AI or user selection
const LayoutComponent = getLayoutComponent(layoutName);

<LayoutComponent>
  {/* Dynamic content */}
</LayoutComponent>
```

### **Validation & Safety**
```tsx
import { isValidLayoutVariant, getLayoutComponent } from '../layouts';

function renderLayout(layoutName: string, content: React.ReactNode) {
  if (!isValidLayoutVariant(layoutName)) {
    return <div>Invalid layout: {layoutName}</div>;
  }
  
  const LayoutComponent = getLayoutComponent(layoutName);
  return <LayoutComponent>{content}</LayoutComponent>;
}
```

## 🎪 **Benefits of This System**

### **Organization**
- ✅ **Clear categorization** by slide type
- ✅ **Consistent naming** convention
- ✅ **Scalable structure** for future slide types

### **Flexibility**
- ✅ **Multiple variants** per slide type
- ✅ **Dynamic component loading**
- ✅ **Type-safe** variant selection

### **Maintainability**
- ✅ **Isolated components** - each variant is self-contained
- ✅ **Easy to extend** - add new variants or slide types
- ✅ **Clean imports** - organized export system

### **AI-Friendly**
- ✅ **Predictable naming** - AI can easily generate variant names
- ✅ **Runtime validation** - safe dynamic loading
- ✅ **Clear structure** - AI understands the organization

## 🔮 **Future Expansion**

### **Planned Slide Types**
- **Content** - Standard content slide layouts
- **Comparison** - Side-by-side comparison layouts  
- **Dashboard** - Data visualization and dashboard layouts
- **Timeline** - Sequential and timeline layouts
- **Portfolio** - Showcase and portfolio layouts

### **Adding New Slide Types**
1. Create new folder: `layouts/[SlideType]/`
2. Add variant components: `[SlideType]_[Variant].tsx`
3. Create index file with exports and mapping
4. Update main `layouts/index.ts` with new slide type
5. Add to `SlideTypeConfig` for AI integration

### **Adding New Variants**
1. Create component file: `[SlideType]_[NewVariant].tsx`
2. Add to slide type's `index.ts` exports
3. Update variant arrays and mappings
4. Test dynamic loading functionality

---

## 📝 **Current Status**

✅ **Cover Slide Type**: Structure created with 7 layout variants  
⏳ **Implementation**: Layout logic to be added in next phase  
⏳ **Integration**: LayoutBlock.tsx integration pending  
⏳ **AI Integration**: System prompt updates pending  

**The foundation is ready for implementing actual layout logic and AI integration!** 🎯✨ 