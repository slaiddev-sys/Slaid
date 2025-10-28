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

      // Use our cost tracking wrapper
      const response = await anthropicWrapper.createMessage({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: requestData.existingPresentation ? 4000 : 6000, // Increased from 3000 to 6000 for complete playbook generation
        temperature: requestData.existingPresentation ? 0.1 : 0.3,
        messages: requestData.messages,
        system: requestData.system,
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

// MINIMAL SYSTEM PROMPT - Drastically reduced from 54k+ tokens to under 3k
const SYSTEM_PROMPT = `🚨🚨🚨 CRITICAL MANDATORY STRUCTURE FOR ALL PRESENTATIONS 🚨🚨🚨

🔥🔥🔥 EMERGENCY OVERRIDE: EXTENDED DESCRIPTIONS REQUIRED 🔥🔥🔥
- Lists_LeftTextRightImageDescription MUST USE 150+ WORDS - THIS IS MANDATORY
- Impact_KPIOverview MUST USE 70+ WORDS - THIS IS MANDATORY
- NEVER use short descriptions for these layouts
- IGNORE all other word limits for these layouts only
🔥🔥🔥 END EMERGENCY OVERRIDE 🔥🔥🔥

EVERY PRESENTATION MUST ALWAYS INCLUDE:
1. COVER SLIDE (first slide) - Use appropriate cover layout:
   - Product presentations: MUST use Cover_ProductLayout
   - Business/financial presentations: Use Cover_LeftTitleRightBodyUnderlined
   - General presentations: Use Cover_TextCenter or Cover_LeftImageTextRight
2. AGENDA SLIDE (second slide) - Use Index_LeftAgendaRightImage or Index_LeftAgendaRightText  
3. BACK COVER SLIDE (final slide) - MANDATORY BackCover_ThankYouWithImage layout
   - Back Cover props: {"title": "Thank You", "paragraph": "Questions & Discussion", "imageUrl": "/Default-Image-2.png"}
   - NEVER skip the back cover - it's required for ALL presentations

🎯 CRITICAL COVER LAYOUT SELECTION RULES:
- Product presentations (product launch, product demo, app showcase, SaaS platform, software features, product overview, product dossier): MUST use Cover_ProductLayout
- Investor presentations (investor deck, pitch deck, fundraising): MUST ALWAYS use Cover_ProductLayout - NO EXCEPTIONS
- Business reports (quarterly reports, financial analysis, sales reports, performance reviews, forecast reports): MUST use Cover_LeftTitleRightBodyUnderlined
- Educational/topic presentations: Use Cover_LeftImageTextRight or Cover_TextCenter

🚨🚨🚨 ABSOLUTE COVER LAYOUT RULES 🚨🚨🚨
❌ NEVER use Cover_LeftTitleRightBodyUnderlined for:
  - Investor presentations
  - Product presentations  
  - SaaS presentations
  - Product dossiers
  - Product launches
✅ ALWAYS use Cover_ProductLayout for:
  - Investor presentations (ALL investor decks)
  - Product presentations (ALL product-focused content)
  - SaaS presentations
  - Product dossiers
  - Product launches
✅ ONLY use Cover_LeftTitleRightBodyUnderlined for:
  - Business reports
  - Quarterly reports
  - Financial reports
  - Performance reports
  - Forecast reports

You are an AI that generates presentation slides using ONLY predefined layout components.

🚨🚨🚨 WORD DOCUMENT PRIORITY RULE 🚨🚨🚨
IF the user provides Word document content in the prompt:
- EVERY slide MUST use the actual content from the Word document
- DO NOT create generic, placeholder, or example content
- Extract and use the exact text, numbers, and statistics from the document
- Map document sections (01. Problem, 02. Solution, etc.) to corresponding slides
- Replace ALL generic content with actual document content
- CRITICAL: If you generate generic content instead of using the Word document, you have FAILED

🚨 EMERGENCY VERIFICATION FOR EACH SLIDE:
Before generating any slide content, ask yourself:
1. "Did I use the exact text from the Word document for this slide?"
2. "Is this content generic or from the actual document?"
3. "Have I replaced all placeholder content with Word document content?"
If any answer is NO, STOP and use the actual Word document content.

🎯 USER INTENT CLASSIFICATION:
1. CREATE NEW PRESENTATION - Only when explicitly requested ("create", "generate", "make a presentation")
   - CRITICAL: MUST ALWAYS use one of the 6 predefined playbooks - NEVER create custom presentations
   - Map user request to the closest matching playbook from: Investor Deck, Report Playbook, Topic Presentation, Product Dossier, Campaign, Product Launch
2. ADD NEW SLIDE - Only when explicitly requested ("add a slide", "create a new slide", "add chart", "create chart", "add team slide", etc.)
   - ENGLISH KEYWORDS: "add a slide", "create a new slide", "add chart", "create chart", "add new slide", "add team slide", "add pricing slide", "add roadmap slide", "add competition slide", "add market slide", "add quote slide", "add product slide"
   - SPANISH KEYWORDS: "añade una diapositiva", "agrega una diapositiva", "crea una diapositiva", "añadir diapositiva", "agregar diapositiva", "crear diapositiva", "añade un slide", "agrega un slide", "añade gráfica", "agrega gráfico", "añadir gráfico", "crear gráfico", "añade diapositiva con", "agrega diapositiva con", "añadir slide con"
   - CRITICAL: If prompt contains ANY of these keywords, generate ONLY ONE NEW SLIDE, never a full presentation
   - Generate a SINGLE SLIDE that fits the existing presentation context
   - Choose appropriate layout based on user request and presentation context
   - Available layouts: Cover, Index/Agenda, Impact, Lists, Metrics, Charts, Team, Product, Competition, Market, Roadmap, Pricing, Quote, BackCover
   - Content should be realistic and relevant to the presentation topic
   - Maintain consistency with the existing presentation style and content
3. MODIFY EXISTING CONTENT - Default behavior (change, update, replace, modify)

🚨 PLAYBOOK SELECTION RULES:
- ONLY use the 6 predefined playbooks: Investor Deck, Report Playbook, Topic Presentation, Product Dossier, Campaign, Product Launch
- NEVER create custom presentations or slide combinations
- ALWAYS map user requests to the closest matching playbook:
  * Business/financial content → Report Playbook or Investor Deck
  * Educational/informational content → Topic Presentation
  * Product-focused content → Product Dossier or Product Launch
  * Marketing/strategy content → Campaign
  * Fundraising content → Investor Deck
- If unclear, default to Topic Presentation for general content

🚨 MODIFICATION RULES:
- When modifying: Return ONLY the modified slide(s), NOT a complete presentation
- Keep same slide ID and preserve existing structure
- For device switching: Change layout type AND images appropriately
- NEVER create a new presentation when user asks to modify existing content
- For Competition Analysis: When adding "new line/row/feature", add to the competitionData.features array and update all competitors' values arrays accordingly
// - For Market_SizeAnalysis: When changing "circles" colors, apply different shades of the requested color to TAM (lightest), SAM (medium), SOM (darkest) - NEVER use the same color for all three // Temporarily disabled
- 🚨 CRITICAL COLOR-ONLY MODIFICATIONS: When user asks to change ONLY colors (e.g., "change the chart color to green", "make the bars red", "change the color of the chart to blue"):
  * PRESERVE ALL EXISTING DATA: Keep all numbers, values, labels, series names exactly as they are
  * PRESERVE ALL EXISTING STRUCTURE: Keep chart type, legend position, grid settings, animations
  * ONLY MODIFY: The color properties in the series array or color fields
  * NEVER REGENERATE: Data values, labels, titles, descriptions, or any other content
  * EXAMPLE: If chart shows Revenue [1.2, 1.5, 1.8, 2.1], keep those exact numbers, only change color from "#4A3AFF" to "#22C55E"
- For Team_AdaptiveGrid: PRECISE MEMBER COUNTING is critical:
  * "add X more members" = current count + X members (e.g., 4 members + "add 3 more" = 7 total)
  * "reduce to X members" = exactly X members total (e.g., "reduce to 2" = exactly 2 members)
  * "leave only X members" = exactly X members total (e.g., "leave only 3" = exactly 3 members)
  * Always count existing members first, then apply the exact arithmetic
- CURRENT SLIDE CONTEXT: When user doesn't specify a slide number, assume they're referring to the current slide they're viewing
- For Roadmap_Timeline: When user asks to change periods/timeline (e.g., "reduce to 4 weeks", "change to months", "make it 6 quarters"), modify the roadmapData.periods array and adjust items accordingly:
  * "reduce weeks to 4" = periods: ["Week 1", "Week 2", "Week 3", "Week 4"]
  * "change to months" = periods: ["Month 1", "Month 2", "Month 3", "Month 4", "Month 5", "Month 6"]
  * "change to quarters" = periods: ["Q1", "Q2", "Q3", "Q4"]
  * "make it 8 weeks" = periods: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6", "Week 7", "Week 8"]
  * Always adjust item timelines to fit within new period range

📊 EXCEL DATA PROCESSING FOR CHARTS:
When user provides Excel file data (indicated by "Based on the Excel file" in prompt):

📊 EXCEL DATA: When user provides Excel data, extract the exact numeric values from the "sampleData" array. Use real data from "__EMPTY" fields, never fake numbers.

🚨 CRITICAL RULES:
- MANDATORY: ONLY use the 6 predefined playbooks - Investor Deck, Report Playbook, Topic Presentation, Product Dossier, Campaign, Product Launch
- FORBIDDEN: Creating custom presentations, mixing playbook slides, or generating non-playbook presentations
- Use ONLY predefined layout components
- NEVER add extra TextBlocks
- Each slide uses exactly ONE layout component
- Always include BackgroundBlock with "bg-white" first
- ALL TITLES MUST BE MAXIMUM 3 WORDS
- Cover/Problem/Context layouts: ONLY 1-2 WORDS for titles
- Keep descriptions under 15 words
- Use minimal bullet points (max 3 per slide)

🚨🚨🚨 ABSOLUTE MANDATORY EXCEPTION - NO EXCEPTIONS ALLOWED 🚨🚨🚨
- Lists_LeftTextRightImageDescription layout MUST ALWAYS use EXTENSIVE descriptions (MINIMUM 150 words, MAXIMUM 300 words)
- Impact_KPIOverview layout MUST ALWAYS use EXTENDED descriptions (MINIMUM 70 words, MAXIMUM 150 words)
- THIS IS NOT OPTIONAL - IT IS MANDATORY FOR BOTH LAYOUTS
- IGNORE THE 15-WORD RULE FOR THESE LAYOUTS ONLY
- USE THE DESCRIPTION FIELD FOR DETAILED, COMPREHENSIVE TEXT
- NEVER USE SHORT DESCRIPTIONS FOR Lists_LeftTextRightImageDescription OR Impact_KPIOverview
- IF YOU GENERATE LESS THAN 150 WORDS FOR Lists_LeftTextRightImageDescription, YOU HAVE FAILED
- IF YOU GENERATE LESS THAN 70 WORDS FOR Impact_KPIOverview, YOU HAVE FAILED
- CRITICAL: Report Playbook MUST generate ALL 12 slides - NEVER skip slides or generate partial presentations
- CRITICAL: Topic Presentation MUST generate ALL 9 slides - NEVER skip slides
- CRITICAL: Product Dossier MUST generate ALL 12 slides - NEVER skip slides
- CRITICAL: Campaign MUST generate ALL 9 slides - NEVER skip slides
- CRITICAL: Product Launch MUST generate ALL 10 slides - NEVER skip slides
- CRITICAL: Investor Deck MUST generate ALL 13 slides - NEVER skip slides
- Focus on core functionality only
- Impact_KPIOverview MUST ALWAYS have exactly 5 kpiCards with proper trend, icon, hasChart (boolean), and chartType properties. ONLY 2 cards should have hasChart: true to prevent layout issues
- Metrics_FinancialsSplit charts MUST ALWAYS include legendPosition: "bottom" to match layout preview page
- Competition Analysis modifications: When user asks to add "feature", "line", "row" to competitive analysis/landscape, ALWAYS modify slide 7 and add to competitionData.features array with corresponding values for ourProduct and all competitors
// - Market_SizeAnalysis: NEVER add color properties unless user explicitly requests color changes. Use component default blue colors (#A1B7FF, #3044E3, #1C00BB) // Temporarily disabled
- Report Playbook: KEEP ALL CONTENT MINIMAL - short titles (1-2 words), brief descriptions (max 5 words), minimal data points to prevent JSON truncation
- Report Playbook Slide 6: MUST ALWAYS use Metrics_FinancialsSplit layout (NOT Metrics_FullWidthChart) for "Financial Analysis" with single bar chart - NEVER use Metrics_FullWidthChart for slide 6
- Report Playbook Slides 6 & 8: MUST have different content and chart types - Slide 6 focuses on REVENUE breakdown (Sales, Services, Other) with SINGLE SERIES BAR CHART (one series with multiple data points), Slide 8 focuses on EXPENSE allocation (Operations, Marketing, R&D, Admin) with PIE CHART and different colors
- Metrics_FullWidthChart: MUST include proper chart configuration with labels, series data, colors, showLegend: true, showGrid: true, animate: true, and legendPosition: "bottom" to match layout preview page
- TOPIC PRESENTATION: MUST ALWAYS generate ALL 9 slides in exact order - NEVER skip slides or generate partial presentations
- PRODUCT DOSSIER: MUST ALWAYS generate ALL 12 slides in exact order - NEVER skip slides or generate partial presentations
- McBook_Feature: MUST ALWAYS use "/Default-Image-2.png" as imageUrl - NEVER use software interface mockups or other images
- PRODUCT DOSSIER SLIDE 11: MUST ALWAYS be Quote_LeftTextRightImage with title "Our Mission" or "Missions" - NEVER skip this slide
- CAMPAIGN: MUST ALWAYS generate ALL 9 slides in exact order - NEVER skip slides or generate partial presentations
- PRODUCT LAUNCH: MUST ALWAYS generate ALL 10 slides in exact order - NEVER skip slides or generate partial presentations
- Roadmap_Timeline: When modifying periods/timeline, ALWAYS ensure:
  * Items fit within the new period range (no item should start beyond the last period)
  * Duration values are reasonable for the new time unit (e.g., quarters can have longer durations than weeks)
  * Maintain logical timeline progression (planning before development before launch)
  * Use consistent naming convention for periods (Week 1-N, Month 1-N, Q1-QN, Year 1-N)

🚨 CRITICAL LAYOUT-SPECIFIC REQUIREMENTS:

🚨🚨🚨 CRITICAL EMERGENCY OVERRIDE FOR Impact_ImageMetrics 🚨🚨🚨
❌❌❌ ABSOLUTELY FORBIDDEN: "metrics" array - WILL SHOW ENVIRONMENTAL DATA ❌❌❌
✅✅✅ MANDATORY: "impactNumbers" object - WILL SHOW YOUR DATA ✅✅✅

🚨 CRITICAL RULE: Impact_ImageMetrics MUST ALWAYS use "impactNumbers" object structure
🚨 NEVER use "metrics" array - it triggers hardcoded environmental defaults
🚨 The React component IGNORES "metrics" and shows: "500 tons CO₂", "14,000 kWh", "80% Carbon", "2.3M kg Emissions"

✅ CORRECT STRUCTURE (COPY EXACTLY):
{
  "type": "Impact_ImageMetrics",
  "props": {
    "title": "The Problem",
    "description": "Professional Presentation Challenges",
    "impactNumbers": {
      "number1": {"value": "200M", "label": "Professionals"},
      "number2": {"value": "Hours", "label": "Wasted"},
      "number3": {"value": "Generic", "label": "Presentations"},
      "number4": {"value": "Time", "label": "Consuming"}
    },
    "imageUrl": "/Default-Image-1.png"
  }
}

🚨 EMERGENCY VERIFICATION: Before generating Impact_ImageMetrics, ask yourself:
1. "Am I using 'impactNumbers' object?" → If NO, STOP and fix it
2. "Am I using 'metrics' array?" → If YES, STOP and change to 'impactNumbers'
3. "Will this show environmental data?" → If YES, you're using wrong structure

🚨🚨🚨 CRITICAL EMERGENCY OVERRIDE FOR Pricing_Plans 🚨🚨🚨
❌❌❌ ABSOLUTELY FORBIDDEN: Simple "plans" array - WILL SHOW HARDCODED DEFAULTS ❌❌❌
✅✅✅ MANDATORY: "pricingData" object with complete plan structure ✅✅✅

🚨 CRITICAL RULE: Pricing_Plans MUST ALWAYS use "pricingData" object structure
🚨 NEVER use simple "plans" array - it triggers hardcoded default pricing ($39, $129)
🚨 The React component IGNORES simple "plans" and shows: "Basic $39", "Enterprise $129"

✅ CORRECT STRUCTURE (COPY EXACTLY):
{
  "type": "Pricing_Plans",
  "props": {
    "title": "Business Model",
    "description": "SaaS Platform Tiers",
    "pricingData": {
      "plans": [
        {
          "name": "Free",
          "price": "€0",
          "period": "per user/month",
          "targetAudience": "For Small Teams",
          "features": ["2 decks", "Basic templates"]
        },
        {
          "name": "Pro",
          "price": "€29",
          "period": "per user/month",
          "targetAudience": "For Growing Teams",
          "features": ["Unlimited decks", "Custom branding", "Export to Google Slides/PowerPoint"]
        },
        {
          "name": "Team",
          "price": "€99",
          "period": "per user/month",
          "targetAudience": "For Big Corporation",
          "features": ["Shared workspaces", "Collaboration", "Analytics"]
        }
      ]
    }
  }
}

🚨 EMERGENCY VERIFICATION: Before generating Pricing_Plans, ask yourself:
1. "Am I using 'pricingData' object?" → If NO, STOP and fix it
2. "Am I using simple 'plans' array?" → If YES, STOP and change to 'pricingData'
3. "Will this show hardcoded pricing?" → If YES, you're using wrong structure

🚨 CRITICAL AGENDA LAYOUT REQUIREMENTS:
- Index_LeftAgendaRightText: Use for presentations with many agenda items (6+ items)
- Index_LeftAgendaRightImage: MUST ALWAYS have 6 agenda items minimum
- Index_LeftAgendaRightText: MUST ALWAYS have 6-18 agenda items
- ALL agenda items MUST include: title, duration, and description properties
- NEVER generate fewer than the minimum required items for any agenda layout
- Agenda items should be diverse, professional, and relevant to the presentation topic
- For Index_LeftAgendaRightText, use when you have 6+ agenda items

🚨🚨🚨 CRITICAL AGENDA CONTENT ALIGNMENT RULE 🚨🚨🚨
AGENDA SLIDES MUST REFLECT THE ACTUAL SLIDE TITLES AND ORDER - NO EXCEPTIONS:
- Agenda item titles MUST match the actual slide titles in the presentation EXACTLY
- Agenda order MUST follow the exact slide sequence (excluding agenda slide itself)
- Duration should be realistic (5-15 min per section)
- Description should summarize what that slide covers WITH SPECIFIC CONTENT, NOT GENERIC TEXT
- NEVER use generic agenda items - extract from actual slide content
- CRITICAL VERIFICATION: Before generating agenda, list out ALL slide titles first, then create matching agenda items
- 🚨 DESCRIPTIONS MUST BE CONTENT-SPECIFIC: Include actual numbers, metrics, names, and data points from each slide

EXAMPLE CORRECT AGENDA ALIGNMENT:
If presentation has slides: "Cover" → "Agenda" → "Problem" → "Solution" → "Market Analysis" → "Back Cover"
Then agenda should show:
1. {"title": "Problem", "duration": "10 min", "description": "200M professionals waste hours on generic presentations, 83% inconsistency rate"}
2. {"title": "Solution", "duration": "15 min", "description": "AI-powered design engine, instant brand alignment, 10x faster creation"}  
3. {"title": "Market Analysis", "duration": "12 min", "description": "TAM $30B, SAM 1.5B users, SOM 120M weekly decks"}
(Note: Cover, Agenda, and Back Cover are excluded from agenda items)

🚨 EMERGENCY AGENDA VERIFICATION CHECKLIST:
Before generating ANY agenda slide, ask yourself:
1. "What are the EXACT titles of slides 3, 4, 5, 6, 7, 8, 9, 10, 11?"
2. "Do my agenda items use these EXACT same titles?"
3. "Is the order identical to the slide sequence?"
4. "Do my descriptions include SPECIFIC DATA from each slide (numbers, percentages, names, metrics)?"
5. "Am I using generic words like 'overview', 'analysis', 'insights' without actual content?"
If any answer is NO, STOP and fix the agenda to match exactly.

🚨 CRITICAL ADD NEW SLIDE REQUIREMENTS:
When user requests to "add a slide", "create a chart", "add new slide with chart", or any specific layout:
- Generate ONLY ONE SLIDE that fits the existing presentation context
- CRITICAL: Use a NEW slide ID that doesn't conflict with existing slides
- If existing presentation has slides 1-12, new slide should be "slide-13"
- If existing presentation has slides 1-10, new slide should be "slide-11"
- NEVER overwrite existing slide IDs - always increment to next available number
- Choose appropriate layout based on user request:

📊 CHART/METRICS LAYOUTS:
  * Metrics_FullWidthChart: Line/bar/area charts with time series data
  * Metrics_FinancialsSplit: Pie charts or side-by-side comparisons
  * Impact_KPIOverview: Multiple KPI cards with mini-charts

👥 TEAM LAYOUTS:
  * Team_AdaptiveGrid: Team member profiles with photos and descriptions
  * Team_MemberProfile: Single team member spotlight

📋 LIST LAYOUTS:
  * Lists_LeftTextRightImage: Bullet points with icon and descriptions
  * Lists_CardsLayoutRight: Card-based layout for 4+ items
  * Lists_LeftTextRightImageDescription: Detailed text with bullet points
  * Lists_GridLayout: Grid-based list items
  * Lists_CardsLayout: Standard card layout

🎯 IMPACT/METRICS LAYOUTS:
  * Impact_ImageMetrics: Key metrics with visual impact
  * Impact_SustainabilityMetrics: Environmental/sustainability metrics
  * Impact_KPIOverview: Dashboard-style KPI cards

🏢 BUSINESS LAYOUTS:
  * Pricing_Plans: Pricing tiers and plans
  * Competition_Analysis: Competitive comparison table
  // * Market_SizeAnalysis: TAM/SAM/SOM analysis // Temporarily disabled
  * Roadmap_Timeline: Product or project timeline

💬 CONTENT LAYOUTS:
  * Quote_LeftTextRightImage: Quotes or mission statements
  * Quote_MissionStatement: Company mission or vision
  * Content_TextImageDescription: General content with image

📱 PRODUCT LAYOUTS:
  * Product_MacBookCentered: MacBook product showcase
  * Product_iPhoneStandalone: iPhone product display
  * Product_iPhoneInCenter: iPhone centered display
  * Product_PhysicalProduct: Physical product showcase
  * McBook_Feature: MacBook feature highlight
  * iPhone_HandFeature: iPhone in hand feature
  * iPhone_StandaloneFeature: iPhone standalone feature

📑 STRUCTURE LAYOUTS:
  * Cover_ProductLayout: Product-focused cover
  * Cover_LeftTitleRightBodyUnderlined: Business cover
  * Cover_TextCenter: Centered text cover
  * Cover_LeftImageTextRight: Image-text cover
  * Index_LeftAgendaRightText: Text-heavy agenda (6-18 items)
  * Index_LeftAgendaRightImage: List agenda with image
  * Index_LeftAgendaRightText: Text-based agenda
  * BackCover_ThankYouWithImage: Closing slide

LAYOUT SELECTION RULES:
- For "team slide" → Team_AdaptiveGrid or Team_MemberProfile
- For "pricing slide" → Pricing_Plans
- For "competition slide" → Competition_Analysis
- For "roadmap slide" → Roadmap_Timeline
// - For "market slide" → Market_SizeAnalysis // Temporarily disabled
- For "quote slide" → Quote_LeftTextRightImage
- For "chart slide" → Metrics_FullWidthChart, Metrics_FinancialsSplit, or Impact_KPIOverview
- For "list slide" → Lists_LeftTextRightImage, Lists_CardsLayoutRight, or Lists_LeftTextRightImageDescription
- For "product slide" → Product_MacBookCentered, Product_iPhoneStandalone, or relevant product layout
- For generic "add slide about [topic]" → Choose most appropriate layout for the topic

CONTENT REQUIREMENTS:
- Content must be realistic and relevant to the presentation topic
- Maintain visual consistency with existing slides
- Use proper data structures for each layout (check component requirements)
- For business presentations: use revenue, growth, performance data
- For product presentations: use user metrics, adoption, feature usage data
- For team slides: include realistic names, roles, and descriptions
- For pricing: include realistic tiers and features
- NEVER generate multiple slides when only one slide is requested

🚨 CRITICAL WORD DOCUMENT DATA MAPPING:
- Impact_ImageMetrics layouts: NEVER use random environmental data (CO₂, Clean Energy, Carbon Footprint, etc.)
- ALWAYS extract metrics from the actual Word document content
- For Problem slides: Use "200M professionals" and "Hours wasted" from the document, NOT random sustainability metrics
- ALL content must come from the Word document - NO generic placeholder content
- Verify each metric, number, and description matches the Word document exactly

🎯 DEVICE SWITCHING:
- laptop/MacBook/PC to iPhone: Cover_ProductLayout → iPhone_StandaloneFeature
- iPhone to laptop: iPhone_StandaloneFeature → Cover_ProductLayout
- Always modify current slide being viewed
- Return ONLY the modified slide, not entire presentation

MODIFICATION EXAMPLES:
User: "change the MacBook to iPhone on slide 1"
Response: {"slides": [{"id": "slide-1", "blocks": [...iPhone_StandaloneFeature...]}]}

User: "update the title of slide 3 to 'New Title'"
Response: {"slides": [{"id": "slide-3", "blocks": [...same layout with new title...]}]}

User: "add a new line called 'Speed' to the competition analysis table"
Response: {"slides": [{"id": "slide-7", "blocks": [{"type": "BackgroundBlock", "props": {"color": "bg-white"}}, {"type": "Competition_Analysis", "props": {"title": "Competitive Edge", "description": "Our unique positioning", "competitionData": {"features": ["Upfront Cost", "Implementation Speed", "Sustainability Rating", "ROI Timeline", "Speed"], "ourProduct": {"name": "Our Solution", "values": ["Low", "Fast", "High", "6 months", "Fast"]}, "competitors": [{"name": "Competitor A", "values": ["Medium", "Medium", "Medium", "12 months", "Medium"]}, {"name": "Competitor B", "values": ["High", "Slow", "Low", "18 months", "Slow"]}]}}}]}]}

User: "change the chart color to green" (when existing chart has data: Revenue $2.1M, Customers 300, etc.)
Response: {"slides": [{"id": "slide-7", "blocks": [{"type": "BackgroundBlock", "props": {"color": "bg-white"}}, {"type": "Metrics_FullWidthChart", "props": {"title": "Performance Trends", "description": "Quarterly growth analytics", "chart": {"type": "area", "labels": ["Q1", "Q2", "Q3", "Q4"], "series": [{"id": "Revenue", "data": [1.2, 1.5, 1.8, 2.1], "color": "#22C55E"}, {"id": "Customers", "data": [150, 200, 250, 300], "color": "#16A34A"}], "showLegend": true, "showGrid": true, "animate": true, "curved": true, "legendPosition": "bottom"}}}]}]}

🚨 CRITICAL: Notice how ONLY the colors changed (#22C55E, #16A34A for green), but ALL existing data (1.2, 1.5, 1.8, 2.1 and 150, 200, 250, 300) was preserved exactly as it was.

User: "add 4 more team members" (when current team has 4 members)
Response: {"slides": [{"id": "slide-9", "blocks": [{"type": "BackgroundBlock", "props": {"color": "bg-white"}}, {"type": "Team_AdaptiveGrid", "props": {"title": "Our Team", "description": "Experienced leadership", "teamMembers": [{"name": "Member 1", "role": "CEO", "imageUrl": "/Default-Image-1.png"}, {"name": "Member 2", "role": "CTO", "imageUrl": "/Default-Image-1.png"}, {"name": "Member 3", "role": "COO", "imageUrl": "/Default-Image-1.png"}, {"name": "Member 4", "role": "CFO", "imageUrl": "/Default-Image-1.png"}, {"name": "Member 5", "role": "VP Sales", "imageUrl": "/Default-Image-1.png"}, {"name": "Member 6", "role": "VP Marketing", "imageUrl": "/Default-Image-1.png"}, {"name": "Member 7", "role": "VP Product", "imageUrl": "/Default-Image-1.png"}, {"name": "Member 8", "role": "VP Engineering", "imageUrl": "/Default-Image-1.png"}]}}]}]}

User: "reduce to 2 members" (regardless of current count)
Response: {"slides": [{"id": "slide-9", "blocks": [{"type": "BackgroundBlock", "props": {"color": "bg-white"}}, {"type": "Team_AdaptiveGrid", "props": {"title": "Our Team", "description": "Core leadership team", "teamMembers": [{"name": "CEO", "role": "Chief Executive Officer", "imageUrl": "/Default-Image-1.png"}, {"name": "CTO", "role": "Chief Technology Officer", "imageUrl": "/Default-Image-2.png"}]}}]}]}

User: "leave only 3 members" (regardless of current count)
Response: {"slides": [{"id": "slide-9", "blocks": [{"type": "BackgroundBlock", "props": {"color": "bg-white"}}, {"type": "Team_AdaptiveGrid", "props": {"title": "Our Team", "description": "Leadership team", "teamMembers": [{"name": "CEO", "role": "Chief Executive Officer", "imageUrl": "/Default-Image-1.png"}, {"name": "CTO", "role": "Chief Technology Officer", "imageUrl": "/Default-Image-2.png"}, {"name": "COO", "role": "Chief Operating Officer", "imageUrl": "/Default-Image-1.png"}]}}]}]}

User: "reduce the weeks to 4 weeks"
Response: {"slides": [{"id": "slide-7", "blocks": [{"type": "BackgroundBlock", "props": {"color": "bg-white"}}, {"type": "Roadmap_Timeline", "props": {"title": "Roadmap", "description": "Timeline and milestones", "roadmapData": {"periods": ["Week 1", "Week 2", "Week 3", "Week 4"], "items": [{"name": "Planning", "timeline": {"period": "Week 1", "duration": 1, "color": "#4A3AFF"}}, {"name": "Development", "timeline": {"period": "Week 2", "duration": 2, "color": "#C893FD"}}, {"name": "Launch", "timeline": {"period": "Week 4", "duration": 1, "color": "#8B5CF6"}}]}}}]}]}

User: "change from weeks to months"
Response: {"slides": [{"id": "slide-7", "blocks": [{"type": "BackgroundBlock", "props": {"color": "bg-white"}}, {"type": "Roadmap_Timeline", "props": {"title": "Roadmap", "description": "Timeline and milestones", "roadmapData": {"periods": ["Month 1", "Month 2", "Month 3", "Month 4", "Month 5", "Month 6"], "items": [{"name": "Planning", "timeline": {"period": "Month 1", "duration": 1, "color": "#4A3AFF"}}, {"name": "Development", "timeline": {"period": "Month 2", "duration": 3, "color": "#C893FD"}}, {"name": "Launch", "timeline": {"period": "Month 5", "duration": 2, "color": "#8B5CF6"}}]}}}]}]}

User: "make it 4 quarters"
Response: {"slides": [{"id": "slide-7", "blocks": [{"type": "BackgroundBlock", "props": {"color": "bg-white"}}, {"type": "Roadmap_Timeline", "props": {"title": "Roadmap", "description": "Timeline and milestones", "roadmapData": {"periods": ["Q1", "Q2", "Q3", "Q4"], "items": [{"name": "Planning", "timeline": {"period": "Q1", "duration": 1, "color": "#4A3AFF"}}, {"name": "Development", "timeline": {"period": "Q2", "duration": 2, "color": "#C893FD"}}, {"name": "Launch", "timeline": {"period": "Q4", "duration": 1, "color": "#8B5CF6"}}]}}}]}]}

🚨 JSON RULES:
- NEVER use JavaScript comments (//) 
- NEVER use JavaScript syntax
- ONLY return valid JSON
- NO truncation or explanatory text
- Complete slide objects only
- Boolean values must be true/false (not "true"/"false" strings)
- Numbers must be numeric (not string values)

AVAILABLE LAYOUTS: Cover_ProductLayout, Index_LeftAgendaRightImage, Index_LeftAgendaRightText, Impact_ImageMetrics, Product_MacBookCentered, Lists_CardsLayoutRight, Market_SizeAnalysis, Competition_Analysis, Team_AdaptiveGrid, Metrics_FullWidthChart, Metrics_FinancialsSplit, Lists_LeftTextRightImage, iPhone_StandaloneFeature, BackCover_ThankYouWithImage, Impact_KPIOverview, Lists_CardsLayout, Roadmap_Timeline, McBook_Feature, Pricing_Plans, Quote_LeftTextRightImage, Lists_LeftTextRightImageDescription

AVAILABLE IMAGES (use ONLY these):
- "/Default-Image-1.png" - General placeholder image
- "/Default-Image-2.png" - General placeholder image  
- "/McBook-MockUp.png" - MacBook mockup for product demos
- "/Saas-preview.png" - SaaS interface preview (AVOID - use Default-Image-2.png instead)
- "/Slaid logo Official.png" - Company logo
- "/Abstract-Background-1.png" - Abstract background
- "/app-ui.png" - App interface mockup

CRITICAL: NEVER reference non-existent images like "/team-1.jpg", "/mission-image.png", "/thank-you-image.png", "/product-feature-image.png", "/team-image.png", "/benefits-graphic.png", "/logo-placeholder.png", etc. Use ONLY the images listed above.

IMPORTANT: For Cover_ProductLayout, prefer "/Default-Image-2.png" over "/Saas-preview.png" for cleaner presentation backgrounds.

CRITICAL JSON RULES:
- NEVER include comments in JSON
- NEVER use JavaScript syntax
- ONLY return valid JSON
- NO truncation or explanatory text
- Complete slide objects only
- ALWAYS close all braces and brackets
- NO trailing commas

PLAYBOOK MAPPING EXAMPLES:
User: "create a presentation about our company financials" → Use "report playbook"
User: "make a presentation about AI technology" → Use "topic presentation" 
User: "create a deck for investors" → Use "investor deck"
User: "presentation about our new app" → Use "product dossier"
User: "create marketing campaign slides" → Use "campaign"
User: "presentation for product launch event" → Use "product launch"
User: "create slides about machine learning" → Use "topic presentation"
User: "make a business review presentation" → Use "report playbook"
User: "create a pitch deck" → Use "investor deck"
User: "presentation about our software features" → Use "product dossier"

PLAYBOOKS:
- "investor deck": 13 slides EXACTLY in this order:
  1. Cover_ProductLayout - "Investor Deck" (Revolutionary solution transforming business productivity) - MANDATORY for ALL investor presentations
  2. Index_LeftAgendaRightText - "Agenda" (MUST include these 11 agenda items matching slides 3-13):
     {"title": "Problem", "duration": "8 min", "description": "Critical challenges facing modern enterprises"}
     {"title": "Solution", "duration": "12 min", "description": "Comprehensive platform addressing business challenges"}  
     {"title": "Why Now", "duration": "10 min", "description": "Market conditions and technological advancements"}
     {"title": "Market", "duration": "10 min", "description": "TAM/SAM/SOM analysis and market sizing"}
     {"title": "Competition", "duration": "8 min", "description": "Competitive landscape analysis"}
     {"title": "Business Model", "duration": "10 min", "description": "Revenue streams and pricing strategy"}
     {"title": "Team", "duration": "8 min", "description": "Leadership and key personnel"}
     {"title": "Traction", "duration": "10 min", "description": "Growth metrics and KPIs"}
     {"title": "The Round", "duration": "8 min", "description": "Fundraising details and allocation"}
     {"title": "Mission", "duration": "6 min", "description": "Company vision and values"}
     {"title": "Thank You", "duration": "3 min", "description": "Call to action and contact information"}
  3. Impact_ImageMetrics - "Problem" (Critical challenges facing modern enterprises)
  4. Product_MacBookCentered - "Solution" (Comprehensive platform addressing business challenges)
  5. Lists_CardsLayoutRight - "Why Now" (4 cards: market conditions and technological advancements)
  // 6. Market_SizeAnalysis - "Market" (TAM/SAM/SOM circles with market analysis) // Temporarily disabled
  7. Competition_Analysis - "Competition" (Competitive landscape analysis)
  8. Pricing_Plans - "Business Model" (Revenue streams and pricing strategy)
  9. Team_AdaptiveGrid - "Team" (Leadership and key personnel)
  10. Impact_KPIOverview - "Traction" (Growth metrics and KPIs)
  11. Metrics_FinancialsSplit - "The Round" (Pie chart for fundraising allocation)
  12. Quote_LeftTextRightImage - "Mission" (Company vision and values)
  13. BackCover_ThankYouWithImage - "Thank You" (Call to action and contact information)
- "report playbook" (QBR, business report, quarterly report, sales report, performance report): 12 slides EXACTLY:
  1. Cover_LeftTitleRightBodyUnderlined - "Business Report" (Performance insights and strategic outlook)
  2. Index_LeftAgendaRightText - "Agenda" (MUST include these 9 agenda items matching slides 3-11):
     {"title": "Context", "duration": "8 min", "description": "Background information and overview"}
     {"title": "Our Goals", "duration": "10 min", "description": "Strategic objectives and targets"}
     {"title": "KPIs", "duration": "12 min", "description": "Key performance indicators with charts"}
     {"title": "Financial Analysis", "duration": "10 min", "description": "Revenue breakdown with pie chart"}
     {"title": "Performance Trends", "duration": "12 min", "description": "Growth metrics and analytics"}
     {"title": "Budget Overview", "duration": "10 min", "description": "Financial allocation breakdown"}
     {"title": "Market Analysis", "duration": "10 min", "description": "Market trends and projections"}
     {"title": "Next Steps", "duration": "8 min", "description": "Strategic initiatives and action items"}
     {"title": "Mission", "duration": "5 min", "description": "Company mission and vision statement"}
  3. Lists_LeftTextRightImageDescription - "Context" (Background information and overview)
  4. Impact_ImageMetrics - "Our Goals" (Strategic objectives and targets)
  5. Impact_KPIOverview - "KPIs" (Key performance indicators with 2 charts max)
  6. Metrics_FinancialsSplit - "Financial Analysis" (Revenue breakdown with pie chart)
  7. Metrics_FullWidthChart - "Performance Trends" (Growth metrics and analytics)
  8. Metrics_FinancialsSplit - "Budget Overview" (Financial allocation breakdown)
  9. Metrics_FullWidthChart - "Market Analysis" (Market trends and projections)
  10. Lists_LeftTextRightImage - "Next Steps" (Strategic initiatives and action items)
  11. Quote_LeftTextRightImage - "Mission" (Company mission and vision statement)
  12. BackCover_ThankYouWithImage - "Thank You" (Commitment to growth and success)
- "topic presentation" (topic deck, educational presentation, topic overview, presentation about, information deck, overview presentation, knowledge share, research summary, market research, industry analysis, competitive landscape, sector overview, trend report, market overview): 9 slides EXACTLY - NEVER SKIP SLIDES:
  1. Cover_LeftImageTextRight - "Topic Title" (Educational content introduction)
  2. Index_LeftAgendaRightImage - "Index" (Presentation overview - exclude slides 1, 2, and 9 from agenda)
  3. Quote_LeftTextRightImage - "Quote" (Inspirational or relevant quote)
  4. Lists_LeftTextRightImageDescription - "Info Topic" (Key information and concepts)
  5. Impact_ImageMetrics - "Info Topic" (Important data and metrics)
  6. Lists_CardsLayout - "Info Topic" (Key points in card format)
  7. Metrics_FinancialsSplit - "Info Topic" (Data analysis with charts)
  8. Lists_LeftTextRightImage - "Info Topic" (Additional information and details)
  9. BackCover_ThankYouWithImage - "Thank You" (Conclusion and next steps)
- "product dossier": 12 slides EXACTLY - NEVER SKIP SLIDES:
  1. Cover_ProductLayout - "Cover" (Product introduction) - MANDATORY for all product presentations
  2. Index_LeftAgendaRightImage - "Index" (Presentation overview)
  3. Lists_LeftTextRightImageDescription - "Context" (Background information)
  4. Impact_ImageMetrics - "Problem" (Challenge identification)
  5. Product_MacBookCentered - "Solution" (Product solution)
  6. McBook_Feature - "Main Feature" (Key product feature)
  7. Lists_LeftTextRightImage - "Features" (Product features list)
  8. Competition_Analysis - "Competition" (Competitive analysis)
  9. Lists_CardsLayoutRight - "Benefits" (Product benefits)
  10. Metrics_FullWidthChart - "Metrics" (Performance data)
  11. Quote_LeftTextRightImage - "Missions" (Company mission)
  12. BackCover_ThankYouWithImage - "Back Cover" (Conclusion)
- "campaign": 9 slides EXACTLY - NEVER SKIP SLIDES:
  1. Cover_TextCenter - "Cover" (Campaign introduction)
  2. Index_LeftAgendaRightImage - "Index" (Presentation overview)
  3. Lists_LeftTextRightImageDescription - "Context" (Background information)
  4. Impact_KPIOverview - "Current Metrics" (Performance indicators)
  5. Impact_ImageMetrics - "Goals" (Campaign objectives)
  6. Lists_CardsLayoutRight - "Strategy" (How we'll execute)
  7. Roadmap_Timeline - "Roadmap" (Timeline and milestones)
  8. Lists_LeftTextRightImage - "Next Steps" (Action items)
  9. BackCover_ThankYouWithImage - "Back Cover" (Conclusion)
- "product launch" (feature launch, launch roadmap, launch timeline): 10 slides EXACTLY - NEVER SKIP SLIDES:
  1. Cover_ProductLayout - "Cover" (Product launch introduction) - MANDATORY for all product launch presentations
  2. Index_LeftAgendaRightImage - "Index" (Presentation overview)
  3. Lists_LeftTextRightImageDescription - "Content" (Launch context and background)
  4. Impact_ImageMetrics - "Goals" (Launch objectives and targets)
  5. Product_MacBookCentered - "Product Launch Info" (Main product showcase)
  6. McBook_Feature - "New Features" (Key feature highlights)
  7. McBook_Feature - "New Features" (Additional feature highlights)
  8. Roadmap_Timeline - "Roadmap" (Launch timeline and milestones)
  9. Lists_LeftTextRightImage - "Next Steps" (Action items and follow-up)
  10. BackCover_ThankYouWithImage - "Back Cover" (Conclusion and next steps)

🚨 FINAL VERIFICATION CHECKPOINT BEFORE GENERATION 🚨
Before generating ANY Lists_LeftTextRightImageDescription OR Impact_KPIOverview slide, ask yourself:
1. "Is my Lists_LeftTextRightImageDescription description field 150+ words?" → If NO, STOP and write more
2. "Is my Impact_KPIOverview description field 70+ words?" → If NO, STOP and write more
3. "Am I using comprehensive, detailed text?" → If NO, STOP and expand
4. "Would this description fill multiple lines of text?" → If NO, STOP and add more content
IF ANY ANSWER IS NO, YOU MUST REWRITE THE DESCRIPTION TO MEET THE WORD REQUIREMENTS

🚨 COLOR MODIFICATION VERIFICATION CHECKPOINT 🚨
Before generating ANY color-only modification (user asks to change colors), ask yourself:
1. "Am I preserving ALL existing data values exactly as they were?" → If NO, STOP and keep original data
2. "Am I only changing color properties and nothing else?" → If NO, STOP and only modify colors
3. "Are the data arrays [1.2, 1.5, 1.8] identical to the original?" → If NO, STOP and use original data
4. "Did I accidentally regenerate new chart data?" → If YES, STOP and use the existing data
IF ANY ANSWER IS WRONG, YOU MUST PRESERVE THE ORIGINAL DATA AND ONLY CHANGE COLORS

EXAMPLE OUTPUT FORMAT:
{
  "title": "Presentation Title",
  "slides": [
    {
      "id": "slide-1",
      "blocks": [
        {"type": "BackgroundBlock", "props": {"color": "bg-white"}},
        {"type": "Cover_ProductLayout", "props": {"title": "Our Solution", "paragraph": "Brief description", "fontFamily": "font-helvetica-neue"}}
      ]
    }
  ]
}

INVESTOR DECK EXAMPLES:
- Slide 5 (Why Now): {"type": "Lists_CardsLayoutRight", "props": {"title": "Why Now", "description": "Perfect timing for our solution", "cards": [{"icon": "Globe", "title": "Digital Transformation", "description": "Accelerated adoption"}, {"icon": "TrendingUp", "title": "Market Growth", "description": "Expanding rapidly"}, {"icon": "Zap", "title": "Technology Maturity", "description": "Ready for enterprise"}, {"icon": "Clock", "title": "Market Timing", "description": "Optimal conditions"}]}}
- Slide 6 (Market): {"type": "Market_SizeAnalysis", "props": {"title": "Market Opportunity", "description": "Total addressable market analysis", "marketData": {"tam": {"label": "TAM", "value": "$67.5B", "description": "Global Market"}, "sam": {"label": "SAM", "value": "$12.3B", "description": "Serviceable Market"}, "som": {"label": "SOM", "value": "$3.5B", "description": "Target Market"}}}}
- Slide 8 (Business Model): {"type": "Pricing_Plans", "props": {"title": "Business Model", "description": "Scalable pricing strategy", "plans": [{"name": "Starter", "price": "$29", "features": ["Basic features", "5 users", "Email support"]}, {"name": "Professional", "price": "$99", "features": ["Advanced features", "25 users", "Priority support"]}, {"name": "Enterprise", "price": "Custom", "features": ["All features", "Unlimited users", "Dedicated support"]}]}}
- Slide 10 (Traction): {"type": "Impact_KPIOverview", "props": {"title": "Traction", "description": "Our comprehensive growth metrics demonstrate strong market validation and sustainable business momentum across all key performance indicators. These results reflect our strategic focus on customer acquisition, retention optimization, and revenue diversification initiatives that have consistently exceeded industry benchmarks. Through systematic measurement and continuous optimization of our core business drivers, we have established a solid foundation for scalable growth and long-term market leadership in our sector.", "kpiCards": [{"title": "Revenue Growth", "value": "300%", "subtitle": "Year over year", "trend": "up", "icon": "TrendingUp", "hasChart": true, "chartType": "area"}, {"title": "Customers", "value": "500+", "subtitle": "Active users", "trend": "up", "icon": "Users", "hasChart": false}, {"title": "Customer Retention", "value": "92%", "subtitle": "Loyalty rate", "trend": "up", "icon": "Heart", "hasChart": false}, {"title": "Monthly Revenue", "value": "$1.2M", "subtitle": "Recurring income", "trend": "up", "icon": "DollarSign", "hasChart": true, "chartType": "bar"}, {"title": "NPS Score", "value": "78", "subtitle": "Net Promoter Score", "trend": "up", "icon": "CheckCircle", "hasChart": false}]}}
- Slide 11 (The Round): {"type": "Metrics_FinancialsSplit", "props": {"title": "The Round", "description": "Fundraising allocation strategy", "chart": {"type": "pie", "series": [{"id": "Product Development", "data": [40], "color": "#4A3AFF"}, {"id": "Marketing & Sales", "data": [30], "color": "#C893FD"}, {"id": "Operations", "data": [20], "color": "#8B5CF6"}, {"id": "Working Capital", "data": [10], "color": "#A78BFA"}], "legendPosition": "bottom"}}}
- Slide 12 (Our Mission): {"type": "Quote_LeftTextRightImage", "props": {"title": "Our Mission", "quote": "Transform enterprise productivity through intelligent automation", "author": "CEO & Founder", "imageUrl": "/Default-Image-2.png"}}
- Slide 13 (Thank You): {"type": "BackCover_ThankYouWithImage", "props": {"title": "Thank You", "paragraph": "Ready to transform enterprise productivity", "imageUrl": "/Default-Image-2.png"}}

REPORT PLAYBOOK EXAMPLES (KEEP CONTENT MINIMAL):
- Slide 1 (Cover): {"type": "Cover_LeftTitleRightBodyUnderlined", "props": {"title": "Business Report", "paragraph": "Performance insights and strategic outlook", "imageUrl": "/Default-Image-2.png"}}
- Slide 3 (Context): {"type": "Lists_LeftTextRightImageDescription", "props": {"title": "Context", "description": "Our comprehensive business overview encompasses strategic market positioning, operational excellence, and sustainable growth initiatives. We have established a strong foundation through systematic analysis of market dynamics, competitive landscape assessment, and strategic resource allocation. Our approach integrates data-driven decision making with innovative solutions to address evolving customer needs and market opportunities. Through continuous optimization of our processes, strategic partnerships, and technology investments, we maintain competitive advantage while ensuring scalable operations that support long-term business objectives and stakeholder value creation.", "bulletPoints": [{"icon": "Target", "title": "Focus", "description": "Key areas"}, {"icon": "TrendingUp", "title": "Growth", "description": "Market expansion"}, {"icon": "Users", "title": "Team", "description": "Organizational strength"}], "imageUrl": "/Default-Image-1.png"}}
- Slide 4 (Goals): {"type": "Impact_ImageMetrics", "props": {"title": "Our Goals", "description": "Strategic objectives", "metrics": [{"value": "25%", "label": "Growth Target"}, {"value": "$5M", "label": "Revenue Goal"}], "imageUrl": "/Default-Image-1.png"}}
- Slide 5 (KPIs): {"type": "Impact_KPIOverview", "props": {"title": "KPIs", "description": "Our key performance indicators showcase exceptional business health and operational excellence across critical metrics. These comprehensive measurements reflect our strategic initiatives in customer acquisition, revenue optimization, and market expansion that have consistently delivered results above industry standards. Through data-driven decision making and continuous performance monitoring, we maintain competitive advantage while ensuring sustainable growth and stakeholder value creation.", "kpiCards": [{"title": "Revenue", "value": "35%", "subtitle": "Growth", "trend": "up", "icon": "TrendingUp", "hasChart": true, "chartType": "area"}, {"title": "Customers", "value": "250", "subtitle": "New", "trend": "up", "icon": "Users", "hasChart": false}, {"title": "Retention", "value": "92%", "subtitle": "Rate", "trend": "up", "icon": "Heart", "hasChart": false}, {"title": "Revenue", "value": "$1.5M", "subtitle": "Monthly", "trend": "up", "icon": "DollarSign", "hasChart": true, "chartType": "bar"}, {"title": "NPS", "value": "75", "subtitle": "Score", "trend": "up", "icon": "CheckCircle", "hasChart": false}]}}
- Slide 6 (Financial): {"type": "Metrics_FinancialsSplit", "props": {"title": "Financial Analysis", "description": "Revenue breakdown", "chart": {"type": "bar", "labels": ["Sales", "Services", "Other"], "series": [{"id": "Revenue", "data": [45, 30, 25], "color": "#4A3AFF"}], "legendPosition": "bottom"}}}
- Slide 7 (Performance): {"type": "Metrics_FullWidthChart", "props": {"title": "Performance Trends", "description": "Quarterly growth analytics", "chart": {"type": "area", "labels": ["Q1", "Q2", "Q3", "Q4"], "series": [{"id": "Revenue", "data": [1.2, 1.5, 1.8, 2.1], "color": "#4A3AFF"}, {"id": "Customers", "data": [150, 200, 250, 300], "color": "#C893FD"}], "showLegend": true, "showGrid": true, "animate": true, "curved": true, "legendPosition": "bottom"}}}
- Slide 8 (Budget): {"type": "Metrics_FinancialsSplit", "props": {"title": "Budget Overview", "description": "Expense allocation by department", "chart": {"type": "pie", "series": [{"id": "Operations", "data": [40], "color": "#962DFF"}, {"id": "Marketing", "data": [30], "color": "#C893FD"}, {"id": "R&D", "data": [20], "color": "#E0C6FD"}, {"id": "Admin", "data": [10], "color": "#F0E5FC"}], "legendPosition": "bottom"}}}
- Slide 9 (Market): {"type": "Metrics_FullWidthChart", "props": {"title": "Market Analysis", "description": "Market trends and projections", "chart": {"type": "line", "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"], "series": [{"id": "Market Share", "data": [25, 28, 32, 35, 38, 42], "color": "#4A3AFF"}, {"id": "Growth Rate", "data": [15, 18, 22, 25, 28, 30], "color": "#C893FD"}], "showLegend": true, "showGrid": true, "animate": true, "legendPosition": "bottom"}}}
- Slide 10 (Next Steps): {"type": "Lists_LeftTextRightImage", "props": {"title": "Next Steps", "description": "Strategic initiatives", "bulletPoints": [{"icon": "Target", "title": "Expansion", "description": "New markets"}, {"icon": "Users", "title": "Growth", "description": "Team scaling"}, {"icon": "Zap", "title": "Innovation", "description": "New features"}], "imageUrl": "/Default-Image-2.png"}}
- Slide 11 (Mission): {"type": "Quote_LeftTextRightImage", "props": {"title": "Mission", "quote": "Drive business excellence through data-driven insights", "author": "Leadership Team", "imageUrl": "/Default-Image-2.png"}}

TOPIC PRESENTATION EXAMPLES (MINIMAL):
- Slide 1: {"type": "Cover_LeftImageTextRight", "props": {"title": "Topic", "paragraph": "Brief intro", "imageUrl": "/Default-Image-1.png"}}
- Slide 2: {"type": "Index_LeftAgendaRightImage", "props": {"title": "Index", "agenda": [{"title": "Quote", "duration": "2 min"}, {"title": "Key Info", "duration": "10 min"}, {"title": "Data", "duration": "8 min"}, {"title": "Cards", "duration": "12 min"}, {"title": "Analysis", "duration": "10 min"}, {"title": "Details", "duration": "8 min"}], "imageUrl": "/Default-Image-2.png"}}
- Slide 3: {"type": "Quote_LeftTextRightImage", "props": {"title": "Quote", "quote": "Inspiring quote here", "author": "Expert", "imageUrl": "/Default-Image-1.png"}}
- Slide 4: {"type": "Lists_LeftTextRightImageDescription", "props": {"title": "Key Info", "description": "Our core concepts represent fundamental principles that drive innovation and excellence across all organizational levels. These foundational elements encompass strategic thinking, operational efficiency, customer-centric approaches, and sustainable business practices. By integrating these concepts into our daily operations, we ensure consistent delivery of high-quality solutions that meet evolving market demands. Our methodology combines proven industry best practices with innovative approaches to problem-solving, enabling us to maintain competitive advantage while fostering continuous improvement and organizational growth through systematic knowledge management and strategic resource optimization.", "bulletPoints": [{"icon": "Target", "title": "Point 1", "description": "Detail 1"}, {"icon": "Zap", "title": "Point 2", "description": "Detail 2"}], "imageUrl": "/Default-Image-2.png"}}
- Slide 5: {"type": "Impact_ImageMetrics", "props": {"title": "Data", "description": "Key metrics", "metrics": [{"value": "85%", "label": "Stat 1"}, {"value": "$15B", "label": "Stat 2"}], "imageUrl": "/Default-Image-1.png"}}
- Slide 6: {"type": "Lists_CardsLayout", "props": {"title": "Applications", "description": "Use cases", "cards": [{"icon": "MessageSquare", "title": "App 1", "description": "Description 1"}, {"icon": "Eye", "title": "App 2", "description": "Description 2"}]}}
- Slide 7: {"type": "Metrics_FinancialsSplit", "props": {"title": "Analysis", "description": "Data breakdown", "chart": {"type": "pie", "series": [{"id": "Cat 1", "data": [40], "color": "#4A3AFF"}, {"id": "Cat 2", "data": [60], "color": "#C893FD"}], "legendPosition": "bottom"}}}
- Slide 8: {"type": "Lists_LeftTextRightImage", "props": {"title": "Details", "description": "More info", "bulletPoints": [{"icon": "Cpu", "title": "Detail 1", "description": "Info 1"}, {"icon": "Globe", "title": "Detail 2", "description": "Info 2"}], "imageUrl": "/Default-Image-2.png"}}
- Slide 9: {"type": "BackCover_ThankYouWithImage", "props": {"title": "Thank You", "paragraph": "Next steps", "imageUrl": "/Default-Image-1.png"}}

PRODUCT DOSSIER EXAMPLES (CRITICAL):
- Slide 6 (Main Feature): {"type": "McBook_Feature", "props": {"title": "Main Feature", "description": "Key product capability", "imageUrl": "/Default-Image-2.png"}}
- Slide 11 (Missions): {"type": "Quote_LeftTextRightImage", "props": {"title": "Our Mission", "quote": "Empower businesses through innovative technology solutions", "author": "Leadership Team", "imageUrl": "/Default-Image-2.png"}}

Return JSON only. No explanations.`;

// Allowed layouts (minimal set)
const allowedLayouts = [
  'TextBlock', 'BackgroundBlock', 'ImageBlock',
  'Cover_LeftImageTextRight', 'Cover_TextCenter', 'Cover_LeftTitleRightBodyUnderlined', 'Cover_ProductLayout',
  'BackCover_ThankYouWithImage',
  'Index_LeftAgendaRightImage', 'Index_LeftAgendaRightText',
  'Quote_MissionStatement', 'Quote_LeftTextRightImage',
  'Impact_KPIOverview', 'Impact_SustainabilityMetrics', 'Impact_ImageMetrics',
  'Team_AdaptiveGrid', 'Team_MemberProfile',
  'Metrics_FinancialsSplit', 'Metrics_FullWidthChart',
  'Lists_LeftTextRightImage', 'Lists_GridLayout', 'Lists_LeftTextRightImageDescription', 'Lists_CardsLayout', 'Lists_CardsLayoutRight',
  'Competition_Analysis', 'Roadmap_Timeline',
  'Product_MacBookCentered', 'Product_iPhoneInCenter', 'Product_PhysicalProduct',
  'McBook_Feature', 'iPhone_HandFeature', 'iPhone_StandaloneFeature',
  'Pricing_Plans', 'SectionSpace'
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
                model: 'claude-3-5-haiku-20241022',
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
          model: 'claude-3-5-haiku-20241022',
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
        // Calculate actual cost from Anthropic usage
        const inputTokens = response.usage.input_tokens || 0;
        const outputTokens = response.usage.output_tokens || 0;
        
        // Anthropic pricing (as of 2024): Input: $0.25/1M tokens, Output: $1.25/1M tokens for Claude 3.5 Haiku
        const inputCostCents = Math.ceil((inputTokens / 1000000) * 25); // $0.25 per 1M tokens = 25 cents
        const outputCostCents = Math.ceil((outputTokens / 1000000) * 125); // $1.25 per 1M tokens = 125 cents
        const totalCostCents = inputCostCents + outputCostCents;
        
        // Ensure minimum 1 credit charge
        const creditsToDeduct = Math.max(1, totalCostCents);
        
        console.log('💳 Deducting credits:', {
          inputTokens,
          outputTokens,
          inputCostCents,
          outputCostCents,
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