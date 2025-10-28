interface ExcelData {
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

interface WordData {
  text: string;
  wordCount: number;
  characterCount: number;
  paragraphs: string[];
  messages: any[];
}

interface ProcessedData {
  type: 'excel' | 'word';
  fileName: string;
  summary: string;
  structuredData: any;
  promptContext: string;
}

export class FileDataProcessor {
  static processExcelData(data: ExcelData, fileName: string): ProcessedData {
    const sheets = data.sheets;
    const sheetNames = data.summary.sheetNames;
    
    // Extract key insights from Excel data
    let summary = `Excel file "${fileName}" contains ${data.summary.totalSheets} sheet(s): ${sheetNames.join(', ')}.`;
    let structuredData: any = {
      totalSheets: data.summary.totalSheets,
      sheets: {}
    };
    
    let promptContext = `Based on the Excel file "${fileName}" with the following data:\n\n`;

    // Process each sheet
    sheetNames.forEach(sheetName => {
      const sheet = sheets[sheetName];
      const hasData = sheet.objects.length > 0;
      
      if (hasData) {
        // Get column headers (first row) and ensure they are strings
        const headers = (sheet.raw[0] || []).map((header: any) => 
          header != null ? String(header).trim() : ''
        ).filter((header: string) => header.length > 0);
        const dataRows = sheet.objects;
        
        // Identify numeric columns for potential charts
        const numericColumns = this.identifyNumericColumns(dataRows, headers);
        const textColumns = headers.filter(h => !numericColumns.includes(h));
        
        structuredData.sheets[sheetName] = {
          headers,
          rowCount: sheet.rowCount,
          columnCount: sheet.columnCount,
          numericColumns,
          textColumns,
          sampleData: dataRows, // Include ALL data rows for complete analysis
          totalRows: dataRows.length
        };

        promptContext += `Sheet "${sheetName}":\n`;
        promptContext += `- ${sheet.rowCount} rows, ${sheet.columnCount} columns\n`;
        promptContext += `- Headers: ${headers.join(', ')}\n`;
        
        if (numericColumns.length > 0) {
          promptContext += `- Numeric data columns: ${numericColumns.join(', ')}\n`;
        }
        
        // Add sample data with better context
        if (dataRows.length > 0) {
          promptContext += `- All data rows (${dataRows.length} total):\n`;
          dataRows.forEach((row, idx) => {
            const rowStr = headers.map(h => `${h}: ${row[h] || 'N/A'}`).join(', ');
            promptContext += `  Row ${idx + 1}: ${rowStr}\n`;
          });
          
          // Add specific data insights for better AI understanding
          if (this.detectTimeSeriesData(headers, dataRows)) {
            promptContext += `- 📊 TIME SERIES DATA DETECTED: This appears to be time-based data suitable for trend analysis\n`;
          }
          
          if (this.detectFinancialData(headers, dataRows)) {
            promptContext += `- 💰 FINANCIAL DATA DETECTED: Contains monetary values, sales figures, or financial metrics\n`;
          }
          
          if (this.hasMonthlyData(headers)) {
            promptContext += `- 📅 MONTHLY DATA DETECTED: Contains monthly periods - ideal for seasonal/periodic analysis\n`;
            
            // Extract monthly data specifically
            const monthlyColumns = headers.filter(h => 
              typeof h === 'string' && ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december', 'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'].some(month => 
                h.toLowerCase().includes(month)
              )
            );
            promptContext += `- 📅 IDENTIFIED MONTHS: ${monthlyColumns.join(', ')}\n`;
          }
          
          // Identify key data rows for chart focus
          const totalRows = dataRows.filter(row => 
            Object.keys(row).some(key => key.toLowerCase().includes('total'))
          );
          if (totalRows.length > 0) {
            promptContext += `- 🎯 KEY METRIC ROWS IDENTIFIED: Focus on 'TOTAL' rows for primary chart data\n`;
            totalRows.forEach((row, idx) => {
              const totalRowData = headers.map(h => `${h}: ${row[h] || 'N/A'}`).join(', ');
              promptContext += `  TOTAL Row ${idx + 1}: ${totalRowData}\n`;
            });
          }
          
          // Extract the most important row (TOTAL SALES, TOTAL, etc.)
          // First look for rows where VALUES contain "TOTAL SALES", "Total Sales", etc.
          const primaryDataRow = dataRows.find(row => 
            Object.values(row).some(val => 
              typeof val === 'string' && (
                val.toLowerCase().includes('total sales') || 
                val.toLowerCase().includes('total') ||
                val.toLowerCase().includes('sales')
              )
            )
          ) || dataRows.find(row => 
            // Then look for rows where KEYS contain these terms
            Object.keys(row).some(key => 
              key.toLowerCase().includes('total sales') || 
              key.toLowerCase().includes('total') ||
              key.toLowerCase().includes('sales')
            )
          ) || dataRows.find(row => 
            // Finally, look for rows with the most numeric data
            Object.values(row).filter(val => !isNaN(Number(val)) && val !== null && val !== '').length > 3
          );
          
          if (primaryDataRow) {
            // Find the name of the primary data row
            const primaryDataRowName = Object.values(primaryDataRow).find(val => 
              typeof val === 'string' && (
                val.toLowerCase().includes('total sales') || 
                val.toLowerCase().includes('total') ||
                val.toLowerCase().includes('sales')
              )
            ) || Object.keys(primaryDataRow).find(key => 
              typeof primaryDataRow[key] === 'string' && 
              (key.toLowerCase().includes('total') || key.toLowerCase().includes('sales') || key === headers[0])
            ) || 'Total Sales';
            
            promptContext += `- 🚀 PRIMARY DATA ROW FOR CHART:\n`;
            const primaryRowData = headers.map(h => `${h}: ${primaryDataRow[h] || 'N/A'}`).join(', ');
            promptContext += `  ${primaryRowData}\n`;
            
            // Extract the actual values for months
            const monthlyValues = headers.filter(h => 
              typeof h === 'string' && ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'].some(month => 
                h.toLowerCase().includes(month)
              )
            ).map(h => ({
              month: h,
              value: primaryDataRow[h]
            })).filter(item => item.value && !isNaN(Number(String(item.value).replace(/[^\d.-]/g, ''))));
            
            if (monthlyValues.length > 0) {
              promptContext += `\n🎯 CRITICAL CHART DATA TO USE:\n`;
              promptContext += `Chart Type: line (for time series) or bar (for comparison)\n`;
              promptContext += `X-axis Labels: [${monthlyValues.map(item => `"${item.month}"`).join(', ')}]\n`;
              promptContext += `Y-axis Values: [${monthlyValues.map(item => {
                const numValue = Number(String(item.value).replace(/[^\d.-]/g, ''));
                return numValue;
              }).join(', ')}]\n`;
              promptContext += `Data Series Name: "Total Sales"\n`;
              promptContext += `MANDATORY: Use EXACTLY these labels and values for the chart\n\n`;
            }
          }
        }
        promptContext += '\n';
      }
    });

    // Generate summary insights
    const totalRows = Object.values(structuredData.sheets).reduce((sum: number, sheet: any) => sum + sheet.totalRows, 0);
    summary += ` Total data rows: ${totalRows}.`;
    
    // Suggest chart types based on data structure
    const suggestions = this.suggestVisualizationsFromExcel(structuredData);
    if (suggestions.length > 0) {
      promptContext += `Suggested visualizations: ${suggestions.join(', ')}\n\n`;
    }

    return {
      type: 'excel',
      fileName,
      summary,
      structuredData,
      promptContext
    };
  }

  static processWordData(data: WordData, fileName: string): ProcessedData {
    const text = data.text;
    const paragraphs = data.paragraphs;
    
    // Extract key insights from Word document
    const summary = `Word document "${fileName}" contains ${data.wordCount} words, ${data.characterCount} characters, and ${paragraphs.length} paragraphs.`;
    
    // Identify document structure
    const structuredData = {
      wordCount: data.wordCount,
      characterCount: data.characterCount,
      paragraphCount: paragraphs.length,
      sections: this.identifyDocumentSections(paragraphs),
      keyTopics: this.extractKeyTopics(text),
      hasNumbers: this.containsNumericalData(text)
    };

    let promptContext = `Based on the Word document "${fileName}":\n\n`;
    promptContext += `Document Overview:\n`;
    promptContext += `- ${data.wordCount} words, ${paragraphs.length} paragraphs\n`;
    
    if (structuredData.sections.length > 0) {
      promptContext += `- Document sections: ${structuredData.sections.join(', ')}\n`;
    }
    
    if (structuredData.keyTopics.length > 0) {
      promptContext += `- Key topics: ${structuredData.keyTopics.join(', ')}\n`;
    }
    
    promptContext += `\nDocument Content:\n`;
    // 🚨 CRITICAL FIX: Include ALL paragraphs, not just first 5
    paragraphs.forEach((para, idx) => {
      if (para.trim().length > 0) {
        promptContext += `${idx + 1}. ${para.trim()}\n`;
      }
    });
    
    // 🚨 EMERGENCY: Add complete text for comprehensive analysis with STRONG emphasis
    promptContext += `\n📄 COMPLETE DOCUMENT TEXT - MUST USE THIS CONTENT:\n${text}\n`;
    promptContext += `\n🚨🚨🚨 CRITICAL INSTRUCTIONS FOR AI:\n`;
    promptContext += `- EVERY slide MUST use content from the document above\n`;
    promptContext += `- DO NOT generate generic or placeholder content\n`;
    promptContext += `- Extract EXACT numbers, names, and statistics from the document\n`;
    promptContext += `- Use the specific company details, team names, and metrics provided\n`;
    promptContext += `- NEVER use environmental data, generic metrics, or made-up content\n`;

    return {
      type: 'word',
      fileName,
      summary,
      structuredData,
      promptContext
    };
  }

  private static identifyNumericColumns(data: any[], headers: string[]): string[] {
    if (data.length === 0) return [];
    
    return headers.filter(header => {
      const values = data.slice(0, 10).map(row => row[header]); // Check first 10 rows
      const numericValues = values.filter(val => 
        val !== null && val !== undefined && val !== '' && !isNaN(Number(val))
      );
      return numericValues.length > values.length * 0.7; // 70% numeric threshold
    });
  }

  private static suggestVisualizationsFromExcel(structuredData: any): string[] {
    const suggestions: string[] = [];
    
    Object.values(structuredData.sheets).forEach((sheet: any) => {
      const { headers, sampleData, numericColumns, textColumns, totalRows } = sheet;
      
      // Analyze the data context for better suggestions
      const isTimeSeriesData = this.detectTimeSeriesData(headers, sampleData);
      const isFinancialData = this.detectFinancialData(headers, sampleData);
      const isSalesData = this.detectSalesData(headers, sampleData);
      
      if (isTimeSeriesData) {
        suggestions.push('Line chart for time series trends');
        suggestions.push('Area chart for cumulative trends');
        if (numericColumns.length > 1) {
          suggestions.push('Multi-series line chart');
        }
      }
      
      if (isFinancialData || isSalesData) {
        suggestions.push('Bar chart for financial comparison');
        suggestions.push('Column chart for period analysis');
        if (isTimeSeriesData) {
          suggestions.push('Revenue trend line chart');
        }
      }
      
      // Month-based data suggestions
      if (this.hasMonthlyData(headers)) {
        suggestions.push('Monthly performance bar chart');
        suggestions.push('Seasonal trend line chart');
      }
      
      // General suggestions based on data structure
      if (numericColumns.length >= 2) {
        suggestions.push('Multi-series bar chart');
        suggestions.push('Comparison chart');
      }
      
      if (numericColumns.length >= 1 && textColumns.length >= 1) {
        suggestions.push('Category-based bar chart');
      }
      
      if (totalRows > 10 && numericColumns.length >= 1) {
        suggestions.push('KPI metrics display');
      }
    });
    
    return [...new Set(suggestions)]; // Remove duplicates
  }
  
  private static detectTimeSeriesData(headers: string[], sampleData: any[]): boolean {
    const timeKeywords = ['date', 'time', 'month', 'year', 'quarter', 'week', 'day', 'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
    return headers.some(header => 
      typeof header === 'string' && timeKeywords.some(keyword => header.toLowerCase().includes(keyword))
    );
  }
  
  private static detectFinancialData(headers: string[], sampleData: any[]): boolean {
    const financialKeywords = ['sales', 'revenue', 'profit', 'cost', 'price', 'amount', 'total', 'usd', 'eur', 'gbp', 'dollar', 'euro', 'pound', '$', '€', '£'];
    return headers.some(header => 
      typeof header === 'string' && financialKeywords.some(keyword => header.toLowerCase().includes(keyword))
    ) || sampleData.some(row => 
      Object.values(row).some(value => 
        typeof value === 'string' && financialKeywords.some(keyword => 
          value.toLowerCase().includes(keyword)
        )
      )
    );
  }
  
  private static detectSalesData(headers: string[], sampleData: any[]): boolean {
    const salesKeywords = ['units', 'sold', 'sales', 'forecast', 'target', 'quota', 'volume'];
    return headers.some(header => 
      typeof header === 'string' && salesKeywords.some(keyword => header.toLowerCase().includes(keyword))
    );
  }
  
  private static hasMonthlyData(headers: string[]): boolean {
    const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december', 'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const monthCount = headers.filter(header => 
      typeof header === 'string' && months.some(month => header.toLowerCase().includes(month))
    ).length;
    return monthCount >= 3; // At least 3 months detected
  }

  private static identifyDocumentSections(paragraphs: string[]): string[] {
    const sections: string[] = [];
    
    paragraphs.forEach(para => {
      const trimmed = para.trim();
      // Look for potential section headers (short lines, often capitalized)
      if (trimmed.length > 0 && trimmed.length < 100 && 
          (trimmed === trimmed.toUpperCase() || 
           /^[A-Z][a-z\s]+:?$/.test(trimmed) ||
           /^\d+\.?\s+[A-Z]/.test(trimmed))) {
        sections.push(trimmed);
      }
    });
    
    return sections.slice(0, 10); // Limit to first 10 potential sections
  }

  private static extractKeyTopics(text: string): string[] {
    // Simple keyword extraction - look for frequently mentioned terms
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 4); // Only words longer than 4 characters
    
    const wordCount: Record<string, number> = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
    
    // Get top words, excluding common words
    const commonWords = new Set(['about', 'which', 'their', 'would', 'there', 'could', 'other', 'after', 'first', 'never', 'these', 'think', 'where', 'being', 'every', 'great', 'might', 'shall', 'still', 'those', 'while']);
    
    return Object.entries(wordCount)
      .filter(([word, count]) => count >= 2 && !commonWords.has(word))
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8)
      .map(([word]) => word);
  }

  private static containsNumericalData(text: string): boolean {
    // Check if document contains numerical data that could be visualized
    const numberPattern = /\d+([.,]\d+)?%?|\$\d+/g;
    const numbers = text.match(numberPattern);
    return numbers !== null && numbers.length > 5;
  }

  static generatePromptForFileData(processedData: ProcessedData, userPrompt: string = ""): string {
    let prompt = `Create a professional presentation based on the following ${processedData.type} file data:\n\n`;
    prompt += processedData.promptContext;
    
    if (userPrompt.trim()) {
      prompt += `\nUser Request: ${userPrompt}\n`;
    }
    
    // Add specific chart guidance based on data type
    if (processedData.type === 'excel') {
      prompt += `\n🚨 CRITICAL CHART INSTRUCTIONS:
1. Look for the "🎯 CRITICAL CHART DATA TO USE" section above
2. Use EXACTLY the X-axis Labels and Y-axis Values provided - DO NOT MAKE UP VALUES
3. For monthly sales data: Use "line" chart type to show trends over time
4. For comparison data: Use "bar" chart type
5. NEVER use random values like [7, 113] or [1] - use the extracted data values
6. NEVER mix different metrics in one chart (don't combine units sold + price per unit)
7. The chart labels should be the months (January, February, etc.)
8. The chart values should be the sales amounts from the CRITICAL CHART DATA section
9. Use a single data series with the extracted values
10. Chart title should reflect the actual data being shown
11. MANDATORY: If you see "Y-axis Values: [600, 400, 800, 750, 700, 561]" then use EXACTLY [600, 400, 800, 750, 700, 561]
12. DO NOT change, round, or approximate the values - use them exactly as provided\n`;
    }
    
    prompt += `\nPlease create a comprehensive presentation that:
1. MUST include a "title" field at the root level (e.g., "title": "Sales Forecast Analysis")
2. Uses the appropriate layout for data visualization (Metrics_FullWidthChart for single charts)
3. Creates accurate charts that reflect the actual data values
4. Focuses on the most important metrics from the data
5. Uses clear, descriptive titles that match the data content
6. Maintains professional formatting with proper labels and legends
7. Highlights key insights and findings from the data analysis

IMPORTANT: Always return a complete presentation JSON with both "title" and "slides" fields, even for single slide requests.`;

    return prompt;
  }
}
