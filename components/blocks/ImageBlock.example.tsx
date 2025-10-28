import React from 'react';
import ImageBlock from './ImageBlock';

/**
 * ImageBlock Component Examples
 * 
 * Demonstrates the flexible, simplified ImageBlock component with all its props.
 * This replaces the old variant-based system with clear, predictable props.
 */

export default function ImageBlockExamples() {
  return (
    <div className="p-8 bg-gray-50 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">ImageBlock Examples</h1>

      {/* Size Examples */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Size Control</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Extra Small (xs) - 96px</h3>
            <ImageBlock
              src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400"
              alt="Red sneakers"
              size="xs"
              fit="contain"
              shadow={true}
            />
          </div>
          
          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Medium (md) - 256px (default)</h3>
            <ImageBlock
              src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400"
              alt="Red sneakers"
              size="md"
              fit="contain"
              shadow={true}
            />
          </div>
          
          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Extra Large (xl) - 384px</h3>
            <ImageBlock
              src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400"
              alt="Red sneakers"
              size="xl"
              fit="contain"
              shadow={true}
            />
          </div>
        </div>
      </section>

      {/* Fit Examples */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Object Fit Control</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Cover (default) - Fills container, may crop</h3>
            <div className="w-64 h-32 mx-auto border border-gray-300 rounded overflow-hidden">
              <ImageBlock
                src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400"
                alt="Mountain landscape"
                size="full"
                fit="cover"
              />
            </div>
          </div>
          
          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Contain - Shows entire image</h3>
            <div className="w-64 h-32 mx-auto border border-gray-300 rounded overflow-hidden bg-gray-100">
              <ImageBlock
                src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400"
                alt="Mountain landscape"
                size="full"
                fit="contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Alignment Examples */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Alignment Control</h2>
        <div className="space-y-4 bg-white p-6 rounded-lg border">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Left Aligned</h3>
            <ImageBlock
              src="https://images.unsplash.com/photo-1611095790444-1dfa35749861?w=200"
              alt="Company logo"
              size="sm"
              align="left"
              fit="contain"
            />
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Center Aligned (default)</h3>
            <ImageBlock
              src="https://images.unsplash.com/photo-1611095790444-1dfa35749861?w=200"
              alt="Company logo"
              size="sm"
              align="center"
              fit="contain"
            />
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Right Aligned</h3>
            <ImageBlock
              src="https://images.unsplash.com/photo-1611095790444-1dfa35749861?w=200"
              alt="Company logo"
              size="sm"
              align="right"
              fit="contain"
            />
          </div>
        </div>
      </section>

      {/* Style Examples */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Style Options</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Rounded Corners</h3>
            <ImageBlock
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300"
              alt="Team member"
              size="md"
              fit="cover"
              rounded={true}
              shadow={true}
            />
          </div>
          
          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-700 mb-2">With Shadow</h3>
            <ImageBlock
              src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300"
              alt="Product showcase"
              size="md"
              fit="contain"
              shadow={true}
            />
          </div>
        </div>
      </section>

      {/* Caption Examples */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">With Captions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ImageBlock
            src="https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400"
            alt="Beautiful landscape"
            size="md"
            fit="cover"
            rounded={true}
            shadow={true}
            caption="Mountain landscape at sunset"
          />
          
          <ImageBlock
            src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400"
            alt="Premium sneakers"
            size="md"
            fit="contain"
            shadow={true}
            caption="Limited Edition Sneakers - $199"
          />
        </div>
      </section>

      {/* Full Width Example */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Full Width Banner</h2>
        <ImageBlock
          src="https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800"
          alt="Company headquarters"
          size="full"
          fit="cover"
          caption="Our headquarters in downtown"
        />
      </section>

      {/* Real-world Use Cases */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Real-world Use Cases</h2>
        
        {/* Hero Section */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Hero Section</h3>
          <ImageBlock
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600"
            alt="Team collaboration"
            size="xl"
            fit="cover"
            rounded={true}
            shadow={true}
            caption="Building the future together"
          />
        </div>

        {/* Product Gallery */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Product Gallery</h3>
          <div className="grid grid-cols-3 gap-4">
            <ImageBlock
              src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200"
              alt="Red sneakers"
              size="sm"
              fit="cover"
              rounded={true}
              shadow={true}
            />
            <ImageBlock
              src="https://images.unsplash.com/photo-1549298916-b41d501d3772?w=200"
              alt="White sneakers"
              size="sm"
              fit="cover"
              rounded={true}
              shadow={true}
            />
            <ImageBlock
              src="https://images.unsplash.com/photo-1584735174965-ca62f6498b55?w=200"
              alt="Black sneakers"
              size="sm"
              fit="cover"
              rounded={true}
              shadow={true}
            />
          </div>
        </div>

        {/* Team Section */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Team Members</h3>
          <div className="flex justify-center space-x-6">
            <ImageBlock
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"
              alt="John Smith"
              size="sm"
              fit="cover"
              rounded={true}
              shadow={true}
              caption="John Smith, CEO"
            />
            <ImageBlock
              src="https://images.unsplash.com/photo-1494790108755-2616c5e5cf37?w=150"
              alt="Sarah Johnson"
              size="sm"
              fit="cover"
              rounded={true}
              shadow={true}
              caption="Sarah Johnson, CTO"
            />
          </div>
        </div>
      </section>

      {/* API Examples */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Component API</h2>
        <div className="bg-gray-800 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
          <pre>{`// Basic usage
<ImageBlock 
  src="/images/photo.jpg" 
  alt="Description" 
/>

// With all props
<ImageBlock 
  src="/images/photo.jpg" 
  alt="Description"
  size="lg"                    // xs, sm, md, lg, xl, full
  fit="contain"                // cover, contain, fill, scale-down
  align="center"               // left, center, right
  rounded={true}               // boolean
  shadow={true}                // boolean
  caption="Photo caption"      // string
  className="custom-class"     // string
  onClick={() => alert('Clicked!')}
/>`}</pre>
        </div>
      </section>

      <div className="text-center text-gray-600 text-sm mt-8">
        <p>This simplified ImageBlock component provides all the flexibility you need with clear, predictable props.</p>
        <p>Perfect for AI-controlled presentations and manual usage alike!</p>
      </div>
    </div>
  );
} 