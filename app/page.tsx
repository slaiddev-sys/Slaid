"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

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
const imgLogo41 = "/Slaid logo Official.png";
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

// Input component for text-based presentation generation
function HomeInput() {
  const [inputValue, setInputValue] = useState("");

  const handleGenerate = async () => {
    if (!inputValue.trim()) {
      return; // No input provided
    }

    // Redirect to signup page when button is activated (blue)
    window.location.href = '/signup';
  };

  return (
    <>
      <div className="relative w-full max-w-[784px] rounded-[14px] bg-[rgba(29,41,61,0.3)] shadow-2xl border border-white/5 backdrop-blur-md px-8 py-6 flex flex-col gap-4">

        {/* Text input mode */}
        <div className="flex flex-row items-center gap-4">
          <input
            className="flex-1 bg-transparent outline-none border-none text-white/90 placeholder-white/60 text-lg font-sans py-2 px-0"
            placeholder="Describe your slide presentation"
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleGenerate()}
          />
          <button
            onClick={handleGenerate}
            className={
              `rounded-full w-9 h-9 flex items-center justify-center shadow-md transition ` +
              (inputValue.trim()
                ? "bg-[#2563eb] hover:bg-[#1d4ed8] text-white"
                : "bg-[#45556c] hover:bg-[#314158] text-white/80") +
              " focus:outline-none"
            }
          >
            <span className="sr-only">Generate</span>
            <span className="inline-block">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
            </span>
          </button>
        </div>
        
        {/* Chips row */}
        <div className="flex flex-wrap gap-2 mt-2">
          {['Logo','Font','Excel','Word'].map((label, i) => (
            <button 
              key={label} 
              onClick={() => window.location.href = '/signup'}
              className="flex items-center gap-1 px-3 py-1 rounded-[8.75px] bg-[rgba(49,65,88,0.4)] text-white/90 text-xs font-medium font-sans border border-white/10 shadow hover:bg-[#314158] transition focus:outline-none"
            >
              {label === 'Logo' && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )}
              {label === 'Font' && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
                </svg>
              )}
              {label === 'Excel' && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 3v6h6" />
                </svg>
              )}
              {label === 'Word' && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              )}
              {label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Helper text */}
      <div className="mt-4 text-center text-xs text-white/50 font-sans">
        Press Enter to generate • Web interface
      </div>
    </>
  );
}

export default function Component1920WLight() {
  return (
    <div className="bg-[#0A0015] box-border flex flex-col items-center justify-start pb-[177px] pt-0 px-0 relative min-h-screen w-full">
      {/* Background overlays and gradients: even darker, premium look */}
      <div className="[background-size:109.03%_100%] absolute bg-no-repeat bg-top bottom-0 filter left-0 right-0 top-0 z-0 opacity-10 blur-[2px]" style={{ backgroundImage: `url('${imgImageBlur}')` }} />
      
      {/* Slides Showcase Background - Blended */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: `url('/slides-showcase.png')`,
            filter: 'blur(1px) brightness(0.4) contrast(1.2)'
          }}
        />
      </div>
      
      {/* Strong, dark gradient overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-br from-[#0A0015] via-[#0F0030] via-[#1A0033] via-[#1C0059] to-[#2A1B69] opacity-98" />
      {/* Intense soft purple radial glow behind heading */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-[#1C0059]/8 blur-3xl z-0" />
      <div className="absolute bottom-0 left-0 opacity-[0.06] right-0 top-0 z-0">
        {/* Overlay blurs (unchanged) */}
        <div className="absolute flex h-[0px] items-center justify-center left-[14.742px] top-[31.49px] w-[0px]">
          <div className="flex-none rotate-[12deg]">
            <div className="bg-[rgba(81,162,255,0.08)] blur-[6px] filter h-[154px] rounded-[12.75px] w-[252px]" data-name="Overlay+Blur" id="node-2_63" />
          </div>
        </div>
        <div className="absolute flex h-[0px] items-center justify-center right-[49.953px] top-[102.102px] w-[0px]">
          <div className="flex-none rotate-[354deg]">
            <div className="bg-[rgba(194,122,255,0.06)] blur-sm filter h-[126px] rounded-[8.75px] w-[196px]" data-name="Overlay+Blur" id="node-2_66" />
          </div>
        </div>
        <div className="absolute bottom-[106.309px] flex h-[0px] items-center justify-center left-[476.493px] w-[0px]">
          <div className="flex-none rotate-[3deg]">
            <div className="bg-[rgba(124,134,255,0.08)] blur-[6px] filter h-[140px] rounded-[8.75px] w-56" data-name="Overlay+Blur" id="node-2_69" />
          </div>
        </div>
        <div className="absolute flex h-[0px] items-center justify-center top-[147.619px] translate-x-[-50%] w-[0px]" style={{ left: "calc(50% + 105.002px)" }}>
          <div className="flex-none rotate-[348deg]">
            <div className="bg-[rgba(166,132,255,0.06)] blur-sm filter h-[133px] rounded-[12.75px] w-[210px]" data-name="Overlay+Blur" id="node-2_72" />
          </div>
        </div>
        <div className="absolute bottom-[44.038px] flex h-[0px] items-center justify-center right-[632.954px] w-[0px]">
          <div className="flex-none rotate-[6deg]">
            <div className="bg-[rgba(43,127,255,0.08)] blur-[6px] filter h-[147px] rounded-[8.75px] w-[238px]" data-name="Overlay+Blur" id="node-2_75" />
          </div>
        </div>
        <div className="absolute flex h-[0px] items-center justify-center right-[477.198px] top-[219.315px] w-[0px]">
          <div className="flex-none rotate-[357deg]">
            <div className="bg-[rgba(173,70,255,0.06)] blur-sm filter h-28 rounded-[8.75px] w-[182px]" data-name="Overlay+Blur" id="node-2_78" />
          </div>
        </div>
        <div className="absolute bottom-[152.965px] flex h-[0px] items-center justify-center left-[631.379px] w-[0px]">
          <div className="flex-none rotate-[9deg]">
            <div className="bg-[rgba(97,95,255,0.08)] blur-[6px] filter h-[126px] rounded-[12.75px] w-[203px]" data-name="Overlay+Blur" id="node-2_81" />
          </div>
        </div>
      </div>
      {/* Navigation Bar */}
      <div className="relative z-10 box-border flex flex-row items-center justify-center max-w-[1120px] px-[21px] py-3.5 w-full">
        <div className="flex flex-row items-start w-[359.33px]">
          <div className="bg-center bg-contain bg-no-repeat h-[36px] shrink-0 w-[120px]" style={{ backgroundImage: `url('${imgLogo41}')` }} />
        </div>
        <div className="flex flex-row items-center justify-center w-[359.33px]">
          <a className="text-[13.2px] text-white/80 font-sans hover:underline" href="#">Pricing</a>
        </div>
        <div className="flex flex-row gap-1 items-center justify-end w-[359.34px]">
          <button 
            onClick={() => window.location.href = '/login'}
            className="h-[31.5px] px-3.5 py-1.5 rounded-[6.75px] text-white text-[13.2px] font-medium font-sans bg-transparent hover:bg-white/10 transition shadow-sm"
          >
            Login
          </button>
          <button 
            onClick={() => window.location.href = '/signup'}
            className="h-[31.5px] px-3.5 py-1.5 rounded-[6.75px] text-black text-[13.2px] font-medium font-sans bg-white hover:bg-white/80 hover:text-black hover:shadow-md transition-all duration-200 shadow focus:outline-none"
          >
            Sign Up
          </button>
        </div>
      </div>
      {/* Main Content: adjust top padding for better vertical centering */}
      <main className="relative z-10 flex flex-col items-center justify-center w-full min-h-screen px-4 pt-24 pb-0" style={{ justifyContent: 'flex-start', minHeight: '80vh' }}>
        {/* Tagline */}
        <div className="mb-6 flex items-center justify-center relative">
          <span className="backdrop-blur-md bg-[rgba(29,41,61,0.4)] rounded-full px-6 py-2 flex items-center gap-2 shadow-md border border-white/10">
            <span className="inline-block w-2 h-2 bg-[#51a2ff] rounded-full shadow-[0_2px_8px_0_rgba(81,162,255,0.5)]"></span>
            <span className="text-white text-xs font-medium font-sans">AI assistant to build presentations</span>
          </span>
        </div>
        {/* Heading */}
        <h1 className="font-instrument-serif flex flex-row items-center justify-center text-[2.8rem] sm:text-[3.3rem] md:text-[3.7rem] lg:text-[52.5px] font-normal text-white leading-tight mb-2">
          <span>Design presentations that&nbsp;</span>
          <span className="relative inline-flex items-center pl-4 pr-3 py-1 border-2 border-[#51a2ff] shadow-[0_8px_32px_-8px_rgba(81,162,255,0.25)] bg-gradient-to-br from-[#51a2ff22] to-[#9810fa22] text-white">
            <TypewriterWord />
            {/* Four white dots with blue border, one at each corner */}
            <span className="absolute left-[-3.5px] top-[-3.5px] w-[7px] h-[7px] bg-white border-2 border-[#51a2ff]" />
            <span className="absolute right-[-3.5px] top-[-3.5px] w-[7px] h-[7px] bg-white border-2 border-[#51a2ff]" />
            <span className="absolute left-[-3.5px] bottom-[-3.5px] w-[7px] h-[7px] bg-white border-2 border-[#51a2ff]" />
            <span className="absolute right-[-3.5px] bottom-[-3.5px] w-[7px] h-[7px] bg-white border-2 border-[#51a2ff]" />
          </span>
        </h1>
        {/* Subheading */}
        <p className="max-w-[588px] text-center text-[16.3px] text-white/80 font-sans mb-8">Presentations designed to fit your brand, not the other way around.</p>
        {/* Input Card */}
        <HomeInput />
        {/* Preset Buttons */}
        <div className="flex flex-wrap gap-3 justify-center mt-6">
          {['Pitch Deck','Sales Report','Product Launch','Investor Update','Monthly Review'].map(label => (
            <button 
              key={label} 
              onClick={() => window.location.href = '/signup'}
              className="px-5 py-2 rounded-full bg-[rgba(29,41,61,0.3)] text-white/80 text-xs font-medium font-sans border border-white/10 shadow hover:bg-[#314158] transition focus:outline-none"
            >
              {label}
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
