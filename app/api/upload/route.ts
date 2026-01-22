import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { DocumentParser } from '../../../utils/documentParser';
import { FileDataProcessor } from '../../../utils/fileDataProcessor';

// Configure max duration for large file processing (5 minutes)
export const maxDuration = 300; // 5 minutes in seconds

export async function POST(request: NextRequest) {
  try {
    console.log('Upload API: Starting file upload process...');
    const formData = await request.formData();
    const file = formData.get('file') as File;
    console.log('Upload API: Extracted file from form data:', file ? `${file.name} (${file.size} bytes)` : 'null');
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type - ONLY images, Word, Excel, and CSV files allowed
    const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
    const documentTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/msword', // .doc
      'text/csv', // .csv
      'application/csv' // .csv alternative
    ];
    const allowedTypes = [...imageTypes, ...documentTypes];
    
    const isImage = imageTypes.includes(file.type);
    const isDocument = documentTypes.includes(file.type) || DocumentParser.isDocumentFile(file.name, file.type);
    
    if (!allowedTypes.includes(file.type) && !isDocument) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images (JPEG, PNG, GIF, WebP, AVIF), Word documents (.docx, .doc), Excel files (.xlsx, .xls), and CSV files (.csv) are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 100MB for large files support)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      return NextResponse.json(
        { error: `File too large (${sizeMB}MB). Maximum size is 100MB.` },
        { status: 400 }
      );
    }
    
    console.log(`📊 File size: ${(file.size / (1024 * 1024)).toFixed(2)}MB (max: 100MB)`);

    // Generate unique filename
    const fileExtension = path.extname(file.name);
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const uniqueFilename = `${timestamp}-${randomString}${fileExtension}`;

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Handle different file types
    if (isDocument) {
      // Process document files
      console.log('Upload API: Processing document file...');
      
      try {
        const fileType = DocumentParser.getFileType(file.name, file.type);
        let parsedData;
        
        if (fileType === 'excel') {
          parsedData = await DocumentParser.parseExcelFile(buffer);
        } else if (fileType === 'csv') {
          parsedData = await DocumentParser.parseCsvFile(buffer);
        } else if (fileType === 'word') {
          parsedData = await DocumentParser.parseWordFile(buffer);
        } else {
          throw new Error('Unsupported document type');
        }
        
        // Process the parsed data using FileDataProcessor
        const processedData = (fileType === 'excel' || fileType === 'csv')
          ? FileDataProcessor.processExcelData(parsedData, file.name)
          : FileDataProcessor.processWordData(parsedData, file.name);
        
        console.log('Upload API: Document processed successfully');
        
        // Return processed document data
        return NextResponse.json({
          success: true,
          type: 'document',
          fileType,
          filename: file.name,
          originalName: file.name,
          size: file.size,
          mimeType: file.type,
          processedData,
          uploadedAt: new Date().toISOString()
        });
        
      } catch (parseError) {
        console.error('Upload API: Document parsing error:', parseError);
        return NextResponse.json(
          { error: `Failed to parse document: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}` },
          { status: 400 }
        );
      }
      
    } else {
      // Handle image files (existing logic)
      
      // Save to public/images directory
      const filePath = path.join(process.cwd(), 'public', 'images', uniqueFilename);
      console.log('Upload API: Attempting to write image file to:', filePath);
      await writeFile(filePath, buffer);
      console.log('Upload API: Image file written successfully');

      // Generate the public URL
      const publicUrl = `/images/${uniqueFilename}`;

      // Detect potential image variant based on filename and analyze content
      const variant = detectImageVariant(file.name, file.size);

      // Return success response with image info
      return NextResponse.json({
        success: true,
        type: 'image',
        url: publicUrl,
        filename: uniqueFilename,
        originalName: file.name,
        size: file.size,
        mimeType: file.type,
        suggestedVariant: variant,
        uploadedAt: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('Upload error:', error);
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    
    return NextResponse.json(
      { error: `Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

/**
 * Intelligently detect the most appropriate ImageBlock variant
 * based on filename, size, and other factors
 */
function detectImageVariant(filename: string, fileSize: number): string {
  const name = filename.toLowerCase();
  
  // Check for specific keywords in filename
  if (name.includes('logo') || name.includes('brand')) {
    return 'logo';
  }
  
  if (name.includes('icon') || name.includes('symbol')) {
    return 'icon';
  }
  
  if (name.includes('avatar') || name.includes('profile') || name.includes('headshot') || 
      name.includes('portrait') || name.includes('photo')) {
    return 'portrait';
  }
  
  if (name.includes('product') || name.includes('mockup') || name.includes('app') || 
      name.includes('interface') || name.includes('ui') || name.includes('screenshot')) {
    return 'product';
  }
  
  if (name.includes('cover') || name.includes('hero') || name.includes('header') || 
      name.includes('banner')) {
    return 'cover';
  }
  
  if (name.includes('pattern') || name.includes('texture') || name.includes('background') || 
      name.includes('bg')) {
    return 'backgroundPattern';
  }
  
  if (name.includes('illustration') || name.includes('art') || name.includes('drawing') || 
      name.includes('graphic') || name.includes('concept')) {
    return 'illustration';
  }
  
  // Size-based detection (as fallback)
  if (fileSize < 50 * 1024) { // Less than 50KB, likely an icon
    return 'icon';
  }
  
  if (fileSize < 200 * 1024) { // Less than 200KB, could be logo or portrait
    return 'logo';
  }
  
  if (fileSize > 2 * 1024 * 1024) { // Larger than 2MB, likely a cover image
    return 'cover';
  }
  
  // Default fallback
  return 'illustration';
}

// Optional: Add GET method to list uploaded images
export async function GET() {
  try {
    // This could be used to list uploaded images if needed
    return NextResponse.json({
      message: 'Upload endpoint ready',
      supportedTypes: {
        images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'],
        documents: ['Excel (.xlsx, .xls)', 'Word (.docx, .doc)', 'CSV (.csv)']
      },
      maxSize: '100MB'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 