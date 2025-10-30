import * as XLSX from 'xlsx';
import mammoth from 'mammoth';

export interface ParsedExcelData {
  sheets: Record<string, {
    raw: any[][];
    objects: any[];
    range: string;
    rowCount: number;
    columnCount: number;
  }>;
  summary: {
    totalSheets: number;
    sheetNames: string[];
  };
}

export interface ParsedWordData {
  text: string;
  wordCount: number;
  characterCount: number;
  paragraphs: string[];
  messages: any[];
}

export class DocumentParser {
  static async parseExcelFile(buffer: Buffer): Promise<ParsedExcelData> {
    try {
      console.log('DocumentParser: Starting Excel file parsing...');
      
      // Read the workbook from buffer
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      console.log('DocumentParser: Workbook loaded, sheet names:', workbook.SheetNames);
      
      const sheets: Record<string, any> = {};
      
      // Process each sheet
      workbook.SheetNames.forEach(sheetName => {
        console.log(`DocumentParser: Processing sheet "${sheetName}"`);
        const worksheet = workbook.Sheets[sheetName];
        
        // Get the range of the sheet
        const range = worksheet['!ref'] || 'A1:A1';
        
        // Convert to JSON objects (first row as headers)
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        const objectData = XLSX.utils.sheet_to_json(worksheet);
        
        // Calculate dimensions
        const rowCount = jsonData.length;
        const columnCount = rowCount > 0 ? Math.max(...jsonData.map((row: any) => Array.isArray(row) ? row.length : 0)) : 0;
        
        sheets[sheetName] = {
          raw: jsonData,
          objects: objectData,
          range,
          rowCount,
          columnCount
        };
        
        console.log(`DocumentParser: Sheet "${sheetName}" processed - ${rowCount} rows, ${columnCount} columns`);
      });
      
      const result: ParsedExcelData = {
        sheets,
        summary: {
          totalSheets: workbook.SheetNames.length,
          sheetNames: workbook.SheetNames
        }
      };
      
      console.log('DocumentParser: Excel parsing completed successfully');
      return result;
      
    } catch (error) {
      console.error('DocumentParser: Error parsing Excel file:', error);
      throw new Error(`Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  static async parseWordFile(buffer: Buffer): Promise<ParsedWordData> {
    try {
      console.log('DocumentParser: Starting Word file parsing...');
      
      // Extract text from Word document
      const result = await mammoth.extractRawText({ buffer });
      const text = result.value;
      const messages = result.messages;
      
      console.log('DocumentParser: Word text extracted, length:', text.length);
      
      // Split into paragraphs
      const paragraphs = text
        .split(/\n\s*\n/) // Split on double newlines
        .map(p => p.replace(/\n/g, ' ').trim()) // Replace single newlines with spaces
        .filter(p => p.length > 0); // Remove empty paragraphs
      
      // Calculate statistics
      const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
      const characterCount = text.length;
      
      const result_data: ParsedWordData = {
        text,
        wordCount,
        characterCount,
        paragraphs,
        messages
      };
      
      console.log(`DocumentParser: Word parsing completed - ${wordCount} words, ${paragraphs.length} paragraphs`);
      return result_data;
      
    } catch (error) {
      console.error('DocumentParser: Error parsing Word file:', error);
      throw new Error(`Failed to parse Word file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  static async parseCsvFile(buffer: Buffer): Promise<ParsedExcelData> {
    try {
      console.log('DocumentParser: Starting CSV file parsing...');
      
      // Convert buffer to string
      const csvContent = buffer.toString('utf-8');
      console.log('DocumentParser: CSV content length:', csvContent.length);
      
      // Parse CSV content using XLSX (which supports CSV)
      const workbook = XLSX.read(csvContent, { type: 'string' });
      console.log('DocumentParser: CSV parsed as workbook, sheet names:', workbook.SheetNames);
      
      const sheets: Record<string, any> = {};
      
      // Process the single sheet (CSV becomes one sheet)
      const sheetName = workbook.SheetNames[0] || 'Sheet1';
      console.log(`DocumentParser: Processing CSV as sheet "${sheetName}"`);
      const worksheet = workbook.Sheets[sheetName];
      
      // Get the range of the sheet
      const range = worksheet['!ref'] || 'A1:A1';
      
      // Convert to JSON objects (first row as headers)
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      const objectData = XLSX.utils.sheet_to_json(worksheet);
      
      // Calculate dimensions
      const rowCount = jsonData.length;
      const columnCount = jsonData.length > 0 ? Math.max(...jsonData.map((row: any) => Array.isArray(row) ? row.length : 0)) : 0;
      
      sheets[sheetName] = {
        raw: jsonData,
        objects: objectData,
        range,
        rowCount,
        columnCount
      };
      
      console.log(`DocumentParser: CSV parsing completed - ${rowCount} rows, ${columnCount} columns`);
      
      return {
        sheets,
        summary: {
          totalSheets: 1,
          sheetNames: [sheetName]
        }
      };
      
    } catch (error) {
      console.error('DocumentParser: Error parsing CSV file:', error);
      throw new Error(`Failed to parse CSV file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  static getFileType(filename: string, mimeType: string): 'excel' | 'word' | 'csv' | 'unknown' {
    const extension = filename.toLowerCase().split('.').pop();
    
    // Check by extension first
    if (extension === 'xlsx' || extension === 'xls') {
      return 'excel';
    }
    
    if (extension === 'csv') {
      return 'csv';
    }
    
    if (extension === 'docx' || extension === 'doc') {
      return 'word';
    }
    
    // Check by MIME type as fallback
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) {
      return 'excel';
    }
    
    if (mimeType === 'text/csv' || mimeType === 'application/csv') {
      return 'csv';
    }
    
    if (mimeType.includes('document') || mimeType.includes('word')) {
      return 'word';
    }
    
    return 'unknown';
  }
  
  static isDocumentFile(filename: string, mimeType: string): boolean {
    const fileType = this.getFileType(filename, mimeType);
    return fileType === 'excel' || fileType === 'word' || fileType === 'csv';
  }
}
