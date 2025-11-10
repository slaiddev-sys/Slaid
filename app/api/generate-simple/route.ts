import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// Simple, clean API endpoint for presentation generation
// No playbooks, no complex logic - just generate and return

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, existingPresentation, fileData } = body;

    console.log('🚀 SIMPLE API: Received request:', { 
      prompt: prompt?.substring(0, 100),
      hasExistingPresentation: !!existingPresentation,
      hasFileData: !!fileData
    });

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Build the system prompt
    const systemPrompt = `You are a presentation generation AI. Generate presentations in valid JSON format.

CRITICAL RULES:
1. ALWAYS return ONLY valid JSON, no markdown, no explanations
2. Structure: { "title": "string", "slides": [...] }
3. Each slide MUST have: "id", "title", "layout", "blocks"
4. Available layouts: Cover_MinimalCentered, Content_SingleColumn, BackCover_Simple, etc.

Example structure:
{
  "title": "Presentation Title",
  "slides": [
    {
      "id": "slide-1",
      "title": "Slide Title",
      "layout": "Cover_MinimalCentered",
      "blocks": [
        {
          "id": "block-1",
          "type": "TextBlock",
          "content": "Content here",
          "props": {}
        }
      ]
    }
  ]
}`;

    // Build the user message
    let userMessage = prompt;
    
    // Add file data if present
    if (fileData) {
      userMessage += `\n\nFile data to use:\n${JSON.stringify(fileData, null, 2)}`;
    }
    
    // Add existing presentation if modifying
    if (existingPresentation) {
      userMessage += `\n\nExisting presentation to modify:\n${JSON.stringify(existingPresentation, null, 2)}`;
    }

    console.log('🤖 Calling Claude API...');

    // Call Claude
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 16000,
      temperature: 0.7,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userMessage
        }
      ]
    });

    console.log('✅ Claude API response received');

    // Extract the text response
    const textContent = response.content[0];
    if (textContent.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    let cleanedText = textContent.text.trim();
    
    // Remove markdown code blocks if present
    cleanedText = cleanedText.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();
    
    console.log('📝 Parsing response (first 200 chars):', cleanedText.substring(0, 200));

    // Parse JSON
    let presentationData;
    try {
      presentationData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      console.error('Failed text (first 500 chars):', cleanedText.substring(0, 500));
      return NextResponse.json(
        { 
          error: 'Failed to parse AI response', 
          details: parseError instanceof Error ? parseError.message : 'Invalid JSON',
          rawResponse: cleanedText.substring(0, 500)
        },
        { status: 500 }
      );
    }

    // Validate structure
    if (!presentationData.slides || !Array.isArray(presentationData.slides)) {
      console.error('❌ Invalid structure:', presentationData);
      return NextResponse.json(
        { 
          error: 'Invalid presentation structure', 
          details: 'Missing or invalid slides array'
        },
        { status: 500 }
      );
    }

    // Ensure title exists
    if (!presentationData.title) {
      presentationData.title = 'New Presentation';
    }

    console.log('✅ SUCCESS: Generated presentation with', presentationData.slides.length, 'slides');
    console.log('📊 Presentation:', {
      title: presentationData.title,
      slideCount: presentationData.slides.length,
      slideIds: presentationData.slides.map((s: any) => s.id)
    });

    // Return the presentation
    return NextResponse.json(presentationData);

  } catch (error: any) {
    console.error('❌ API Error:', error);
    
    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { 
          error: 'AI service error', 
          details: error.message
        },
        { status: error.status || 500 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

