import React from 'react';
import BackgroundBlock from './BackgroundBlock';
import TextBlock from './TextBlock';

/**
 * LayeringTest - Visual test component to verify z-index functionality
 * 
 * This component demonstrates all layering options in a single view
 */
export default function LayeringTest() {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold text-center mb-8">Z-Index Layering Test</h1>
      
      {/* Test 1: Predefined Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative h-64 border-2 border-gray-400 rounded-lg overflow-hidden">
          <BackgroundBlock color="bg-blue-500" zIndex="back">
            <div className="relative z-20 p-4">
              <TextBlock variant="heading" color="text-white" align="center">
                Back Layer
              </TextBlock>
              <TextBlock variant="body" color="text-white/80" align="center" className="mt-2">
                zIndex="back" → z-[-10]
              </TextBlock>
            </div>
          </BackgroundBlock>
        </div>

        <div className="relative h-64 border-2 border-gray-400 rounded-lg overflow-hidden">
          <BackgroundBlock color="bg-green-500" zIndex="default">
            <div className="relative z-20 p-4">
              <TextBlock variant="heading" color="text-white" align="center">
                Default Layer
              </TextBlock>
              <TextBlock variant="body" color="text-white/80" align="center" className="mt-2">
                zIndex="default" → z-0
              </TextBlock>
            </div>
          </BackgroundBlock>
        </div>

        <div className="relative h-64 border-2 border-gray-400 rounded-lg overflow-hidden">
          <BackgroundBlock color="bg-red-500" zIndex="front">
            <div className="relative z-20 p-4">
              <TextBlock variant="heading" color="text-white" align="center">
                Front Layer
              </TextBlock>
              <TextBlock variant="body" color="text-white/80" align="center" className="mt-2">
                zIndex="front" → z-10
              </TextBlock>
            </div>
          </BackgroundBlock>
        </div>
      </div>

      {/* Test 2: Custom Numeric Values */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative h-64 border-2 border-gray-400 rounded-lg overflow-hidden">
          <BackgroundBlock color="bg-purple-500" zIndex={25}>
            <div className="relative z-30 p-4">
              <TextBlock variant="heading" color="text-white" align="center">
                Custom High
              </TextBlock>
              <TextBlock variant="body" color="text-white/80" align="center" className="mt-2">
                zIndex={25} → style="z-index: 25"
              </TextBlock>
            </div>
          </BackgroundBlock>
        </div>

        <div className="relative h-64 border-2 border-gray-400 rounded-lg overflow-hidden">
          <BackgroundBlock color="bg-orange-500" zIndex={-15}>
            <div className="relative z-20 p-4">
              <TextBlock variant="heading" color="text-white" align="center">
                Custom Low
              </TextBlock>
              <TextBlock variant="body" color="text-white/80" align="center" className="mt-2">
                zIndex={-15} → style="z-index: -15"
              </TextBlock>
            </div>
          </BackgroundBlock>
        </div>
      </div>

      {/* Test 3: Layering Stack (Most Important Test) */}
      <div className="relative h-80 border-4 border-red-500 rounded-lg overflow-hidden bg-white">
        <div className="absolute top-2 left-2 bg-white/90 px-2 py-1 rounded text-sm font-mono z-50">
          Layering Stack Test
        </div>
        
        {/* Layer 1: Deep background (-20) */}
        <BackgroundBlock 
          color="bg-blue-600" 
          zIndex={-20}
        />
        
        {/* Layer 2: Middle background (-10) */}
        <BackgroundBlock 
          color="bg-red-500" 
          opacity={0.7} 
          zIndex={-10}
        />
        
        {/* Layer 3: Front overlay (10) */}
        <BackgroundBlock 
          color="bg-black" 
          opacity={0.4} 
          zIndex="front"
        />
        
        {/* Content (z-30) */}
        <div className="relative z-30 pt-24 text-center">
          <TextBlock variant="title" color="text-white" align="center" className="mb-4">
            Stacked Layers Test
          </TextBlock>
          <TextBlock variant="body" color="text-white/90" align="center">
            Blue (-20) → Red (-10) → Black (10) → Text (30)
          </TextBlock>
          <div className="mt-4 space-y-1 text-white/70 text-sm">
            <div>✅ If you see this text clearly</div>
            <div>✅ And multiple color layers blending</div>
            <div>✅ Z-index layering is working!</div>
          </div>
        </div>
      </div>

      {/* Test 4: Blur + Layering Combination */}
      <div className="relative h-64 border-2 border-green-400 rounded-lg overflow-hidden">
        <BackgroundBlock 
          gradient="bg-gradient-to-r from-purple-500 to-pink-500" 
          blur={true}
          zIndex="back"
        />
        <BackgroundBlock 
          color="bg-white" 
          opacity={0.2} 
          zIndex="front"
        />
        <div className="relative z-20 pt-20 text-center">
          <TextBlock variant="heading" color="text-black" align="center">
            Blur + Layering Combo
          </TextBlock>
          <TextBlock variant="body" color="text-gray-800" align="center" className="mt-2">
            Blurred gradient background + white overlay
          </TextBlock>
        </div>
      </div>

      {/* Test 5: Overlay Functionality */}
      <div className="relative h-64 border-2 border-purple-400 rounded-lg overflow-hidden">
        <BackgroundBlock 
          imageUrl="https://images.unsplash.com/photo-1441974231531-c6227db76b6e"
          overlayColor="bg-red-500"
          overlayOpacity={0.4}
        />
        <div className="relative z-20 pt-20 text-center">
          <TextBlock variant="heading" color="text-white" align="center">
            Overlay Test
          </TextBlock>
          <TextBlock variant="body" color="text-white/90" align="center" className="mt-2">
            Image + Red Overlay (opacity: 0.4)
          </TextBlock>
        </div>
      </div>

      {/* Test 6: Complete Layer Stack Test */}
      <div className="relative h-80 border-4 border-green-500 rounded-lg overflow-hidden bg-white">
        <div className="absolute top-2 left-2 bg-white/90 px-2 py-1 rounded text-sm font-mono z-50">
          Complete Layer Stack Test
        </div>
        
        {/* Base background */}
        <BackgroundBlock 
          gradient="bg-gradient-to-br from-blue-500 to-purple-600" 
          zIndex="back"
        />
        
        {/* Blur effect */}
        <BackgroundBlock 
          color="bg-transparent" 
          blur={true}
          blurLevel="backdrop-blur-sm"
          zIndex="back"
        />
        
        {/* Overlay tint */}
        <BackgroundBlock 
          color="bg-transparent"
          overlayColor="bg-orange-500"
          overlayOpacity={0.3}
          zIndex="back"
        />
        
        {/* Content */}
        <div className="relative z-30 pt-24 text-center">
          <TextBlock variant="title" color="text-white" align="center" className="mb-4">
            All Effects Combined
          </TextBlock>
          <TextBlock variant="body" color="text-white/90" align="center">
            Gradient → Blur → Orange Overlay → Text
          </TextBlock>
          <div className="mt-4 space-y-1 text-white/70 text-sm">
            <div>✅ Gradient background</div>
            <div>✅ Blur effect applied</div>
            <div>✅ Orange tint overlay</div>
            <div>✅ All layers working together!</div>
          </div>
        </div>
      </div>

      {/* Test 7: Responsive Functionality */}
      <div className="relative h-64 border-2 border-blue-400 rounded-lg overflow-hidden">
        <BackgroundBlock 
          color="bg-red-500 sm:bg-green-500 md:bg-blue-500 lg:bg-purple-500"
          fit="parent"
          darkMode={false}
        />
        <div className="relative z-20 pt-20 text-center">
          <TextBlock variant="heading" color="text-white" align="center">
            Responsive Test
          </TextBlock>
          <TextBlock variant="body" color="text-white/90" align="center" className="mt-2">
            Red → Green (sm) → Blue (md) → Purple (lg)
          </TextBlock>
        </div>
      </div>

      {/* Test 8: Ultimate Feature Combination */}
      <div className="relative h-80 border-4 border-rainbow rounded-lg overflow-hidden bg-white">
        <div className="absolute top-2 left-2 bg-white/90 px-2 py-1 rounded text-sm font-mono z-50">
          Ultimate Feature Test
        </div>
        
        {/* Responsive background with all features */}
        <BackgroundBlock 
          imageUrl="https://images.unsplash.com/photo-1441974231531-c6227db76b6e"
          imagePosition="center"
          fit="parent"
          blur={true}
          blurLevel="backdrop-blur-sm"
          overlayColor="bg-black sm:bg-purple-500/60 md:bg-blue-500/70 lg:bg-green-500/80"
          overlayOpacity={0.5}
          zIndex="back"
          darkMode={true}
        />
        
        {/* Content */}
        <div className="relative z-30 pt-24 text-center">
          <TextBlock variant="title" color="text-white" align="center" className="mb-4">
            All Features Combined
          </TextBlock>
          <TextBlock variant="body" color="text-white/90" align="center">
            Responsive + Layering + Blur + Overlay + Dark Mode
          </TextBlock>
          <div className="mt-4 space-y-1 text-white/70 text-sm">
            <div>✅ Responsive colors across breakpoints</div>
            <div>✅ Image positioning and fitting</div>
            <div>✅ Z-index layering control</div>
            <div>✅ Blur effects</div>
            <div>✅ Overlay tinting</div>
            <div>✅ Dark mode support</div>
            <div>🎉 Everything working together!</div>
          </div>
        </div>
      </div>
    </div>
  );
} 