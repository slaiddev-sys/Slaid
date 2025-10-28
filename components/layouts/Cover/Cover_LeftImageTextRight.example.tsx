import React from 'react';
import Cover_LeftImageTextRight from './Cover_LeftImageTextRight';

/**
 * Cover_LeftImageTextRight Examples
 * 
 * Demonstrates the two-column cover layout with left image and right text content.
 * Precisely sized for 1280x720 canvas.
 */

export default function CoverLeftImageTextRightExamples() {
  return (
    <div className="space-y-8 bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Cover_LeftImageTextRight Examples</h1>

      {/* Example 1: Default with placeholders */}
      <section>
        <div className="bg-blue-50 p-4 border-b border-gray-200 mb-4">
          <h2 className="text-xl font-semibold text-blue-800">Default Layout</h2>
          <p className="text-blue-600 text-sm">Clean, minimal styling without backgrounds or borders</p>
        </div>
        <div className="border-2 border-gray-300 rounded-lg overflow-hidden inline-block">
          <Cover_LeftImageTextRight />
        </div>
      </section>

      {/* Example 2: With custom content */}
      <section>
        <div className="bg-green-50 p-4 border-b border-gray-200 mb-4">
          <h2 className="text-xl font-semibold text-green-800">Custom Content</h2>
          <p className="text-green-600 text-sm">With custom title and paragraph text</p>
        </div>
        <div className="border-2 border-gray-300 rounded-lg overflow-hidden inline-block">
          <Cover_LeftImageTextRight
            title="Business Innovation"
            paragraph="Transform your organization with cutting-edge solutions and strategic insights that drive real results."
          />
        </div>
      </section>

      {/* Example 3: Different canvas size */}
      <section>
        <div className="bg-purple-50 p-4 border-b border-gray-200 mb-4">
          <h2 className="text-xl font-semibold text-purple-800">Custom Canvas Size</h2>
          <p className="text-purple-600 text-sm">800x450 canvas with adjusted padding</p>
        </div>
        <div className="border-2 border-gray-300 rounded-lg overflow-hidden inline-block">
          <Cover_LeftImageTextRight
            canvasWidth={800}
            canvasHeight={450}
            rightPadding={40}
            title="Compact Layout"
            paragraph="This layout adapts to different canvas sizes while maintaining perfect proportions."
          />
        </div>
      </section>

      {/* Example 4: Flipped sides (image right, text left) */}
      <section>
        <div className="bg-orange-50 p-4 border-b border-gray-200 mb-4">
          <h2 className="text-xl font-semibold text-orange-800">Image Right, Text Left</h2>
          <p className="text-orange-600 text-sm">Same component, flipped with imageSide="right"</p>
        </div>
        <div className="border-2 border-gray-300 rounded-lg overflow-hidden inline-block">
          <Cover_LeftImageTextRight
            imageSide="right"
            title="Flipped Layout"
            paragraph="Use the same component and flip sides without creating a new layout."
          />
        </div>
      </section>

      {/* Example 5: Text only (no image, layout intact) */}
      <section>
        <div className="bg-rose-50 p-4 border-b border-gray-200 mb-4">
          <h2 className="text-xl font-semibold text-rose-800">Text Only</h2>
          <p className="text-rose-600 text-sm">Hide the image with showImage=false. Text column expands to full width.</p>
        </div>
        <div className="border-2 border-gray-300 rounded-lg overflow-hidden inline-block">
          <Cover_LeftImageTextRight
            showImage={false}
            title="Text-Only Layout"
            paragraph="The image is hidden, but the cover layout remains intact and adapts to full-width text."
          />
        </div>
      </section>

      {/* Code Examples */}
      <section className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Usage Examples</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Basic Usage</h3>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
{`<Cover_LeftImageTextRight
  title="Your Title"
  paragraph="Your content description"
/>`}
            </pre>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">With Logo and Custom Image</h3>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
{`<Cover_LeftImageTextRight
  imageUrl="/your-image.jpg"
  logoUrl="/your-logo.png"
  title="Business Presentation"
  paragraph="Professional content with branding"
/>`}
            </pre>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Custom Canvas Dimensions</h3>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
{`<Cover_LeftImageTextRight
  canvasWidth={1920}
  canvasHeight={1080}
  rightPadding={80}
  title="Full HD Layout"
  paragraph="Scaled for larger presentations"
/>`}
            </pre>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Layout Specifications</h3>
          <ul className="text-blue-700 space-y-1 ml-4">
            <li>• <strong>Canvas Size:</strong> Responsive by default, fits within slide canvas</li>
            <li>• <strong>Left Column:</strong> 50% width, full height image coverage</li>
            <li>• <strong>Right Column:</strong> 50% width, vertically centered content</li>
            <li>• <strong>Content Stack:</strong> Logo (optional) → Title → Paragraph</li>
            <li>• <strong>Styling:</strong> Clean, minimal design without backgrounds or borders</li>
            <li>• <strong>Typography:</strong> Bold title, regular paragraph text</li>
            <li>• <strong>Padding:</strong> Responsive horizontal padding (8-16px)</li>
            <li>• <strong>Alignment:</strong> Content left-aligned within right column</li>
            <li>• <strong>Overflow:</strong> Hidden to maintain canvas dimensions</li>
          </ul>
        </div>
      </section>
    </div>
  );
} 