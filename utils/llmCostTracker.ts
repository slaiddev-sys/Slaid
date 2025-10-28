import fs from 'fs';
import path from 'path';

// Pricing per 1K tokens (USD)
export const LLM_PRICING = {
  'claude-3-5-haiku-20241022': {
    input: 0.0008,   // $0.0008 per 1K input tokens
    output: 0.0040   // $0.0040 per 1K output tokens
  },
  'claude-3-5-sonnet-20241022': {
    input: 0.0030,   // $0.0030 per 1K input tokens
    output: 0.0150   // $0.0150 per 1K output tokens
  },
  'claude-3-opus-20240229': {
    input: 0.0150,   // $0.0150 per 1K input tokens
    output: 0.0750   // $0.0750 per 1K output tokens
  }
} as const;

export type ModelName = keyof typeof LLM_PRICING;

export interface LLMUsageMetrics {
  timestamp: string;
  model: string;
  kind: 'new' | 'modify';
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  cacheHit: boolean;
  costIn: number;
  costOut: number;
  costTotal: number;
  userAction?: string;
  requestId?: string;
}

export interface UserActionSummary {
  action: string;
  totalCost: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  requestCount: number;
  avgLatencyMs: number;
}

class LLMCostTracker {
  private currentUserAction: string | null = null;
  private actionMetrics: Map<string, LLMUsageMetrics[]> = new Map();
  private logFilePath: string;

  constructor() {
    // Set up log file path
    const isDev = process.env.NODE_ENV === 'development';
    if (isDev) {
      this.logFilePath = path.join(process.cwd(), 'analytics', 'llm-usage.log');
      // Ensure analytics directory exists
      const analyticsDir = path.dirname(this.logFilePath);
      if (!fs.existsSync(analyticsDir)) {
        fs.mkdirSync(analyticsDir, { recursive: true });
      }
    } else {
      this.logFilePath = '/tmp/llm-usage.log'; // In prod, you'd send to your analytics service
    }
  }

  /**
   * Start tracking a user action (e.g., "create-deck", "modify-slide")
   */
  startUserAction(action: string): void {
    this.currentUserAction = action;
    if (!this.actionMetrics.has(action)) {
      this.actionMetrics.set(action, []);
    }
  }

  /**
   * Calculate cost for a given model and token usage
   */
  calculateCost(model: string, inputTokens: number, outputTokens: number): {
    costIn: number;
    costOut: number;
    costTotal: number;
  } {
    const pricing = LLM_PRICING[model as ModelName];
    if (!pricing) {
      console.warn(`⚠️ Unknown model pricing: ${model}. Using Haiku pricing as fallback.`);
      const fallbackPricing = LLM_PRICING['claude-3-5-haiku-20241022'];
      const costIn = (inputTokens / 1000) * fallbackPricing.input;
      const costOut = (outputTokens / 1000) * fallbackPricing.output;
      return { costIn, costOut, costTotal: costIn + costOut };
    }

    const costIn = (inputTokens / 1000) * pricing.input;
    const costOut = (outputTokens / 1000) * pricing.output;
    const costTotal = costIn + costOut;

    return { costIn, costOut, costTotal };
  }

  /**
   * Log an LLM API call with cost calculation and guardrails
   */
  logApiCall(params: {
    model: string;
    kind: 'new' | 'modify';
    inputTokens: number;
    outputTokens: number;
    latencyMs: number;
    cacheHit?: boolean;
    requestId?: string;
  }): LLMUsageMetrics {
    const { model, kind, inputTokens, outputTokens, latencyMs, cacheHit = false, requestId } = params;
    
    // Calculate costs
    const { costIn, costOut, costTotal } = this.calculateCost(model, inputTokens, outputTokens);

    // Create metrics object
    const metrics: LLMUsageMetrics = {
      timestamp: new Date().toISOString(),
      model,
      kind,
      inputTokens,
      outputTokens,
      latencyMs,
      cacheHit,
      costIn,
      costOut,
      costTotal,
      userAction: this.currentUserAction || 'unknown',
      requestId
    };

    // Apply guardrails and warnings
    this.applyGuardrails(metrics);

    // Log to console with detailed cost breakdown
    this.logToConsole(metrics);

    // Store in current action metrics
    if (this.currentUserAction) {
      const actionMetrics = this.actionMetrics.get(this.currentUserAction) || [];
      actionMetrics.push(metrics);
      this.actionMetrics.set(this.currentUserAction, actionMetrics);
    }

    // Persist to log file
    this.persistToLog(metrics);

    return metrics;
  }

  /**
   * Apply guardrails and show warnings
   */
  private applyGuardrails(metrics: LLMUsageMetrics): void {
    const warnings: string[] = [];

    // Check if model is not Haiku
    if (!metrics.model.includes('haiku')) {
      warnings.push(`🚨 NON-HAIKU MODEL: Using ${metrics.model} instead of Haiku (higher cost)`);
    }

    // Check if cost exceeds threshold
    if (metrics.costTotal > 0.03) {
      warnings.push(`💰 HIGH COST: $${metrics.costTotal.toFixed(4)} exceeds $0.03 threshold`);
    }

    // Check if input tokens exceed threshold
    if (metrics.inputTokens > 3000) {
      warnings.push(`📝 HIGH INPUT: ${metrics.inputTokens} tokens exceeds 3000 token threshold`);
    }

    // Log warnings
    if (warnings.length > 0) {
      console.warn('\n🚨 LLM GUARDRAIL WARNINGS:');
      warnings.forEach(warning => console.warn(`   ${warning}`));
      console.warn('');
    }
  }

  /**
   * Log detailed metrics to console
   */
  private logToConsole(metrics: LLMUsageMetrics): void {
    console.log('\n💰 LLM COST TRACKING:');
    console.log(`   📊 Model: ${metrics.model}`);
    console.log(`   🔄 Kind: ${metrics.kind}`);
    console.log(`   📥 Input Tokens: ${metrics.inputTokens.toLocaleString()}`);
    console.log(`   📤 Output Tokens: ${metrics.outputTokens.toLocaleString()}`);
    console.log(`   ⏱️  Latency: ${metrics.latencyMs}ms`);
    console.log(`   💾 Cache Hit: ${metrics.cacheHit ? 'Yes' : 'No'}`);
    console.log(`   💵 Cost In: $${metrics.costIn.toFixed(6)} (${metrics.inputTokens}/1000 * $${LLM_PRICING[metrics.model as ModelName]?.input || 'unknown'})`);
    console.log(`   💵 Cost Out: $${metrics.costOut.toFixed(6)} (${metrics.outputTokens}/1000 * $${LLM_PRICING[metrics.model as ModelName]?.output || 'unknown'})`);
    console.log(`   💰 Total Cost: $${metrics.costTotal.toFixed(6)}`);
    if (metrics.userAction) {
      console.log(`   🎯 User Action: ${metrics.userAction}`);
    }
    console.log('');
  }

  /**
   * Persist metrics to log file
   */
  private persistToLog(metrics: LLMUsageMetrics): void {
    try {
      const logEntry = JSON.stringify(metrics) + '\n';
      fs.appendFileSync(this.logFilePath, logEntry);
    } catch (error) {
      console.error('Failed to write to LLM usage log:', error);
    }
  }

  /**
   * Get summary for current user action
   */
  getCurrentActionSummary(): UserActionSummary | null {
    if (!this.currentUserAction) return null;

    const metrics = this.actionMetrics.get(this.currentUserAction) || [];
    if (metrics.length === 0) return null;

    const totalCost = metrics.reduce((sum, m) => sum + m.costTotal, 0);
    const totalInputTokens = metrics.reduce((sum, m) => sum + m.inputTokens, 0);
    const totalOutputTokens = metrics.reduce((sum, m) => sum + m.outputTokens, 0);
    const avgLatencyMs = metrics.reduce((sum, m) => sum + m.latencyMs, 0) / metrics.length;

    return {
      action: this.currentUserAction,
      totalCost,
      totalInputTokens,
      totalOutputTokens,
      requestCount: metrics.length,
      avgLatencyMs: Math.round(avgLatencyMs)
    };
  }

  /**
   * End current user action and show summary
   */
  endUserAction(): UserActionSummary | null {
    const summary = this.getCurrentActionSummary();
    
    if (summary) {
      console.log('\n📊 USER ACTION SUMMARY:');
      console.log(`   🎯 Action: ${summary.action}`);
      console.log(`   🔢 Requests: ${summary.requestCount}`);
      console.log(`   📥 Total Input Tokens: ${summary.totalInputTokens.toLocaleString()}`);
      console.log(`   📤 Total Output Tokens: ${summary.totalOutputTokens.toLocaleString()}`);
      console.log(`   💰 Total Cost: $${summary.totalCost.toFixed(6)}`);
      console.log(`   ⏱️  Avg Latency: ${summary.avgLatencyMs}ms`);
      console.log('');
    }

    this.currentUserAction = null;
    return summary;
  }

  /**
   * Get all action summaries
   */
  getAllActionSummaries(): UserActionSummary[] {
    const summaries: UserActionSummary[] = [];

    for (const [action, metrics] of this.actionMetrics.entries()) {
      if (metrics.length === 0) continue;

      const totalCost = metrics.reduce((sum, m) => sum + m.costTotal, 0);
      const totalInputTokens = metrics.reduce((sum, m) => sum + m.inputTokens, 0);
      const totalOutputTokens = metrics.reduce((sum, m) => sum + m.outputTokens, 0);
      const avgLatencyMs = metrics.reduce((sum, m) => sum + m.latencyMs, 0) / metrics.length;

      summaries.push({
        action,
        totalCost,
        totalInputTokens,
        totalOutputTokens,
        requestCount: metrics.length,
        avgLatencyMs: Math.round(avgLatencyMs)
      });
    }

    return summaries.sort((a, b) => b.totalCost - a.totalCost);
  }
}

// Export singleton instance
export const llmCostTracker = new LLMCostTracker();
