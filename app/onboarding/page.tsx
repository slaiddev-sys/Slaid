"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronRight,
    ChevronLeft,
    Upload,
    Check,
    FileText,
    BarChart,
    Presentation,
    User,
    Zap,
    Layout,
    Clock,
    Settings,
    Edit,
    GraduationCap,
    Smile,
    Calendar,
    Layers,
    Rocket,
    Palette,
    Sparkles,
    ShieldCheck
} from "lucide-react";
import { useLanguage } from "../../hooks/useLanguage";
import { getTranslations } from "../../lib/translations";
import { useAuth } from "../../components/AuthProvider";
import { polarConfig } from "../../lib/polar-config";

/**
 * BRANDING SLAID: Blanco y Verde.
 */
const BRAND_GREEN = "#002903";

const iconMap: Record<string, React.ReactNode> = {
    business: <BarChart className="w-5 h-5 text-current" />,
    education: <GraduationCap className="w-5 h-5 text-current" />,
    creative: <Palette className="w-5 h-5 text-current" />,
    marketing: <Rocket className="w-5 h-5 text-current" />,
    daily: <Calendar className="w-5 h-5 text-current" />,
    weekly: <Layers className="w-5 h-5 text-current" />,
    monthly: <BarChart className="w-5 h-5 text-current" />,
    occasionally: <Smile className="w-5 h-5 text-current" />,
    design: <Palette className="w-5 h-5 text-current" />,
    time: <Clock className="w-5 h-5 text-current" />,
    content: <Edit className="w-5 h-5 text-current" />,
    complexity: <Settings className="w-5 h-5 text-current" />
};

export default function OnboardingPage() {
    const router = useRouter();
    const { language } = useLanguage();
    const { user } = useAuth();
    const t = getTranslations(language);

    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [selectedPlan, setSelectedPlan] = useState("annual");
    const [demoStage, setDemoStage] = useState(0); // 0: Idle, 1: Dragging, 2: Loading, 3: Layouts

    // Demo animation loop
    useEffect(() => {
        const timer = setInterval(() => {
            setDemoStage((prev) => (prev + 1) % 4);
        }, 3000);
        return () => clearInterval(timer);
    }, []);

    const handleNext = async () => {
        if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
        } else {
            const plan = plans.find(p => p.id === selectedPlan);
            if (plan?.polarProductId) {
                try {
                    const userEmail = user?.email;
                    const response = await fetch('https://api.polar.sh/v1/checkouts/', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${polarConfig.publicAccessToken}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            product_id: plan.polarProductId,
                            success_url: `${window.location.origin}/purchase-success`,
                            cancel_url: window.location.href,
                            customer_email: userEmail,
                        }),
                    });

                    if (response.ok) {
                        const checkout = await response.json();
                        // Set flags before leaving the app just in case
                        localStorage.setItem('slaid_just_purchased', Date.now().toString());
                        localStorage.setItem('slaid_purchase_pending', 'true');
                        window.location.href = checkout.url;
                    } else {
                        // Set flags even for external checkout
                        localStorage.setItem('slaid_just_purchased', Date.now().toString());
                        localStorage.setItem('slaid_purchase_pending', 'true');
                        window.location.href = `https://polar.sh/checkout/${plan.polarProductId}`;
                    }
                } catch (error) {
                    console.error('Error creating checkout:', error);
                    window.location.href = `https://polar.sh/checkout/${plan.polarProductId}`;
                }
            } else {
                router.push("/editor");
            }
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const selectOption = (stepIndex: number, optionId: string) => {
        setAnswers({ ...answers, [stepIndex]: optionId });
        setTimeout(() => {
            handleNext();
        }, 400);
    };

    const plans = [
        {
            id: "weekly",
            name: language === "es" ? "Semanal" : "Weekly",
            price: "9.99€",
            period: "/SEM",
            features: language === "es" ? ["200 créditos", "PDF"] : ["200 credits", "PDF"],
            popular: false,
            polarProductId: "5a954dc6-891d-428a-a948-05409fe765e2"
        },
        {
            id: "monthly",
            name: language === "es" ? "Mensual" : "Monthly",
            price: "19.99€",
            period: "/MES",
            features: language === "es" ? ["500 créditos", "Editable", "Priority"] : ["500 credits", "Editable", "Priority"],
            popular: false,
            polarProductId: "481ff240-aadc-44c9-a58e-2fee7ab26b90"
        },
        {
            id: "annual",
            name: language === "es" ? "Anual" : "Annual",
            price: "6.99€",
            period: "/MES",
            features: language === "es" ? ["2500 créditos", "Ahorra 65%", "Todo incluído"] : ["2500 credits", "Save 65%", "Everything included"],
            subPrice: language === "es" ? "83,88€ al año" : "€83.88 per year",
            popular: true,
            polarProductId: "3f8500aa-7847-40dc-bcde-844bbef74742"
        }
    ];

    return (
        <div className="min-h-screen bg-white text-[#002903] flex flex-col lg:flex-row overflow-hidden font-sans">
            {/* Left side: Questions / Paywall */}
            <div className="w-full lg:w-[45%] flex flex-col p-8 lg:px-16 lg:py-12 z-10 bg-white border-r border-[#E6E9E6] overflow-y-auto max-h-screen items-center">
                {/* Header / Progress - Centered */}
                <div className="flex flex-col items-center gap-6 mb-8 lg:mb-12 w-full max-w-[420px]">
                    <div className="flex items-center justify-center">
                        <img src="/slaid logo verde.png" alt="Slaid Logo" className="h-8 w-auto" />
                    </div>

                    <div className="flex gap-1.5 w-full max-w-[120px]">
                        {[0, 1, 2, 3].map((step) => (
                            <div
                                key={step}
                                className={`h-1 flex-1 rounded-full transition-all duration-500 ${step <= currentStep ? "bg-[#002903]" : "bg-[#E6E9E6]"
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {currentStep < 3 ? (
                        <motion.div
                            key={currentStep}
                            variants={{
                                hidden: { opacity: 0 },
                                show: {
                                    opacity: 1,
                                    transition: {
                                        staggerChildren: 0.08,
                                        delayChildren: 0.1
                                    }
                                }
                            }}
                            initial="hidden"
                            animate="show"
                            exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.2 } }}
                            className="flex-1 flex flex-col items-center text-center w-full max-w-[420px]"
                        >
                            <motion.div
                                variants={{
                                    hidden: { opacity: 0, y: 15 },
                                    show: { opacity: 1, y: 0, transition: { type: "spring", damping: 25, stiffness: 400 } }
                                }}
                            >
                                <h1 className="text-2xl lg:text-3xl font-extrabold mb-4 leading-tight tracking-tight" style={{ color: BRAND_GREEN }}>
                                    {t.onboarding.steps[currentStep].question}
                                </h1>
                                <p className="text-[#6b7280] mb-8 text-base">
                                    {t.onboarding.personalize}
                                </p>
                            </motion.div>

                            <div className="flex flex-col gap-3 w-full">
                                {t.onboarding.steps[currentStep].options.map((option, idx) => (
                                    <motion.button
                                        key={option.id}
                                        variants={{
                                            hidden: { opacity: 0, x: -15 },
                                            show: { opacity: 1, x: 0, transition: { type: "spring", damping: 20 } }
                                        }}
                                        whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => selectOption(currentStep, option.id)}
                                        className={`flex items-center gap-4 p-3.5 px-4 rounded-xl border transition-all duration-200 group relative overflow-hidden ${answers[currentStep] === option.id
                                            ? "border-[#002903] bg-[#002903]/5 shadow-[0_4px_12px_rgba(0,41,3,0.06)]"
                                            : "border-[#E6E9E6] bg-white hover:border-[#002903]/30 hover:bg-[#F9FAF9]"
                                            }`}
                                    >
                                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 ${answers[currentStep] === option.id ? "bg-[#002903] text-white" : "bg-[#F9FAF9] text-[#6b7280]"
                                            }`}>
                                            {iconMap[option.id] || <FileText className="w-5 h-5" />}
                                        </div>
                                        <span className={`text-base font-semibold ${answers[currentStep] === option.id ? "text-[#002903]" : "text-[#4b5563]"
                                            }`}>
                                            {option.label}
                                        </span>

                                        {answers[currentStep] === option.id ? (
                                            <motion.div
                                                initial={{ scale: 0, rotate: -45 }}
                                                animate={{ scale: 1, rotate: 0 }}
                                                className="ml-auto w-5 h-5 rounded-full bg-[#002903] flex items-center justify-center"
                                            >
                                                <Check className="w-3 h-3 text-white stroke-[3]" />
                                            </motion.div>
                                        ) : (
                                            <div className="ml-auto w-5 h-5 rounded-full border border-[#E6E9E6]" />
                                        )}
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="paywall-step"
                            variants={{
                                hidden: { opacity: 0 },
                                show: {
                                    opacity: 1,
                                    transition: {
                                        staggerChildren: 0.1,
                                        delayChildren: 0.2
                                    }
                                }
                            }}
                            initial="hidden"
                            animate="show"
                            className="flex-1 flex flex-col items-center text-center w-full max-w-[420px]"
                        >
                            <motion.div
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    show: { opacity: 1, y: 0, transition: { type: "spring", damping: 25, stiffness: 400 } }
                                }}
                            >
                                <h1 className="text-2xl lg:text-3xl font-extrabold mb-3 leading-tight tracking-tight" style={{ color: BRAND_GREEN }}>
                                    {language === "es" ? "Inicia tu revolución de datos" : "Start your data revolution"}
                                </h1>
                                <p className="text-[#6b7280] mb-8 text-base">
                                    {language === "es" ? "Elige el plan que mejor se adapte a tu ritmo." : "Choose the plan that best fits your pace."}
                                </p>
                            </motion.div>

                            <div className="flex flex-col gap-2.5 w-full mb-8">
                                {plans.map((plan, idx) => (
                                    <motion.button
                                        key={plan.id}
                                        variants={{
                                            hidden: { opacity: 0, x: -20 },
                                            show: { opacity: 1, x: 0, transition: { type: "spring", damping: 20, delay: idx * 0.05 } }
                                        }}
                                        whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setSelectedPlan(plan.id)}
                                        className={`relative flex items-center justify-between p-4 px-5 rounded-xl border transition-all duration-300 ${selectedPlan === plan.id
                                            ? "border-[#002903] bg-[#002903]/5 shadow-[0_4px_12px_rgba(0,41,3,0.04)]"
                                            : "border-[#E6E9E6] hover:border-[#002903]/30 bg-white"
                                            }`}
                                    >
                                        <AnimatePresence>
                                            {selectedPlan === plan.id && (
                                                <motion.div
                                                    layoutId="active-plan-bg"
                                                    className="absolute inset-0 bg-[#002903]/[0.02] rounded-xl -z-10"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                />
                                            )}
                                        </AnimatePresence>

                                        {plan.popular && (
                                            <motion.div
                                                initial={{ scale: 0.8, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                transition={{ delay: 0.5, type: "spring" }}
                                                className="absolute -top-3 right-4 bg-[#002903] text-white px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5"
                                            >
                                                <span className="text-[11px] font-black tracking-tighter">65%</span>
                                                <span className="text-[8px] font-black uppercase tracking-widest opacity-90 border-l border-white/20 pl-1.5">
                                                    {language === "es" ? "Descuento" : "Discount"}
                                                </span>
                                            </motion.div>
                                        )}
                                        <div className="flex items-center gap-3">
                                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors duration-300 ${selectedPlan === plan.id ? "border-[#002903] bg-[#002903]" : "border-[#E6E9E6]"
                                                }`}>
                                                {selectedPlan === plan.id && (
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        className="w-1.5 h-1.5 rounded-full bg-white"
                                                    />
                                                )}
                                            </div>
                                            <div className="text-left">
                                                <div className="font-bold text-sm text-[#002903]">{plan.name}</div>
                                                <div className="text-[10px] text-[#6b7280] font-medium tracking-tight">{plan.features.join(" • ")}</div>
                                            </div>
                                        </div>
                                        <div className="text-right flex flex-col items-end">
                                            <div className="flex items-baseline gap-0.5">
                                                <div className="font-black text-lg text-[#002903]">{plan.price}</div>
                                                <div className="text-[9px] text-[#9ca3af] uppercase font-bold tracking-tight">{plan.period}</div>
                                            </div>
                                            {plan.subPrice && (
                                                <div className="text-[8px] text-[#9ca3af] font-bold uppercase tracking-tighter mt-[-2px]">{plan.subPrice}</div>
                                            )}
                                        </div>
                                    </motion.button>
                                ))}
                            </div>

                            <motion.div
                                className="mt-auto space-y-4 w-full"
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    show: { opacity: 1, y: 0, transition: { type: "spring", delay: 0.4 } }
                                }}
                            >
                                <motion.button
                                    whileHover={{ scale: 1.02, shadow: "0 12px 24px -8px rgba(0,41,3,0.5)" }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleNext}
                                    className="w-full text-white font-black py-4 rounded-xl transition-all text-lg flex items-center justify-center gap-2 group shadow-[0_8px_20px_-8px_rgba(0,41,3,0.4)]"
                                    style={{ backgroundColor: BRAND_GREEN }}
                                >
                                    {language === "es" ? "Continuar" : "Continue"}
                                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </motion.button>

                                <div className="mt-8 flex flex-col items-center gap-6 w-full">
                                    {/* Trust Badge */}
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.6 }}
                                        className="flex items-center gap-2 bg-[#002903]/5 px-5 py-2.5 rounded-full border border-[#002903]/10"
                                    >
                                        <ShieldCheck className="w-4 h-4 text-[#002903]" />
                                        <span className="text-[13px] font-bold text-[#002903]">
                                            Pay Safe & Secure
                                        </span>
                                    </motion.div>

                                    {/* Payment Methods Row */}
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 0.9 }}
                                        transition={{ delay: 0.7 }}
                                        className="flex flex-wrap justify-center items-center gap-1.5 transition-all duration-500"
                                    >
                                        {[
                                            { name: "visa", url: "https://upload.wikimedia.org/wikipedia/commons/d/d6/Visa_2021.svg" },
                                            { name: "amex", url: "https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg" },
                                            { name: "mastercard", url: "https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" },
                                            { name: "paypal", url: "https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" },
                                            { name: "applepay", url: "https://upload.wikimedia.org/wikipedia/commons/b/b0/Apple_Pay_logo.svg" },
                                            { name: "googlepay", url: "https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" }
                                        ].map((logo, lidx) => (
                                            <motion.div
                                                key={logo.name}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.8 + (lidx * 0.05) }}
                                                className="bg-white border border-[#E6E9E6] rounded-md px-1.5 py-0.5 h-5 flex items-center justify-center"
                                            >
                                                <img src={logo.url} alt={logo.name} className="h-2.5 w-auto object-contain" />
                                            </motion.div>
                                        ))}
                                    </motion.div>

                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Footer buttons */}
                <div className="flex justify-between items-center mt-8 pt-6 border-t border-[#E6E9E6] w-full max-w-[420px]">
                    <button
                        onClick={handleBack}
                        className={`flex items-center gap-1.5 text-[#6b7280] hover:text-[#002903] transition-colors text-xs font-bold ${currentStep === 0 ? "invisible" : ""
                            }`}
                    >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        {t.onboarding.backButton}
                    </button>

                    <div className="text-[9px] text-[#9ca3af] font-black uppercase tracking-widest">
                        {t.onboarding.stepCounter.replace("{step}", (currentStep + 1).toString())}
                    </div>
                </div>
            </div>

            {/* Right side: Interactive Preview */}
            <div className="flex-1 bg-gradient-to-br from-[#003d05] via-[#002903] to-[#011402] relative flex items-center justify-center p-8 lg:px-20 lg:py-12 overflow-hidden">
                {/* Decorative background elements - Refined for dark theme */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-[120px] -z-0 translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#002903] rounded-full blur-[100px] -z-0 -translate-x-1/3 translate-y-1/3 opacity-50" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(0,100,5,0.08)_0%,transparent_70%)]" />

                {/* Mockup Container */}
                <div className="w-full max-w-3xl aspect-[16/10] bg-white rounded-2xl border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] relative overflow-hidden z-10 flex flex-col scale-[0.95] lg:scale-100">
                    {/* Mockup Header - Premium Dark Variant */}
                    <div className="h-8 bg-black/5 border-b border-[#E6E9E6]/50 flex items-center px-4 gap-1.5 text-[#9ca3af]">
                        <div className="w-2 h-2 rounded-full bg-[#ff5f56]" />
                        <div className="w-2 h-2 rounded-full bg-[#ffbd2e]" />
                        <div className="w-2 h-2 rounded-full bg-[#27c93f]" />
                        <div className="ml-3 h-2 w-24 bg-black/10 rounded-full" />
                    </div>

                    {/* Mockup Body - Dynamic based on state */}
                    <div className="flex-1 relative flex flex-col bg-white">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key="preview-animated"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="w-full h-full flex items-center justify-center p-5"
                            >
                                <div className="w-full h-full relative overflow-hidden bg-white rounded-xl border border-[#E6E9E6] flex flex-col items-center justify-center">

                                    <div className="text-center transition-all duration-500 w-full h-full flex items-center justify-center">
                                        <AnimatePresence mode="wait">
                                            {demoStage === 0 && (
                                                <motion.div
                                                    key="stage-0"
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 1.05, transition: { duration: 0.2 } }}
                                                    className="flex flex-col items-center gap-4"
                                                >
                                                    <motion.div
                                                        animate={{
                                                            y: [0, -8, 0],
                                                            borderColor: ["#E5E7EB", BRAND_GREEN + "20", "#E5E7EB"]
                                                        }}
                                                        transition={{
                                                            y: { repeat: Infinity, duration: 3, ease: "easeInOut" },
                                                            borderColor: { repeat: Infinity, duration: 2, ease: "easeInOut" }
                                                        }}
                                                        className="w-28 h-28 rounded-3xl border-2 border-dashed flex items-center justify-center text-[#9ca3af] bg-white relative"
                                                    >
                                                        <Upload className="w-10 h-10" />
                                                        {/* Subtle pulsing background */}
                                                        <motion.div
                                                            animate={{ scale: [1, 1.2], opacity: [0.1, 0] }}
                                                            transition={{ repeat: Infinity, duration: 2 }}
                                                            className="absolute inset-0 rounded-3xl bg-[#002903]"
                                                        />
                                                    </motion.div>
                                                    <div className="flex flex-col items-center gap-1">
                                                        <p className="text-[14px] text-[#002903] font-bold">
                                                            {language === "es" ? "Suelta tus datos" : "Drop your data"}
                                                        </p>
                                                        <p className="text-[11px] text-[#6b7280] font-medium opacity-60">
                                                            {language === "es" ? "Listo para analizar" : "Ready to analyze"}
                                                        </p>
                                                    </div>
                                                </motion.div>
                                            )}

                                            {demoStage === 1 && (
                                                <motion.div
                                                    key="stage-1"
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                                    className="relative flex flex-col items-center"
                                                >
                                                    <div className="relative w-32 h-32 flex items-center justify-center">
                                                        {/* Rotating Dash Border */}
                                                        <motion.div
                                                            animate={{ rotate: 360 }}
                                                            transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                                                            className="absolute inset-0 rounded-[2rem] border-2 border-dashed border-[#002903]/20"
                                                        />

                                                        {/* File Container */}
                                                        <motion.div
                                                            className="w-24 h-24 rounded-2xl bg-[#002903]/5 flex items-center justify-center relative shadow-[inset_0_0_20px_rgba(0,41,3,0.05)] border border-[#002903]/10 overflow-hidden"
                                                        >
                                                            {/* Internal Data Shimmer */}
                                                            <motion.div
                                                                animate={{ top: ["-100%", "200%"] }}
                                                                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                                                                className="absolute inset-0 w-full h-1/2 bg-gradient-to-b from-transparent via-[#002903]/5 to-transparent -skew-y-12"
                                                            />

                                                            <motion.div
                                                                initial={{ y: -100, rotate: -15, opacity: 0 }}
                                                                animate={{ y: 0, rotate: 0, opacity: 1 }}
                                                                transition={{ type: "spring", damping: 12, stiffness: 200 }}
                                                                className="z-10"
                                                            >
                                                                <FileText className="w-14 h-14 text-[#002903]" />
                                                            </motion.div>
                                                        </motion.div>

                                                        {/* Floating Data Particles */}
                                                        {[...Array(6)].map((_, i) => (
                                                            <motion.div
                                                                key={i}
                                                                initial={{ opacity: 0, scale: 0 }}
                                                                animate={{
                                                                    opacity: [0, 0.8, 0],
                                                                    scale: [0.5, 1, 0.5],
                                                                    x: [i % 2 === 0 ? -60 : 60, 0],
                                                                    y: [i * 10 - 30, 0]
                                                                }}
                                                                transition={{
                                                                    repeat: Infinity,
                                                                    duration: 2,
                                                                    delay: i * 0.3,
                                                                    ease: "easeOut"
                                                                }}
                                                                className="absolute w-1.5 h-1.5 bg-[#002903] rounded-sm"
                                                            />
                                                        ))}
                                                    </div>

                                                    <div className="mt-6 flex flex-col items-center gap-1.5">
                                                        <motion.p
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            className="text-[#002903] font-black text-sm tracking-tight uppercase"
                                                        >
                                                            {language === "es" ? "Analizando datos..." : "Ingesting Spreadsheet..."}
                                                        </motion.p>
                                                        <div className="flex gap-1.5">
                                                            {[0, 1, 2].map(i => (
                                                                <motion.div
                                                                    key={i}
                                                                    animate={{
                                                                        scale: [1, 1.5, 1],
                                                                        opacity: [0.3, 1, 0.3]
                                                                    }}
                                                                    transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                                                                    className="w-1.5 h-1.5 rounded-full bg-[#002903]"
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}

                                            {demoStage === 2 && (
                                                <motion.div
                                                    key="stage-2"
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, transition: { duration: 0.3 } }}
                                                    className="flex flex-col items-center gap-6"
                                                >
                                                    <div className="relative flex items-center justify-center">
                                                        {/* Outer pulsing rings */}
                                                        {[0, 1, 2].map((i) => (
                                                            <motion.div
                                                                key={i}
                                                                initial={{ scale: 0.8, opacity: 0 }}
                                                                animate={{ scale: [1, 1.8], opacity: [0.2, 0] }}
                                                                transition={{
                                                                    repeat: Infinity,
                                                                    duration: 2.5,
                                                                    delay: i * 0.8,
                                                                    ease: "easeOut"
                                                                }}
                                                                className="absolute w-20 h-20 rounded-full border border-[#002903]"
                                                            />
                                                        ))}

                                                        {/* Main Icon Container */}
                                                        <motion.div
                                                            animate={{
                                                                boxShadow: ["0 0 0px rgba(0,41,3,0)", "0 0 30px rgba(0,41,3,0.15)", "0 0 0px rgba(0,41,3,0)"],
                                                            }}
                                                            transition={{ repeat: Infinity, duration: 2 }}
                                                            className="relative w-20 h-20 rounded-full bg-white border border-[#002903]/10 flex items-center justify-center z-10 shadow-lg"
                                                        >
                                                            <Zap className="w-9 h-9 text-[#002903]" />

                                                            {/* Vertical Scanning Line */}
                                                            <motion.div
                                                                animate={{ top: ["20%", "80%", "20%"] }}
                                                                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                                                                className="absolute left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-[#002903] to-transparent z-20 shadow-[0_0_8px_#002903]"
                                                            />

                                                            {/* Orbiting particles */}
                                                            <motion.div
                                                                animate={{ rotate: 360 }}
                                                                transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                                                                className="absolute inset-[-12px]"
                                                            >
                                                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#002903] rounded-full shadow-[0_0_8px_#002903]" />
                                                            </motion.div>
                                                        </motion.div>
                                                    </div>

                                                    <div className="space-y-4 text-center">
                                                        <div className="flex flex-col items-center">
                                                            <p className="text-[#002903] text-base font-black tracking-tight uppercase">
                                                                {language === "es" ? "Análisis IA Profundo" : "AI Deep Analysis"}
                                                            </p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <motion.div
                                                                    animate={{ opacity: [1, 0.4, 1] }}
                                                                    transition={{ repeat: Infinity, duration: 0.5 }}
                                                                    className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_red]"
                                                                />
                                                                <p className="text-[#6b7280] text-[10px] uppercase font-black tracking-widest opacity-70">
                                                                    {language === "es" ? "Procesando Datos" : "Processing Data"}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="w-56 h-2 bg-[#002903]/5 rounded-full overflow-hidden relative border border-[#002903]/5">
                                                            <motion.div
                                                                initial={{ x: "-100%" }}
                                                                animate={{ x: "0%" }}
                                                                transition={{ duration: 2.5, ease: "easeInOut" }}
                                                                className="absolute inset-0 bg-gradient-to-r from-transparent via-[#002903] to-transparent"
                                                            />
                                                            {/* Shiny highlight */}
                                                            <motion.div
                                                                animate={{ left: ["-100%", "200%"] }}
                                                                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                                                                className="absolute top-0 bottom-0 w-20 bg-white/40 skew-x-[-20deg]"
                                                            />
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}

                                            {demoStage === 3 && (
                                                <motion.div
                                                    key="stage-3"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="w-full h-full p-4 grid grid-cols-2 gap-4"
                                                >
                                                    {[
                                                        {
                                                            title: language === "es" ? "Tendencias de Ingresos" : "Revenue Trends",
                                                            render: () => (
                                                                <div className="w-full h-14 relative px-1 overflow-hidden">
                                                                    <svg className="w-full h-full" viewBox="0 0 100 60" preserveAspectRatio="none">
                                                                        <motion.path
                                                                            initial={{ pathLength: 0, opacity: 0 }}
                                                                            animate={{ pathLength: 1, opacity: 1 }}
                                                                            transition={{ duration: 1.5, ease: "easeInOut", delay: 0.6 }}
                                                                            d="M0 55 C 15 45, 30 50, 45 30 S 75 10, 100 5 L 100 60 L 0 60 Z"
                                                                            fill="url(#gradient-green-complete)"
                                                                            className="opacity-20"
                                                                        />
                                                                        <motion.path
                                                                            initial={{ pathLength: 0 }}
                                                                            animate={{ pathLength: 1 }}
                                                                            transition={{ duration: 1.5, ease: "easeInOut", delay: 0.6 }}
                                                                            d="M0 55 C 15 45, 30 50, 45 30 S 75 10, 100 5"
                                                                            fill="none"
                                                                            stroke="#002903"
                                                                            strokeWidth="2.5"
                                                                            strokeLinecap="round"
                                                                        />
                                                                        <defs>
                                                                            <linearGradient id="gradient-green-complete" x1="0%" y1="0%" x2="0%" y2="100%">
                                                                                <stop offset="0%" stopColor="#002903" stopOpacity="0.6" />
                                                                                <stop offset="100%" stopColor="#002903" stopOpacity="0" />
                                                                            </linearGradient>
                                                                        </defs>
                                                                    </svg>
                                                                    <div className="absolute inset-0 flex justify-between items-end px-1 pb-1">
                                                                        {[55, 45, 30, 20, 10, 5].map((v, i) => (
                                                                            <motion.div
                                                                                key={i}
                                                                                initial={{ scale: 0 }}
                                                                                animate={{ scale: 1 }}
                                                                                transition={{ delay: 1.5 + (i * 0.1) }}
                                                                                className="w-1.5 h-1.5 rounded-full bg-[#002903] border-2 border-white shadow-sm z-10"
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )
                                                        },
                                                        {
                                                            title: language === "es" ? "Pulso de Crecimiento" : "Growth Pulse",
                                                            render: () => (
                                                                <div className="flex flex-col items-center justify-center w-full h-full gap-2 px-2">
                                                                    <div className="flex items-baseline gap-1">
                                                                        <motion.span
                                                                            initial={{ opacity: 0, y: 5 }}
                                                                            animate={{ opacity: 1, y: 0 }}
                                                                            className="text-[#002903] font-black text-2xl tracking-tighter"
                                                                        >
                                                                            +124%
                                                                        </motion.span>
                                                                        <motion.div
                                                                            animate={{ y: [0, -3, 0] }}
                                                                            transition={{ repeat: Infinity, duration: 0.8 }}
                                                                            className="text-xs text-[#002903]/80 font-black"
                                                                        >
                                                                            ▲
                                                                        </motion.div>
                                                                    </div>
                                                                    <div className="w-full h-4 flex items-end gap-[3px]">
                                                                        {[30, 45, 35, 60, 55, 85, 75, 100, 90, 80, 95].map((h, i) => (
                                                                            <motion.div
                                                                                key={i}
                                                                                initial={{ height: 0 }}
                                                                                animate={{ height: `${h}%` }}
                                                                                transition={{ delay: 0.8 + (i * 0.04) }}
                                                                                className="flex-1 bg-[#002903]/30 rounded-t-[2px]"
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )
                                                        },
                                                        {
                                                            title: language === "es" ? "Cuota de Mercado" : "Market Share",
                                                            render: () => (
                                                                <div className="flex items-center gap-4 w-full h-full px-2">
                                                                    <div className="relative w-14 h-14 flex-shrink-0">
                                                                        <svg className="w-full h-full rotate-[-90deg]" viewBox="0 0 48 48">
                                                                            <circle cx="24" cy="24" r="18" stroke="#002903" strokeWidth="6" fill="none" className="opacity-10" />
                                                                            <motion.circle
                                                                                cx="24" cy="24" r="18"
                                                                                stroke="#002903" strokeWidth="6"
                                                                                fill="none" strokeDasharray="113"
                                                                                initial={{ strokeDashoffset: 113 }}
                                                                                animate={{ strokeDashoffset: 35 }}
                                                                                transition={{ duration: 1.2, delay: 0.6 }}
                                                                            />
                                                                            <motion.circle
                                                                                cx="24" cy="24" r="18"
                                                                                stroke="#002903" strokeWidth="6"
                                                                                fill="none" strokeDasharray="113"
                                                                                initial={{ strokeDashoffset: 113 }}
                                                                                animate={{ strokeDashoffset: 75 }}
                                                                                transition={{ duration: 1, delay: 1.2 }}
                                                                                className="opacity-40"
                                                                            />
                                                                        </svg>
                                                                    </div>
                                                                    <div className="flex-1 space-y-2">
                                                                        {[1, 0.6, 0.4].map((w, i) => (
                                                                            <div key={i} className="flex items-center gap-2">
                                                                                <div className={`w-1.5 h-1.5 rounded-full bg-[#002903] ${i === 1 ? 'opacity-40' : i === 2 ? 'opacity-10' : ''}`} />
                                                                                <div className="h-1 bg-[#002903]/10 rounded-full flex-1" style={{ width: `${w * 100}%` }} />
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )
                                                        },
                                                        {
                                                            title: language === "es" ? "Densidad de Datos" : "Data Density",
                                                            render: () => (
                                                                <div className="grid grid-cols-6 grid-rows-3 gap-1.5 w-full h-full p-1.5">
                                                                    {[...Array(18)].map((_, i) => (
                                                                        <motion.div
                                                                            key={i}
                                                                            initial={{ scale: 0, opacity: 0 }}
                                                                            animate={{
                                                                                scale: 1,
                                                                                opacity: [0.1, 0.5, 0.2, 0.4][i % 4]
                                                                            }}
                                                                            transition={{
                                                                                delay: 0.7 + (i * 0.03),
                                                                                opacity: { repeat: Infinity, duration: 3, delay: i * 0.1 }
                                                                            }}
                                                                            className="aspect-square rounded-[3px] bg-[#002903]"
                                                                        />
                                                                    ))}
                                                                </div>
                                                            )
                                                        }
                                                    ].map((card, i) => (
                                                        <motion.div
                                                            key={i}
                                                            initial={{ scale: 0.8, opacity: 0, y: 20, rotateX: 25 }}
                                                            animate={{ scale: 1, opacity: 1, y: 0, rotateX: 0 }}
                                                            whileHover={{ y: -4, transition: { duration: 0.2 } }}
                                                            transition={{
                                                                type: "spring",
                                                                damping: 15,
                                                                stiffness: 100,
                                                                delay: i * 0.1
                                                            }}
                                                            className="bg-white rounded-xl border border-[#002903]/10 p-4 flex flex-col gap-3 shadow-[0_4px_12px_rgba(0,0,0,0.03)] relative overflow-hidden group"
                                                        >
                                                            {/* Card Header */}
                                                            <div className="flex items-center justify-between">
                                                                <div className="h-2 w-16 bg-[#F3F4F6] rounded-full group-hover:bg-[#002903]/10 transition-colors" />
                                                                <Sparkles className="w-3 h-3 text-[#002903]/10 group-hover:text-[#002903] transition-colors" />
                                                            </div>

                                                            {/* Card Content - The "Illustration" */}
                                                            <div className="flex-1 bg-[#F9FAF9] rounded-lg p-3 flex items-center justify-center relative overflow-hidden border border-[#002903]/5">
                                                                {card.render()}

                                                                {/* Digital grid overlay */}
                                                                <div className="absolute inset-0 bg-[radial-gradient(#002903_0.5px,transparent_0.5px)] [background-size:6px_6px] opacity-[0.03] pointer-events-none" />
                                                            </div>

                                                            {/* Card Footer */}
                                                            <div className="space-y-1.5">
                                                                <div className="h-1.5 w-full bg-[#F3F4F6] rounded-full" />
                                                                <div className="h-1.5 w-1/2 bg-[#F3F4F6] rounded-full" />
                                                            </div>

                                                            {/* Magic shimmer effect on entrance */}
                                                            <motion.div
                                                                initial={{ left: "-100%" }}
                                                                animate={{ left: "100%" }}
                                                                transition={{ duration: 1, delay: i * 0.1 + 0.4 }}
                                                                className="absolute top-0 bottom-0 w-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg] pointer-events-none"
                                                            />
                                                        </motion.div>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Mockup Footer */}
                    <div className="h-10 bg-black/5 border-t border-[#E6E9E6]/50 flex items-center justify-between px-6">
                        <div className="flex gap-2">
                            <div className="w-24 h-2 bg-black/5 rounded-full" />
                        </div>
                        <div className="w-20 h-5 bg-[#002903]/10 border border-[#002903]/20 rounded-full flex items-center justify-center">
                            <span className="text-[8px] text-[#002903] font-black tracking-widest uppercase">Rendering</span>
                        </div>
                    </div>
                </div>

                {/* Floating elements */}
                <motion.div
                    animate={{ y: [0, -15, 0] }}
                    transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                    className="absolute top-16 right-16 w-12 h-12 bg-[#002903]/2 rounded-3xl rotate-12 blur-lg"
                />
                <motion.div
                    animate={{ y: [0, 20, 0] }}
                    transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 1 }}
                    className="absolute bottom-16 left-16 w-20 h-20 bg-[#002903]/2 rounded-full blur-xl"
                />
            </div>
        </div>
    );
}
