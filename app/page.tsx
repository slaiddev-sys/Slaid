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
  return (
    <div className="bg-white box-border flex flex-col items-center justify-start pt-0 px-0 relative min-h-screen w-full overflow-x-hidden" style={{ backgroundImage: 'url(/sheet-background.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
      {/* White overlay to reduce background opacity */}
      <div className="absolute inset-0 bg-white opacity-70 z-0"></div>
      
      {/* Navigation Bar - Logo and Auth Buttons */}
      <div className="relative z-10 box-border flex flex-row items-center justify-between max-w-6xl 2xl:max-w-7xl mx-auto 2xl:ml-24 2xl:mr-auto px-4 sm:px-6 py-4 sm:py-8 w-full">
        <div className="bg-center bg-contain bg-no-repeat h-[28px] sm:h-[36px] shrink-0 w-[90px] sm:w-[120px]" style={{ backgroundImage: `url('${imgLogo41}')` }} />
        
        {/* Auth Buttons */}
        <div className="flex items-center gap-3 sm:gap-4">
          <a
            href="/login"
            className="text-sm sm:text-base font-medium px-4 sm:px-6 py-2 rounded-full transition-colors"
            style={{ color: '#002903' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            Login
          </a>
          <a
            href="/signup"
            className="text-sm sm:text-base font-medium text-white px-4 sm:px-6 py-2 rounded-full transition-colors"
            style={{ backgroundColor: '#002903' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#001a02'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#002903'}
          >
            Sign Up
          </a>
        </div>
      </div>
      {/* Main Content: left-aligned layout */}
      <main className="relative z-10 flex flex-col items-start justify-start w-full flex-1 px-4 sm:px-6 pt-16 sm:pt-24 lg:pt-32 max-w-6xl 2xl:max-w-7xl mx-auto 2xl:ml-24 2xl:mr-auto">
        {/* Main Content Row - Title and Demo Video */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start justify-between w-full max-w-6xl pr-0 lg:pr-4">
          {/* Left Side - Title and Description */}
          <div className="flex-1 max-w-4xl">
            {/* Heading */}
            <h1 className="font-helvetica-neue text-[1.35rem] sm:text-[1.85rem] md:text-[2.35rem] lg:text-[2.85rem] xl:text-[46px] 2xl:text-[3.65rem] font-normal leading-tight mb-2 text-left tracking-tighter" style={{ color: '#002903' }}>
              Cover data to professional<br />reports
            </h1>
            {/* Subheading */}
            <p className="max-w-[588px] text-left text-[15px] sm:text-[16px] lg:text-[17px] 2xl:text-lg font-sans mb-6 sm:mb-8" style={{ color: '#002903' }}>
              Unlock the potential of your Excel data<br />with our AI-powered storytelling and presentation generator.
            </p>
            
            {/* Get Started Button */}
            <a
              href="/signup"
              className="inline-block text-sm sm:text-base font-medium text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-full transition-colors"
              style={{ backgroundColor: '#002903' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#001a02'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#002903'}
            >
              Get Started
            </a>
          </div>
          
          {/* Right Side - Demo Video */}
          <div className="relative w-full max-w-2xl ml-0 lg:ml-32 mt-8 lg:mt-8">
            <video 
              className="w-full h-auto rounded-3xl shadow-2xl lg:ml-24"
              controls
              autoPlay
              muted
              loop
              playsInline
            >
              <source src="/Slaid : Demo.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
        
      </main>
    </div>
  );
}
