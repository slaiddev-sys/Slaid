import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import crypto from 'crypto';
import { anthropicWrapper } from '../../../utils/anthropicWrapper';

// Initialize Anthropic client (keeping for backward compatibility)
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Simple in-memory cache for responses
const responseCache = new Map<string, { response: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

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
      existingPresentation: !!requestData.existingPresentation
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
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
      // Determine user action and kind based on request data
      const kind = requestData.existingPresentation ? 'modify' : 'new';
      const userAction = requestData.existingPresentation ? 'modify-slide' : 'create-deck';
      const requestId = Math.random().toString(36).substr(2, 9);

      // Use our cost tracking wrapper
      const response = await anthropicWrapper.createMessage({
        model: 'claude-opus-4-20250514',
        max_tokens: requestData.existingPresentation ? 4000 : 3000,
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

// EMERGENCY MINIMAL SYSTEM PROMPT - UNDER 3000 TOKENS
const SYSTEM_PROMPT = `You are an AI that generates presentation slides using ONLY predefined layout components.

🎯 USER INTENT CLASSIFICATION:
1. CREATE NEW PRESENTATION - Only when explicitly requested
2. ADD NEW SLIDE - Only when explicitly requested  
3. MODIFY EXISTING CONTENT - Default behavior

🚨 CRITICAL RULES:
- Use ONLY predefined layout components
- NEVER add extra TextBlocks
- ALL TITLES: Maximum 3 words
- Cover/Problem titles: 1-2 words only
- Always include BackgroundBlock with "bg-white"

🎯 DEVICE SWITCHING:
- Cover_ProductLayout → iPhone_StandaloneFeature
- Product_MacBookCentered → Product_iPhoneInCenter
- McBook_Feature → iPhone_StandaloneFeature

🚨 EMERGENCY OPTIMIZATION:
- Descriptions under 15 words
- Max 3 bullet points per slide
- Minimal chart data
- Response under 8000 characters

🎯 PLAYBOOKS (SPLIT API FOR 10+ SLIDES):
- "investor deck" → 12 slides: Cover→Index→Problem→Solution→Why Now→Market→Competition→Business→Team→Traction→Financials→Back
- "product dossier" → 11 slides: Cover→Index→Context→Problem→Solution→Feature→Features→Competition→Benefits→Performance→Back
- "report" → 12 slides: Cover→Index→Goals→Context→KPI→Financials→Performance→Regional→Impact→Next Steps→Roadmap→Back
- "campaign" → 7 slides: Cover→Index→Metrics→Goals→Strategy→Next Steps→Back
- "product launch" → 10 slides: Cover→Index→Context→Problem→Solution→Features→Benefits→Roadmap→Team→Back
- "topic" → 8 slides: Cover→Index→Context→Lists→Data→Lists→Conclusion→Back

🎯 AVAILABLE LAYOUTS:
Cover: Cover_ProductLayout, Cover_TextCenter, Cover_LeftImageTextRight
Index: Index_AgendaGrid3x4, Index_LeftAgendaRightImage
Content: Impact_ImageMetrics, Impact_KPIOverview, Lists_LeftTextRightImage, Lists_CardsLayout, Lists_CardsLayoutRight
Product: Product_MacBookCentered, Product_iPhoneInCenter, iPhone_StandaloneFeature, McBook_Feature
Charts: Metrics_FinancialsSplit, Metrics_FullWidthChart, Market_SizeAnalysis
Other: Competition_Analysis, Team_AdaptiveGrid, Roadmap_Timeline, Pricing_Plans, Quote_LeftTextRightImage, BackCover_ThankYouWithImage

🚨 JSON FORMAT:
For modifications: Return single slide object with id and blocks
For new presentations: Return full presentation with title and slides array
NEVER use JavaScript comments or syntax - PURE JSON ONLY

🎯 EXAMPLES:
Single slide: {"id": "slide-1", "blocks": [{"type": "BackgroundBlock", "props": {"color": "bg-white"}}, {"type": "iPhone_StandaloneFeature", "props": {"title": "Platform", "description": "Mobile solution.", "fontFamily": "font-helvetica-neue"}}]}

Full presentation: {"title": "Campaign", "slides": [{"id": "slide-1", "blocks": [{"type": "BackgroundBlock", "props": {"color": "bg-white"}}, {"type": "Cover_TextCenter", "props": {"title": "Campaign", "paragraph": "Strategic approach.", "fontFamily": "font-helvetica-neue"}}]}]}`;

// Allowed layout components (validation)
const allowedLayouts = [
  'BackgroundBlock', 'TextBlock', 'ImageBlock',
  'Cover_LeftImageTextRight', 'Cover_TextCenter', 'Cover_LeftTitleRightBodyUnderlined', 'Cover_ProductLayout',
  'BackCover_ThankYouWithImage',
  'Index_LeftAgendaRightImage', 'Index_LeftAgendaRightText', 'Index_AgendaGrid3x4',
  'Quote_MissionStatement', 'Quote_LeftTextRightImage',
  'Impact_KPIOverview', 'Impact_SustainabilityMetrics', 'Impact_ImageMetrics',
  'Team_AdaptiveGrid', 'Team_MemberProfile',
  'Metrics_FinancialsSplit', 'Metrics_FullWidthChart',
  'Lists_LeftTextRightImage', 'Lists_GridLayout', 'Lists_LeftTextRightImageDescription', 'Lists_CardsLayout', 'Lists_CardsLayoutRight',
  'Market_SizeAnalysis', 'Competition_Analysis', 'Roadmap_Timeline',
  'Product_MacBookCentered', 'Product_iPhoneInCenter', 'Product_PhysicalProduct',
  'McBook_Feature', 'iPhone_HandFeature', 'iPhone_StandaloneFeature',
  'Pricing_Plans', 'Content_TextImageDescription', 'SectionSpace'
];

// Validation function
function validatePresentationStructure(data: any): { isValid: boolean; error?: string } {
  // Handle single slide modifications
  if (data.id && data.blocks) {
    if (!Array.isArray(data.blocks)) {
      return { isValid: false, error: 'Single slide blocks must be an array' };
    }
    return { isValid: true };
  }

  // Handle full presentations
  if (!data.title || typeof data.title !== 'string') {
    return { isValid: false, error: 'Missing or invalid title' };
  }

  if (!Array.isArray(data.slides)) {
    return { isValid: false, error: 'Slides must be an array' };
  }

  if (data.slides.length === 0) {
    return { isValid: false, error: 'At least one slide is required' };
  }

  // Validate each slide
  for (const slide of data.slides) {
    if (!slide.id || typeof slide.id !== 'string') {
      return { isValid: false, error: 'Each slide must have a valid id' };
    }

    if (!Array.isArray(slide.blocks)) {
      return { isValid: false, error: 'Each slide must have blocks array' };
    }

    // Validate each block
    for (const block of slide.blocks) {
      if (!block.type || typeof block.type !== 'string') {
        return { isValid: false, error: 'Each block must have a valid type' };
      }

      if (!allowedLayouts.includes(block.type)) {
        return { isValid: false, error: `Invalid layout component: ${block.type}. Only predefined layouts are allowed.` };
      }
    }
  }

  return { isValid: true };
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, existingPresentation, uploadedImages } = await request.json();

    console.log('Received request:', {
      prompt: prompt?.substring(0, 100) + '...',
      hasExistingPresentation: !!existingPresentation,
      existingPresentationSlides: existingPresentation?.slides?.length || 0,
      uploadedImagesCount: uploadedImages?.length || 0
    });

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required and must be a string' },
        { status: 400 }
      );
    }

    // Prepare messages for Claude
    const messages = [
      {
        role: 'user' as const,
        content: existingPresentation 
          ? `${prompt}\n\nExisting presentation: ${JSON.stringify(existingPresentation)}`
          : prompt
      }
    ];

    // Add uploaded images to the prompt if any
    if (uploadedImages && uploadedImages.length > 0) {
      const imageInfo = uploadedImages.map((img: any) => 
        `Image: ${img.originalName} (${img.suggestedVariant || 'general'})`
      ).join(', ');
      messages[0].content += `\n\nUploaded images: ${imageInfo}`;
    }

    const requestData = {
      messages,
      system: SYSTEM_PROMPT,
      existingPresentation
    };

    console.log('Calling Claude API...');
    
    // Use rate-limited request
    const response = await rateLimitManager.addRequest(requestData);
    
    console.log('Claude API response received');
    
    // Log the raw response for debugging
    console.log('🚨 FULL RAW CLAUDE RESPONSE:');
    console.log('=====================================');
    console.log(response.content[0].text);
    console.log('=====================================');
    console.log('Response length:', response.content[0].text.length);
    console.log('First 500 chars:', response.content[0].text.substring(0, 500));
    console.log('Last 500 chars:', response.content[0].text.slice(-500));

    // Clean and parse the response
    let cleanedText = response.content[0].text.trim();
    
    // Remove any markdown code blocks
    cleanedText = cleanedText.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
    
    // Remove any leading/trailing whitespace
    cleanedText = cleanedText.trim();
    
    console.log('Cleaned JSON for parsing (first 300 chars):', cleanedText.substring(0, 300));
    
    let presentationData;
    try {
      presentationData = JSON.parse(cleanedText);
      console.log('Successfully parsed presentation data:', {
        title: presentationData.title,
        slideCount: presentationData.slides?.length,
        firstSlideBlocks: presentationData.slides?.[0]?.blocks?.length
      });
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError);
      console.error('Raw response that failed to parse:', cleanedText.substring(0, 1000));
      return NextResponse.json(
        { 
          error: 'Failed to parse AI response', 
          details: `Invalid JSON format: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`,
          rawResponse: cleanedText.substring(0, 500)
        },
        { status: 500 }
      );
    }

    // Validate the structure
    const validation = validatePresentationStructure(presentationData);
    if (!validation.isValid) {
      console.error('Invalid presentation structure:', validation.error);
      return NextResponse.json(
        { 
          error: 'Invalid presentation structure from AI', 
          details: validation.error,
          receivedData: presentationData
        },
        { status: 500 }
      );
    }

    console.log('Validation successful, returning presentation data');

    // Debug: Count TextBlock components
    if (presentationData.slides) {
      console.log('🎨 DEBUG: Generated TextBlock components:');
      presentationData.slides.forEach((slide: any, index: number) => {
        const textBlocks = slide.blocks?.filter((block: any) => block.type === 'TextBlock') || [];
        console.log(`Slide ${index + 1}: ${textBlocks.length} TextBlock(s) found`);
      });
    }

    return NextResponse.json(presentationData);

  } catch (error: any) {
    console.error('Error in generate API route:', error);

    // Handle specific Anthropic API errors
    if (error instanceof Anthropic.APIError) {
      // Handle overloaded error specifically
      if (error.status === 529 || error.message.includes('overloaded_error') || error.message.includes('Overloaded')) {
        console.log('🚫 Anthropic API overloaded - providing user-friendly response');
        return NextResponse.json(
          { 
            error: 'Anthropic API is currently overloaded', 
            details: 'The API servers are experiencing high demand. Please wait 30-60 seconds and try again.',
            status: 529,
            userFriendly: true
          },
          { status: 529 }
        );
      }
      
      return NextResponse.json(
        { 
          error: 'Anthropic API error', 
          details: error.message,
          status: error.status 
        },
        { status: error.status || 500 }
      );
    }

    // Handle other errors (e.g., network issues, JSON parsing)
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        details: error instanceof Error ? error.message : 'An unknown error occurred.' 
      },
      { status: 500 }
    );
  }
}

