# LLM Cost Tracking & Guardrails

This system provides comprehensive cost tracking and guardrails for Anthropic API usage in Slaid.

## Features

### 📊 Cost Tracking
- **Per-call logging**: Every API call is logged with detailed metrics
- **Real-time cost calculation**: Costs calculated using current Anthropic pricing
- **User action aggregation**: Costs grouped by user actions (create-deck, modify-slide)
- **Token usage monitoring**: Input/output token tracking
- **Latency monitoring**: Response time tracking
- **Cache hit detection**: Identifies potentially cached responses

### 🚨 Guardrails & Warnings
- **Model warnings**: Alerts when using non-Haiku models (higher cost)
- **Cost thresholds**: Warns when single request exceeds $0.03
- **Token limits**: Alerts when input tokens exceed 3000
- **Automatic logging**: All warnings logged to console and analytics

### 📈 Analytics & Reporting
- **Session summaries**: Cost breakdown per user action
- **Historical data**: Persistent logging to `analytics/llm-usage.log`
- **Export capabilities**: CSV export for Excel analysis
- **API endpoint**: `/api/analytics` for programmatic access

## Usage

### Automatic Integration
The cost tracking is automatically integrated into the existing `/api/generate` endpoint. No changes needed for basic usage.

### Manual Usage
```typescript
import { anthropicWrapper } from './utils/anthropicWrapper';

// Make a tracked API call
const response = await anthropicWrapper.createMessage({
  model: 'claude-3-5-haiku-20241022',
  messages: [...],
  max_tokens: 3000,
  temperature: 0.1,
  kind: 'new', // or 'modify'
  userAction: 'create-deck', // optional
  requestId: 'unique-id' // optional
});

// Get current action summary
const summary = anthropicWrapper.getCurrentActionSummary();

// End action and get final summary
const finalSummary = anthropicWrapper.endUserAction();
```

## Pricing Configuration

Current pricing (per 1K tokens):

```typescript
const LLM_PRICING = {
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
};
```

## Analytics API

### Get Analytics Data
```bash
GET /api/analytics
```

Returns:
```json
{
  "summary": {
    "totalCost": 0.0123,
    "totalInputTokens": 1500,
    "totalOutputTokens": 800,
    "totalRequests": 5,
    "avgCostPerRequest": 0.00246,
    "avgTokensPerRequest": 460
  },
  "actionBreakdown": [...],
  "recentActivity": [...],
  "generatedAt": "2024-01-01T12:00:00.000Z"
}
```

### Export to CSV
```bash
GET /api/analytics?format=csv
```

### Clear Analytics Data (Dev Only)
```bash
DELETE /api/analytics
```

## Console Output Examples

### Cost Tracking
```
💰 LLM COST TRACKING:
   📊 Model: claude-3-5-haiku-20241022
   🔄 Kind: new
   📥 Input Tokens: 1,234
   📤 Output Tokens: 567
   ⏱️  Latency: 2,345ms
   💾 Cache Hit: No
   💵 Cost In: $0.000987 (1234/1000 * $0.0008)
   💵 Cost Out: $0.002268 (567/1000 * $0.0040)
   💰 Total Cost: $0.003255
   🎯 User Action: create-deck
```

### Guardrail Warnings
```
🚨 LLM GUARDRAIL WARNINGS:
   🚨 NON-HAIKU MODEL: Using claude-3-5-sonnet-20241022 instead of Haiku (higher cost)
   💰 HIGH COST: $0.0456 exceeds $0.03 threshold
   📝 HIGH INPUT: 3500 tokens exceeds 3000 token threshold
```

### Action Summary
```
📊 USER ACTION SUMMARY:
   🎯 Action: create-deck
   🔢 Requests: 3
   📥 Total Input Tokens: 2,456
   📤 Total Output Tokens: 1,234
   💰 Total Cost: $0.007890
   ⏱️  Avg Latency: 1,876ms
```

## Log File Format

Each line in `analytics/llm-usage.log` is a JSON object:

```json
{
  "timestamp": "2024-01-01T12:00:00.000Z",
  "model": "claude-3-5-haiku-20241022",
  "kind": "new",
  "inputTokens": 1234,
  "outputTokens": 567,
  "latencyMs": 2345,
  "cacheHit": false,
  "costIn": 0.000987,
  "costOut": 0.002268,
  "costTotal": 0.003255,
  "userAction": "create-deck",
  "requestId": "abc123def"
}
```

## Environment Configuration

- **Development**: Logs to `analytics/llm-usage.log`
- **Production**: Logs to `/tmp/llm-usage.log` (configure your analytics service)

## Testing

Run the test script to verify cost tracking:

```bash
node test-cost-tracking.js
```

## Customization

### Update Pricing
Edit `slaidai/utils/llmCostTracker.ts` and update the `LLM_PRICING` object.

### Modify Thresholds
Update guardrail thresholds in the `applyGuardrails` method:
- Cost threshold: Currently $0.03
- Token threshold: Currently 3000 tokens

### Add New User Actions
User actions are automatically detected based on request parameters, but you can customize them in the API route or when calling the wrapper directly.
