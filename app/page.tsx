"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ChartBlock from "../components/blocks/ChartBlock";
import Head from "next/head";
import { useLanguage } from "../hooks/useLanguage";
import { getTranslations } from "../lib/translations";

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
  const { language, changeLanguage, isLoading } = useLanguage();
  const t = getTranslations(language);

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Slaid",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "description": "Get 50 free credits to start"
    },
    "description": "Transform your Excel data into professional presentations instantly with AI. Smart analysis, interactive charts, and PowerPoint-ready reports.",
    "url": "https://slaidapp.com",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "1353"
    },
    "featureList": [
      "Smart Excel Analysis",
      "AI-Powered Insights",
      "Interactive Charts",
      "PowerPoint Export",
      "Slide-Ready Reports"
    ]
  };

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <div className="bg-white box-border flex flex-col items-center justify-start pt-0 px-0 relative min-h-screen w-full overflow-x-hidden">
      
      {/* Navigation Bar - Logo, Language Switcher and Auth Buttons */}
      <div className="relative z-10 box-border flex flex-row items-center justify-between max-w-6xl 2xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 w-full">
        <div className="bg-center bg-contain bg-no-repeat h-[32px] sm:h-[36px] md:h-[40px] shrink-0 w-[100px] sm:w-[115px] md:w-[130px]" style={{ backgroundImage: `url('${imgLogo41}')` }} />
        
        {/* Auth Buttons and Language Switcher */}
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
          {/* Language Switcher */}
          <div className="flex items-center gap-1 border border-gray-300 rounded-full p-1">
            <button
              onClick={() => changeLanguage('en')}
              className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium transition ${
                language === 'en' 
                  ? 'bg-[#002903] text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => changeLanguage('es')}
              className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium transition ${
                language === 'es' 
                  ? 'bg-[#002903] text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              ES
            </button>
          </div>
          
          <a
            href="/login"
            className="text-sm sm:text-base font-medium px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 rounded-full transition-colors whitespace-nowrap active:bg-gray-100 touch-manipulation"
            style={{ color: '#002903' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            {t.nav.login}
          </a>
          <a
            href="/signup"
            className="text-sm sm:text-base font-medium text-white px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 rounded-full transition-colors whitespace-nowrap active:opacity-90 touch-manipulation"
            style={{ backgroundColor: '#002903' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#001a02'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#002903'}
          >
            {t.nav.signup}
          </a>
        </div>
      </div>
      {/* Main Content: left-aligned layout */}
      <main className="relative z-10 flex flex-col items-start justify-start w-full flex-1 px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 md:pt-12 lg:pt-16 xl:pt-20 pb-8 sm:pb-12 md:pb-16 max-w-6xl 2xl:max-w-7xl mx-auto">
        {/* Main Content Row - Title and Description (Centered) */}
        <div className="flex flex-col items-center justify-center w-full mb-8 text-center max-w-4xl mx-auto">
          {/* Customer Avatars */}
          <div className="flex flex-col items-center gap-2 mb-4 md:mb-5">
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
              {t.home.customersText} <span className="font-semibold text-gray-900">1353</span> {t.home.happyCustomers}
            </p>
          </div>
          
          {/* Heading */}
          <h1 className="font-helvetica-neue text-[2rem] sm:text-[2.25rem] md:text-[2.75rem] lg:text-[2.5rem] xl:text-[3rem] 2xl:text-[3.65rem] font-normal leading-[1.15] sm:leading-tight mb-4 md:mb-5 tracking-tighter" style={{ color: '#002903' }}>
            {t.home.mainTitle}
          </h1>
          {/* Subheading */}
          <p className="max-w-full text-[14px] sm:text-[15px] md:text-[16px] lg:text-[17px] 2xl:text-lg font-sans mb-5 md:mb-6 leading-relaxed" style={{ color: '#002903' }}>
            {t.home.subtitle}
          </p>
          
          {/* Get Started Button */}
          <button
            onClick={() => router.push('/signup')}
            className="text-sm sm:text-base font-medium text-white px-6 sm:px-7 md:px-8 py-3 sm:py-3.5 rounded-full transition-all duration-200 whitespace-nowrap active:opacity-90 touch-manipulation shadow-lg hover:shadow-xl hover:scale-[1.02] flex items-center gap-2"
            style={{ backgroundColor: '#002903' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#001a02'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#002903'}
          >
            {t.home.getStarted}
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 sm:h-5 sm:w-5" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" 
                clipRule="evenodd" 
              />
            </svg>
          </button>
        </div>
          
        {/* Demo Video - Full Width Below */}
        <div className="w-full mt-4 sm:mt-6 md:mt-8">
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
              <source src="/Slaid video 2.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
        </div>

        {/* Bento Card Section */}
        <div className="w-full mt-12 sm:mt-16 md:mt-20 lg:mt-24">
          {/* Section Title */}
          <h2 className="font-helvetica-neue text-[2rem] sm:text-[2.25rem] md:text-[2.75rem] lg:text-[2.5rem] xl:text-[3rem] 2xl:text-[3.65rem] font-normal leading-[1.15] sm:leading-tight mb-4 text-center tracking-tighter" style={{ color: '#002903' }}>
            {t.home.bentoTitle}
          </h2>
          
          {/* Section Description */}
          <p className="text-center text-base sm:text-lg text-gray-600 max-w-3xl mx-auto mb-8 sm:mb-10 md:mb-12 leading-relaxed px-4">
            {t.home.bentoDescription}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            
            {/* Row 1, Card 1 - Smart Excel Analysis (1 col) */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border-2 border-gray-200">
              {/* Excel Analysis Image */}
              <div className="w-full h-48 sm:h-56 bg-gray-100 rounded-xl mb-6 overflow-hidden flex items-center justify-end">
                <img 
                  src="/excel-analysis.png" 
                  alt="Excel Analysis" 
                  className="w-full h-full object-cover object-right"
                />
              </div>
              
              <h3 className="text-base sm:text-lg font-semibold mb-3" style={{ color: '#002903' }}>
                {t.home.smartExcelTitle}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                {t.home.smartExcelDescription}
              </p>
            </div>

            {/* Row 1, Card 2 - Slide-Ready Reports (2 cols - wider) */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border-2 border-gray-200 md:col-span-2">
              {/* Slide-Ready Image */}
              <div className="w-full h-56 sm:h-64 md:h-72 bg-gray-100 rounded-xl mb-6 overflow-hidden flex items-center justify-start">
                <img 
                  src="/Slide-Ready.png" 
                  alt="Slide-Ready Reports" 
                  className="w-full h-full object-cover object-left"
                />
              </div>
              
              <h3 className="text-base sm:text-lg font-semibold mb-3" style={{ color: '#002903' }}>
                {t.home.slideReadyTitle}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                {t.home.slideReadyDescription}
              </p>
            </div>

            {/* Row 2, Card 3 - Interactive Charts (2 cols - wider) */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border-2 border-gray-200 md:col-span-2">
              <h3 className="text-base sm:text-lg font-semibold mb-3" style={{ color: '#002903' }}>
                {t.home.interactiveChartsTitle}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-6">
                {t.home.interactiveChartsDescription}
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
            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border-2 border-gray-200">
              {/* PowerPoint Button Container */}
              <div className="w-full h-48 sm:h-56 bg-gray-100 rounded-xl mb-6 flex items-center justify-center p-4">
                <button 
                  className="flex items-center justify-between bg-white hover:bg-gray-50 text-gray-900 font-medium py-3 px-5 rounded-lg transition border-2 border-gray-200 hover:border-gray-300 cursor-pointer w-full max-w-xs"
                  onClick={() => router.push('/signup')}
                >
                  <div className="flex items-center gap-3">
                    <img src="/power-point.png" alt="PowerPoint" className="w-7 h-7 object-contain" />
                    <span className="text-sm sm:text-base">{t.home.editPowerPointButton}</span>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              
              <h3 className="text-base sm:text-lg font-semibold mb-3" style={{ color: '#002903' }}>
                {t.home.editPowerPointTitle}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                {t.home.editPowerPointDescription}
              </p>
            </div>

          </div>
          </div>

        {/* FAQ Section */}
        <div className="w-full mt-16 sm:mt-20 md:mt-24 lg:mt-28">
          {/* Section Title */}
          <h2 className="font-helvetica-neue text-[2rem] sm:text-[2.25rem] md:text-[2.75rem] lg:text-[2.5rem] xl:text-[3rem] 2xl:text-[3.65rem] font-normal leading-[1.15] sm:leading-tight mb-8 sm:mb-10 md:mb-12 text-center tracking-tighter" style={{ color: '#002903' }}>
            {t.home.faqTitle}
          </h2>

          <div className="max-w-3xl mx-auto space-y-4 px-4">
            
            {/* FAQ Item 1 */}
            <details className="group bg-white border-2 border-gray-200 rounded-2xl p-4 sm:p-6">
              <summary className="flex justify-between items-center cursor-pointer list-none">
                <h3 className="text-base sm:text-lg font-semibold pr-4" style={{ color: '#002903' }}>
                  {t.home.faq1Question}
                </h3>
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24" style={{ color: '#002903' }}>
                    <path d="M6 9l6 6 6-6"></path>
                  </svg>
                </span>
              </summary>
              <p className="mt-4 text-gray-600 leading-relaxed">
                {t.home.faq1Answer}
              </p>
            </details>

            {/* FAQ Item 2 */}
            <details className="group bg-white border-2 border-gray-200 rounded-2xl p-4 sm:p-6">
              <summary className="flex justify-between items-center cursor-pointer list-none">
                <h3 className="text-base sm:text-lg font-semibold pr-4" style={{ color: '#002903' }}>
                  {t.home.faq2Question}
                </h3>
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24" style={{ color: '#002903' }}>
                    <path d="M6 9l6 6 6-6"></path>
                  </svg>
                </span>
              </summary>
              <p className="mt-4 text-gray-600 leading-relaxed">
                {t.home.faq2Answer}
              </p>
            </details>

            {/* FAQ Item 3 */}
            <details className="group bg-white border-2 border-gray-200 rounded-2xl p-4 sm:p-6">
              <summary className="flex justify-between items-center cursor-pointer list-none">
                <h3 className="text-base sm:text-lg font-semibold pr-4" style={{ color: '#002903' }}>
                  {t.home.faq3Question}
                </h3>
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24" style={{ color: '#002903' }}>
                    <path d="M6 9l6 6 6-6"></path>
                  </svg>
                </span>
              </summary>
              <p className="mt-4 text-gray-600 leading-relaxed">
                {t.home.faq3Answer}
              </p>
            </details>

            {/* FAQ Item 4 */}
            <details className="group bg-white border-2 border-gray-200 rounded-2xl p-4 sm:p-6">
              <summary className="flex justify-between items-center cursor-pointer list-none">
                <h3 className="text-base sm:text-lg font-semibold pr-4" style={{ color: '#002903' }}>
                  {t.home.faq4Question}
                </h3>
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24" style={{ color: '#002903' }}>
                    <path d="M6 9l6 6 6-6"></path>
                  </svg>
                </span>
              </summary>
              <p className="mt-4 text-gray-600 leading-relaxed">
                {t.home.faq4Answer}
              </p>
            </details>

            {/* FAQ Item 5 */}
            <details className="group bg-white border-2 border-gray-200 rounded-2xl p-4 sm:p-6">
              <summary className="flex justify-between items-center cursor-pointer list-none">
                <h3 className="text-base sm:text-lg font-semibold pr-4" style={{ color: '#002903' }}>
                  {t.home.faq5Question}
                </h3>
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24" style={{ color: '#002903' }}>
                    <path d="M6 9l6 6 6-6"></path>
                  </svg>
                </span>
              </summary>
              <p className="mt-4 text-gray-600 leading-relaxed">
                {t.home.faq5Answer}
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
                  {t.home.footerSlogan}
                </p>
              </div>

              {/* Menu Section */}
              <div>
                <h3 className="text-sm font-semibold mb-4" style={{ color: '#002903' }}>{t.home.footerMenuTitle}</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="/" className="text-sm text-gray-600 hover:text-gray-900 transition">
                      {t.home.footerHome}
                    </a>
                  </li>
                  <li>
                    <a href="/login" className="text-sm text-gray-600 hover:text-gray-900 transition">
                      {t.home.footerLogin}
                    </a>
                  </li>
                  <li>
                    <a href="/signup" className="text-sm text-gray-600 hover:text-gray-900 transition">
                      {t.home.footerSignup}
                    </a>
                  </li>
                </ul>
              </div>

              {/* Policies Section */}
              <div>
                <h3 className="text-sm font-semibold mb-4" style={{ color: '#002903' }}>{t.home.footerPoliciesTitle}</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="/privacy" className="text-sm text-gray-600 hover:text-gray-900 transition">
                      {t.home.footerPrivacy}
                    </a>
                  </li>
                  <li>
                    <a href="/terms" className="text-sm text-gray-600 hover:text-gray-900 transition">
                      {t.home.footerTerms}
                    </a>
                  </li>
                  <li>
                    <a href="/cookies" className="text-sm text-gray-600 hover:text-gray-900 transition">
                      {t.home.footerCookies}
                    </a>
                  </li>
                </ul>
              </div>

            </div>

            {/* Copyright */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center">
                © {new Date().getFullYear()} Slaid. {t.home.footerCopyright}
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
