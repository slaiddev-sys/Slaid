// Dynamic reasoning generation with timed thinking steps - Cursor style
export function generateDynamicReasoning(prompt: string, isModification: boolean = false): string {
  const lowerPrompt = prompt.toLowerCase();
  
  // Extract key elements from the prompt
  const hasFinancial = /financial|revenue|profit|budget|cost|money|sales|earnings/.test(lowerPrompt);
  const hasChart = /chart|graph|data|metrics|analytics|statistics/.test(lowerPrompt);
  const hasPitch = /pitch|investor|funding|startup|business plan/.test(lowerPrompt);
  const hasProduct = /product|feature|launch|demo|showcase/.test(lowerPrompt);
  const hasTeam = /team|people|staff|member|employee/.test(lowerPrompt);
  const hasRoadmap = /roadmap|timeline|schedule|plan|milestone/.test(lowerPrompt);
  const hasCompetition = /competitor|competition|market|analysis/.test(lowerPrompt);
  const hasMultipleSlides = /slides|presentation|deck/.test(lowerPrompt);
  const hasSingleSlide = /single slide|one slide/.test(lowerPrompt);
  
  let thinkingSteps: string[] = [];
  let finalSummary = '';
  
  if (isModification) {
    thinkingSteps.push('Analyzing for 3 seconds');
    thinkingSteps.push('Understanding changes for 2 seconds');
    
    if (hasFinancial) {
      thinkingSteps.push('Updating financial data for 4 seconds');
    } else if (hasProduct) {
      thinkingSteps.push('Modifying product layout for 3 seconds');
    } else if (hasChart) {
      thinkingSteps.push('Reconfiguring charts for 4 seconds');
    } else {
      thinkingSteps.push('Updating content for 3 seconds');
    }
    
    thinkingSteps.push('Applying changes for 2 seconds');
    
    // Final summary of what was accomplished
    finalSummary = 'Modified slide structure and content based on your specifications. ';
    
    if (hasFinancial) {
      finalSummary += 'Updated financial metrics, recalculated data points, and refined chart configurations for improved clarity. ';
    }
    if (hasChart) {
      finalSummary += 'Adjusted visualization parameters, color schemes, and data series to better represent the information. ';
    }
    if (hasProduct) {
      finalSummary += 'Enhanced product presentation elements, optimized feature highlights, and improved visual hierarchy. ';
    }
    
    finalSummary += 'Maintained design consistency while implementing your requested changes.';
    
  } else {
    thinkingSteps.push('Thinking for 5 seconds');
    thinkingSteps.push('Analyzing request for 3 seconds');
    
    if (hasFinancial && hasChart) {
      thinkingSteps.push('Planning financial dashboard for 4 seconds');
      thinkingSteps.push('Creating charts for 6 seconds');
      finalSummary = 'Generated comprehensive financial dashboard with revenue metrics, performance indicators, and interactive charts. Structured data visualization to highlight key trends and growth patterns with professional styling.';
    } else if (hasPitch) {
      thinkingSteps.push('Structuring pitch narrative for 5 seconds');
      thinkingSteps.push('Creating investor layout for 4 seconds');
      finalSummary = 'Created compelling investor pitch with strategic narrative flow, market opportunity analysis, and persuasive content hierarchy. Optimized for maximum impact and investor engagement.';
    } else if (hasProduct) {
      thinkingSteps.push('Designing product showcase for 4 seconds');
      thinkingSteps.push('Creating layout for 3 seconds');
      finalSummary = 'Designed product showcase highlighting key features, benefits, and value propositions. Implemented visual elements that effectively communicate product strengths and market positioning.';
    } else if (hasTeam) {
      thinkingSteps.push('Organizing team structure for 4 seconds');
      thinkingSteps.push('Creating profiles for 3 seconds');
      finalSummary = 'Built team presentation showcasing member expertise, roles, and organizational structure. Created professional profiles that build credibility and demonstrate team capabilities.';
    } else if (hasRoadmap) {
      thinkingSteps.push('Planning timeline for 4 seconds');
      thinkingSteps.push('Creating roadmap for 5 seconds');
      finalSummary = 'Constructed timeline visualization with clear milestones, strategic phases, and progress indicators. Organized information flow to communicate project evolution and future planning.';
    } else if (hasCompetition) {
      thinkingSteps.push('Analyzing competition for 5 seconds');
      thinkingSteps.push('Creating comparison for 4 seconds');
      finalSummary = 'Developed competitive analysis framework comparing market players, differentiators, and positioning strategies. Structured data to clearly communicate competitive advantages.';
    } else if (hasChart) {
      thinkingSteps.push('Planning data visualization for 4 seconds');
      thinkingSteps.push('Creating charts for 5 seconds');
      finalSummary = 'Created data visualization with optimized chart types, clear labeling, and professional styling. Configured interactive elements and legends for enhanced data comprehension.';
    } else if (hasMultipleSlides) {
      thinkingSteps.push('Planning presentation flow for 6 seconds');
      thinkingSteps.push('Creating multiple slides for 8 seconds');
      finalSummary = 'Generated multi-slide presentation with logical content progression, consistent design system, and cohesive narrative flow. Each slide optimized for specific content type and audience engagement.';
    } else {
      thinkingSteps.push('Creating layout for 3 seconds');
      thinkingSteps.push('Generating content for 4 seconds');
      finalSummary = 'Created professional slide with optimized content hierarchy, balanced typography, and strategic visual elements. Applied cohesive design system for maximum impact and readability.';
    }
    
    thinkingSteps.push('Finalizing design for 2 seconds');
  }
  
  return thinkingSteps.join('\n\n') + '\n\n' + finalSummary;
}

// Generate reasoning with realistic timing variations
export function generateReasoningWithTiming(prompt: string, isModification: boolean = false): { text: string; estimatedTime: number } {
  const reasoning = generateDynamicReasoning(prompt, isModification);
  
  // Estimate time based on complexity
  const wordCount = prompt.split(' ').length;
  const hasComplexElements = /chart|financial|data|multiple|complex|detailed/.test(prompt.toLowerCase());
  
  let baseTime = 8; // Base 8 seconds
  if (wordCount > 10) baseTime += 3;
  if (hasComplexElements) baseTime += 5;
  if (isModification) baseTime -= 2; // Modifications are typically faster
  
  return {
    text: reasoning,
    estimatedTime: Math.max(5, baseTime) // Minimum 5 seconds
  };
}
