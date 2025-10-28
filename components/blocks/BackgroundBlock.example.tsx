import BackgroundBlock from './BackgroundBlock';
import TextBlock from './TextBlock';

export default function BackgroundBlockExamples() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold mb-4">BackgroundBlock Examples</h1>
      
      {/* Solid Color Example */}
      <div className="relative w-full h-64 border border-gray-300 rounded-lg overflow-hidden">
        <BackgroundBlock color="bg-blue-500">
          <TextBlock 
            variant="title" 
            color="text-white" 
            align="center"
            className="pt-20"
          >
            Solid Blue Background
          </TextBlock>
        </BackgroundBlock>
      </div>

      {/* HEX Color Example */}
      <div className="relative w-full h-64 border border-gray-300 rounded-lg overflow-hidden">
        <BackgroundBlock color="#FF5733">
          <TextBlock 
            variant="title" 
            color="text-white" 
            align="center"
            className="pt-20"
          >
            HEX Color Background (#FF5733)
          </TextBlock>
        </BackgroundBlock>
      </div>

      {/* Gradient Examples */}
      <div className="relative w-full h-64 border border-gray-300 rounded-lg overflow-hidden">
        <BackgroundBlock gradient="bg-gradient-to-r from-purple-500 to-indigo-500">
          <TextBlock 
            variant="title" 
            color="text-white" 
            align="center"
            className="pt-20"
          >
            Purple to Indigo Gradient
          </TextBlock>
        </BackgroundBlock>
      </div>

      <div className="relative w-full h-64 border border-gray-300 rounded-lg overflow-hidden">
        <BackgroundBlock gradient="bg-gradient-to-b from-blue-400 to-blue-600">
          <TextBlock 
            variant="title" 
            color="text-white" 
            align="center"
            className="pt-20"
          >
            Top to Bottom Blue Gradient
          </TextBlock>
        </BackgroundBlock>
      </div>

      <div className="relative w-full h-64 border border-gray-300 rounded-lg overflow-hidden">
        <BackgroundBlock gradient="bg-gradient-to-br from-pink-500 to-orange-400">
          <TextBlock 
            variant="title" 
            color="text-white" 
            align="center"
            className="pt-20"
          >
            Diagonal Pink to Orange
          </TextBlock>
        </BackgroundBlock>
      </div>

      {/* 3-Color Gradient */}
      <div className="relative w-full h-64 border border-gray-300 rounded-lg overflow-hidden">
        <BackgroundBlock gradient="bg-gradient-to-t from-black via-gray-800 to-slate-900">
          <TextBlock 
            variant="title" 
            color="text-white" 
            align="center"
            className="pt-20"
          >
            3-Color Dark Gradient
          </TextBlock>
        </BackgroundBlock>
      </div>

      {/* Sunset Gradient */}
      <div className="relative w-full h-64 border border-gray-300 rounded-lg overflow-hidden">
        <BackgroundBlock gradient="bg-gradient-to-r from-orange-400 via-red-500 to-pink-500">
          <TextBlock 
            variant="title" 
            color="text-white" 
            align="center"
            className="pt-20"
          >
            Sunset Gradient
          </TextBlock>
        </BackgroundBlock>
      </div>

      {/* Custom className Example */}
      <div className="relative w-full h-64 border border-gray-300 rounded-lg overflow-hidden">
        <BackgroundBlock 
          gradient="bg-gradient-to-br from-gray-900 to-black"
          className="opacity-90"
        >
          <TextBlock 
            variant="title" 
            color="text-white" 
            align="center"
            className="pt-20"
          >
            Gradient with Custom Opacity
          </TextBlock>
        </BackgroundBlock>
      </div>

      {/* Priority Test: Gradient overrides Color */}
      <div className="relative w-full h-64 border border-gray-300 rounded-lg overflow-hidden">
        <BackgroundBlock 
          color="bg-red-500"
          gradient="bg-gradient-to-r from-green-400 to-blue-500"
        >
          <TextBlock 
            variant="title" 
            color="text-white" 
            align="center"
            className="pt-20"
          >
            Gradient Overrides Color (Green to Blue wins)
          </TextBlock>
        </BackgroundBlock>
      </div>

      {/* Image Background Examples */}
      <h2 className="text-xl font-semibold mt-8 mb-4">Image Backgrounds</h2>
      
      {/* Simple Image Background */}
      <div className="relative w-full h-64 border border-gray-300 rounded-lg overflow-hidden">
        <BackgroundBlock imageUrl="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80">
          <TextBlock 
            variant="title" 
            color="text-white" 
            align="center"
            className="pt-20"
          >
            Mountain Landscape Background
          </TextBlock>
        </BackgroundBlock>
      </div>

      {/* Image with Gradient Overlay */}
      <div className="relative w-full h-64 border border-gray-300 rounded-lg overflow-hidden">
        <BackgroundBlock 
          imageUrl="https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&q=80"
          gradient="bg-gradient-to-r from-black via-transparent to-purple-900"
        >
          <TextBlock 
            variant="title" 
            color="text-white" 
            align="center"
            className="pt-20"
          >
            Ocean with Purple Gradient Overlay
          </TextBlock>
        </BackgroundBlock>
      </div>

      {/* Priority Test: Image overrides Gradient and Color */}
      <div className="relative w-full h-64 border border-gray-300 rounded-lg overflow-hidden">
        <BackgroundBlock 
          color="bg-red-500"
          gradient="bg-gradient-to-r from-yellow-400 to-orange-500"
          imageUrl="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80"
        >
          <TextBlock 
            variant="title" 
            color="text-white" 
            align="center"
            className="pt-20"
          >
            Image Overrides All (Forest Background wins)
          </TextBlock>
        </BackgroundBlock>
      </div>

      {/* Business Background */}
      <div className="relative w-full h-64 border border-gray-300 rounded-lg overflow-hidden">
        <BackgroundBlock 
          imageUrl="https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80"
          gradient="bg-gradient-to-t from-blue-900/80 to-transparent"
        >
          <TextBlock 
            variant="title" 
            color="text-white" 
            align="center"
            className="pt-20"
          >
            Business Presentation Background
          </TextBlock>
        </BackgroundBlock>
      </div>

      {/* Background Opacity Examples (NEW) */}
      <h2 className="text-xl font-semibold mt-8 mb-4">Background Opacity (Colors & Gradients)</h2>

      {/* Semi-transparent solid color */}
      <div className="relative w-full h-64 border border-gray-300 rounded-lg overflow-hidden bg-pattern">
        <div className="absolute inset-0 bg-gray-200 bg-opacity-50 bg-[linear-gradient(45deg,_transparent_25%,_rgba(255,255,255,.2)_25%,_rgba(255,255,255,.2)_50%,_transparent_50%,_transparent_75%,_rgba(255,255,255,.2)_75%)] bg-[length:20px_20px]"></div>
        <BackgroundBlock 
          color="bg-blue-500"
          opacity={0.7}
        >
          <TextBlock 
            variant="title" 
            color="text-white" 
            align="center"
            className="pt-20"
          >
            70% Blue Background (see pattern behind)
          </TextBlock>
        </BackgroundBlock>
      </div>

      {/* Transparent HEX color */}
      <div className="relative w-full h-64 border border-gray-300 rounded-lg overflow-hidden bg-yellow-100">
        <BackgroundBlock 
          color="#FF5733"
          opacity={0.5}
        >
          <TextBlock 
            variant="title" 
            color="text-white" 
            align="center"
            className="pt-20"
          >
            50% HEX Color (#FF5733)
          </TextBlock>
        </BackgroundBlock>
      </div>

      {/* Semi-transparent gradient */}
      <div className="relative w-full h-64 border border-gray-300 rounded-lg overflow-hidden bg-gradient-to-br from-green-200 to-blue-200">
        <BackgroundBlock 
          gradient="bg-gradient-to-r from-purple-500 to-pink-500"
          opacity={0.8}
        >
          <TextBlock 
            variant="title" 
            color="text-white" 
            align="center"
            className="pt-20"
          >
            80% Gradient Opacity
          </TextBlock>
        </BackgroundBlock>
      </div>

      {/* Brightness and Opacity Examples */}
      <h2 className="text-xl font-semibold mt-8 mb-4">Image Brightness & Opacity Controls</h2>

      {/* Darker Image */}
      <div className="relative w-full h-64 border border-gray-300 rounded-lg overflow-hidden">
        <BackgroundBlock 
          imageUrl="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80"
          brightness={0.5}
        >
          <TextBlock 
            variant="title" 
            color="text-white" 
            align="center"
            className="pt-20"
          >
            Darker Mountain (brightness: 0.5)
          </TextBlock>
        </BackgroundBlock>
      </div>

      {/* Brighter Image */}
      <div className="relative w-full h-64 border border-gray-300 rounded-lg overflow-hidden">
        <BackgroundBlock 
          imageUrl="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80"
          brightness={1.4}
        >
          <TextBlock 
            variant="title" 
            color="text-gray-900" 
            align="center"
            className="pt-20"
          >
            Brighter Forest (brightness: 1.4)
          </TextBlock>
        </BackgroundBlock>
      </div>

      {/* Semi-transparent Image */}
      <div className="relative w-full h-64 border border-gray-300 rounded-lg overflow-hidden bg-gradient-to-br from-purple-400 to-pink-400">
        <BackgroundBlock 
          imageUrl="https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&q=80"
          opacity={0.6}
        >
          <TextBlock 
            variant="title" 
            color="text-white" 
            align="center"
            className="pt-20"
          >
            Semi-transparent Ocean (opacity: 0.6)
          </TextBlock>
        </BackgroundBlock>
      </div>

      {/* Combined: Darker + Semi-transparent */}
      <div className="relative w-full h-64 border border-gray-300 rounded-lg overflow-hidden bg-yellow-200">
        <BackgroundBlock 
          imageUrl="https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80"
          brightness={0.7}
          opacity={0.8}
        >
          <TextBlock 
            variant="title" 
            color="text-gray-900" 
            align="center"
            className="pt-20"
          >
            Dimmed Business (brightness: 0.7, opacity: 0.8)
          </TextBlock>
        </BackgroundBlock>
      </div>

      {/* Image with Gradient + Brightness/Opacity */}
      <div className="relative w-full h-64 border border-gray-300 rounded-lg overflow-hidden">
        <BackgroundBlock 
          imageUrl="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80"
          gradient="bg-gradient-to-r from-orange-500/60 to-pink-500/60"
          brightness={0.8}
          opacity={0.9}
        >
          <TextBlock 
            variant="title" 
            color="text-white" 
            align="center"
            className="pt-20"
          >
            Advanced: Image + Gradient + Controls
          </TextBlock>
        </BackgroundBlock>
      </div>

      {/* Glassmorphism Examples */}
      <h2 className="text-xl font-semibold mt-8 mb-4">Glassmorphism Effects</h2>

      {/* Glass over solid color */}
      <div className="relative w-full h-64 border border-gray-300 rounded-lg overflow-hidden">
        <BackgroundBlock 
          color="bg-blue-500"
          glassmorphism={true}
        >
          <TextBlock 
            variant="title" 
            color="text-white" 
            align="center"
            className="pt-20"
          >
            Glassmorphism over Blue
          </TextBlock>
        </BackgroundBlock>
      </div>

      {/* Glass over gradient */}
      <div className="relative w-full h-64 border border-gray-300 rounded-lg overflow-hidden">
        <BackgroundBlock 
          gradient="bg-gradient-to-br from-purple-500 to-pink-500"
          glassmorphism={true}
        >
          <TextBlock 
            variant="title" 
            color="text-white" 
            align="center"
            className="pt-20"
          >
            Glass over Purple-Pink Gradient
          </TextBlock>
        </BackgroundBlock>
      </div>

      {/* Glass over image */}
      <div className="relative w-full h-64 border border-gray-300 rounded-lg overflow-hidden">
        <BackgroundBlock 
          imageUrl="https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&q=80"
          glassmorphism={true}
        >
          <TextBlock 
            variant="title" 
            color="text-white" 
            align="center"
            className="pt-20"
          >
            Frosted Glass over Ocean
          </TextBlock>
        </BackgroundBlock>
      </div>

      {/* Subtle glass effect */}
      <div className="relative w-full h-64 border border-gray-300 rounded-lg overflow-hidden">
        <BackgroundBlock 
          color="bg-gray-900"
          glassmorphism={true}
          blurLevel="backdrop-blur-sm"
          glassOpacity={0.3}
        >
          <TextBlock 
            variant="title" 
            color="text-white" 
            align="center"
            className="pt-20"
          >
            Subtle Glass Effect
          </TextBlock>
        </BackgroundBlock>
      </div>

      {/* Strong glass effect */}
      <div className="relative w-full h-64 border border-gray-300 rounded-lg overflow-hidden">
        <BackgroundBlock 
          gradient="bg-gradient-to-r from-blue-600 to-purple-600"
          glassmorphism={true}
          blurLevel="backdrop-blur-lg"
          glassOpacity={0.8}
        >
          <TextBlock 
            variant="title" 
            color="text-white" 
            align="center"
            className="pt-20"
          >
            Strong Frosted Glass
          </TextBlock>
        </BackgroundBlock>
      </div>

      {/* Modern glass card */}
      <div className="relative w-full h-64 border border-gray-300 rounded-lg overflow-hidden">
        <BackgroundBlock 
          imageUrl="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80"
          glassmorphism={true}
          blurLevel="backdrop-blur-md"
          glassOpacity={0.6}
          brightness={0.8}
        >
          <TextBlock 
            variant="title" 
            color="text-white" 
            align="center"
            className="pt-20"
          >
            Modern Glass Card Design
          </TextBlock>
        </BackgroundBlock>
      </div>

      {/* Ultimate combination */}
      <div className="relative w-full h-64 border border-gray-300 rounded-lg overflow-hidden">
        <BackgroundBlock 
          imageUrl="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80"
          gradient="bg-gradient-to-t from-black/40 to-transparent"
          glassmorphism={true}
          blurLevel="backdrop-blur-xl"
          glassOpacity={0.7}
          brightness={0.9}
          opacity={0.95}
        >
          <TextBlock 
            variant="title" 
            color="text-white" 
            align="center"
            className="pt-20"
          >
            Ultimate Glass Combination
          </TextBlock>
        </BackgroundBlock>
      </div>

      {/* ========== LAYERING EXAMPLES (Z-INDEX) ========== */}
      <h2 className="text-xl font-semibold mt-12 mb-6">Layering Examples (Z-Index Control)</h2>
      
      {/* Back Layer Example */}
      <div className="relative w-full h-64 border border-gray-300 rounded-lg overflow-hidden">
        <BackgroundBlock color="bg-purple-500" zIndex="back">
          <TextBlock 
            variant="title" 
            color="text-white" 
            align="center"
            className="pt-20"
          >
            Back Layer (zIndex="back")
          </TextBlock>
        </BackgroundBlock>
      </div>

      {/* Default Layer Example */}
      <div className="relative w-full h-64 border border-gray-300 rounded-lg overflow-hidden">
        <BackgroundBlock color="bg-green-500" zIndex="default">
          <TextBlock 
            variant="title" 
            color="text-white" 
            align="center"
            className="pt-20"
          >
            Default Layer (zIndex="default")
          </TextBlock>
        </BackgroundBlock>
      </div>

      {/* Front Layer Example */}
      <div className="relative w-full h-64 border border-gray-300 rounded-lg overflow-hidden">
        <BackgroundBlock color="bg-red-500" zIndex="front">
          <TextBlock 
            variant="title" 
            color="text-white" 
            align="center"
            className="pt-20"
          >
            Front Layer (zIndex="front")
          </TextBlock>
        </BackgroundBlock>
      </div>

      {/* Custom Numeric Z-Index */}
      <div className="relative w-full h-64 border border-gray-300 rounded-lg overflow-hidden">
        <BackgroundBlock color="bg-orange-500" zIndex={25}>
          <TextBlock 
            variant="title" 
            color="text-white" 
            align="center"
            className="pt-20"
          >
            Custom Layer (zIndex={25})
          </TextBlock>
        </BackgroundBlock>
      </div>

      {/* Layering Comparison - Multiple Backgrounds */}
      <div className="relative w-full h-80 border border-gray-300 rounded-lg overflow-hidden">
        {/* Base layer - far back */}
        <BackgroundBlock color="bg-blue-500" zIndex={-20} />
        
        {/* Middle layer with opacity */}
        <BackgroundBlock color="bg-red-500" opacity={0.6} zIndex={-10} />
        
        {/* Front overlay */}
        <BackgroundBlock color="bg-black" opacity={0.3} zIndex="front" />
        
        <div className="relative z-50 pt-24 text-center">
          <TextBlock 
            variant="title" 
            color="text-white" 
            align="center"
            className="mb-4"
          >
            Multiple Layered Backgrounds
          </TextBlock>
          <TextBlock 
            variant="body" 
            color="text-white/90" 
            align="center"
          >
            Blue base → Red middle → Black overlay → White text (z-50)
          </TextBlock>
        </div>
      </div>

      {/* Overlay Effect Example */}
      <div className="relative w-full h-64 border border-gray-300 rounded-lg overflow-hidden">
        <BackgroundBlock 
          imageUrl="https://images.unsplash.com/photo-1506905925346-21bda4d32df4" 
          zIndex="back"
        />
        <BackgroundBlock 
          color="bg-black" 
          opacity={0.5} 
          zIndex="front"
        />
        <div className="relative z-20 pt-20">
          <TextBlock 
            variant="title" 
            color="text-white" 
            align="center"
          >
            Image + Dark Overlay Effect
          </TextBlock>
        </div>
      </div>

      {/* ========== OVERLAY EXAMPLES (TINT/OVERLAY EFFECTS) ========== */}
      <h2 className="text-xl font-semibold mt-12 mb-6">Overlay Examples (Tint/Overlay Effects)</h2>
      
      {/* Dark Overlay on Image */}
      <div className="relative w-full h-64 border border-gray-300 rounded-lg overflow-hidden">
        <BackgroundBlock 
          imageUrl="https://images.unsplash.com/photo-1441974231531-c6227db76b6e"
          overlayColor="bg-black"
          overlayOpacity={0.4}
        >
          <TextBlock 
            variant="title" 
            color="text-white" 
            align="center"
            className="pt-20"
          >
            Dark Overlay on Image
          </TextBlock>
        </BackgroundBlock>
      </div>

      {/* Colored Tint on Gradient */}
      <div className="relative w-full h-64 border border-gray-300 rounded-lg overflow-hidden">
        <BackgroundBlock 
          gradient="bg-gradient-to-r from-blue-500 to-purple-500"
          overlayColor="bg-red-500"
          overlayOpacity={0.3}
        >
          <TextBlock 
            variant="title" 
            color="text-white" 
            align="center"
            className="pt-20"
          >
            Red Tint on Blue-Purple Gradient
          </TextBlock>
        </BackgroundBlock>
      </div>

      {/* HEX Color Overlay */}
      <div className="relative w-full h-64 border border-gray-300 rounded-lg overflow-hidden">
        <BackgroundBlock 
          color="bg-green-500"
          overlayColor="#ff0000"
          overlayOpacity={0.5}
        >
          <TextBlock 
            variant="title" 
            color="text-white" 
            align="center"
            className="pt-20"
          >
            HEX Red Overlay (#ff0000)
          </TextBlock>
        </BackgroundBlock>
      </div>

      {/* Different Overlay Opacities */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Subtle Overlay */}
        <div className="relative h-48 border border-gray-300 rounded-lg overflow-hidden">
          <BackgroundBlock 
            imageUrl="https://images.unsplash.com/photo-1506905925346-21bda4d32df4"
            overlayColor="bg-yellow-500"
            overlayOpacity={0.2}
          >
            <TextBlock 
              variant="heading" 
              color="text-white" 
              align="center"
              className="pt-16"
            >
              Subtle (0.2)
            </TextBlock>
          </BackgroundBlock>
        </div>

        {/* Medium Overlay */}
        <div className="relative h-48 border border-gray-300 rounded-lg overflow-hidden">
          <BackgroundBlock 
            imageUrl="https://images.unsplash.com/photo-1506905925346-21bda4d32df4"
            overlayColor="bg-yellow-500"
            overlayOpacity={0.5}
          >
            <TextBlock 
              variant="heading" 
              color="text-white" 
              align="center"
              className="pt-16"
            >
              Medium (0.5)
            </TextBlock>
          </BackgroundBlock>
        </div>

        {/* Strong Overlay */}
        <div className="relative h-48 border border-gray-300 rounded-lg overflow-hidden">
          <BackgroundBlock 
            imageUrl="https://images.unsplash.com/photo-1506905925346-21bda4d32df4"
            overlayColor="bg-yellow-500"
            overlayOpacity={0.8}
          >
            <TextBlock 
              variant="heading" 
              color="text-black" 
              align="center"
              className="pt-16"
            >
              Strong (0.8)
            </TextBlock>
          </BackgroundBlock>
        </div>
      </div>

      {/* Cinematic Effects */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Warm Cinematic */}
        <div className="relative h-64 border border-gray-300 rounded-lg overflow-hidden">
          <BackgroundBlock 
            imageUrl="https://images.unsplash.com/photo-1518837695005-2083093ee35b"
            overlayColor="bg-orange-500"
            overlayOpacity={0.4}
          >
            <TextBlock 
              variant="title" 
              color="text-white" 
              align="center"
              className="pt-20"
            >
              Warm Cinematic
            </TextBlock>
          </BackgroundBlock>
        </div>

        {/* Cool Cinematic */}
        <div className="relative h-64 border border-gray-300 rounded-lg overflow-hidden">
          <BackgroundBlock 
            imageUrl="https://images.unsplash.com/photo-1518837695005-2083093ee35b"
            overlayColor="bg-blue-600"
            overlayOpacity={0.4}
          >
            <TextBlock 
              variant="title" 
              color="text-white" 
              align="center"
              className="pt-20"
            >
              Cool Cinematic
            </TextBlock>
          </BackgroundBlock>
        </div>
      </div>

      {/* Complex Multi-Effect Example */}
      <div className="relative w-full h-80 border border-gray-300 rounded-lg overflow-hidden">
        <BackgroundBlock 
          imageUrl="https://images.unsplash.com/photo-1441974231531-c6227db76b6e"
          blur={true}
          blurLevel="backdrop-blur-sm"
          overlayColor="#8b5cf6"
          overlayOpacity={0.6}
          opacity={0.9}
        >
          <div className="relative z-20 pt-24 text-center">
            <TextBlock 
              variant="title" 
              color="text-white" 
              align="center"
              className="mb-4"
            >
              Multi-Effect Combination
            </TextBlock>
            <TextBlock 
              variant="body" 
              color="text-white/90" 
              align="center"
            >
              Image + Blur + Purple Overlay + Opacity
            </TextBlock>
          </div>
        </BackgroundBlock>
      </div>

      {/* ========== RESPONSIVE EXAMPLES (MOBILE-FIRST DESIGN) ========== */}
      <h2 className="text-xl font-semibold mt-12 mb-6">Responsive Examples (Mobile-First Design)</h2>
      
      {/* Responsive Colors */}
      <div className="relative w-full h-64 border border-gray-300 rounded-lg overflow-hidden">
        <BackgroundBlock 
          color="bg-red-500 sm:bg-green-500 md:bg-blue-500 lg:bg-purple-500"
        >
          <TextBlock 
            variant="title" 
            color="text-white" 
            align="center"
            className="pt-20"
          >
            Responsive Colors
          </TextBlock>
          <TextBlock 
            variant="body" 
            color="text-white/90" 
            align="center"
            className="mt-2 text-sm"
          >
            Red → Green (sm) → Blue (md) → Purple (lg)
          </TextBlock>
        </BackgroundBlock>
      </div>

      {/* Responsive Gradients */}
      <div className="relative w-full h-64 border border-gray-300 rounded-lg overflow-hidden">
        <BackgroundBlock 
          gradient="bg-gradient-to-r sm:bg-gradient-to-b md:bg-gradient-to-br lg:bg-gradient-to-bl from-blue-500 to-purple-500"
        >
          <TextBlock 
            variant="title" 
            color="text-white" 
            align="center"
            className="pt-20"
          >
            Responsive Gradients
          </TextBlock>
          <TextBlock 
            variant="body" 
            color="text-white/90" 
            align="center"
            className="mt-2 text-sm"
          >
            Direction changes: right → bottom → bottom-right → bottom-left
          </TextBlock>
        </BackgroundBlock>
      </div>

      {/* Image Positioning Examples */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Center Position */}
        <div className="relative h-48 border border-gray-300 rounded-lg overflow-hidden">
          <BackgroundBlock 
            imageUrl="https://images.unsplash.com/photo-1506905925346-21bda4d32df4"
            imagePosition="center"
          >
            <TextBlock 
              variant="heading" 
              color="text-white" 
              align="center"
              className="pt-16"
            >
              Center Position
            </TextBlock>
          </BackgroundBlock>
        </div>

        {/* Top Position */}
        <div className="relative h-48 border border-gray-300 rounded-lg overflow-hidden">
          <BackgroundBlock 
            imageUrl="https://images.unsplash.com/photo-1506905925346-21bda4d32df4"
            imagePosition="top"
          >
            <TextBlock 
              variant="heading" 
              color="text-white" 
              align="center"
              className="pt-16"
            >
              Top Position
            </TextBlock>
          </BackgroundBlock>
        </div>

        {/* Bottom Position */}
        <div className="relative h-48 border border-gray-300 rounded-lg overflow-hidden">
          <BackgroundBlock 
            imageUrl="https://images.unsplash.com/photo-1506905925346-21bda4d32df4"
            imagePosition="bottom"
          >
            <TextBlock 
              variant="heading" 
              color="text-white" 
              align="center"
              className="pt-16"
            >
              Bottom Position
            </TextBlock>
          </BackgroundBlock>
        </div>
      </div>

      {/* Container Fit Examples */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Parent Fit */}
        <div className="relative h-64 border border-gray-300 rounded-lg overflow-hidden">
          <BackgroundBlock 
            gradient="bg-gradient-to-r from-indigo-500 to-purple-500"
            fit="parent"
          >
            <TextBlock 
              variant="title" 
              color="text-white" 
              align="center"
              className="pt-20"
            >
              Parent Fit
            </TextBlock>
            <TextBlock 
              variant="body" 
              color="text-white/90" 
              align="center"
              className="mt-2"
            >
              Fits to container boundaries
            </TextBlock>
          </BackgroundBlock>
        </div>

        {/* Viewport Fit */}
        <div className="relative h-64 border border-gray-300 rounded-lg overflow-hidden">
          <BackgroundBlock 
            gradient="bg-gradient-to-br from-green-500 to-blue-500"
            fit="viewport"
          >
            <TextBlock 
              variant="title" 
              color="text-white" 
              align="center"
              className="pt-20"
            >
              Viewport Fit
            </TextBlock>
            <TextBlock 
              variant="body" 
              color="text-white/90" 
              align="center"
              className="mt-2"
            >
              Extends to full viewport
            </TextBlock>
          </BackgroundBlock>
        </div>
      </div>

      {/* Dark Mode Support */}
      <div className="relative w-full h-64 border border-gray-300 rounded-lg overflow-hidden">
        <BackgroundBlock 
          color="bg-gray-100"
          darkMode={true}
        >
          <TextBlock 
            variant="title" 
            color="text-gray-900 dark:text-white" 
            align="center"
            className="pt-20"
          >
            Dark Mode Support
          </TextBlock>
          <TextBlock 
            variant="body" 
            color="text-gray-700 dark:text-gray-300" 
            align="center"
            className="mt-2"
          >
            Automatically adapts to dark/light themes
          </TextBlock>
        </BackgroundBlock>
      </div>

      {/* Responsive Overlay */}
      <div className="relative w-full h-64 border border-gray-300 rounded-lg overflow-hidden">
        <BackgroundBlock 
          imageUrl="https://images.unsplash.com/photo-1518837695005-2083093ee35b"
          overlayColor="bg-black sm:bg-blue-500 md:bg-purple-500 lg:bg-red-500"
          overlayOpacity={0.4}
        >
          <TextBlock 
            variant="title" 
            color="text-white" 
            align="center"
            className="pt-20"
          >
            Responsive Overlay Colors
          </TextBlock>
          <TextBlock 
            variant="body" 
            color="text-white/90" 
            align="center"
            className="mt-2"
          >
            Black → Blue → Purple → Red overlay tints
          </TextBlock>
        </BackgroundBlock>
      </div>

      {/* Ultimate Responsive Combination */}
      <div className="relative w-full h-80 border border-gray-300 rounded-lg overflow-hidden">
        <BackgroundBlock 
          imageUrl="https://images.unsplash.com/photo-1441974231531-c6227db76b6e"
          imagePosition="center"
          fit="parent"
          blur={true}
          blurLevel="backdrop-blur-sm"
          overlayColor="bg-black sm:bg-purple-500/50 md:bg-blue-500/60 lg:bg-green-500/70"
          overlayOpacity={0.5}
          darkMode={true}
        >
          <div className="relative z-20 pt-24 text-center">
            <TextBlock 
              variant="title" 
              color="text-white" 
              align="center"
              className="mb-4"
            >
              Ultimate Responsive Design
            </TextBlock>
            <TextBlock 
              variant="body" 
              color="text-white/90" 
              align="center"
            >
              Image + Responsive Overlays + Blur + Dark Mode
            </TextBlock>
            <div className="mt-4 space-y-1 text-white/70 text-sm">
              <div>📱 Mobile-first design</div>
              <div>🎨 Responsive color changes</div>
              <div>🖼️ Smart image positioning</div>
              <div>🌙 Dark mode ready</div>
              <div>✨ All effects combined!</div>
            </div>
          </div>
        </BackgroundBlock>
      </div>
    </div>
  );
} 