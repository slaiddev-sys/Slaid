import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Check if API key is available
const hasAnthropicKey = !!process.env.ANTHROPIC_API_KEY;

export async function POST(request: NextRequest) {
  try {
    // Check if Anthropic API key is configured
    if (!hasAnthropicKey) {
      return NextResponse.json({ 
        error: 'Anthropic API key not configured. Please add ANTHROPIC_API_KEY to your .env.local file.',
        details: 'To fix this: 1) Get an API key from https://console.anthropic.com/, 2) Add ANTHROPIC_API_KEY=your-key-here to slaidai/.env.local, 3) Restart the development server',
        missingConfig: 'ANTHROPIC_API_KEY'
      }, { status: 500 });
    }

    const { fileData, prompt } = await request.json();
    
    console.log('📄 Word Analysis Request:', {
      fileName: fileData?.fileName,
      fileType: fileData?.type,
      hasStructuredData: !!fileData?.structuredData,
      dataKeys: fileData ? Object.keys(fileData) : []
    });

    if (!fileData || (fileData.type !== 'word' && fileData.type !== 'document')) {
      console.log('❌ Invalid file data:', { fileData });
      return NextResponse.json({ error: 'Invalid Word document data' }, { status: 400 });
    }

    // Enhanced prompt for COMPREHENSIVE Word document analysis - Extract COMPLETE CONTENT
    const analysisPrompt = `Analyze this Word document and extract the COMPLETE DETAILED CONTENT from each section, not just section names.

WORD DOCUMENT DATA:
${JSON.stringify(fileData, null, 2)}

🎯 COMPLETE CONTENT EXTRACTION REQUIRED:

I need you to extract the FULL TEXT CONTENT from each section, exactly like what's shown in the second image.

For example, when you see:
"01. Problem
Every month, over 200 million professionals create presentations that look generic, inconsistent, and painfully time-consuming.
Teams waste hours designing instead of communicating, and even AI tools like ChatGPT or Canva can't guarantee visual consistency or brand accuracy."

Extract it as:
**01. Problem:**
Complete Text: "Every month, over 200 million professionals create presentations that look generic, inconsistent, and painfully time-consuming. Teams waste hours designing instead of communicating, and even AI tools like ChatGPT or Canva can't guarantee visual consistency or brand accuracy."
Key Numbers: 200 million professionals

🔍 SECTION-BY-SECTION DETAILED EXTRACTION:

For EACH section, provide:

**SECTION NAME:** [Extract the section header]
**COMPLETE TEXT:** [Extract the FULL paragraph content - every sentence]
**KEY NUMBERS:** [Extract ALL specific numbers, statistics, percentages]
**IMPORTANT DETAILS:** [Extract company names, features, benefits, etc.]

Focus on these sections:
- 01. Problem: Extract the complete problem description
- 02. Solution: Extract the complete solution explanation  
- 03. Market: Extract ALL market size data, growth rates, user statistics
- 04. Competition: Extract competitive analysis details
- 05. Business Model: Extract pricing and revenue information
- 06. Team: Extract team member information
- 07. Traction: Extract ALL metrics and achievements
- 08. Roadmap: Extract development timeline
- 09. Fundraising: Extract funding details

🚨 CRITICAL REQUIREMENTS:
- Extract the COMPLETE TEXT from each section (full sentences and paragraphs)
- Include EVERY specific number (like "200 million", "$30 billion", "1.5 billion")
- Do NOT just list section names - extract the actual content
- Include ALL details that would be needed for presentation slides
- Extract EXACT wording, not summaries

Show me the DETAILED CONTENT from each section, just like what's visible in the Word document.`;

    console.log('🚀 Sending Word document to AI for comprehensive content extraction...');

    // Add retry logic for API overload errors
    let response;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        response = await anthropic.messages.create({
          model: 'claude-sonnet-4-5-20250929',
          max_tokens: 8192, // Maximum allowed for claude-3-5-haiku-20241022
          messages: [
            {
              role: 'user',
              content: analysisPrompt,
            },
          ],
        });
        break; // Success, exit retry loop
      } catch (error: any) {
        retryCount++;
        console.log(`⚠️  Attempt ${retryCount} failed:`, error.status, error.message);
        
        if (error.status === 529 || error.error?.type === 'overloaded_error') {
          if (retryCount < maxRetries) {
            const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff: 2s, 4s, 8s
            console.log(`🔄 Retrying in ${delay}ms... (attempt ${retryCount + 1}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        }
        
        // If not an overload error or max retries reached, throw the error
        throw error;
      }
    }

    if (!response) {
      throw new Error('Failed to get response after all retries');
    }

    const analysis = response.content[0].type === 'text' ? response.content[0].text : 'Analysis failed';
    
    console.log('✅ Word Analysis completed');
    console.log('📊 Analysis length:', analysis.length);

    // Enhanced structured content extraction
    const structuredContent = extractStructuredContent(fileData, analysis);

    return NextResponse.json({
      analysis,
      structuredContent,
      rawFileData: fileData
    });

  } catch (error) {
    console.error('❌ Word analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze Word document' },
      { status: 500 }
    );
  }
}

function extractStructuredContent(fileData: any, analysis: string) {
  const structured: any = {
    headings: [],
    keyPoints: [],
    suggestedSlides: []
  };

  // Extract headings from analysis - be more selective
  const headingMatches = analysis.match(/(?:slide \d+|heading|main topic|section).*?[:\-]\s*([^\n]+)/gi);
  if (headingMatches) {
    structured.headings = headingMatches.map(match => 
      match.replace(/.*?[:\-]\s*/, '').trim()
    ).slice(0, 8); // Limit to reasonable number
  }

  // Extract key points from analysis - focus on major points
  const keyPointMatches = analysis.match(/(?:key point|main point|important|primary).*?[:\-]\s*([^\n]+)/gi);
  if (keyPointMatches) {
    structured.keyPoints = keyPointMatches.map(match => 
      match.replace(/.*?[:\-]\s*/, '').trim()
    ).slice(0, 10); // Limit to major points only
  }

  // Generate realistic slide suggestions
  if (fileData.structuredData && fileData.structuredData.paragraphs) {
    const paragraphs = fileData.structuredData.paragraphs;
    const slides = [];
    
    // Title slide
    slides.push({
      title: fileData.fileName?.replace(/\.(docx?|doc)$/i, '') || 'Document Presentation',
      content: 'Overview and introduction to the presentation content',
      layout: 'Cover_LeftTitleRightBodyUnderlined'
    });

    // Content slides - be more selective, group content intelligently
    let slideCount = 0;
    const maxContentSlides = 12; // Realistic limit for content slides
    
    for (let i = 0; i < paragraphs.length && slideCount < maxContentSlides; i += 2) {
      const para1 = paragraphs[i];
      const para2 = paragraphs[i + 1];
      
      // Only create slides for substantial content
      if (para1 && para1.length > 100) {
        let combinedContent = para1;
        let slideTitle = `Section ${slideCount + 1}`;
        
        // Combine related short paragraphs
        if (para2 && para2.length > 50 && para2.length < 200) {
          combinedContent += ' ' + para2;
          i++; // Skip the next paragraph since we combined it
        }
        
        // Determine layout based on content characteristics
        let layout = 'Lists_LeftTextRightImage'; // Default
        if (combinedContent.includes('•') || combinedContent.includes('-')) {
          layout = 'Lists_LeftTextRightImage';
        } else if (combinedContent.length > 500) {
          layout = 'Lists_LeftTextRightImage'; // For longer content with lists
        } else if (combinedContent.match(/\d+%|\$\d+|statistics|metrics/i)) {
          layout = 'Impact_KPIOverview';
        }
        
        slides.push({
          title: slideTitle,
          content: combinedContent.substring(0, 300) + (combinedContent.length > 300 ? '...' : ''),
          layout: layout
        });
        
        slideCount++;
      }
    }

    // Conclusion slide
    slides.push({
      title: 'Summary & Next Steps',
      content: 'Key takeaways and action items from the presentation',
      layout: 'BackCover_ThankYouWithImage'
    });

    structured.suggestedSlides = slides;
  }

  return structured;
}
