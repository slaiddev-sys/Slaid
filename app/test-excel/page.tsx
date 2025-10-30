"use client";

import React, { useState } from 'react';
import ChartBlock from '../../components/blocks/ChartBlock';

export default function TestExcelPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [comprehensiveAnalysis, setComprehensiveAnalysis] = useState<string>('');
  const [chartData, setChartData] = useState<any>(null);
  const [error, setError] = useState<string>('');

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
      const response = await fetch('/api/test-excel-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileData: uploadResult,
          prompt: 'Please analyze this Excel file and tell me exactly what data you can see. List all the values, headers, and structure you can extract from this file.'
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Analysis failed');
      }

      setAnalysisResult(result.analysis);
      setComprehensiveAnalysis(result.comprehensiveAnalysis || '');
      setChartData(result.chartData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Excel Analysis Test</h1>
        
        {/* File Upload Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Step 1: Upload Excel File</h2>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              type="file"
              accept=".xlsx,.xls"
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
              {isUploading ? 'Uploading...' : 'Choose Excel File'}
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
              <pre className="mt-2 text-sm text-green-700 overflow-auto max-h-40">
                {JSON.stringify(uploadResult, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Analysis Section */}
        {uploadResult && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Step 2: AI Analysis</h2>
            
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Excel Data with AI'}
            </button>

            {/* Comprehensive Analysis Result */}
            {comprehensiveAnalysis && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <h3 className="font-semibold text-green-800">🔍 Comprehensive Data Analysis:</h3>
                <div className="mt-2 text-green-700 whitespace-pre-wrap text-sm max-h-80 overflow-y-auto">
                  {comprehensiveAnalysis}
                </div>
              </div>
            )}

            {/* Presentation Content */}
            {analysisResult && (
              <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-md">
                <h3 className="font-semibold text-purple-800">🎯 Presentation Content:</h3>
                <div className="mt-2 text-purple-700 whitespace-pre-wrap text-sm max-h-80 overflow-y-auto">
                  {analysisResult}
                </div>
              </div>
            )}

            {/* Interactive Charts */}
            {chartData && (
              <div className="mt-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">📊 Interactive Chart Visualizations</h3>
                
                {/* Line Chart */}
                {chartData.lineChart && (
                  <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                    <div className="mb-4">
                      <h4 className="text-lg font-semibold text-gray-900 mb-1">Units Sold Trend</h4>
                      <p className="text-sm text-gray-600">Monthly units sold over time</p>
                    </div>
                    <ChartBlock {...chartData.lineChart} />
                  </div>
                )}

                {/* Bar Chart */}
                {chartData.barChart && (
                  <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                    <div className="mb-4">
                      <h4 className="text-lg font-semibold text-gray-900 mb-1">Revenue Comparison</h4>
                      <p className="text-sm text-gray-600">Actual vs Goal Revenue (First 6 Months)</p>
                    </div>
                    <ChartBlock {...chartData.barChart} />
                  </div>
                )}
              </div>
            )}
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
            <li>Upload an Excel file (.xlsx or .xls)</li>
            <li>Check if the upload result shows the correct data structure</li>
            <li>Click "Analyze" to see what the AI actually extracts</li>
            <li>Compare the AI analysis with your actual Excel content</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
