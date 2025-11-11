// COST-OPTIMIZED VERSION
// This uses a hybrid approach: Haiku for analysis, Opus 4.1 for generation
// Includes prompt caching for 90% cost reduction on repeated prompts

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Model selection based on complexity
const selectModel = (isComplex: boolean) => {
  return isComplex ? 'claude-opus-4-20250514' : 'claude-3-5-haiku-20241022';
};

// Determine if presentation is complex
const isComplexPresentation = (prompt: string, slideCount: number): boolean => {
  const lowerPrompt = prompt.toLowerCase();
  
  // Complex if:
  // 1. More than 10 slides
  // 2. Contains specific complex keywords
  // 3. Investor/financial content
  
  const complexKeywords = [
    'investor deck', 'pitch deck', 'financial', 'fundraising',
    'quarterly business review', 'qbr', 'annual report',
    'strategic plan', 'business case', 'market analysis'
  ];
  
  const hasComplexKeyword = complexKeywords.some(keyword => lowerPrompt.includes(keyword));
  const isManySlides = slideCount > 10;
  
  return hasComplexKeyword || isManySlides;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, existingPresentation, fileData } = body;
    
    // Determine complexity
    const slideCount = existingPresentation?.slides?.length || 5;
    const isComplex = isComplexPresentation(prompt, slideCount);
    
    console.log(`🎯 Presentation complexity: ${isComplex ? 'COMPLEX (using Opus 4.1)' : 'SIMPLE (using Haiku)'}`);
    console.log(`💰 Estimated cost savings: ${isComplex ? '0%' : '~95%'}`);
    
    // STEP 1: Use Haiku for initial analysis (cheap)
    const analysisResponse = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022', // Always use Haiku for analysis
      max_tokens: 1024, // Small token limit for analysis
      messages: [{
        role: 'user',
        content: `Analyze this presentation request and extract key requirements:\n${prompt}\n\nProvide: 1) Main topic, 2) Key themes, 3) Suggested structure`
      }]
    });
    
    const analysis = analysisResponse.content[0].type === 'text' ? analysisResponse.content[0].text : '';
    console.log('✅ Analysis complete (using Haiku)');
    
    // STEP 2: Use appropriate model for generation
    const generationModel = selectModel(isComplex);
    
    // System prompt with caching enabled
    const systemPrompt = {
      type: "text" as const,
      text: `You are a professional presentation designer...`, // Your full system prompt
      cache_control: { type: "ephemeral" as const } // Enable caching
    };
    
    const response = await anthropic.messages.create({
      model: generationModel,
      max_tokens: isComplex ? 16000 : 8000, // Reduce tokens for simple presentations
      system: [systemPrompt], // Cached system prompt
      messages: [{
        role: 'user',
        content: `Based on this analysis:\n${analysis}\n\nCreate presentation for: ${prompt}`
      }]
    });
    
    console.log(`💰 Cost breakdown:`);
    console.log(`   - Analysis (Haiku): ~$0.001`);
    console.log(`   - Generation (${generationModel}): ${isComplex ? '~$0.50-1.00' : '~$0.01-0.05'}`);
    console.log(`   - Cache savings: ${response.usage.cache_read_input_tokens ? '~90%' : '0%'} on cached portions`);
    
    return NextResponse.json({
      presentation: response.content,
      model_used: generationModel,
      cost_estimate: isComplex ? 'high' : 'low'
    });
    
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

