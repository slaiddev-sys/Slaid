import React, { useState, useEffect } from 'react';
import { useFigmaSelection, FigmaText } from '../../figma';
import TextPopup from '../../figma/TextPopup';
import { CanvasOverlayProvider } from '../../figma/CanvasOverlay';

export interface IndexAgendaGrid3x4Props {
  title?: string;
  description?: string;
  agenda?: Array<{
    title: string;
    duration?: string;
    description?: string;
  }>;
  layout?: {
    showTitle?: boolean;
    showDescription?: boolean;
    showAgenda?: boolean;
  };
  fontFamily?: string;
  titleColor?: string;
  className?: string;
  useFixedDimensions?: boolean;
  canvasWidth?: number;
  canvasHeight?: number;
  onUpdate?: (updates: any) => void;
}

export default function Index_AgendaGrid3x4({
  title = 'Meeting Agenda',
  description = '',
  agenda = [
    { title: 'Market Analysis', duration: '15 min', description: 'Industry trends' },
    { title: 'Financial Performance', duration: '20 min', description: 'Revenue growth' },
    { title: 'Customer Insights', duration: '15 min', description: 'Voice of customer' },
    { title: 'Product Roadmap', duration: '25 min', description: 'Development pipeline' },
    { title: 'Sales Strategy', duration: '20 min', description: 'GTM approach' },
    { title: 'Digital Transformation', duration: '15 min', description: 'Technology initiatives' }
  ],
  layout = {
    showTitle: true,
    showDescription: false,
    showAgenda: true
  },
  fontFamily = 'font-helvetica-neue',
  titleColor = 'text-gray-900',
  className = '',
  useFixedDimensions = false,
  canvasWidth = 1280,
  canvasHeight = 720,
  onUpdate
}: IndexAgendaGrid3x4Props) {

  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentAgenda, setCurrentAgenda] = useState(agenda);

  useEffect(() => {
    setCurrentTitle(title);
  }, [title]);

  useEffect(() => {
    setCurrentAgenda(agenda);
  }, [agenda]);

  const handleTitleTextChange = (newText: string) => {
    setCurrentTitle(newText);
    if (onUpdate) {
      onUpdate({ title: newText });
    }
  };

  const handleAgendaItemChange = (index: number, field: 'title' | 'description', newText: string) => {
    setCurrentAgenda(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: newText } : item
    ));
    if (onUpdate) {
      const updatedAgenda = currentAgenda.map((item, i) => 
        i === index ? { ...item, [field]: newText } : item
      );
      onUpdate({ agenda: updatedAgenda });
    }
  };

  return (
    <section className="agenda-grid-3x4 px-6 lg:px-12 pt-8 lg:pt-12 pb-6 lg:pb-8 bg-white w-full h-full min-h-[400px]">
      {layout.showTitle && (
        <div className="text-center mb-8">
          <h1 className="text-2xl lg:text-3xl xl:text-4xl font-normal font-helvetica-neue leading-none tracking-tighter text-center break-words">
            {currentTitle}
          </h1>
        </div>
      )}

      {layout.showAgenda && (
        <div className="grid grid-cols-3 gap-6 lg:gap-8">
          {currentAgenda.slice(0, 12).map((item, index) => (
            <div key={index} className="relative bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-semibold mb-3">
                {String(index + 1).padStart(2, '0')}
              </div>
              
              <div className="mb-2">
                <h3 className="font-semibold text-gray-900 break-words text-sm">
                  {item.title}
                </h3>
              </div>
              
              {item.duration && (
                <div className="text-sm text-blue-600 font-medium mb-2">
                  {item.duration}
                </div>
              )}
              
              {item.description && (
                <div className="text-xs text-gray-600 break-words">
                  {item.description}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
