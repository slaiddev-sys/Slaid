"use client";

import React, { useState } from 'react';

// Import SlaidAI component system (same as editor)
import { TextBlock, BackgroundBlock, ImageBlock } from '../../components/blocks';
import { Cover_LeftImageTextRight, Cover_TextCenter, Cover_LeftTitleRightBodyUnderlined, Cover_ProductLayout } from '../../components/layouts/Cover';
import { BackCover_ThankYouWithImage } from '../../components/layouts/BackCover';
import { Index_LeftAgendaRightImage, Index_LeftAgendaRightText, Index_AgendaGrid3x4 } from '../../components/layouts/Index/index';
import { Quote_MissionStatement, Quote_LeftTextRightImage } from '../../components/layouts/Quote/index';
import { Impact_KPIOverview, Impact_SustainabilityMetrics, Impact_ImageMetrics } from '../../components/layouts/Impact/index';
import { Team_AdaptiveGrid, Team_MemberProfile } from '../../components/layouts/Team/index';
import { Metrics_FinancialsSplit, Metrics_FullWidthChart } from '../../components/layouts/Metrics/index';
import { Lists_LeftTextRightImage, Lists_GridLayout, Lists_LeftTextRightImageDescription, Lists_CardsLayout, Lists_CardsLayoutRight } from '../../components/layouts/Lists/index';
import { Market_SizeAnalysis } from '../../components/layouts/Market/index';
import { Competition_Analysis } from '../../components/layouts/Competition/index';
import { Roadmap_Timeline } from '../../components/layouts/Roadmap/index';
import { Product_iPhoneStandalone, Product_MacBookCentered, Product_iPhoneInCenter, Product_PhysicalProduct } from '../../components/layouts/Product/index';
import { McBook_Feature, iPhone_HandFeature, iPhone_StandaloneFeature } from '../../components/layouts/Product/index';
import { Pricing_Plans } from '../../components/layouts/Pricing/index';
import { Content_TextImageDescription } from '../../components/layouts/Content/index';

export default function TestWordPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [structuredContent, setStructuredContent] = useState<any>(null);
  const [presentationSlides, setPresentationSlides] = useState<any[]>([]);
  const [error, setError] = useState<string>('');

  // Component map for rendering (same as editor)
  const componentMap: { [key: string]: React.ComponentType<any> } = {
    TextBlock,
    BackgroundBlock,
    ImageBlock,
    Cover_LeftImageTextRight,
    Cover_TextCenter,
    Cover_LeftTitleRightBodyUnderlined,
    Cover_ProductLayout,
    BackCover_ThankYouWithImage,
    Index_LeftAgendaRightImage,
    Index_LeftAgendaRightText,
    Index_AgendaGrid3x4,
    Quote_MissionStatement,
    Quote_LeftTextRightImage,
    Impact_KPIOverview,
    Impact_SustainabilityMetrics,
    Impact_ImageMetrics,
    Team_AdaptiveGrid,
    Team_MemberProfile,
    Metrics_FinancialsSplit,
    Metrics_FullWidthChart,
    Lists_LeftTextRightImage,
    Lists_GridLayout,
    Lists_LeftTextRightImageDescription,
    Lists_CardsLayout,
    Lists_CardsLayoutRight,
    Market_SizeAnalysis,
    Competition_Analysis,
    Roadmap_Timeline,
    Product_iPhoneStandalone,
    Product_MacBookCentered,
    Product_iPhoneInCenter,
    Product_PhysicalProduct,
    McBook_Feature,
    iPhone_HandFeature,
    iPhone_StandaloneFeature,
    Pricing_Plans,
    Content_TextImageDescription,
    // Legacy component fallbacks
    SectionSpace: () => <div className="h-4" />
  };

  // Function to render a slide block (same as editor)
  const renderBlock = (block: any, index: number) => {
    console.log(`🔷 Rendering block ${index}: ${block.type}`);
    
    const Component = componentMap[block.type];
    if (!Component) {
      console.warn(`❌ Unknown component type: ${block.type}`);
      return (
        <div key={index} className="p-4 bg-red-50 border border-red-200 rounded">
          <p className="text-red-800">Unknown component: {block.type}</p>
        </div>
      );
    }

    const propsToPass = block.props || {};
    
    // Add fixed dimensions for consistent canvas sizing (same as editor)
    propsToPass.useFixedDimensions = true;
    propsToPass.canvasWidth = 881;
    propsToPass.canvasHeight = 495;
    
    return React.createElement(Component, { key: index, ...propsToPass });
  };

  const handleFileUpload = async (selectedFile: File) => {
    setIsUploading(true);
    setError('');
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      setUploadResult(result);
      console.log('Upload result:', result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!uploadResult) return;

    setIsAnalyzing(true);
    setError('');

    try {
      // First, get AI analysis like before
      const analysisResponse = await fetch('/api/test-word-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileData: uploadResult,
          prompt: 'Please analyze this Word document and create a structured presentation. Extract all headings, paragraphs, bullet points, tables, and structure. Create actual slide layouts with the content applied.'
        }),
      });

      const analysisResult = await analysisResponse.json();
      
      if (!analysisResponse.ok) {
        throw new Error(analysisResult.error || 'Analysis failed');
      }

      setAnalysisResult(analysisResult.analysis);
      setStructuredContent(analysisResult.structuredContent);

      // Now generate actual presentation slides using the same API as editor
      const generateResponse = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `Create a professional presentation from this Word document content. Use appropriate layouts and extract the actual text content from the document. Create 8-12 slides with proper layout selection.`,
          existingPresentation: undefined,
          currentSlideIndex: 0,
          fileData: uploadResult
        }),
      });

      const generateResult = await generateResponse.json();
      
      if (!generateResponse.ok) {
        throw new Error(generateResult.error || 'Slide generation failed');
      }

      console.log('Generated slides:', generateResult);
      setPresentationSlides(generateResult.slides || []);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Word Document → Presentation Layouts Test</h1>
        
        {/* File Upload Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Step 1: Upload Word Document</h2>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              type="file"
              accept=".docx,.doc"
              onChange={(e) => {
                const selectedFile = e.target.files?.[0];
                if (selectedFile) {
                  setFile(selectedFile);
                  handleFileUpload(selectedFile);
                }
              }}
              className="hidden"
              id="file-input"
            />
            <label
              htmlFor="file-input"
              className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {isUploading ? 'Uploading...' : 'Choose Word Document'}
            </label>
            {file && (
              <p className="mt-2 text-sm text-gray-600">
                Selected: {file.name}
              </p>
            )}
          </div>

          {/* Upload Result */}
          {uploadResult && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <h3 className="font-semibold text-green-800">Upload Successful!</h3>
              <div className="mt-2 text-sm text-green-700">
                <p><strong>File Type:</strong> {uploadResult.type}</p>
                <p><strong>File Name:</strong> {uploadResult.fileName}</p>
                <p><strong>Word Count:</strong> {uploadResult.processedData?.wordCount}</p>
                <p><strong>Paragraph Count:</strong> {uploadResult.processedData?.paragraphCount}</p>
              </div>
            </div>
          )}
        </div>

        {/* Analysis Section */}
        {uploadResult && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Step 2: Generate Presentation Layouts</h2>
            
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
            >
              {isAnalyzing ? 'Generating Slides...' : 'Generate Presentation with Word Content'}
            </button>

            {/* Analysis Result */}
            {analysisResult && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <h3 className="font-semibold text-blue-800">AI Content Analysis:</h3>
                <div className="mt-2 text-blue-700 whitespace-pre-wrap max-h-48 overflow-y-auto text-sm">
                  {analysisResult}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Presentation Slides Preview */}
        {presentationSlides.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">📋 Generated Presentation Slides</h2>
            <p className="text-gray-600 mb-6">
              Compare this with the editor page to see if the content extraction and layout application matches.
            </p>
            
            <div className="space-y-8">
              {presentationSlides.map((slide: any, index: number) => (
                <div key={slide.id || index} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Slide Header */}
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">
                        Slide {index + 1}: {slide.blocks?.find((b: any) => b.props?.title)?.props?.title || 'Untitled'}
                      </h3>
                      <div className="text-sm text-gray-500">
                        {slide.blocks?.length || 0} blocks
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Layout: {slide.blocks?.find((b: any) => b.type !== 'BackgroundBlock')?.type || 'Unknown'}
                    </div>
                  </div>
                  
                  {/* Slide Content */}
                  <div className="bg-white">
                    <div 
                      className="relative overflow-hidden"
                      style={{
                        width: '881px',
                        height: '495px',
                        transform: 'scale(0.7)',
                        transformOrigin: 'top left',
                        margin: '0 0 -150px 0' // Adjust for scaling
                      }}
                    >
                      <div className="w-full h-full relative">
                        {/* Render all blocks for this slide */}
                        {slide.blocks?.map((block: any, blockIndex: number) => (
                          <div key={`${slide.id}-${blockIndex}`}>
                            {renderBlock(block, blockIndex)}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Summary */}
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <h4 className="font-medium text-yellow-800">📊 Presentation Summary:</h4>
              <div className="text-sm text-yellow-700 mt-2 space-y-1">
                <div>• <strong>Total Slides:</strong> {presentationSlides.length}</div>
                <div>• <strong>Layout Types Used:</strong> {
                  [...new Set(presentationSlides.flatMap((slide: any) => 
                    slide.blocks?.filter((b: any) => b.type !== 'BackgroundBlock').map((b: any) => b.type) || []
                  ))].join(', ')
                }</div>
                <div>• <strong>Content Applied:</strong> {presentationSlides.some((slide: any) => 
                  slide.blocks?.some((block: any) => 
                    block.props?.title || block.props?.paragraph || block.props?.description
                  )
                ) ? 'Yes' : 'No'}</div>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <h3 className="font-semibold text-red-800">Error:</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <h3 className="font-semibold text-yellow-800">Test Instructions:</h3>
          <ol className="mt-2 text-yellow-700 list-decimal list-inside space-y-1">
            <li>Upload a Word document (.docx or .doc)</li>
            <li>Click "Generate Presentation" to create actual slide layouts</li>
            <li>Compare the rendered slides with what appears in the editor</li>
            <li>Check if the Word content is properly extracted and applied</li>
            <li>Verify layout selection matches the content type</li>
          </ol>
          
          <div className="mt-4 p-3 bg-yellow-100 rounded">
            <h4 className="font-medium text-yellow-800">What We're Testing:</h4>
            <ul className="text-sm text-yellow-700 list-disc list-inside mt-1 space-y-1">
              <li>Same content extraction as editor page</li>
              <li>Same layout rendering as editor page</li>
              <li>Same component system and styling</li>
              <li>Content-to-layout mapping accuracy</li>
              <li>Visual consistency between test and editor</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
