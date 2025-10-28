import React from 'react';
import BackgroundBlock from './BackgroundBlock';

/**
 * STANDALONE BLUR EXAMPLES
 * 
 * This file demonstrates the new standalone blur functionality.
 * Blur can now be used independently of glassmorphism for pure background blurring.
 */

export const StandaloneBlurExamples = () => {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold mb-6">Standalone Blur Examples</h1>
      
      {/* Example 1: Blurred Color */}
      <div className="relative h-64 border rounded-lg overflow-hidden">
        <BackgroundBlock 
          color="bg-blue-500" 
          blur={true}
        />
        <div className="relative z-10 p-8">
          <h2 className="text-white text-xl font-semibold">Blurred Solid Color</h2>
          <p className="text-white/90">Blue background with blur effect (no glass layer)</p>
        </div>
      </div>

      {/* Example 2: Blurred Gradient */}
      <div className="relative h-64 border rounded-lg overflow-hidden">
        <BackgroundBlock 
          gradient="bg-gradient-to-r from-purple-500 to-pink-500" 
          blur={true}
        />
        <div className="relative z-10 p-8">
          <h2 className="text-white text-xl font-semibold">Blurred Gradient</h2>
          <p className="text-white/90">Gradient background with blur effect</p>
        </div>
      </div>

      {/* Example 3: Blurred Image */}
      <div className="relative h-64 border rounded-lg overflow-hidden">
        <BackgroundBlock 
          imageUrl="https://images.unsplash.com/photo-1506905925346-21bda4d32df4" 
          blur={true}
        />
        <div className="relative z-10 p-8">
          <h2 className="text-white text-xl font-semibold">Blurred Image</h2>
          <p className="text-white/90">Image background with blur effect</p>
        </div>
      </div>

      {/* Example 4: Different Blur Levels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Subtle Blur */}
        <div className="relative h-48 border rounded-lg overflow-hidden">
          <BackgroundBlock 
            color="bg-green-500" 
            blur={true}
            blurLevel="backdrop-blur-sm"
          />
          <div className="relative z-10 p-4">
            <h3 className="text-white text-lg font-semibold">Subtle Blur</h3>
            <p className="text-white/90 text-sm">backdrop-blur-sm</p>
          </div>
        </div>

        {/* Medium Blur */}
        <div className="relative h-48 border rounded-lg overflow-hidden">
          <BackgroundBlock 
            color="bg-orange-500" 
            blur={true}
            blurLevel="backdrop-blur-md"
          />
          <div className="relative z-10 p-4">
            <h3 className="text-white text-lg font-semibold">Medium Blur</h3>
            <p className="text-white/90 text-sm">backdrop-blur-md</p>
          </div>
        </div>

        {/* Strong Blur */}
        <div className="relative h-48 border rounded-lg overflow-hidden">
          <BackgroundBlock 
            color="bg-red-500" 
            blur={true}
            blurLevel="backdrop-blur-xl"
          />
          <div className="relative z-10 p-4">
            <h3 className="text-white text-lg font-semibold">Strong Blur</h3>
            <p className="text-white/90 text-sm">backdrop-blur-xl</p>
          </div>
        </div>
      </div>

      {/* Example 5: Comparison - Blur vs Glassmorphism */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Standalone Blur */}
        <div className="relative h-48 border rounded-lg overflow-hidden">
          <BackgroundBlock 
            gradient="bg-gradient-to-br from-indigo-500 to-purple-600" 
            blur={true}
          />
          <div className="relative z-10 p-4">
            <h3 className="text-white text-lg font-semibold">Standalone Blur</h3>
            <p className="text-white/90 text-sm">Just blur, no glass layer</p>
          </div>
        </div>

        {/* Glassmorphism (includes blur + glass styling) */}
        <div className="relative h-48 border rounded-lg overflow-hidden">
          <BackgroundBlock 
            gradient="bg-gradient-to-br from-indigo-500 to-purple-600" 
            glassmorphism={true}
          />
          <div className="relative z-10 p-4">
            <h3 className="text-white text-lg font-semibold">Glassmorphism</h3>
            <p className="text-white/90 text-sm">Blur + glass layer + borders</p>
          </div>
        </div>
      </div>

      {/* Example 6: Combined Effects */}
      <div className="relative h-64 border rounded-lg overflow-hidden">
        <BackgroundBlock 
          imageUrl="https://images.unsplash.com/photo-1441974231531-c6227db76b6e"
          blur={true}
          blurLevel="backdrop-blur-lg"
          opacity={0.8}
          brightness={0.7}
        />
        <div className="relative z-10 p-8">
          <h2 className="text-white text-xl font-semibold">Combined Effects</h2>
          <p className="text-white/90">Image + blur + opacity + brightness adjustment</p>
        </div>
      </div>
    </div>
  );
};

/**
 * AI EXAMPLES FOR CLAUDE:
 * 
 * User: "Make the background blurry"
 * → {"type": "BackgroundBlock", "props": {"color": "bg-blue-500", "blur": true}}
 * 
 * User: "Add blur effect to the gradient"
 * → {"type": "BackgroundBlock", "props": {"gradient": "bg-gradient-to-r from-purple-500 to-pink-500", "blur": true}}
 * 
 * User: "Blur the background image"
 * → {"type": "BackgroundBlock", "props": {"imageUrl": "...", "blur": true}}
 * 
 * User: "Make it more blurry"
 * → {"type": "BackgroundBlock", "props": {"color": "bg-green-500", "blur": true, "blurLevel": "backdrop-blur-xl"}}
 * 
 * User: "Remove the blur"
 * → {"type": "BackgroundBlock", "props": {"color": "bg-green-500", "blur": false}}
 * 
 * User: "I want glassmorphism, not just blur"
 * → {"type": "BackgroundBlock", "props": {"color": "bg-blue-500", "glassmorphism": true}}
 */

export default StandaloneBlurExamples; 