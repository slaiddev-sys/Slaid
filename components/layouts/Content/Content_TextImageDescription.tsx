'use client';

import React, { useState } from 'react';
import FigmaText from '../../figma/FigmaText';

interface ContentTextImageDescriptionProps {
  title?: string;
  description?: string;
  image?: {
    src: string;
    alt: string;
    size?: 'small' | 'medium' | 'large' | 'full';
    fit?: 'contain' | 'cover' | 'fill';
    rounded?: boolean;
  };
  fontFamily?: string;
  titleColor?: string;
  descriptionColor?: string;
  layout?: {
    showTitle?: boolean;
    showDescription?: boolean;
    showImage?: boolean;
    imagePosition?: 'left' | 'right';
    columnSizes?: [number, number];
  };

  /**
   * Canvas editing callback
   */
  onUpdate?: (updates: any) => void;
}

export const Content_TextImageDescription: React.FC<ContentTextImageDescriptionProps> = ({
  title = "Market Context",
  description = "Modern enterprises face unprecedented challenges in digital transformation. Fragmented tools, communication barriers, and inefficient workflows are hindering organizational productivity and innovation.",
  image = {
    src: "/Default-Image-1.png",
    alt: "Industry landscape",
    size: "full",
    fit: "cover",
    rounded: false
  },
  fontFamily = "font-helvetica-neue",
  titleColor = "text-gray-900",
  descriptionColor = "text-gray-600",
  layout = {
    showTitle: true,
    showDescription: true,
    showImage: true,
    imagePosition: "right",
    columnSizes: [6, 6]
  },
  onUpdate
}) => {
  // Text content state
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentDescription, setCurrentDescription] = useState(description);

  // Text change handlers
  const handleTitleTextChange = (newText: string) => {
    setCurrentTitle(newText);
    if (onUpdate) {
      onUpdate({ title: newText });
    }
  };

  const handleDescriptionTextChange = (newText: string) => {
    setCurrentDescription(newText);
    if (onUpdate) {
      onUpdate({ description: newText });
    }
  };

  const {
    showTitle = true,
    showDescription = true,
    showImage = true,
    imagePosition = "right",
    columnSizes = [6, 6]
  } = layout;

  const [leftCols, rightCols] = columnSizes;
  const isImageLeft = imagePosition === "left";

  const textContent = (
    <div className={`${isImageLeft ? 'col-span-6' : 'col-span-6'} flex flex-col justify-center space-y-6 px-8`}>
      {showTitle && (
        <FigmaText
          variant="title"
          color={titleColor}
          fontFamily={fontFamily}
          className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter leading-[0.9]"
          onTextChange={handleTitleTextChange}
        >
          {currentTitle}
        </FigmaText>
      )}
      
      {showDescription && (
        <FigmaText
          variant="body"
          color={descriptionColor}
          fontFamily={fontFamily}
          className="text-lg md:text-xl leading-relaxed max-w-2xl"
          onTextChange={handleDescriptionTextChange}
        >
          {currentDescription}
        </FigmaText>
      )}
    </div>
  );

  const imageContent = showImage && image && (
    <div className={`${isImageLeft ? 'col-span-6' : 'col-span-6'} flex items-center justify-center p-8`}>
      <div className="relative w-full h-full max-w-lg max-h-96">
        <img
          src={image.src || "/Default-Image-1.png"}
          alt={image.alt || "Content image"}
          className={`w-full h-full object-${image.fit || 'cover'} ${
            image.rounded ? 'rounded-lg' : ''
          }`}
          style={{
            maxHeight: image.size === 'small' ? '200px' : 
                      image.size === 'medium' ? '300px' : 
                      image.size === 'large' ? '400px' : '100%'
          }}
        />
      </div>
    </div>
  );

  return (
    <div className="w-full h-full flex items-center justify-center bg-white">
      <div className="w-full max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-12 gap-8 items-center min-h-[500px]">
          {isImageLeft ? (
            <>
              {imageContent}
              {textContent}
            </>
          ) : (
            <>
              {textContent}
              {imageContent}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Content_TextImageDescription;
