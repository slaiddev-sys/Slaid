// Final debugging script - run in browser console
console.log('🔍 FINAL BACKGROUND DEBUG');

// Check if we can find the slide container
const slideContainer = document.querySelector('[class*="aspect-video"]');
console.log('📱 Slide container:', slideContainer);

// Check all BackgroundBlock elements
const backgrounds = document.querySelectorAll('div[style*="z-index: -10"], div[style*="position: absolute"]');
console.log('🎨 Found background elements:', backgrounds.length);

backgrounds.forEach((bg, i) => {
  console.log(`Background ${i + 1}:`, {
    className: bg.className,
    style: bg.style.cssText,
    backgroundColor: bg.style.backgroundColor,
    background: bg.style.background
  });
});

// Check for white backgrounds specifically
const whiteBackgrounds = Array.from(backgrounds).filter(bg => 
  bg.style.backgroundColor === 'rgb(255, 255, 255)' || 
  bg.style.backgroundColor === '#ffffff' ||
  bg.style.backgroundColor === 'white'
);

console.log('⚪ White backgrounds found:', whiteBackgrounds.length);
whiteBackgrounds.forEach((bg, i) => {
  console.log(`White background ${i + 1}:`, bg);
});

// Test if we can manually create a white background
const testDiv = document.createElement('div');
testDiv.style.position = 'absolute';
testDiv.style.inset = '0';
testDiv.style.backgroundColor = '#ffffff';
testDiv.style.zIndex = '-5';
testDiv.style.border = '3px solid red';  // Red border to make it visible
testDiv.innerHTML = '<div style="position: relative; z-index: 10; padding: 20px; color: black; font-size: 24px; font-weight: bold;">TEST WHITE BACKGROUND - If you see this, white backgrounds work!</div>';

if (slideContainer) {
  slideContainer.appendChild(testDiv);
  console.log('✅ Added test white background to slide container');
} else {
  document.body.appendChild(testDiv);
  console.log('✅ Added test white background to body');
}
