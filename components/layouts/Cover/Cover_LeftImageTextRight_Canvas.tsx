import React from 'react';
import { CanvasLayout, CanvasText, CanvasImage } from '../../canvas';

interface CoverLeftImageTextRightCanvasProps {
  imageUrl?: string;
  imageAlt?: string;
  logoUrl?: string;
  logoAlt?: string;
  title?: string;
  paragraph?: string;
  fontFamily?: string;
  titleColor?: string;
  paragraphColor?: string;
  titleClassName?: string;
  paragraphClassName?: string;
  className?: string;
  useFixedDimensions?: boolean;
  canvasWidth?: number;
  canvasHeight?: number;
  onUpdate?: (updates: any) => void;
}

export const CoverLeftImageTextRightCanvas: React.FC<CoverLeftImageTextRightCanvasProps> = ({
  imageUrl = '/Default-Image-1.png',
  imageAlt = 'Cover image',
  logoUrl,
  logoAlt = 'Logo',
  title = 'Your Presentation Title',
  paragraph = 'Your presentation description goes here. This is where you can add more details about your topic.',
  fontFamily = 'font-helvetica-neue',
  titleColor = 'text-gray-900',
  paragraphColor = 'text-gray-600',
  titleClassName = 'font-normal text-3xl lg:text-4xl xl:text-5xl leading-tight tracking-tight break-words overflow-wrap-anywhere whitespace-normal max-w-20 w-20',
  paragraphClassName = 'text-[17px] mt-2',
  className = '',
  useFixedDimensions = false,
  canvasWidth = 1200,
  canvasHeight = 675,
  onUpdate
}) => {
  const handleUpdate = (field: string, value: any) => {
    onUpdate?.({ [field]: value });
  };

  const containerStyle = useFixedDimensions
    ? {
        width: `${canvasWidth}px`,
        height: `${canvasHeight}px`,
        transform: 'scale(0.8)',
        transformOrigin: 'top left',
      }
    : {};

  return (
    <CanvasLayout>
      <div
        className={`relative bg-white overflow-hidden ${className}`}
        style={containerStyle}
      >
        <div className="flex flex-col lg:flex-row min-h-screen">
          {/* Left Column - Image */}
          <div className="lg:w-1/2 relative">
            <CanvasImage
              id="cover-main-image"
              src={imageUrl}
              alt={imageAlt}
              size="full"
              fit="cover"
              className="w-full h-64 lg:h-full"
              onUpdate={(newSrc) => handleUpdate('imageUrl', newSrc)}
            />
          </div>

          {/* Right Column - Content */}
          <div className="lg:w-1/2 flex flex-col justify-center px-8 lg:px-16 py-12 lg:py-0">
            {/* Logo */}
            {logoUrl && (
              <div className="mb-8">
                <CanvasImage
                  id="cover-logo"
                  src={logoUrl}
                  alt={logoAlt}
                  size="sm"
                  fit="contain"
                  align="left"
                  onUpdate={(newSrc) => handleUpdate('logoUrl', newSrc)}
                />
              </div>
            )}

            {/* Title */}
            <div className="mb-6">
              <CanvasText
                id="cover-title"
                variant="title"
                color={titleColor}
                fontFamily={fontFamily}
                className={titleClassName}
                onUpdate={(newText) => handleUpdate('title', newText)}
              >
                {title}
              </CanvasText>
            </div>

            {/* Paragraph */}
            <div>
              <CanvasText
                id="cover-paragraph"
                variant="body"
                color={paragraphColor}
                fontFamily={fontFamily}
                className={paragraphClassName}
                onUpdate={(newText) => handleUpdate('paragraph', newText)}
              >
                {paragraph}
              </CanvasText>
            </div>
          </div>
        </div>
      </div>
    </CanvasLayout>
  );
};

export default CoverLeftImageTextRightCanvas;
