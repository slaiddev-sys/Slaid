import React from 'react';
import { useFigmaSelection, FigmaImage } from '../../figma';

export default function iPhone_HandFeature_Simple() {
  const [imageState, imageHandlers] = useFigmaSelection({
    initialImageUrl: '/app-ui.png'
  });

  return (
    <div className="w-full h-full p-8">
      <h1 className="text-2xl mb-4">SIMPLE TEST - Click the image below:</h1>
      <div className="w-64 h-64">
        <FigmaImage
          src="/app-ui.png"
          alt="Test image"
          size="full"
          fit="contain"
          align="center"
          rounded={false}
          className="w-full h-full"
          containerClassName="w-full h-full"
          state={imageState}
          handlers={imageHandlers}
        />
      </div>
    </div>
  );
}
