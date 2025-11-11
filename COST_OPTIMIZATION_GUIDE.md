# Cost Optimization Guide for Claude Opus 4.1

## Current Cost Structure

### Model Pricing (per million tokens)
- **Claude Opus 4.1**: $15 input / $75 output
- **Claude Sonnet 3.5**: $3 input / $15 output  
- **Claude Haiku 3.5**: $0.25 input / $1.25 output

### Typical Presentation Generation Costs
- **5-slide presentation**: ~10K input + 5K output = **$0.52** with Opus 4.1
- **10-slide presentation**: ~15K input + 10K output = **$0.98** with Opus 4.1
- **20-slide presentation**: ~25K input + 20K output = **$1.88** with Opus 4.1

---

## Strategy 1: Hybrid Model Approach ⭐ **RECOMMENDED**

### Implementation
Use **Haiku for analysis** + **Opus 4.1 for complex presentations only**

```typescript
const isComplexPresentation = (prompt: string, slideCount: number): boolean => {
  const complexKeywords = [
    'investor deck', 'pitch deck', 'financial', 'fundraising',
    'quarterly business review', 'qbr', 'annual report'
  ];
  
  const hasComplexKeyword = complexKeywords.some(k => prompt.toLowerCase().includes(k));
  return hasComplexKeyword || slideCount > 10;
};

// Use Haiku for analysis (cheap)
const analysis = await anthropic.messages.create({
  model: 'claude-3-5-haiku-20241022',
  max_tokens: 1024,
  messages: [{ role: 'user', content: `Analyze: ${prompt}` }]
});

// Use Opus 4.1 only for complex presentations
const generationModel = isComplexPresentation(prompt, slideCount) 
  ? 'claude-opus-4-20250514' 
  : 'claude-3-5-haiku-20241022';
```

### Cost Savings
- **Simple presentations (80%)**: Use Haiku → **95% cheaper** ($0.025 vs $0.52)
- **Complex presentations (20%)**: Use Opus 4.1 → Same quality
- **Overall savings**: ~**76%**

---

## Strategy 2: Prompt Caching ⭐ **HIGHLY EFFECTIVE**

### Implementation
Enable prompt caching for system prompts:

```typescript
const systemPrompt = {
  type: "text",
  text: `Your 5000-character system prompt here...`,
  cache_control: { type: "ephemeral" } // Enable caching
};

const response = await anthropic.messages.create({
  model: 'claude-opus-4-20250514',
  system: [systemPrompt], // Cached!
  messages: [...]
});
```

### Cost Savings
- **First request**: Full cost ($15/$75 per million)
- **Cached requests**: **90% discount** on cached portions ($1.50/$7.50 per million)
- **Typical savings**: ~**50-70%** on repeated requests

### Cache Duration
- Caches persist for **5 minutes**
- Perfect for batch operations or multiple slides

---

## Strategy 3: Optimize Max Tokens

### Current Settings
```typescript
max_tokens: 16000  // For all presentations
```

### Optimized Settings
```typescript
const maxTokens = {
  'simple': 4000,      // Basic presentations
  'medium': 8000,      // Standard presentations
  'complex': 16000     // Investor decks, reports
};

max_tokens: maxTokens[complexity]
```

### Cost Savings
- **Simple presentations**: ~**75% cheaper** (4K vs 16K tokens)
- **Medium presentations**: ~**50% cheaper** (8K vs 16K tokens)

---

## Strategy 4: Batch Processing

### Implementation
Generate multiple slides in one API call instead of one-by-one:

```typescript
// ❌ BAD: 10 separate API calls for 10 slides
for (let i = 0; i < 10; i++) {
  await generateSlide(i);  // 10 x $0.10 = $1.00
}

// ✅ GOOD: 1 API call for all 10 slides
await generateAllSlides(1, 10);  // 1 x $0.50 = $0.50
```

### Cost Savings
- **50% reduction** in API calls
- **Bonus**: Faster generation (parallel processing on Anthropic's side)

---

## Strategy 5: Smart Slide Count

### Implementation
Limit slide counts based on plan:

```typescript
const maxSlides = {
  'free': 5,     // Free users: simple presentations only
  'pro': 20,     // Pro users: full features
};
```

### Cost Savings
- **Free tier**: ~**$0.10-0.25 per presentation** (5 slides with Haiku)
- **Pro tier**: ~**$0.50-1.50 per presentation** (up to 20 slides, smart model selection)

---

## Recommended Implementation

### For Your App

```typescript
// 1. Analyze request (Haiku)
const analysis = await analyzeRequest(prompt); // $0.001

// 2. Determine complexity
const isComplex = analysis.requiresOpus || slideCount > 10;

// 3. Select model
const model = isComplex ? 'claude-opus-4-20250514' : 'claude-3-5-haiku-20241022';

// 4. Generate with caching
const response = await generateWithCache(model, analysis);

// Cost per presentation:
// - Simple (80% of requests): $0.01-0.05 (Haiku)
// - Complex (20% of requests): $0.50-1.00 (Opus 4.1)
// Average: ~$0.10-0.25 per presentation (80-90% savings!)
```

---

## Cost Comparison

### Before Optimization
- **Model**: Opus 4.1 for everything
- **Cost per 100 presentations**: ~$52-98
- **Monthly cost (1000 users, 5 presentations/month)**: ~$2,600-4,900

### After Optimization (Hybrid + Caching)
- **Model**: 80% Haiku, 20% Opus 4.1
- **Cost per 100 presentations**: ~$8-20
- **Monthly cost (1000 users, 5 presentations/month)**: ~$400-1,000
- **Savings**: **~80-85%**

---

## Quick Wins (Immediate Implementation)

1. **Enable Prompt Caching** (5 min) → **50-70% savings**
2. **Reduce max_tokens for simple presentations** (10 min) → **25-50% savings**
3. **Use Haiku for analysis steps** (15 min) → **20-30% savings**

## Long-term Optimizations

4. **Implement hybrid model selection** (1 hour) → **60-80% savings**
5. **Optimize batch processing** (2 hours) → **Additional 10-20% savings**

---

## Monitoring

Track these metrics:

```typescript
{
  total_requests: 1000,
  haiku_requests: 800,     // 80%
  opus_requests: 200,      // 20%
  avg_input_tokens: 12000,
  avg_output_tokens: 6000,
  cache_hit_rate: 65%,     // 65% of requests use cache
  estimated_cost: $150     // vs $850 without optimization
}
```

---

## Recommendation

**Implement in this order:**
1. ✅ Prompt caching (immediate, 50-70% savings)
2. ✅ Hybrid model approach (1 hour, 60-80% total savings)
3. ✅ Optimize max_tokens (10 min, additional 10-20% savings)

**Expected result**: **80-85% cost reduction** while maintaining quality for complex presentations.

