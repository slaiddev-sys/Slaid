import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { supabase } from '../../../lib/supabase';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Log raw body FIRST to diagnose any issues
    console.log('🔍 RAW REQUEST BODY:', {
      bodyKeys: Object.keys(body),
      hasUploadResult: 'uploadResult' in body,
      hasPrompt: 'presentationPrompt' in body,
      hasSlideCount: 'slideCount' in body,
      uploadResultType: typeof body.uploadResult,
      promptType: typeof body.presentationPrompt,
      slideCountType: typeof body.slideCount
    });
    
    const { 
      uploadResult, 
      presentationPrompt, 
      slideCount,
      comprehensiveAnalysis,
      batchNumber = 1,        // New: which batch this is (1, 2, 3...)
      totalBatches = 1,       // New: total number of batches
      slideStart = 1,         // New: starting slide number for this batch
      slideEnd = slideCount   // New: ending slide number for this batch
    } = body;

    console.log('📊 Generate Excel Presentation Request:', {
      hasUploadResult: !!uploadResult,
      promptLength: presentationPrompt?.length,
      slideCount,
      hasComprehensiveAnalysis: !!comprehensiveAnalysis,
      batchInfo: `Batch ${batchNumber}/${totalBatches} (slides ${slideStart}-${slideEnd})`
    });

    if (!uploadResult || !presentationPrompt || !slideCount) {
      console.error('❌ VALIDATION FAILED - Missing fields:', {
        uploadResult: !!uploadResult,
        presentationPrompt: !!presentationPrompt,
        slideCount: !!slideCount
      });
      return NextResponse.json(
        { error: 'Missing required fields: uploadResult, presentationPrompt, or slideCount' },
        { status: 400 }
      );
    }

    // Extract Excel data - handle different possible structures
    let excelData: any[] = [];
    
    // Try different paths to get the data
    if (uploadResult.processedData?.structuredData) {
      excelData = Array.isArray(uploadResult.processedData.structuredData) 
        ? uploadResult.processedData.structuredData 
        : [uploadResult.processedData.structuredData];
    } else if (uploadResult.structuredData) {
      excelData = Array.isArray(uploadResult.structuredData) 
        ? uploadResult.structuredData 
        : [uploadResult.structuredData];
    } else if (uploadResult.processedData) {
      // Sometimes the data is directly in processedData
      excelData = [uploadResult.processedData];
    }

    const fileName = uploadResult.fileName || 'Data Analysis';

    console.log('📊 Excel Data Summary:', {
      fileName,
      uploadResultKeys: Object.keys(uploadResult),
      hasProcessedData: !!uploadResult.processedData,
      hasStructuredData: !!uploadResult.structuredData,
      excelDataType: typeof excelData,
      isArray: Array.isArray(excelData),
      sheets: Array.isArray(excelData) ? excelData.length : 0,
      firstSheetKeys: excelData[0] ? Object.keys(excelData[0]) : []
    });

    // Prepare Excel data summary for AI with sample data
    // 🚨 CRITICAL: Reduce data to prevent token overflow (max 200k tokens)
    let dataSummary = '';
    
    if (comprehensiveAnalysis) {
      // If comprehensive analysis exists, reduce it to prevent token overflow
      const maxAnalysisLength = 50000; // Limit to ~50k characters (~12.5k tokens)
      
      if (comprehensiveAnalysis.length > maxAnalysisLength) {
        console.log(`⚠️ Comprehensive analysis too long (${comprehensiveAnalysis.length} chars), reducing to ${maxAnalysisLength} chars`);
        // Take first 30k and last 20k to preserve structure and summary
        dataSummary = comprehensiveAnalysis.substring(0, 30000) + 
                     '\n\n... (data truncated to prevent token overflow) ...\n\n' +
                     comprehensiveAnalysis.substring(comprehensiveAnalysis.length - 20000);
      } else {
        dataSummary = comprehensiveAnalysis;
      }
    } else if (excelData.length > 0) {
      // If no comprehensive analysis, create a lightweight summary
      dataSummary = `Excel Data Structure (${excelData.length} sheet(s)):\n\n`;
      excelData.forEach((sheet: any, i: number) => {
        const sheetName = sheet.sheetName || `Sheet ${i + 1}`;
        const rowCount = sheet.data?.length || 0;
        const headers = sheet.headers || [];
        dataSummary += `📊 ${sheetName}:\n`;
        dataSummary += `   - Rows: ${rowCount}\n`;
        dataSummary += `   - Columns (${headers.length}): ${headers.slice(0, 10).join(', ')}${headers.length > 10 ? '...' : ''}\n`;
        
        // Add minimal sample data (only 2 rows instead of 3)
        if (sheet.data && sheet.data.length > 0) {
          dataSummary += `   - Sample (first 2 rows):\n`;
          sheet.data.slice(0, 2).forEach((row: any, idx: number) => {
            // Only show first 5 columns to reduce size
            const limitedHeaders = headers.slice(0, 5);
            const rowData = limitedHeaders.map((h: string) => `${h}: ${row[h]}`).join(', ');
            dataSummary += `     ${rowData}${headers.length > 5 ? '...' : ''}\n`;
          });
        }
        dataSummary += '\n';
      });
    }
    
    console.log(`📊 Data summary length: ${dataSummary.length} characters (~${Math.ceil(dataSummary.length / 4)} tokens)`);

    // Calculate interpretation layout limits for this batch
    const totalSlides = slideCount;
    const slidesInBatch = slideEnd - slideStart + 1;
    
    // 🚨🚨🚨 ULTRA STRICT: MAXIMUM 3 interpretation layouts TOTAL for ALL presentations 🚨🚨🚨
    // 5 slides -> 1, 10 slides -> 2, 15-20+ slides -> 3 (NEVER MORE THAN 3)
    // Placement: 1 at start (after ToC), 1 in middle, 1 at end (before back cover - conclusions slide)
    const maxInterpretationTotal = totalSlides <= 5 ? 1 : totalSlides <= 10 ? 2 : 3; // ABSOLUTE MAXIMUM: 3
    
    // Create explicit data assignment for each batch to PREVENT DUPLICATES
    let batchDataStrategy = '';
    if (totalBatches > 1) {
      if (batchNumber === 1) {
        batchDataStrategy = `
**YOUR DATA ASSIGNMENT (BATCH 1 - PRIMARY METRICS):**
You MUST ONLY use data from the FIRST HALF of the Excel:
- Focus on: PRIMARY revenue metrics, main KPIs, overall totals
- Show: Monthly/quarterly revenue trends, total sales figures, primary performance indicators
- Example metrics to use: "Total Revenue 2023", "Monthly Revenue Trends", "Overall Sales Performance"
- DO NOT use: Detailed breakdowns, expense analysis, secondary metrics, comparisons
- Think: "What are the TOP-LEVEL numbers?" - Show those ONLY
`;
      } else if (batchNumber === 2) {
        batchDataStrategy = `
**YOUR DATA ASSIGNMENT (BATCH 2 - SECONDARY ANALYSIS):**
You MUST ONLY use data from the SECOND HALF of the Excel:
- Batch 1 already covered: Primary revenue, main KPIs, overall totals
- YOU must show: Expense breakdowns, cost analysis, detailed category splits, growth rates, comparisons
- Example metrics to use: "Expense Breakdown by Category", "Cost Analysis", "Revenue vs Expenses Comparison", "Growth Rate by Product"
- DO NOT repeat: Total revenue, monthly revenue trends, or any metric batch 1 likely showed
- Think: "What detailed analysis comes AFTER the main numbers?" - Show that ONLY
`;
      }
    }
    
    // Distribute interpretation layouts across batches - ULTRA STRICT WITH EXPLICIT LAYOUT ASSIGNMENT
    let maxInterpretationThisBatch = 0;
    let interpretationPlacement = '';
    let whichInterpretationLayouts = '';
    
    if (totalBatches === 1) {
      // Single batch: all 3 interpretations
      maxInterpretationThisBatch = 3;
      interpretationPlacement = 'Place 1 near start (after ToC/cover), 1 in middle, 1 at end (slide before back cover)';
      whichInterpretationLayouts = `
🚨 EXACT INTERPRETATION LAYOUTS YOU MUST USE IN THIS BATCH:
1. ExcelHowItWorks_Responsive OR ExcelExperienceDrivenTwoRows_Responsive (choose ONE, place after ToC)
2. Any interpretation layout in the middle
3. ExcelExperienceFullText_Responsive (MANDATORY at slide ${slideEnd - 1} - conclusions before back cover)
`;
    } else if (totalBatches === 2) {
      // Two batches: distribute strategically
      if (batchNumber === 1) {
        // Batch 1: ONLY 1 interpretation near the start
        maxInterpretationThisBatch = 1;
        interpretationPlacement = `Place EXACTLY 1 interpretation layout near the START of your batch (around slide ${slideStart + 2} to ${slideStart + 4})`;
        whichInterpretationLayouts = `
🚨 EXACT INTERPRETATION LAYOUT YOU MUST USE IN THIS BATCH (BATCH 1):
1. ExcelHowItWorks_Responsive OR ExcelExperienceDrivenTwoRows_Responsive (choose ONE, place near start)

🚨 LAYOUTS YOU MUST NOT USE (THEY ARE FOR BATCH 2):
❌ DO NOT USE ExcelExperienceFullText_Responsive in this batch (batch 2 will use it for conclusions)
❌ DO NOT add more than 1 interpretation layout
`;
      } else {
        // Batch 2: EXACTLY 2 interpretations (1 in middle, 1 conclusions at end)
        maxInterpretationThisBatch = 2;
        interpretationPlacement = `Place EXACTLY 2 interpretation layouts: 1 in the MIDDLE (around slide ${Math.floor((slideStart + slideEnd) / 2)}) and 1 at the END (slide ${slideEnd - 1} - conclusions before back cover)`;
        whichInterpretationLayouts = `
🚨 EXACT INTERPRETATION LAYOUTS YOU MUST USE IN THIS BATCH (BATCH 2):
1. ExcelHowItWorks_Responsive OR ExcelExperienceDrivenTwoRows_Responsive (choose ONE, place in middle) - IF batch 1 didn't already use it
2. ExcelExperienceFullText_Responsive (MANDATORY at slide ${slideEnd - 1} - conclusions before back cover)

🚨 WHAT BATCH 1 ALREADY USED:
- Batch 1 used 1 interpretation layout near the start
- DO NOT repeat the same type if batch 1 used ExcelHowItWorks, use ExcelExperienceDrivenTwoRows instead
- Your 2 interpretations MUST be different from batch 1's 1 interpretation
`;
      }
    } else {
      // Three+ batches: 1 per batch maximum
      maxInterpretationThisBatch = 1;
      if (batchNumber === 1) {
        interpretationPlacement = `Place EXACTLY 1 interpretation near the START (after ToC)`;
        whichInterpretationLayouts = `
🚨 EXACT INTERPRETATION LAYOUT YOU MUST USE (BATCH 1):
1. ExcelHowItWorks_Responsive OR ExcelExperienceDrivenTwoRows_Responsive (choose ONE)
`;
      } else if (batchNumber === totalBatches) {
        interpretationPlacement = `Place EXACTLY 1 interpretation at the END (slide ${slideEnd - 1} - conclusions before back cover)`;
        whichInterpretationLayouts = `
🚨 EXACT INTERPRETATION LAYOUT YOU MUST USE (LAST BATCH):
1. ExcelExperienceFullText_Responsive (MANDATORY at slide ${slideEnd - 1} - conclusions before back cover)
`;
      } else {
        interpretationPlacement = `Place EXACTLY 1 interpretation in the MIDDLE of your batch`;
        whichInterpretationLayouts = `
🚨 EXACT INTERPRETATION LAYOUT YOU MUST USE (MIDDLE BATCH):
1. Choose ONE: ExcelHowItWorks_Responsive OR ExcelExperienceDrivenTwoRows_Responsive
- But ONLY if batch 1 didn't already use your choice
- If batch 1 used ExcelHowItWorks, you must use ExcelExperienceDrivenTwoRows
- If batch 1 used ExcelExperienceDrivenTwoRows, you must use ExcelHowItWorks
`;
      }
    }

    // Create the AI prompt for generating presentation structure
    const aiPrompt = `You are an expert presentation designer. Create a ${slideCount}-slide presentation structure based on this data analysis.

🎯 BATCH INFORMATION - CRITICAL:
- This is BATCH ${batchNumber} of ${totalBatches}
- You are generating slides ${slideStart} to ${slideEnd} (${slidesInBatch} slides)
- Total presentation will have ${totalSlides} slides across all batches

${totalBatches > 1 ? `
🚨🚨🚨 CRITICAL - NO DUPLICATE CONTENT - YOUR EXPLICIT DATA ASSIGNMENT 🚨🚨🚨
${batchDataStrategy}

**ENFORCEMENT:**
- You are FORBIDDEN from using data assigned to the other batch
- If you show ANY metric that the other batch should show, the presentation will be REJECTED
- Each chart/table title must be UNIQUE - no two slides can have similar titles
- When in doubt, skip a slide rather than risk duplication
- **THIS OVERRIDES ALL OTHER RULES** - Better to have fewer slides than duplicate content
` : ''}

🚨🚨🚨 INTERPRETATION LAYOUTS - ABSOLUTE MAXIMUM FOR THIS BATCH: ${maxInterpretationThisBatch} 🚨🚨🚨
- **YOU MUST USE EXACTLY ${maxInterpretationThisBatch} INTERPRETATION LAYOUT(S) IN THIS BATCH - NO MORE, NO LESS**
- **TOTAL ACROSS ALL BATCHES = ${maxInterpretationTotal} (FOR 15-20+ SLIDES: MAXIMUM 3, NEVER EXCEED 3)**
- ${interpretationPlacement}
- **THIS IS NON-NEGOTIABLE** - Other batches will add their interpretation layouts
- **IF THIS IS A 15-20 SLIDE PRESENTATION, THE ABSOLUTE MAXIMUM IS 3 INTERPRETATIONS TOTAL - NOT 4, NOT 5, ONLY 3**

${whichInterpretationLayouts}

USER REQUEST: "${presentationPrompt}"

🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑
🛑 STOP! READ THIS BEFORE GENERATING A SINGLE SLIDE! 🛑
🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑

⛔⛔⛔ RULE #1 (OVERRIDES ALL OTHER RULES) - ZERO TOLERANCE FOR DUPLICATE CONTENT ⛔⛔⛔

🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨
🚨🚨🚨 ABSOLUTE CRITICAL RULE - NO DUPLICATE CONTENT - READ THIS FIRST 🚨🚨🚨
🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨

**THIS IS THE #1 RULE - DUPLICATING CONTENT IS ABSOLUTELY FORBIDDEN**
**IF YOU SHOW THE SAME DATA TWICE, THE ENTIRE PRESENTATION WILL BE REJECTED**
**EACH PIE CHART SLICE, EACH LINE IN A CHART, EACH BAR - CAN ONLY APPEAR ONCE**

WHAT COUNTS AS DUPLICATE CONTENT:
1. Using the same Excel row/metric in multiple charts
2. Showing the same data series twice (even with different chart types)
3. Creating multiple slides about the same Excel section/topic
4. Repeating the same series.id in different slides

EXAMPLES OF FORBIDDEN DUPLICATES:
❌ Slide 3: Chart with series "Revenue 2023" 
❌ Slide 7: Chart with series "Revenue 2023" again ← DUPLICATE! FORBIDDEN!

❌ Slide 4: "Sales Analysis" with Product A, Product B data
❌ Slide 8: "Product Performance" with Product A, Product B data ← DUPLICATE! FORBIDDEN!

❌ Slide 5: "Monthly Expenses" showing Alquiler, Electricidad
❌ Slide 9: "Cost Breakdown" showing Alquiler, Electricidad ← DUPLICATE! FORBIDDEN!

❌❌❌ PIE CHART SPECIFIC - EXTREMELY COMMON MISTAKE ❌❌❌:
❌ Slide 3: Pie chart "Distribución de Gastos" showing: Transferencias Revolut, Alimentación, Ocio, Transporte, Suscripciones
❌ Slide 7: Pie chart "Gastos por Categoría" showing: Transferencias Revolut, Alimentación, Ocio, Transporte, Suscripciones
← THIS IS A DUPLICATE! SAME DATA, DIFFERENT TITLE! ABSOLUTELY FORBIDDEN!

**PIE CHART RULE**: If you've already shown expense categories in ONE pie chart, you CANNOT create another pie chart with the same categories. PERIOD. NO EXCEPTIONS.

❌ Creating 2+ pie charts with expense categories (Revolut, Food, Leisure, etc.) ← FORBIDDEN!
✅ Create ONLY ONE pie chart for expense distribution - that's it!

MANDATORY VERIFICATION BEFORE GENERATING JSON:
**STEP 1**: List ALL series.id values you will use across ALL your slides
**STEP 2**: Check if ANY series.id appears MORE THAN ONCE
**STEP 3**: If YES → IMMEDIATELY REMOVE the duplicate slides
**STEP 4**: Verify each Excel row/metric is used ONLY ONCE in the entire presentation

TRACKING YOUR DATA USAGE:
- Create a mental list: "I have used these Excel rows: [list them]"
- Before adding a new chart, check: "Have I already used any of these rows?"
- If YES → DO NOT CREATE THAT CHART - choose different Excel rows instead
- Each Excel row can appear in ONLY ONE slide in the entire presentation

THE SOLUTION - GROUP RELATED DATA INTO SINGLE COMPREHENSIVE CHARTS:
✅ Instead of 3 separate slides for Revenue, Costs, Profit
   → Create ONE slide "Financial Overview" with all 3 as different series

✅ Instead of 5 separate slides for 5 products
   → Create ONE slide "Product Portfolio Analysis" with all 5 products as different series

✅ Instead of 4 separate slides for 4 expense categories
   → Create ONE slide "Complete Expense Structure" with all 4 categories as different series

CHECKPOINT BEFORE SUBMITTING YOUR JSON:
□ I have listed ALL series.id values across all my slides
□ NO series.id appears more than once
□ NO Excel row/metric is shown in multiple charts
□ Each data point from Excel is used MAXIMUM 1 time
□ If I see any duplicate → I have removed entire duplicate slides

**IF YOU SUBMIT JSON WITH DUPLICATE CONTENT, THE ENTIRE RESPONSE WILL BE REJECTED**
**THIS RULE OVERRIDES ALL OTHER RULES - BETTER TO HAVE FEWER SLIDES THAN DUPLICATES**

🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨

🌍 CRITICAL LANGUAGE REQUIREMENT - READ THIS FIRST:
1. **DETECT THE LANGUAGE** of the user's request: "${presentationPrompt}"
2. **USE ONLY THAT LANGUAGE** for 100% of the presentation content
3. **NO MIXING LANGUAGES** - If Spanish, everything in Spanish. If English, everything in English.
4. This applies to:
   - Slide titles
   - Descriptions and subtitles  
   - Chart labels and axis titles
   - Table headers and data labels
   - Insight texts and interpretations
   - All props: title, subtitle, description, leftText, rightText, insights, limitations, etc.
5. **EXAMPLE**: If user writes "créame una presentación", use Spanish for EVERYTHING:
   - ✅ "Análisis de Ventas" (correct)
   - ❌ "Sales Analysis" (wrong - do not mix English)
6. **VERIFY** before generating: Is EVERY word in the detected language?

EXCEL DATA SUMMARY:
${dataSummary}

AVAILABLE EXCEL LAYOUTS (use these exact names):
1. ExcelCenteredCover_Responsive - Cover slide with title and subtitle
2. ExcelTableOfContents_Responsive - Table of contents with sections
3. ExcelKPIDashboard_Responsive - KPI cards with metrics
4. ExcelTrendChart_Responsive - Trend chart with insights
5. ExcelDataTable_Responsive - Data table display
6. ExcelFullWidthChart_Responsive - Full-width chart
7. ExcelFullWidthChartCategorical_Responsive - Categorical chart for non-time data
8. ExcelPieChart_Responsive - Pie chart for distribution/percentage data
9. ExcelFullWidthChartWithTable_Responsive - Chart with data table
10. ExcelComparisonLayout_Responsive - Comparison charts
11. ExcelExperienceFullText_Responsive - Text interpretation
12. ExcelHowItWorks_Responsive - Process/features grid
13. ExcelBackCover_Responsive - Back cover with contact info

RULES:

🚨🚨🚨 RULE #0 - THE MOST CRITICAL RULE - LOGICAL DATA GROUPING, MULTI-SERIES CHARTS, NO DUPLICATE CONTENT 🚨🚨🚨
**IDENTIFY LOGICAL DATA GROUPS FROM THE EXCEL STRUCTURE AND CREATE COMPREHENSIVE MULTI-SERIES CHARTS**

- **🚨🚨🚨 CRITICAL - CREATE MULTI-SERIES CHARTS (5 SERIES PER CHART) 🚨🚨🚨:**
  * **TARGET: 5 SERIES PER CHART** - this is OPTIMAL
  * **MINIMUM: 3 SERIES PER CHART** - never show only 1-2 series
  * **DO NOT create single-series charts** - that is FORBIDDEN and wastes the Excel's rich data
  * **Group related rows together into comprehensive charts**
  * Example: If Excel has 5 expense categories (Alquiler, Electricidad, Combustible, Comida, Otros)
    → Create ONE chart titled "Estructura de Gastos Mensuales" with ALL 5 expense categories as different series (lines/areas)
  * Example: If Excel has 5 revenue streams (Recurring, New Business, Services, Subscriptions, One-time)
    → Create ONE chart titled "Evolución de Ingresos" with ALL 5 revenue streams as different series
  * Example: If Excel has 5 product lines under "Ventas"
    → Create ONE chart with ALL 5 products as separate series
  * **COUNT BEFORE SUBMITTING**: Every chart MUST have AT LEAST 3 series (target is 5)
  * **This is how you maximize data value** - one chart with 5 lines tells a complete story

- **FIRST**: Analyze the Excel structure to identify LOGICAL SECTIONS/GROUPS:
  * Look for section headers like "PREVISIÓN VENTAS", "Evolución mensual", "YTD Recurring", "Comparativas de facturación"
  * Look for CATEGORIES of rows that belong together:
    - All expense categories (Alquiler, Electricidad, Combustible, Comida, Otros) → ONE CHART
    - All revenue streams (Recurring, New Business, Services) → ONE CHART
    - All product lines (Product A, B, C, D) → ONE CHART
    - All regional data (North, South, East, West) → ONE CHART
  * Each major section = one slide with its related data displayed as MULTIPLE SERIES

- **🚨 CHART SERIES STRUCTURE - THIS IS CRITICAL 🚨:**
  * chartData.series MUST be an ARRAY with MULTIPLE objects (5 series = 5 objects)
  * **🚨 CRITICAL: Use ACTUAL row labels from the Excel as series.id names - DO NOT invent categories! 🚨**
  * **Read the Excel data summary carefully** - identify 5+ related rows, use their EXACT labels as series.id
  * **WRONG (only 1 series - FORBIDDEN)**:
    \`\`\`
    chartData: {
      labels: ["Ene", "Feb", "Mar", ...],
      series: [
        { id: "Total Revenue", data: [50000, 60000, 70000, ...] }
      ]
    }
    \`\`\`
  * **WRONG (invented categories - FORBIDDEN)**:
    \`\`\`
    series: [
      { id: "Alquiler", data: [...] },  // ❌ This row label doesn't exist in Excel!
      { id: "Electricidad", data: [...] }  // ❌ Made up!
    ]
    \`\`\`
  * **CORRECT (5 series with ACTUAL Excel row labels - TARGET)**:
    \`\`\`
    // Example: If Excel has these rows:
    // - "RECURRING FORECAST USD"
    // - "RECURRING NEW BUSINESS"  
    // - "NEW BUSINESS"
    // - "Vendido SGA En cursos"
    // - "Vendido One Off - En curso"
    
    chartData: {
      type: "area",
      labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
      series: [
        { id: "RECURRING FORECAST USD", data: [72257, 37660, 27880, 40665, 15733, 21974, 42538, 27253, 20533, 29098, 19093, 20293] },
        { id: "RECURRING NEW BUSINESS", data: [1, 1500, 2250, 3250, 4250, 5250, 6250, 7250, 8250, 9250, 10250, 14650] },
        { id: "NEW BUSINESS", data: [3150, 3150, 3150, 3400, 3400, 3400, 3400, 3400, 3400, 3400, 3400, 3400] },
        { id: "Vendido SGA En cursos", data: [... actual values from Excel ...] },
        { id: "Vendido One Off", data: [... actual values from Excel ...] }
      ]
    }
    \`\`\`
  * This creates a chart with 5 lines showing ALL related revenue streams from the ACTUAL Excel data
  * **Each series.id MUST be an EXACT row label from the Excel - copy it exactly, don't translate or modify**
  * **Each series.data MUST be the ACTUAL 12 monthly values for that row from the Excel**
  * **TARGET: 5 series objects per chartData, using REAL Excel row labels and REAL Excel data**

- **DO NOT**: Create single-series charts - that is FORBIDDEN
  * ❌ BAD: Chart with only 1 series ("RECURRING FORECAST USD") - FORBIDDEN!
  * ❌ BAD: Chart with only 2 series - TOO FEW!
  * ❌ BAD: 8 slides each showing only 1 series - MASSIVE WASTE OF DATA!
  * ✅ GOOD: 1 chart showing "Análisis Completo de Ingresos" with 5 revenue rows as separate series
  * ✅ GOOD: 1 chart showing "Estructura de Gastos" with 5 expense rows as separate series
  * ✅ GOOD: Each chart has 3-5 series showing related data together
  * **BEFORE ADDING ANY CHART**: Count the series - if < 3, ADD MORE ROWS until you reach 5 series

- **COHERENCE IS KEY**: Each chart should represent a meaningful business concept with ALL related data:
  * "Estructura de Gastos Mensuales" → ALL expense categories in one chart (5 series)
  * "Evolución de Ingresos por Categoría" → ALL revenue categories in one chart (5 series)
  * "Análisis de Ventas por Producto" → ALL product lines in one chart (5 series)
  * NOT: Single-series charts showing only 1 row per chart

- **🚨 MANDATORY SERIES COUNT CHECKPOINT 🚨:**
  * BEFORE FINALIZING ANY CHART, COUNT THE SERIES:
  * If series count = 1 → ❌ REJECTED - FORBIDDEN, add at least 4 more rows
  * If series count = 2 → ❌ REJECTED - Add at least 3 more rows
  * If series count = 3 → ⚠️ MINIMUM ACCEPTABLE but aim for 5
  * If series count = 4 → ⚠️ ACCEPTABLE but add 1 more if possible
  * If series count = 5 → ✅ PERFECT - this is the target
  * If series count = 6-7 → ✅ GOOD - acceptable for data-rich sections
  * **TARGET FOR ALL CHARTS**: 5 series per chart

- **THIS APPLIES ACROSS ALL BATCHES:**
  ${totalBatches > 1 ? `
  - You are generating batch ${batchNumber} of ${totalBatches}
  - Other batches will show DIFFERENT logical sections from the same Excel
  - DO NOT assume you need to show ALL the sections in THIS batch
  - Coordinate with other batches - divide the Excel sections between batches
  - Example: If Excel has 8 sections, batch 1 shows sections 1-4, batch 2 shows sections 5-8
  - **NEVER show the same section/group in multiple batches**` : '- Use different logical sections for each chart/table layout'}

- **🚨 CRITICAL EXAMPLES OF VIOLATIONS - THESE WILL GET YOUR RESPONSE REJECTED 🚨:**
  
  **FORBIDDEN PATTERN - DUPLICATING DATA ACROSS SLIDES:**
  ❌ Slide 3: Chart with series.id "RECURRING FORECAST USD" 
  ❌ Slide 7: Chart with series.id "RECURRING FORECAST USD" again ← DUPLICATE! REJECTED!
  
  ❌ Slide 5: Chart with series.id "RECURRING NEW BUSINESS"
  ❌ Slide 9: Chart with series.id "RECURRING NEW BUSINESS" again ← DUPLICATE! REJECTED!
  
  ❌ Slide 4: "Product Sales" showing Product A, Product B, Product C
  ❌ Slide 8: "Sales Performance" showing Product A, Product B, Product C ← DUPLICATE! REJECTED!
  
  **WHY THIS IS WRONG:** You are showing the SAME Excel data multiple times in different slides.
  **THE FIX:** Combine all related data into ONE comprehensive slide with multiple series.
  
  **✅ CORRECT PATTERN - UNIQUE DATA PER SLIDE:**
  
  ✅ Slide 3: "Previsión de Ventas Completa" 
     → Shows series: "RECURRING FORECAST USD", "RECURRING NEW BUSINESS", "NEW BUSINESS", "Vendido SGA", "Vendido One Off"
     → ALL revenue streams in ONE chart
  
  ✅ Slide 4: "Estructura de Costos Operativos"
     → Shows series: "Alquiler", "Electricidad", "Combustible", "Comida", "Otros"
     → ALL expense categories in ONE chart (DIFFERENT data from Slide 3)
  
  ✅ Slide 5: "Análisis de Productos"
     → Shows series: "Product A", "Product B", "Product C", "Product D", "Product E"
     → ALL products in ONE chart (DIFFERENT data from Slides 3 and 4)
  
  ✅ Slide 6: "Comparativa Regional"
     → Shows series: "North Region", "South Region", "East Region", "West Region"
     → ALL regions in ONE chart (DIFFERENT data from Slides 3, 4, and 5)
  
  **NOTICE:** Each slide uses COMPLETELY DIFFERENT Excel rows. NO series.id is repeated.

- **🚨🚨🚨 MANDATORY - TRACK EVERY EXCEL ROW YOU USE 🚨🚨🚨:**
  * **BEFORE CREATING EACH SLIDE, MAINTAIN A MENTAL LIST OF USED DATA:**
    - "Used Excel rows so far: [list all series.id values from previous slides]"
    - "Excel rows still available: [remaining unused rows]"
  
  * **BEFORE ADDING ANY DATA LAYOUT, ASK YOURSELF:**
    - Which Excel rows/metrics will this slide use?
    - Have I already used ANY of these rows in a previous slide?
    - Am I showing ALL relevant data from this Excel section together?
    - If repeating ANY row label → STOP - choose different data instead
  
  * **VERIFICATION FOR EACH SLIDE:**
    - ✅ Every series.id in this slide = NEW (not used in previous slides)
    - ✅ This slide shows a DIFFERENT logical section from previous slides
    - ✅ NO overlap with data already shown
    - ❌ If ANY series.id was used before → DELETE this slide, choose different data
  
  * **EXAMPLE OF PROPER TRACKING:**
    - Slide 3: Used rows "Revenue Stream A", "Revenue Stream B", "Revenue Stream C"
    - Slide 4: Must use DIFFERENT rows → Use "Cost Category 1", "Cost Category 2", "Cost Category 3"
    - Slide 5: Must use DIFFERENT rows again → Use "Product Line X", "Product Line Y", "Product Line Z"
    - ❌ NEVER: Slide 6 using "Revenue Stream A" again (already used in Slide 3)

1. **CRITICAL - Chart layouts MUST be AT LEAST 70% of the presentation content:**
   - Chart layouts include: ExcelTrendChart_Responsive, ExcelFullWidthChart_Responsive, ExcelFullWidthChartCategorical_Responsive, ExcelFullWidthChartWithTable_Responsive, ExcelComparisonLayout_Responsive, ExcelKPIDashboard_Responsive
   - **Calculation**: (Number of chart slides) / (Total slides - Cover - ToC - Back Cover - Conclusions) ≥ 0.70
   - **Example for 13 slides**: 13 total - 4 (cover, ToC, conclusions, back cover) = 9 content slides → Need AT LEAST 7 chart slides (7/9 = 77%)
   - **Example for 10 slides**: 10 total - 3 (cover, conclusions, back cover) = 7 content slides → Need AT LEAST 5 chart slides (5/7 = 71%)
   - **This is MANDATORY** - presentations MUST be data-heavy with visual charts
   - Non-chart layouts (tables, interpretation, KPI highlights) should be MINIMAL - only 30% or less
   - Prioritize charts over tables: use ExcelTrendChart, ExcelFullWidthChart, ExcelComparisonLayout instead of ExcelDataTable
2. **CRITICAL - Cover and Back Cover placement (batch-aware):**
   - First slide (slide 1) MUST be ExcelCenteredCover_Responsive
     * ${batchNumber === 1 ? '✅ INCLUDE the cover in THIS batch (you are batch 1)' : '❌ DO NOT include cover in this batch (only in batch 1)'}
   - **Back Cover rules based on presentation length:**
     * ${slideCount <= 5 ? '❌ DO NOT include back cover (presentations with 1-5 slides do not use back cover)' : slideCount <= 10 ? `${batchNumber === totalBatches ? `✅ INCLUDE the back cover in THIS batch (you are the last batch, slide ${slideEnd})` : `❌ DO NOT include back cover in this batch (only in batch ${totalBatches}, slide ${slideCount})`}` : `${batchNumber === totalBatches ? `✅ INCLUDE the back cover in THIS batch (you are the last batch, slide ${slideEnd})` : `❌ DO NOT include back cover in this batch (only in batch ${totalBatches}, slide ${slideCount})`}`}
     * ${slideCount <= 5 ? '**IMPORTANT**: Presentations with 1-5 slides = Cover + 3 data layouts + 1 interpretation layout (NO back cover)' : batchNumber === totalBatches ? '**IMPORTANT**: Since you are the LAST batch, your final slide MUST be the back cover' : `**IMPORTANT**: Since you are NOT the last batch, DO NOT add a back cover - batch ${totalBatches} will add it`}
3. **CRITICAL - Table of Contents rules based on presentation length:**
   - ${slideCount <= 10 ? '❌ DO NOT include Table of Contents (presentations with 1-10 slides do not use ToC)' : batchNumber === 1 ? '✅ INCLUDE the Table of Contents in THIS batch (you are batch 1, slide 2) - presentations with 11+ slides MUST have ToC' : '❌ DO NOT include Table of Contents in this batch (only in batch 1)'}
   - ${slideCount > 10 ? `**CRITICAL**: The Table of Contents MUST list INDIVIDUAL SLIDE TITLES, NOT section names
   - **DO NOT group slides into sections** - list each slide individually with its specific title and page number
   - Count every slide: Cover (1), ToC (2), then 3,4,5... up to Back Cover
   - **SKIP these slides in the ToC**: Cover (slide 1), Table of Contents itself (slide 2), Back Cover (last slide)
   - **List all other slides individually**: Data slides, interpretation slides, KPI slides, conclusions slide
   - Each ToC entry must show: Slide Title + Page Number
   - **Example for 13 slides**:
     * Slide 3: "Tendencias de Ingresos" → Page 3
     * Slide 4: "Análisis de Costos" → Page 4
     * Slide 5: "Crecimiento por Categoría" → Page 5
     * Slide 6: "Comparación Trimestral" → Page 6
     * Slide 7: "Métricas Clave" → Page 7
     * Slide 8: "Análisis de Rendimiento" → Page 8
     * ... (continue for ALL slides except cover, ToC, back cover)
     * Slide 12: "Conclusiones Clave" → Page 12
   - Use the ACTUAL slide titles from your presentation structure
   - **INCORRECT**: ❌ "Data Analysis" (pages 3-8), "Insights" (pages 9-11)
   - **CORRECT**: ✅ Individual slide titles with their specific page numbers` : '**IMPORTANT**: No ToC needed for presentations with 1-10 slides'}
4. **CRITICAL - Conclusions slide rules based on presentation length:**
   - ${slideCount <= 5 ? `❌ For 1-5 slide presentations: Last slide (slide ${slideCount}) should be an interpretation layout (ExcelExperienceFullText_Responsive) - NO separate conclusions before it` : slideCount <= 10 ? `✅ Second-to-last slide (slide ${slideCount - 1}) MUST be ExcelExperienceFullText_Responsive (conclusions) ${batchNumber === totalBatches ? '- INCLUDE in THIS batch' : '- only in last batch'}` : `✅ Second-to-last slide (slide ${slideCount - 1}) MUST be ExcelExperienceFullText_Responsive (conclusions) ${batchNumber === totalBatches ? '- INCLUDE in THIS batch' : '- only in last batch'}`}
   - ${slideCount <= 5 ? '**STRUCTURE FOR 1-5 SLIDES**: Cover (slide 1) → 3 data/chart layouts (slides 2-4) → 1 interpretation layout (slide 5)' : 'This layout serves as a conclusions/summary slide before the back cover'}
   - ${slideCount > 5 ? 'Content should synthesize key findings and provide final insights from the Excel data' : ''}
   - ${slideCount > 5 ? 'Title examples: "Key Takeaways", "Final Insights", "Conclusions", "Summary" (or in Spanish: "Conclusiones Clave", "Resumen Final", "Hallazgos Finales")' : ''}
6. **🚨🚨🚨 CRITICAL - LAYOUTS THAT CAN ONLY BE USED ONCE PER PRESENTATION 🚨🚨🚨**
   
   These layouts can be used AT MOST 1 TIME each in the ENTIRE presentation:
   - **ExcelComparisonLayout_Responsive** → Use ONLY ONCE
   - **ExcelKPIDashboard_Responsive** → Use ONLY ONCE
   - **ExcelHowItWorks_Responsive** → Use ONLY ONCE (must have exactly 4 items)
   - **ExcelExperienceDrivenTwoRows_Responsive** → Use ONLY ONCE (must have exactly 4 items)
   - **ExcelDataTable_Responsive** → Use ONLY ONCE (and ONLY if you have 8+ rows)
   - **ExcelMilestone_Responsive** → Use ONLY ONCE (10+ slide presentations only)
   - **ExcelResultsTestimonial_Responsive** → Use ONLY ONCE (10+ slide presentations only)
   
   **COUNT BEFORE SUBMITTING - THIS IS MANDATORY:**
   Before you finalize the JSON, COUNT how many times you used each of these layouts.
   If ANY of them appears more than 1 time, YOU MUST FIX IT immediately.
   
   **Layouts you CAN use multiple times (with different data):**
   - ExcelTrendChart_Responsive
   - ExcelFullWidthChart_Responsive
   - ExcelFullWidthChartCategorical_Responsive
   - ExcelFullWidthChartWithTable_Responsive
   - ExcelExperienceFullText_Responsive
   
   **ExcelDataTable_Responsive additional requirement:**
   - ONLY use this layout when you have AT LEAST 8 rows of data to display
   - If you have fewer than 8 rows, DO NOT use it - use a chart layout instead
   - A table with only 2-5 rows looks empty and unprofessional
7. Use varied layouts based on content type
8. **CRITICAL: Extract REAL data from the Excel for ALL charts, tables, and metrics**
   - DO NOT use placeholder values (156, 168, 162, 165, 170, etc.)
   - DO NOT use example data from the layout specifications
   - ALWAYS read and use the actual values from the Excel data summary above
   - Chart labels MUST match Excel columns/rows
   - Chart values MUST match Excel cell values
   - Table rows MUST match Excel data rows
9. Generate meaningful insights
10. **🚨 CRITICAL - ExcelKPIDashboard_Responsive chart requirements:**
   - Charts MUST use ONLY "area", "line", or "bar" type - NEVER "pie"
   - **MINIMUM DATA POINTS REQUIREMENT:**
     * Each chart in kpiCards MUST have AT LEAST 5 data points
     * DO NOT create charts with only 1-3 data points - they look empty and unprofessional
     * If you don't have enough data for a chart (< 5 points), OMIT the chartData entirely
     * Example of BAD chart: Only 1 data point showing "Total" with one value
     * Example of GOOD chart: 5+ months of data, or 5+ categories with values
   - **OMIT chartData if insufficient data:**
     * If a KPI card only has a single total value, just show the metric without a chart
     * Better to have 2-3 well-populated KPI cards than 3-4 cards with poor/empty charts
   - **VERIFY before submitting:** Does each chart have AT LEAST 5 meaningful data points?
11. Chart layouts with "overallPerformance" MUST calculate it from chart data:
   - Formula: ((lastValue - firstValue) / firstValue) × 100
   - For Comparison: ((actualTotal - targetTotal) / targetTotal) × 100
   - Use + for growth, - for decline
   - NEVER use random numbers like "+24.8%" without calculation
12. **🚨 ExcelHowItWorks_Responsive - ULTRA STRICT RULES 🚨:**
   - **USE EXACTLY 1 TIME PER PRESENTATION - NEVER 2 OR MORE**
   - This layout MUST have EXACTLY 4 features (2x2 grid) - see Rule #6
   - If you have 1-3 items, use ExcelExperienceFullText_Responsive instead
   - If you have 5+ items, split into ExcelExperienceFullText_Responsive or use a different layout
   - Use this layout only when you have exactly 4 distinct strategic points or key steps to present
   - **MANDATORY CHECKPOINT**: Before submitting JSON, search for "ExcelHowItWorks_Responsive" - count MUST be exactly 1 (or 0 if not using it)
   - **IF YOU FIND 2 OR MORE**: DELETE all but one, replace with ExcelExperienceFullText_Responsive or chart layouts
13. ExcelComparisonLayout_Responsive table headers MUST be adaptive:
   - actualTableTitle, targetTableTitle, metricColumnHeader, actualColumnHeader, targetColumnHeader
   - ALL must be in the user's language (Spanish if prompt is Spanish, English if English)
   - ALL must match the data context (e.g., "Ingresos Reales" not "Actual Performance" for Spanish financial data)
14. Description texts in ExcelCenteredCover_Responsive and ExcelKPIDashboard_Responsive MUST be adaptive:
   - Cover description: Summarize the presentation's purpose based on actual Excel data and user request
   - KPI Dashboard description: Explain what these specific KPIs measure in relation to the Excel data
   - BOTH must be in the user's language and context-specific (not generic placeholders)
15. **🌍 CRITICAL - LANGUAGE CONSISTENCY ACROSS ALL SLIDES:**
   - **DETECT USER LANGUAGE**: If Excel data has Spanish headers/values OR user prompt is in Spanish → ENTIRE presentation MUST be in Spanish
   - **DETECT USER LANGUAGE**: If Excel data has English headers/values OR user prompt is in English → ENTIRE presentation MUST be in English
   - **ALL TEXT MUST MATCH**: titles, descriptions, chart labels, KPI labels, insights, table headers, performance labels, bullet points
   - **🚨 BEFORE GENERATING EACH SLIDE**: Check if previous slides were in Spanish or English, then use THE SAME LANGUAGE
   - **performanceLabel in chart layouts** MUST be translated:
     * ExcelTrendChart_Responsive, ExcelFullWidthChart_Responsive, ExcelFullWidthChartWithTable_Responsive, ExcelComparisonLayout_Responsive
     * English: "Overall Performance" or "Overall performance"
     * Spanish: "Rendimiento General" or "Rendimiento general"
   - **COMMON MISTAKE**: Mixing "Ingresos" (Spanish) with "Growth" (English) in same presentation - THIS IS FORBIDDEN
   - **IF UNSURE**: Default to English, but once you choose a language, ALL slides must use it consistently
16. **CRITICAL - Use the CORRECT layout based on data type:**
   
   **🚨🚨🚨 FOR ALL DATA CATEGORIES - USE ONLY THESE 2 LAYOUTS 🚨🚨🚨**
   
   - 📊 **ExcelFullWidthChartCategorical_Responsive** - For categorical comparisons:
     * **MUST ONLY USE BAR CHART** (type: 'bar') - NEVER use line or area
     * **🚨 CRITICAL: EVERY series MUST have a color** - without colors, charts display in grey/black
     * Product categories (Product A, Product B, Product C)
     * Expense categories (Alquiler, Electricidad, Combustible, Comida, Otros)
     * Geographic regions (North, South, East, West)
     * Department names (Sales, Marketing, HR)
     * ANY non-time-series categorical data
     * **Single series**: chartData: { type: 'bar', labels: ["Cat A", "Cat B", "Cat C"], series: [{id: "Values", data: [800, 150, 450], color: "#4A3AFF"}] }
     * **Multi series (2 series)**: chartData: { type: 'bar', labels: ["Q1", "Q2"], series: [{id: "Revenue", data: [6.5, 11.2], color: "#4A3AFF"}, {id: "GMV", data: [5.8, 10.5], color: "#C893FD"}] }
     * **Multi series (3+ series)**: Use colors in order: #4A3AFF, #C893FD, #1e40af, #2563eb, #3b82f6
   
   - 🥧 **ExcelPieChart_Responsive** - For distribution/percentage data:
     * **MUST ONLY USE PIE CHART** (type: 'pie') - this is the ONLY layout that uses pie
     * **CRITICAL**: This is a TREND-style layout (2/3 chart + 1/3 insights), NOT full-width
     * Market share distribution (Competitor A: 35%, Competitor B: 25%)
     * Budget allocation (Marketing: 40%, Sales: 30%, Operations: 20%)
     * Category breakdown showing parts of a whole (100%)
     * **CRITICAL**: MUST have AT LEAST 3 categories (preferably 5+) - do NOT create pie charts with only 1-2 categories
     * chartData: { 
         type: 'pie', 
         labels: ["Revolut", "Alimentación", "Ocio", "Transporte", "Suscripciones"],
         series: [
           { id: "Revolut", data: [39.5], color: "#4A3AFF" },
           { id: "Alimentación", data: [20.9], color: "#C893FD" },
           { id: "Ocio", data: [14.9], color: "#1e40af" },
           { id: "Transporte", data: [8.4], color: "#2563eb" },
           { id: "Suscripciones", data: [16.3], color: "#3b82f6" }
         ],
         showLegend: true,
         legendPosition: 'bottom'
       }
     * **REQUIRED**: insights array with 3-4 bullet points explaining the distribution
     * **Example**: insights: ["Largest category represents 39.5% of total", "Five categories show balanced distribution", ...]
   
   - 📈 **ExcelFullWidthChart_Responsive** - For TIME-SERIES data ONLY:
     * **MUST USE line OR area** (NEVER bar for time-series - see Rule #21)
     * **🚨 CRITICAL: EVERY series MUST have a color** - without colors, charts display in grey/black
     * Months (Jan, Feb, Mar, Apr / Enero, Febrero, Marzo)
     * Quarters (Q1, Q2, Q3, Q4)
     * Years (2022, 2023, 2024)
     * Dates or time periods
     * **Single series**: chartData: { type: 'area', labels: ["Jan", "Feb", "Mar"], series: [{id: "Revenue", data: [1000, 1200, 1500], color: "#4A3AFF"}] }
     * **Multi series (2 series)**: chartData: { type: 'area', labels: ["Q1", "Q2", "Q3"], series: [{id: "Sales", data: [2500, 5200, 8100], color: "#4A3AFF"}, {id: "Marketing", data: [1800, 3600, 5800], color: "#C893FD"}] }
     * **Multi series (3+ series)**: Use colors in order: #4A3AFF, #C893FD, #1e40af, #2563eb, #3b82f6
     * **Example 3 series**: series: [{id: "A", data: [100, 200], color: "#4A3AFF"}, {id: "B", data: [150, 250], color: "#C893FD"}, {id: "C", data: [80, 180], color: "#1e40af"}]
   
   **🚨 CRITICAL RULES:**
   - If data has categorical labels (NOT time) → ExcelFullWidthChartCategorical_Responsive with BAR chart
   - If data shows distribution/parts of whole → ExcelPieChart_Responsive with PIE chart
   - If data has time labels (months/quarters/years) → ExcelFullWidthChart_Responsive with AREA or LINE
   - **DO NOT use any other layout for categorical data**
   - **DO NOT use bar charts in ExcelFullWidthChart_Responsive**
16. **CRITICAL - ExcelComparisonLayout_Responsive table synchronization:**
   - If chartData.labels has 12 items → actualData MUST have 13 items (12 data + 1 Total)
   - If chartData.labels has 4 items → actualData MUST have 5 items (4 data + 1 Total)
   - Same rule applies to targetData
   - EVERY chart label MUST have a corresponding table row
   - DO NOT show only 3 months when the chart shows 12 months
   - Example: Chart with ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"]
     → actualData needs 13 rows: one for each month + Total
     → targetData needs 13 rows: one for each month + Total
17. **CRITICAL - Interpretation layouts MUST have detailed, substantive text:**
   - ExcelHowItWorks_Responsive: Each feature needs detailed descriptions (30-50 words each)
   - ExcelExperienceDrivenTwoRows_Responsive: **MUST have EXACTLY 4 items** displayed in 2x2 grid with comprehensive explanations (40-60 words each)
   - ExcelExperienceFullText_Responsive: Long-form text (150-250 words)
   - DO NOT use generic 1-sentence descriptions like "Fluctuaciones significativas en ingresos mensuales"
   - DO use detailed analysis like: "Los datos muestran fluctuaciones significativas en los ingresos mensuales, con variaciones de hasta un 79% entre el mes de mayor rendimiento (Enero: $75,408) y el de menor rendimiento (Marzo: $33,280). Esta volatilidad representa un desafío importante para la planificación financiera y requiere estrategias de estabilización para garantizar un flujo de caja más predecible y sostenible a largo plazo."
18. **🚨🚨🚨🚨🚨 CRITICAL - INTERPRETATION LAYOUTS - MAXIMUM 3 TOTAL - READ THIS 🚨🚨🚨🚨🚨**
   
   **THIS IS THE MOST IMPORTANT RULE - YOU ARE VIOLATING IT TOO OFTEN**
   
   **ABSOLUTE MAXIMUM FOR THE ENTIRE PRESENTATION: 3 INTERPRETATION LAYOUTS (TOTAL SLIDES: ${totalSlides})**
   **ABSOLUTE MAXIMUM FOR THIS BATCH: ${maxInterpretationThisBatch}**
   **YOU MUST USE EXACTLY ${maxInterpretationThisBatch} IN THIS BATCH - NOT ${maxInterpretationThisBatch + 1}, NOT ${maxInterpretationThisBatch - 1}, EXACTLY ${maxInterpretationThisBatch}**
   
   **🚨 FOR 15-20+ SLIDE PRESENTATIONS: THIS MEANS EXACTLY 3 INTERPRETATIONS TOTAL 🚨**
   **🚨 NOT 4, NOT 5, NOT 6 - ONLY 3 ACROSS ALL BATCHES 🚨**
   
   **WHAT ARE INTERPRETATION LAYOUTS?**
   - ONLY these 3 layouts count as interpretation layouts:
     * ExcelHowItWorks_Responsive (see Rule #6 - ONLY ONCE per presentation)
     * ExcelExperienceFullText_Responsive (can be used multiple times, but counts toward the 3 total)
     * ExcelExperienceDrivenTwoRows_Responsive (see Rule #6 - ONLY ONCE per presentation, MUST have exactly 4 items)
   
   **COUNT THEM CAREFULLY:**
   - If you add 1 ExcelHowItWorks_Responsive → that's 1 interpretation layout
   - If you add 2 ExcelExperienceFullText_Responsive → that's 2 interpretation layouts
   - If you add 1 ExcelExperienceDrivenTwoRows_Responsive → that's 1 interpretation layout
   - TOTAL = Cannot exceed 3 for the ENTIRE presentation
   
   - **NEVER USE THESE DEPRECATED LAYOUTS (they are NOT available):**
     * ExcelLimitationsTitleOnly_Responsive (deleted - DO NOT USE)
     * ExcelLimitationsRightOnly_Responsive (deleted - DO NOT USE)
     * ExcelLimitations_Responsive (deleted - DO NOT USE)
     * ExcelCurrentLimitations_Responsive (deleted - DO NOT USE)
     * ExcelExperienceDriven_Responsive (deleted - DO NOT USE)
     * ExcelExperienceDrivenDescription_Responsive (deleted - DO NOT USE)
   
   - **PLACEMENT FOR THIS BATCH:**
     * ${interpretationPlacement}
     * ${batchNumber === totalBatches ? `**REMEMBER**: Slide ${slideEnd - 1} (second-to-last) MUST be ExcelExperienceFullText_Responsive (conclusions) - this counts as 1 of your ${maxInterpretationThisBatch} for this batch` : ''}
   
   - **🚨 MANDATORY COUNTING CHECKPOINT - DO THIS BEFORE SUBMITTING 🚨:**
     * STEP 1: Count ALL interpretation layouts in your JSON (ExcelHowItWorks, ExcelExperienceFullText, ExcelExperienceDrivenTwoRows)
     * STEP 2: Verify the count equals EXACTLY ${maxInterpretationThisBatch} for this batch
     * STEP 3: If count ≠ ${maxInterpretationThisBatch}, DELETE or ADD interpretation layouts until count = ${maxInterpretationThisBatch}
     * STEP 4: Remember other batches will add their ${maxInterpretationTotal - maxInterpretationThisBatch} interpretation layout(s)
     * STEP 5: DO NOT add more than ${maxInterpretationThisBatch} even if you have space - stick to the limit
   
   - **EXAMPLE FOR 13 SLIDES (2 batches):**
     * Batch 1 (slides 1-10): Add EXACTLY 1 interpretation layout (e.g., slide 6)
     * Batch 2 (slides 11-13): Add EXACTLY 2 interpretation layouts (e.g., slide 11 and slide 12 as conclusions)
     * TOTAL = 3 interpretation layouts across entire presentation
   
   - **The rest of the slides MUST be chart/data layouts** (70% minimum per Rule #1)
   
   **IF YOU ADD MORE THAN ${maxInterpretationThisBatch} INTERPRETATION LAYOUTS, YOUR RESPONSE WILL BE REJECTED**
19. **CRITICAL - DO NOT USE ExcelDividers_Responsive:**
   - **NEVER use the ExcelDividers_Responsive layout**
   - This layout is not implemented correctly and should not be used
   - If you need section transitions, use interpretation layouts instead
20. **🚨 CRITICAL - KPI LAYOUTS PLACEMENT AND USAGE (see Rule #6 for usage limits) 🚨**
   - For presentations with 10 or more slides, use these 2 KPI highlight layouts (see Rule #6 - each ONLY ONCE):
     * ExcelResultsTestimonial_Responsive - Highlights important results or key findings
     * ExcelMilestone_Responsive - Shows a key metric/achievement with description
   
   - **CRITICAL - PLACEMENT - KEEP THEM SEPARATED:**
     * ExcelMilestone_Responsive and ExcelResultsTestimonial_Responsive MUST be placed FAR APART
     * DO NOT place them next to each other or within 2 slides of each other
     * **Recommended placement for 15+ slide presentations:**
       - ExcelMilestone_Responsive: Around the MIDDLE of the presentation (e.g., slide 7-9 of 15)
       - ExcelResultsTestimonial_Responsive: Near the END, but BEFORE ExcelExperienceFullText_Responsive (e.g., slide 12-13 of 15, with conclusions at 14)
     * **Example for 18 slides**: Milestone (slide 8-9), Results (slide 15-16), with Conclusions at slide 17
     * This creates better flow and prevents "KPI clustering"
   
   - **CRITICAL - Numeric values WITH appropriate suffixes:**
     * For ExcelMilestone_Responsive: milestoneValue should be NUMBER + SUFFIX (e.g., "484K", "2.5M", "1200")
     * For ExcelResultsTestimonial_Responsive: metrics value should be NUMBER + SUFFIX (e.g., "80%", "50K", "95")
     * **ALWAYS include the appropriate suffix**: K (thousands), M (millions), % (percentage), or no suffix for absolute numbers
     * The layout will render the suffix in smaller font automatically
     * **Example formats:**
       - $484K → use "484K"
       - 80% accuracy → use "80%"
       - 2.5M users → use "2.5M"
       - 1200 items → use "1200" (no suffix for absolute numbers under 1000)
   
   - These layouts should be placed strategically within the data section (typically after 3-5 chart slides)
   - They serve as visual anchors and highlight critical metrics from the Excel data
   - If the presentation has fewer than 10 slides, these layouts are optional
21. **🚨🚨🚨 CRITICAL - Chart type variety and MANDATORY distribution 🚨🚨🚨:**
   - **THIS IS A HARD REQUIREMENT - COUNT YOUR CHARTS AND VERIFY THE DISTRIBUTION**
   - **MANDATORY Chart type distribution** (you MUST follow this exact balance):
     * **50% of ALL time-series charts MUST be "area" type** (smooth, professional, visually appealing)
     * **30% of ALL time-series charts MUST be "line" type** (for comparisons and trends)
       - **🚨 CRITICAL: Line charts MUST NOT have dots (showDots: false)**
     * **20% of charts can be "bar" type** (ONLY for categorical data in ExcelFullWidthChartCategorical_Responsive)
     * **Pie charts** (ExcelPieChart_Responsive) do NOT count toward this distribution - they're separate
   
   - **🚨 CRITICAL CLARIFICATION:**
     * **BAR charts ONLY in ExcelFullWidthChartCategorical_Responsive** (categorical data)
     * **AREA charts ONLY in ExcelFullWidthChart_Responsive** (time-series data)
     * **LINE charts ONLY in ExcelFullWidthChart_Responsive** (time-series data)
     * **PIE charts ONLY in ExcelPieChart_Responsive** (distribution data)
     * **DO NOT use bar charts for time-series data** - use area or line instead
   
   - **CALCULATION EXAMPLE - YOU MUST DO THIS:**
     * If you have 10 chart layouts in your presentation:
       - 5 MUST be area charts (50% - time-series data)
       - 3 MUST be line charts (30% - time-series data)
       - 2 CAN be bar charts (20% - categorical data in ExcelFullWidthChartCategorical_Responsive)
     * If you have 8 chart layouts:
       - 4 MUST be area charts (50% - time-series data)
       - 2-3 MUST be line charts (30% - time-series data)
       - 1-2 CAN be bar charts (20% - categorical only)
     * If you have 6 chart layouts:
       - 3 MUST be area charts (50% - time-series data)
       - 2 MUST be line charts (30% - time-series data)
       - 1 CAN be bar chart (20% - categorical only)
   
   - **STRONGLY PREFER AREA CHARTS** for time-series data (months, quarters, years)
   - **Bar charts are ONLY for categorical data** - use ExcelFullWidthChartCategorical_Responsive
   - **Bar charts should be RARE** - only 20% of your total charts
   
   - **Chart type selection guide:**
     * Revenue over time → "area" in ExcelFullWidthChart_Responsive (ALWAYS preferred)
     * Sales trends → "area" in ExcelFullWidthChart_Responsive (ALWAYS preferred)
     * Growth metrics → "area" in ExcelFullWidthChart_Responsive (ALWAYS preferred)
     * Cost analysis → "area" in ExcelFullWidthChart_Responsive (ALWAYS preferred)
     * Performance over time → "area" in ExcelFullWidthChart_Responsive (ALWAYS preferred)
     * Multiple trend comparison → "line" in ExcelFullWidthChart_Responsive (30% of charts)
     * Categorical data (products, departments, regions) → "bar" in ExcelFullWidthChartCategorical_Responsive (ONLY 20% of charts)
     * Distribution/percentage data → "pie" in ExcelPieChart_Responsive (separate, doesn't count in 50/30/20 rule)
   
   - **COUNT BEFORE SUBMITTING:**
     * Total chart layouts (ExcelTrendChart, ExcelFullWidthChart, ExcelComparisonLayout, etc.): ___
     * Area charts: ___ (MUST be 50% of total)
     * Line charts: ___ (MUST be 30% of total)
     * Bar charts: ___ (MUST be 20% of total, MAX 2-3 per presentation)
   
   - **THIS RULE IS NON-NEGOTIABLE** - Area charts make presentations look professional and modern

🌍 **FINAL LANGUAGE CHECK BEFORE GENERATING JSON:**
- Review the user's request language: "${presentationPrompt}"
- **EVERY** field in the JSON below (title, subtitle, description, leftText, rightText, insights, etc.) MUST be in the SAME language
- **NO English text if the request is in Spanish**
- **NO Spanish text if the request is in English**
- Double-check: Are ALL your text fields in the correct language?

🚨🚨🚨 FINAL MANDATORY CHECKPOINT - VERIFY NO DUPLICATE CONTENT 🚨🚨🚨

BEFORE GENERATING JSON, YOU MUST COMPLETE THIS VERIFICATION:

1. **LIST ALL SERIES.ID VALUES** from every chart slide you plan to create:
   - Write them down mentally: [series 1, series 2, series 3, ...]
   
2. **CHECK FOR DUPLICATES**:
   - Does ANY series.id appear MORE THAN ONCE?
   - Does ANY Excel row appear in MULTIPLE slides?
   
3. **IF YOU FIND DUPLICATES**:
   - STOP immediately
   - DELETE the entire duplicate slide(s)
   - Choose DIFFERENT Excel rows/sections for remaining slides
   
4. **VERIFY UNIQUENESS**:
   - Each Excel row = used MAXIMUM 1 time
   - Each series.id = appears ONLY ONCE across all slides
   - Each chart = shows DIFFERENT data from other charts

5. **CONFIRM**:
   - ✅ NO duplicate series.id values
   - ✅ NO duplicate Excel rows/metrics
   - ✅ Each slide shows unique, non-overlapping data
   - ✅ If ANY doubt → slide is REMOVED

**REMEMBER**: It is BETTER to generate FEWER slides with unique data than MORE slides with duplicates.
**DUPLICATES = IMMEDIATE REJECTION OF ENTIRE PRESENTATION**

🚨🚨🚨 CRITICAL INSTRUCTION - GENERATE JSON NOW 🚨🚨🚨
**DO NOT ask questions. DO NOT provide explanations. IMMEDIATELY generate the JSON.**
**Your response MUST start with a '{' character and contain ONLY valid JSON.**
**NO conversational text before or after the JSON.**
**NO comments inside the JSON (no // or /* */ comments).**
**Every property must have a comma after it (except the last one before a closing brace).**
**All strings must use properly escaped quotes.**
**VALIDATE your JSON before responding - make sure it's syntactically correct.**

Return a JSON object with this EXACT structure:
{
  "title": "Presentation title based on data",
  "slides": [
    {
      "id": 1,
      "title": "Slide title",
      "layout": "ExcelCenteredCover_Responsive",
      "props": {
        "title": "Main title",
        "subtitle": "Subtitle text",
        "canvasWidth": 881,
        "canvasHeight": 495
      }
    }
  ]
}

For each layout, provide appropriate props with REAL DATA from the Excel:

**ExcelCenteredCover_Responsive:**
{ 
  title: "Main presentation title",
  description: "Brief, context-specific description of what the presentation covers - MUST be adaptive to the data and in user's language"
}
// CRITICAL: The description must summarize the presentation's purpose based on actual Excel data
// English example: "Comprehensive financial analysis showing Q4 revenue trends and growth opportunities."
// Spanish example: "Análisis financiero completo mostrando tendencias de ingresos y oportunidades de crecimiento."

**ExcelTableOfContents_Responsive:**
{
  title: "Table of Contents",  // or "Tabla de Contenidos" in Spanish
  items: [
    { page: "2", title: "Executive Summary" },
    { page: "3", title: "Market Analysis" },
    { page: "5", title: "Financial Overview" },
    { page: "8", title: "Key Findings" },
    { page: "10", title: "Recommendations" }
  ]
}
// **CRITICAL RULE FOR TABLE OF CONTENTS:**
// • The ToC MUST reflect the ACTUAL structure of your presentation
// • Count EVERY slide you generate (including Cover, ToC itself, data slides, interpretation slides, back cover)
// • Each item must correspond to a REAL slide in the presentation
// • Page numbers must be sequential and accurate (Cover=1, ToC=2, then 3,4,5... up to Back Cover)
// • Include ALL major sections: data layouts, interpretation layouts, and conclusion slides
// • Group similar slides under section headings (e.g., "Financial Analysis" for slides 3-5, "Key Insights" for slides 6-8)
// • The number of ToC items should match the number of major sections in your presentation
// • Example for 13-slide presentation:
//   - Cover (slide 1) - not in ToC
//   - ToC (slide 2) - not in ToC
//   - Data Analysis (slides 3-6) → ToC item: { page: "3", title: "Análisis de Datos" }
//   - Key Insights (slides 7-9) → ToC item: { page: "7", title: "Hallazgos Clave" }
//   - Recommendations (slides 10-11) → ToC item: { page: "10", title: "Recomendaciones" }
//   - Conclusions (slide 12) → ToC item: { page: "12", title: "Conclusiones" }
//   - Back Cover (slide 13) - not in ToC

**ExcelIndex_Responsive (Meeting Agenda):**
{
  title: "Meeting Agenda" or "Index",
  items: [
    { number: "01", title: "Topic Title", description: "Brief description of topic" },
    { number: "02", title: "Another Topic", description: "Topic description" },
    { number: "03", title: "Discussion Point", description: "What will be covered" }
  ]
}

**ExcelKPIDashboard_Responsive:**
{
  title: "Dashboard title",
  description: "Context-specific overview of what these KPIs represent - MUST be adaptive to the data and in user's language",
  kpiCards: [
    {
      value: "$648K",
      label: "Metric Name",
      subtitle: "Description or trend info",
      chartData: {
        type: "area", // ONLY "area", "line", or "bar" - NO PIE CHARTS
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        series: [{ id: "Revenue", data: [42, 48, 52, 58, 62, 68] }],
        showLegend: false,
        showGrid: false,
        stacked: false,
        curved: true,
        animate: true,
        showDots: false
      }
    },
    {
      value: "16.2K",
      label: "Another Metric",
      subtitle: "+15% increase",
      chartData: {
        type: "line", // ONLY "area", "line", or "bar" - NO PIE CHARTS
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        series: [{ id: "Units", data: [1200, 1350, 1180, 1450, 1520, 1620] }],
        showLegend: false,
        showGrid: false,
        curved: false,
        animate: true,
        showDots: false
      }
    },
    {
      value: "3.2%",
      label: "Third Metric",
      subtitle: "+12% improvement",
      chartData: {
        type: "bar",
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        series: [{ id: "Conversion", data: [2.4, 3.1, 2.8, 3.5, 4.2, 3.9] }],
        showLegend: false,
        showGrid: false,
        stacked: false,
        animate: true
      }
    }
  ]
}
// CRITICAL: The description must explain what these specific KPIs measure in relation to the actual Excel data
// English example: "Key financial metrics tracking monthly income, expenses, and savings performance."
// Spanish example: "Métricas financieras clave monitoreando ingresos, gastos y rendimiento de ahorros mensuales."
//
// **CRITICAL RULE FOR KPI DASHBOARD CHARTS:**
// • Each chart in kpiCards MUST have AT LEAST 3 data points in the series
// • Charts with only 1-2 data points look empty and unprofessional
// • If you don't have enough data for a mini-chart, omit the chartData entirely
// • Example: labels: ["Jan", "Feb", "Mar"] with data: [100, 150, 120] - minimum acceptable

**ExcelTrendChart_Responsive:**
{
  title: "Chart title",
  overallPerformance: "+80%", // CALCULATE from chart data: ((180-100)/100)*100 = +80% OR omit for categorical data
  performanceLabel: "Overall Performance", // TRANSLATE: "Overall Performance" (EN), "Rendimiento General" (ES) OR omit for categorical data
  chartData: {
    type: "bar" or "line" or "area",
    labels: ["Jan", "Feb", "Mar", "Apr"],
    series: [{ id: "Series Name", data: [100, 150, 120, 180] }],
    showLegend: false,
    showGrid: true,
    stacked: false,
    animate: true
  },
  insights: [
    "First insight about the data trend",
    "Second insight about peak performance",
    "Third insight about growth or decline",
    "Fourth insight about future implications"
  ]
}
// CRITICAL: performanceLabel MUST be in user's language!
// IMPORTANT: Check chart labels FIRST before adding overallPerformance:
// 
// ❌ BAD EXAMPLE (categorical data - NO overallPerformance):
// {
//   title: "Distribución de Gastos Mensuales",
//   chartData: {
//     labels: ["Alquiler", "Electricidad", "Combustible", "Comida", "Otros"],  // ← These are categories, NOT time!
//     series: [{ id: "Gastos", data: [800, 150, 50, 300, 1050] }]
//   },
//   // DO NOT INCLUDE overallPerformance or performanceLabel here!
//   insights: [...]
// }
//
// ✅ GOOD EXAMPLE (time-based data - YES overallPerformance):
// {
//   title: "Ingresos Mensuales",
//   chartData: {
//     labels: ["Enero", "Febrero", "Marzo", "Abril"],  // ← These are months (time sequence)!
//     series: [{ id: "Ingresos", data: [2000, 2200, 2100, 2400] }]
//   },
//   overallPerformance: "+20%",  // ← INCLUDE because it's time-based
//   performanceLabel: "Rendimiento general",
//   insights: [...]
// }

**ExcelDataTable_Responsive:**
{
  title: "Table title",
  description: "Brief interpretation or context about what the table shows",
  headers: ["Column1", "Column2", "Column3", "Column4"], // Use ACTUAL Excel column names
  data: [
    { "Column1": "Value1", "Column2": "Value2", "Column3": "Value3", "Column4": "Value4" },
    { "Column1": "Value1", "Column2": "Value2", "Column3": "Value3", "Column4": "Value4" }
  ]
}
// IMPORTANT: 
// - headers array defines ALL column names (can be 3, 5, 8, or any number of columns)
// - Each data object MUST have keys matching the headers array exactly
// - Use REAL data from Excel sheets - extract actual values, not placeholders
// - Example with real financial data:
//   headers: ["Category", "Jan", "Feb", "Mar", "Total", "Change"]
//   data: [
//     { "Category": "Revenue", "Jan": "€50,000", "Feb": "€55,000", "Mar": "€60,000", "Total": "€165,000", "Change": "+10%" },
//     { "Category": "Costs", "Jan": "€30,000", "Feb": "€32,000", "Mar": "€35,000", "Total": "€97,000", "Change": "+7%" }
//   ]

**ExcelFullWidthChart_Responsive:** (FOR TIME-SERIES DATA ONLY - months, quarters, years)
{
  title: "Chart title",
  chartData: {
    type: "line" or "bar" or "area",
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],  // ← MUST be time-based
    series: [{ id: "Revenue", data: [2500, 3200, 2800, 4100, 3900, 4500] }],
    showLegend: false,
    showGrid: true,
    stacked: false,
    animate: true
  },
  overallPerformance: "+80%", // CALCULATE: ((lastValue - firstValue) / firstValue) * 100
  performanceLabel: "Overall performance", // TRANSLATE: "Overall performance" (EN), "Rendimiento general" (ES)
  description: "Descriptive insight about the full-width chart trend"
}
// USE THIS LAYOUT ONLY for time-series data (months, quarters, years, dates)

**ExcelFullWidthChartCategorical_Responsive:** (FOR CATEGORICAL DATA - products, regions, categories)
{
  title: "Chart title",
  chartData: {
    type: "bar" or "line" or "area",
    labels: ["Category A", "Category B", "Category C"],  // ← Categorical labels
    series: [{ id: "Values", data: [800, 150, 300] }],
    showLegend: false,
    showGrid: true,
    stacked: false,
    animate: true
  },
  // NO overallPerformance or performanceLabel - this layout doesn't support it
  description: "Descriptive insight about the categorical distribution"
}
// USE THIS LAYOUT for:
// - Product categories (Product A, Product B)
// - Expense categories (Rent, Food, Transport)
// - Geographic regions (North, South, East, West)
// - Department names (Sales, Marketing, HR)
// - ANY non-time-based categorical data

**ExcelFullWidthChartWithTable_Responsive:**
{
  title: "Chart with Table title",
  chartData: {
    type: "line",
    labels: ["Jan", "Feb", "Mar", "Apr"],
    series: [{ id: "Sales", data: [100, 150, 120, 180] }],
    showLegend: false,
    showGrid: true,
    stacked: false,
    animate: true
  },
  tableData: [
    { metric: "Jan", value: "$100K" },
    { metric: "Feb", value: "$150K" },
    { metric: "Mar", value: "$120K" },
    { metric: "Apr", value: "$180K" }
  ],
  overallPerformance: "+80%", // CALCULATE: ((180-100)/100)*100 = +80% OR omit for categorical data
  performanceLabel: "Overall performance", // TRANSLATE: "Overall performance" (EN), "Rendimiento general" (ES) OR omit for categorical data
  description: "Descriptive text about the chart and table data"
}
// IMPORTANT: OMIT overallPerformance and performanceLabel if labels are categorical
// INCLUDE overallPerformance and performanceLabel if labels are time-based sequences

**ExcelComparisonLayout_Responsive:** (FOR COMPARING ACTUAL VS TARGET/GOAL DATA)
{
  title: "Comparison title",
  chartData: {
    type: "bar",
    labels: ["Q1", "Q2", "Q3", "Q4"],  // ← MUST match Excel data (quarters, months, etc.)
    series: [
      { id: "Actual", data: [156, 168, 162, 162] },  // ← Real actual values from Excel
      { id: "Target", data: [165, 170, 175, 180] }   // ← Real target values from Excel
    ],
    showLegend: true,           // ← ALWAYS true for Comparison View
    legendPosition: "bottom",   // ← ALWAYS "bottom" - legend must appear below the chart
    legendSize: "small",        // ← ALWAYS "small" - legend text must be small
    showGrid: true,
    stacked: false,
    animate: true
  },
  actualData: [
    { metric: "Q1", value: "$156K" },   // ← metric MUST match chartData.labels[0]
    { metric: "Q2", value: "$168K" },   // ← metric MUST match chartData.labels[1]
    { metric: "Q3", value: "$162K" },   // ← metric MUST match chartData.labels[2]
    { metric: "Q4", value: "$162K" },   // ← metric MUST match chartData.labels[3]
    { metric: "Total", value: "$648K" } // ← Calculate sum of all actual values
  ],
  targetData: [
    { metric: "Q1", value: "$165K" },   // ← metric MUST match chartData.labels[0]
    { metric: "Q2", value: "$170K" },   // ← metric MUST match chartData.labels[1]
    { metric: "Q3", value: "$175K" },   // ← metric MUST match chartData.labels[2]
    { metric: "Q4", value: "$180K" },   // ← metric MUST match chartData.labels[3]
    { metric: "Total", value: "$690K" } // ← Calculate sum of all target values
  ],
  actualTableTitle: "Actual Performance",        // MUST BE ADAPTIVE AND IN USER'S LANGUAGE
  targetTableTitle: "Target Performance",         // MUST BE ADAPTIVE AND IN USER'S LANGUAGE
  metricColumnHeader: "Quarter",                  // MUST BE ADAPTIVE (Quarter/Trimestre, Month/Mes, etc.)
  actualColumnHeader: "Revenue",                  // MUST BE ADAPTIVE (Revenue/Ingresos, Sales/Ventas, etc.)
  targetColumnHeader: "Target",                   // MUST BE ADAPTIVE (Target/Objetivo, Goal/Meta, etc.)
  overallPerformance: "-6.1%", // CALCULATE: ((actualTotal - targetTotal) / targetTotal) * 100 OR omit for categorical data
  performanceLabel: "Overall performance", // TRANSLATE: "Overall performance" (EN), "Rendimiento general" (ES) OR omit for categorical data
  description: "Descriptive text about the comparison between actual and target"
}
// CRITICAL RULES FOR COMPARISON LAYOUT:
// 1. chartData.labels MUST come from Excel (e.g., actual months/quarters from your data)
// 2. chartData.series[0].data (Actual) MUST be real actual values from Excel
// 3. chartData.series[1].data (Target) MUST be real target values from Excel
// 4. **CRITICAL**: actualData array MUST have EXACTLY chartData.labels.length + 1 rows (data + Total)
// 5. **CRITICAL**: targetData array MUST have EXACTLY chartData.labels.length + 1 rows (data + Total)
// 6. The "metric" field in each row MUST match the corresponding chart label EXACTLY
// 7. ALWAYS include a "Total" row at the end with the sum of all values
// 8. ALL text fields (titles, headers, labels) MUST be in the user's language
// 9. Extract REAL data from Excel - DO NOT use placeholder values like 156, 168, 162
// 10. Format values consistently (e.g., "$156K" not "$156,000")
// 11. OMIT overallPerformance/performanceLabel if labels are categorical
// 
// EXAMPLE - If chart has 12 months, tables MUST have 13 rows (12 months + Total):
// chartData.labels = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"] (12 items)
// actualData = [
//   { metric: "Ene", value: "$75K" },
//   { metric: "Feb", value: "$42K" },
//   { metric: "Mar", value: "$33K" },
//   { metric: "Abr", value: "$58K" },
//   { metric: "May", value: "$47K" },
//   { metric: "Jun", value: "$52K" },
//   { metric: "Jul", value: "$61K" },
//   { metric: "Ago", value: "$39K" },
//   { metric: "Sep", value: "$44K" },
//   { metric: "Oct", value: "$56K" },
//   { metric: "Nov", value: "$48K" },
//   { metric: "Dic", value: "$53K" },
//   { metric: "Total", value: "$608K" }
// ] (13 items = 12 data rows + 1 Total row)
//
// EXAMPLE WORKFLOW:
// Step 1: Extract labels from Excel → ["Jan", "Feb", "Mar", "Apr"]
// Step 2: Extract actual values → [2000, 2200, 2100, 2400]
// Step 3: Extract target values → [2100, 2200, 2300, 2400]
// Step 4: Build chartData with these EXACT values
// Step 5: Build actualData with same labels: [{ metric: "Jan", value: "$2.0K" }, ...]
// Step 6: Build targetData with same labels: [{ metric: "Jan", value: "$2.1K" }, ...]
// Step 7: Add Total rows with sums
// 
// English Examples:
//   - actualTableTitle: "Actual Performance", "Real Sales", "Current Results", "Actual Revenue"
//   - targetTableTitle: "Target Performance", "Sales Goal", "Expected Results", "Revenue Target"
//   - metricColumnHeader: "Quarter", "Month", "Period", "Category", "Product"
//   - actualColumnHeader: "Revenue", "Sales", "Income", "Amount", "Units"
//   - targetColumnHeader: "Target", "Goal", "Objective", "Expected", "Planned"
//
// Spanish Examples:
//   - actualTableTitle: "Rendimiento Real", "Ventas Reales", "Resultados Actuales", "Ingresos Reales"
//   - targetTableTitle: "Rendimiento Objetivo", "Meta de Ventas", "Resultados Esperados", "Objetivo de Ingresos"
//   - metricColumnHeader: "Trimestre", "Mes", "Período", "Categoría", "Producto"
//   - actualColumnHeader: "Ingresos", "Ventas", "Importe", "Cantidad", "Unidades"
//   - targetColumnHeader: "Objetivo", "Meta", "Esperado", "Planificado"
//
// ALWAYS match the user's language and data context!

**ExcelLimitations_Responsive:**
{
  title: "Limitaciones Identificadas" or "Current Limitations",
  limitations: [
    {
      main: "Variabilidad de Ingresos",
      sub: "Los datos muestran fluctuaciones significativas en los ingresos mensuales, con variaciones de hasta un 79% entre el mes de mayor rendimiento (Enero: $75,408) y el de menor rendimiento (Marzo: $33,280). Esta volatilidad representa un desafío importante para la planificación financiera y requiere estrategias de estabilización para garantizar un flujo de caja más predecible y sostenible a largo plazo."
    },
    {
      main: "Dependencia de Nuevos Negocios",
      sub: "El análisis revela una fuerte dependencia del crecimiento a través de nuevas adquisiciones mensuales, con el segmento de 'Nuevos Negocios' representando aproximadamente el 15-20% de los ingresos totales. Esta dependencia crea vulnerabilidad en períodos de menor actividad comercial y limita la capacidad de mantener un crecimiento orgánico sostenible basado en clientes recurrentes."
    },
    {
      main: "Concentración de Riesgo Estacional",
      sub: "Los patrones de datos indican una concentración significativa de ingresos en ciertos períodos del año, con el primer trimestre mostrando el rendimiento más fuerte. Esta estacionalidad puede generar desafíos de liquidez durante los meses de menor actividad y requiere una gestión cuidadosa del capital de trabajo para mantener operaciones estables durante todo el ciclo anual."
    }
  ]
}
// CRITICAL: Each "sub" field must be 40-60 words with specific data points, analysis, and implications from the Excel

// DO NOT USE: ExcelLimitationsTitleOnly_Responsive - This layout is deprecated
// Use ExcelExperienceFullText_Responsive instead

// DO NOT USE: ExcelExperienceDriven_Responsive - This layout is deprecated
// Use ExcelExperienceDrivenTwoRows_Responsive or ExcelExperienceFullText_Responsive instead

// DO NOT USE: ExcelExperienceDrivenDescription_Responsive - This layout is deprecated
// Use ExcelExperienceFullText_Responsive instead

**ExcelExperienceFullText_Responsive:**
{
  title: "Title",
  leftText: "Left column text with paragraphs separated by \\n\\n",
  rightText: "Right column text with paragraphs separated by \\n\\n"
}

**ExcelExperienceDrivenTwoRows_Responsive:** (MUST have EXACTLY 4 items)
{
  title: "Title",
  subtitle: "Brief subtitle",
  insights: [
    { main: "First insight statement", sub: "Supporting detail for first insight" },
    { main: "Second insight statement", sub: "Supporting detail for second insight" },
    { main: "Third insight statement", sub: "Supporting detail for third insight" },
    { main: "Fourth insight statement", sub: "Supporting detail for fourth insight" }
  ]
}
// CRITICAL: This layout displays insights in a 2x2 grid (2 rows, 2 columns)
// ALWAYS provide EXACTLY 4 items - no more, no less
// If you have fewer than 4 insights, use ExcelExperienceFullText_Responsive instead
// Each insight should be comprehensive (40-60 words each)

**ExcelHowItWorks_Responsive:**
{
  title: "Estrategias de Crecimiento" or "Growth Strategies",
  subtitle: "Acciones para optimizar el rendimiento financiero" or "Actions to optimize financial performance",
  features: [
    {
      icon: "check",
      title: "Estabilización de Ingresos",
      description: "Implementar estrategias para reducir la variabilidad mensual de ingresos mediante contratos recurrentes y diversificación de fuentes de ingreso. Esto incluye desarrollar productos de suscripción y servicios de mantenimiento que generen flujos de caja más predecibles y sostenibles a lo largo del año."
    },
    {
      icon: "chart",
      title: "Optimización de Costos",
      description: "Analizar y minimizar gastos operativos mediante la identificación de áreas de ineficiencia y la implementación de procesos más eficientes. Esto permitirá aumentar los márgenes de ganancia sin comprometer la calidad del servicio, liberando recursos para reinversión en crecimiento y desarrollo."
    },
    {
      icon: "star",
      title: "Diversificación de Fuentes",
      description: "Expandir la cartera de clientes y servicios para reducir la dependencia de nuevos negocios mensuales. Establecer relaciones a largo plazo con clientes existentes mediante programas de fidelización y upselling, creando una base de ingresos más estable y recurrente que soporte el crecimiento sostenible."
    },
    {
      icon: "shield",
      title: "Sostenibilidad Financiera",
      description: "Desarrollar un modelo financiero robusto que garantice crecimiento consistente mediante la optimización del capital de trabajo y la gestión estratégica de recursos. Implementar sistemas de monitoreo y control que permitan identificar oportunidades de mejora y responder rápidamente a cambios en el mercado."
    }
  ]
}
// CRITICAL: This layout MUST have EXACTLY 4 features (no more, no less)
// CRITICAL: Each description must be 30-50 words with actionable strategies and business context
// It displays features in a 2x2 grid
// If you have fewer or more than 4 items, use a different layout instead

**ExcelMilestone_Responsive:**
{
  title: "Milestone Achievement",
  milestoneValue: "500+",  // CRITICAL: Provide ONLY the number (e.g., "500", "1200", "85") - the layout will add "K", "M", or "%" suffix automatically
  growth: "+32.85% vs last year",
  leftDescription: "Interpretive text explaining the milestone achievement and its significance",
  rightDescription: "Additional context about the approach, strategy, or impact of this milestone"
}
// **CRITICAL RULE FOR milestoneValue:**
// • Provide ONLY the numeric value (e.g., "484", "69", "40", "1200")
// • DO NOT include suffixes like "K", "M", "%", or "+" in the milestoneValue
// • The layout component will automatically format it with the appropriate suffix
// • Example: If the value is $484K, pass milestoneValue: "484" (not "484K")
// • Example: If the value is 1.2M, pass milestoneValue: "1200" (not "1200K" or "1.2M")

**ExcelResultsTestimonial_Responsive:**
{
  title: "Results Title",
  subtitle: "Brief description or context",
  metrics: [
    { value: "80", growth: "+35% improvement", description: "What this metric means" },  // CRITICAL: Provide ONLY the number (e.g., "80", "50", "95")
    { value: "50", growth: "+22% faster", description: "Impact description" },
    { value: "95", growth: "+8% increase", description: "Metric interpretation" }
  ]
}
// **CRITICAL RULE FOR metrics values:**
// • Provide ONLY the numeric value (e.g., "80", "50", "95", "484")
// • DO NOT include suffixes like "K", "M", "%", or "+" in the value field
// • The layout component will automatically format it with the appropriate suffix
// • Example: If the value is 80%, pass value: "80" (not "80%")
// • Example: If the value is 484K, pass value: "484" (not "484K")

**ExcelBackCover_Responsive:**
{
  title: "Thank You",
  description: "Closing message",
  email: "contact@example.com",
  phone: "+1234567890",
  website: "www.example.com"
}

IMPORTANT: Extract REAL values from the Excel data. Use actual numbers, categories, and time periods from the sheets. 

For interpretation layouts (Limitations, Experience, How It Works):
• Generate text that INTERPRETS and EXPLAINS the Excel data
• Don't just copy raw numbers - provide insights, context, and meaning
• Make limitations/challenges data-driven (e.g., "Limited data for Q4", "Inconsistent reporting periods")
• Make experiences/insights data-driven (e.g., "Revenue growth accelerated in Q2", "Seasonal patterns observed")
• Make features/processes data-driven (e.g., "Data collection from 5 sources", "Analysis covers 12-month period")

For table layouts (Data Table, Comparison View, Chart with Table):
• Extract REAL data from Excel sheets - use actual row labels, column values, and metrics
• Headers array MUST list ALL column names from Excel (can be 3, 5, 8, or any number)
• Each data object MUST have keys that EXACTLY match the headers array
• Use actual Excel values with proper currency symbols, units, and formatting

**ExcelDataTable_Responsive Example:**
headers: ["Expense Type", "January", "February", "March", "Total", "% Change"]
data: [
  { "Expense Type": "Rent", "January": "€800", "February": "€800", "March": "€800", "Total": "€2,400", "% Change": "0%" },
  { "Expense Type": "Food", "January": "€500", "February": "€520", "March": "€480", "Total": "€1,500", "% Change": "-4%" }
]

**CRITICAL RULE FOR DATA TABLE LAYOUT:**
• ONLY use ExcelDataTable_Responsive when you have AT LEAST 8 rows of data
• If you have fewer than 8 rows, use a different layout (KPI Dashboard, Chart, or List layout instead)
• The table layout looks empty with only 2-3 rows - it needs substantial data to look professional

• For Comparison View: actualData and targetData must contain real values from Excel
• For Chart with Table: tableHeaders and tableData must match the chart data labels and values

${totalBatches > 1 ? `
**🚨 BATCHED GENERATION - CRITICAL REMINDERS:**
• This is batch ${batchNumber} of ${totalBatches}
• Generate ONLY slides ${slideStart} to ${slideEnd} (${slideEnd - slideStart + 1} slides total)
• The slide IDs should be numbered starting from ${slideStart}
• This batch is part of a ${slideCount}-slide presentation
• Maintain consistency with the overall presentation structure

🚨🚨🚨 INTERPRETATION LAYOUTS - ULTRA STRICT FINAL WARNING 🚨🚨🚨
  - **USE EXACTLY ${maxInterpretationThisBatch} INTERPRETATION LAYOUT(S) IN THIS BATCH**
  - **PRESENTATION SIZE: ${totalSlides} slides → MAXIMUM ${maxInterpretationTotal} interpretations TOTAL**
  - **FOR 15-20+ SLIDES: ABSOLUTE MAXIMUM = 3 INTERPRETATIONS TOTAL (NOT 4, NOT 5)**
  - Placement: ${interpretationPlacement}
  - Other batches will add ${maxInterpretationTotal - maxInterpretationThisBatch} more interpretation layout(s)
  - If you add ${maxInterpretationThisBatch + 1} or more, the ENTIRE presentation will be REJECTED
  - COUNT THEM before submitting: ExcelHowItWorks_Responsive, ExcelExperienceFullText_Responsive, ExcelExperienceDrivenTwoRows_Responsive
  - The count MUST be ${maxInterpretationThisBatch}
  - **REPEAT: FOR ${totalSlides}-SLIDE PRESENTATION, MAX = ${maxInterpretationTotal} INTERPRETATIONS TOTAL**
  
${whichInterpretationLayouts}

**COVER AND BACK COVER FOR THIS BATCH:**
  ${batchNumber === 1 ? '- ✅ INCLUDE: Cover slide (slide 1)' : '- ❌ DO NOT INCLUDE: Cover slide (only in batch 1)'}
  ${batchNumber === 1 && slideCount >= 8 ? '- ✅ INCLUDE: Table of Contents (slide 2)' : ''}
  ${batchNumber === totalBatches ? `- ✅ INCLUDE: Conclusions slide (slide ${slideCount - 1})` : `- ❌ DO NOT INCLUDE: Conclusions slide (only in batch ${totalBatches})`}
  ${batchNumber === totalBatches ? `- ✅ INCLUDE: Back Cover slide (slide ${slideCount})` : `- ❌ DO NOT INCLUDE: Back Cover slide (only in batch ${totalBatches})`}
  
**IMPORTANT**: ${batchNumber === totalBatches ? `Your last slide (${slideEnd}) MUST be the Back Cover` : `DO NOT end with a Back Cover - that comes in batch ${totalBatches}`}

🚨🚨🚨 RULE #6 - LAYOUTS THAT CAN ONLY BE USED ONCE - BATCH COORDINATION 🚨🚨🚨
  ${totalBatches > 1 ? `
  **YOU ARE BATCH ${batchNumber} OF ${totalBatches}**
  
  These layouts can be used EXACTLY 1 TIME TOTAL across ALL batches:
  - ExcelComparisonLayout_Responsive
  - ExcelKPIDashboard_Responsive
  - ExcelHowItWorks_Responsive (interpretation layout - counted in Rule 18 limit)
  - ExcelExperienceDrivenTwoRows_Responsive (interpretation layout - counted in Rule 18 limit)
  - ExcelDataTable_Responsive (only if 8+ rows)
  - ExcelMilestone_Responsive (10+ slides only)
  - ExcelResultsTestimonial_Responsive (10+ slides only)
  
  ${totalBatches === 2 ? `
  🎯 BATCH-SPECIFIC ASSIGNMENT FOR 2-BATCH SYSTEM:
  
  ${batchNumber === 1 ? `**YOUR BATCH (BATCH 1) - YOU CAN USE:**
  ✅ ExcelKPIDashboard_Responsive (use near start, after ToC)
  ✅ ExcelComparisonLayout_Responsive (use in middle)
  ✅ ExcelDataTable_Responsive (only if you have 8+ rows - optional)
  ✅ ONE interpretation layout: ExcelHowItWorks OR ExcelExperienceDrivenTwoRows (your choice)
  
  ❌ RESERVED FOR BATCH 2 (DO NOT USE):
  ❌ ExcelMilestone_Responsive (batch 2 will use this)
  ❌ ExcelResultsTestimonial_Responsive (batch 2 will use this)
  ❌ ExcelExperienceFullText_Responsive (batch 2 will use for conclusions)
  ` : `**YOUR BATCH (BATCH 2) - YOU CAN USE:**
  ✅ ExcelMilestone_Responsive (use around slide ${Math.floor((slideStart + slideEnd) / 2) - 2})
  ✅ ExcelResultsTestimonial_Responsive (use near end, around slide ${slideEnd - 3})
  ✅ ONE interpretation layout: ExcelHowItWorks OR ExcelExperienceDrivenTwoRows (whichever batch 1 DIDN'T use)
  ✅ ExcelExperienceFullText_Responsive (MANDATORY at slide ${slideEnd - 1} for conclusions)
  
  ❌ ALREADY USED BY BATCH 1 (DO NOT USE):
  ❌ ExcelKPIDashboard_Responsive (batch 1 already used it)
  ❌ ExcelComparisonLayout_Responsive (batch 1 already used it)
  ❌ ExcelDataTable_Responsive (batch 1 may have used it)
  `}
  ` : `
  🎯 FOR 3+ BATCH SYSTEM:
  - Distribute these 8 "use only once" layouts across all ${totalBatches} batches
  - Each batch should use approximately ${Math.floor(8 / totalBatches)}-${Math.ceil(8 / totalBatches)} of these layouts
  - ${batchNumber === 1 ? 'Use ExcelKPIDashboard and ExcelComparisonLayout in this batch' : ''}
  - ${batchNumber === totalBatches ? 'Use ExcelMilestone, ExcelResultsTestimonial in this batch' : ''}
  - Assume other batches will use the remaining layouts
  `}
  
  **CRITICAL REMINDERS:**
  - NEVER use ANY of these layouts MORE THAN ONCE in your batch
  - If you're told a layout is "reserved for batch X", DO NOT use it in your batch
  - When in doubt, it's better to SKIP a layout than to risk duplication
  ` : `
  - See Rule #6: Each of these layouts can be used EXACTLY 1 time in the presentation:
    * ExcelComparisonLayout_Responsive, ExcelKPIDashboard_Responsive
    * ExcelHowItWorks_Responsive, ExcelExperienceDrivenTwoRows_Responsive
    * ExcelDataTable_Responsive, ExcelMilestone_Responsive
    * ExcelResultsTestimonial_Responsive
  `}

🚨🚨🚨 RULE #7 - PERSONAL FINANCIAL ANALYST MODE 🚨🚨🚨
**ACTIVATE THIS MODE WHEN THE DATA IS ABOUT PERSONAL FINANCES**

If the uploaded data contains personal financial information (income, expenses, savings, budgets, financial goals), you must act as a professional personal finance analyst and strategist. Transform your analysis approach to:

**1. Understand and Clarify the Financial Situation:**
- Interpret their financial situation based on the data provided (income, expenses, savings patterns)
- Organize income, expenses, and savings habits into clear, actionable categories
- Create slides that make their financial reality crystal clear and easy to understand

**2. Detect Inefficiencies and Offer Real Solutions:**
- Identify excessive spending patterns, poor budgeting habits, or low savings rates
- Create comparison slides showing: actual spending vs. recommended spending
- Include specific, actionable recommendations in interpretation layouts (ExcelExperienceFullText_Responsive, ExcelHowItWorks_Responsive)
- Use insights to point out where they can cut costs or redirect funds more effectively
- Example insights: "Your dining expenses are 35% above the recommended 15% of income"

**3. Help Them Grow Through Passive Income and Long-Term Wealth Building:**
- Add interpretation slides that educate on accessible low-risk passive income strategies:
  * Index funds and ETFs (general education, no specific product recommendations)
  * Automated monthly investing strategies
  * Compound interest visualization and long-term savings plans
  * Digital products or income-generating side projects
- Use ExcelTrendChart_Responsive to show projected savings growth with compound interest
- Create "What if?" scenarios showing impact of consistent monthly investments
- Encourage realistic, sustainable approaches to generate income without active labor

**4. Communicate Clearly and Respectfully:**
- Be empathetic and motivating in all text content (titles, descriptions, insights)
- Never be judgmental about spending habits
- Adapt language to be accessible and encouraging
- Focus on actionable insights and small steps that build long-term habits
- Example tone: "Small changes today, like redirecting $200/month to savings, can grow to $50,000 in 10 years"

**5. Stay Within Ethical Boundaries:**
- Give financial education ONLY, never specific investment advice
- Use phrases like "Consider exploring..." or "Many people benefit from..." instead of "You should invest in..."
- If data is incomplete, create slides that prompt smart questions
- Example: "To optimize your budget, we'd need to see: emergency fund status, debt obligations, and retirement goals"

**LAYOUT RECOMMENDATIONS FOR FINANCIAL ANALYSIS:**
- ExcelKPIDashboard_Responsive: Monthly income, total expenses, savings rate, discretionary spending
- ExcelFullWidthChart_Responsive: Income vs Expenses over time (2 series comparison)
- ExcelPieChart_Responsive: Expense breakdown by category (housing, food, transport, entertainment, etc.)
- ExcelTrendChart_Responsive: Savings growth projection with compound interest
- ExcelComparisonLayout_Responsive: Actual spending vs recommended spending per category
- ExcelExperienceFullText_Responsive: Financial health insights and actionable recommendations
- ExcelHowItWorks_Responsive: "4 Steps to Financial Freedom" or "How to Build Passive Income"

**DETECTION TRIGGERS** (activate this mode if you detect):
- Column/row names like: income, salary, expenses, rent, utilities, savings, budget, debt, investment
- Data about: monthly spending, expense categories, income streams, savings goals
- User prompts mentioning: "my finances", "personal budget", "financial analysis", "spending habits"

Your mission in this mode is to help users optimize their finances today and build wealth for tomorrow, with empathy, education, and actionable insights.

🚨🚨🚨 FINAL REMINDER - NO DUPLICATE CONTENT 🚨🚨🚨
  ${totalBatches > 1 ? `- BATCH ${batchNumber} OF ${totalBatches}: Show UNIQUE data only
  - Each chart/table must display DIFFERENT metrics from other slides
  - ${batchNumber === 1 ? 'Cover PRIMARY data (main metrics, key trends)' : 'Cover SECONDARY data (detailed breakdowns, comparisons)'}
  - When in doubt, use FEWER slides rather than duplicate content
  - **VIOLATION EXAMPLE**: Two slides both showing "Monthly Revenue 2023" ← NEVER DO THIS
  - **CORRECT EXAMPLE**: Slide A shows "Monthly Revenue", Slide B shows "Expense Breakdown" ← GOOD!` : '- Each slide must show unique, non-repetitive data'}
` : `Generate EXACTLY ${slideCount} slides with proper structure. DO NOT generate more or fewer slides.
**INTERPRETATION LAYOUTS: Use AT MOST ${maxInterpretationThisBatch} interpretation layouts for this presentation.**`}

🛑🛑🛑 STOP! BEFORE GENERATING JSON - MANDATORY DUPLICATE CHECK 🛑🛑🛑

BEFORE you write a SINGLE LINE of JSON, you MUST:

1. **LIST ALL CHARTS** you plan to create with their data:
   Example:
   - Slide 2: Pie chart with [Transferencias Revolut, Alimentación, Ocio, Transporte, Suscripciones]
   - Slide 4: Line chart with [Monthly Income, Monthly Expenses]
   - Slide 6: Bar chart with [Product A Sales, Product B Sales, Product C Sales]

2. **CHECK FOR DUPLICATES**:
   - Do ANY of these data series appear in MORE THAN ONE slide?
   - Do you have 2+ pie charts with the same categories? ← FORBIDDEN!
   - Do you have 2+ charts showing the same metric? ← FORBIDDEN!

3. **IF YOU FIND DUPLICATES**:
   - REMOVE the duplicate slides IMMEDIATELY
   - Combine related data into ONE comprehensive chart instead
   - It's better to have ${slideCount - 3} slides with NO duplicates than ${slideCount} slides with duplicates

4. **VERIFY**:
   □ No pie chart categories are repeated
   □ No line chart series appear twice
   □ No bar chart data is duplicated
   □ Each Excel row/metric is used ONLY ONCE

**IF YOU SUBMIT DUPLICATE CONTENT, THE ENTIRE PRESENTATION WILL BE REJECTED AND YOU WILL HAVE TO START OVER**

`;

    console.log('🤖 Sending request to Claude...');

    // 💾 PROMPT CACHING: Extract static instructions into cacheable system prompt
    // This saves ~60% on API costs by caching the large instruction set
    const systemPromptStatic = aiPrompt.substring(aiPrompt.indexOf('AVAILABLE EXCEL LAYOUTS'), aiPrompt.lastIndexOf('Generate a JSON'));
    const dynamicUserContent = aiPrompt.replace(systemPromptStatic, '');

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929', // Using Sonnet 4.5 for optimal quality/cost balance
      max_tokens: 8192,
      system: [
        {
          type: "text",
          text: systemPromptStatic,
          cache_control: { type: "ephemeral" }
        }
      ],
      messages: [{
        role: 'user',
        content: dynamicUserContent
      }]
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    console.log('📝 Claude response length:', responseText.length);
    
    // If response is too short, log it entirely for debugging
    if (responseText.length < 1000) {
      console.log('⚠️ SHORT RESPONSE - Full text:', responseText);
    }

    // Extract JSON from response - try multiple strategies
    let presentationStructure;
    
    try {
      // Strategy 1: Look for the outermost complete JSON object
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('❌ No JSON found in response');
        console.log('📋 Full response text:', responseText);
        return NextResponse.json(
          { error: 'Failed to parse AI response - no JSON found' },
          { status: 500 }
        );
      }

      let jsonString = jsonMatch[0];
      
      // Strategy 2: Remove all JavaScript-style comments (// and /* */)
      // This is a common issue when AI includes explanatory comments
      jsonString = jsonString
        .replace(/\/\/[^\n]*/g, '') // Remove single-line comments
        .replace(/\/\*[\s\S]*?\*\//g, ''); // Remove multi-line comments
      
      console.log('📋 Cleaned JSON length:', jsonString.length);

      // Strategy 3: Try to parse the JSON, if it fails, try to fix common issues
      try {
        presentationStructure = JSON.parse(jsonString);
        console.log('✅ Successfully parsed JSON');
      } catch (parseError: any) {
        console.error('❌ JSON parse error:', parseError.message);
        console.log('📋 Attempting to fix malformed JSON...');
        
        let fixedJson = jsonString;
        
        // Apply multiple fix strategies
        // Fix 1: Remove trailing commas before closing braces/brackets
        fixedJson = fixedJson.replace(/,(\s*[}\]])/g, '$1');
        
        // Fix 2: Add missing commas between properties
        fixedJson = fixedJson.replace(/"\s*\n\s*"/g, '",\n"');
        
        // Fix 3: Fix unescaped quotes in strings (basic attempt)
        fixedJson = fixedJson.replace(/: "([^"]*)"([^,}\]]*)/g, (match, p1, p2) => {
          if (p2.includes('"')) {
            return `: "${p1}${p2.replace(/"/g, '\\"')}"`;
          }
          return match;
        });
        
        // Fix 4: Remove any trailing incomplete elements or text after the JSON
        // Find the last complete closing brace
        const lastBraceIndex = fixedJson.lastIndexOf('}');
        if (lastBraceIndex !== -1) {
          fixedJson = fixedJson.substring(0, lastBraceIndex + 1);
        }
        
        // Fix 5: Remove any text before the first opening brace
        const firstBraceIndex = fixedJson.indexOf('{');
        if (firstBraceIndex > 0) {
          fixedJson = fixedJson.substring(firstBraceIndex);
        }
        
        // Try parsing again
        try {
          presentationStructure = JSON.parse(fixedJson);
          console.log('✅ Successfully fixed and parsed JSON');
        } catch (secondError: any) {
          console.error('❌ Still cannot parse JSON after fix attempt:', secondError.message);
          console.log('📋 Parse error details:', {
            originalError: parseError.message,
            finalError: secondError.message,
            responseLength: responseText.length,
            jsonLength: jsonString.length,
            fixedLength: fixedJson.length
          });
          console.log('📋 Raw response (first 500 chars):', responseText.substring(0, 500));
          console.log('📋 Raw response (last 500 chars):', responseText.substring(responseText.length - 500));
          console.log('📋 Fixed JSON (first 500 chars):', fixedJson.substring(0, 500));
          console.log('📋 Fixed JSON (last 500 chars):', fixedJson.substring(fixedJson.length - 500));
          
          // One final attempt: Try to manually reconstruct a minimal valid response
          console.log('📋 Attempting emergency fallback response...');
          try {
            presentationStructure = {
              title: "Presentation",
              slides: [
                {
                  id: 1,
                  title: "Error Recovery",
                  layout: "ExcelCenteredCover_Responsive",
                  props: {
                    title: "Generation Error",
                    description: "Please try again. If the issue persists, contact support.",
                    canvasWidth: 881,
                    canvasHeight: 495
                  }
                }
              ]
            };
            console.log('⚠️ Using emergency fallback response');
          } catch (emergencyError) {
            // If even the fallback fails, return error to user
            return NextResponse.json(
              { 
                error: `AI generated invalid response. Please try again.`,
                details: `Parse error: ${parseError.message}`,
                suggestion: 'Try simplifying your request or regenerating the presentation.'
              },
              { status: 500 }
            );
          }
        }
      }
    } catch (error: any) {
      console.error('❌ Unexpected error during JSON extraction:', error.message);
      return NextResponse.json(
        { error: 'Failed to process AI response' },
        { status: 500 }
      );
    }
    console.log('✅ Generated presentation:', {
      title: presentationStructure.title,
      slideCount: presentationStructure.slides?.length
    });

    // Convert slides to the format expected by the editor
    const formattedSlides = presentationStructure.slides.map((slide: any, index: number) => ({
      id: index + 1,
      title: slide.title,
      type: index === 0 ? 'cover' : index === presentationStructure.slides.length - 1 ? 'conclusion' : 'content',
      layout: slide.layout,
      blocks: [{
        id: `block-${index + 1}-1`,
        type: slide.layout,
        props: {
          ...slide.props,
          canvasWidth: 881,
          canvasHeight: 495
        },
        position: { x: 0, y: 0 },
        size: { width: 100, height: 100 }
      }]
    }));

    const result = {
      title: presentationStructure.title || `${fileName} Analysis`,
      slideCount: formattedSlides.length,
      slides: formattedSlides
    };

    console.log('🎉 Presentation generated successfully');

    // Deduct credits based on actual API usage
    try {
      // Get user from authorization header
      const authHeader = request.headers.get('authorization');
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        
        if (user && !authError) {
          // Calculate actual cost from Anthropic usage INCLUDING CACHE COSTS
          const inputTokens = message.usage.input_tokens || 0;
          const outputTokens = message.usage.output_tokens || 0;
          
          // Anthropic pricing for Claude Sonnet 4.5 (claude-sonnet-4-5-20250929):
          // Input (no cache): $3.00 per 1M tokens = 300 cents per 1M tokens
          // Output: $15.00 per 1M tokens = 1500 cents per 1M tokens
          // Cache writes: $3.75 per 1M tokens = 375 cents per 1M tokens
          // Cache reads: $0.30 per 1M tokens = 30 cents per 1M tokens
          // 1 credit = $0.01 = 1 cent
          
          const cacheCreationTokens = (message.usage as any).cache_creation_input_tokens || 0;
          const cacheReadTokens = (message.usage as any).cache_read_input_tokens || 0;
          
          const inputCostCents = (inputTokens / 1000000) * 300;
          const outputCostCents = (outputTokens / 1000000) * 1500;
          const cacheWriteCostCents = (cacheCreationTokens / 1000000) * 375;
          const cacheReadCostCents = (cacheReadTokens / 1000000) * 30;
          
          const totalCostCents = inputCostCents + outputCostCents + cacheWriteCostCents + cacheReadCostCents;
          
          // Round up to nearest cent (credit)
          const creditsToDeduct = Math.max(1, Math.ceil(totalCostCents));
          
          console.log('💳 Deducting credits:', {
            inputTokens,
            outputTokens,
            cacheCreationTokens,
            cacheReadTokens,
            inputCostCents,
            outputCostCents,
            cacheWriteCostCents,
            cacheReadCostCents,
            totalCostCents,
            creditsToDeduct,
            userId: user.id,
            batchInfo: `Batch ${batchNumber}/${totalBatches}`
          });

          // Deduct credits
          const { data: deductResult, error: deductError } = await supabase
            .rpc('deduct_credits', {
              p_user_id: user.id,
              p_credits_to_deduct: creditsToDeduct,
              p_anthropic_cost_cents: Math.round(totalCostCents), // Round to integer to avoid float precision issues
              p_presentation_id: null,
              p_workspace: null,
              p_description: `Excel presentation generation (Batch ${batchNumber}/${totalBatches}): ${inputTokens} input + ${outputTokens} output tokens`
            });

          if (deductError) {
            console.error('❌ Failed to deduct credits (but continuing):', deductError);
            console.error('❌ Deduct error details:', {
              message: deductError.message,
              details: deductError.details,
              hint: deductError.hint,
              code: deductError.code
            });
          } else {
            console.log('✅ Credits deducted successfully:', creditsToDeduct);
            console.log('✅ Deduct result:', deductResult);
          }
        } else {
          console.log('⚠️ No authenticated user found - skipping credit deduction');
        }
      } else {
        console.log('⚠️ No authorization header - skipping credit deduction');
      }
    } catch (creditErr) {
      console.error('❌ Credit deduction error (but continuing):', creditErr);
    }

    return NextResponse.json({
      success: true,
      presentation: result
    });

  } catch (error) {
    console.error('❌ Error generating presentation:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to generate presentation',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// Force deploy Wed Nov 12 20:57:31 CET 2025
