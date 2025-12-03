"use client";

import React, { useState } from "react";
import Link from "next/link";
import PolarCheckout from "../../components/PolarCheckout";
import { getProductId } from "../../lib/polar-config";
import { useAuth } from "../../components/AuthProvider";
import { useCredits } from "../../components/hooks/useCredits";
import { useLanguage } from "../../hooks/useLanguage";
import { getTranslations } from "../../lib/translations";

const CHECK_ICON = (
  <svg width="14" height="14" fill="none" viewBox="0 0 14 14"><path d="M4.5 7.5l2 2 3-3" stroke="#002903" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/></svg>
);
const CROSS_ICON = (
  <span className="text-gray-500 text-[12.3px]">×</span>
);

// Plans function to get localized plan data
const getPlans = (t: any) => [
  {
    name: "Basic",
    monthly: { price: "$14.99", originalPrice: "$29.99", period: "/month", save: null, buttonColor: "bg-[#002903] text-white hover:bg-[#001a02]", toggleColor: "#002903", credits: `500 ${t.pricing.monthlyCredits}` },
    annual: { price: "$134.91", originalPrice: "$269.82", period: "/year", save: t.pricing.savePerYear.replace('{amount}', '$134.91'), buttonColor: "bg-[#002903] text-white hover:bg-[#001a02]", toggleColor: "#002903", credits: `6,000 ${t.pricing.annualCredits}` },
    desc: [t.pricing.basicDescription],
    icon: "/basic-plan.png",
    baseFeatures: [
      { text: t.pricing.unlimitedPresentations, included: true },
      { text: t.pricing.slidePreview, included: true },
      { text: t.pricing.exportPDF, included: true },
    ],
  },
  {
    name: "Pro",
    monthly: { price: "$24.50", originalPrice: "$49", period: "/month", save: null, buttonColor: "bg-[#1C0059] text-white hover:bg-[#150044]", toggleColor: "#1C0059", credits: `1000 ${t.pricing.monthlyCredits}` },
    annual: { price: "$220.50", originalPrice: "$441", period: "/year", save: t.pricing.savePerYear.replace('{amount}', '$367.50'), buttonColor: "bg-[#1C0059] text-white hover:bg-[#150044]", toggleColor: "#1C0059", credits: `12,000 ${t.pricing.annualCredits}` },
    desc: [t.pricing.proDescription],
    icon: "/pro-plan.png",
    baseFeatures: [
      { text: t.pricing.unlimitedPresentations, included: true },
      { text: t.pricing.slidePreview, included: true },
      { text: t.pricing.exportPDF, included: true },
      { text: t.pricing.prioritySupport, included: true },
    ],
  },
  {
    name: "Ultra",
    monthly: { price: "$44.50", originalPrice: "$89", period: "/month", save: null, buttonColor: "bg-[#441100] text-white hover:bg-[#330d00]", toggleColor: "#441100", credits: `2000 ${t.pricing.monthlyCredits}` },
    annual: { price: "$400.50", originalPrice: "$801", period: "/year", save: t.pricing.savePerYear.replace('{amount}', '$534'), buttonColor: "bg-[#441100] text-white hover:bg-[#330d00]", toggleColor: "#441100", credits: `24,000 ${t.pricing.annualCredits}` },
    desc: [t.pricing.ultraDescription],
    icon: "/ultra-red-plan.png",
    baseFeatures: [
      { text: t.pricing.unlimitedPresentations, included: true },
      { text: t.pricing.slidePreview, included: true },
      { text: t.pricing.exportPDF, included: true },
      { text: t.pricing.prioritySupport, included: true },
    ],
  },
];

function PlanCard({ plan, isAnnual = false, onToggle = () => {}, currentPlanType, t }: { plan: any; isAnnual?: boolean; onToggle?: () => void; currentPlanType?: string; t: any }) {
  const priceData = isAnnual ? plan.annual : plan.monthly;
  
  // Get the appropriate Polar product ID based on plan name and billing cycle
  const productId = getProductId(plan.name, isAnnual);
  
  // Get toggle colors: light grey when monthly (unchecked), plan color when annual (checked)
  const toggleBgColor = isAnnual ? priceData.toggleColor : '#9CA3AF';
  
  return (
    <div key={plan.name} className="relative w-full max-w-[300px] min-w-[260px] mx-auto flex flex-col">
      <div className={`relative bg-gray-100 flex flex-col pt-[21px] px-[21px] w-full rounded-xl h-full ${
        plan.name === "Basic" ? "pb-[35px]" : "pb-[35px]"
      }`}>
      {/* Header: icon left, toggle right */}
      <div className="flex flex-row items-center justify-between mb-3">
        <div className="w-[42px] h-[42px] flex items-center justify-center relative">
          <img src={plan.icon} alt={`${plan.name} Plan Icon`} className="w-[42px] h-[42px] object-contain" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-600 text-[13px]">{t.pricing.monthly}</span>
          <label className="relative inline-block w-10 align-middle select-none cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={isAnnual} onChange={onToggle} />
            <span 
              className="block w-10 h-5 rounded-full shadow-inner transition" 
              style={{ backgroundColor: toggleBgColor }}
            />
            <span className="dot absolute top-1 left-1 bg-white w-3 h-3 rounded-full transition peer-checked:left-6" />
          </label>
          <span className="text-gray-600 text-[13px]">{t.pricing.annual}</span>
        </div>
      </div>
      {/* Card content with fixed min-height for alignment */}
      <div className="flex flex-col flex-1 min-h-[280px]">
        {/* Plan name */}
        <div className="mb-1">
          <p className="text-gray-900 text-[13.45px] leading-[21px] font-normal">{plan.name}</p>
        </div>
        {/* Price */}
        <div className="mb-1 flex items-end gap-2">
          <div className="flex flex-col">
            {priceData.originalPrice && (
              <span className="text-gray-500 text-[14px] line-through">{priceData.originalPrice}</span>
            )}
            <p className="text-gray-900 text-[28px] leading-[36px] font-normal">{priceData.price}</p>
          </div>
          <span className="text-gray-600 text-[16px] font-normal mb-1">{priceData.period}</span>
        </div>
        {/* Christmas Badge - only for non-Basic plans */}
        {plan.name !== "Basic" && (
          <div className="bg-black text-white text-[11px] font-semibold px-2 py-1 rounded-md mb-2 inline-block w-fit">
            {t.pricing.discount}
          </div>
        )}
        {/* Save text */}
        {priceData.save && <div className="text-[#002903] text-[13px] font-medium mb-1">{priceData.save}</div>}
        {/* Description */}
        <div className="mb-4">
          {plan.desc.map((line: string, i: number) => (
            <p key={i} className="text-gray-600 text-[11.15px] leading-[17.5px] font-normal">{line}</p>
          ))}
        </div>
        {/* Including label */}
        <div className="mb-2">
          <p className="text-gray-600 text-[11.34px] leading-[17.5px] font-normal">{t.pricing.including}</p>
        </div>
        {/* Feature list */}
        <div className="flex flex-col gap-[9.5px] mb-12">
          {/* Credits - dynamic based on monthly/annual */}
          <div className="flex flex-row items-center gap-[10.5px]">
            <span className="flex items-center justify-center w-3.5 h-3.5">
              {CHECK_ICON}
            </span>
            <span className="text-gray-900 text-[13px] leading-[20px] font-normal">{priceData.credits}</span>
          </div>
          {/* Base features */}
          {plan.baseFeatures.map((f: any, i: number) => (
            <div key={i} className="flex flex-row items-center gap-[10.5px]">
              <span className="flex items-center justify-center w-3.5 h-3.5">
                {f.included ? CHECK_ICON : CROSS_ICON}
              </span>
              <span className={f.included ? "text-gray-900 text-[13px] leading-[20px] font-normal" : "text-gray-500 text-[13px] leading-[20px] font-normal line-through"}>{f.text}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Button */}
      {plan.name === "Basic" && currentPlanType === 'basic' ? (
        <button 
          className="w-full h-[48px] rounded-[6.75px] flex items-center justify-center text-[15px] font-semibold bg-gray-300 text-gray-700 cursor-not-allowed"
          disabled
        >
          {t.pricing.currentPlan}
        </button>
      ) : plan.name === "Basic" && (currentPlanType === 'pro' || currentPlanType === 'ultra') ? (
        <button 
          className="w-full h-[48px] rounded-[6.75px] flex items-center justify-center text-[15px] font-semibold transition bg-[#002903] text-white hover:bg-[#001a02]"
        >
          {t.pricing.downgradePlan}
        </button>
      ) : plan.name === "Basic" ? (
        <div>
          <p className="text-center text-gray-600 text-[11px] mb-2 leading-tight">
            {t.pricing.freeTrial3Days}
          </p>
          {productId ? (
            <PolarCheckout
              productId={productId}
              planName={plan.name}
              isAnnual={isAnnual}
              className="w-full h-[48px] rounded-[6.75px] flex items-center justify-center text-[15px] font-semibold transition bg-[#002903] text-white hover:bg-[#001a02]"
              buttonText={t.pricing.freeTrialButton}
            />
          ) : (
            <button className="w-full h-[48px] rounded-[6.75px] flex items-center justify-center text-[15px] font-semibold transition bg-[#002903] text-white hover:bg-[#001a02]">
              {t.pricing.freeTrialButton}
            </button>
          )}
        </div>
      ) : plan.name === "Pro" && currentPlanType === 'pro' ? (
        <button 
          className="w-full h-[48px] rounded-[6.75px] flex items-center justify-center text-[15px] font-semibold bg-gray-300 text-gray-700 cursor-not-allowed"
          disabled
        >
          {t.pricing.currentPlan}
        </button>
      ) : plan.name === "Ultra" && currentPlanType === 'ultra' ? (
        <button 
          className="w-full h-[48px] rounded-[6.75px] flex items-center justify-center text-[15px] font-semibold bg-gray-300 text-gray-700 cursor-not-allowed"
          disabled
        >
          {t.pricing.currentPlan}
        </button>
      ) : productId ? (
        <PolarCheckout
          productId={productId}
          planName={plan.name}
          isAnnual={isAnnual}
          className={`w-full h-[48px] rounded-[6.75px] flex items-center justify-center text-[15px] font-semibold transition ${priceData.buttonColor}`}
          buttonText={t.pricing.getStarted}
        />
      ) : (
        <button className={`w-full h-[48px] rounded-[6.75px] flex items-center justify-center text-[15px] font-semibold transition ${priceData.buttonColor}`}>
          {t.pricing.getStarted}
        </button>
      )}
    </div>
    </div>
  );
}

export default function PricingPage() {
  const [isAnnualBasic, setIsAnnualBasic] = useState(false);
  const [isAnnualPro, setIsAnnualPro] = useState(false);
  const [isAnnualUltra, setIsAnnualUltra] = useState(false);
  const { user, profile, signOut, credits } = useAuth();
  const { refreshCredits } = useCredits();
  const { language, changeLanguage } = useLanguage();
  const t = getTranslations(language);

  const handleSignOut = async () => {
    await signOut();
  };

  // Auto-refresh credits when window regains focus (e.g., returning from Polar checkout)
  React.useEffect(() => {
    const handleWindowFocus = () => {
      console.log('🔄 Window focused - refreshing credits...');
      refreshCredits();
    };

    window.addEventListener('focus', handleWindowFocus);
    
    return () => {
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [refreshCredits]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center py-0 px-0 font-sans w-full">
      {/* Header/Navbar */}
      <div className="relative z-10 box-border flex flex-row items-center justify-between max-w-6xl px-[21px] py-6 w-full">
        <div className="flex flex-row items-start">
          <Link href="/">
            <img src="/slaid logo verde.png" alt="Slaid Logo" className="h-9 w-auto cursor-pointer hover:opacity-80 transition" />
          </Link>
        </div>
        {/* Empty div for spacing - no buttons shown */}
        <div></div>
      </div>

      {/* Pricing content */}
      <div className="pt-8 pb-24 w-full flex flex-col items-center px-4">
        {/* Language Switcher */}
        <div className="absolute top-6 right-6 flex items-center gap-1 border border-gray-300 rounded-full p-1">
          <button
            onClick={() => changeLanguage('en')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition ${
              language === 'en' 
                ? 'bg-[#002903] text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => changeLanguage('es')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition ${
              language === 'es' 
                ? 'bg-[#002903] text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            ES
          </button>
        </div>
        
        <div className="text-center mb-12">
          <h1 className="text-gray-900 text-[40px] font-normal leading-[48px] mb-4 tracking-tight">{t.pricing.title}</h1>
          <p className="text-gray-600 text-[15px] leading-[24px] max-w-2xl mx-auto">{t.pricing.subtitle}</p>
        </div>
        <div className="flex flex-col md:flex-row gap-6 w-full max-w-4xl justify-center mx-auto">
          {getPlans(t).map((plan, idx) => {
            const isAnnual = idx === 0 ? isAnnualBasic : idx === 1 ? isAnnualPro : isAnnualUltra;
            const onToggle = idx === 0 ? () => setIsAnnualBasic(v => !v) : idx === 1 ? () => setIsAnnualPro(v => !v) : () => setIsAnnualUltra(v => !v);
            return <PlanCard key={plan.name} plan={plan} isAnnual={isAnnual} onToggle={onToggle} currentPlanType={credits?.plan_type} t={t} />;
          })}
        </div>
      </div>

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
  );
}
