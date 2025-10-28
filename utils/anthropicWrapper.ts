import Anthropic from '@anthropic-ai/sdk';
import { llmCostTracker } from './llmCostTracker';

export interface AnthropicCallParams {
  model: string;
  messages: Anthropic.Messages.MessageParam[];
  max_tokens: number;
  temperature?: number;
  system?: string;
  kind: 'new' | 'modify';
  userAction?: string;
  requestId?: string;
}

export interface AnthropicResponse {
  content: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
  metrics: {
    latencyMs: number;
    cacheHit: boolean;
    costTotal: number;
  };
}

class AnthropicWrapper {
  private client: Anthropic;

  constructor(apiKey?: string) {
    this.client = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Make a tracked Anthropic API call with cost monitoring and retry logic
   */
  async createMessage(params: AnthropicCallParams): Promise<AnthropicResponse> {
    const { model, messages, max_tokens, temperature, system, kind, userAction, requestId } = params;
    
    // Start user action tracking if provided
    if (userAction) {
      llmCostTracker.startUserAction(userAction);
    }

    const maxRetries = 3;
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const startTime = Date.now();
      let cacheHit = false;

      try {
        console.log(`🔄 API attempt ${attempt}/${maxRetries} for request ${requestId || 'unknown'}`);
        
        // Make the API call
        const response = await this.client.messages.create({
          model,
          messages,
          max_tokens,
          temperature,
          system,
        });

        const endTime = Date.now();
        const latencyMs = endTime - startTime;

        // Extract usage information
        const usage = response.usage;
        const inputTokens = usage.input_tokens;
        const outputTokens = usage.output_tokens;

        // Check for cache hit (Anthropic doesn't provide this directly, so we estimate)
        // If response time is unusually fast (< 500ms) and we have output, it might be cached
        cacheHit = latencyMs < 500 && outputTokens > 0;

        // Extract content
        const content = response.content
          .filter(block => block.type === 'text')
          .map(block => (block as any).text)
          .join('');

        // Log the API call with cost tracking
        const metrics = llmCostTracker.logApiCall({
          model,
          kind,
          inputTokens,
          outputTokens,
          latencyMs,
          cacheHit,
          requestId
        });

        console.log(`✅ API call successful on attempt ${attempt}`);
        return {
          content,
          usage: {
            input_tokens: inputTokens,
            output_tokens: outputTokens
          },
          metrics: {
            latencyMs,
            cacheHit,
            costTotal: metrics.costTotal
          }
        };

      } catch (error: any) {
        const endTime = Date.now();
        const latencyMs = endTime - startTime;
        lastError = error;

        console.error(`❌ API attempt ${attempt}/${maxRetries} failed:`, error.message);

        // Check if this is a retryable error
        const isRetryable = this.isRetryableError(error);
        
        if (!isRetryable || attempt === maxRetries) {
          // Log failed API call (with 0 tokens)
          llmCostTracker.logApiCall({
            model,
            kind,
            inputTokens: 0,
            outputTokens: 0,
            latencyMs,
            cacheHit: false,
            requestId
          });

          console.error('🚨 Anthropic API Error (final):', error);
          throw error;
        }

        // Wait before retrying (exponential backoff)
        const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(`⏳ Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    // This should never be reached, but just in case
    throw lastError;
  }

  /**
   * Check if an error is retryable
   */
  private isRetryableError(error: any): boolean {
    // Connection errors are retryable
    if (error.cause?.code === 'ECONNREFUSED' || error.cause?.code === 'ENOTFOUND') {
      return true;
    }
    
    // Network timeout errors are retryable
    if (error.message?.includes('timeout') || error.message?.includes('Connection error')) {
      return true;
    }
    
    // 5xx server errors are retryable (but not 4xx client errors)
    if (error.status >= 500 && error.status < 600) {
      return true;
    }
    
    // 429 rate limit errors are retryable
    if (error.status === 429) {
      return true;
    }
    
    // 529 overload errors are retryable
    if (error.status === 529 || error.error?.type === 'overloaded_error') {
      return true;
    }
    
    return false;
  }

  /**
   * End current user action and get summary
   */
  endUserAction() {
    return llmCostTracker.endUserAction();
  }

  /**
   * Get current action summary without ending it
   */
  getCurrentActionSummary() {
    return llmCostTracker.getCurrentActionSummary();
  }

  /**
   * Get all action summaries
   */
  getAllActionSummaries() {
    return llmCostTracker.getAllActionSummaries();
  }
}

// Export singleton instance
export const anthropicWrapper = new AnthropicWrapper();
