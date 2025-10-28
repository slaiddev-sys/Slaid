import React from 'react';
import LayoutBlock from './LayoutBlock';
import TextBlock from './TextBlock';
import ImageBlock from './ImageBlock';
import { Cover_LeftTitleRightBodyUnderlined } from '../layouts/Cover';
import Index_LeftAgendaRightImage from '../layouts/Index/Index_LeftAgendaRightImage';

/**
 * LayoutBlock Examples - Precision Canvas-Fitted Layouts
 * 
 * Demonstrates the new LayoutBlock system designed for exact canvas dimensions
 * with no overflow or distortion.
 */

export default function LayoutBlockExamples() {
  return (
    <div className="space-y-8 bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Precision LayoutBlock Examples</h1>

      {/* Single Column Layout */}
      <section>
        <div className="bg-blue-50 p-4 border-b border-gray-200 mb-4">
          <h2 className="text-xl font-semibold text-blue-800">Single Column Layout</h2>
          <p className="text-blue-600 text-sm">Full canvas single column with precise dimensions</p>
        </div>
        <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
          <LayoutBlock
            variant="single"
            canvasWidth={800}
            canvasHeight={450}
            spacing="lg"
            contentAlign="center"
          >
            <TextBlock
              variant="title"
              color="text-gray-900"
              fontFamily="font-inter"
              className="text-4xl font-bold"
            >
              Presentation Title
            </TextBlock>
            <TextBlock
              variant="body"
              color="text-gray-600"
              fontFamily="font-inter"
              className="text-lg mt-4"
            >
              Perfectly centered content within exact canvas dimensions
            </TextBlock>
          </LayoutBlock>
        </div>
      </section>

      {/* Split Layout */}
      <section>
        <div className="bg-green-50 p-4 border-b border-gray-200 mb-4">
          <h2 className="text-xl font-semibold text-green-800">Split Layout</h2>
          <p className="text-green-600 text-sm">Two-column layout with precise 50/50 split</p>
        </div>
        <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
          <LayoutBlock
            variant="split"
            canvasWidth={800}
            canvasHeight={450}
            spacing="md"
            contentAlign="center"
          >
            <div className="flex-1 flex flex-col justify-center items-center p-6 bg-blue-50">
              <TextBlock
                variant="heading"
                color="text-blue-900"
                fontFamily="font-inter"
                className="text-2xl font-semibold mb-4"
              >
                Left Column
              </TextBlock>
              <TextBlock
                variant="body"
                color="text-blue-700"
                fontFamily="font-inter"
                className="text-center"
              >
                Content perfectly fitted to left half of canvas
              </TextBlock>
            </div>
            <div className="flex-1 flex flex-col justify-center items-center p-6 bg-green-50">
              <TextBlock
                variant="heading"
                color="text-green-900"
                fontFamily="font-inter"
                className="text-2xl font-semibold mb-4"
              >
                Right Column
              </TextBlock>
              <TextBlock
                variant="body"
                color="text-green-700"
                fontFamily="font-inter"
                className="text-center"
              >
                Content perfectly fitted to right half of canvas
              </TextBlock>
            </div>
          </LayoutBlock>
        </div>
      </section>

      {/* Grid Layout */}
      <section>
        <div className="bg-purple-50 p-4 border-b border-gray-200 mb-4">
          <h2 className="text-xl font-semibold text-purple-800">Grid Layout</h2>
          <p className="text-purple-600 text-sm">2x2 grid with precise quadrant divisions</p>
        </div>
        <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
          <LayoutBlock
            variant="grid"
            canvasWidth={800}
            canvasHeight={450}
            spacing="sm"
            contentAlign="center"
          >
            <div className="flex flex-col justify-center items-center p-4 bg-red-50">
              <TextBlock
                variant="heading"
                color="text-red-900"
                fontFamily="font-inter"
                className="text-lg font-semibold"
              >
                Quadrant 1
              </TextBlock>
            </div>
            <div className="flex flex-col justify-center items-center p-4 bg-yellow-50">
              <TextBlock
                variant="heading"
                color="text-yellow-900"
                fontFamily="font-inter"
                className="text-lg font-semibold"
              >
                Quadrant 2
              </TextBlock>
            </div>
            <div className="flex flex-col justify-center items-center p-4 bg-green-50">
              <TextBlock
                variant="heading"
                color="text-green-900"
                fontFamily="font-inter"
                className="text-lg font-semibold"
              >
                Quadrant 3
              </TextBlock>
            </div>
            <div className="flex flex-col justify-center items-center p-4 bg-blue-50">
              <TextBlock
                variant="heading"
                color="text-blue-900"
                fontFamily="font-inter"
                className="text-lg font-semibold"
              >
                Quadrant 4
              </TextBlock>
            </div>
          </LayoutBlock>
        </div>
      </section>

      {/* Hero Layout */}
      <section>
        <div className="bg-orange-50 p-4 border-b border-gray-200 mb-4">
          <h2 className="text-xl font-semibold text-orange-800">Hero Layout</h2>
          <p className="text-orange-600 text-sm">Stacked hero layout with precise vertical spacing</p>
        </div>
        <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
          <LayoutBlock
            variant="hero"
            canvasWidth={800}
            canvasHeight={450}
            spacing="lg"
            contentAlign="center"
          >
            <div className="flex-1 flex flex-col justify-center items-center">
              <TextBlock
                variant="title"
                color="text-gray-900"
                fontFamily="font-inter"
                className="text-5xl font-bold mb-4"
              >
                Hero Title
              </TextBlock>
              <TextBlock
                variant="body"
                color="text-gray-600"
                fontFamily="font-inter"
                className="text-xl text-center max-w-2xl"
              >
                Hero subtitle with perfect spacing and alignment within canvas bounds
              </TextBlock>
            </div>
          </LayoutBlock>
        </div>
      </section>

      {/* Cover_LeftTitleRightBodyUnderlined Demo */}
      <section>
        <div className="bg-indigo-50 p-4 border-b border-gray-200 mb-4">
          <h2 className="text-xl font-semibold text-indigo-800">Cover_LeftTitleRightBodyUnderlined</h2>
          <p className="text-indigo-600 text-sm">Left: logo + big underlined title (lower-left). Right: centered readable body.</p>
        </div>
        <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
          <div className="w-[1280px] h-[720px] bg-white flex items-stretch justify-stretch">
            <Cover_LeftTitleRightBodyUnderlined />
          </div>
        </div>
      </section>

      {/* Index_LeftAgendaRightImage Demo */}
      <section>
        <div className="bg-emerald-50 p-4 border-b border-gray-200 mb-4">
          <h2 className="text-xl font-semibold text-emerald-800">Index_LeftAgendaRightImage</h2>
          <p className="text-emerald-600 text-sm">Left: numbered agenda list (55% width). Right: image (45% width) with rounded corners.</p>
        </div>
        <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
          <div className="w-[1280px] h-[720px] bg-white flex items-stretch justify-stretch">
            <Index_LeftAgendaRightImage 
              agendaTitle="Today's Agenda"
              agendaItems={[
                { number: 1, title: "Welcome & Introductions", description: "Getting to know the team" },
                { number: 2, title: "Project Overview", description: "Current status and objectives" },
                { number: 3, title: "Technical Deep Dive", description: "Architecture and implementation" },
                { number: 4, title: "Next Steps", description: "Action items and timeline" }
              ]}
              maxItems={4}
              imageUrl="/Default-Image-1.png"
              showDivider={true}
              useFixedDimensions={true}
            />
          </div>
        </div>
      </section>

      {/* Canvas Dimension Examples */}
      <section className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Canvas Dimension Examples</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Standard Presentation (16:9)</h3>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
{`<LayoutBlock
  variant="single"
  canvasWidth={1920}
  canvasHeight={1080}
  fullCanvas={true}
>
  <TextBlock>Content fits exactly within 1920x1080 canvas</TextBlock>
</LayoutBlock>`}
            </pre>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Square Canvas</h3>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
{`<LayoutBlock
  variant="split"
  canvasWidth={800}
  canvasHeight={800}
  spacing="md"
>
  <div>Left half - 400px wide</div>
  <div>Right half - 400px wide</div>
</LayoutBlock>`}
            </pre>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Custom Dimensions</h3>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
{`<LayoutBlock
  variant="grid"
  canvasWidth={1200}
  canvasHeight={600}
  spacing="lg"
>
  {/* 2x2 grid with exact 600x300 quadrants */}
</LayoutBlock>`}
            </pre>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Key Features</h3>
          <ul className="text-blue-700 space-y-1 ml-4">
            <li>• <strong>Exact Dimensions:</strong> Fits precisely within specified canvas size</li>
            <li>• <strong>No Overflow:</strong> Content never exceeds canvas boundaries</li>
            <li>• <strong>Pixel Perfect:</strong> Uses exact pixel values for precise control</li>
            <li>• <strong>Flexible Variants:</strong> Single, split, grid, hero, and stack layouts</li>
            <li>• <strong>Controlled Spacing:</strong> Precise gap control between sections</li>
            <li>• <strong>Content Alignment:</strong> Perfect positioning within layout areas</li>
          </ul>
        </div>
      </section>
    </div>
  );
} 