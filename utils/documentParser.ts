import * as XLSX from 'xlsx';
import mammoth from 'mammoth';

export interface ParsedExcelData {
  sheets: Record<string, {
    raw: any[][];
    objects: any[];
    range: string;
    rowCount: number;
    columnCount: number;
    // Enhanced data extraction
    formulas: Record<string, string>; // Cell formulas (A1: "=SUM(B1:B10)")
    formatting: Record<string, any>; // Cell formatting info
    mergedCells: any[]; // Merged cell ranges
    columnWidths: number[]; // Column width information
    rowHeights: number[]; // Row height information
    dataTypes: Record<string, string>; // Cell data types
    comments: Record<string, string>; // Cell comments
  }>;
  summary: {
    totalSheets: number;
    sheetNames: string[];
    // Enhanced metadata
    fileMetadata: {
      author?: string;
      created?: Date;
      modified?: Date;
      title?: string;
      subject?: string;
      keywords?: string;
    };
    hasFormulas: boolean;
    hasCharts: boolean;
    hasPivotTables: boolean;
    totalCells: number;
    totalFormulas: number;
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
      console.log('DocumentParser: Starting ENHANCED Excel file parsing...');
      
      // Read the workbook from buffer with enhanced options
      const workbook = XLSX.read(buffer, { 
        type: 'buffer',
        cellFormula: true,  // Extract formulas
        cellStyles: true,   // Extract formatting
        cellDates: true,    // Parse dates properly
        cellNF: true,       // Number formats
        cellText: false,    // Don't convert everything to text
        bookProps: true,    // Extract metadata
        bookSheets: true,   // Sheet properties
        bookVBA: false      // Skip VBA for security
      });
      
      console.log('DocumentParser: Enhanced workbook loaded, sheet names:', workbook.SheetNames);
      console.log('DocumentParser: Workbook structure:', {
        hasProps: !!workbook.Props,
        hasCustprops: !!workbook.Custprops,
        propsKeys: workbook.Props ? Object.keys(workbook.Props) : 'none',
        custpropsKeys: workbook.Custprops ? Object.keys(workbook.Custprops) : 'none'
      });
      
      // Extract file metadata with safe access
      let fileMetadata;
      try {
        fileMetadata = {
          author: workbook.Props?.Author || workbook.Custprops?.Author || 'Unknown',
          created: workbook.Props?.CreatedDate || workbook.Custprops?.CreatedDate || null,
          modified: workbook.Props?.ModifiedDate || workbook.Custprops?.ModifiedDate || null,
          title: workbook.Props?.Title || workbook.Custprops?.Title || 'Untitled',
          subject: workbook.Props?.Subject || workbook.Custprops?.Subject || '',
          keywords: workbook.Props?.Keywords || workbook.Custprops?.Keywords || ''
        };
        console.log('DocumentParser: File metadata extracted successfully');
      } catch (metadataError) {
        console.error('DocumentParser: Error extracting metadata:', metadataError);
        fileMetadata = {
          author: 'Unknown',
          created: null,
          modified: null,
          title: 'Untitled',
          subject: '',
          keywords: ''
        };
      }
      
      const sheets: Record<string, any> = {};
      let totalCells = 0;
      let totalFormulas = 0;
      let hasFormulas = false;
      let hasCharts = false;
      let hasPivotTables = false;
      
      // Process each sheet with enhanced extraction
      workbook.SheetNames.forEach(sheetName => {
        console.log(`DocumentParser: Processing sheet "${sheetName}" with enhanced extraction...`);
        
        try {
          const worksheet = workbook.Sheets[sheetName];
          if (!worksheet) {
            console.warn(`DocumentParser: Sheet "${sheetName}" is undefined, skipping...`);
            return;
          }
          
          // Get the range of the sheet
          const range = worksheet['!ref'] || 'A1:A1';
          console.log(`DocumentParser: Sheet "${sheetName}" range:`, range);
          
          // Convert to JSON objects (first row as headers)
          console.log(`DocumentParser: Converting sheet "${sheetName}" to JSON...`);
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          const objectData = XLSX.utils.sheet_to_json(worksheet);
          console.log(`DocumentParser: Sheet "${sheetName}" converted successfully`);
        
        // Calculate dimensions
        const rowCount = jsonData.length;
        const columnCount = rowCount > 0 ? Math.max(...jsonData.map((row: any) => Array.isArray(row) ? row.length : 0)) : 0;
        
        // ENHANCED: Extract formulas from each cell
        const formulas: Record<string, string> = {};
        const formatting: Record<string, any> = {};
        const dataTypes: Record<string, string> = {};
        const comments: Record<string, string> = {};
        
        // Iterate through all cells to extract enhanced data
        Object.keys(worksheet).forEach(cellAddress => {
          if (cellAddress.startsWith('!')) return; // Skip metadata
          
          try {
            const cell = worksheet[cellAddress];
            if (!cell) return; // Skip empty cells
            
            totalCells++;
            
            // Extract formulas
            if (cell.f) {
              formulas[cellAddress] = cell.f;
              totalFormulas++;
              hasFormulas = true;
            }
            
            // Extract data types
            if (cell.t) {
              dataTypes[cellAddress] = cell.t; // 'n' = number, 's' = string, 'b' = boolean, 'd' = date
            }
            
            // Extract formatting (if available)
            if (cell.s) {
              try {
                formatting[cellAddress] = {
                  numFmt: cell.s.numFmt || null,
                  font: cell.s.font || null,
                  fill: cell.s.fill || null,
                  border: cell.s.border || null,
                  alignment: cell.s.alignment || null
                };
              } catch (formatError) {
                console.warn(`Warning: Could not extract formatting for cell ${cellAddress}:`, formatError);
              }
            }
            
            // Extract comments
            if (cell.c && Array.isArray(cell.c) && cell.c.length > 0) {
              try {
                comments[cellAddress] = cell.c.map((comment: any) => comment.t || comment).join('; ');
              } catch (commentError) {
                console.warn(`Warning: Could not extract comments for cell ${cellAddress}:`, commentError);
              }
            }
          } catch (cellError) {
            console.warn(`Warning: Could not process cell ${cellAddress}:`, cellError);
          }
        });
        
        // Extract merged cells
        const mergedCells = worksheet['!merges'] || [];
        
        // Extract column widths and row heights with error handling
        let columnWidths: number[] = [];
        let rowHeights: number[] = [];
        
        try {
          columnWidths = worksheet['!cols'] ? worksheet['!cols'].map((col: any) => col?.width || 0) : [];
        } catch (error) {
          console.warn('Warning: Could not extract column widths:', error);
          columnWidths = [];
        }
        
        try {
          rowHeights = worksheet['!rows'] ? worksheet['!rows'].map((row: any) => row?.hpt || 0) : [];
        } catch (error) {
          console.warn('Warning: Could not extract row heights:', error);
          rowHeights = [];
        }
        
        // Check for charts and pivot tables (basic detection)
        try {
          if (worksheet['!charts']) hasCharts = true;
          if (worksheet['!pivots']) hasPivotTables = true;
        } catch (error) {
          console.warn('Warning: Could not detect charts/pivot tables:', error);
        }
        
        sheets[sheetName] = {
          raw: jsonData,
          objects: objectData,
          range,
          rowCount,
          columnCount,
          // Enhanced data
          formulas,
          formatting,
          mergedCells,
          columnWidths,
          rowHeights,
          dataTypes,
          comments
        };
        
          console.log(`DocumentParser: Sheet "${sheetName}" enhanced processing complete:`);
          console.log(`  - ${rowCount} rows, ${columnCount} columns`);
          console.log(`  - ${Object.keys(formulas).length} formulas found`);
          console.log(`  - ${mergedCells.length} merged cell ranges`);
          console.log(`  - ${Object.keys(comments).length} comments`);
          
        } catch (sheetError) {
          console.error(`DocumentParser: Error processing sheet "${sheetName}":`, sheetError);
          
          // Add minimal sheet data on error
          sheets[sheetName] = {
            raw: [],
            objects: [],
            range: 'A1:A1',
            rowCount: 0,
            columnCount: 0,
            formulas: {},
            formatting: {},
            mergedCells: [],
            columnWidths: [],
            rowHeights: [],
            dataTypes: {},
            comments: {}
          };
        }
      });
      
      const result: ParsedExcelData = {
        sheets,
        summary: {
          totalSheets: workbook.SheetNames.length,
          sheetNames: workbook.SheetNames,
          fileMetadata,
          hasFormulas,
          hasCharts,
          hasPivotTables,
          totalCells,
          totalFormulas
        }
      };
      
      console.log('DocumentParser: ENHANCED Excel parsing completed successfully');
      console.log(`  - Total cells processed: ${totalCells}`);
      console.log(`  - Total formulas extracted: ${totalFormulas}`);
      console.log(`  - File metadata: ${JSON.stringify(fileMetadata, null, 2)}`);
      
      return result;
      
    } catch (error) {
      console.error('DocumentParser: Error in enhanced Excel parsing:', error);
      console.error('DocumentParser: Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      
      // Return a minimal valid result instead of throwing
      const fallbackResult: ParsedExcelData = {
        sheets: {},
        summary: {
          totalSheets: 0,
          sheetNames: [],
          fileMetadata: {
            author: 'Unknown',
            created: null,
            modified: null,
            title: file.name || 'Untitled',
            subject: '',
            keywords: ''
          },
          hasFormulas: false,
          hasCharts: false,
          hasPivotTables: false,
          totalCells: 0,
          totalFormulas: 0
        }
      };
      
      console.log('DocumentParser: Returning fallback result due to parsing error');
      return fallbackResult;
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
