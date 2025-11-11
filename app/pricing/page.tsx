"use client";

import React, { useState } from "react";
import Link from "next/link";
import PolarCheckout from "../../components/PolarCheckout";
import { getProductId } from "../../lib/polar-config";
import { useAuth } from "../../components/AuthProvider";

const CHECK_ICON = (
  <svg width="14" height="14" fill="none" viewBox="0 0 14 14"><path d="M4.5 7.5l2 2 3-3" stroke="#05DF72" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/></svg>
);
const CROSS_ICON = (
  <span className="text-[#6a7282] text-[12.3px]">×</span>
);

const plans = [
  {
    name: "Free",
    price: "$0",
    desc: ["Perfect for testing the product with no", "commitment."],
    iconBg: "bg-emerald-500",
    features: [
      { text: "20 credits", included: true },
      { text: "Unlimited presentations", included: true },
      { text: "Export as PDF", included: true },
      { text: "Slide preview", included: true },
    ],
    buttonColor: "bg-[#364153] text-white hover:bg-[#4a5565]",
    border: "border-[#364153]",
  },
  {
    name: "Pro",
    monthly: { price: "$30", period: "/month", save: null, buttonColor: "bg-blue-600 text-white hover:bg-blue-700" },
    annual: { price: "$270", period: "/year", save: "Save $90 per year", buttonColor: "bg-blue-600 text-white hover:bg-blue-700" },
    desc: ["Designed for professionals."],
    iconBg: "bg-blue-600",
    features: [
      { text: "500 credits", included: true },
      { text: "Unlimited presentations", included: true },
      { text: "Slide preview before generating", included: true },
      { text: "Export as PDF", included: true },
    ],
    border: "border-[#364153]",
  },
];

function PlanCard({ plan, isAnnual = false, onToggle = () => {} }: { plan: any; isAnnual?: boolean; onToggle?: () => void }) {
  const isToggle = plan.name === "Pro";
  const priceData = isToggle ? (isAnnual ? plan.annual : plan.monthly) : { price: plan.price, period: "", save: null, buttonColor: plan.buttonColor };
  
  // Get the appropriate Polar product ID based on plan and billing cycle
  const productId = plan.name === "Pro" ? getProductId(plan.name, isAnnual) : null;
  return (
    <div key={plan.name} className={`relative bg-[#1c1c1c] border ${plan.border} rounded-[12.75px] flex flex-col pt-[21px] pb-[35px] px-[21px] w-full max-w-xs min-w-[280px] mx-auto`}>
      {/* Header: icon left, toggle right */}
      <div className="flex flex-row items-center justify-between mb-3">
        <div className={`w-[42px] h-[42px] rounded-[8.75px] flex items-center justify-center ${plan.iconBg} relative`}>
          {plan.name === "Pro" ? (
            <img src="/pro-icon.png" alt="Pro Plan Icon" className="w-5 h-5" />
          ) : (
            <img src="/free-icon.png" alt="Free Plan Icon" className="w-5 h-5" />
          )}
        </div>
        {isToggle && (
          <div className="flex items-center gap-2">
            <span className="text-[#99a1af] text-[13px]">Monthly</span>
            <label className="relative inline-block w-10 align-middle select-none cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={isAnnual} onChange={onToggle} />
              <span className="block w-10 h-5 bg-[#23272f] rounded-full shadow-inner transition peer-checked:bg-blue-600" />
              <span className="dot absolute top-1 left-1 bg-white w-3 h-3 rounded-full transition peer-checked:left-6" />
            </label>
            <span className="text-[#99a1af] text-[13px]">Annual</span>
          </div>
        )}
      </div>
      {/* Card content with fixed min-height for alignment */}
      <div className="flex flex-col flex-1 min-h-[220px]">
        {/* Plan name */}
        <div className="mb-1">
          <p className="text-white text-[13.45px] leading-[21px] font-normal">{plan.name}</p>
        </div>
        {/* Price */}
        <div className="mb-1 flex items-end gap-2">
          <p className="text-white text-[28px] leading-[36px] font-normal">{priceData.price}</p>
          <span className="text-[#99a1af] text-[16px] font-normal">{priceData.period}</span>
        </div>
        {/* Save text */}
        {priceData.save && <div className="text-[#05DF72] text-[13px] font-medium mb-1">{priceData.save}</div>}
        {/* Description */}
        <div className="mb-4">
          {plan.desc.map((line: string, i: number) => (
            <p key={i} className="text-[#99a1af] text-[11.15px] leading-[17.5px] font-normal">{line}</p>
          ))}
        </div>
        {/* Including label */}
        <div className="mb-2">
          <p className="text-[#99a1af] text-[11.34px] leading-[17.5px] font-normal">Including</p>
        </div>
        {/* Feature list */}
        <div className="flex flex-col gap-[9.5px] mb-8">
          {plan.features.map((f: any, i: number) => (
            <div key={i} className="flex flex-row items-center gap-[10.5px]">
              <span className="flex items-center justify-center w-3.5 h-3.5">
                {f.included ? CHECK_ICON : CROSS_ICON}
              </span>
              <span className={f.included ? "text-[#d1d5dc] text-[11.15px] leading-[17.5px] font-normal" : "text-[#6a7282] text-[11.15px] leading-[17.5px] font-normal line-through"}>{f.text}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Button */}
      {plan.name === "Pro" && productId ? (
        <PolarCheckout
          productId={productId}
          planName={plan.name}
          isAnnual={isAnnual}
          className={priceData.buttonColor}
        />
      ) : plan.name === "Free" ? (
        <button 
          className="w-full h-[31.5px] rounded-[6.75px] border border-[#4a5565] flex items-center justify-center text-[11.34px] leading-[17.5px] font-normal bg-[#2a2a2a] text-[#99a1af] cursor-not-allowed"
          disabled
        >
          Current plan
        </button>
      ) : (
        <button className={`w-full h-[31.5px] rounded-[6.75px] border border-[#4a5565] flex items-center justify-center text-[11.34px] leading-[17.5px] font-normal transition ${priceData.buttonColor}`}>
          Get Started
        </button>
      )}
    </div>
  );
}

const faqData = [
  {
    q: "What is Slaid and how does it work?",
    a: "Slaid is an AI-powered tool for creating beautiful, on-brand presentations in seconds. Just describe your needs and Slaid generates slides for you."
  },
  {
    q: "What does the free plan include?",
    a: "The free plan includes 200 credits, 1 workspace, and unlimited presentations."
  },
  {
    q: "What is a credit?",
    a: "A credit is a unit used to generate slides or use premium features. Each action may consume a certain number of credits."
  },
  {
    q: "What kind of presentations can Slaid create?",
    a: "Slaid can create pitch decks, sales reports, product launches, investor updates, and more."
  },
  {
    q: "Who owns the presentations I create with Slaid?",
    a: "You own all presentations you create. Slaid does not claim any rights over your content."
  },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="w-full max-w-2xl mx-auto mt-24 mb-32">
      <h2 className="text-white text-2xl font-semibold text-center mb-2">Frequently Asked Questions</h2>
      <p className="text-[#99a1af] text-center mb-8">Everything you need to know about Slaid</p>
      <div className="divide-y divide-[#364153]">
        {faqData.map((item, i) => (
          <div key={i}>
            <button
              className="w-full flex items-center justify-between py-5 text-left text-white font-medium focus:outline-none"
              onClick={() => setOpen(open === i ? null : i)}
            >
              <span>{item.q}</span>
              <svg
                className={`w-5 h-5 text-[#99a1af] transition-transform ${open === i ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {open === i && (
              <div className="pb-5 text-[#d1d5dc] text-sm leading-relaxed">{item.a}</div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="w-full border-t border-[#364153] pt-16 pb-8 flex flex-col items-center bg-transparent mt-24">
      <div className="flex flex-col items-center mb-6">
        <img src="/Slaid logo Official.png" alt="Slaid Logo" className="h-8 w-auto mb-2" />
      </div>
      <nav className="flex flex-wrap justify-center gap-6 text-[#d1d5dc] text-sm mb-6">
        <a href="#" className="hover:underline">Pricing</a>
        <a href="#" className="hover:underline">Privacy Policy</a>
        <a href="#" className="hover:underline">Terms of Service</a>
        <a href="#" className="hover:underline">Cookie Policy</a>
      </nav>
      <div className="flex gap-4 mb-6 items-center">
        <a href="https://x.com/manueleeal" target="_blank" rel="noopener noreferrer" aria-label="X" className="text-[#d1d5dc] hover:text-white hover:scale-110 transition-transform duration-150 flex items-center">
          <img src="/x-logo.png" alt="X (Twitter)" className="h-6 w-6" />
        </a>
        <a href="https://www.linkedin.com/in/manueleal/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-[#d1d5dc] hover:text-white hover:scale-110 transition-transform duration-150 flex items-center">
          <svg width="24" height="24" viewBox="0 0 448 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6"><path d="M100.28 448H7.4V148.9h92.88zm-46.44-340.7C24.09 107.3 0 83.2 0 53.6A53.6 53.6 0 0 1 53.6 0a53.6 53.6 0 0 1 53.6 53.6c0 29.6-24.09 53.7-53.36 53.7zM447.8 448h-92.4V302.4c0-34.7-12.4-58.4-43.3-58.4-23.6 0-37.6 15.9-43.7 31.3-2.3 5.6-2.8 13.4-2.8 21.2V448h-92.4s1.2-241.1 0-266.1h92.4v37.7c12.3-19 34.3-46.1 83.5-46.1 60.9 0 106.7 39.8 106.7 125.4V448z"/></svg>
        </a>
      </div>
      <div className="text-[#6a7282] text-xs text-center">2025 Slaid. All rights reserved</div>
    </footer>
  );
}

const imgLogo41 = "/Slaid logo Official.png";
const freeIcon1 = "http://localhost:3845/assets/aa7edaa486b6b24a69b01c55ccf845b46bc73478.svg";
const freeIcon2 = "http://localhost:3845/assets/86001f011a9d5cab1bfd67e951af6a1ac298b9fb.svg";
const freeIcon3 = "http://localhost:3845/assets/63d9574b7443b3261f135cfe383fa02c84796972.svg";
const freeIcon4 = "http://localhost:3845/assets/28217790a1c54640408b80c43f860b7857ce5925.svg";

export default function PricingPage() {
  const [isAnnualPro, setIsAnnualPro] = useState(false);
  const { user, profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    // Optionally redirect or show a message
  };
  return (
    <div className="min-h-screen bg-[#1c1c1c] flex flex-col items-center py-0 px-0 font-sans w-full">
      {/* Header/Navbar */}
      <div className="relative z-10 box-border flex flex-row items-center justify-center max-w-[1120px] px-[21px] py-3.5 w-full">
        <div className="flex flex-row items-start w-[359.33px]">
          <img src="/Slaid logo Official.png" alt="Slaid Logo" className="h-9 w-auto" />
        </div>
        <div className="flex flex-row items-center justify-center w-[359.33px]">
          <a className="text-[13.2px] text-white/80 font-sans hover:underline" href="#">Pricing</a>
        </div>
        <div className="flex flex-row gap-1 items-center justify-end w-[359.34px]">
          {user ? (
            <>
              <Link href="/editor" className="h-[31.5px] px-3.5 py-1.5 rounded-[6.75px] text-white text-[13.2px] font-medium font-sans bg-transparent hover:bg-white/10 transition shadow-sm flex items-center">
                Editor
              </Link>
              <button 
                onClick={handleSignOut}
                className="h-[31.5px] px-3.5 py-1.5 rounded-[6.75px] text-white text-[13.2px] font-medium font-sans bg-transparent hover:bg-white/10 transition shadow-sm"
              >
                Sign Out
              </button>
              <div className="h-[31.5px] px-3.5 py-1.5 rounded-[6.75px] text-black text-[13.2px] font-medium font-sans bg-white flex items-center">
                {profile?.full_name || user.email}
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="h-[31.5px] px-3.5 py-1.5 rounded-[6.75px] text-white text-[13.2px] font-medium font-sans bg-transparent hover:bg-white/10 transition shadow-sm flex items-center">
                Login
              </Link>
              <Link href="/signup" className="h-[31.5px] px-3.5 py-1.5 rounded-[6.75px] text-black text-[13.2px] font-medium font-sans bg-white hover:bg-white/80 hover:text-black hover:shadow-md transition-all duration-200 shadow focus:outline-none flex items-center">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
      {/* Pricing content */}
      <div className="pt-10 w-full flex flex-col items-center">
        <h1 className="text-white text-[39.7px] font-normal leading-[42px] mb-3 text-center">Pricing</h1>
        <p className="text-[#D1D5DC] text-[13.5px] leading-[21px] mb-8 text-center max-w-2xl">Start for free. Upgrade to get the capacity that exactly matches your team's needs.</p>
        <div className="flex flex-col md:flex-row gap-1 w-full max-w-2xl justify-center">
          <PlanCard plan={plans[0]} isAnnual={false} onToggle={()=>{}} />
          <PlanCard plan={plans[1]} isAnnual={isAnnualPro} onToggle={() => setIsAnnualPro(v => !v)} />
        </div>
      </div>
      <FAQ />
      <Footer />
    </div>
  );
} 