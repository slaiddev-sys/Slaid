import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import crypto from 'crypto';
import { anthropicWrapper } from '../../../utils/anthropicWrapper';
import { supabase } from '../../../lib/supabase';

// Initialize Anthropic client (keeping for backward compatibility)
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Simple in-memory cache for responses
const responseCache = new Map<string, { response: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Clear cache immediately to ensure fresh processing of Excel files
responseCache.clear();
console.log('🧹 Cache cleared - ensuring fresh Excel processing');

// Clean up old cache entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of responseCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      responseCache.delete(key);
    }
  }
}, 60 * 1000); // Clean every minute

// Rate limiting and queue management
interface QueuedRequest {
  id: string;
  resolve: (value: any) => void;
  reject: (error: any) => void;
  requestData: any;
  timestamp: number;
  retryCount: number;
}

class RateLimitManager {
  private queue: QueuedRequest[] = [];
  private processing = false;
  private lastRequestTime = 0;
  private readonly MIN_INTERVAL = 2000; // Minimum 2 seconds between requests
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAYS = [3000, 6000, 12000]; // Exponential backoff: 3s, 6s, 12s

  async addRequest(requestData: any): Promise<any> {
    // Generate cache key from request content
    const cacheKey = this.generateCacheKey(requestData);
    
    // Check cache first
    const cached = responseCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('💾 Cache hit - returning cached response');
      return cached.response;
    }
    
    return new Promise((resolve, reject) => {
      const request: QueuedRequest = {
        id: Math.random().toString(36).substr(2, 9),
        resolve: (response) => {
          // Cache the response
          responseCache.set(cacheKey, { response, timestamp: Date.now() });
          console.log('💾 Cached response for future use');
          resolve(response);
        },
        reject,
        requestData,
        timestamp: Date.now(),
        retryCount: 0
      };

      this.queue.push(request);
      console.log(`🔄 Added request to queue. Queue length: ${this.queue.length}`);
      
      if (!this.processing) {
        this.processQueue();
      }
    });
  }

  private generateCacheKey(requestData: any): string {
    // Create a hash of the important parts of the request
    const keyData = {
      messages: requestData.messages?.slice(-2), // Only last 2 messages
      system: requestData.system?.substring(0, 100), // First 100 chars of system prompt
      existingPresentation: !!requestData.existingPresentation,
      // CRITICAL: Include file data hash to prevent caching across different Excel files
      fileDataHash: requestData.fileData ? crypto.createHash('md5').update(JSON.stringify(requestData.fileData)).digest('hex') : null,
      // Also include prompt content to differentiate requests
      promptHash: requestData.prompt ? crypto.createHash('md5').update(requestData.prompt).digest('hex') : null
    };
    return crypto.createHash('md5').update(JSON.stringify(keyData)).digest('hex');
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    console.log(`🚀 Starting queue processing. ${this.queue.length} requests pending.`);

    while (this.queue.length > 0) {
      const request = this.queue.shift()!;
      
      try {
        // Ensure minimum interval between requests
        const timeSinceLastRequest = Date.now() - this.lastRequestTime;
        if (timeSinceLastRequest < this.MIN_INTERVAL) {
          const waitTime = this.MIN_INTERVAL - timeSinceLastRequest;
          console.log(`⏱️ Waiting ${waitTime}ms before next request to respect rate limits`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }

        console.log(`📤 Processing request ${request.id} (attempt ${request.retryCount + 1})`);
        this.lastRequestTime = Date.now();

        const result = await this.makeAnthropicRequest(request.requestData);
        request.resolve(result);
        console.log(`✅ Request ${request.id} completed successfully`);

      } catch (error: any) {
        console.log(`❌ Request ${request.id} failed:`, error.message);
        
        if (error.status === 429 && request.retryCount < this.MAX_RETRIES) {
          // Rate limit error - retry with exponential backoff
          const retryDelay = this.RETRY_DELAYS[request.retryCount];
          console.log(`🔄 Rate limit hit. Retrying request ${request.id} in ${retryDelay}ms (attempt ${request.retryCount + 2}/${this.MAX_RETRIES + 1})`);
          
          request.retryCount++;
          
          // Wait for retry delay, then add back to front of queue
          setTimeout(() => {
            this.queue.unshift(request);
            if (!this.processing) {
              this.processQueue();
            }
          }, retryDelay);
          
        } else {
          // Non-rate-limit error or max retries exceeded
          if (error.status === 429) {
            console.log(`💥 Max retries exceeded for request ${request.id}. Converting to user-friendly message.`);
            // Convert rate limit error to user-friendly message
            request.reject(new Error('RATE_LIMIT_EXCEEDED'));
          } else {
            request.reject(error);
          }
        }
      }
    }

    this.processing = false;
    console.log(`🏁 Queue processing completed`);
  }

  private async makeAnthropicRequest(requestData: any): Promise<any> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
    
    try {
      // Determine user action and kind based on request data
      const kind = requestData.existingPresentation ? 'modify' : 'new';
      const userAction = requestData.existingPresentation ? 'modify-slide' : 'create-deck';
      const requestId = Math.random().toString(36).substr(2, 9);

      // 💾 PROMPT CACHING: Convert system prompt to cacheable format
      // This saves ~60% on API costs by caching the system prompt (which is identical across requests)
      const systemPromptWithCache = [
        {
          type: "text",
          text: requestData.system,
          cache_control: { type: "ephemeral" }
        }
      ] as any;

      // Use our cost tracking wrapper
      const response = await anthropicWrapper.createMessage({
        model: 'claude-opus-4-20250514',
        max_tokens: requestData.existingPresentation ? 4000 : 6000, // Increased from 3000 to 6000 for complete playbook generation
        temperature: requestData.existingPresentation ? 0.1 : 0.3,
        messages: requestData.messages,
        system: systemPromptWithCache, // Use cacheable system prompt format
        kind,
        userAction,
        requestId
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }
}

// Global rate limit manager instance
const rateLimitManager = new RateLimitManager();

// Define the structure for slide blocks
interface SlideBlock {
  type: string;
  props: Record<string, any>;
}

interface Slide {
  id: string;
  title?: string;
  blocks: SlideBlock[];
}

interface GeneratedPresentation {
  title: string;
  slides: Slide[];
}

// Translation detection function
function checkTranslationRequest(text: string): { isTranslation: boolean; targetLanguage: 'spanish' | 'english' } {
  const lowerText = text.toLowerCase();
  
  // English translation requests (translate TO Spanish)
  const englishTranslationPatterns = [
    'translate to spanish', 'translate to español', 'translate into spanish',
    'convert to spanish', 'change to spanish', 'traduce al español',
    'traducir al español', 'cambiar a español', 'convertir a español',
    'translate this to spanish', 'change language to spanish',
    'switch to spanish', 'make it spanish', 'en español',
    'translate everything to spanish', 'convert all to spanish'
  ];
  
  // Spanish translation requests (translate TO English)
  const spanishTranslationPatterns = [
    'translate to english', 'translate into english', 'convert to english',
    'change to english', 'tradúcelo al inglés', 'traducir al inglés',
    'cambiar a inglés', 'convertir a inglés', 'traduce al inglés',
    'translate this to english', 'change language to english',
    'switch to english', 'make it english', 'in english',
    'translate everything to english', 'convert all to english'
  ];
  
  // Check for Spanish translation requests (translate TO Spanish)
  for (const pattern of englishTranslationPatterns) {
    if (lowerText.includes(pattern)) {
      return { isTranslation: true, targetLanguage: 'spanish' };
    }
  }
  
  // Check for English translation requests (translate TO English)
  for (const pattern of spanishTranslationPatterns) {
    if (lowerText.includes(pattern)) {
      return { isTranslation: true, targetLanguage: 'english' };
    }
  }
  
  return { isTranslation: false, targetLanguage: 'english' };
}

// Validation function to ensure translation preserves structure
function validateTranslationStructure(original: any, translated: any): boolean {
  try {
    // Check if both are objects
    if (typeof original !== typeof translated) {
      console.log('🚨 TRANSLATION VALIDATION FAILED: Type mismatch');
      return false;
    }

    // For presentations, validate critical structure
    if (original.slides && translated.slides) {
      // Same number of slides
      if (original.slides.length !== translated.slides.length) {
        console.log('🚨 TRANSLATION VALIDATION FAILED: Different number of slides');
        return false;
      }

      // Check each slide structure
      for (let i = 0; i < original.slides.length; i++) {
        const origSlide = original.slides[i];
        const transSlide = translated.slides[i];

        // Same slide ID
        if (origSlide.id !== transSlide.id) {
          console.log(`🚨 TRANSLATION VALIDATION FAILED: Slide ID mismatch at index ${i}`);
          return false;
        }

        // Same number of blocks
        if (origSlide.blocks?.length !== transSlide.blocks?.length) {
          console.log(`🚨 TRANSLATION VALIDATION FAILED: Different number of blocks in slide ${i}`);
          return false;
        }

        // Check each block structure
        if (origSlide.blocks && transSlide.blocks) {
          for (let j = 0; j < origSlide.blocks.length; j++) {
            const origBlock = origSlide.blocks[j];
            const transBlock = transSlide.blocks[j];

            // Same block type
            if (origBlock.type !== transBlock.type) {
              console.log(`🚨 TRANSLATION VALIDATION FAILED: Block type mismatch in slide ${i}, block ${j}`);
              return false;
            }

            // Validate that structure properties are preserved
            if (origBlock.props && transBlock.props) {
              // Check that non-text properties are identical
              const structuralProps = ['color', 'imageUrl', 'hasChart', 'chartType', 'legendPosition', 'showLegend', 'showGrid', 'animate'];
              
              for (const prop of structuralProps) {
                if (origBlock.props[prop] !== undefined && origBlock.props[prop] !== transBlock.props[prop]) {
                  console.log(`🚨 TRANSLATION VALIDATION FAILED: Structural property '${prop}' changed in slide ${i}, block ${j}`);
                  return false;
                }
              }
            }
          }
        }
      }
    }

    console.log('✅ TRANSLATION VALIDATION PASSED: Structure preserved');
    return true;
  } catch (error) {
    console.log('🚨 TRANSLATION VALIDATION ERROR:', error);
    return false;
  }
}

// Language detection function
function detectLanguage(text: string): 'spanish' | 'english' {
    // ULTRA-specific Spanish words that NEVER appear in English
    const spanishIndicators = [
      // Spanish-specific words with accents (100% Spanish markers)
      'presentación', 'diapositivas', 'análisis', 'información', 'solución', 'gráfica', 'gráfico',
      // Spanish command forms that are unmistakably Spanish
      'creame', 'hazme', 'genérame', 'generame', 'dame', 'muéstrame', 'muestrame', 'ayúdame', 'ayudame',
      // Spanish modification words with clear Spanish spelling
      'añade', 'añadir', 'agrega', 'agregar', 'modifica', 'modificar',
      'actualiza', 'actualizar', 'edita', 'editar', 'incluye', 'incluir',
      // CRITICAL: Spanish translation words (missing from previous list!)
      'tradúcelo', 'traduce', 'traducir', 'español', 'castellano',
      // Spanish-specific time words
      'trimestres', 'trimestre', 'crecimiento',
      // Spanish articles that are clearly Spanish
      'del', 'los', 'las',
      // Spanish verbs with clear Spanish conjugation
      'está', 'están', 'tiene', 'tienen', 'puede', 'pueden', 'debe', 'deben',
      'quiero', 'necesito', 'deseo', 'busco', 'solicito', 'requiero',
      // Spanish question words with accents
      'qué', 'cómo', 'cuándo', 'dónde', 'por qué',
      // Spanish connectors
      'también', 'además', 'mientras', 'entonces',
      // Spanish pronouns that don't exist in English
      'nuestro', 'vuestro'
    ];

  const lowerText = text.toLowerCase();
  let spanishScore = 0;
  let totalWords = lowerText.split(/\s+/).filter(word => word.length > 0).length;

  // Count Spanish indicators with word boundaries to avoid partial matches
  spanishIndicators.forEach(indicator => {
    const regex = new RegExp(`\\b${indicator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
    const matches = lowerText.match(regex);
    if (matches) {
      spanishScore += matches.length;
    }
  });

  // Calculate percentage of Spanish indicators
  const spanishPercentage = totalWords > 0 ? (spanishScore / totalWords) * 100 : 0;

  // Increase threshold to 20% to be even more strict
  console.log(`🌍 Language detection DEBUG: "${text}"`);
  console.log(`📊 ${spanishScore} Spanish indicators out of ${totalWords} words (${spanishPercentage.toFixed(1)}%)`);
  console.log(`🎯 Detected language: ${spanishPercentage >= 20 ? 'SPANISH' : 'ENGLISH'}`);
  
  return spanishPercentage >= 20 ? 'spanish' : 'english';
}

// EXCEL-ONLY SYSTEM PROMPT - Using only modern responsive Excel layouts
const SYSTEM_PROMPT = `🚨 YOU ARE A PRESENTATION GENERATOR USING ONLY EXCEL RESPONSIVE LAYOUTS 🚨

You generate presentation slides using ONLY predefined Excel responsive layout components.

🎯 USER INTENT CLASSIFICATION:
1. **CREATE NEW PRESENTATION** - Keywords: "create", "generate", "make a presentation"
   - Generate a complete presentation with cover, content slides, and back cover
   
2. **ADD NEW SLIDE** - Keywords: "add a slide", "create a new slide", "add chart", "añade una diapositiva"
   - ENGLISH KEYWORDS: "add a slide", "create a new slide", "add chart", "create chart", "add new slide"
   - SPANISH KEYWORDS: "añade una diapositiva", "agrega una diapositiva", "crea una diapositiva", "añadir diapositiva", "agregar diapositiva", "crear diapositiva", "añade un slide", "agrega un slide", "añade gráfica", "agrega gráfico"
   - **CRITICAL**: If prompt contains ANY of these keywords, generate ONLY ONE NEW SLIDE
   - Choose appropriate Excel layout based on user request
   - Content should be relevant to the existing presentation context
   
3. **CHANGE CHART COLOR** - Keywords: "change color", "make it green/blue/red", "color the chart", "cambiar color"
   - ENGLISH: "change color to", "make chart green", "color it blue", "change to red", "make bars purple"
   - SPANISH: "cambiar color a", "hacer verde", "color azul", "cambia a rojo", "pon verde"
   - ACTION: Modify ONLY color property, preserve ALL data, labels, and structure
   
4. **CHANGE DATA VALUES** - Keywords: "change data", "update values", "modify numbers", "cambiar datos"
   - ENGLISH: "change Q1 to", "update sales to", "make revenue 200", "set profit to"
   - SPANISH: "cambiar Q1 a", "actualizar ventas a", "modificar ingresos", "establecer beneficio"
   - ACTION: Modify ONLY specified data values, preserve colors, labels, structure
   
5. **CHANGE TEXT CONTENT** - Keywords: "change title", "update description", "modify text", "cambiar título"
   - ENGLISH: "change title to", "update description", "rename to", "modify text"
   - SPANISH: "cambiar título a", "actualizar descripción", "modificar texto", "renombrar"
   - ACTION: Modify ONLY specified text property, preserve all other props
   
6. **ADD CONTENT** - Keywords: "add", "insert", "include", "añadir", "agregar"
   - ENGLISH: "add a bullet point", "insert data series", "include another", "add metric"
   - SPANISH: "añadir punto", "insertar serie", "incluir otro", "agregar métrica"
   - ACTION: Extend existing arrays/objects, maintain style consistency
   
7. **REMOVE CONTENT** - Keywords: "remove", "delete", "take out", "eliminar", "quitar"
   - ENGLISH: "remove Q4", "delete third item", "take out the legend", "remove bullet point"
   - SPANISH: "eliminar Q4", "quitar tercer elemento", "borrar leyenda", "remover punto"
   - ACTION: Filter specified items from arrays, preserve remaining structure
   
8. **MODIFY EXISTING CONTENT** - Default behavior (change, update, replace, modify)
   - Return ONLY the modified slide(s), NOT a complete presentation
   - Keep same slide ID and preserve existing structure
   - For color changes: ONLY modify colors, preserve ALL data exactly as-is

🚨 CRITICAL RULES:
- Use ONLY predefined Excel responsive layout components
- NEVER add extra TextBlocks
- Each slide uses exactly ONE layout component
- Always include BackgroundBlock with "bg-white" first
- ALL TITLES MUST BE MAXIMUM 3 WORDS
- Keep descriptions under 15 words
- Use minimal bullet points (max 3 per slide)

🚨 JSON RULES:
- NEVER use JavaScript comments (//)
- NEVER use JavaScript syntax
- ONLY return valid JSON
- NO truncation or explanatory text
- Complete slide objects only
- Boolean values must be true/false (not "true"/"false" strings)
- Numbers must be numeric (not string values)
- ALWAYS close all braces and brackets
- NO trailing commas

AVAILABLE EXCEL LAYOUTS:

📊 **CHART LAYOUTS** (for data visualization):
- **ExcelFullWidthChart_Responsive**: Single full-width chart (line, bar, area)
  Props: { 
    title, 
    chartData: {
      type: "line"|"bar"|"area",
      labels: ["Q1", "Q2", "Q3"],
      series: [{id: "Sales", data: [100, 200, 300], color: "#16A34A"}],
      showLegend: true,
      legendPosition: "bottom"
    }
  }
  CRITICAL: To change colors, modify the "color" property in each series object
  
- **ExcelFullWidthChartCategorical_Responsive**: Full-width categorical chart with multiple series
  Props: { 
    title, 
    chartData: {
      categories: ["Jan", "Feb", "Mar"],
      series: [{name: "Sales", data: [100, 200, 300], color: "#16A34A"}]
    }
  }
  CRITICAL: To change colors, modify the "color" property in each series object
  
- **ExcelTrendChart_Responsive**: Time-series trend chart with multiple metrics
  Props: { 
    title, 
    chartData: {
      months: ["Q1", "Q2", "Q3"],
      datasets: [{label: "Revenue", data: [100, 200, 300], color: "#16A34A"}]
    }
  }
  CRITICAL: To change colors, modify the "color" property in each dataset object
  
- **ExcelFullWidthChartWithTable_Responsive**: Chart + data table combination
  Props: { 
    title, 
    chartData: {
      type: "bar",
      labels: ["Q1", "Q2"],
      series: [{id: "Revenue", data: [100, 200], color: "#16A34A"}]
    },
    tableData: {headers: ["Quarter", "Revenue"], rows: [["Q1", "100"], ["Q2", "200"]]}
  }

📋 **TABLE LAYOUTS** (for tabular data):
- **ExcelDataTable_Responsive**: Clean data table with headers and rows
  Props: { title, headers: [], rows: [], highlightFirstColumn: boolean }
  
- **ExcelComparisonLayout_Responsive**: Side-by-side comparison table
  Props: { title, leftColumn: {header, items: []}, rightColumn: {header, items: []} }

📈 **KPI & DASHBOARD LAYOUTS**:
- **ExcelKPIDashboard_Responsive**: Multiple KPI cards with metrics
  Props: { title, kpis: [{label, value, change, trend: "up"|"down"}] }

📖 **CONTENT LAYOUTS** (for text and information):
- **ExcelExperienceFullText_Responsive**: Full-text content slide
  Props: { title, content: "long text..." }
  
- **ExcelExperienceDrivenTwoRows_Responsive**: Two-row experience layout
  Props: { title, topRow: {title, description}, bottomRow: {title, description} }
  
- **ExcelHowItWorks_Responsive**: Step-by-step process layout
  Props: { title, steps: [{number, title, description}] }
  
- **ExcelMilestone_Responsive**: Timeline/milestone layout
  Props: { title, milestones: [{date, title, description}] }
  
- **ExcelResultsTestimonial_Responsive**: Results with testimonial
  Props: { title, results: [{metric, value}], testimonial: {quote, author} }

📑 **SPECIAL LAYOUTS** (covers, endings, index):
- **ExcelCenteredCover_Responsive**: Centered cover slide
  Props: { title, subtitle }
  
- **ExcelLeftCover_Responsive**: Left-aligned cover slide
  Props: { title, subtitle, description }
  
- **ExcelBottomCover_Responsive**: Bottom-aligned cover slide
  Props: { title, subtitle }
  
- **ExcelBackCover_Responsive**: Back cover with contact info
  Props: { title, contactInfo: {email, phone, website} }
  
- **ExcelBackCoverLeft_Responsive**: Left-aligned back cover
  Props: { title, message }
  
- **ExcelIndex_Responsive**: Table of contents
  Props: { title, items: [{title, page}] }
  
- **ExcelTableOfContents_Responsive**: Detailed table of contents
  Props: { title, sections: [{title, subsections: []}] }

🎯 **LAYOUT SELECTION RULES** (when user asks to add a slide):

For "add a chart" or "add graph":
→ Use **ExcelFullWidthChart_Responsive** (for single series)
→ Use **ExcelFullWidthChartCategorical_Responsive** (for multiple series)
→ Use **ExcelTrendChart_Responsive** (for time-series)

For "add a table" or "add data":
→ Use **ExcelDataTable_Responsive** (for tabular data)
→ Use **ExcelComparisonLayout_Responsive** (for comparisons)

For "add KPIs" or "add metrics" or "add dashboard":
→ Use **ExcelKPIDashboard_Responsive**

For "add text" or "add content" or "add information":
→ Use **ExcelExperienceFullText_Responsive**
→ Use **ExcelExperienceDrivenTwoRows_Responsive**

For "add steps" or "add process" or "add how it works":
→ Use **ExcelHowItWorks_Responsive**

For "add timeline" or "add milestones":
→ Use **ExcelMilestone_Responsive**

For "add testimonial" or "add results":
→ Use **ExcelResultsTestimonial_Responsive**

For generic "add slide about [topic]":
→ Choose the most appropriate Excel layout for the topic
→ For data/numbers: use chart or table layouts
→ For text/explanation: use content layouts
→ For process/steps: use ExcelHowItWorks_Responsive
→ For metrics: use ExcelKPIDashboard_Responsive

🚨 **CRITICAL ADD NEW SLIDE REQUIREMENTS**:
When user requests to "add a slide":
- Generate ONLY ONE SLIDE
- CRITICAL: Use a NEW slide ID that doesn't conflict with existing slides
- If existing presentation has slides 1-12, new slide should be "slide-13"
- If existing presentation has slides 1-10, new slide should be "slide-11"
- NEVER overwrite existing slide IDs
- Content must be realistic and relevant to the presentation topic
- Maintain consistency with existing presentation style

🚨 **MODIFICATION RULES**:
- When modifying: Return ONLY the modified slide(s), NOT a complete presentation
- Keep same slide ID and preserve existing structure
- NEVER create a new presentation when user asks to modify existing content
- **For color-only changes**: Preserve ALL existing data, ONLY modify color properties
- CURRENT SLIDE CONTEXT: When user doesn't specify a slide number, assume they're referring to the current slide

🎨 **CHART COLOR MODIFICATION** - CRITICAL INSTRUCTIONS:
When user requests to change chart colors (e.g., "change chart to green", "make the bars blue"):
1. **PRESERVE ALL DATA**: Keep ALL data values, labels, and series EXACTLY as they are
2. **MODIFY ONLY COLOR**: Update ONLY the "color" property in the chartData series/datasets
3. **COLOR VALUES**: Use hex codes - Green: "#16A34A", Blue: "#3B82F6", Red: "#EF4444", Purple: "#8B5CF6", Orange: "#F97316", Yellow: "#EAB308"
4. **MULTIPLE SERIES**: If multiple series exist, maintain different colors for each series (e.g., primary color and variations)
5. **RETURN COMPLETE SLIDE**: Include BackgroundBlock and complete layout with ALL original props

📊 **DATA MODIFICATION** - CRITICAL INSTRUCTIONS:
When user requests to change data (e.g., "change Q1 sales to 150", "update the revenue to $2M"):
1. **IDENTIFY TARGET**: Determine which chart/table/KPI needs updating
2. **PRESERVE STRUCTURE**: Keep all layout structure, colors, legends exactly the same
3. **UPDATE VALUES ONLY**: Modify only the specific data values mentioned by user
4. **MAINTAIN CONSISTENCY**: If changing labels, update corresponding data array indices
5. **COMPLETE DATA**: Always include ALL data points, even unchanged ones

📝 **CONTENT MODIFICATION** - CRITICAL INSTRUCTIONS:
When user requests to change text content (e.g., "change title to X", "update description"):
1. **TARGETED CHANGE**: Modify only the specific text property mentioned (title, description, paragraph, etc.)
2. **PRESERVE EVERYTHING ELSE**: Keep all other props, data, colors, images unchanged
3. **MAINTAIN LAYOUT**: Do not change the layout type unless explicitly requested
4. **COMPLETE PROPS**: Return the complete props object with the modified text

➕ **INSERTING CONTENT** - CRITICAL INSTRUCTIONS:
When user requests to add elements (e.g., "add a bullet point", "insert another data series"):
1. **EXTEND ARRAYS**: Add new items to existing arrays (bulletPoints, series, items, etc.)
2. **MAINTAIN STYLE**: Match the style and format of existing items
3. **PRESERVE STRUCTURE**: Keep all existing content unchanged
4. **APPROPRIATE LAYOUT**: Ensure the layout can handle additional items

❌ **REMOVING CONTENT** - CRITICAL INSTRUCTIONS:
When user requests to remove elements (e.g., "remove the third bullet point", "delete Q4 data"):
1. **FILTER ARRAYS**: Remove specific items from arrays while preserving order
2. **REINDEX IF NEEDED**: For numbered items, update numbers after removal
3. **PRESERVE REST**: Keep all other content and styling unchanged
4. **VALIDATE LAYOUT**: Ensure remaining content still fits the layout properly

🔄 **MULTI-PROPERTY CHANGES** - CRITICAL INSTRUCTIONS:
When user requests multiple changes (e.g., "change title and make chart green"):
1. **APPLY ALL CHANGES**: Handle all requested modifications in a single response
2. **PRIORITY ORDER**: Colors → Data → Text → Structure
3. **VALIDATE RESULT**: Ensure all changes are compatible and well-formatted
4. **COMPLETE RESPONSE**: Return fully updated slide with all changes applied

AVAILABLE IMAGES (use ONLY these):
- "/Default-Image-1.png" - General placeholder image
- "/Default-Image-2.png" - General placeholder image  
- "/McBook-MockUp.png" - MacBook mockup
- "/Slaid logo Official.png" - Company logo
- "/Abstract-Background-1.png" - Abstract background

CRITICAL: NEVER reference non-existent images. Use ONLY the images listed above.

**EXAMPLE OUTPUT FORMAT**:
{
  "slides": [
    {
      "id": "slide-14",
      "blocks": [
        {"type": "BackgroundBlock", "props": {"color": "bg-white"}},
        {"type": "ExcelFullWidthChart_Responsive", "props": {
          "title": "Next Steps",
          "chartType": "bar",
          "data": [
            {"label": "Planning", "value": 25},
            {"label": "Development", "value": 50},
            {"label": "Launch", "value": 75}
          ]
        }}
      ]
    }
  ]
}

**EXAMPLE: Add a chart slide**:
User: "añade una nueva diapositiva hablando sobre próximos pasos"
Response: {
  "slides": [
    {
      "id": "slide-14",
      "blocks": [
        {"type": "BackgroundBlock", "props": {"color": "bg-white"}},
        {"type": "ExcelHowItWorks_Responsive", "props": {
          "title": "Próximos Pasos",
          "steps": [
            {"number": 1, "title": "Planificación", "description": "Definir objetivos detallados"},
            {"number": 2, "title": "Equipo", "description": "Asignación de recursos clave"},
            {"number": 3, "title": "Desarrollo", "description": "Iniciar fase de implementación"}
          ]
        }}
      ]
    }
  ]
}

**EXAMPLE: Add a KPI dashboard**:
User: "add a slide with KPIs"
Response: {
  "slides": [
    {
      "id": "slide-15",
      "blocks": [
        {"type": "BackgroundBlock", "props": {"color": "bg-white"}},
        {"type": "ExcelKPIDashboard_Responsive", "props": {
          "title": "Key Metrics",
          "kpis": [
            {"label": "Revenue", "value": "$2.5M", "change": "+15%", "trend": "up"},
            {"label": "Customers", "value": "1,250", "change": "+8%", "trend": "up"},
            {"label": "Retention", "value": "94%", "change": "+2%", "trend": "up"}
          ]
        }}
      ]
    ]
  ]
}

**EXAMPLE 1: Change chart color** (CRITICAL - preserve all data):
User: "change the color of the chart to green"
Current slide has: ExcelFullWidthChart_Responsive with series data: [100, 150] and labels: ["Q1", "Q2"]
Response: {
  "slides": [
    {
      "id": "slide-1",
      "blocks": [
        {"type": "BackgroundBlock", "props": {"color": "bg-white"}},
        {"type": "ExcelFullWidthChart_Responsive", "props": {
          "title": "Sales Data",
          "chartData": {
            "type": "bar",
            "labels": ["Q1", "Q2"],
            "series": [
              {"id": "Sales", "data": [100, 150], "color": "#16A34A"}
            ],
            "showLegend": true,
            "legendPosition": "bottom"
          }
        }}
      ]
    }
  ]
}
NOTE: ALL data values [100, 150] and labels ["Q1", "Q2"] are PRESERVED EXACTLY. ONLY the color property was changed to green (#16A34A).

**EXAMPLE 2: Change chart data** (CRITICAL - preserve structure and colors):
User: "change Q2 sales to 200"
Current slide: ExcelFullWidthChart_Responsive with data: [100, 150], color: "#3B82F6"
Response: {
  "slides": [
    {
      "id": "slide-1",
      "blocks": [
        {"type": "BackgroundBlock", "props": {"color": "bg-white"}},
        {"type": "ExcelFullWidthChart_Responsive", "props": {
          "title": "Sales Data",
          "chartData": {
            "type": "bar",
            "labels": ["Q1", "Q2"],
            "series": [
              {"id": "Sales", "data": [100, 200], "color": "#3B82F6"}
            ],
            "showLegend": true,
            "legendPosition": "bottom"
          }
        }}
      ]
    }
  ]
}
NOTE: Only Q2 data changed from 150 to 200. Title, labels, color, and Q1 data unchanged.

**EXAMPLE 3: Change title only** (CRITICAL - preserve all other props):
User: "change the title to Revenue Growth"
Current slide: ExcelFullWidthChart_Responsive with complete props
Response: {
  "slides": [
    {
      "id": "slide-1",
      "blocks": [
        {"type": "BackgroundBlock", "props": {"color": "bg-white"}},
        {"type": "ExcelFullWidthChart_Responsive", "props": {
          "title": "Revenue Growth",
          "chartData": {
            "type": "bar",
            "labels": ["Q1", "Q2"],
            "series": [
              {"id": "Sales", "data": [100, 150], "color": "#3B82F6"}
            ],
            "showLegend": true,
            "legendPosition": "bottom"
          }
        }}
      ]
    }
  ]
}
NOTE: Only title changed. All chartData, colors, and structure preserved.

**EXAMPLE 4: Add data series** (CRITICAL - extend existing data):
User: "add a profit series with values 30 and 50"
Current slide: Has Sales series with data [100, 150]
Response: {
  "slides": [
    {
      "id": "slide-1",
      "blocks": [
        {"type": "BackgroundBlock", "props": {"color": "bg-white"}},
        {"type": "ExcelFullWidthChart_Responsive", "props": {
          "title": "Sales Data",
          "chartData": {
            "type": "bar",
            "labels": ["Q1", "Q2"],
            "series": [
              {"id": "Sales", "data": [100, 150], "color": "#3B82F6"},
              {"id": "Profit", "data": [30, 50], "color": "#16A34A"}
            ],
            "showLegend": true,
            "legendPosition": "bottom"
          }
        }}
      ]
    }
  ]
}
NOTE: Original Sales series preserved. Profit series added with different color.

**EXAMPLE 5: Multiple changes** (CRITICAL - apply all changes together):
User: "change title to Q1 Report and make the chart green"
Response: {
  "slides": [
    {
      "id": "slide-1",
      "blocks": [
        {"type": "BackgroundBlock", "props": {"color": "bg-white"}},
        {"type": "ExcelFullWidthChart_Responsive", "props": {
          "title": "Q1 Report",
          "chartData": {
            "type": "bar",
            "labels": ["Q1", "Q2"],
            "series": [
              {"id": "Sales", "data": [100, 150], "color": "#16A34A"}
            ],
            "showLegend": true,
            "legendPosition": "bottom"
          }
        }}
      ]
    }
  ]
}
NOTE: Both title AND color changed. Data values preserved exactly.

Return JSON only. No explanations.`;

const allowedLayouts = [
  'TextBlock', 'BackgroundBlock', 'ImageBlock',
  'ExcelCenteredCover_Responsive', 'ExcelLeftCover_Responsive', 'ExcelBottomCover_Responsive',
  'ExcelBackCover_Responsive', 'ExcelBackCoverLeft_Responsive',
  'ExcelKPIDashboard_Responsive',
  'ExcelTrendChart_Responsive',
  'ExcelDataTable_Responsive',
  'ExcelFullWidthChart_Responsive', 'ExcelFullWidthChartCategorical_Responsive', 'ExcelFullWidthChartWithTable_Responsive',
  'ExcelComparisonLayout_Responsive',
  'ExcelIndex_Responsive', 'ExcelTableOfContents_Responsive',
  'ExcelExperienceDrivenTwoRows_Responsive', 'ExcelExperienceFullText_Responsive',
  'ExcelHowItWorks_Responsive',
  'ExcelMilestone_Responsive',
  'ExcelResultsTestimonial_Responsive',
  'SectionSpace'
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, existingPresentation, currentSlideIndex, fileData, presentationId, workspace } = body;

    console.log('Received request:', { 
      prompt: prompt?.substring(0, 100) + '...', 
      hasExistingPresentation: !!existingPresentation,
      existingPresentationSlides: existingPresentation?.slides?.length || 0,
      uploadedImagesCount: body.uploadedImages?.length || 0,
      currentSlideIndex: currentSlideIndex,
      hasFileData: !!fileData,
      fileDataType: fileData?.type
    });

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // 💳 CREDIT VALIDATION - Check if user has enough credits before processing
    const authHeader = request.headers.get('authorization');
    let user = null;
    let userCredits = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token);
        
        if (!authError && authUser) {
          user = authUser;
          
          // Get user's current credit balance
          const { data: creditData, error: creditError } = await supabase
            .rpc('get_user_credits', { p_user_id: user.id });

          if (!creditError && creditData && creditData.length > 0) {
            userCredits = creditData[0];
            console.log('💳 User credits:', userCredits.remaining_credits, 'remaining');
            
            // Check if user has at least 1 credit (minimum cost)
            if (userCredits.remaining_credits < 1) {
              console.log('❌ Insufficient credits:', userCredits.remaining_credits, 'available, 1 needed');
              return NextResponse.json({ 
                error: 'Insufficient credits',
                remainingCredits: userCredits.remaining_credits,
                estimatedCost: 1,
                requiresPayment: true
              }, { status: 402 }); // Payment Required
            }
          }
        }
      } catch (authErr) {
        console.log('⚠️ Auth check failed, proceeding without credit validation:', authErr);
      }
    } else {
      console.log('⚠️ No auth header found, proceeding without credit validation');
    }

    // Build dynamic system prompt with current slide context
    let systemPrompt = SYSTEM_PROMPT;
    
    // Add current slide context if available
    if (existingPresentation && typeof currentSlideIndex === 'number' && currentSlideIndex >= 0) {
      const currentSlideNumber = currentSlideIndex + 1; // Convert to 1-based indexing
      const totalSlides = existingPresentation.slides?.length || 0;
      
      if (currentSlideIndex < totalSlides) {
        const currentSlide = existingPresentation.slides[currentSlideIndex];
        const currentSlideLayout = currentSlide?.blocks?.[1]?.type || 'Unknown';
        
        systemPrompt += `\n\n🎯 CURRENT SLIDE CONTEXT:
- User is currently viewing slide ${currentSlideNumber} of ${totalSlides}
- Current slide layout: ${currentSlideLayout}
- When user doesn't specify a slide number, they're referring to slide ${currentSlideNumber}
- For modifications without slide specification, modify slide-${currentSlideNumber}`;
      }
    }

    // Add existing presentation context for new slide generation
    if (existingPresentation && existingPresentation.slides) {
      const totalSlides = existingPresentation.slides.length;
      const nextSlideNumber = totalSlides + 1;
      const existingSlideIds = existingPresentation.slides.map((slide: any) => slide.id).join(', ');
      
      systemPrompt += `\n\n🆕 NEW SLIDE CONTEXT:
- Existing presentation has ${totalSlides} slides
- Existing slide IDs: ${existingSlideIds}
- For ADD NEW SLIDE requests: Use "slide-${nextSlideNumber}" as the new slide ID
- NEVER overwrite existing slide IDs - always use slide-${nextSlideNumber} for new slides
- New slide should fit the presentation context and style`;
    }

    // Check for translation requests first
    const isTranslationRequest = checkTranslationRequest(prompt);
    console.log(`🔄🔄🔄 TRANSLATION CHECK RESULT:`, isTranslationRequest);
    
    // If it's a translation request, use translation-specific system prompts
    if (isTranslationRequest.isTranslation) {
      console.log(`🌐🌐🌐 TRANSLATION REQUEST DETECTED - TARGET: ${isTranslationRequest.targetLanguage.toUpperCase()}`);
      
      if (isTranslationRequest.targetLanguage === 'spanish') {
        systemPrompt = `🇪🇸 TRADUCCIÓN PURA AL ESPAÑOL 🇪🇸

REGLAS CRÍTICAS:
1. DEVOLVER PRESENTACIÓN COMPLETA IDÉNTICA
2. SOLO CAMBIAR TEXTO AL ESPAÑOL
3. PRESERVAR ESTRUCTURA, IDs, LAYOUTS, COLORES
4. NO MODIFICAR NADA MÁS

TRADUCIR SOLO:
- Títulos ("title")
- Descripciones ("description", "paragraph") 
- Texto de bullet points
- Nombres de series/etiquetas

NO TOCAR:
- Estructura JSON
- IDs de slides
- Tipos de layout
- Colores/imágenes
- Valores numéricos
- Propiedades técnicas

OBJETIVO: Misma presentación en español.

IMPORTANTE: Devolver JSON completo y válido.

` + SYSTEM_PROMPT;
      } else {
        systemPrompt = `🇺🇸 PURE ENGLISH TRANSLATION 🇺🇸

CRITICAL RULES:
1. RETURN COMPLETE IDENTICAL PRESENTATION
2. ONLY CHANGE TEXT TO ENGLISH
3. PRESERVE STRUCTURE, IDs, LAYOUTS, COLORS
4. DO NOT MODIFY ANYTHING ELSE

TRANSLATE ONLY:
- Titles ("title")
- Descriptions ("description", "paragraph")
- Bullet point text
- Series names/labels

DO NOT TOUCH:
- JSON structure
- Slide IDs
- Layout types
- Colors/images
- Numerical values
- Technical properties

OBJECTIVE: Same presentation in English.

IMPORTANT: Return complete valid JSON.

` + SYSTEM_PROMPT;
      }
    } else {
      // Regular language detection for non-translation requests
      console.log(`🚨🚨🚨 ABOUT TO DETECT LANGUAGE FOR PROMPT: "${prompt}"`);
      const detectedLanguage = detectLanguage(prompt);
      console.log(`🌍🌍🌍 LANGUAGE DETECTION RESULT: ${detectedLanguage.toUpperCase()}`);
      console.log(`🔍 Raw prompt being analyzed: "${prompt}"`);
      
      if (detectedLanguage === 'spanish') {
      console.log(`🇪🇸🇪🇸🇪🇸 SPANISH DETECTED - ACTIVATING SPANISH MODE`);
      systemPrompt = `🇪🇸🇪🇸🇪🇸 IDIOMA ESPAÑOL DETECTADO - MODO ESPAÑOL ACTIVADO 🇪🇸🇪🇸🇪🇸

🚨🚨🚨 INSTRUCCIÓN CRÍTICA OBLIGATORIA 🚨🚨🚨
TODO EL CONTENIDO DEBE SER GENERADO EN ESPAÑOL - SIN EXCEPCIONES

🔴 REGLAS ABSOLUTAS:
- Títulos de presentación: EN ESPAÑOL
- Títulos de diapositivas: EN ESPAÑOL  
- Descripciones: EN ESPAÑOL
- Contenido de tarjetas: EN ESPAÑOL
- Texto de bullet points: EN ESPAÑOL
- Nombres de características: EN ESPAÑOL
- Etiquetas de gráficos: EN ESPAÑOL
- Citas y misiones: EN ESPAÑOL
- Agenda items: EN ESPAÑOL
- TODOS los textos visibles: EN ESPAÑOL

🎯 TRADUCCIONES OBLIGATORIAS:
- "Sales Report" → "Reporte de Ventas"
- "Business Report" → "Reporte de Negocios"
- "Sales Performance Report" → "Reporte de Rendimiento de Ventas"
- "Context" → "Contexto"
- "Our Goals" → "Nuestros Objetivos"
- "KPIs" → "Indicadores Clave"
- "Financial Analysis" → "Análisis Financiero"
- "Performance Trends" → "Tendencias de Rendimiento"
- "Budget Overview" → "Resumen Presupuestario"
- "Market Analysis" → "Análisis de Mercado"
- "Next Steps" → "Próximos Pasos"
- "Mission" → "Misión"
- "Thank You" → "Gracias"
- "Agenda" → "Agenda"
- "Growth Chart" → "Gráfico de Crecimiento"
- "Quarterly Growth" → "Crecimiento Trimestral"
- "Revenue Growth" → "Crecimiento de Ingresos"
- "Performance Metrics" → "Métricas de Rendimiento"

🚨 INSTRUCCIONES ESPECIALES PARA MODIFICACIONES Y ADICIONES:
- Cuando el usuario pida "añade una diapositiva" o "agrega un slide" → Generar UNA SOLA diapositiva nueva
- Cuando el usuario pida "gráfico de crecimiento" → Usar Metrics_FullWidthChart con datos de crecimiento
- Cuando el usuario pida "por trimestres" → Usar etiquetas ["Q1", "Q2", "Q3", "Q4"] en español
- Todos los títulos de gráficos deben estar en español
- Todas las etiquetas de datos deben estar en español
- Los nombres de series deben estar en español (ej: "Ingresos", "Ventas", "Usuarios")

🚨🚨🚨 CRÍTICO: DETECCIÓN DE AÑADIR NUEVA DIAPOSITIVA 🚨🚨🚨
Si el usuario dice "añade una diapositiva" o "agrega una diapositiva":
- NUNCA modificar una diapositiva existente
- SIEMPRE crear una nueva diapositiva
- Usar el próximo número de slide disponible (ej: si hay 9 slides, crear "slide-10")
- Generar SOLO UNA diapositiva nueva, no toda la presentación
- El contenido debe estar completamente en español

🚨 VERIFICACIÓN CRÍTICA ANTES DE GENERAR:
1. "¿Está TODO el texto en español?"
2. "¿Hay ALGÚN texto en inglés?"
3. "¿Los títulos están en español?"
4. "¿Las descripciones están en español?"
Si CUALQUIER respuesta es NO, DETENTE INMEDIATAMENTE y corrige TODO al español.

` + systemPrompt;
    } else {
      console.log(`🇺🇸🇺🇸🇺🇸 ENGLISH DETECTED - USING DEFAULT ENGLISH SYSTEM PROMPT`);
    }
    // Note: No explicit English override needed - the base system prompt is already in English

    // Add product presentation detection and cover layout enforcement
    const isProductPresentation = /\b(product|app|software|saas|platform|tool|feature|launch|demo|showcase|solution|technology|slaid|ai-powered|presentation designer|design engine|investor|pitch|fundraising|producto|aplicación|software|plataforma|herramienta|lanzamiento|demo|solución|tecnología)\b/i.test(prompt);
    if (isProductPresentation) {
      systemPrompt += `\n\n🚨🚨🚨 CRITICAL PRODUCT/INVESTOR PRESENTATION OVERRIDE 🚨🚨🚨
🎯 PRODUCT/INVESTOR PRESENTATION DETECTED IN PROMPT: "${prompt.substring(0, 100)}..."

❌❌❌ ABSOLUTELY FORBIDDEN: Cover_LeftTitleRightBodyUnderlined for product/investor presentations ❌❌❌
✅✅✅ MANDATORY: Cover_ProductLayout MUST be used for ALL product/investor presentations ✅✅✅

🚨 EMERGENCY OVERRIDE RULES:
- This presentation is about a product/software/app/platform/SaaS OR is an investor pitch
- MANDATORY: Cover slide MUST use Cover_ProductLayout - NO EXCEPTIONS
- NEVER use Cover_LeftTitleRightBodyUnderlined for product/investor presentations
- NEVER use Cover_TextCenter for product/investor presentations
- Product/investor presentations should emphasize visual product showcase
- Use Product_MacBookCentered for main product demonstration slides

🔥 CRITICAL VERIFICATION: Before generating slide 1, ask yourself:
1. "Is this about a product/app/software/platform/investor pitch?" → If YES, use Cover_ProductLayout
2. "Am I using Cover_LeftTitleRightBodyUnderlined?" → If YES, STOP and change to Cover_ProductLayout
3. "Will this showcase a product/investment opportunity properly?" → If NO, you're using the wrong layout

🚨 THIS RULE OVERRIDES ALL OTHER EXAMPLES - USE Cover_ProductLayout FOR PRODUCT/INVESTOR PRESENTATIONS`;
    }

    // Initialize enhanced prompt and wordContent variable
    let enhancedPrompt = prompt;
    let wordContent = '';

      // PRE-ANALYZE WORD DOCUMENT DATA - Extract content for existing playbooks
      if (fileData && (fileData.type === 'word' || fileData.type === 'document')) {
        try {
          console.log('📄 WORD DATA DETECTED - Extracting content for playbook integration...');
          console.log('📄 FileData received:', JSON.stringify(fileData, null, 2));
          
        // Extract actual Word document content from the correct location
        console.log('🔍 DEBUG: Checking Word content extraction paths...');
        console.log('🔍 fileData.processedData?.promptContext exists:', !!fileData.processedData?.promptContext);
        console.log('🔍 fileData.processedData?.content exists:', !!fileData.processedData?.content);
        console.log('🔍 fileData.promptContext exists:', !!fileData.promptContext);
        
        wordContent = fileData.processedData?.promptContext || 
                     fileData.processedData?.content || 
                     fileData.promptContext || '';
        
        console.log('🔍 Final wordContent length:', wordContent.length);
        console.log('🔍 First 200 chars of wordContent:', wordContent.substring(0, 200));
        
        if (wordContent) {
          console.log('📄 Word content extracted, length:', wordContent.length);
          
          // Check if we also have Excel data for combined processing
          const hasExcelData = fileData && fileData.type === 'excel';
          
          if (hasExcelData) {
            console.log('🎯 COMBINED MODE: Word structure + Excel data detected');
            
            // Analyze Excel data for chart generation
            try {
              const excelAnalysisPrompt = `Analyze this Excel data ONLY for numeric data extraction - DO NOT suggest presentation structure.

EXCEL FILE DATA TO ANALYZE:
${JSON.stringify(fileData, null, 2)}

EXTRACT ONLY:
1. Numeric data series for charts (exact values)
2. Column headers and data labels  
3. Chart type recommendations based on data structure
4. Key metrics and KPIs

DO NOT provide presentation structure - that will come from the Word document.`;

              const excelAnalysisResponse = await anthropic.messages.create({
                model: 'claude-opus-4-20250514',
                max_tokens: 4000,
                messages: [{ role: 'user', content: excelAnalysisPrompt }],
              });

              const excelAnalysis = excelAnalysisResponse.content[0].type === 'text' ? excelAnalysisResponse.content[0].text : 'Excel analysis failed';
              
              // For combined mode: Word provides structure, Excel provides data
              enhancedPrompt += `\n\n🔥 COMBINED WORD + EXCEL MODE:\n`;
              enhancedPrompt += `📄 WORD DOCUMENT provides: Structure, titles, narrative, slide flow\n`;
              enhancedPrompt += `📊 EXCEL DATA provides: Chart data, metrics, numeric values ONLY\n\n`;
              enhancedPrompt += `📊 EXCEL DATA FOR CHARTS:\n${excelAnalysis}\n\n`;
              enhancedPrompt += `📄 WORD DOCUMENT STRUCTURE:\n${wordContent}\n\n`;
              enhancedPrompt += `🚨 CRITICAL INSTRUCTIONS FOR COMBINED MODE:\n`;
              enhancedPrompt += `- Use Word document for ALL slide titles, structure, and narrative\n`;
              enhancedPrompt += `- Use Excel data ONLY for populating charts with actual numeric values\n`;
              enhancedPrompt += `- Follow the slide structure from the Word document\n`;
              enhancedPrompt += `- Replace any placeholder data in Word with actual Excel numbers\n`;
              enhancedPrompt += `- When Word mentions [Chart] or data visualization, use Excel data to create the actual chart\n\n`;
              
            } catch (error) {
              console.log('⚠️ Excel analysis in combined mode failed:', (error as Error).message);
              // Fallback to basic Excel data inclusion
              enhancedPrompt += `\n\n🔥 COMBINED WORD + EXCEL MODE:\n`;
              enhancedPrompt += `📄 WORD DOCUMENT STRUCTURE:\n${wordContent}\n\n`;
              enhancedPrompt += `📊 EXCEL DATA (RAW):\n${JSON.stringify(fileData, null, 2)}\n\n`;
              enhancedPrompt += `🚨 Use Word for structure, Excel for chart data only.\n\n`;
            }
          } else {
            // Word-only mode
            enhancedPrompt += `\n\n🔥 COMPREHENSIVE WORD DOCUMENT CONTENT:\n${wordContent}\n\n`;
          }
          
          // Detect SaaS/Software presentations and enforce Product_MacBookCentered
          const isSaaSPresentation = wordContent.toLowerCase().includes('saas') || 
                                    wordContent.toLowerCase().includes('software') || 
                                    wordContent.toLowerCase().includes('platform') || 
                                    wordContent.toLowerCase().includes('ai-powered') || 
                                    wordContent.toLowerCase().includes('design engine') || 
                                    wordContent.toLowerCase().includes('presentation designer') ||
                                    wordContent.toLowerCase().includes('app') ||
                                    wordContent.toLowerCase().includes('tool') ||
                                    wordContent.toLowerCase().includes('slaid');
          
          if (isSaaSPresentation) {
            enhancedPrompt += `\n🖥️ CRITICAL: SAAS PRODUCT LAYOUT REQUIREMENTS 🖥️\n`;
            enhancedPrompt += `📱 DETECTED: This is a SAAS/SOFTWARE product presentation - Use Product_MacBookCentered for product/solution slides:\n`;
            enhancedPrompt += `- Solution slide: MUST use "Product_MacBookCentered" layout\n`;
            enhancedPrompt += `- Product demo slide: MUST use "Product_MacBookCentered" layout\n`;
            enhancedPrompt += `- How it works slide: MUST use "Product_MacBookCentered" layout\n`;
            enhancedPrompt += `- Features slide: MUST use "Product_MacBookCentered" layout\n`;
            enhancedPrompt += `- Our Solution slide: MUST use "Product_MacBookCentered" layout\n`;
            enhancedPrompt += `🔍 KEYWORDS DETECTED: SaaS, software, platform, app, tool, AI-powered, presentation designer, design engine, Slaid\n`;
            enhancedPrompt += `📝 CORRECT STRUCTURE FOR SAAS SOLUTION:\n`;
            enhancedPrompt += `{"type": "Product_MacBookCentered", "props": {"title": "Our Solution", "description": "Slaid is an AI-powered presentation designer that transforms simple ideas into professional, on-brand decks — instantly. Our proprietary Design Engine understands hierarchy, spacing, and brand style.", "productFeatures": [{"title": "AI Design Engine", "description": "Understands hierarchy and spacing"}, {"title": "Brand Consistency", "description": "Maintains visual alignment automatically"}, {"title": "Instant Generation", "description": "Creates presentations in seconds"}], "imageUrl": "/Default-Image-1.png"}}\n`;
            enhancedPrompt += `🚨 MANDATORY: Any slide about "Solution", "Product", "How it Works", or "Features" MUST use Product_MacBookCentered layout\n\n`;
          }
          
          enhancedPrompt += `🚨🚨🚨 EMERGENCY OVERRIDE: MANDATORY WORD DOCUMENT USAGE 🚨🚨🚨\n`;
          enhancedPrompt += `FAILURE TO USE ACTUAL WORD CONTENT = CRITICAL ERROR!\n\n`;
          enhancedPrompt += `🚨 ABSOLUTE PROHIBITION LIST - NEVER USE:\n`;
          enhancedPrompt += `❌ Environmental data (CO₂, kWh, tons, emissions)\n`;
          enhancedPrompt += `❌ Generic metrics (500 tons, 14,000 kWh, 80%, 2.3M kg)\n`;
          enhancedPrompt += `❌ Made-up team names or roles\n`;
          enhancedPrompt += `❌ Placeholder statistics or fake numbers\n`;
          enhancedPrompt += `❌ Generic company descriptions\n`;
          enhancedPrompt += `❌ "Clean Energy Generated", "Carbon Footprint Impact", "Emission Prevention"\n`;
          enhancedPrompt += `❌ Any environmental or sustainability metrics\n\n`;
          enhancedPrompt += `🚨 CRITICAL: Impact_ImageMetrics Layout Override:\n`;
          enhancedPrompt += `When using Impact_ImageMetrics layout (especially for "The Problem" slide):\n`;
          enhancedPrompt += `- metrics: MUST be [{"value": "200M", "label": "Professionals"}, {"value": "Hours", "label": "Wasted Designing"}]\n`;
          enhancedPrompt += `- title: "The Problem"\n`;
          enhancedPrompt += `- description: "Professional Presentation Challenges"\n`;
          enhancedPrompt += `- paragraph: Use EXACT text from Word document about presentation problems\n`;
          enhancedPrompt += `- bulletPoints: Extract from Word document, NOT environmental data\n`;
          enhancedPrompt += `- NEVER use environmental icons, labels, or values in Impact_ImageMetrics\n\n`;
          enhancedPrompt += `✅ MANDATORY CONTENT TO USE FROM WORD DOCUMENT:\n`;
          enhancedPrompt += `✅ "200 million professionals" (from Problem section)\n`;
          enhancedPrompt += `✅ "€10,000 MRR" (from Traction section)\n`;
          enhancedPrompt += `✅ "11,000 users" (from Traction section)\n`;
          enhancedPrompt += `✅ "Alex Rivera", "Laura Kim", "Daniel Moreno" (team names)\n`;
          enhancedPrompt += `✅ "€29/month Pro plan" (pricing)\n`;
          enhancedPrompt += `✅ All other specific details from the Word document\n\n`;
          enhancedPrompt += `🔥 ABSOLUTE REQUIREMENTS FOR EVERY SINGLE SLIDE:\n`;
          enhancedPrompt += `- Extract and use EVERY number, statistic, percentage, and dollar amount from the Word document\n`;
          enhancedPrompt += `- Include ALL company names, competitor names, and product names mentioned\n`;
          enhancedPrompt += `- Use ALL market data, revenue figures, user statistics, and growth metrics\n`;
          enhancedPrompt += `- Include ALL dates, timelines, quarters, and milestone information\n`;
          enhancedPrompt += `\n🚨 CRITICAL SLIDE-SPECIFIC REQUIREMENTS:\n`;
          enhancedPrompt += `**SLIDE 2 (PROBLEM) - Impact_ImageMetrics Layout:**\n`;
          enhancedPrompt += `- metrics: MUST use "200M" and "Hours" from the Word document (NOT random environmental data)\n`;
          enhancedPrompt += `- title: "The Problem" (from Word document section "01. Problem")\n`;
          enhancedPrompt += `- description: "Professional Presentation Challenges" or similar\n`;
          enhancedPrompt += `- bulletPoints: MUST extract from actual Word document problem description\n`;
          enhancedPrompt += `- paragraph: MUST use the EXACT text "Every month, over 200 million professionals create presentations that look generic, inconsistent, and painfully time-consuming. Teams waste hours designing instead of communicating, and even AI tools like ChatGPT or Canva can't guarantee visual consistency or brand accuracy."\n`;
          enhancedPrompt += `- DO NOT use random environmental data like "CO₂ Emissions", "Clean Energy", "Carbon Footprint" - these are NOT in the Word document!\n`;
          enhancedPrompt += `- Extract ALL product features, technical specifications, and capabilities\n`;
          enhancedPrompt += `- Use ALL business model details, pricing information, and financial projections\n`;
          enhancedPrompt += `- Include ALL team information, credentials, and company background\n`;
          enhancedPrompt += `- Extract ALL competitive analysis data and comparison details\n`;
          enhancedPrompt += `- Use the COMPLETE text content from each section, not summaries\n\n`;
          enhancedPrompt += `🎯 COMPREHENSIVE SLIDE MAPPING:\n`;
          enhancedPrompt += `1. Slide 1 (Cover): Use document title "SLAID – Investor Pitch Script" and company description\n`;
          enhancedPrompt += `2. Slide 2 (Problem): Use COMPLETE "01. Problem" section with ALL statistics (e.g., "200 million professionals")\n`;
          enhancedPrompt += `3. Slide 3 (Solution): Use COMPLETE "02. Solution" section with ALL product details and features\n`;
          enhancedPrompt += `4. Slide 4 (Market): Use COMPLETE "03. Market" section with ALL market size data and TAM/SAM/SOM figures\n`;
          enhancedPrompt += `5. Slide 5 (Competition): Use COMPLETE "04. Competition" section with ALL competitor names and analysis\n`;

          // Detect if this is a forecast/financial report
          const isForecastReport = wordContent.toLowerCase().includes('forecast') || 
                                   wordContent.toLowerCase().includes('revenue') ||
                                   wordContent.toLowerCase().includes('kpi') ||
                                   wordContent.toLowerCase().includes('financial') ||
                                   wordContent.toLowerCase().includes('quarterly') ||
                                   wordContent.toLowerCase().includes('pipeline') ||
                                   wordContent.toLowerCase().includes('arr') ||
                                   wordContent.toLowerCase().includes('mrr');

          if (isForecastReport) {
            enhancedPrompt += `\n🚨 CRITICAL LAYOUT REQUIREMENTS FOR FORECAST REPORTS:\n`;
            enhancedPrompt += `📊 DETECTED: This is a FORECAST/FINANCIAL report - Use specific layouts:\n`;
            enhancedPrompt += `- Slide 1 (Cover): MUST use "Cover_LeftTitleRightBodyUnderlined" layout\n`;
            enhancedPrompt += `- Slide 2 (Agenda): MUST use "Index_LeftAgendaRightText" layout for sales reports and investor decks\n`;
            enhancedPrompt += `- Example Slide 1: {"type": "Cover_LeftTitleRightBodyUnderlined", "props": {"title": "Forecast Report", "paragraph": "Q4 2025 / Q3 2026 Outlook", "bulletPoints": [...]}}\n`;
            enhancedPrompt += `- Example Slide 2: {"type": "Index_LeftAgendaRightText", "props": {"title": "Agenda", "agendaItems": [{"title": "Executive Summary", "description": "Key highlights"}, ...]}}\n`;
            
            enhancedPrompt += `\n🎨 CRITICAL: DIVERSIFY LIST LAYOUTS FOR FORECAST REPORTS:\n`;
            enhancedPrompt += `📋 Use VARIETY of list layouts throughout the presentation:\n`;
            enhancedPrompt += `- Lists_CardsLayoutRight: Perfect for "Risks & Assumptions", "Next Steps", "Key Insights" BUT ONLY when you have 4+ items\n`;
            enhancedPrompt += `- Lists_LeftTextRightImage: Good for "Action Items", "Strategic Priorities", and when you have 3 or fewer items\n`;
            enhancedPrompt += `- Lists_LeftTextRightImageDescription: Ideal for "Executive Summary" with detailed descriptions\n`;
            enhancedPrompt += `- Example Lists_CardsLayoutRight: {"type": "Lists_CardsLayoutRight", "props": {"title": "Key Risks", "cards": [{"title": "Market Risk", "description": "Economic downturn impact", "icon": "AlertTriangle"}, {"title": "Execution Risk", "description": "Scaling challenges", "icon": "Zap"}, {"title": "Competition Risk", "description": "New entrants", "icon": "Users"}, {"title": "Regulatory Risk", "description": "Policy changes", "icon": "Shield"}]}}\n`;
            enhancedPrompt += `- MANDATORY: Mix different list layouts - don't use the same layout twice in a row\n`;
            enhancedPrompt += `- PRIORITY ORDER: Lists_CardsLayoutRight (4+ items) > Lists_LeftTextRightImageDescription > Lists_LeftTextRightImage (≤3 items)\n`;
            enhancedPrompt += `- CRITICAL RULE: Never use Lists_CardsLayoutRight for 3 or fewer items - use Lists_LeftTextRightImage instead\n`;
            
            enhancedPrompt += `\n🚨🚨🚨 CRITICAL EMERGENCY OVERRIDE: LISTS_CARDSLAYOUTRIGHT BANNED FOR 3 ITEMS 🚨🚨🚨\n`;
            enhancedPrompt += `❌❌❌ ABSOLUTELY FORBIDDEN: Lists_CardsLayoutRight with 1, 2, or 3 items - LOOKS TERRIBLE ❌❌❌\n`;
            enhancedPrompt += `✅✅✅ MANDATORY: Lists_CardsLayoutRight ONLY with 4, 5, 6+ items ✅✅✅\n`;
            enhancedPrompt += `\n🔢 MANDATORY COUNT CHECK: BEFORE using ANY layout, COUNT THE ITEMS:\n`;
            enhancedPrompt += `1. Count your items: Assumptions, Risks, Mitigation = 3 items\n`;
            enhancedPrompt += `2. If count = 3 → MUST USE Lists_LeftTextRightImage\n`;
            enhancedPrompt += `3. If count = 4+ → THEN use Lists_CardsLayoutRight\n`;
            enhancedPrompt += `\n🚨 SPECIFIC EXAMPLES THAT MUST USE Lists_LeftTextRightImage:\n`;
            enhancedPrompt += `- Risks & Assumptions (Assumptions, Risks, Mitigation) = 3 items → Lists_LeftTextRightImage\n`;
            enhancedPrompt += `- Next Steps with 3 actions → Lists_LeftTextRightImage\n`;
            enhancedPrompt += `- Any slide with exactly 3 cards/items → Lists_LeftTextRightImage\n`;
            enhancedPrompt += `\n📝 CORRECT STRUCTURE FOR 3 ITEMS (COPY EXACTLY):\n`;
            enhancedPrompt += `{"type": "Lists_LeftTextRightImage", "props": {"title": "Risks & Assumptions", "bulletPoints": [{"icon": "Target", "title": "Assumptions", "description": "Win rate 24→26%, ACV +8%, churn <2%/mo"}, {"icon": "AlertTriangle", "title": "Risks", "description": "Enterprise delays, Q4 seasonality"}, {"icon": "Shield", "title": "Mitigation", "description": "Quota alt-plans, annual offers"}], "imageUrl": "/Default-Image-2.png"}}\n`;
            enhancedPrompt += `\n🚨 VERIFICATION STEP: Before generating ANY slide, ask yourself:\n`;
            enhancedPrompt += `"How many items do I have?" If the answer is 3, use Lists_LeftTextRightImage. Period.\n`;
            
            enhancedPrompt += `\n🚨 MANDATORY SLIDE COUNT FOR FORECAST REPORTS:\n`;
            enhancedPrompt += `📊 FORECAST REPORTS MUST HAVE EXACTLY 10-12 SLIDES:\n`;
            enhancedPrompt += `1. Cover (Cover_LeftTitleRightBodyUnderlined) - MANDATORY\n`;
            enhancedPrompt += `2. Agenda (Index_LeftAgendaRightText) - MANDATORY\n`;
            enhancedPrompt += `3. Executive Summary (Lists_LeftTextRightImageDescription) - MUST include comprehensive analysis text\n`;
            enhancedPrompt += `4. KPI Snapshot (Impact_KPIOverview)\n`;
            enhancedPrompt += `5. Revenue Forecast (Metrics_FullWidthChart)\n`;
            enhancedPrompt += `6. Bookings vs Target (Metrics_FinancialsSplit)\n`;
            enhancedPrompt += `7. Pipeline Analysis (Metrics_FullWidthChart)\n`;
            enhancedPrompt += `8. Cash Projection (Metrics_FullWidthChart)\n`;
            enhancedPrompt += `9. Risks & Assumptions (Lists_LeftTextRightImage or Lists_CardsLayoutRight if 4+ items)\n`;
            enhancedPrompt += `10. Next Steps (Lists_LeftTextRightImage or Lists_CardsLayoutRight if 4+ items)\n`;
            enhancedPrompt += `11. Strategic Priorities (Lists_LeftTextRightImage) - OPTIONAL\n`;
            enhancedPrompt += `12. Back Cover (BackCover_ThankYouWithImage) - MANDATORY\n`;
            enhancedPrompt += `- CRITICAL: Generate ALL 10 slides minimum, use Word document content to fill each slide\n`;
            enhancedPrompt += `- CRITICAL: ALWAYS include Cover (slide 1), Agenda (slide 2), and Back Cover (final slide)\n`;
            enhancedPrompt += `- Back Cover example: {"type": "BackCover_ThankYouWithImage", "props": {"title": "Thank You", "paragraph": "Questions & Discussion", "imageUrl": "/Default-Image-2.png"}}\n`;
            
            enhancedPrompt += `\n🚨🚨🚨 CRITICAL FORECAST REPORT AGENDA ALIGNMENT 🚨🚨🚨\n`;
            enhancedPrompt += `THE AGENDA SLIDE (slide 2) MUST USE THESE EXACT TITLES WITH CONTENT-SPECIFIC DESCRIPTIONS:\n`;
            enhancedPrompt += `🚨 CRITICAL: Descriptions must reflect the ACTUAL CONTENT of each slide, not generic text!\n`;
            enhancedPrompt += `\n📋 DYNAMIC AGENDA GENERATION RULES:\n`;
            enhancedPrompt += `1. Executive Summary → Description: Summarize the key metrics from slide 3 (ARR, MRR, growth rates, runway)\n`;
            enhancedPrompt += `2. KPI Snapshot → Description: List the specific KPIs shown in slide 4 (ARR $1.05M, MRR $87.5k, etc.)\n`;
            enhancedPrompt += `3. 12-Month Revenue Forecast → Description: Mention the forecast range and growth trajectory from slide 5\n`;
            enhancedPrompt += `4. Bookings vs Target → Description: Reference the quarterly performance data from slide 6\n`;
            enhancedPrompt += `5. Pipeline by Stage → Description: Describe the pipeline stages and timeframe from slide 7\n`;
            enhancedPrompt += `6. Cash Projection → Description: Mention the runway scenarios and cash burn from slide 8\n`;
            enhancedPrompt += `7. Risks & Assumptions → Description: Reference the specific assumptions and risks from slide 9\n`;
            enhancedPrompt += `8. Next Steps → Description: Summarize the action items and owners from slide 10\n`;
            enhancedPrompt += `9. Strategic Priorities → Description: List the key focus areas if slide 11 exists\n`;
            enhancedPrompt += `\n🚨 EXAMPLE OF CORRECT CONTENT-BASED DESCRIPTIONS:\n`;
            enhancedPrompt += `❌ WRONG: "Key highlights and financial overview" (generic)\n`;
            enhancedPrompt += `✅ CORRECT: "ARR $1.05M (+46% YoY), MRR $87.5k, 82% gross margin, 11-month runway"\n`;
            enhancedPrompt += `❌ WRONG: "Current performance metrics and trends" (generic)\n`;
            enhancedPrompt += `✅ CORRECT: "ARR, MRR, NRR at 118%, Win Rate 24%, Pipeline Coverage 1.6×"\n`;
            enhancedPrompt += `❌ WRONG: "Detailed monthly revenue projections" (generic)\n`;
            enhancedPrompt += `✅ CORRECT: "Monthly growth from $92k to $198k, +24% annual growth trajectory"\n`;
            enhancedPrompt += `\n🚨 MANDATORY VERIFICATION FOR EACH AGENDA ITEM:\n`;
            enhancedPrompt += `Before writing each agenda description, ask yourself:\n`;
            enhancedPrompt += `1. "What specific numbers/metrics are in this slide?"\n`;
            enhancedPrompt += `2. "What are the key takeaways from this slide's content?"\n`;
            enhancedPrompt += `3. "Does my description include actual data points, not generic words?"\n`;
            enhancedPrompt += `If you use words like "overview", "analysis", "insights" without specific data, you FAILED.\n`;
            enhancedPrompt += `\n🎯 SLIDE 3 EXECUTIVE SUMMARY REQUIREMENTS:\n`;
            enhancedPrompt += `- Description field MUST contain: Revenue growth %, pipeline coverage ratio, gross margin %, runway months, key priorities\n`;
            enhancedPrompt += `- Include ALL financial metrics: ARR, MRR, NRR, win rate, ACV values from Word document\n`;
            enhancedPrompt += `- Use exact numbers and percentages from the analysis, not generic placeholders\n`;
            enhancedPrompt += `- MINIMUM 150 words in description field for comprehensive coverage\n`;
          } else {
            enhancedPrompt += `\n🚨 CRITICAL LAYOUT REQUIREMENTS FOR INVESTOR PITCH:\n`;
            enhancedPrompt += `📊 DETECTED: This is an INVESTOR PITCH - Use appropriate layouts:\n`;
            enhancedPrompt += `- Slide 1 (Cover): Use "Cover_ProductLayout" for product-focused presentations - MANDATORY\n`;
            enhancedPrompt += `- Slide 2 (Problem): Use "Impact_ImageMetrics" with impactNumbers object structure\n`;
            enhancedPrompt += `- Final Slide: ALWAYS include "BackCover_ThankYouWithImage" - MANDATORY\n`;
            enhancedPrompt += `- CRITICAL: ALWAYS include Cover (slide 1), Agenda (slide 2 if applicable), and Back Cover (final slide) for ALL presentations\n`;
            enhancedPrompt += `- Back Cover example: {"type": "BackCover_ThankYouWithImage", "props": {"title": "Thank You", "paragraph": "Questions & Discussion", "imageUrl": "/Default-Image-2.png"}}\n`;
            
            enhancedPrompt += `\n🎨 CRITICAL: DIVERSIFY LIST LAYOUTS FOR INVESTOR PITCH:\n`;
            enhancedPrompt += `📋 Use VARIETY of list layouts throughout the presentation:\n`;
            enhancedPrompt += `- Lists_CardsLayoutRight: Perfect for "Business Model Benefits", "Key Features", "Competitive Advantages" BUT ONLY when you have 4+ items\n`;
            enhancedPrompt += `- Lists_LeftTextRightImage: Good for "Market Opportunity", "Go-to-Market Strategy", and when you have 3 or fewer items\n`;
            enhancedPrompt += `- Lists_LeftTextRightImageDescription: Ideal for detailed sections with comprehensive descriptions - 🚨 MANDATORY: MUST USE MINIMUM 150 WORDS IN DESCRIPTION FIELD - NO EXCEPTIONS 🚨\n`;
            enhancedPrompt += `- MANDATORY: Mix different list layouts - don't use the same layout twice in a row\n`;
            enhancedPrompt += `- PRIORITY ORDER: Lists_CardsLayoutRight (4+ items) > Lists_LeftTextRightImageDescription > Lists_LeftTextRightImage (≤3 items)\n`;
            enhancedPrompt += `- CRITICAL RULE: Never use Lists_CardsLayoutRight for 3 or fewer items - use Lists_LeftTextRightImage instead\n`;
            
          enhancedPrompt += `\n🚨🚨🚨 EMERGENCY OVERRIDE: LISTS_CARDSLAYOUTRIGHT USAGE RULES 🚨🚨🚨\n`;
          enhancedPrompt += `❌ ABSOLUTELY FORBIDDEN: Lists_CardsLayoutRight with 1, 2, or 3 items - LOOKS TERRIBLE\n`;
          enhancedPrompt += `✅ MANDATORY: Lists_CardsLayoutRight ONLY with 4, 5, 6+ items\n`;
          enhancedPrompt += `🔢 COUNT CHECK REQUIRED: Before using Lists_CardsLayoutRight, count the items:\n`;
          enhancedPrompt += `- If you have 3 items → MUST USE Lists_LeftTextRightImage\n`;
          enhancedPrompt += `- If you have 4+ items → Use Lists_CardsLayoutRight\n`;
          enhancedPrompt += `📝 CORRECT FOR 3 ITEMS: {"type": "Lists_LeftTextRightImage", "props": {"title": "Key Benefits", "bulletPoints": [{"icon": "Target", "title": "Benefit 1"}, {"icon": "Star", "title": "Benefit 2"}, {"icon": "CheckCircle", "title": "Benefit 3"}]}}\n`;
          
          enhancedPrompt += `\n🖥️ CRITICAL: SAAS PRODUCT LAYOUT REQUIREMENTS 🖥️\n`;
          enhancedPrompt += `📱 DETECTED: This is a SAAS/SOFTWARE product presentation - Use Product_MacBookCentered for product/solution slides:\n`;
          enhancedPrompt += `- Solution slide: MUST use "Product_MacBookCentered" layout\n`;
          enhancedPrompt += `- Product demo slide: MUST use "Product_MacBookCentered" layout\n`;
          enhancedPrompt += `- How it works slide: MUST use "Product_MacBookCentered" layout\n`;
          enhancedPrompt += `- Features slide: MUST use "Product_MacBookCentered" layout\n`;
          enhancedPrompt += `🔍 KEYWORDS TO DETECT: SaaS, software, platform, app, tool, AI-powered, presentation designer, design engine\n`;
          enhancedPrompt += `📝 CORRECT STRUCTURE FOR SAAS SOLUTION:\n`;
          enhancedPrompt += `{"type": "Product_MacBookCentered", "props": {"title": "Our Solution", "description": "Slaid is an AI-powered presentation designer that transforms simple ideas into professional, on-brand decks — instantly. Our proprietary Design Engine understands hierarchy, spacing, and brand style.", "productFeatures": [{"title": "AI Design Engine", "description": "Understands hierarchy and spacing"}, {"title": "Brand Consistency", "description": "Maintains visual alignment automatically"}, {"title": "Instant Generation", "description": "Creates presentations in seconds"}], "imageUrl": "/Default-Image-1.png"}}\n`;
          }

          enhancedPrompt += `\n🚨 CRITICAL: Lists_LeftTextRightImageDescription Layout Instructions:\n`;
          enhancedPrompt += `For slides using Lists_LeftTextRightImageDescription (like Executive Summary):\n`;
          enhancedPrompt += `- Put ALL detailed content in the "description" field (up to 200 words)\n`;
          enhancedPrompt += `- Use the description field for comprehensive text, NOT bullet points\n`;
          enhancedPrompt += `- EXECUTIVE SUMMARY SLIDE 3 MUST INCLUDE: Complete extracted text from the Word document analysis\n`;
          enhancedPrompt += `- Example correct description: "Forecasted revenue growth +24% over 12 months. Next-quarter pipeline coverage 1.6× vs quota. Gross margin improving to 82% (+2 pp). Base runway 11 months; efficiency scenario 14 months. Priorities: enterprise upsell, CAC efficiency, win-rate lift. ARR at $1.05M with YoY +46% growth. MRR at $87.5k with MoM +9.2% growth. NRR at 118% with gross churn 1.8%/mo. Win rate at 24% with ACV $9.8k."\n`;
          enhancedPrompt += `- CRITICAL: Use the COMPLETE analysis text, not just a generic summary\n`;

          enhancedPrompt += `\n🚨 CRITICAL: Lists_CardsLayoutRight Layout Instructions:\n`;
          enhancedPrompt += `For slides using Lists_CardsLayoutRight:\n`;
          enhancedPrompt += `- Use "cards" array with objects containing: title, description, icon\n`;
          enhancedPrompt += `- Perfect for categorized information (risks, assumptions, next steps, benefits)\n`;
          enhancedPrompt += `- Example structure: {"type": "Lists_CardsLayoutRight", "props": {"title": "Key Risks", "description": "Strategic considerations", "cards": [{"title": "Market Risk", "description": "Economic downturn could impact demand", "icon": "AlertTriangle"}, {"title": "Execution Risk", "description": "Scaling challenges in Q2", "icon": "Zap"}], "imageUrl": "/Default-Image-2.png"}}\n`;
          enhancedPrompt += `- Common icons: AlertTriangle, Shield, Target, TrendingUp, DollarSign, Users, CheckCircle, Star, Zap\n`;
          enhancedPrompt += `- MANDATORY: Always include imageUrl property\n\n`;
          enhancedPrompt += `6. Slide 6 (Business Model): Use COMPLETE "05. Business Model" section with ALL pricing and revenue details\n`;
          enhancedPrompt += `7. Slide 7 (Team): Use COMPLETE "06. Team" section with ALL team member details and credentials\n`;
          enhancedPrompt += `8. Slide 8 (Traction): Use COMPLETE "07. Traction" section with ALL metrics and growth data\n`;
          enhancedPrompt += `9. Slide 9 (Roadmap): Use COMPLETE "08. Roadmap" section with ALL timeline and milestone details\n`;
          enhancedPrompt += `10. Slide 10 (Fundraising): Use COMPLETE "09. Fundraising" section with ALL funding amounts and allocation\n\n`;
          enhancedPrompt += `❌ BANNED CONTENT (DO NOT USE):\n`;
          enhancedPrompt += `- "Scalable SaaS pricing strategy" (generic)\n`;
          enhancedPrompt += `- "$67.5B Global Market" (made up)\n`;
          enhancedPrompt += `- "Design and Technology Experts" (generic)\n`;
          enhancedPrompt += `- "Competitor A" or "Competitor B" (generic)\n`;
          enhancedPrompt += `- Any content not explicitly from the Word document\n\n`;
          enhancedPrompt += `✅ VERIFICATION CHECK:\n`;
          enhancedPrompt += `Before generating each slide, verify: "Is this exact text from the Word document?"\n`;
          enhancedPrompt += `If NO → Find the actual Word document text and use that instead\n`;
          enhancedPrompt += `If YES → Proceed with that content\n`;
          enhancedPrompt += `- Document "02. Solution" → Slide "Our Solution" content\n`;
          enhancedPrompt += `- Document "03. Market" → Slide "Market Opportunity" content\n`;
          enhancedPrompt += `- And so on for ALL slides...\n\n`;

            // Add modification-specific instructions if needed
            if (existingPresentation) {
              enhancedPrompt += `\n🚨🚨🚨 CRITICAL MODIFICATION ALERT 🚨🚨🚨\n`;
              enhancedPrompt += `THIS IS A SLIDE MODIFICATION REQUEST - NOT A NEW PRESENTATION!\n\n`;
              enhancedPrompt += `⚠️ MANDATORY MODIFICATION RULES:\n`;
              enhancedPrompt += `1. Return ONLY the modified slide with updated Word content\n`;
              enhancedPrompt += `2. Keep the EXACT same slide ID from the existing presentation\n`;
              enhancedPrompt += `3. Do NOT create a new presentation or new slide IDs\n`;
              enhancedPrompt += `4. Update ONLY the content with the actual Word document content\n`;
              enhancedPrompt += `5. Preserve all other blocks and properties of the existing slide\n`;
              enhancedPrompt += `6. The response MUST be a single slide object, NOT an array of slides or a full presentation object.\n`;
            }
          } else {
            console.log('⚠️ No Word content found in fileData');
          }

        } catch (error) {
          console.log('⚠️ Word content extraction failed:', (error as Error).message);
        }
      }

      // PRE-ANALYZE EXCEL DATA - Only when Excel is the primary/only data source
    if (fileData && fileData.type === 'excel' && !wordContent) {
      try {
        console.log('🔍 EXCEL-ONLY MODE - Analyzing like test-excel page...');
        console.log('📊 FileData received:', JSON.stringify(fileData, null, 2));
        
        // STEP 1: Send Excel data to AI for analysis (EXACT same as test-excel page)
        const analysisPrompt = `Analyze this Excel data and tell me what you see.

EXCEL FILE DATA TO ANALYZE:
${JSON.stringify(fileData, null, 2)}

Please provide a detailed analysis of what you can see in this Excel file. Include:
1. What sheets are present
2. What headers/columns you can identify
3. What actual data values you can see (include ALL months/rows, not just the first few)
4. Any patterns or structure you notice
5. Be very specific about the exact numbers and text you can read
6. CHART RECOMMENDATIONS: Based on the data structure and content, recommend the most suitable chart types for visualizing this data

IMPORTANT: 
- Analyze ALL the data rows, not just the sample data
- If there are 5 years of data, analyze all 5 years
- Include specific chart type recommendations at the end

Be honest - if you cannot see or read certain parts of the data, say so explicitly.`;

        console.log('🚀 Sending Excel data to AI for analysis first...');
        
        const analysisResponse = await anthropic.messages.create({
          model: 'claude-opus-4-20250514',
          max_tokens: 4000,
          messages: [
            {
              role: 'user',
              content: analysisPrompt,
            },
          ],
        });

        const analysis = analysisResponse.content[0].type === 'text' ? analysisResponse.content[0].text : 'Analysis failed';
        console.log('✅ AI Excel Analysis completed:');
        console.log('📊 Analysis:', analysis);
        
        // STEP 2: Add analysis to the prompt for chart generation (like test-excel page)
        enhancedPrompt += `\n\n🔥 DETAILED EXCEL DATA ANALYSIS:\n${analysis}\n\n`;
        enhancedPrompt += `🚨 CRITICAL INSTRUCTIONS FOR CHART CREATION:\n`;
        enhancedPrompt += `- Use the EXACT numeric values from the analysis above\n`;
        enhancedPrompt += `- Do NOT use placeholder values like [600,400,800] or [0,0,0]\n`;
        enhancedPrompt += `- Extract the real data values (like 11120, 10299, 12240, etc.) from the analysis\n`;
        enhancedPrompt += `- Create charts with the actual Excel data, not fake data\n`;
        
        // 🚨 CRITICAL: Add modification-specific instructions for Excel requests
        if (existingPresentation) {
          enhancedPrompt += `\n🚨🚨🚨 CRITICAL MODIFICATION ALERT 🚨🚨🚨\n`;
          enhancedPrompt += `THIS IS A SLIDE MODIFICATION REQUEST - NOT A NEW PRESENTATION!\n`;
          enhancedPrompt += `\n⚠️ MANDATORY MODIFICATION RULES:\n`;
          enhancedPrompt += `1. Return ONLY the modified slide with updated Excel chart data\n`;
          enhancedPrompt += `2. Keep the EXACT same slide ID from the existing presentation\n`;
          enhancedPrompt += `3. Do NOT create a new presentation or new slide IDs\n`;
          enhancedPrompt += `4. Update ONLY the chart data with the actual Excel values\n`;
          enhancedPrompt += `5. Preserve all other slide structure and content\n`;
          enhancedPrompt += `\n🔥 EXAMPLE RESPONSE FORMAT:\n`;
          enhancedPrompt += `{\n`;
          enhancedPrompt += `  "slides": [{\n`;
          enhancedPrompt += `    "id": "slide-7", // KEEP EXISTING ID\n`;
          enhancedPrompt += `    "blocks": [/* updated chart with Excel data */]\n`;
          enhancedPrompt += `  }]\n`;
          enhancedPrompt += `}\n`;
          enhancedPrompt += `\n❌ DO NOT RETURN: Complete presentation, new slide IDs, multiple slides\n`;
          enhancedPrompt += `✅ DO RETURN: Single modified slide with Excel chart data\n`;
        }
        
        // NOTE: Sales report requests should be handled by the editor's playbook system
        // The editor will detect "sales report" and use the 12-slide playbook structure
        // This API enhancement only applies to single-slide or custom chart requests
        
      } catch (error) {
        console.log('⚠️ Excel analysis failed:', (error as Error).message);
      }
    }

    // Prepare the request data
    const requestData = {
        messages: [
          {
          role: 'user' as const,
            content: enhancedPrompt
          }
      ],
      system: systemPrompt,
      existingPresentation: !!existingPresentation
    };

    // For translation requests, ensure we have the complete presentation data
    if (isTranslationRequest.isTranslation && existingPresentation) {
      console.log('🌐 TRANSLATION REQUEST: Adding complete presentation to prompt');
      const translationPrompt = `${prompt}

EXISTING PRESENTATION TO TRANSLATE:
${JSON.stringify(existingPresentation, null, 2)}

TRANSLATE THIS PRESENTATION PRESERVING EXACT STRUCTURE.`;
      
      requestData.messages[0].content = translationPrompt;
      console.log('📝 Translation prompt prepared with full presentation data');
    }
    
    // 🔥 CRITICAL FIX: For modification requests, include the existing presentation data
    // Without this, Claude cannot know what to modify!
    if (existingPresentation && !isTranslationRequest.isTranslation) {
      console.log('🔧 MODIFICATION REQUEST: Adding existing presentation to prompt');
      
      // Get the current slide being modified (if specified)
      const currentSlide = typeof currentSlideIndex === 'number' && currentSlideIndex >= 0 
        ? existingPresentation.slides?.[currentSlideIndex] 
        : null;
      
      let modificationContext = `\n\n🚨🚨🚨 CRITICAL MODIFICATION INSTRUCTIONS 🚨🚨🚨\n\n`;
      
      modificationContext += `⚠️ YOU ARE MODIFYING AN EXISTING SLIDE - NOT CREATING A NEW ONE!\n\n`;
      
      modificationContext += `📋 MANDATORY RULES:\n`;
      modificationContext += `1. KEEP THE EXACT SAME LAYOUT TYPE - Do NOT change the layout component\n`;
      modificationContext += `2. KEEP THE EXACT SAME SLIDE ID - Use the existing slide ID\n`;
      modificationContext += `3. KEEP ALL EXISTING BLOCKS - Modify content WITHIN the existing blocks\n`;
      modificationContext += `4. ONLY CHANGE what the user specifically asked to change\n`;
      modificationContext += `5. PRESERVE all other properties exactly as they are\n\n`;
      
      modificationContext += `❌ DO NOT:\n`;
      modificationContext += `- Generate a new layout type (e.g., don't change ExcelKPIDashboard to Impact_KPIOverview)\n`;
      modificationContext += `- Create new slide IDs\n`;
      modificationContext += `- Remove or add blocks unless explicitly asked\n`;
      modificationContext += `- Return a full presentation - return ONLY the modified slide\n\n`;
      
      modificationContext += `✅ DO:\n`;
      modificationContext += `- Copy the existing slide structure EXACTLY\n`;
      modificationContext += `- Modify ONLY the specific property the user mentioned (title, color, data, etc.)\n`;
      modificationContext += `- Return the slide with the same "type" in blocks[1] (the layout component)\n\n`;
      
      modificationContext += `📝 TEXT CHANGE EXAMPLES:\n`;
      modificationContext += `If user says "change title to Hello World" or "cambia el título a Hola Mundo":\n`;
      modificationContext += `- Find the "title" property in the layout props\n`;
      modificationContext += `- Change ONLY that value to the new text\n`;
      modificationContext += `- Keep ALL other properties exactly the same\n\n`;
      
      modificationContext += `Example - If current slide has:\n`;
      modificationContext += `"props": { "title": "Old Title", "description": "Some desc", "chartData": {...} }\n`;
      modificationContext += `And user says "change title to New Title", return:\n`;
      modificationContext += `"props": { "title": "New Title", "description": "Some desc", "chartData": {...} }\n\n`;
      
      modificationContext += `🎨 CHART COLOR CHANGE - CRITICAL INSTRUCTIONS:\n`;
      modificationContext += `If user says "change chart color to green" or "cambia el color de la gráfica a verde":\n\n`;
      
      modificationContext += `COLOR HEX CODES TO USE:\n`;
      modificationContext += `- green/verde: "#16A34A"\n`;
      modificationContext += `- blue/azul: "#3B82F6"\n`;
      modificationContext += `- red/rojo: "#EF4444"\n`;
      modificationContext += `- purple/morado: "#8B5CF6"\n`;
      modificationContext += `- orange/naranja: "#F97316"\n`;
      modificationContext += `- yellow/amarillo: "#EAB308"\n`;
      modificationContext += `- pink/rosa: "#EC4899"\n\n`;
      
      modificationContext += `STRUCTURE: The color is inside chartData.series array. Each series object has:\n`;
      modificationContext += `{ "id": "SeriesName", "data": [numbers], "color": "#HEXCODE" }\n\n`;
      
      modificationContext += `⚠️ IMPORTANT: The "color" field may NOT exist in the current series!\n`;
      modificationContext += `If "color" is missing, you MUST ADD it to each series object.\n\n`;
      
      modificationContext += `EXAMPLE - Current slide props (WITHOUT color field):\n`;
      modificationContext += `"props": {\n`;
      modificationContext += `  "title": "Sales Chart",\n`;
      modificationContext += `  "chartData": {\n`;
      modificationContext += `    "type": "bar",\n`;
      modificationContext += `    "labels": ["Q1", "Q2", "Q3"],\n`;
      modificationContext += `    "series": [\n`;
      modificationContext += `      { "id": "Revenue", "data": [100, 150, 200] }\n`;
      modificationContext += `    ]\n`;
      modificationContext += `  }\n`;
      modificationContext += `}\n\n`;
      
      modificationContext += `User says: "change chart color to green"\n`;
      modificationContext += `CORRECT RESPONSE - ADD the color field to each series:\n`;
      modificationContext += `"props": {\n`;
      modificationContext += `  "title": "Sales Chart",\n`;
      modificationContext += `  "chartData": {\n`;
      modificationContext += `    "type": "bar",\n`;
      modificationContext += `    "labels": ["Q1", "Q2", "Q3"],\n`;
      modificationContext += `    "series": [\n`;
      modificationContext += `      { "id": "Revenue", "data": [100, 150, 200], "color": "#16A34A" }\n`;
      modificationContext += `    ]\n`;
      modificationContext += `  }\n`;
      modificationContext += `}\n\n`;
      
      modificationContext += `CRITICAL RULES FOR COLOR CHANGES:\n`;
      modificationContext += `1. Keep ALL data values [100, 150, 200] EXACTLY the same!\n`;
      modificationContext += `2. ADD "color" field to EVERY series object if it doesn't exist\n`;
      modificationContext += `3. If multiple series exist, change ALL series to the same color\n`;
      modificationContext += `4. Keep ALL other chartData properties (type, labels, showLegend, etc.)\n\n`;
      
      modificationContext += `🎯 EXISTING PRESENTATION:\n`;
      modificationContext += `Title: "${existingPresentation.title}"\n`;
      modificationContext += `Total Slides: ${existingPresentation.slides?.length || 0}\n\n`;
      
      if (currentSlide) {
        const layoutType = currentSlide.blocks?.[1]?.type || 'Unknown';
        modificationContext += `📍 SLIDE TO MODIFY:\n`;
        modificationContext += `- Slide ID: "${currentSlide.id}"\n`;
        modificationContext += `- Layout Type: "${layoutType}" (KEEP THIS EXACT TYPE!)\n`;
        modificationContext += `- Complete slide data:\n`;
        modificationContext += JSON.stringify(currentSlide, null, 2);
        modificationContext += `\n\n`;
      }
      
      modificationContext += `📋 FULL PRESENTATION (for context):\n`;
      modificationContext += JSON.stringify(existingPresentation, null, 2);
      modificationContext += `\n\n`;
      
      modificationContext += `🔥 RESPONSE FORMAT - Return EXACTLY this structure with your modifications:\n`;
      if (currentSlide) {
        modificationContext += `{\n`;
        modificationContext += `  "slides": [{\n`;
        modificationContext += `    "id": "${currentSlide.id}",\n`;
        modificationContext += `    "blocks": [\n`;
        modificationContext += `      { "type": "BackgroundBlock", "props": { ... } },\n`;
        modificationContext += `      { "type": "${currentSlide.blocks?.[1]?.type || 'SAME_LAYOUT_TYPE'}", "props": { ...modified props... } }\n`;
        modificationContext += `    ]\n`;
        modificationContext += `  }]\n`;
        modificationContext += `}\n`;
      }
      
      // Append to the existing prompt
      requestData.messages[0].content = requestData.messages[0].content + modificationContext;
      console.log('📝 Modification prompt prepared with STRICT layout preservation rules');
      
      // 🎨 DEBUG: Log color change detection
      const lowerPrompt = prompt.toLowerCase();
      if (lowerPrompt.includes('color') || lowerPrompt.includes('verde') || lowerPrompt.includes('green') || 
          lowerPrompt.includes('azul') || lowerPrompt.includes('blue') || lowerPrompt.includes('rojo') || 
          lowerPrompt.includes('red') || lowerPrompt.includes('morado') || lowerPrompt.includes('purple')) {
        console.log('🎨🎨🎨 COLOR CHANGE REQUEST DETECTED 🎨🎨🎨');
        console.log('🎨 User prompt:', prompt);
        console.log('🎨 Current slide index:', currentSlideIndex);
        console.log('🎨 Current slide has chartData:', !!currentSlide?.blocks?.[1]?.props?.chartData);
        if (currentSlide?.blocks?.[1]?.props?.chartData) {
          console.log('🎨 Current chartData structure:', JSON.stringify(currentSlide.blocks[1].props.chartData, null, 2));
        }
      }
    }

    console.log('Calling Claude API...');

    // Use rate-limited request
    const response = await rateLimitManager.addRequest(requestData);
    
    console.log('Claude API response received');

    // Check if response exists and has content
    if (!response || !response.content) {
      console.error('❌ Invalid API response structure:', response);
      return NextResponse.json(
        { 
          error: 'Invalid API response', 
          details: 'The AI service returned an invalid response structure.',
          receivedResponse: response
        },
        { status: 500 }
      );
    }
    
    // Log the raw response for debugging
    console.log('🚨 FULL RAW CLAUDE RESPONSE:');
    console.log('=====================================');
    console.log(response.content);
    console.log('=====================================');
    console.log('Response length:', response.content.length);
    console.log('First 500 chars:', response.content.substring(0, 500));
    console.log('Last 500 chars:', response.content.slice(-500));
    
    // 🎨 DEBUG: Check if response contains color changes
    const lowerPrompt = prompt.toLowerCase();
    if (lowerPrompt.includes('color') || lowerPrompt.includes('verde') || lowerPrompt.includes('green')) {
      console.log('🎨🎨🎨 CHECKING COLOR CHANGE RESPONSE 🎨🎨🎨');
      const hasNewColor = response.content.includes('#16A34A') || response.content.includes('#22C55E') || 
                          response.content.includes('#EF4444') || response.content.includes('#3B82F6') ||
                          response.content.includes('#8B5CF6') || response.content.includes('#F97316');
      console.log('🎨 Response contains new color hex:', hasNewColor);
      console.log('🎨 Response contains "series":', response.content.includes('"series"'));
      console.log('🎨 Response contains "chartData":', response.content.includes('"chartData"'));
    }

    // Clean and parse the response
    let cleanedText = response.content?.trim() || '';
    
    // Handle undefined or empty content
    if (!cleanedText) {
      console.error('❌ Empty or undefined response content');
      return NextResponse.json(
        { 
          error: 'Empty API response', 
          details: 'The AI service returned empty content.',
          receivedResponse: response
        },
        { status: 500 }
      );
    }
    
    // Remove any markdown code blocks
    cleanedText = cleanedText.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
    
    // Remove any leading/trailing whitespace
      cleanedText = cleanedText.trim();
      
    // Enhanced JSON cleaning for common parsing issues
    cleanedText = cleanedText
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters that cause JSON parsing errors
      .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
      .replace(/([{,]\s*)(\w+):/g, '$1"$2":') // Quote unquoted keys
      .replace(/,\s*}/g, '}') // Remove trailing commas before closing braces
      .replace(/,\s*]/g, ']') // Remove trailing commas before closing brackets
      .replace(/}\s*{/g, '},{') // Fix missing commas between objects
      .replace(/]\s*\[/g, '],[') // Fix missing commas between arrays
      .replace(/"\s*:\s*([^",\[\]{}]+)(?=[,}])/g, '": "$1"') // Quote unquoted string values
      .replace(/:\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*([,}])/g, ': "$1"$2'); // Quote unquoted identifiers
      
    // Check if JSON is truncated (common issue)
    const openBraces = (cleanedText.match(/{/g) || []).length;
    const closeBraces = (cleanedText.match(/}/g) || []).length;
    const openBrackets = (cleanedText.match(/\[/g) || []).length;
    const closeBrackets = (cleanedText.match(/]/g) || []).length;
    
    if (openBraces !== closeBraces || openBrackets !== closeBrackets) {
      console.error('❌ JSON appears to be truncated:', {
        openBraces,
        closeBraces,
        openBrackets,
        closeBrackets,
        responseLength: cleanedText.length
      });
      
      // Try to fix simple truncation by adding missing closing braces/brackets
      const missingBraces = openBraces - closeBraces;
      const missingBrackets = openBrackets - closeBrackets;
      
      for (let i = 0; i < missingBrackets; i++) {
        cleanedText += ']';
      }
      for (let i = 0; i < missingBraces; i++) {
        cleanedText += '}';
      }
      
      console.log('🔧 Attempted to fix truncated JSON by adding missing braces/brackets');
    }

    // ULTRA-ROBUST JSON PARSING WITH MULTIPLE FALLBACKS
    let presentationData: GeneratedPresentation;
    
    // Attempt 1: Direct parsing
    try {
      console.log('🔧 Attempt 1: Direct JSON parsing...');
      presentationData = JSON.parse(cleanedText);
      console.log('✅ Direct parsing successful');
    } catch (parseError1) {
      console.log('❌ Direct parsing failed, trying repair...');
      
      // Attempt 2: Aggressive repair and retry
      try {
        console.log('🔧 Attempt 2: Aggressive JSON repair...');
        
        // More aggressive cleaning
        let repairedText = cleanedText
          .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
          .replace(/([{,]\s*)(\w+):/g, '$1"$2":') // Quote unquoted keys
          .replace(/:\s*([^",\[\]{}]+)(?=[,}])/g, ': "$1"') // Quote unquoted values
          .replace(/}\s*{/g, '},{') // Fix missing commas between objects
          .replace(/]\s*\[/g, '],['); // Fix missing commas between arrays
        
        // Find the last complete slide and truncate there
        const slideMatches = [...repairedText.matchAll(/"id":\s*"slide-\d+"/g)];
        if (slideMatches.length > 0) {
          const lastSlideIndex = slideMatches[slideMatches.length - 1].index;
          const afterLastSlide = repairedText.substring(lastSlideIndex);
          const nextSlideStart = afterLastSlide.indexOf('"id": "slide-');
          
          if (nextSlideStart > 0) {
            // Truncate at the start of an incomplete slide
            repairedText = repairedText.substring(0, lastSlideIndex + nextSlideStart);
            console.log('🔧 Truncated at incomplete slide');
          }
        }
        
        // Balance braces and brackets
        const openBraces = (repairedText.match(/{/g) || []).length;
        const closeBraces = (repairedText.match(/}/g) || []).length;
        const openBrackets = (repairedText.match(/\[/g) || []).length;
        const closeBrackets = (repairedText.match(/]/g) || []).length;
        
        const missingBrackets = openBrackets - closeBrackets;
        const missingBraces = openBraces - closeBraces;
        
        for (let i = 0; i < missingBrackets; i++) repairedText += ']';
        for (let i = 0; i < missingBraces; i++) repairedText += '}';
        
        presentationData = JSON.parse(repairedText);
        console.log('✅ Repair parsing successful');
        
      } catch (parseError2) {
        console.log('❌ Repair parsing failed, trying emergency fallback...');
        
        // Attempt 3: Emergency fallback - extract what we can
        try {
          console.log('🔧 Attempt 3: Emergency extraction...');
          
          // Try to extract at least the title and first slide
          const titleMatch = cleanedText.match(/"title":\s*"([^"]+)"/);
          const title = titleMatch ? titleMatch[1] : "Generated Presentation";
          
          // Better slide extraction using bracket counting
          const slides = [];
          const slideStartRegex = /"id":\s*"slide-\d+"/g;
          let match;
          
          while ((match = slideStartRegex.exec(cleanedText)) !== null) {
            try {
              // Find the start of this slide object
              let slideStart = cleanedText.lastIndexOf('{', match.index);
              if (slideStart === -1) continue;
              
              // Count brackets to find the complete slide object
              let bracketCount = 0;
              let slideEnd = slideStart;
              
              for (let i = slideStart; i < cleanedText.length; i++) {
                if (cleanedText[i] === '{') bracketCount++;
                if (cleanedText[i] === '}') bracketCount--;
                
                if (bracketCount === 0) {
                  slideEnd = i;
                  break;
                }
              }
              
              if (bracketCount === 0) {
                const slideText = cleanedText.substring(slideStart, slideEnd + 1);
                const slideObj = JSON.parse(slideText);
                slides.push(slideObj);
                console.log(`✅ Extracted slide: ${slideObj.id}`);
              }
            } catch (e) {
              console.log('❌ Skipping malformed slide:', (e as Error).message);
            }
          }
          
          if (slides.length === 0) {
            // Ultimate fallback - create a basic slide
            slides.push({
              id: "slide-1",
              blocks: [
                { type: "BackgroundBlock", props: { color: "bg-white" } },
                { 
                  type: "Cover_ProductLayout", 
                  props: { 
                    title: title,
                    paragraph: "Content is being processed. Please try regenerating this presentation.",
                    imageUrl: "/Default-Image-2.png",
                    fontFamily: "font-helvetica-neue"
                  } 
                }
              ]
            });
          }
          
          presentationData = { title, slides };
          console.log('✅ Emergency extraction successful');
          
        } catch (parseError3) {
          console.error('❌ All parsing attempts failed');
          console.error('Parse error 1:', parseError1);
          console.error('Parse error 2:', parseError2);
          console.error('Parse error 3:', parseError3);
          console.error('Raw response (first 1000 chars):', cleanedText.substring(0, 1000));
          console.error('Raw response (last 500 chars):', cleanedText.slice(-500));
      
      return NextResponse.json(
        { 
              error: 'Critical parsing failure', 
              details: 'Unable to parse AI response after multiple attempts. The service may be experiencing issues.',
              rawResponse: cleanedText.substring(0, 500),
              userFriendly: true,
              retryAfter: 60
        },
        { status: 500 }
      );
        }
      }
    }

    // Validate the presentation structure
    // For modifications, title is optional (single slide modifications)
    const isModification = !presentationData.title && Array.isArray(presentationData.slides) && presentationData.slides.length > 0;
    const isCompletePresentation = presentationData.title && Array.isArray(presentationData.slides);
    
    if (!isModification && !isCompletePresentation) {
      console.error('Invalid presentation structure:', {
        hasTitle: !!presentationData.title,
        slidesIsArray: Array.isArray(presentationData.slides),
        slideCount: presentationData.slides?.length || 0,
        receivedData: presentationData
      });
      return NextResponse.json(
        { 
          error: 'Invalid presentation structure', 
          details: 'The AI response does not contain a valid presentation structure.',
          receivedData: presentationData
        },
        { status: 500 }
      );
    }

    console.log('Validation successful, returning presentation data');
    console.log(`📝 Response type: ${isModification ? 'Single slide modification' : 'Complete presentation'}`);
    console.log(`📊 Slide count: ${presentationData.slides?.length || 0}`);

    // Validate translation structure if this is a translation request
    if (isTranslationRequest.isTranslation && existingPresentation) {
      console.log('🔍 VALIDATING TRANSLATION STRUCTURE...');
      const structureValid = validateTranslationStructure(existingPresentation, presentationData);
      
      if (!structureValid) {
        console.log('🚨 TRANSLATION VALIDATION FAILED - Structure was modified during translation');
        return NextResponse.json(
          { 
            error: 'Translation validation failed', 
            details: 'The translation modified the presentation structure, which is not allowed. Only text content should be translated.',
            originalStructure: existingPresentation,
            translatedStructure: presentationData
          },
          { status: 400 }
        );
      }
      
      console.log('✅ TRANSLATION VALIDATION PASSED - Structure preserved correctly');
    }

    // Debug: Count TextBlock components
    const textBlockCounts = presentationData.slides.map((slide, index) => {
      const textBlocks = slide.blocks.filter(block => block.type === 'TextBlock');
      return `Slide ${index + 1}: ${textBlocks.length} TextBlock(s) found`;
    });
    console.log('🎨 DEBUG: Generated TextBlock components:');
    textBlockCounts.forEach(count => console.log(count));

    // 💳 CREDIT DEDUCTION - Deduct credits after successful API response
    console.log('🔍 CREDIT DEDUCTION CHECK:', {
      hasUser: !!user,
      userId: user?.id,
      hasUsage: !!response.usage,
      usage: response.usage
    });
    
    if (user && response.usage) {
      try {
        // Calculate actual cost from Anthropic usage INCLUDING CACHE COSTS
        const inputTokens = response.usage.input_tokens || 0;
        const outputTokens = response.usage.output_tokens || 0;
        
        // Anthropic pricing for Claude Sonnet 4.5 (claude-sonnet-4-5-20250929):
        // Input (no cache): $3.00 per 1M tokens = 300 cents per 1M tokens
        // Output: $15.00 per 1M tokens = 1500 cents per 1M tokens
        // Cache writes: $3.75 per 1M tokens = 375 cents per 1M tokens
        // Cache reads: $0.30 per 1M tokens = 30 cents per 1M tokens
        // 1 credit = $0.01 = 1 cent
        
        const cacheCreationTokens = (response.usage as any).cache_creation_input_tokens || 0;
        const cacheReadTokens = (response.usage as any).cache_read_input_tokens || 0;
        
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
          userId: user.id
        });

        // Deduct credits
        const { data: deductResult, error: deductError } = await supabase
          .rpc('deduct_credits', {
            p_user_id: user.id,
            p_credits_to_deduct: creditsToDeduct,
            p_anthropic_cost_cents: totalCostCents,
            p_presentation_id: presentationId || null,
            p_workspace: workspace || null,
            p_description: `AI generation: ${inputTokens} input + ${outputTokens} output tokens`
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

      } catch (creditErr) {
        console.error('❌ Credit deduction error (but continuing):', creditErr);
      }
    } else {
      console.log('⚠️ Skipping credit deduction:', {
        reason: !user ? 'No authenticated user' : 'No usage data from API response'
      });
    }

    return NextResponse.json(presentationData);
    }
  } catch (error: any) {
    // EMERGENCY: Handle 529 API overload immediately
    if (error instanceof Anthropic.APIError && error.status === 529) {
      console.log('🚫 EMERGENCY: Anthropic API overloaded - implementing immediate fallback');
      
      // Return a simple working presentation to prevent total failure
      const emergencyPresentation = {
        title: "Presentation Loading...",
        slides: [{
          id: "slide-1",
          blocks: [
            { type: "BackgroundBlock", props: { color: "bg-white" } },
            { 
              type: "Cover_ProductLayout", 
              props: { 
                title: "Loading...", 
                paragraph: "Please wait while we prepare your presentation. Try again in 30 seconds.",
                imageUrl: "/Default-Image-2.png",
                fontFamily: "font-helvetica-neue"
              } 
            }
          ]
        }]
      };
      
      return NextResponse.json(emergencyPresentation, { status: 200 });
    }

    // Handle other Anthropic API errors
    if (error instanceof Anthropic.APIError) {
      console.error('🚨 Anthropic API Error:', error.status, error.message);
      return NextResponse.json(
        { 
          error: 'API service temporarily unavailable', 
          details: `Service error (${error.status}): ${error.message}. Please try again in a moment.`,
          status: error.status,
          userFriendly: true,
          retryAfter: 30
        },
        { status: error.status || 500 }
      );
    }

        // Handle rate limit errors from our wrapper
        if (error.message === 'RATE_LIMIT_EXCEEDED') {
      return NextResponse.json(
            { 
              error: 'Rate limit exceeded', 
              details: 'Too many requests. Please wait a moment and try again.',
              status: 429,
              userFriendly: true,
              retryAfter: 30
            },
        { status: 429 }
      );
    }

    // Handle other errors (e.g., network issues, JSON parsing)
    console.error('Error in generate API route:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        details: error instanceof Error ? error.message : 'An unknown error occurred.' 
      },
      { status: 500 }
    );
  }
} 