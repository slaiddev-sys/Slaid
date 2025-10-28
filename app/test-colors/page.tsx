'use client';

import React from 'react';
import TextBlock from '../../components/blocks/TextBlock';

import BackgroundBlock from '../../components/blocks/BackgroundBlock';

export default function TestColorsPage() {
  return (
    <div className="min-h-screen p-8 space-y-12">
      <h1 className="text-3xl font-bold text-center mb-8">HEX Color Support Test</h1>
      
      {/* Test 1: TextBlock with various HEX colors */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">TextBlock HEX Color Tests</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextBlock variant="heading" color="#FF5733">
            Orange Red Text (#FF5733)
          </TextBlock>
          <TextBlock variant="heading" color="#0A0A23">
            Dark Navy Text (#0A0A23)
          </TextBlock>
          <TextBlock variant="body" color="#33FF57">
            Bright Green Text (#33FF57)
          </TextBlock>
          <TextBlock variant="body" color="#8B5CF6">
            Purple Text (#8B5CF6)
          </TextBlock>
          <TextBlock variant="caption" color="#F59E0B">
            Amber Caption (#F59E0B)
          </TextBlock>
          <TextBlock variant="caption" color="#EC4899">
            Pink Caption (#EC4899)
          </TextBlock>
        </div>
      </section>



      {/* Test 3: BackgroundBlock with HEX colors */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">BackgroundBlock HEX Color Tests</h2>
        
        {/* Solid backgrounds */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative h-32 rounded-lg overflow-hidden">
            <BackgroundBlock 
              color="#FF6B6B"
            />
            <div className="relative z-10 p-4 text-white font-semibold">
              Solid Red (#FF6B6B)
            </div>
          </div>
          
          <div className="relative h-32 rounded-lg overflow-hidden">
            <BackgroundBlock 
              
              color="#4ECDC4"
            />
            <div className="relative z-10 p-4 text-white font-semibold">
              Solid Teal (#4ECDC4)
            </div>
          </div>
          
          <div className="relative h-32 rounded-lg overflow-hidden">
            <BackgroundBlock 
              
              color="#45B7D1"
            />
            <div className="relative z-10 p-4 text-white font-semibold">
              Solid Blue (#45B7D1)
            </div>
          </div>
        </div>

        {/* Gradient backgrounds with HEX colors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="relative h-40 rounded-lg overflow-hidden">
            <BackgroundBlock 
              gradient="bg-gradient-to-br from-red-400 to-teal-400"
            />
            <div className="relative z-10 p-4 text-white font-semibold">
              HEX Gradient: #FF6B6B → #4ECDC4
            </div>
          </div>
          
          <div className="relative h-40 rounded-lg overflow-hidden">
            <BackgroundBlock 
              gradient="bg-gradient-to-r from-indigo-400 to-purple-500"
            />
            <div className="relative z-10 p-4 text-white font-semibold">
              HEX Gradient: #667eea → #764ba2
            </div>
          </div>
        </div>
      </section>

      {/* Test 4: Mixed Tailwind and HEX colors */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Mixed Tailwind + HEX Tests</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <TextBlock variant="heading" color="primary">
              Tailwind Primary Color
            </TextBlock>
            <TextBlock variant="body" color="#FF5733">
              Custom HEX Color (#FF5733)
            </TextBlock>

          </div>
          
          <div className="relative h-48 rounded-lg overflow-hidden">
            <BackgroundBlock 
              gradient="bg-gradient-to-br from-blue-500 to-red-400"
            />
            <div className="relative z-10 p-4 text-white font-semibold">
              Mixed Gradient: Tailwind blue-500 → HEX #FF6B6B
            </div>
          </div>
        </div>
      </section>

      {/* Test 5: Edge cases */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Edge Case Tests</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TextBlock variant="body" color="#fff">
            Short HEX (#fff)
          </TextBlock>
          <TextBlock variant="body" color="#000000FF">
            HEX with Alpha (#000000FF)
          </TextBlock>
          <TextBlock variant="body" color="transparent">
            Transparent Color
          </TextBlock>
        </div>
      </section>

      <div className="text-center mt-12">
        <p className="text-gray-600">
          If you can see all the colors above as expected, then HEX color support is working! 🎨
        </p>
      </div>
    </div>
  );
} 