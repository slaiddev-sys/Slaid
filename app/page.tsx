"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ChartBlock from "../components/blocks/ChartBlock";

// TypewriterWord component
function TypewriterWord() {
  const words = ["Impact", "Convert", "Stand out", "Impress", "Align"];
  const [wordIndex, setWordIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    let timeout;
    const currentWord = words[wordIndex];
    if (typing) {
      if (displayed.length < currentWord.length) {
        timeout = setTimeout(() => {
          setDisplayed(currentWord.slice(0, displayed.length + 1));
        }, 60);
      } else {
        timeout = setTimeout(() => setTyping(false), 1500);
      }
    } else {
      if (displayed.length > 0) {
        timeout = setTimeout(() => {
          setDisplayed(currentWord.slice(0, displayed.length - 1));
        }, 40);
      } else {
        timeout = setTimeout(() => {
          setWordIndex((wordIndex + 1) % words.length);
          setTyping(true);
        }, 200);
      }
    }
    return () => clearTimeout(timeout);
  }, [displayed, typing, wordIndex]);

  return <>{displayed}&nbsp;</>;
}

// Figma design implementation for the homepage
const imgImageBlur = "http://localhost:3845/assets/ae21641b719b2b1802127d43331c7044aeb90ed2.png";
const imgLogo41 = "/slaid logo verde.png";
const imgVector = "http://localhost:3845/assets/6b865160961a492cd8b2f516e437a92bcb222845.svg";
const imgVector1 = "http://localhost:3845/assets/3eaf1cac6c496c5dcbedce61eed5dc6c519cf09a.svg";
const imgVector2 = "http://localhost:3845/assets/98cb3a12042ce357ef3f9c7e7a8d2a104823edd6.svg";
const imgVector3 = "http://localhost:3845/assets/b42bf5f48d8b45dccf87583dd64785c107594b7c.svg";
const imgVector4 = "http://localhost:3845/assets/6bbb46a7f51de90903617aa6d56e17a364a229a6.svg";
const imgVector5 = "http://localhost:3845/assets/27685fed7e90013c81c9ab4d51f8d7b2bf642a03.svg";
const imgVector6 = "http://localhost:3845/assets/c663614982f25fa891db239a2bfda7a45c959cfe.svg";
const imgVector7 = "http://localhost:3845/assets/4bae0cbd422d08746d79b7de86800734f50560a9.svg";
const imgVector8 = "http://localhost:3845/assets/f8f0df089d9c45c45cff377db09a80141cb5c96f.svg";
const imgVector9 = "http://localhost:3845/assets/578d3a5cdf43502ad19a86fb73267a6c785c7745.svg";
const imgVector10 = "http://localhost:3845/assets/fced2961096321d7d7f825107fd6dcc16014a93a.svg";
const imgVector11 = "http://localhost:3845/assets/c237412a45f19576bc0df66f941fcd6e8f22d96f.svg";
const imgVector12 = "http://localhost:3845/assets/971d1af6f287bb7ea4864a562c00633e6e0447a9.svg";
const imgVector13 = "http://localhost:3845/assets/132d70c06f4a7ef9279dbe77695e15b50d560115.svg";
const imgVector14 = "http://localhost:3845/assets/075ba9edfae8d1897698910e6495e70c3022b4da.svg";

interface Component1Props {
  variant?: "1" | "2" | "3" | "4" | "5" | "6";
}

function Component1({ variant = "1" }: Component1Props) {
  if (variant === "2") {
    return (
      <div className="relative size-full" data-name="variant=2" id="node-2_19">
        <div className="absolute inset-[12.5%]" data-name="Vector" id="node-2_16">
          <div className="absolute bottom-[-5.556%] left-[-5.556%] right-[-5.556%] top-[-5.556%]" style={{"--stroke-0": "rgba(255, 255, 255, 0.9)"} as React.CSSProperties}>
            <img alt="" className="block max-w-none size-full" src={imgVector} />
          </div>
        </div>
        <div className="absolute bottom-[54.167%] left-[29.167%] right-[54.167%] top-[29.167%]" data-name="Vector" id="node-2_17">
          <div className="absolute inset-[-25%]" style={{"--stroke-0": "rgba(255, 255, 255, 0.9)"} as React.CSSProperties}>
            <img alt="" className="block max-w-none size-full" src={imgVector1} />
          </div>
        </div>
        <div className="absolute bottom-[12.5%] left-1/4 right-[12.5%] top-[47.202%]" data-name="Vector" id="node-2_18">
          <div className="absolute bottom-[-10.34%] left-[-6.667%] right-[-6.667%] top-[-10.34%]" style={{"--stroke-0": "rgba(255, 255, 255, 0.9)"} as React.CSSProperties}>
            <img alt="" className="block max-w-none size-full" src={imgVector2} />
          </div>
        </div>
      </div>
    );
  }
  if (variant === "3") {
    return (
      <div className="relative size-full" data-name="variant=3" id="node-2_28">
        <div className="absolute inset-[8.333%]" data-name="Vector" id="node-2_23">
          <div className="absolute inset-[-5%]" style={{"--stroke-0": "rgba(255, 255, 255, 0.9)"} as React.CSSProperties}>
            <img alt="" className="block max-w-none size-full" src={imgVector3} />
          </div>
        </div>
        <div className="absolute bottom-[70.833%] left-[54.167%] right-[41.667%] top-1/4" data-name="Vector" id="node-2_24">
          <div className="absolute inset-[-100%]" style={{"--fill-0": "rgba(255, 255, 255, 1)", "--stroke-0": "rgba(255, 255, 255, 0.9)"} as React.CSSProperties}>
            <img alt="" className="block max-w-none size-full" src={imgVector4} />
          </div>
        </div>
        <div className="absolute bottom-[54.167%] left-[70.833%] right-1/4 top-[41.667%]" data-name="Vector" id="node-2_25">
          <div className="absolute inset-[-100%]" style={{"--fill-0": "rgba(255, 255, 255, 1)", "--stroke-0": "rgba(255, 255, 255, 0.9)"} as React.CSSProperties}>
            <img alt="" className="block max-w-none size-full" src={imgVector4} />
          </div>
        </div>
        <div className="absolute bottom-[45.833%] left-1/4 right-[70.833%] top-1/2" data-name="Vector" id="node-2_26">
          <div className="absolute inset-[-100%]" style={{"--fill-0": "rgba(255, 255, 255, 1)", "--stroke-0": "rgba(255, 255, 255, 0.9)"} as React.CSSProperties}>
            <img alt="" className="block max-w-none size-full" src={imgVector4} />
          </div>
        </div>
        <div className="absolute bottom-[66.667%] left-[33.333%] right-[62.5%] top-[29.167%]" data-name="Vector" id="node-2_27">
          <div className="absolute inset-[-100%]" style={{"--fill-0": "rgba(255, 255, 255, 1)", "--stroke-0": "rgba(255, 255, 255, 0.9)"} as React.CSSProperties}>
            <img alt="" className="block max-w-none size-full" src={imgVector4} />
          </div>
        </div>
      </div>
    );
  }
  if (variant === "4") {
    return (
      <div className="relative size-full" data-name="variant=4" id="node-2_33">
        <div className="absolute bottom-[16.667%] left-1/2 right-1/2 top-[16.667%]" data-name="Vector" id="node-2_30">
          <div className="absolute bottom-[-6.25%] left-[-0.583px] right-[-0.583px] top-[-6.25%]" style={{"--stroke-0": "rgba(255, 255, 255, 0.9)"} as React.CSSProperties}>
            <img alt="" className="block max-w-none size-full" src={imgVector5} />
          </div>
        </div>
        <div className="absolute bottom-[70.833%] left-[16.667%] right-[16.667%] top-[16.667%]" data-name="Vector" id="node-2_31">
          <div className="absolute bottom-[-33.333%] left-[-6.25%] right-[-6.25%] top-[-33.333%]" style={{"--stroke-0": "rgba(255, 255, 255, 0.9)"} as React.CSSProperties}>
            <img alt="" className="block max-w-none size-full" src={imgVector6} />
          </div>
        </div>
        <div className="absolute bottom-[16.667%] left-[37.5%] right-[37.5%] top-[83.333%]" data-name="Vector" id="node-2_32">
          <div className="absolute bottom-[-0.583px] left-[-16.667%] right-[-16.667%] top-[-0.583px]" style={{"--stroke-0": "rgba(255, 255, 255, 0.9)"} as React.CSSProperties}>
            <img alt="" className="block max-w-none size-full" src={imgVector7} />
          </div>
        </div>
      </div>
    );
  }
  if (variant === "5") {
    return (
      <div className="relative size-full" data-name="variant=5" id="node-2_36">
        <div className="absolute bottom-[8.333%] left-[16.667%] right-[16.667%] top-[8.333%]" data-name="Vector" id="node-2_35">
          <div className="absolute bottom-[-5%] left-[-6.25%] right-[-6.25%] top-[-5%]" style={{"--stroke-0": "rgba(255, 255, 255, 0.9)"} as React.CSSProperties}>
            <img alt="" className="block max-w-none size-full" src={imgVector8} />
          </div>
        </div>
      </div>
    );
  }
  if (variant === "6") {
    return (
      <div className="relative size-full" data-name="variant=6" id="node-2_43">
        <div className="absolute bottom-[8.333%] left-[16.667%] right-[16.667%] top-[8.333%]" data-name="Vector" id="node-2_38">
          <div className="absolute bottom-[-5%] left-[-6.25%] right-[-6.25%] top-[-5%]" style={{"--stroke-0": "rgba(255, 255, 255, 0.9)"} as React.CSSProperties}>
            <img alt="" className="block max-w-none size-full" src={imgVector9} />
          </div>
        </div>
        <div className="absolute bottom-[66.667%] left-[58.333%] right-[16.667%] top-[8.333%]" data-name="Vector" id="node-2_39">
          <div className="absolute inset-[-16.667%]" style={{"--stroke-0": "rgba(255, 255, 255, 0.9)"} as React.CSSProperties}>
            <img alt="" className="block max-w-none size-full" src={imgVector10} />
          </div>
        </div>
        <div className="absolute bottom-[62.5%] left-[33.333%] right-[58.333%] top-[37.5%]" data-name="Vector" id="node-2_40">
          <div className="absolute bottom-[-0.583px] left-[-50%] right-[-50%] top-[-0.583px]" style={{"--stroke-0": "rgba(255, 255, 255, 0.9)"} as React.CSSProperties}>
            <img alt="" className="block max-w-none size-full" src={imgVector11} />
          </div>
        </div>
        <div className="absolute bottom-[45.833%] left-[33.333%] right-[33.333%] top-[54.167%]" data-name="Vector" id="node-2_41">
          <div className="absolute bottom-[-0.583px] left-[-12.5%] right-[-12.5%] top-[-0.583px]" style={{"--stroke-0": "rgba(255, 255, 255, 0.9)"} as React.CSSProperties}>
            <img alt="" className="block max-w-none size-full" src={imgVector12} />
          </div>
        </div>
        <div className="absolute bottom-[29.167%] left-[33.333%] right-[33.333%] top-[70.833%]" data-name="Vector" id="node-2_42">
          <div className="absolute bottom-[-0.583px] left-[-12.5%] right-[-12.5%] top-[-0.583px]" style={{"--stroke-0": "rgba(255, 255, 255, 0.9)"} as React.CSSProperties}>
            <img alt="" className="block max-w-none size-full" src={imgVector12} />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="relative size-full" data-name="variant=1" id="node-2_10">
      <div className="absolute bottom-1/2 left-[20.833%] right-[20.833%] top-[20.833%]" data-name="Vector" id="node-2_8">
        <div className="absolute bottom-[-14.286%] left-[-7.143%] right-[-7.143%] top-[-14.286%]" style={{"--stroke-0": "rgba(255, 255, 255, 1)"} as React.CSSProperties}>
          <img alt="" className="block max-w-none size-full" src={imgVector13} />
        </div>
      </div>
      <div className="absolute bottom-[20.833%] left-1/2 right-1/2 top-[20.833%]" data-name="Vector" id="node-2_9">
        <div className="absolute bottom-[-7.143%] left-[-0.583px] right-[-0.583px] top-[-7.143%]" style={{"--stroke-0": "rgba(255, 255, 255, 1)"} as React.CSSProperties}>
          <img alt="" className="block max-w-none size-full" src={imgVector14} />
        </div>
      </div>
    </div>
  );
}

export default function Component1920WLight() {
  const router = useRouter();

  return (
    <div className="bg-white box-border flex flex-col items-center justify-start pt-0 px-0 relative min-h-screen w-full overflow-x-hidden">
      
      {/* Navigation Bar - Logo and Auth Buttons */}
      <div className="relative z-10 box-border flex flex-row items-center justify-between max-w-6xl 2xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 w-full">
        <div className="bg-center bg-contain bg-no-repeat h-[32px] sm:h-[36px] md:h-[40px] shrink-0 w-[100px] sm:w-[115px] md:w-[130px]" style={{ backgroundImage: `url('${imgLogo41}')` }} />
        
        {/* Auth Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
          <a
            href="/login"
            className="text-sm sm:text-base font-medium px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 rounded-full transition-colors whitespace-nowrap active:bg-gray-100 touch-manipulation"
            style={{ color: '#002903' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            Login
          </a>
          <a
            href="/signup"
            className="text-sm sm:text-base font-medium text-white px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 rounded-full transition-colors whitespace-nowrap active:opacity-90 touch-manipulation"
            style={{ backgroundColor: '#002903' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#001a02'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#002903'}
          >
            Sign Up
          </a>
        </div>
      </div>
      {/* Main Content: left-aligned layout */}
      <main className="relative z-10 flex flex-col items-start justify-start w-full flex-1 px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 md:pt-12 lg:pt-16 xl:pt-20 pb-8 sm:pb-12 md:pb-16 max-w-6xl 2xl:max-w-7xl mx-auto">
        {/* Main Content Row - Title and Upload Container */}
        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 md:gap-10 lg:gap-8 xl:gap-10 items-start justify-between w-full mb-12">
          {/* Left Side - Title and Description */}
          <div className="flex-shrink-0 w-full lg:w-[35%] xl:w-[38%]">
            {/* Customer Avatars */}
            <div className="flex items-center gap-3 mb-4 md:mb-5">
              <div className="flex -space-x-2">
                <img 
                  src="/Ellipse.png" 
                  alt="Customer" 
                  className="w-10 h-10 rounded-full border-2 border-white object-cover"
                />
                <img 
                  src="/Ellipse (1).png" 
                  alt="Customer" 
                  className="w-10 h-10 rounded-full border-2 border-white object-cover"
                />
                <img 
                  src="/Ellipse (2).png" 
                  alt="Customer" 
                  className="w-10 h-10 rounded-full border-2 border-white object-cover"
                />
              </div>
              <p className="text-sm sm:text-base text-gray-600">
                Used by <span className="font-semibold text-gray-900">1353</span> happy customers
              </p>
            </div>
            
            {/* Heading */}
            <h1 className="font-helvetica-neue text-[2rem] sm:text-[2.25rem] md:text-[2.75rem] lg:text-[2.5rem] xl:text-[3rem] 2xl:text-[3.65rem] font-normal leading-[1.15] sm:leading-tight mb-4 md:mb-5 text-left tracking-tighter" style={{ color: '#002903' }}>
              Transform your Excel into a professional data presentation
            </h1>
            {/* Subheading */}
            <p className="max-w-full text-left text-[14px] sm:text-[15px] md:text-[16px] lg:text-[17px] 2xl:text-lg font-sans mb-5 md:mb-6 leading-relaxed" style={{ color: '#002903' }}>
              Unlock the potential of your Excel data with our AI-powered storytelling and presentation generator.
            </p>
            
            {/* Get Started Button */}
            <button
              onClick={() => router.push('/signup')}
              className="text-sm sm:text-base font-medium text-white px-6 sm:px-7 md:px-8 py-3 sm:py-3.5 rounded-full transition-all duration-200 whitespace-nowrap active:opacity-90 touch-manipulation shadow-lg hover:shadow-xl hover:scale-[1.02]"
              style={{ backgroundColor: '#002903' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#001a02'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#002903'}
            >
              Get Started
            </button>
          </div>
          
          {/* Right Side - Upload Container (from Editor) - Moved Further Right */}
          <div className="relative w-full lg:w-[60%] xl:w-[58%] mt-6 sm:mt-8 lg:mt-0 flex flex-col items-end">
            {/* Free Credits Badge */}
            <div className="w-full max-w-md mb-4 flex justify-start">
              <div className="flex items-center gap-3">
                <img 
                  src="/ai credit-icon.png" 
                  alt="Credits" 
                  className="w-6 h-6 object-contain"
                />
                <span className="text-base font-medium" style={{ color: '#002903' }}>Get 50 free credits by signing up</span>
              </div>
            </div>
            
            <div 
              className="relative w-full max-w-md cursor-pointer"
              onClick={() => router.push('/signup')}
            >
              <div 
                className="bg-white rounded-3xl p-6 sm:p-8 lg:p-12 shadow-xl border-4 border-gray-200 min-h-[300px] sm:min-h-[350px] lg:min-h-[400px] flex flex-col items-center justify-center relative transition-all duration-200 hover:shadow-2xl hover:scale-[1.02]"
              >
                {/* Layered Cards Background */}
                <div className="absolute inset-2 sm:inset-4 flex items-start justify-center pt-4 sm:pt-8 group">
                  {/* Back card */}
                  <div className="absolute w-32 h-40 sm:w-36 sm:h-44 lg:w-40 lg:h-48 bg-white rounded-2xl shadow-lg border border-gray-200 transform rotate-3 translate-x-2 translate-y-2 transition-transform duration-300 group-hover:translate-x-6"></div>
                  {/* Middle card */}
                  <div className="absolute w-32 h-40 sm:w-36 sm:h-44 lg:w-40 lg:h-48 bg-white rounded-2xl shadow-lg border border-gray-200 transform -rotate-1 translate-x-1 translate-y-1 transition-transform duration-300 group-hover:-translate-x-4"></div>
                  {/* Front card */}
                  <div className="relative w-32 h-40 sm:w-36 sm:h-44 lg:w-40 lg:h-48 bg-white rounded-2xl shadow-lg border border-gray-200 flex flex-col items-center justify-start p-3 sm:p-4 transition-transform duration-300">
                    {/* Document header lines */}
                    <div className="w-full mb-6">
                      <div className="h-1.5 bg-gray-200 rounded mb-2"></div>
                      <div className="h-1.5 bg-gray-200 rounded w-2/3 mb-2"></div>
                      <div className="h-1.5 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    
                    {/* Google Sheets icon in center */}
                    <div className="flex-1 flex items-center justify-center">
                      <img src="/google-sheets.png" alt="Google Sheets" className="w-12 h-16 sm:w-14 sm:h-18 lg:w-16 lg:h-20 object-contain" />
                    </div>
                  </div>
                </div>
                
                <div className="relative z-10 mt-32 sm:mt-40 lg:mt-48">
                  <h3 className="text-base sm:text-lg font-semibold mb-2 text-center" style={{ color: '#002903' }}>Upload Files</h3>
                  <p className="text-center mb-2 sm:mb-3 text-xs sm:text-sm" style={{ color: '#002903' }}>
                    Drag and drop your files here, or{' '}
                    <span className="text-blue-500 hover:underline">
                      click to select
                    </span>.
                  </p>
                  <p className="text-xs text-center mt-2" style={{ color: '#002903' }}>Support formats: .xlsx, .xsl, .csv</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Demo Video - Full Width Below */}
        <div className="w-full mt-6 sm:mt-8 md:mt-10">
          <video 
            key="demo-video"
            className="w-full h-auto rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg sm:shadow-xl lg:shadow-2xl border-4 border-gray-200"
            autoPlay
            muted
            loop
            playsInline
            onLoadedData={(e) => {
              e.currentTarget.currentTime = 0;
              e.currentTarget.play();
            }}
          >
            <source src="/Slaid : Demo.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Bento Card Section */}
        <div className="w-full mt-12 sm:mt-16 md:mt-20 lg:mt-24">
          {/* Section Title */}
          <h2 className="font-helvetica-neue text-[2rem] sm:text-[2.25rem] md:text-[2.75rem] lg:text-[2.5rem] xl:text-[3rem] 2xl:text-[3.65rem] font-normal leading-[1.15] sm:leading-tight mb-4 text-center tracking-tighter" style={{ color: '#002903' }}>
            Unlock the power of your data
          </h2>
          
          {/* Section Description */}
          <p className="text-center text-base sm:text-lg text-gray-600 max-w-3xl mx-auto mb-8 sm:mb-10 md:mb-12 leading-relaxed px-4">
            Slaid doesn't just turn spreadsheets into visual reports — it acts like an analyst, interpreting your data, spotting patterns, and suggesting clear, actionable insights.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            
            {/* Row 1, Card 1 - Smart Excel Analysis (1 col) */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border-[4px] border-gray-200">
              {/* Excel Analysis Image */}
              <div className="w-full h-48 sm:h-56 bg-gray-100 rounded-xl mb-6 overflow-hidden flex items-center justify-center">
                <img 
                  src="/excel-analysis.png" 
                  alt="Excel Analysis" 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <h3 className="text-xl sm:text-2xl font-semibold mb-3" style={{ color: '#002903' }}>
                Smart Excel Analysis
              </h3>
              <p className="text-base sm:text-lg font-medium mb-3" style={{ color: '#002903' }}>
                Let AI do the number crunching.
              </p>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Upload any spreadsheet and Slaid will automatically analyze your data — no formulas, no pivot tables. From trends to anomalies, it detects what matters most and gets to work instantly.
              </p>
            </div>

            {/* Row 1, Card 2 - Slide-Ready Reports (2 cols - wider) */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border-[4px] border-gray-200 md:col-span-2">
              {/* Slide-Ready Image */}
              <div className="w-full h-56 sm:h-64 md:h-72 bg-gray-100 rounded-xl mb-6 overflow-hidden flex items-center justify-start">
                <img 
                  src="/Slide-Ready.png" 
                  alt="Slide-Ready Reports" 
                  className="w-full h-full object-cover object-left"
                />
              </div>
              
              <h3 className="text-xl sm:text-2xl font-semibold mb-3" style={{ color: '#002903' }}>
                Slide-Ready Reports
              </h3>
              <p className="text-base sm:text-lg font-medium mb-3" style={{ color: '#002903' }}>
                From raw data to polished storytelling.
              </p>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Turn your analysis into a structured presentation with titles, charts, summaries and key takeaways. No design skills needed — everything is laid out for clarity and impact.
              </p>
            </div>

            {/* Row 2, Card 3 - Interactive Charts (2 cols - wider) */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border-[4px] border-gray-200 md:col-span-2">
              <h3 className="text-xl sm:text-2xl font-semibold mb-3" style={{ color: '#002903' }}>
                Interactive Charts
              </h3>
              <p className="text-base sm:text-lg font-medium mb-3" style={{ color: '#002903' }}>
                Explore, filter, and highlight what matters.
              </p>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-6">
                Charts in Slaid aren't static images. You can click, explore, and dig deeper into the numbers — making it easier to find insights and adapt visuals before exporting.
              </p>
              
              {/* Area Chart */}
              <div className="w-full h-56 sm:h-64 md:h-72 -ml-4">
                <ChartBlock
                  id="interactive-area-chart"
                  type="area"
                  labels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']}
                  series={[
                    { id: 'Revenue', data: [6.5, 11.2, 9.8, 15.1, 18.2, 24.5], color: '#4A3AFF' },
                    { id: 'GMV', data: [5.8, 10.5, 9.2, 13.8, 17.1, 21.8], color: '#C893FD' }
                  ]}
                  showLegend={true}
                  showGrid={true}
                  stacked={false}
                  curved={true}
                  animate={true}
                  showDots={false}
                  className="w-full h-full"
                />
              </div>
            </div>

            {/* Row 2, Card 4 - Edit in PowerPoint (1 col) */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border-[4px] border-gray-200">
              {/* PowerPoint Button Container */}
              <div className="w-full h-48 sm:h-56 bg-gray-100 rounded-xl mb-6 flex items-center justify-center p-4">
                <button 
                  className="flex items-center justify-between bg-white hover:bg-gray-50 text-gray-900 font-medium py-3 px-5 rounded-lg transition border-2 border-gray-200 hover:border-gray-300 cursor-pointer w-full max-w-xs"
                  onClick={() => router.push('/signup')}
                >
                  <div className="flex items-center gap-3">
                    <img src="/power-point.png" alt="PowerPoint" className="w-7 h-7 object-contain" />
                    <span className="text-sm sm:text-base">Edit in PowerPoint</span>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              
              <h3 className="text-xl sm:text-2xl font-semibold mb-3" style={{ color: '#002903' }}>
                Edit in PowerPoint
              </h3>
              <p className="text-base sm:text-lg font-medium mb-3" style={{ color: '#002903' }}>
                Make it yours — with your tools.
              </p>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Export your report to PowerPoint or your favorite editor. You're free to tweak every slide or drop it straight into your workflow, fully editable.
              </p>
            </div>

          </div>
          </div>

        {/* FAQ Section */}
        <div className="w-full mt-16 sm:mt-20 md:mt-24 lg:mt-28">
          {/* Section Title */}
          <h2 className="font-helvetica-neue text-[2rem] sm:text-[2.25rem] md:text-[2.75rem] lg:text-[2.5rem] xl:text-[3rem] 2xl:text-[3.65rem] font-normal leading-[1.15] sm:leading-tight mb-8 sm:mb-10 md:mb-12 text-center tracking-tighter" style={{ color: '#002903' }}>
            Frequently Asked Questions
          </h2>

          <div className="max-w-3xl mx-auto space-y-4">
            
            {/* FAQ Item 1 */}
            <details className="group bg-white border-[4px] border-gray-200 rounded-2xl p-6">
              <summary className="flex justify-between items-center cursor-pointer list-none">
                <h3 className="text-lg font-semibold" style={{ color: '#002903' }}>
                  How does Slaid analyze my Excel data?
                </h3>
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24" style={{ color: '#002903' }}>
                    <path d="M6 9l6 6 6-6"></path>
                  </svg>
                </span>
              </summary>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Slaid uses advanced AI to automatically detect patterns, trends, and insights in your spreadsheet. Simply upload your Excel file, and our AI will analyze the data structure, identify key metrics, and generate meaningful visualizations without requiring any manual setup.
              </p>
            </details>

            {/* FAQ Item 2 */}
            <details className="group bg-white border-[4px] border-gray-200 rounded-2xl p-6">
              <summary className="flex justify-between items-center cursor-pointer list-none">
                <h3 className="text-lg font-semibold" style={{ color: '#002903' }}>
                  Can I edit the presentation after it's generated?
                </h3>
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24" style={{ color: '#002903' }}>
                    <path d="M6 9l6 6 6-6"></path>
                  </svg>
                </span>
              </summary>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Yes! You can export your presentation to PowerPoint for full editing capabilities. All text remains editable, and charts are preserved as high-quality images. This allows you to customize every detail using the tools you already know.
              </p>
            </details>

            {/* FAQ Item 3 */}
            <details className="group bg-white border-[4px] border-gray-200 rounded-2xl p-6">
              <summary className="flex justify-between items-center cursor-pointer list-none">
                <h3 className="text-lg font-semibold" style={{ color: '#002903' }}>
                  What file formats does Slaid support?
                </h3>
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24" style={{ color: '#002903' }}>
                    <path d="M6 9l6 6 6-6"></path>
                  </svg>
                </span>
              </summary>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Slaid currently supports .xlsx, .xls, and .csv file formats. You can upload spreadsheets from Excel, Google Sheets (exported as .xlsx), or any other application that exports to these standard formats.
              </p>
            </details>

            {/* FAQ Item 4 */}
            <details className="group bg-white border-[4px] border-gray-200 rounded-2xl p-6">
              <summary className="flex justify-between items-center cursor-pointer list-none">
                <h3 className="text-lg font-semibold" style={{ color: '#002903' }}>
                  How many credits do I need to create a presentation?
                </h3>
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24" style={{ color: '#002903' }}>
                    <path d="M6 9l6 6 6-6"></path>
                  </svg>
                </span>
              </summary>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Credit usage depends on the number of slides you generate. Smaller presentations (5 slides) use fewer credits, while larger presentations (15+ slides) require more. New users get 50 free credits to get started, and you can always upgrade your plan for more credits.
              </p>
            </details>

            {/* FAQ Item 5 */}
            <details className="group bg-white border-[4px] border-gray-200 rounded-2xl p-6">
              <summary className="flex justify-between items-center cursor-pointer list-none">
                <h3 className="text-lg font-semibold" style={{ color: '#002903' }}>
                  Is my data secure?
                </h3>
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24" style={{ color: '#002903' }}>
                    <path d="M6 9l6 6 6-6"></path>
                  </svg>
                </span>
              </summary>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Absolutely. Your data is encrypted in transit and at rest. We never share your data with third parties, and you maintain full ownership of all uploaded files and generated presentations. You can delete your data at any time from your account settings.
              </p>
            </details>

          </div>
        </div>

        </main>

        {/* Footer */}
        <footer className="w-full border-t border-gray-200 bg-white mt-16 sm:mt-20 md:mt-24">
          <div className="max-w-6xl 2xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              
              {/* Logo and Slogan */}
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <img 
                    src="/basic-plan.png" 
                    alt="Slaid Logo" 
                    className="w-8 h-8 object-contain"
                  />
                  <span className="text-xl font-semibold" style={{ color: '#002903' }}>Slaid</span>
                </div>
                <p className="text-sm text-gray-600">
                  Transform your Excel into professional data presentations with AI-powered insights.
                </p>
              </div>

              {/* Menu Section */}
              <div>
                <h3 className="text-sm font-semibold mb-4" style={{ color: '#002903' }}>Menu</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="/" className="text-sm text-gray-600 hover:text-gray-900 transition">
                      Home
                    </a>
                  </li>
                  <li>
                    <a href="/editor" className="text-sm text-gray-600 hover:text-gray-900 transition">
                      Editor
                    </a>
                  </li>
                  <li>
                    <a href="/pricing" className="text-sm text-gray-600 hover:text-gray-900 transition">
                      Pricing
                    </a>
                  </li>
                  <li>
                    <a href="/login" className="text-sm text-gray-600 hover:text-gray-900 transition">
                      Login
                    </a>
                  </li>
                  <li>
                    <a href="/signup" className="text-sm text-gray-600 hover:text-gray-900 transition">
                      Sign Up
                    </a>
                  </li>
                </ul>
              </div>

              {/* Policies Section */}
              <div>
                <h3 className="text-sm font-semibold mb-4" style={{ color: '#002903' }}>Policies</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="/privacy" className="text-sm text-gray-600 hover:text-gray-900 transition">
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a href="/terms" className="text-sm text-gray-600 hover:text-gray-900 transition">
                      Terms of Service
                    </a>
                  </li>
                  <li>
                    <a href="/cookies" className="text-sm text-gray-600 hover:text-gray-900 transition">
                      Cookie Policy
                    </a>
                  </li>
                </ul>
              </div>

            </div>

            {/* Copyright */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center">
                © {new Date().getFullYear()} Slaid. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    );
  }
