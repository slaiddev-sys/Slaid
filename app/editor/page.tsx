"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import * as React from 'react';
import Head from 'next/head';
import { v4 as uuidv4 } from 'uuid';

// Import SlaidAI component system
import { TextBlock, BackgroundBlock, ImageBlock } from '../../components/blocks';
import { Cover_LeftImageTextRight, Cover_TextCenter, Cover_LeftTitleRightBodyUnderlined, Cover_ProductLayout } from '../../components/layouts/Cover';
// Canvas-enabled components
import CoverLeftImageTextRightCanvas from '../../components/layouts/Cover/Cover_LeftImageTextRight_Canvas';
import { BackCover_ThankYouWithImage } from '../../components/layouts/BackCover';
import { Index_LeftAgendaRightImage, Index_LeftAgendaRightText } from '../../components/layouts/Index/index';
import { Quote_MissionStatement, Quote_LeftTextRightImage } from '../../components/layouts/Quote/index';
import { Impact_KPIOverview, Impact_SustainabilityMetrics, Impact_ImageMetrics } from '../../components/layouts/Impact/index';
import { Team_AdaptiveGrid, Team_MemberProfile } from '../../components/layouts/Team/index';
import { Metrics_FinancialsSplit, Metrics_FullWidthChart } from '../../components/layouts/Metrics/index';
import { Lists_LeftTextRightImage, Lists_GridLayout, Lists_LeftTextRightImageDescription, Lists_CardsLayout, Lists_CardsLayoutRight } from '../../components/layouts/Lists/index';
import { Market_SizeAnalysis } from '../../components/layouts/Market/index';
import { Competition_Analysis } from '../../components/layouts/Competition/index';
import { Roadmap_Timeline } from '../../components/layouts/Roadmap/index';
import { Product_iPhoneStandalone, Product_MacBookCentered, Product_iPhoneInCenter, Product_PhysicalProduct, McBook_Feature, iPhone_HandFeature, iPhone_StandaloneFeature } from '../../components/layouts/Product/index';
import { Pricing_Plans } from '../../components/layouts/Pricing/index';
import { Content_TextImageDescription } from '../../components/layouts/Content/index';
// Import Responsive Excel Layouts
import { 
  ExcelCenteredCover_Responsive, 
  ExcelKPIDashboard_Responsive, 
  ExcelTrendChart_Responsive, 
  ExcelDataTable_Responsive, 
  ExcelBackCover_Responsive,
  ExcelBottomCover_Responsive,
  ExcelLeftCover_Responsive,
  ExcelIndex_Responsive,
  ExcelTableOfContents_Responsive,
  ExcelFullWidthChart_Responsive,
  ExcelFullWidthChartCategorical_Responsive,
  ExcelFullWidthChartWithTable_Responsive,
  ExcelComparisonLayout_Responsive,
  ExcelExperienceDrivenTwoRows_Responsive,
  ExcelExperienceFullText_Responsive,
  ExcelHowItWorks_Responsive,
  ExcelFoundationAI_Responsive,
  ExcelMilestone_Responsive,
  ExcelResultsTestimonial_Responsive,
  ExcelBackCoverLeft_Responsive
} from '../../components/layouts/ExcelResponsive';
import LoadingCircle from '../../components/LoadingCircle';
import TypewriterText from '../../components/TypewriterText';
import { generateReasoningWithTiming } from '../../utils/generateReasoning';
import FileUpload from '../../components/ui/FileUpload';
import { FileDataProcessor } from '../../utils/fileDataProcessor';
import { SimpleAutosave } from '../../components/SimpleAutosave';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useUserWorkspaces } from '../../components/hooks/useUserWorkspaces';
import { useAuth } from '../../components/AuthProvider';
import { useCredits } from '../../components/hooks/useCredits';
import FeaturebaseWidget, { openFeaturebaseWidget } from '../../components/FeaturebaseWidget';
import { supabase } from '../../lib/supabase';
import PolarCheckout from '../../components/PolarCheckout';
import { getProductId } from '../../lib/polar-config';

// Extend Window interface for the new presentation flag
declare global {
  interface Window {
    slaidNewPresentationFlag?: number;
  }
}

// Import GraphBlock separately to handle potential errors
// GraphBlock is now imported directly from the blocks module

// Helper function to truncate user message for version title (first 15 characters + ...)
const truncateVersionTitle = (message: string): string => {
  const cleanMessage = message.trim();
  if (cleanMessage.length <= 15) {
    return cleanMessage;
  }
  return cleanMessage.slice(0, 15) + '...';
};

export default function EditorPage() {
  console.log('🚨🚨🚨 EDITOR PAGE START: Component function called at', new Date().toISOString());
  // 🚨 CRITICAL DEBUG: Ensure this component is loaded
  console.log('🚨 CRITICAL DEBUG: EditorPage component loaded at', new Date().toISOString());
  
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { 
    credits, 
    loading: creditsLoading, 
    error: creditsError, 
    refreshCredits, 
    hasEnoughCredits 
  } = useCredits();
  const { 
    workspaces, 
    currentWorkspace, 
    setCurrentWorkspace, 
    loading: workspacesLoading, 
    renameWorkspace,
    isAuthenticated
  } = useUserWorkspaces();
  
  // Helper function to get auth headers for API calls
  const getAuthHeaders = useCallback(async () => {
    try {
      // First try to get the current session
      let { data: { session } } = await supabase.auth.getSession();
      
      // If no session, try refreshing it
      if (!session?.access_token) {
        console.warn('⚠️ No active session found - attempting to refresh');
        const { data: refreshData } = await supabase.auth.refreshSession();
        session = refreshData.session;
      }
      
      if (!session?.access_token) {
        console.error('❌ No session found even after refresh - user needs to log in');
        throw new Error('Authentication required - please log in');
      }
      
      console.log('✅ Auth headers ready with token');
      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      };
    } catch (error) {
      console.error('❌ Failed to get auth headers:', error);
      throw error; // Re-throw so the caller knows auth failed
    }
  }, []);
  
  // Check for export mode from URL parameters
  const [isExportMode, setIsExportMode] = useState(false);
  const [exportSlideIndex, setExportSlideIndex] = useState(0);
  const [exportPresentationId, setExportPresentationId] = useState<string | null>(null);
  const [exportWorkspace, setExportWorkspace] = useState<string | null>(null);
  const [exportSlideData, setExportSlideData] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const exportParam = urlParams.get('export');
      const slideIndexParam = urlParams.get('slideIndex');
      const presentationIdParam = urlParams.get('presentationId');
      const workspaceParam = urlParams.get('workspace');
      const slideDataParam = urlParams.get('slideData');
      
      console.log('📄 useEffect: Checking URL params:', {
        export: exportParam,
        hasSlideData: !!slideDataParam,
        slideDataLength: slideDataParam?.length,
        hasWindowData: !!(window as any).__EXPORT_SLIDE_DATA__,
        url: window.location.href
      });
      
      if (exportParam === 'true') {
        console.log('📄 Export mode detected!');
        setIsExportMode(true);
        setExportSlideIndex(slideIndexParam ? parseInt(slideIndexParam) : 0);
        setExportPresentationId(presentationIdParam);
        setExportWorkspace(workspaceParam);
        
        // First check for injected slide data (from Puppeteer)
        if ((window as any).__EXPORT_SLIDE_DATA__) {
          try {
            console.log('📄 Using injected slide data from window.__EXPORT_SLIDE_DATA__');
            const slideData = (window as any).__EXPORT_SLIDE_DATA__;
            console.log('✅ Successfully loaded slide data:', slideData);
            console.log('✅ Slide blocks:', slideData.blocks);
            setExportSlideData(slideData);
          } catch (error) {
            console.error('❌ Export mode: Failed to use injected slide data:', error);
          }
        }
        // Fallback to URL parameter (for backwards compatibility)
        else if (slideDataParam) {
          try {
            console.log('📄 Parsing slideData parameter from URL...');
            const slideData = JSON.parse(decodeURIComponent(slideDataParam));
            console.log('✅ Successfully parsed slide data:', slideData);
            console.log('✅ Slide blocks:', slideData.blocks);
            setExportSlideData(slideData);
          } catch (error) {
            console.error('❌ Export mode: Failed to parse slide data:', error);
            console.error('❌ Export mode: Raw slideDataParam length:', slideDataParam?.length);
            console.error('❌ Export mode: First 200 chars:', slideDataParam?.substring(0, 200));
          }
        } else {
          console.error('❌ Export mode: No slideData found in window or URL!');
        }
        
        // Set the active slide to the export slide
        if (slideIndexParam) {
          setActiveSlide(parseInt(slideIndexParam));
        }
        
        // Set the current presentation and workspace
        if (presentationIdParam) {
          setCurrentPresentationId(parseInt(presentationIdParam));
        }
        if (workspaceParam) {
          setCurrentWorkspace(workspaceParam);
        }
      }
    }
  }, []);
  const [isMounted, setIsMounted] = useState(false);
  // Define a type for messages
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userPlan, setUserPlan] = useState<'free' | 'pro'>('free');
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [showCreditPacksModal, setShowCreditPacksModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showHelpDropdown, setShowHelpDropdown] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const helpDropdownRef = useRef<HTMLDivElement>(null);
  const helpButtonRef = useRef<HTMLButtonElement>(null);
  const topRowRef = useRef<HTMLDivElement>(null);
  const [chatInput, setChatInput] = useState("");
  const [chatInputDetails, setChatInputDetails] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [activeVersion, setActiveVersion] = useState<number | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // File upload state and handler
  const [fileData, setFileData] = useState<any>(null);
  
  // Handle file data extraction
  const handleFileDataExtracted = React.useCallback((data: any, fileName: string, fileType: string) => {
    const processedData = fileType === 'excel' 
      ? FileDataProcessor.processExcelData(data, fileName)
      : FileDataProcessor.processWordData(data, fileName);
    
    setFileData(processedData);
    console.log('File processed in editor:', processedData);
  }, []);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [attachedFile, setAttachedFile] = useState<{ url: string; type: string; name: string } | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<Array<{ 
    url: string; 
    type: string; 
    name: string; 
    isUploaded?: boolean;
    uploadStatus?: 'uploading' | 'completed' | 'error';
    suggestedVariant?: string;
    serverUrl?: string;
    uploadError?: string;
  }>>([]);
  const [presentationTitle, setPresentationTitle] = useState('Chat-Based Presentation Editor');
  
  // Get the presentation title from generated data
  const getDisplayTitle = () => {
    return currentPresentationData?.title || presentationTitle;
  };
  // Replace presentations, currentPresentationId, slides, and activeSlide with workspace-specific state
  const initialPresentations = [
    { id: 1, title: "NutriTrack Insights" },
    { id: 2, title: "Fitness Tracker Pro" },
    { id: 3, title: "Marketing Dashboard" },
    { id: 4, title: "Q4 Strategy Review" },
  ];
  const initialSlides = [{ title: "New Slide 1" }];
  const [workspacePresentations, setWorkspacePresentations] = useState<{ [key: string]: { id: string; title: string }[] }>({});
  console.log('🚨🚨🚨 EDITOR PAGE: workspacePresentations state initialized');
  const [workspaceSlides, setWorkspaceSlides] = useState<{ [key: string]: { [presentationId: string]: { title: string }[] } }>({});
  const [currentPresentationId, setCurrentPresentationId] = useState<string>(uuidv4());

  // Persist activeVersion to localStorage
  React.useEffect(() => {
    if (activeVersion !== null && currentPresentationId) {
      const storageKey = `activeVersion_${currentPresentationId}_${currentWorkspace}`;
      localStorage.setItem(storageKey, activeVersion.toString());
      console.log('💾 Persisting activeVersion to localStorage:', { presentationId: currentPresentationId, version: activeVersion });
    }
  }, [activeVersion, currentPresentationId, currentWorkspace]);


  const [activeSlide, setActiveSlide] = useState(0);
  const [editingTitle, setEditingTitle] = useState<number | null>(null);
  const [originalSelectedPresentation, setOriginalSelectedPresentation] = useState<number | null>(null);
  const [editingWorkspace, setEditingWorkspace] = useState<boolean>(false);
  const [workspaceDisplayName, setWorkspaceDisplayName] = useState<string>('');
  const [showTitleMenu, setShowTitleMenu] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showFullscreenPreview, setShowFullscreenPreview] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false); // Track if database data has been loaded
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1); // 1: Upload Files, 2: Description, 3: Slide Count & Summary
  const [selectedSlideCount, setSelectedSlideCount] = useState(''); // No default selection
  
  // Helper function to convert slide count text to number
  const getSlideCountNumber = (slideCountText: string): number => {
    switch (slideCountText) {
      case 'Less than 5':
        return 5;
      case '6-10':
        return 8;
      case '11-15':
        return 13;
      case '16-20':
        return 18;
      case 'More than 20':
        return 25; // Now we can handle more slides with batching!
      default:
        // Try parsing as number for backward compatibility
        const parsed = parseInt(slideCountText);
        return isNaN(parsed) ? 5 : parsed; // No cap anymore!
    }
  };
  
  // File upload and analysis states (from test-excel logic)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');
  const [comprehensiveAnalysis, setComprehensiveAnalysis] = useState('');
  const [presentationPrompt, setPresentationPrompt] = useState('');
  const [isAnalyzingPrompt, setIsAnalyzingPrompt] = useState(false);
  const [promptAnalysis, setPromptAnalysis] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // For presentation generation loading
  const [loadingStep, setLoadingStep] = useState(1); // Track which loading step is active (1, 2, or 3)
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0, slideRange: '' }); // Track batch generation progress
  const [selectedChartColor, setSelectedChartColor] = useState('#ff0000'); // Default to red
  const [colorPickerPosition, setColorPickerPosition] = useState({ x: 50, y: 50 }); // Cursor position in %
  const [selectedHue, setSelectedHue] = useState(0); // Current hue value (red by default)

  // Handle sequential loading steps (10 seconds each)
  useEffect(() => {
    if (!isLoading) {
      setLoadingStep(1); // Reset to step 1 when not loading
      return;
    }

    // Step 1: Analyzing content (0-10s)
    const step1Timer = setTimeout(() => {
      setLoadingStep(2); // Move to step 2 after 10s
    }, 10000);

    // Step 2: Generating slides (10-20s)
    const step2Timer = setTimeout(() => {
      setLoadingStep(3); // Move to step 3 after 20s
    }, 20000);

    return () => {
      clearTimeout(step1Timer);
      clearTimeout(step2Timer);
    };
  }, [isLoading]);

  // File upload and analysis handlers (from test-excel logic)
  const handleFileUpload = async (selectedFile: File) => {
    console.log('handleFileUpload called with:', selectedFile.name);
    setIsUploading(true);
    setUploadError('');
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      setUploadResult(result);
      setUploadedFiles([selectedFile]);
      console.log('Upload result:', result);
      
      // Automatically perform comprehensive analysis after upload
      await performComprehensiveAnalysis(result);
      
    } catch (err) {
      console.error('Upload error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setUploadError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const performComprehensiveAnalysis = async (fileData: any) => {
    setIsAnalyzing(true);
    setUploadError('');

    try {
      const response = await fetch('/api/test-excel-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileData: fileData,
          prompt: 'Please analyze this Excel file and tell me exactly what data you can see. List all the values, headers, and structure you can extract from this file.'
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Analysis failed');
      }

      setAnalysisResult(result.analysis);
      setComprehensiveAnalysis(result.comprehensiveAnalysis || '');
      
      // Update uploadResult with processed data for presentation generation (same as test-excel)
      if (result.processedData) {
        setUploadResult((prev: any) => ({
          ...prev,
          processedData: result.processedData
        }));
      }
      
      // Move to step 2 after successful analysis
      setOnboardingStep(2);
      
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePresentationPromptAnalysis = async () => {
    if (!presentationPrompt.trim() || !uploadResult) return;

    setIsAnalyzingPrompt(true);
    setUploadError('');
    setPromptAnalysis('');

    try {
      const response = await fetch('/api/test-excel-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileData: uploadResult,
          presentationPrompt: presentationPrompt.trim()
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Prompt analysis failed');
      }

      setPromptAnalysis(result.promptAnalysis || 'Analysis completed successfully');
      
      // Move to step 3 after successful prompt analysis
      setOnboardingStep(3);
      
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Prompt analysis failed');
    } finally {
      setIsAnalyzingPrompt(false);
    }
  };

  // Helper function to convert HSL to HEX
  const hslToHex = (h: number, s: number, l: number) => {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };
  const titleMenuRef = useRef<HTMLDivElement>(null);
  const dotsButtonRef = useRef<HTMLButtonElement>(null);
  
  // Get slides for current presentation (now managed by generated presentations)
  
  // Helper function to update slides for current presentation
  const updateSlides = (newSlides: { title: string }[]) => {
    setWorkspaceSlides(prev => ({
      ...prev,
      [currentWorkspace]: {
        ...prev[currentWorkspace],
        [currentPresentationId]: newSlides
      }
    }));
  };
  
  // Add a ref to track the last created presentation id
  const lastCreatedPresentationId = useRef<number | null>(null);
  
  // Add a ref to track all created presentation IDs for better reload
  const createdPresentationIds = useRef<Set<number>>(new Set());
  
  // Load persisted presentation IDs from localStorage on mount
  useEffect(() => {
    console.log('🔄🔄🔄 LOADING PERSISTED IDS EFFECT TRIGGERED for workspace:', currentWorkspace);
    
    // 🔧 LOAD WORKSPACES FROM LOCALSTORAGE
    try {
      const savedWorkspaces = localStorage.getItem('slaid_workspaces');
      if (savedWorkspaces) {
        const workspaceNames = JSON.parse(savedWorkspaces) as string[];
        console.log('📂 Loading workspaces from localStorage:', workspaceNames);
        
        // Initialize workspaces if they don't exist
        const initialWorkspacePresentations: { [key: string]: { id: number; title: string }[] } = {};
        const initialWorkspaceSlides: { [key: string]: { [presentationId: number]: { title: string }[] } } = {};
        
        workspaceNames.forEach(workspaceName => {
          initialWorkspacePresentations[workspaceName] = [];
          initialWorkspaceSlides[workspaceName] = {};
        });
        
        // Only update if we have saved workspaces and they're different from current
        if (workspaceNames.length > 0 && JSON.stringify(Object.keys(workspacePresentations)) !== JSON.stringify(workspaceNames)) {
          setWorkspacePresentations(initialWorkspacePresentations);
          setWorkspaceSlides(initialWorkspaceSlides);
          console.log('✅ Workspaces loaded from localStorage:', workspaceNames);
        }
      }
    } catch (error) {
      console.error('❌ Failed to load workspaces from localStorage:', error);
    }
    
    // Load persisted presentation IDs for current workspace
    try {
      const storageKey = `createdPresentationIds_${currentWorkspace}`;
      console.log('🔄🔄🔄 CHECKING LOCALSTORAGE KEY:', storageKey);
      const persistedIds = localStorage.getItem(storageKey);
      console.log('🔄🔄🔄 RAW LOCALSTORAGE VALUE:', persistedIds);
      
      // Always include known existing presentation IDs
      const knownExistingIds = [1760541972152, 1760543047479, 1760543047480, 1760544327436];
      
      if (persistedIds) {
        const ids = JSON.parse(persistedIds) as number[];
        // Merge persisted IDs with known existing IDs
        const allIds = [...new Set([...ids, ...knownExistingIds])];
        createdPresentationIds.current = new Set(allIds);
        console.log('🔄🔄🔄 LOADED PERSISTED + KNOWN PRESENTATION IDS:', allIds);
        
        // Update localStorage with the merged list
        localStorage.setItem(storageKey, JSON.stringify(allIds));
      } else {
        // If no persisted IDs, start with known existing IDs
        createdPresentationIds.current = new Set(knownExistingIds);
        localStorage.setItem(storageKey, JSON.stringify(knownExistingIds));
        console.log('🔄🔄🔄 INITIALIZED WITH KNOWN EXISTING IDS:', knownExistingIds);
      }
      console.log('🔄🔄🔄 CREATED IDS SET SIZE:', createdPresentationIds.current.size);
    } catch (error) {
      console.error('❌ Error loading persisted presentation IDs:', error);
    }
  }, [currentWorkspace]);
  
  // Helper function to persist created IDs to localStorage
  const persistCreatedId = (id: number) => {
    console.log('🔄🔄🔄 PERSIST CREATED ID CALLED with ID:', id);
    createdPresentationIds.current.add(id);
    try {
      const idsArray = Array.from(createdPresentationIds.current);
      const storageKey = `createdPresentationIds_${currentWorkspace}`;
      localStorage.setItem(storageKey, JSON.stringify(idsArray));
      console.log('🔄🔄🔄 PERSISTED PRESENTATION ID:', id, 'TOTAL:', idsArray.length);
      console.log('🔄🔄🔄 STORAGE KEY:', storageKey);
      console.log('🔄🔄🔄 ALL PERSISTED IDS:', idsArray);
    } catch (error) {
      console.error('❌ Error persisting presentation ID:', error);
    }
  };

  // Function to reload workspace presentations using the new API
  const reloadWorkspacePresentations = async () => {
    try {
      // Check if user is authenticated
      if (!user) {
        console.warn('⚠️ Cannot reload presentations: user not authenticated');
        setIsDataLoaded(true);
        return [];
      }
      
      console.log('🔄🔄🔄 RELOADING ALL WORKSPACE PRESENTATIONS for:', currentWorkspace)
      console.log('🔄🔄🔄 WORKSPACE DEBUG:', {
        currentWorkspace,
        type: typeof currentWorkspace,
        length: currentWorkspace?.length,
        isEmpty: !currentWorkspace || currentWorkspace.trim() === ''
      })
      
      // Check if workspace is valid before making API call
      if (!currentWorkspace || currentWorkspace.trim() === '') {
        console.error('❌ Cannot reload presentations: invalid workspace:', currentWorkspace)
        setWorkspacePresentations(prev => ({
          ...prev,
          [currentWorkspace || 'default']: []
        }));
        setIsDataLoaded(true);
        return [];
      }
      
      // Get authentication headers
      try {
        const headers = await getAuthHeaders();
        
        // Call the new list presentations API
        const response = await fetch(`/api/presentations/list`, {
          method: 'GET',
          headers,
        });

        if (!response.ok) {
          console.error('❌ Failed to list presentations:', response.status, response.statusText);
          // Fallback to empty array but ensure workspace exists
          setWorkspacePresentations(prev => ({
            ...prev,
            [currentWorkspace]: []
          }));
          setIsDataLoaded(true);
          return [];
        }

        const result = await response.json();
        if (!result.success) {
          console.error('❌ API returned error:', result.error);
          // Fallback to empty array but ensure workspace exists
          setWorkspacePresentations(prev => ({
            ...prev,
            [currentWorkspace]: []
          }));
          setIsDataLoaded(true);
          return [];
        }

        const presentations = result.presentations || [];
        console.log('✅ Loaded presentations from API:', presentations.length);
        
        // Update workspace presentations
        const existingPresentations = presentations.map((p: any) => ({
          id: p.id,
          title: p.title
        }));

        setWorkspacePresentations(prev => ({
          ...prev,
          [currentWorkspace]: existingPresentations
        }));

        // Load slides and messages for each presentation
        const dataPromises = presentations.map(async (presentation: any) => {
          try {
            const dataResponse = await fetch(`/api/presentations/load?presentationId=${presentation.id}`, {
              method: 'GET',
              headers,
            });
          
          if (dataResponse.ok) {
            const dataResult = await dataResponse.json();
            if (dataResult?.success && dataResult?.state) {
              return {
                presentationId: presentation.id,
                slides: dataResult.state.slides?.map((slide: any, index: number) => ({
                  title: slide.title || `Slide ${index + 1}`
                })) || [],
                messages: dataResult.state.messages || []
              };
            }
          }
        } catch (error) {
          console.error('❌ Failed to load data for presentation:', presentation.id, error);
        }
        return null;
        });
        
        const dataResults = await Promise.all(dataPromises);
        const validDataResults = dataResults.filter(Boolean) as { presentationId: string; slides: { title: string }[]; messages: any[] }[];
        
        // Update workspace slides
        setWorkspaceSlides(prev => {
          const updated = { ...prev };
          if (!updated[currentWorkspace]) {
            updated[currentWorkspace] = {};
          }
          
          validDataResults.forEach(result => {
            updated[currentWorkspace][result.presentationId] = result.slides;
          });
          
          return updated;
        });
        
        // Update presentation messages
        setPresentationMessages(prev => {
          const updated = { ...prev };
          
          validDataResults.forEach(result => {
            updated[result.presentationId] = result.messages;
          });
          
          return updated;
        });
        
        // Mark data as loaded
        setIsDataLoaded(true);
        
        return existingPresentations;
      } catch (error) {
        console.error('❌ Failed to get auth or load presentations:', error);
        setWorkspacePresentations(prev => ({
          ...prev,
          [currentWorkspace]: []
        }));
        setIsDataLoaded(true);
        return [];
      }
    } catch (error) {
      console.error('❌ Failed to reload workspace presentations:', error);
      // Ensure workspace exists even on error
      setWorkspacePresentations(prev => ({
        ...prev,
        [currentWorkspace]: []
      }));
      setIsDataLoaded(true);
      return [];
    }
  };

  // Handle PDF export
  const handleExportPDF = async () => {
    if (!currentPresentation || slides.length === 0) {
      console.error('❌ No presentation or slides to export');
      return;
    }

    setIsExporting(true);
    setExportProgress(0);
    
    let progressInterval: NodeJS.Timeout | null = null;
    
    try {
      console.log('📄 Starting PDF export for presentation:', currentPresentation.title);
      
      // Simulate progress updates during export - realistic timing for 1-2 minute process
      progressInterval = setInterval(() => {
        setExportProgress(prev => {
          if (prev >= 85) return prev; // Stop at 85% until actual completion
          // Slower, more realistic progress increments
          const increment = Math.random() * 2 + 0.5; // 0.5% to 2.5% increments
          return Math.min(prev + increment, 85);
        });
      }, 1500); // Update every 1.5 seconds instead of 200ms
      
      const exportData = {
        presentationId: currentPresentationId,
        workspace: currentWorkspace,
        title: currentPresentation.title,
        slides: slides
      };

      const response = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(exportData),
      });

      // Clear progress interval
      if (progressInterval) clearInterval(progressInterval);
      
      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      // Set progress to 100% when complete
      setExportProgress(100);

      // Get the PDF blob
      const pdfBlob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${currentPresentation.title || 'presentation'}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('✅ PDF export completed successfully');
      
      // Small delay to show 100% completion
      setTimeout(() => {
        setShowExportModal(false);
        setExportProgress(0);
      }, 500);
      
    } catch (error) {
      console.error('❌ PDF export failed:', error);
      // Clear progress interval on error
      if (progressInterval) clearInterval(progressInterval);
      // Reset progress on error
      setExportProgress(0);
      // Show error message but DON'T close modal
      alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExporting(false);
      // DON'T close modal on error - let user try again
    }
  };

  // Debug effect to track workspacePresentations changes
  useEffect(() => {
    console.log('🖥️🖥️🖥️ WORKSPACE PRESENTATIONS CHANGED:', {
      workspace: currentWorkspace,
      count: workspacePresentations[currentWorkspace]?.length || 0,
      presentations: workspacePresentations[currentWorkspace]
    });
  }, [workspacePresentations, currentWorkspace]);

  // Debug effect to confirm component rendering
  useEffect(() => {
    console.log('🖥️🖥️🖥️ EDITOR MAIN COMPONENT RENDERING at', new Date().toISOString());
    console.log('🖥️🖥️🖥️ CURRENT PRESENTATION ID:', currentPresentationId);
    console.log('🖥️🖥️🖥️ MESSAGES LENGTH:', messages.length);
    console.log('🖥️🖥️🖥️ WORKSPACE PRESENTATIONS:', workspacePresentations[currentWorkspace]?.length || 0);
  });

  // Load all presentations for the current workspace on mount
  useEffect(() => {
    // Don't load presentations if workspace system is still loading or workspace is invalid
    if (workspacesLoading || !currentWorkspace || currentWorkspace.trim() === '') {
      console.log('🚀🚀🚀 SKIPPING WORKSPACE PRESENTATIONS LOAD - not ready:', {
        workspacesLoading,
        currentWorkspace,
        isEmpty: !currentWorkspace || currentWorkspace.trim() === ''
      });
      return;
    }

    // Add a small delay to ensure the component is fully mounted
    console.log('🚀🚀🚀 SCHEDULING WORKSPACE PRESENTATIONS LOAD for:', currentWorkspace)
    const timeoutId = setTimeout(() => {
      // Use the enhanced reload function instead of the old loadWorkspacePresentations
      reloadWorkspacePresentations()
    }, 50); // Reduced delay to 50ms for faster loading
    
    return () => clearTimeout(timeoutId);
  }, [currentWorkspace, workspacesLoading])

  // Initialize workspace display name when currentWorkspace changes
  useEffect(() => {
    // Clear old non-user-specific localStorage entries to avoid conflicts
    if (user?.id) {
      try {
        const oldKey = 'slaid_workspace_display_name';
        if (localStorage.getItem(oldKey)) {
          localStorage.removeItem(oldKey);
          console.log('🧹 Cleared old non-user-specific workspace name from localStorage');
        }
        
        // Also clear any other user's workspace names to ensure clean state
        const allKeys = Object.keys(localStorage);
        const workspaceKeys = allKeys.filter(key => key.startsWith('slaid_workspace_display_name_') && key !== `slaid_workspace_display_name_${user.id}`);
        workspaceKeys.forEach(key => {
          localStorage.removeItem(key);
          console.log('🧹 Cleared other user workspace name:', key);
        });
      } catch (error) {
        console.warn('⚠️ Failed to clear old localStorage entries:', error);
      }
    }
    
    // Try to load saved display name from localStorage first
    try {
      const userSpecificKey = `slaid_workspace_display_name_${user?.id || 'anonymous'}`;
      const savedDisplayName = localStorage.getItem(userSpecificKey);
      console.log('🔍 Looking for workspace name with key:', userSpecificKey);
      console.log('🔍 Found saved display name:', savedDisplayName);
      console.log('🔍 Current workspace from hook:', currentWorkspace);
      console.log('🔍 Current user:', user?.email);
      
      if (savedDisplayName) {
        console.log('📂 Loaded workspace display name from localStorage:', savedDisplayName);
        setWorkspaceDisplayName(savedDisplayName);
      } else {
        // Fallback to currentWorkspace if no saved name
        setWorkspaceDisplayName(currentWorkspace);
        
        // If we have a user and currentWorkspace, save it as the default for this user
        if (user && currentWorkspace) {
          try {
            localStorage.setItem(userSpecificKey, currentWorkspace);
            console.log('💾 Saved default workspace name for user:', userSpecificKey, currentWorkspace);
          } catch (error) {
            console.error('❌ Failed to save default workspace name:', error);
          }
        }
      }
    } catch (error) {
      console.error('❌ Failed to load workspace name from localStorage:', error);
      // Fallback to currentWorkspace on error
      setWorkspaceDisplayName(currentWorkspace);
    }
  }, [currentWorkspace]);

  // Replace messages state with a per-presentation messages state
  const [presentationMessages, setPresentationMessages] = useState<{ [presentationId: number]: { id?: string; role: string; text: string; version?: number; userMessage?: string; image?: string; file?: { url: string; name: string; type: string }; attachments?: Array<{ url: string; type: string; name: string }>; isLoading?: boolean; presentationData?: any; }[] }>({});

  // Track if we've done the initial empty check
  const hasCheckedForEmptyWorkspace = useRef(false);

  // When switching workspace, update presentations, slides, and reset selection
  useEffect(() => {
    console.log('🔄 useEffect triggered:', { isDataLoaded, currentWorkspace, allWorkspaces: Object.keys(workspacePresentations), presentationsCount: workspacePresentations[currentWorkspace]?.length });
    
    // Skip initialization until data is loaded from database
    if (!isDataLoaded) {
      console.log('⏸️ Skipping - data not loaded yet');
      return;
    }
    
    // Get the workspace key - if currentWorkspace is empty, use the first available workspace
    const workspaceKey = currentWorkspace || Object.keys(workspacePresentations)[0] || '';
    console.log('🔑 Using workspace key:', workspaceKey);
    
    let pres = workspacePresentations[workspaceKey];
    console.log('📊 Presentations to check:', pres?.length || 0, pres);
    
    // Only check for empty workspace on initial load, not when switching presentations
    if (!hasCheckedForEmptyWorkspace.current) {
      console.log('🔍 First time check - checking if workspace is empty or all presentations are unused');
      hasCheckedForEmptyWorkspace.current = true;
      
      // If workspace is empty, show onboarding instead of creating a default presentation
      if (!pres || pres.length === 0) {
        console.log('📭 No presentations found - showing onboarding');
        setShowOnboarding(true);
        setOnboardingStep(1);
        return;
      }
      
      // Check if all presentations are "empty" (created but never used)
      // An empty presentation has: 1 slide, no messages (or only system messages), and default slide title
      console.log('🔍 Starting empty check for', pres.length, 'presentations');
      console.log('🔍 Available slides data:', workspaceSlides[workspaceKey]);
      console.log('🔍 Available messages data:', presentationMessages);
      
      const allPresentationsEmpty = pres.every(presentation => {
        const presentationSlides = workspaceSlides[workspaceKey]?.[presentation.id] || [];
        const messages = presentationMessages[presentation.id] || [];
        
        // Count user messages (not system messages)
        const userMessages = messages.filter((msg: any) => msg.role === 'user').length;
        
        const isEmpty = (
          presentationSlides.length <= 1 && // Only has default slide or less
          userMessages === 0 && // No user messages
          (presentationSlides.length === 0 || presentationSlides[0]?.title?.includes('New Slide')) // Default slide title
        );
        
        console.log(`🔍 Checking if presentation "${presentation.title}" (${presentation.id}) is empty:`, {
          slides: presentationSlides.length,
          userMessages,
          totalMessages: messages.length,
          firstSlideTitle: presentationSlides[0]?.title,
          isEmpty
        });
        
        return isEmpty;
      });
      
      console.log('🎯 All presentations empty?', allPresentationsEmpty);
      
      if (allPresentationsEmpty) {
        console.log('📭 All presentations are empty - showing onboarding');
        setShowOnboarding(true);
        setOnboardingStep(1);
        return;
      }
    }
    
    // Handle existing presentations - but only set presentation if we don't have one selected
    if (pres && pres.length > 0) {
      if (lastCreatedPresentationId.current && pres.some(p => p.id === lastCreatedPresentationId.current)) {
        setCurrentPresentationId(lastCreatedPresentationId.current);
        lastCreatedPresentationId.current = null;
      } else if (!currentPresentationId || !pres.some(p => p.id === currentPresentationId)) {
        // Only switch to first presentation if we don't have a valid current presentation
        setCurrentPresentationId(pres[0].id);
      }
      // Only reset slide if we're switching presentations
      if (!currentPresentationId || !pres.some(p => p.id === currentPresentationId)) {
      setActiveSlide(0);
      }
    }
  }, [currentWorkspace, workspacePresentations, isDataLoaded, workspaceSlides, presentationMessages]);

  const currentPresentation = workspacePresentations[currentWorkspace]?.find(p => p.id === currentPresentationId);

  // Helper to get current messages
  const messages = presentationMessages[currentPresentationId] || [];

  // Load activeVersion from localStorage on component mount and when presentation changes
  React.useEffect(() => {
    console.log('🔍 VERSION RESTORE: Checking conditions:', {
      currentPresentationId,
      currentWorkspace,
      messagesLength: messages.length,
      hasMessages: messages.length > 0
    });
    
    if (currentPresentationId && currentWorkspace && messages.length > 0) {
      const storageKey = `activeVersion_${currentPresentationId}_${currentWorkspace}`;
      const savedVersion = localStorage.getItem(storageKey);
      console.log('🔍 VERSION RESTORE: localStorage check:', { storageKey, savedVersion });
      
      if (savedVersion && !isNaN(Number(savedVersion))) {
        const versionNumber = Number(savedVersion);
        // Verify this version exists in the messages
        const assistantMessages = messages.filter(msg => 
          msg.role === 'assistant' && msg.version && msg.presentationData
        );
        console.log('🔍 VERSION RESTORE: Available versions:', assistantMessages.map(m => m.version));
        
        const versionExists = assistantMessages.some(msg => msg.version === versionNumber);
        if (versionExists) {
          console.log('📂 Loading activeVersion from localStorage:', { presentationId: currentPresentationId, version: versionNumber });
          setActiveVersion(versionNumber);
        } else {
          console.log('🗑️ Saved version no longer exists, clearing from localStorage:', versionNumber);
          localStorage.removeItem(storageKey);
        }
      }
    }
  }, [currentPresentationId, currentWorkspace, messages.length]);

  // Reset activeVersion ONLY when new messages are added (new versions created)
  const previousMessagesLength = useRef<number>(0);
  useEffect(() => {
    if (activeVersion !== null) {
      // Only reset if the messages array has grown (new message added)
      if (messages.length > previousMessagesLength.current) {
        console.log('🔄 VERSION HISTORY: New message added, resetting activeVersion to latest');
        setActiveVersion(null);
        // Clear from localStorage when resetting to latest
        const storageKey = `activeVersion_${currentPresentationId}_${currentWorkspace}`;
        localStorage.removeItem(storageKey);
        console.log('🗑️ Cleared activeVersion from localStorage due to new message:', { presentationId: currentPresentationId });
      }
    }
    // Update the previous length
    previousMessagesLength.current = messages.length;
  }, [messages, activeVersion, currentPresentationId, currentWorkspace]);

  // Get current presentation data and slides - memoized to prevent unnecessary re-renders
  const getCurrentPresentationData = React.useCallback((customMessages?: any[]) => {
    const messagesToUse = customMessages || messages;
    console.log('🔍 getCurrentPresentationData called');
    console.log('📱 Current presentation ID:', currentPresentationId);
    console.log('📱 Active version:', activeVersion);
    console.log('📱 Presentation messages keys:', Object.keys(presentationMessages));
    console.log('📱 Total messages for current presentation:', messagesToUse.length);
    console.log('📱 All messages for current presentation:', messagesToUse.map(m => ({ role: m.role, hasData: !!m.presentationData, isLoading: m.isLoading, version: m.version })));
    console.log('📱 Full presentationMessages state:', presentationMessages);
    
    // 🔧 VERSION HISTORY: If activeVersion is set, return data from that specific version
    if (activeVersion !== null) {
      console.log('🔄 VERSION HISTORY: Looking for version', activeVersion);
      console.log('🔄 VERSION HISTORY: Available messages:', messagesToUse.map(m => ({ role: m.role, version: m.version, hasData: !!m.presentationData })));
      const versionMessage = messagesToUse.find(
        msg => msg.role === 'assistant' && msg.version === activeVersion && msg.presentationData && !msg.isLoading
      );
      if (versionMessage) {
        console.log('✅ VERSION HISTORY: Found version', activeVersion, 'data:', {
          title: versionMessage.presentationData?.title,
          slideCount: versionMessage.presentationData?.slides?.length
        });
        return versionMessage.presentationData;
      } else {
        console.log('❌ VERSION HISTORY: Version', activeVersion, 'not found, falling back to latest');
      }
    }
    
    // Try multiple approaches to find presentation data (default behavior - latest version)
    const approaches = [
      // Approach 1: Last assistant message with presentation data (not loading)
      [...messagesToUse].reverse().find(
        msg => msg.role === 'assistant' && msg.presentationData && !msg.isLoading
      ),
      // Approach 2: Last assistant message with presentation data (even if loading)
      [...messagesToUse].reverse().find(
        msg => msg.role === 'assistant' && msg.presentationData
      ),
      // Approach 3: Any message with presentation data
      [...messagesToUse].reverse().find(
        msg => msg.presentationData
      )
    ];
    
    console.log('🎯 Found via approaches:', approaches.map(a => !!a));
    
    const bestMatch = approaches.find(a => a) || null;
    
    if (bestMatch) {
      console.log('✅ Using message data:', {
        title: bestMatch.presentationData?.title,
        slideCount: bestMatch.presentationData?.slides?.length,
        fromRole: bestMatch.role,
        isLoading: bestMatch.isLoading,
        version: bestMatch.version
      });
      return bestMatch.presentationData;
    }
    
         // FALLBACK: If no messages but current presentation exists, 
     // this means it's an existing presentation without chat history
     if (currentPresentation) {
       console.log('⚠️ Existing presentation without chat history - cannot modify');
       console.log('📋 Current presentation:', {
         title: currentPresentation.title,
         presentationId: currentPresentation.id
       });
       // Return null to indicate no modifiable data available
       return null;
     }
    
    console.log('❌ No presentation data found anywhere!');
    return null;
  }, [messages, currentPresentationId, presentationMessages, currentPresentation, activeVersion]);

  // Memoize the current presentation data to prevent unnecessary re-renders
  // Use deep comparison to avoid re-creating when the actual data hasn't changed
  const currentPresentationData = React.useMemo(() => {
    const data = getCurrentPresentationData();
    console.log('🔄 currentPresentationData updated for presentation:', currentPresentationId, 'data:', data?.title);
    return data;
  }, [getCurrentPresentationData, currentPresentationId, messages]);
  
  // Create a stable reference for slides that only changes when the actual slide data changes
  const slides = React.useMemo(() => {
    const slideData = currentPresentationData?.slides || [{ title: "New Slide 1" }];
    console.log('🎬 Slides updated for presentation:', currentPresentationId, 'slides:', slideData.length, 'first slide:', slideData[0]?.title);
    return slideData;
  }, [currentPresentationData?.slides, currentPresentationId]);

  // Create stable references for individual slide data to prevent unnecessary re-renders
  const memoizedSlides = React.useMemo(() => {
    return slides.map((slide: any, index: number) => ({
      ...slide,
      _slideIndex: index,
      _lastModified: currentPresentationData?._lastModified || Date.now()
    }));
  }, [slides, currentPresentationData?._lastModified]);

  // Function to detect if the prompt is a modification request
  // 🎯 USER INTENT CLASSIFICATION FUNCTIONS
  const isCreateNewPresentationRequest = (prompt: string): boolean => {
    const lowerPrompt = prompt.toLowerCase().trim();
    const createNewTriggers = [
      'create a new presentation',
      'i don\'t like this one',
      'start over',
      'generate a new deck',
      'make a fresh presentation',
      'start from scratch',
      'new presentation about',
      'make a new presentation',
      'generate slides for',
      'create slides about',
      'create a single slide', // Add this for single slide creation when no presentation exists
      'create slide'
    ];
    
    const containsPhrase = createNewTriggers.some(trigger => lowerPrompt.includes(trigger));
    const containsPattern = lowerPrompt.includes('create') && (lowerPrompt.includes('presentation') || lowerPrompt.includes('deck'));
    
    return containsPhrase || containsPattern;
  };

  const isAddNewSlideRequest = (prompt: string): boolean => {
    const lowerPrompt = prompt.toLowerCase().trim();
    const addSlideTriggers = [
      'add a new slide',
      'create a slide',
      'insert a slide',
      'add another slide',
      'new slide about',
      'add slide',
      'create slide',
      'insert slide',
      // Chart-specific triggers
      'add a chart slide',
      'create a chart slide',
      'add new slide with chart',
      'create slide with chart',
      'add a slide with a chart',
      'new slide with chart',
      'add chart',
      'create chart',
      'insert chart',
      // Layout-specific triggers
      'add team slide',
      'add pricing slide',
      'add competition slide',
      'add roadmap slide',
      'add market slide',
      'add quote slide',
      'add cover slide',
      'add agenda slide',
      'add list slide',
      'add product slide',
      'add impact slide',
      'add metrics slide',
      'create team slide',
      'create pricing slide',
      'create competition slide',
      'create roadmap slide',
      'create market slide',
      'create quote slide',
      'create cover slide',
      'create agenda slide',
      'create list slide',
      'create product slide',
      'create impact slide',
      'create metrics slide',
      // Spanish triggers
      'añade una diapositiva',
      'agrega una diapositiva', 
      'crea una diapositiva',
      'añadir diapositiva',
      'agregar diapositiva',
      'crear diapositiva',
      'añade un slide',
      'agrega un slide',
      'crea un slide',
      'añade diapositiva',
      'agrega diapositiva',
      'crea diapositiva',
      'nueva diapositiva',
      'nuevo slide',
      'diapositiva más',
      'slide más',
      // Spanish chart-specific triggers
      'añade gráfica',
      'agrega gráfico',
      'añadir gráfico',
      'crear gráfico',
      'añade una gráfica',
      'agrega una gráfica',
      'añade diapositiva con gráfica',
      'agrega diapositiva con gráfico',
      'añade diapositiva con una gráfica',
      'agrega diapositiva con un gráfico'
    ];
    
    const containsPhrase = addSlideTriggers.some(trigger => lowerPrompt.includes(trigger));
    const containsPattern = (lowerPrompt.includes('add') || lowerPrompt.includes('create') || lowerPrompt.includes('insert') || 
                           lowerPrompt.includes('añade') || lowerPrompt.includes('agrega') || lowerPrompt.includes('crea')) && 
                           (lowerPrompt.includes('slide') || lowerPrompt.includes('chart') || lowerPrompt.includes('about') ||
                           lowerPrompt.includes('diapositiva') || lowerPrompt.includes('gráfica') || lowerPrompt.includes('gráfico'));
    
    return containsPhrase || containsPattern;
  };

  const isModificationRequest = (prompt: string): boolean => {
    const lowerPrompt = prompt.toLowerCase().trim();
    
    // PRIORITY: If it's explicitly a new presentation or new slide request, it's NOT a modification
    if (isCreateNewPresentationRequest(prompt) || isAddNewSlideRequest(prompt)) {
      console.log('✅ New presentation/slide request detected, NOT a modification:', prompt);
      return false;
    }

    // Modification keywords (more comprehensive)
    const modificationKeywords = [
      'change', 'update', 'modify', 'edit', 'fix', 'adjust', 'move', 'resize', 'recolor',
      'make it', 'should be', 'needs to be', 'turn into', 'convert to',
      'bigger', 'smaller', 'higher', 'lower', 'left', 'right', 'center',
      'remove', 'delete', 'hide', 'show', 'add to this slide',
      'elimina', 'eliminar', 'borra', 'borrar', 'quita', 'quitar', 'remueve', 'remover',
      'this slide', 'current slide', 'the layout', 'the chart', 'the text',
      'title', 'paragraph', 'description', 'background', 'color', 'font',
      // Chart data modification keywords
      'change the data', 'update the data', 'use the data', 'data from', 'chart data',
      // Device switching keywords
      'replace', 'switch', 'change to', 'use instead', 'swap',
      'replace the laptop', 'replace the macbook', 'replace the pc', 'replace the computer',
      'change to iphone', 'change to phone', 'change to mobile', 'use iphone instead',
      'switch to mobile', 'make it mobile', 'use phone', 'show on phone',
      'iphone version', 'mobile version', 'phone mockup', 'mobile mockup'
    ];

    const matchedKeywords = modificationKeywords.filter(keyword => lowerPrompt.includes(keyword));
    
    // Short imperative patterns (commands without explicit modification words)
    const imperativePatterns = [
      /^(set|make|turn|put|place|position)\s+/,
      /^(increase|decrease|reduce)\s+/,
      /^(align|center|justify)\s+/
    ];
    
    const matchedPatterns = imperativePatterns.filter(pattern => pattern.test(lowerPrompt));
    const isShortImperative = lowerPrompt.split(' ').length <= 5 && matchedPatterns.length > 0;
    
    const isModification = matchedKeywords.length > 0 || matchedPatterns.length > 0 || isShortImperative;

    console.log('🔍 Intent Classification:', {
      prompt: prompt,
      isCreateNew: isCreateNewPresentationRequest(prompt),
      isAddSlide: isAddNewSlideRequest(prompt),
      isModification: isModification,
      matchedKeywords: matchedKeywords,
      matchedPatterns: matchedPatterns.map(r => r.toString()),
      isShortImperative: isShortImperative
    });
    
    // 🚨 EMERGENCY DEBUG - Force modification for chart update requests
    if (prompt.toLowerCase().includes('update') && prompt.toLowerCase().includes('chart')) {
      console.log('🚨 EMERGENCY: CHART UPDATE DETECTED - FORCING MODIFICATION');
      return true;
    }

    return isModification;
  };

  // Legacy function for backward compatibility
  const isModificationRequestLegacy = (prompt: string) => {
    const lowerPrompt = prompt.toLowerCase().trim();
    
    // PRIORITY: If prompt contains creation words, it's NOT a modification
    const creationKeywords = ['create', 'generate', 'make a', 'build', 'new presentation', 'start with', 'add slide', 'another slide', 'new slide'];
    const isCreationRequest = creationKeywords.some(keyword => lowerPrompt.includes(keyword));
    if (isCreationRequest) {
      console.log('✅ Creation request detected, NOT a modification:', prompt);
      return false;
    }

    // Keywords and patterns that imply modification (including short commands)
    const modificationKeywords = [
      'change', 'modify', 'update', 'edit', 'alter', 'adjust', 'fix', 'replace',
      'set the', 'set', 'make the', 'turn the', 'convert', 'switch', 'transform',
      'remove', 'delete', 'hide', 'show', 'toggle', 'flip', 'move', 'reorder', 'order', 'stack', 'add', 'append', 'insert',
      'title', 'paragraph', 'text', 'body', 'description', 'copy',
      'background', 'color', 'font', 'style', 'theme', 'design', 'logo', 'image', 'photo', 'picture',
      'width', 'height', 'size', 'resize', 'px', 'bigger', 'smaller', 'increase', 'decrease', 'reduce', 'wider', 'narrower',
      'gap', 'spacing', 'margin', 'padding', 'rounded', 'radius', 'align', 'alignment', 'justify', 'left', 'center', 'right',
      // Device switching keywords
      'replace the laptop', 'replace the macbook', 'replace the pc', 'replace the computer',
      'change to iphone', 'change to phone', 'change to mobile', 'use iphone instead',
      'switch to mobile', 'make it mobile', 'use phone', 'show on phone',
      'iphone version', 'mobile version', 'phone mockup', 'mobile mockup'
    ];

    const patternList: RegExp[] = [
      /(delete|remove|hide)\s+(the\s+)?(logo|image|title|paragraph|body)\b/,
      /\b(no|without)\s+(logo|image|title|paragraph|body)\b/,
      /\bflip\s+(sides|image)\b/,
      /\b(make|set)\s+.*(bigger|smaller|wider|narrower)\b/,
      /\b(add|append|insert)\s+(my\s+)?(email|phone|text|caption|note|line|paragraph)\b/,
      /(add|append|insert)\s+.*\b(below|under|after)\s+(the\s+)?(body|paragraph|title|heading)\b/,
      /\b(change|set|make)\s+.*(font|color|size|weight|spacing|margin|padding)\b/,
      /\b(change|replace|set)\s+(the\s+)?title\s+(to|:)\s+/,
      /\b(change|replace|set)\s+(the\s+)?(paragraph|body|description)\s+(to|:)\s+/
    ];

    const matchedKeywords = modificationKeywords.filter(keyword => lowerPrompt.includes(keyword));
    const matchedPatterns = patternList.filter(rx => rx.test(lowerPrompt));

    // Heuristic: short imperative prompts default to modification when not creation
    const isShortImperative = lowerPrompt.length <= 60 && /^(delete|remove|hide|show|change|set|make|flip|move|increase|decrease|reduce|widen|narrow)/.test(lowerPrompt);

    const isModification = matchedKeywords.length > 0 || matchedPatterns.length > 0 || isShortImperative;

    console.log('🔍 Modification Detection:', {
      prompt: prompt,
      isCreationRequest: isCreationRequest,
      isModification: isModification,
      matchedKeywords: matchedKeywords,
      matchedPatterns: matchedPatterns.map(r => r.toString()),
      keywordCount: matchedKeywords.length,
      patternCount: matchedPatterns.length,
      isShortImperative: isShortImperative
    });

    return isModification;
  };

  // Handle hydration
  useEffect(() => {
    setIsMounted(true);
    
    // EMERGENCY FIX: Listen for emergency KPI data
    const handleEmergencyData = (event: any) => {
      console.log('🚨 EMERGENCY: Received KPI data', event.detail);
      setPresentationMessages(prev => ({
        ...prev,
        [currentPresentationId]: [
          { role: "user", text: "create a single slide using KPI Overview" },
          {
            role: "assistant",
            text: `Successfully created "${event.detail.title}"`,
            isLoading: false,
            presentationData: event.detail
          }
        ]
      }));
      setActiveSlide(0);
    };
    
    window.addEventListener('emergencyKPIData', handleEmergencyData);
    
    // Listen for iPhone Standalone Feature requests
    const handleiPhoneRequest = () => {
      const iPhoneData = {
        "title": "Mobile Platform Showcase",
        "slides": [
          {
            "id": "slide-1",
            "blocks": [
              {
                "type": "BackgroundBlock",
                "props": {
                  "color": "bg-white"
                }
              },
              {
                "type": "iPhone_StandaloneFeature",
                "props": {
                  "title": "Product Presentation",
                  "paragraph": "Lorem ipsum dolor sit amet consectetur adipiscing elit etiam nec suscipit dui sed cursus nibh id risus ultrices convallis phasellus vel tristique diam nam placerat.",
                  "imageUrl": "/Default-Image-2.png",
                  "imageAlt": "Product image",
                  "fontFamily": "font-helvetica-neue"
                }
              }
            ]
          }
        ]
      };
      
      console.log('🚨 EMERGENCY: Injecting iPhone Standalone Feature data via direct trigger');
      handleEmergencyData({ detail: iPhoneData });
    };
    
    // Trigger iPhone layout when user types iPhone-related requests
    const checkForIPhoneRequest = () => {
      const inputElement = document.querySelector('input[type="text"]') as HTMLInputElement;
      if (inputElement && inputElement.value.toLowerCase().includes('iphone') && 
          inputElement.value.toLowerCase().includes('standalone')) {
        setTimeout(handleiPhoneRequest, 500);
      }
    };
    
        // KPI detection disabled - no automatic injection
        
        // KPI injection functions removed - no automatic injection
        
        const handleKPIRequest = () => {
          // Wait for API response to fail, then inject emergency data
          setTimeout(() => {
            const kpiData = {
            "title": "Business Performance Dashboard",
            "slides": [
              {
                "id": "slide-1",
                "blocks": [
                  {
                    "type": "BackgroundBlock",
                    "props": {
                      "color": "bg-white"
                    }
                  },
                  {
                    "type": "Impact_KPIOverview",
                    "props": {
                      "title": "KPI Overview",
                      "description": "Product performance is the backbone of growth. By evaluating how web features resonate with users and their impact on engagement, we unlock opportunities to scale effectively.",
                      "kpiCards": [
                        {
                          "title": "Active Users",
                          "value": "35,000",
                          "subtitle": "+3.2% compared to previous",
                          "trend": "up",
                          "trendValue": "+3.2%",
                          "icon": "Users",
                          "hasChart": true,
                          "chartType": "area",
                          "chartData": [100, 120, 150, 130, 160, 180, 200]
                        },
                        {
                          "title": "Retention Rate",
                          "value": "88%",
                          "subtitle": "Needs improvement",
                          "trend": "down",
                          "trendValue": "-2%",
                          "icon": "Users",
                          "hasChart": true,
                          "chartType": "area",
                          "chartData": [95, 92, 90, 88, 85, 88, 87]
                        },
                        {
                          "title": "Revenue Growth",
                          "value": "24.5%",
                          "subtitle": "Year-over-year",
                          "trend": "up",
                          "trendValue": "+4.5%",
                          "icon": "TrendingUp"
                        },
                        {
                          "title": "NPS Score",
                          "value": "45",
                          "subtitle": "Company Goal Target: 50+",
                          "trend": "neutral",
                          "icon": "Star"
                        },
                        {
                          "title": "Monthly Churn Rate",
                          "value": "4.5%",
                          "subtitle": "Down from last year's 8%",
                          "trend": "down",
                          "trendValue": "-3.5%",
                          "icon": "AlertTriangle"
                        }
                      ],
                      "layout": {
                        "columnSizes": [4, 8],
                        "showTitle": true,
                        "showDescription": true,
                        "showKpiCards": true
                      },
                      "fontFamily": "font-helvetica-neue",
                      "titleColor": "text-gray-900",
                      "descriptionColor": "text-gray-600"
                    }
                  }
                ]
              }
            ]
          };
            console.log('🚨 EMERGENCY: Triggering KPI Overview data injection with charts (after API timeout)');
            handleEmergencyData({ detail: kpiData });
          }, 5000); // Wait 5 seconds for API to complete, then inject
        };
        
        // Monitor input changes - DISABLED
        // document.addEventListener('input', checkForIPhoneRequest);
        // document.addEventListener('keyup', checkForIPhoneRequest);
        // KPI event listeners removed - no automatic injection
    
      // EMERGENCY FIX DISABLED - no automatic injection
      setTimeout(() => {
        // All emergency KPI injection disabled
        const shouldInjectKPI = false; // DISABLED
        
        if (false) { // Never execute
          const kpiData = {
            "title": "Business Performance Dashboard",
            "slides": [
              {
                "id": "slide-1",
                "blocks": [
                  {
                    "type": "BackgroundBlock",
                    "props": {
                      "color": "bg-white"
                    }
                  },
                  {
                    "type": "Impact_KPIOverview",
                    "props": {
                      "title": "KPI Overview",
                      "description": "Product performance is the backbone of growth. By evaluating how web features resonate with users and their impact on engagement, we unlock opportunities to scale effectively.",
                      "kpiCards": [
                        {
                          "title": "Active Users",
                          "value": "35,000",
                          "subtitle": "+3.2% compared to previous",
                          "trend": "up",
                          "trendValue": "+3.2%",
                          "icon": "Users",
                          "hasChart": true,
                          "chartType": "area",
                          "chartData": [100, 120, 150, 130, 160, 180, 200]
                        },
                        {
                          "title": "Retention Rate",
                          "value": "88%",
                          "subtitle": "Needs improvement",
                          "trend": "down",
                          "trendValue": "-2%",
                          "icon": "Users",
                          "hasChart": true,
                          "chartType": "area",
                          "chartData": [95, 92, 90, 88, 85, 88, 87]
                        },
                        {
                          "title": "Revenue Growth",
                          "value": "24.5%",
                          "subtitle": "Year-over-year",
                          "trend": "up",
                          "trendValue": "+4.5%",
                          "icon": "TrendingUp"
                        },
                        {
                          "title": "NPS Score",
                          "value": "45",
                          "subtitle": "Company Goal Target: 50+",
                          "trend": "neutral",
                          "icon": "Star"
                        },
                        {
                          "title": "Monthly Churn Rate",
                          "value": "4.5%",
                          "subtitle": "Down from last year's 8%",
                          "trend": "down",
                          "trendValue": "-3.5%",
                          "icon": "AlertTriangle"
                        }
                      ],
                      "layout": {
                        "columnSizes": [4, 8],
                        "showTitle": true,
                        "showDescription": true,
                        "showKpiCards": true
                      },
                      "fontFamily": "font-helvetica-neue",
                      "titleColor": "text-gray-900",
                      "descriptionColor": "text-gray-600"
                    }
                  }
                ]
              }
            ]
          };
          
          console.log('🚨 EMERGENCY: Injecting KPI Overview data');
          handleEmergencyData({ detail: kpiData });
          return;
        }
        
        const emergencyData = {
        "title": "Business Performance Dashboard",
        "slides": [
          {
            "id": "slide-1",
            "blocks": [
              {
                "type": "BackgroundBlock",
                "props": {
                  "color": "bg-white"
                }
              },
              {
                "type": "Impact_KPIOverview",
                "props": {
                  "title": "KPI Overview",
                  "description": "Product performance is the backbone of growth. By evaluating how web features resonate with users and their impact on engagement, we unlock opportunities to scale effectively.",
                  "kpiCards": [
                    {
                      "title": "Active Users",
                      "value": "35,000",
                      "subtitle": "+3.2% compared to previous",
                      "trend": "up",
                      "trendValue": "+3.2%",
                      "icon": "Users",
                      "hasChart": true,
                      "chartType": "area"
                    },
                    {
                      "title": "Retention Rate",
                      "value": "88%",
                      "subtitle": "Monthly stable, but needs improvement",
                      "trend": "neutral",
                      "icon": "Users",
                      "hasChart": true,
                      "chartType": "area"
                    },
                    {
                      "title": "Revenue Growth",
                      "value": "24.5%",
                      "subtitle": "Year over year growth",
                      "trend": "up",
                      "trendValue": "+5.2%",
                      "icon": "DollarSign",
                      "hasChart": true,
                      "chartType": "bar"
                    },
                    {
                      "title": "NPS Score",
                      "value": "45",
                      "subtitle": "Company Goal Target: 50+",
                      "trend": "neutral",
                      "icon": "Star"
                    },
                    {
                      "title": "Monthly Churn Rate",
                      "value": "4.5%",
                      "subtitle": "Down from last year's 8%",
                      "trend": "down",
                      "trendValue": "-3.5%",
                      "icon": "AlertTriangle"
                    }
                  ],
                  "layout": {
                    "columnSizes": [4, 8],
                    "showTitle": true,
                    "showDescription": true,
                    "showKpiCards": true
                  },
                  "fontFamily": "font-helvetica-neue",
                  "titleColor": "text-gray-900",
                  "descriptionColor": "text-gray-600"
                }
              }
            ]
          }
        ]
      };
      
      console.log('🚨 EMERGENCY: KPI data injection DISABLED');
      // handleEmergencyData({ detail: emergencyData }); // DISABLED
    }, 1000);
    
      return () => {
        window.removeEventListener('emergencyKPIData', handleEmergencyData);
        document.removeEventListener('input', checkForIPhoneRequest);
        document.removeEventListener('keyup', checkForIPhoneRequest);
        // KPI event listeners cleanup removed - no listeners to remove
      };
  }, [currentPresentationId]);

  // No fallback components needed - starting fresh

  // Component map for rendering generated blocks - CLEAN SLATE
  const componentMap: { [key: string]: React.ComponentType<any> } = {
    TextBlock,
    BackgroundBlock,
    ImageBlock,
    Cover_LeftImageTextRight,
    Cover_TextCenter,
    Cover_LeftTitleRightBodyUnderlined: Cover_TextCenter, // Restored original Cover_TextCenter design
    Cover_ProductLayout,
    BackCover_ThankYouWithImage,
    Index_LeftAgendaRightImage,
    Index_LeftAgendaRightText,
    Quote_MissionStatement,
    Quote_LeftTextRightImage,
    Impact_KPIOverview,
    Impact_SustainabilityMetrics,
    Impact_ImageMetrics,
    Team_AdaptiveGrid,
    Team_MemberProfile,
    Metrics_FinancialsSplit,
    Metrics_FullWidthChart,
    Lists_LeftTextRightImage,
    Lists_GridLayout,
    Lists_LeftTextRightImageDescription,
    Lists_CardsLayout,
    Lists_CardsLayoutRight,
    Market_SizeAnalysis,
    Competition_Analysis,
    Roadmap_Timeline,
    Product_iPhoneStandalone,
    Product_MacBookCentered,
    Product_iPhoneInCenter,
    Product_PhysicalProduct,
    McBook_Feature,
    iPhone_HandFeature,
    iPhone_StandaloneFeature,
    Pricing_Plans,
    Content_TextImageDescription,
    // Responsive Excel Layouts - Phase 1
    ExcelCenteredCover_Responsive,
    ExcelKPIDashboard_Responsive,
    ExcelTrendChart_Responsive,
    ExcelDataTable_Responsive,
    ExcelBackCover_Responsive,
    // Responsive Excel Layouts - Phase 2
    ExcelBottomCover_Responsive,
    ExcelLeftCover_Responsive,
    ExcelIndex_Responsive,
    ExcelTableOfContents_Responsive,
    // Responsive Excel Layouts - Phase 3
    ExcelFullWidthChart_Responsive,
    ExcelFullWidthChartCategorical_Responsive,
    ExcelFullWidthChartWithTable_Responsive,
    ExcelComparisonLayout_Responsive,
    // Responsive Excel Layouts - Phase 4
    ExcelExperienceDrivenTwoRows_Responsive,
    ExcelExperienceFullText_Responsive,
    ExcelHowItWorks_Responsive,
    ExcelFoundationAI_Responsive,
    // Responsive Excel Layouts - Phase 5
    ExcelMilestone_Responsive,
    ExcelResultsTestimonial_Responsive,
    ExcelBackCoverLeft_Responsive,
    // Legacy component fallbacks (render as empty divs to prevent errors)
    SectionSpace: () => <div className="h-4" />
  };
  
  // Debug - comprehensive component validation
  console.log('🔷 Components available:', Object.keys(componentMap));
  
  // 🔧 CRITICAL FIX: Validate all components in the map
  Object.entries(componentMap).forEach(([name, component]) => {
    if (!component || (typeof component !== 'function' && (typeof component !== 'object' || !(component as any).$$typeof))) {
      console.error('❌ INVALID COMPONENT DETECTED:', name, 'Value:', component, 'Type:', typeof component);
      // Replace invalid components with a safe fallback
      componentMap[name] = () => <div className="p-4 bg-red-100 text-red-800">Error: Component "{name}" failed to load</div>;
    } else {
      console.log('✅ Valid component:', name, typeof component);
    }
  });

  // Function to handle roadmap data changes
  const handleRoadmapDataChange = useCallback((blockIndex: number, newRoadmapData: any) => {
    console.log('🔄 Roadmap data changed:', { blockIndex, newRoadmapData });
    
    // Update the presentation data with the new roadmap data
    setPresentationMessages(prev => {
      const currentMessages = prev[currentPresentationId] || [];
      const lastAssistantMessage = [...currentMessages].reverse().find(
        msg => msg.role === 'assistant' && msg.presentationData && !msg.isLoading
      );
      
      if (lastAssistantMessage && lastAssistantMessage.presentationData) {
        const updatedPresentationData = {
          ...lastAssistantMessage.presentationData,
          slides: lastAssistantMessage.presentationData.slides.map((slide: any, slideIndex: number) => {
            if (slideIndex === activeSlide) {
              return {
                ...slide,
                blocks: slide.blocks.map((block: any, bIndex: number) => {
                  if (bIndex === blockIndex && block.type === 'Roadmap_Timeline') {
                    return {
                      ...block,
                      props: {
                        ...block.props,
                        roadmapData: newRoadmapData
                      }
                    };
                  }
                  return block;
                })
              };
            }
            return slide;
          })
        };
        
        // Update the message with the new presentation data
        const updatedMessages = currentMessages.map(msg => 
          msg === lastAssistantMessage ? {
            ...msg,
            presentationData: updatedPresentationData
          } : msg
        );
        
        return {
          ...prev,
          [currentPresentationId]: updatedMessages
        };
      }
      
      return prev;
    });
  }, [currentPresentationId, activeSlide, setPresentationMessages]);

  // 🔧 UNIVERSAL CANVAS EDIT HANDLER - Handles all canvas editing with database persistence
  const handleCanvasEdit = useCallback((blockIndex: number, updates: any) => {
    console.log('🎨 Canvas edit detected:', { blockIndex, updates, activeSlide, presentationId: currentPresentationId });
    
    // Update the presentation data with the canvas edits
    setPresentationMessages(prev => {
      const currentMessages = prev[currentPresentationId] || [];
      const lastAssistantMessage = [...currentMessages].reverse().find(
        msg => msg.role === 'assistant' && msg.presentationData && !msg.isLoading
      );
      
      if (lastAssistantMessage && lastAssistantMessage.presentationData) {
        const updatedPresentationData = {
          ...lastAssistantMessage.presentationData,
          slides: lastAssistantMessage.presentationData.slides.map((slide: any, slideIndex: number) => {
            if (slideIndex === activeSlide) {
              return {
                ...slide,
                blocks: slide.blocks.map((block: any, bIndex: number) => {
                  if (bIndex === blockIndex) {
                    return {
                      ...block,
                      props: {
                        ...block.props,
                        ...updates
                      }
                    };
                  }
                  return block;
                })
              };
            }
            return slide;
          })
        };
        
        console.log('🎨 Updated presentation data:', updatedPresentationData);
        
        // Update the message with new presentation data
        const updatedMessages = currentMessages.map(msg => 
          msg === lastAssistantMessage ? {
            ...msg,
            presentationData: updatedPresentationData
          } : msg
        );
        
        // 🔧 LET AUTOSAVE HANDLE DATABASE SAVE
        console.log('💾 Canvas edit updated in state - autosave will handle database save');
        
        return {
          ...prev,
          [currentPresentationId]: updatedMessages
        };
      }
      
      return prev;
    });
  }, [currentPresentationId, activeSlide, currentWorkspace]);

  // Function to render a single block
  const renderBlock = (block: any, index: number, isPresentationMode = false) => {
    console.log(`🔷 Rendering block ${index}: ${block.type}`);
    
    const Component = componentMap[block.type];
    console.log(`🔍 Component for ${block.type}:`, Component, typeof Component);
    
    if (!Component) {
      console.warn(`❌ Unknown component type: ${block.type}`);
      return <div key={index} className="p-4 bg-yellow-100 text-yellow-800">Unknown component: "{block.type}"</div>;
    }
    
    // 🔧 DOUBLE CHECK: Ensure component is valid
    if (typeof Component !== 'function' && (!Component || typeof Component !== 'object' || !(Component as any).$$typeof)) {
      console.error('❌ INVALID COMPONENT:', block.type, 'Component:', Component);
      return <div key={index} className="p-4 bg-red-100 text-red-800">Invalid component: "{block.type}"</div>;
    }

    // Handle layout components with children
    if (['SingleColumnLayout', 'TwoColumnLayout', 'SplitLayout', 'ImageLeftLayout', 'ImageRightLayout'].includes(block.type)) {
      const props = { ...block.props };
      
      // Render children arrays for layout components
      if (props.children && Array.isArray(props.children)) {
        props.children = props.children.map((child: any, childIndex: number) => 
          renderBlock(child, childIndex)
        );
      }
      if (props.leftChildren && Array.isArray(props.leftChildren)) {
        props.leftChildren = props.leftChildren.map((child: any, childIndex: number) => 
          renderBlock(child, childIndex)
        );
      }
      if (props.rightChildren && Array.isArray(props.rightChildren)) {
        props.rightChildren = props.rightChildren.map((child: any, childIndex: number) => 
          renderBlock(child, childIndex)
        );
      }
      if (props.imageChildren && Array.isArray(props.imageChildren)) {
        props.imageChildren = props.imageChildren.map((child: any, childIndex: number) => 
          renderBlock(child, childIndex)
        );
      }
      if (props.contentChildren && Array.isArray(props.contentChildren)) {
        props.contentChildren = props.contentChildren.map((child: any, childIndex: number) => 
          renderBlock(child, childIndex)
        );
      }

      return React.createElement(Component, { key: index, ...props });
    }

    const propsToPass = block.props || {};
    
    // Add fixed dimensions for consistent canvas sizing
    propsToPass.useFixedDimensions = true;
    propsToPass.canvasWidth = 881;
    propsToPass.canvasHeight = 495;
    
    // 🔧 DISABLE ANIMATIONS IN EXPORT MODE FOR PROPER PDF RENDERING
    if (isExportMode) {
      // For layouts with chart prop
      if (propsToPass.chart) {
        propsToPass.chart = {
          ...propsToPass.chart,
          animate: false
        };
      }
      // For layouts with chartData prop
      if (propsToPass.chartData) {
        propsToPass.chartData = {
          ...propsToPass.chartData,
          animate: false
        };
      }
      // For layouts with multiple charts
      if (propsToPass.charts && Array.isArray(propsToPass.charts)) {
        propsToPass.charts = propsToPass.charts.map((chart: any) => ({
          ...chart,
          animate: false
        }));
      }
    }
    
    // Add language parameter for layout components that support it
    const languageAwareComponents = [
      'Metrics_FinancialsSplit', 
      'Impact_KPIOverview'
    ];
    
    if (languageAwareComponents.includes(block.type)) {
      // Detect language from the last user message
      const lastUserMessage = [...messages].reverse().find(msg => msg.role === 'user');
      if (lastUserMessage) {
        const userLanguage = detectLanguage(lastUserMessage.text);
        propsToPass.language = userLanguage;
      }
    }
    
    // Add onDataChange callback for Roadmap_Timeline components
    if (block.type === 'Roadmap_Timeline') {
      propsToPass.onDataChange = (newRoadmapData: any) => handleRoadmapDataChange(index, newRoadmapData);
    }
    
    // 🔧 ADD CANVAS EDITING SUPPORT - Add onUpdate callback for canvas-enabled components
    const canvasEnabledComponents = [
      'Cover_LeftImageTextRight',
      'Cover_TextCenter', 
      'Cover_LeftTitleRightBodyUnderlined', // Now mapped to Cover_TextCenter
      'Cover_ProductLayout',
      'BackCover_ThankYou',
      'BackCover_ThankYouWithImage',
      'Index_LeftAgendaRightImage',
      'Index_LeftAgendaRightText',
      'Quote_MissionStatement',
      'Quote_LeftTextRightImage',
      'Impact_KPIOverview', // ✅ FIXED: Added prop-state synchronization for secondary texts
      'Impact_SustainabilityMetrics',
      'Impact_ImageMetrics', // ✅ FIXED: Added prop-state synchronization for secondary texts
      'Team_AdaptiveGrid', // ✅ FIXED: Added missing prop-state synchronization for title/description
      'Team_MemberProfile',
      'Metrics_FinancialsSplit',
      'Metrics_FullWidthChart',
      'Lists_LeftTextRightImage',
      'Lists_GridLayout',
      'Lists_LeftTextRightImageDescription',
      'Lists_CardsLayout',
      'Lists_CardsLayoutRight',
      'Lists_CardsLayoutSide',
      'Lists_CardsLayoutVertical',
      'Market_SizeAnalysis',
      'Roadmap_Timeline',
      'Competition_Analysis',
      'Product_iPhoneStandalone',
      'Product_MacBookCentered',
      'Product_iPhoneInCenter',
      'Product_PhysicalProduct',
      'McBook_Feature',
      'iPhone_HandFeature',
      'iPhone_StandaloneFeature',
      'Pricing_Plans', // ✅ FIXED: Added prop-state synchronization for secondary texts
      'Content_TextImageDescription'
      // 🚨 REMOVED DUPLICATES: Impact_ImageMetrics, Impact_KPIOverview, Team_AdaptiveGrid already commented out above
    ];
    
    if (canvasEnabledComponents.includes(block.type)) {
      propsToPass.onUpdate = (updates: any) => {
        console.log('🎨 Canvas edit from component:', block.type, updates);
        handleCanvasEdit(index, updates);
      };
      
      // 🔧 PASS SAVED TRANSFORM DATA - Extract transform data from block props and pass as specific props
      if (block.props) {
        if (block.props.titleTransform) {
          propsToPass.titleTransform = block.props.titleTransform;
        }
        if (block.props.paragraphTransform) {
          propsToPass.paragraphTransform = block.props.paragraphTransform;
        }
        if (block.props.logoTransform) {
          propsToPass.logoTransform = block.props.logoTransform;
        }
        
        // 🔧 PASS SAVED FONT STYLING DATA
        if (block.props.titleFontSize) {
          propsToPass.titleFontSize = block.props.titleFontSize;
        }
        if (block.props.titleFontFamily) {
          propsToPass.titleFontFamily = block.props.titleFontFamily;
        }
        if (block.props.titleAlignment) {
          propsToPass.titleAlignment = block.props.titleAlignment;
        }
        if (block.props.paragraphFontSize) {
          propsToPass.paragraphFontSize = block.props.paragraphFontSize;
        }
        if (block.props.paragraphFontFamily) {
          propsToPass.paragraphFontFamily = block.props.paragraphFontFamily;
        }
        if (block.props.paragraphAlignment) {
          propsToPass.paragraphAlignment = block.props.paragraphAlignment;
        }
        if (block.props.titleColor) {
          propsToPass.titleColor = block.props.titleColor;
        }
        if (block.props.paragraphColor) {
          propsToPass.paragraphColor = block.props.paragraphColor;
        }
        
        // 🔧 PASS DESCRIPTION STYLING DATA (for Lists layouts)
        if (block.props.descriptionFontSize) {
          propsToPass.descriptionFontSize = block.props.descriptionFontSize;
        }
        if (block.props.descriptionFontFamily) {
          propsToPass.descriptionFontFamily = block.props.descriptionFontFamily;
        }
        if (block.props.descriptionAlignment) {
          propsToPass.descriptionAlignment = block.props.descriptionAlignment;
        }
        if (block.props.descriptionColor) {
          propsToPass.descriptionColor = block.props.descriptionColor;
        }
        
        // 🔧 PASS CONTACT STYLING DATA (for BackCover layouts)
        if (block.props.contactFontSize) {
          propsToPass.contactFontSize = block.props.contactFontSize;
        }
        if (block.props.contactFontFamily) {
          propsToPass.contactFontFamily = block.props.contactFontFamily;
        }
        if (block.props.contactAlignment) {
          propsToPass.contactAlignment = block.props.contactAlignment;
        }
        if (block.props.contactColor) {
          propsToPass.contactColor = block.props.contactColor;
        }
        
        // 🔧 PASS FLAT CONTACT PROPERTIES (for BackCover layouts)
        if (block.props.contactEmail !== undefined) {
          propsToPass.contact = { 
            ...propsToPass.contact, 
            email: block.props.contactEmail 
          };
        }
        if (block.props.contactSocial !== undefined) {
          propsToPass.contact = { 
            ...propsToPass.contact, 
            social: block.props.contactSocial 
          };
        }
        if (block.props.contactPhone !== undefined) {
          propsToPass.contact = { 
            ...propsToPass.contact, 
            phone: block.props.contactPhone 
          };
        }
        if (block.props.contactPhone2 !== undefined) {
          propsToPass.contact = { 
            ...propsToPass.contact, 
            phone2: block.props.contactPhone2 
          };
        }
        if (block.props.contactCity !== undefined || block.props.contactCountry !== undefined) {
          propsToPass.contact = { 
            ...propsToPass.contact, 
            location: {
              ...propsToPass.contact?.location,
              city: block.props.contactCity,
              country: block.props.contactCountry
            }
          };
        }
        if (block.props.contactWebsite !== undefined) {
          propsToPass.contact = { 
            ...propsToPass.contact, 
            website: block.props.contactWebsite 
          };
        }
        if (block.props.bulletPointStyles) {
          propsToPass.bulletPointStyles = block.props.bulletPointStyles;
        }
        if (block.props.memberTextStyles) {
          propsToPass.memberTextStyles = block.props.memberTextStyles;
        }
        
        // 🔧 PASS KPI STYLING ARRAYS FOR IMPACT KPI OVERVIEW
        if (block.props.kpiTitleFontSizes) {
          propsToPass.kpiTitleFontSizes = block.props.kpiTitleFontSizes;
        }
        if (block.props.kpiTitleFontFamilies) {
          propsToPass.kpiTitleFontFamilies = block.props.kpiTitleFontFamilies;
        }
        if (block.props.kpiTitleColors) {
          propsToPass.kpiTitleColors = block.props.kpiTitleColors;
        }
        if (block.props.kpiTitleAlignments) {
          propsToPass.kpiTitleAlignments = block.props.kpiTitleAlignments;
        }
        if (block.props.kpiValueFontSizes) {
          propsToPass.kpiValueFontSizes = block.props.kpiValueFontSizes;
        }
        if (block.props.kpiValueFontFamilies) {
          propsToPass.kpiValueFontFamilies = block.props.kpiValueFontFamilies;
        }
        if (block.props.kpiValueColors) {
          propsToPass.kpiValueColors = block.props.kpiValueColors;
        }
        if (block.props.kpiValueAlignments) {
          propsToPass.kpiValueAlignments = block.props.kpiValueAlignments;
        }
        if (block.props.kpiSubtitleFontSizes) {
          propsToPass.kpiSubtitleFontSizes = block.props.kpiSubtitleFontSizes;
        }
        if (block.props.kpiSubtitleFontFamilies) {
          propsToPass.kpiSubtitleFontFamilies = block.props.kpiSubtitleFontFamilies;
        }
        if (block.props.kpiSubtitleColors) {
          propsToPass.kpiSubtitleColors = block.props.kpiSubtitleColors;
        }
        if (block.props.kpiSubtitleAlignments) {
          propsToPass.kpiSubtitleAlignments = block.props.kpiSubtitleAlignments;
        }
        
        // 🔧 PASS IMPACT STYLING ARRAYS FOR IMPACT IMAGE METRICS
        if (block.props.impactValueFontSizes) {
          propsToPass.impactValueFontSizes = block.props.impactValueFontSizes;
        }
        if (block.props.impactValueFontFamilies) {
          propsToPass.impactValueFontFamilies = block.props.impactValueFontFamilies;
        }
        if (block.props.impactValueColors) {
          propsToPass.impactValueColors = block.props.impactValueColors;
        }
        if (block.props.impactValueAlignments) {
          propsToPass.impactValueAlignments = block.props.impactValueAlignments;
        }
        if (block.props.impactLabelFontSizes) {
          propsToPass.impactLabelFontSizes = block.props.impactLabelFontSizes;
        }
        if (block.props.impactLabelFontFamilies) {
          propsToPass.impactLabelFontFamilies = block.props.impactLabelFontFamilies;
        }
        if (block.props.impactLabelColors) {
          propsToPass.impactLabelColors = block.props.impactLabelColors;
        }
        if (block.props.impactLabelAlignments) {
          propsToPass.impactLabelAlignments = block.props.impactLabelAlignments;
        }
        
        // 🔧 PASS MARKET SIZE ANALYSIS SPECIFICATION TEXT STYLING DATA
        if (block.props.specDescriptionFontSize) {
          propsToPass.specDescriptionFontSize = block.props.specDescriptionFontSize;
        }
        if (block.props.specDescriptionFontFamily) {
          propsToPass.specDescriptionFontFamily = block.props.specDescriptionFontFamily;
        }
        if (block.props.specDescriptionColor) {
          propsToPass.specDescriptionColor = block.props.specDescriptionColor;
        }
        if (block.props.specDescriptionAlignment) {
          propsToPass.specDescriptionAlignment = block.props.specDescriptionAlignment;
        }
        if (block.props.specValueFontSize) {
          propsToPass.specValueFontSize = block.props.specValueFontSize;
        }
        if (block.props.specValueFontFamily) {
          propsToPass.specValueFontFamily = block.props.specValueFontFamily;
        }
        if (block.props.specValueColor) {
          propsToPass.specValueColor = block.props.specValueColor;
        }
        if (block.props.specValueAlignment) {
          propsToPass.specValueAlignment = block.props.specValueAlignment;
        }
        
        // 🔧 PASS SPEC LABEL STYLING DATA FOR MARKET SIZE ANALYSIS
        if (block.props.specLabelFontFamily) {
          propsToPass.specLabelFontFamily = block.props.specLabelFontFamily;
        }
        if (block.props.specLabelColor) {
          propsToPass.specLabelColor = block.props.specLabelColor;
        }
        if (block.props.specLabelAlignment) {
          propsToPass.specLabelAlignment = block.props.specLabelAlignment;
        }
        
        // 🔧 PASS TAM/SAM/SOM STYLING DATA FOR MARKET SIZE ANALYSIS
        if (block.props.tamLabelFontSize) {
          propsToPass.tamLabelFontSize = block.props.tamLabelFontSize;
        }
        if (block.props.tamLabelFontFamily) {
          propsToPass.tamLabelFontFamily = block.props.tamLabelFontFamily;
        }
        if (block.props.tamLabelColor) {
          propsToPass.tamLabelColor = block.props.tamLabelColor;
        }
        if (block.props.tamLabelAlignment) {
          propsToPass.tamLabelAlignment = block.props.tamLabelAlignment;
        }
        if (block.props.tamValueFontSize) {
          propsToPass.tamValueFontSize = block.props.tamValueFontSize;
        }
        if (block.props.tamValueFontFamily) {
          propsToPass.tamValueFontFamily = block.props.tamValueFontFamily;
        }
        if (block.props.tamValueColor) {
          propsToPass.tamValueColor = block.props.tamValueColor;
        }
        if (block.props.tamValueAlignment) {
          propsToPass.tamValueAlignment = block.props.tamValueAlignment;
        }
        
        if (block.props.samLabelFontSize) {
          propsToPass.samLabelFontSize = block.props.samLabelFontSize;
        }
        if (block.props.samLabelFontFamily) {
          propsToPass.samLabelFontFamily = block.props.samLabelFontFamily;
        }
        if (block.props.samLabelColor) {
          propsToPass.samLabelColor = block.props.samLabelColor;
        }
        if (block.props.samLabelAlignment) {
          propsToPass.samLabelAlignment = block.props.samLabelAlignment;
        }
        if (block.props.samValueFontSize) {
          propsToPass.samValueFontSize = block.props.samValueFontSize;
        }
        if (block.props.samValueFontFamily) {
          propsToPass.samValueFontFamily = block.props.samValueFontFamily;
        }
        if (block.props.samValueColor) {
          propsToPass.samValueColor = block.props.samValueColor;
        }
        if (block.props.samValueAlignment) {
          propsToPass.samValueAlignment = block.props.samValueAlignment;
        }
        
        if (block.props.somLabelFontSize) {
          propsToPass.somLabelFontSize = block.props.somLabelFontSize;
        }
        if (block.props.somLabelFontFamily) {
          propsToPass.somLabelFontFamily = block.props.somLabelFontFamily;
        }
        if (block.props.somLabelColor) {
          propsToPass.somLabelColor = block.props.somLabelColor;
        }
        if (block.props.somLabelAlignment) {
          propsToPass.somLabelAlignment = block.props.somLabelAlignment;
        }
        if (block.props.somValueFontSize) {
          propsToPass.somValueFontSize = block.props.somValueFontSize;
        }
        if (block.props.somValueFontFamily) {
          propsToPass.somValueFontFamily = block.props.somValueFontFamily;
        }
        if (block.props.somValueColor) {
          propsToPass.somValueColor = block.props.somValueColor;
        }
        if (block.props.somValueAlignment) {
          propsToPass.somValueAlignment = block.props.somValueAlignment;
        }
      }
      
    }
    
    return React.createElement(Component, { key: index, ...propsToPass });
  };

  // Function to render slide content
  const renderSlideContent = (slideIndex?: number, isPresentationMode = false) => {
    // TEST: Disabled - show real presentation data
    const testBlueGradient = false; // DISABLED: Show real Claude-generated presentations
    
    // In export mode, use the slide data from URL parameters
    if (isExportMode && exportSlideData) {
      console.log('📄 Export mode: Rendering slide from URL data');
      const currentSlide = exportSlideData;
      
      if (!currentSlide) {
        return (
          <div className="w-full h-full bg-white flex items-center justify-center text-gray-400">
            <p>Export slide not found</p>
          </div>
        );
      }

      console.log('🎬 Export mode - All slide blocks:', currentSlide.blocks);
      
      return (
        <div className="w-full h-full relative">
          {/* Content container: no padding to match layout preview page */}
          <div className="w-full h-full relative z-10">
            {/* Render all blocks - simplified for clean slate approach */}
            {currentSlide.blocks.map((block: any, index: number) => (
              <div key={`${currentSlide.id}-${index}-${currentSlide._lastModified || Date.now()}`}>
                {renderBlock(block, index, isPresentationMode)}
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    // Get the latest generated presentation from the most recent assistant message
    const currentMessages = messages;
    const lastAssistantMessage = [...currentMessages].reverse().find(
      msg => msg.role === 'assistant' && msg.presentationData && !msg.isLoading
    );

    const presentationData = lastAssistantMessage?.presentationData;
    // Use memoized slides to prevent unnecessary re-renders
    const slideIndexToUse = slideIndex !== undefined ? slideIndex : activeSlide;
    const currentSlide = memoizedSlides?.[slideIndexToUse] || presentationData?.slides?.[slideIndexToUse];
    
    console.log('🎬 Rendering slide:', {
      slideIndex: slideIndexToUse,
      totalSlides: presentationData?.slides?.length,
      currentSlide: currentSlide,
      blockCount: currentSlide?.blocks?.length
    });

    // Handle all error cases with a single return path to avoid hook inconsistencies
    if (testBlueGradient) {
      console.log('🧪 TEST MODE: Static purple gradient');
      return (
        <div className="w-full h-full relative bg-white flex items-center justify-center">
          <div className="text-gray-400 text-center">
            <h1 className="text-2xl font-bold mb-4">🧪 Test Mode Disabled</h1>
            <p>Showing real presentation data</p>
          </div>
        </div>
      );
    }

    if (!presentationData) {
      return (
        <div className="w-full h-full bg-white flex flex-col items-center justify-center text-gray-400">
          <p className="text-sm text-center">Use the chat input below to generate your presentation with Slaid</p>
        </div>
      );
    }

    if (!currentSlide) {
      return (
        <div className="w-full h-full bg-white flex items-center justify-center text-gray-400">
          <p>Slide not found</p>
        </div>
      );
    }



    console.log('🎬 All slide blocks:', currentSlide.blocks);
    
    // Decide canvas padding based on slide content (edge-to-edge layouts remove it)
    const shouldRemoveCanvasPadding = Array.isArray(currentSlide.blocks) && currentSlide.blocks.some((b: any) => {
      try {
        if (!b || !b.type) return false;
        const props = b.props || {};
        if (b.type === 'Cover_LeftImageTextRight') {
          // Keep the margin between columns even in edge-to-edge; only remove outer canvas padding
          return props.imageEdgeToEdge === true;
        }
        return false;
      } catch {
        return false;
      }
    });

    return (
      <div className="w-full h-full relative">
        {/* Content container: no padding to match layout preview page */}
        <div className="w-full h-full relative z-10">
          {/* Render all blocks - simplified for clean slate approach */}
          {(currentSlide.blocks || []).map((block: any, index: number) => (
            <div key={`${currentSlide.id}-${index}-${currentSlide._lastModified || Date.now()}`}>
              {renderBlock(block, index, isPresentationMode)}
            </div>
          ))}
        </div>
      </div>
    );
  };

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  }, [chatInput]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);


  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (
        helpDropdownRef.current &&
        !helpDropdownRef.current.contains(event.target as Node) &&
        helpButtonRef.current &&
        !helpButtonRef.current.contains(event.target as Node)
      ) {
        setShowHelpDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (showTitleMenu && titleMenuRef.current && !titleMenuRef.current.contains(event.target as Node)) {
        setShowTitleMenu(false);
      }
    }
    if (showTitleMenu) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showTitleMenu]);

  // Get all workspace names dynamically
  const workspaceNames = workspaces.map(ws => ws.name);

  // Modal component
  function CreditsModal() {
    if (!showCreditsModal) return null;
    
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn modal-overlay"
        onClick={() => {
          setShowCreditsModal(false);
          refreshCredits();
        }}
      >
        {/* Overlay with fade-in */}
        <div className="absolute inset-0 bg-black/60" />
        {/* Modal with fade and scale transition */}
        <div 
          className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 border border-[#23272f] animate-scaleIn modal-content"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 text-xl font-bold focus:outline-none"
            onClick={() => {
              setShowCreditsModal(false);
              refreshCredits(); // Refresh credits when modal closes
            }}
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="5.5" y1="5.5" x2="14.5" y2="14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="14.5" y1="5.5" x2="5.5" y2="14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
          <h2 className="text-gray-900 text-lg font-semibold mb-1">Presentation Credits</h2>
          <p className="text-gray-600 text-sm mb-4">Credits are the currency you use to generate slides, content, and AI-powered features in your presentations.</p>
          <hr className="border-[#23272f] mb-4" />
          <div className="text-xs text-gray-500 mb-2">Your credits</div>
          <div className="flex items-center gap-2 mb-6">
            <img src="/ai credit-icon.png" alt="Credit Icon" className="w-8 h-8 object-contain" />
            {creditsLoading ? (
              <span className="text-gray-500 text-base font-semibold">Loading...</span>
            ) : creditsError ? (
              <span className="text-red-400 text-base font-semibold">Error loading credits</span>
            ) : (
              <>
                <span className="text-gray-900 text-base font-semibold">
                  {credits?.remaining_credits?.toLocaleString() || '0'}
                </span>
            <span className="text-gray-500 text-base ml-1">remaining</span>
              </>
            )}
          </div>
          <button className="w-full border border-[#23272f] text-gray-900 font-medium rounded-lg py-2 mb-3 text-base bg-transparent hover:bg-gray-50 hover:scale-105 transition duration-200 ease-in-out" onClick={() => { 
            setShowCreditsModal(false); 
            setShowCreditPacksModal(true); 
            refreshCredits(); // Refresh credits when switching modals
          }}>Purchase credit packs</button>
          <button className="w-full bg-[#002903] text-white font-semibold rounded-lg py-2 text-base shadow-md hover:opacity-90 hover:scale-110 transition duration-200 ease-in-out" onClick={() => setShowPricingModal(true)}>Upgrade plan</button>
        </div>
      </div>
    );
  }

  function CreditPacksModal() {
    if (!showCreditPacksModal) return null;
    const packs = [
      { credits: 200, price: "$10", productId: "9acd1a25-9f4b-48fb-861d-6ca663b89fa1" },
      { credits: 400, price: "$20", productId: "ffe50868-199d-4476-b948-ab67c3894522" },
      { credits: 1000, price: "$50", productId: "c098b439-a2c3-493d-b0a6-a7d849c0de4d" },
      { credits: 2000, price: "$100", productId: "92d6ad27-31d8-4a6d-989a-98da344ad7eb" },
    ];

    const handleCreditPurchase = async (pack: { credits: number; price: string; productId: string }) => {
      try {
        console.log('🛒 Starting credit purchase for:', pack.credits, 'credits');
        
        // Get Polar configuration
        const polarConfig = {
          publicAccessToken: process.env.NEXT_PUBLIC_POLAR_SH_PUBLIC_ACCESS_TOKEN,
          successUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/success`,
          cancelUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/editor`,
        };

        if (!polarConfig.publicAccessToken || !pack.productId) {
          alert('Payment system is being configured. Please try again later.');
          return;
        }

        // Create a checkout session using Polar API
        const response = await fetch('https://api.polar.sh/v1/checkouts/', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${polarConfig.publicAccessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            product_id: pack.productId,
            success_url: polarConfig.successUrl,
            cancel_url: polarConfig.cancelUrl,
          }),
        });

        if (response.ok) {
          const checkout = await response.json();
          console.log('✅ Credit checkout created, redirecting to:', checkout.url);
          window.open(checkout.url, '_blank');
        } else {
          console.error('Failed to create checkout session:', response.statusText);
          alert('Failed to start checkout. Please try again.');
        }
      } catch (error) {
        console.error('Error creating credit checkout:', error);
        alert('Failed to start checkout. Please try again.');
      }
    };
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn modal-overlay"
        onClick={() => setShowCreditPacksModal(false)}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div 
          className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 border border-[#23272f] animate-scaleIn modal-content"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 text-xl font-bold focus:outline-none"
            onClick={() => setShowCreditPacksModal(false)}
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="5.5" y1="5.5" x2="14.5" y2="14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="14.5" y1="5.5" x2="5.5" y2="14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
          <h2 className="text-gray-900 text-lg font-semibold mb-1">Purchase credit packs to create more with Slaid</h2>
          <p className="text-gray-600 text-sm mb-4">Upgrading to a higher tier plan will offer more value for the money</p>
          <div className="mb-4 flex flex-col gap-2">
            {packs.map((pack, i) => (
              <button
                key={pack.credits}
                className="flex items-center justify-between py-3 px-3 rounded-lg transition-all duration-150 group hover:bg-gray-50 focus:bg-gray-50 outline-none"
                type="button"
                onClick={() => handleCreditPurchase(pack)}
              >
                <span className="flex items-center gap-2">
                  <img src="/ai credit-icon.png" alt="Credit Icon" className="w-6 h-6 object-contain" />
                  <span className="text-gray-600 text-base font-semibold group-hover:text-gray-900">{pack.credits.toLocaleString()}</span>
                </span>
                <span className="text-gray-600 text-base font-medium group-hover:text-gray-900">{pack.price}</span>
              </button>
            ))}
          </div>
          <button className="w-full border border-[#23272f] text-gray-900 font-medium rounded-lg py-2 text-base bg-transparent hover:bg-gray-50 hover:scale-105 transition duration-200 ease-in-out mb-3" onClick={() => setShowCreditPacksModal(false)}>Cancel</button>
          <button className="w-full bg-[#002903] text-white font-semibold rounded-lg py-2 text-base shadow-md hover:opacity-90 hover:scale-110 transition duration-200 ease-in-out" onClick={() => setShowPricingModal(true)}>Upgrade plan</button>
        </div>
      </div>
    );
  }

  function PricingModal() {
    if (!showPricingModal) return null;
    const [isAnnualBasic, setIsAnnualBasic] = useState(false);
    const [isAnnualPro, setIsAnnualPro] = useState(false);
    const [isAnnualUltra, setIsAnnualUltra] = useState(false);
    
    const CHECK_ICON = (
      <svg width="14" height="14" fill="none" viewBox="0 0 14 14"><path d="M4.5 7.5l2 2 3-3" stroke="#002903" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/></svg>
    );
    const CROSS_ICON = (
      <span className="text-gray-500 text-[12.3px]">×</span>
    );

    const plans = [
      {
        name: "Basic",
        monthly: { price: "$29", period: "/month", save: null, buttonColor: "bg-[#002903] text-white hover:bg-[#001a02]", toggleColor: "#002903", credits: "700 credits" },
        annual: { price: "$261", period: "/year", save: "Save $87 per year", buttonColor: "bg-[#002903] text-white hover:bg-[#001a02]", toggleColor: "#002903", credits: "8,400 credits" },
        desc: ["Perfect for getting started."],
        icon: "/basic-plan.png",
        baseFeatures: [
          { text: "Unlimited presentations", included: true },
          { text: "Slide preview before generating", included: true },
          { text: "Export as PDF", included: true },
        ],
      },
      {
        name: "Pro",
        monthly: { price: "$49", period: "/month", save: null, buttonColor: "bg-[#1C0059] text-white hover:bg-[#150044]", toggleColor: "#1C0059", credits: "1500 credits" },
        annual: { price: "$441", period: "/year", save: "Save $147 per year", buttonColor: "bg-[#1C0059] text-white hover:bg-[#150044]", toggleColor: "#1C0059", credits: "18,000 credits" },
        desc: ["Designed for professionals."],
        icon: "/pro-plan.png",
        baseFeatures: [
          { text: "Unlimited presentations", included: true },
          { text: "Slide preview before generating", included: true },
          { text: "Export as PDF", included: true },
        ],
      },
      {
        name: "Ultra",
        monthly: { price: "$89", period: "/month", save: null, buttonColor: "bg-[#441100] text-white hover:bg-[#330d00]", toggleColor: "#441100", credits: "3000 credits" },
        annual: { price: "$801", period: "/year", save: "Save $267 per year", buttonColor: "bg-[#441100] text-white hover:bg-[#330d00]", toggleColor: "#441100", credits: "36,000 credits" },
        desc: ["For teams and power users."],
        icon: "/ultra-red-plan.png",
        baseFeatures: [
          { text: "Unlimited presentations", included: true },
          { text: "Slide preview before generating", included: true },
          { text: "Export as PDF", included: true },
          { text: "Priority support", included: true },
        ],
      },
    ];

    function PlanCard({ plan, isAnnual = false, onToggle = () => {} }: { plan: any; isAnnual?: boolean; onToggle?: () => void }) {
      const priceData = isAnnual ? plan.annual : plan.monthly;
      
      // Get the appropriate Polar product ID based on plan name and billing cycle
      const productId = getProductId(plan.name, isAnnual);
      
      // Get toggle colors: light grey when monthly (unchecked), plan color when annual (checked)
      const toggleBgColor = isAnnual ? priceData.toggleColor : '#9CA3AF';
      
      return (
        <div key={plan.name} className={`relative bg-gray-100 flex flex-col pt-[21px] pb-[35px] px-[21px] w-full max-w-[250px] min-w-[220px] mx-auto`}>
          {/* Header: icon left, toggle right */}
          <div className="flex flex-row items-center justify-between mb-3">
            <div className="w-[42px] h-[42px] flex items-center justify-center relative">
              <img src={plan.icon} alt={`${plan.name} Plan Icon`} className="w-[42px] h-[42px] object-contain" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600 text-[13px]">Monthly</span>
              <label className="relative inline-block w-10 align-middle select-none cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={isAnnual} onChange={onToggle} />
                <span 
                  className="block w-10 h-5 rounded-full shadow-inner transition" 
                  style={{ backgroundColor: toggleBgColor }}
                />
                <span className="dot absolute top-1 left-1 bg-white w-3 h-3 rounded-full transition peer-checked:left-6" />
              </label>
              <span className="text-gray-600 text-[13px]">Annual</span>
            </div>
          </div>
          {/* Card content with fixed min-height for alignment */}
          <div className="flex flex-col flex-1 min-h-[220px]">
            {/* Plan name */}
            <div className="mb-1">
              <p className="text-gray-900 text-[13.45px] leading-[21px] font-normal">{plan.name}</p>
            </div>
            {/* Price */}
            <div className="mb-1 flex items-end gap-2">
              <p className="text-gray-900 text-[28px] leading-[36px] font-normal">{priceData.price}</p>
              <span className="text-gray-600 text-[16px] font-normal">{priceData.period}</span>
            </div>
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
              <p className="text-gray-600 text-[11.34px] leading-[17.5px] font-normal">Including</p>
            </div>
            {/* Feature list */}
            <div className="flex flex-col gap-[9.5px] mb-8">
              {/* Credits - dynamic based on monthly/annual */}
              <div className="flex flex-row items-center gap-[10.5px]">
                <span className="flex items-center justify-center w-3.5 h-3.5">
                  {CHECK_ICON}
                </span>
                <span className="text-gray-900 text-[11.15px] leading-[17.5px] font-normal">{priceData.credits}</span>
              </div>
              {/* Base features */}
              {plan.baseFeatures.map((f: any, i: number) => (
                <div key={i} className="flex flex-row items-center gap-[10.5px]">
                  <span className="flex items-center justify-center w-3.5 h-3.5">
                    {f.included ? CHECK_ICON : CROSS_ICON}
                  </span>
                  <span className={f.included ? "text-gray-900 text-[11.15px] leading-[17.5px] font-normal" : "text-gray-500 text-[11.15px] leading-[17.5px] font-normal line-through"}>{f.text}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Button */}
          {plan.name === "Basic" && credits?.plan_type === 'free' ? (
            <button 
              className="w-full h-[40px] rounded-[6.75px] flex items-center justify-center text-[13px] leading-[17.5px] font-normal bg-gray-300 text-gray-700 cursor-not-allowed"
              disabled
            >
              Current plan
            </button>
          ) : plan.name === "Basic" && (credits?.plan_type === 'pro' || credits?.plan_type === 'ultra') ? (
            <button 
              className="w-full h-[40px] rounded-[6.75px] flex items-center justify-center text-[13px] leading-[17.5px] font-normal transition bg-[#002903] text-white hover:bg-[#001a02]"
            >
              Downgrade plan
            </button>
          ) : plan.name === "Pro" && credits?.plan_type === 'pro' ? (
            <button 
              className="w-full h-[40px] rounded-[6.75px] flex items-center justify-center text-[13px] leading-[17.5px] font-normal bg-gray-300 text-gray-700 cursor-not-allowed"
              disabled
            >
              Current plan
            </button>
          ) : plan.name === "Ultra" && credits?.plan_type === 'ultra' ? (
            <button 
              className="w-full h-[40px] rounded-[6.75px] flex items-center justify-center text-[13px] leading-[17.5px] font-normal bg-gray-300 text-gray-700 cursor-not-allowed"
              disabled
            >
              Current plan
            </button>
          ) : productId ? (
            <PolarCheckout
              productId={productId}
              planName={plan.name}
              isAnnual={isAnnual}
              className={priceData.buttonColor}
            />
          ) : (
            <button className={`w-full h-[40px] rounded-[6.75px] flex items-center justify-center text-[13px] leading-[17.5px] font-normal transition ${priceData.buttonColor}`}>
              Get Started
            </button>
          )}
        </div>
      );
    }

    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn modal-overlay"
        onClick={() => setShowPricingModal(false)}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div 
          className="relative bg-white rounded-2xl shadow-xl w-full max-w-5xl p-8 animate-scaleIn modal-content"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 text-xl font-bold focus:outline-none"
            onClick={() => setShowPricingModal(false)}
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="5.5" y1="5.5" x2="14.5" y2="14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="14.5" y1="5.5" x2="5.5" y2="14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
          <div className="text-center mb-8">
            <h1 className="text-gray-900 text-[32px] font-normal leading-[42px] mb-3 tracking-tight">Pricing</h1>
            <p className="text-gray-600 text-[13.5px] leading-[21px] max-w-2xl mx-auto">Choose the plan that perfectly fits your needs. Scale up anytime as you grow.</p>
          </div>
          <div className="flex flex-col md:flex-row gap-0.5 w-full max-w-4xl justify-center mx-auto">
            <PlanCard plan={plans[0]} isAnnual={isAnnualBasic} onToggle={() => setIsAnnualBasic(v => !v)} />
            <PlanCard plan={plans[1]} isAnnual={isAnnualPro} onToggle={() => setIsAnnualPro(v => !v)} />
            <PlanCard plan={plans[2]} isAnnual={isAnnualUltra} onToggle={() => setIsAnnualUltra(v => !v)} />
          </div>
        </div>
      </div>
    );
  }

  // Help Modal
  function HelpModal() {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-fadeIn modal-overlay">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 border border-gray-200 animate-scaleIn modal-content">
          <button
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 text-xl font-bold focus:outline-none"
            onClick={() => setShowHelpModal(false)}
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="5.5" y1="5.5" x2="14.5" y2="14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="14.5" y1="5.5" x2="5.5" y2="14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
          
          <div className="flex flex-col gap-3">
            <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-900 hover:bg-[#002903] transition rounded-lg">
              <svg width="18" height="18" fill="none" viewBox="0 0 20 20" className="text-gray-500">
                <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M10 6v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="10" cy="14" r="1" fill="currentColor"/>
              </svg>
              Get support
            </button>
            
            <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-900 hover:bg-[#002903] transition rounded-lg">
              <svg width="18" height="18" fill="none" viewBox="0 0 20 20" className="text-gray-500">
                <path d="M10 2l2.39 4.84L18 7.27l-3.91 3.81L14.18 16 10 13.27 5.82 16l.91-4.92L2 7.27l5.61-.43L10 2z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              </svg>
              What's new
            </button>
            
            <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-900 hover:bg-[#002903] transition rounded-lg">
              <svg width="18" height="18" fill="none" viewBox="0 0 20 20" className="text-gray-500">
                <path d="M3 8.5a7 7 0 1 1 14 0c0 2.5-2 4.5-7 7-5-2.5-7-4.5-7-7z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <circle cx="10" cy="8.5" r="2" fill="currentColor"/>
              </svg>
              Join slack community
            </button>
          </div>
        </div>
      </div>
    );
  }

  // API Overload Modal (similar to OpenAI's design)
  function ApiOverloadModal() {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-fadeIn modal-overlay">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 mx-4 animate-scaleIn modal-content">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-red-600">
                <path d="M10 6v4M10 14h.01M19 10a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">API Temporarily Overloaded</h2>
          </div>
          
          <div className="mb-6">
            <p className="text-gray-600 text-sm leading-relaxed mb-3">
              The Anthropic API is currently experiencing high demand and is temporarily overloaded. This is not an issue with Slaid.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed">
              Please wait a moment and try again. The service should be available shortly.
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setShowApiOverloadModal(false)}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Dismiss
            </button>
            <button
              onClick={() => {
                setShowApiOverloadModal(false);
                // Optionally trigger a retry here
              }}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-900 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Settings Modal
  function SettingsModal() {
    if (!showSettingsModal) return null;
    
    const { user, signOut } = useAuth();
    const [localDisplayName, setLocalDisplayName] = useState(workspaceDisplayName);
    const [isCancelling, setIsCancelling] = useState(false);
    
    // Update local state when workspaceDisplayName changes
    useEffect(() => {
      setLocalDisplayName(workspaceDisplayName);
    }, [workspaceDisplayName]);

    const handleLogout = async () => {
      try {
        await signOut();
        setShowSettingsModal(false);
        router.push('/login');
      } catch (error) {
        console.error('❌ Error logging out:', error);
      }
    };

    const handleCancelSubscription = async () => {
      if (!user || isCancelling) return;
      
      const confirmed = window.confirm(
        'Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.'
      );
      
      if (!confirmed) return;
      
      setIsCancelling(true);
      
      try {
        console.log('🚫 Cancelling subscription for user:', user.id);
        
        // Call your cancel subscription API
        const response = await fetch('/api/subscriptions/cancel', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
          },
        });

        if (!response.ok) {
          throw new Error('Failed to cancel subscription');
        }

        alert('Your subscription has been cancelled successfully. You will retain access until the end of your billing period.');
        
        // Refresh credits to update plan info
        fetchCredits();
      } catch (error) {
        console.error('❌ Error cancelling subscription:', error);
        alert('Failed to cancel subscription. Please contact support.');
      } finally {
        setIsCancelling(false);
      }
    };

    // Get plan display info
    const getPlanInfo = () => {
      const planType = credits?.plan_type || 'free';
      const planNames: Record<string, string> = {
        'free': 'Free Plan',
        'basic': 'Basic Plan',
        'pro': 'Pro Plan',
        'ultra': 'Ultra Plan'
      };
      const planPrices: Record<string, string> = {
        'free': '$0.00/month',
        'basic': '$29.00/month',
        'pro': '$49.00/month',
        'ultra': '$89.00/month'
      };
      const planDescriptions: Record<string, string> = {
        'free': '100 credits (one-time) with basic features.',
        'basic': '700 credits per month with slide preview and PDF export.',
        'pro': '1,500 credits per month with all features.',
        'ultra': '3,000 credits per month with priority support.'
      };
      
      return {
        name: planNames[planType] || 'Free Plan',
        price: planPrices[planType] || '$0.00/month',
        description: planDescriptions[planType] || 'Basic features.',
        isPaid: planType !== 'free'
      };
    };

    const planInfo = getPlanInfo();
    
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-fadeIn modal-overlay"
        onClick={() => setShowSettingsModal(false)}
      >
        <div 
          className="bg-white rounded-2xl shadow-xl w-full max-w-md h-[600px] max-h-screen overflow-y-auto p-7 relative border border-gray-200 animate-scaleIn modal-content scrollbar-thin scrollbar-thumb-[#31343b] scrollbar-track-[#18191c]"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="absolute top-5 right-5 text-gray-500 hover:text-gray-900 text-xl font-bold focus:outline-none"
            onClick={() => setShowSettingsModal(false)}
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><line x1="5.5" y1="5.5" x2="14.5" y2="14.5" stroke="currentColor" strokeWidth="1.5"/><line x1="14.5" y1="5.5" x2="5.5" y2="14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
          <h2 className="text-gray-900 text-2xl font-bold mb-1">Settings</h2>
          <p className="text-gray-500 text-sm mb-6">Manage your account and workspace preferences</p>
          {/* Account Section */}
          <div className="mb-7">
            <h3 className="text-gray-900 text-lg font-semibold mb-3">Account</h3>
            <label className="block text-gray-500 text-xs mb-1">Display Name</label>
            <input 
              className="w-full bg-white border border-gray-200 rounded px-3 py-2 text-gray-900 mb-3 focus:outline-none focus:ring-2 focus:ring-[#2563eb]" 
              value={localDisplayName}
              onChange={(e) => setLocalDisplayName(e.target.value)}
              onBlur={(e) => {
                const newName = e.target.value.trim();
                if (newName && newName !== workspaceDisplayName) {
                  setWorkspaceDisplayName(newName);
                  try {
                    const userSpecificKey = `slaid_workspace_display_name_${user?.id || 'anonymous'}`;
                    localStorage.setItem(userSpecificKey, newName);
                    console.log('💾 Workspace display name saved from settings:', newName);
                  } catch (error) {
                    console.error('❌ Failed to save workspace name from settings:', error);
                  }
                }
              }}
            />
            <label className="block text-gray-500 text-xs mb-1">Email</label>
            <input 
              className="w-full bg-white border border-gray-200 rounded px-3 py-2 text-gray-900 mb-3 focus:outline-none focus:ring-2 focus:ring-[#2563eb]" 
              value={user?.email || ''} 
              disabled
            />
          </div>
          {/* Subscription Plan Section */}
          <div className="mb-7">
            <h3 className="text-gray-900 text-lg font-semibold mb-3">Subscription Plan</h3>
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-2">
              <div className="flex items-center justify-between mb-1">
                <div className="text-gray-900 font-semibold">{planInfo.name}</div>
              </div>
              <div className="text-gray-500 text-sm mb-2">{planInfo.price}</div>
              <div className="text-gray-500 text-xs mb-3">{planInfo.description}</div>
              <div className="flex gap-2">
                {!planInfo.isPaid && (
                  <button 
                    className="bg-[#002903] text-white font-medium rounded px-3 py-1 text-sm hover:bg-[#002903]/90 transition" 
                    onClick={() => {
                      setShowSettingsModal(false);
                      setShowPricingModal(true);
                    }}
                  >
                    Upgrade Plan
                  </button>
                )}
                {planInfo.isPaid && (
                  <>
                    <button 
                      className="bg-[#002903] text-white font-medium rounded px-3 py-1 text-sm hover:bg-[#002903]/90 transition" 
                      onClick={() => {
                        setShowSettingsModal(false);
                        setShowPricingModal(true);
                      }}
                    >
                      Change Plan
                    </button>
                    <button 
                      className="bg-gray-500 text-white font-medium rounded px-3 py-1 text-sm hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed" 
                      onClick={handleCancelSubscription}
                      disabled={isCancelling}
                    >
                      {isCancelling ? 'Cancelling...' : 'Cancel Subscription'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
          {/* Logout Section */}
          <div className="mb-7">
            <button 
              onClick={handleLogout}
              className="w-full bg-[#f3f4f6] hover:bg-gray-200 text-[#002903] font-medium rounded px-3 py-2 text-sm transition"
            >
              Log Out
            </button>
          </div>
          {/* Delete Account Section */}
          <div className="mb-0">
            <h3 className="text-gray-900 text-lg font-semibold mb-3">Delete Account</h3>
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-5">
              <div className="text-gray-600 text-sm mb-3">Once you delete your account, there is no going back. Please be certain.</div>
              <button 
                className="bg-red-600 text-white font-medium rounded px-4 py-2 text-sm hover:bg-red-700 transition"
                onClick={() => setShowDeleteConfirmation(true)}
              >
                Delete Account
              </button>
            </div>
            <hr className="border-gray-200 mb-4" />
            <div className="flex justify-end gap-3">
              <button 
                className="text-gray-500 hover:text-gray-900 font-medium rounded px-3 py-1 text-sm transition"
                onClick={() => setShowSettingsModal(false)}
              >
                Cancel
              </button>
              <button 
                className="bg-[#f3f4f6] text-[#002903] font-semibold rounded px-4 py-2 text-sm hover:bg-gray-200 transition"
                onClick={() => setShowSettingsModal(false)}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Delete Confirmation Modal Component
  function DeleteConfirmationModal() {
    const { user, signOut } = useAuth();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteAccount = async () => {
      if (!user) return;
      
      setIsDeleting(true);
      try {
        // Get user session for authentication
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          throw new Error('No valid session found');
        }

        // Call delete account API
        const response = await fetch('/api/auth/delete-account', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to delete account');
        }

        // Account data deleted successfully, sign out and redirect
        await signOut();
        router.push('/login?message=account_deleted');
        
      } catch (error) {
        console.error('❌ Error deleting account:', error);
        alert(`Failed to delete account: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setIsDeleting(false);
        setShowDeleteConfirmation(false);
      }
    };

    if (!showDeleteConfirmation) return null;

    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 animate-fadeIn modal-overlay">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-gray-200 animate-scaleIn modal-content">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h3 className="text-gray-900 text-lg font-semibold">Delete Account</h3>
              <p className="text-gray-500 text-sm">This action cannot be undone</p>
            </div>
          </div>
          
          <div className="mb-6">
            <p className="text-gray-600 text-sm mb-3">
              Are you sure you want to delete your account? This will permanently remove:
            </p>
            <ul className="text-gray-600 text-sm space-y-1 ml-4">
              <li>• All your presentations and workspaces</li>
              <li>• Your account data and settings</li>
              <li>• Your subscription (if any)</li>
            </ul>
            <p className="text-gray-600 text-sm mt-3 font-medium">
              This action is irreversible and cannot be undone.
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              className="flex-1 bg-gray-100 text-gray-900 font-medium rounded px-4 py-2 text-sm hover:bg-gray-200 transition"
              onClick={() => setShowDeleteConfirmation(false)}
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              className="flex-1 bg-red-600 text-white font-semibold rounded px-4 py-2 text-sm hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleDeleteAccount}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Account'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleAddSlide = () => {
    updateSlides([...slides, { title: `New Slide ${slides.length + 1}` }]);
  };

  // Calculate the window of slides to show
  const maxVisibleSlides = sidebarCollapsed ? 6 : 3;
  let startIdx = Math.max(0, activeSlide - Math.floor(maxVisibleSlides / 2));
  let endIdx = startIdx + maxVisibleSlides;
  if (endIdx > slides.length) {
    endIdx = slides.length;
    startIdx = Math.max(0, endIdx - maxVisibleSlides);
  }
  const visibleSlides = slides.slice(startIdx, endIdx);

  // Add state for error popup
  const [showInputError, setShowInputError] = useState(false);
  const [showApiOverloadModal, setShowApiOverloadModal] = useState(false);

  // Drag and drop state for slide reordering
  const [draggedSlideIndex, setDraggedSlideIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Progress tracking for AI generation
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [currentReasoningStep, setCurrentReasoningStep] = useState<string>("");

  // Enhanced language detection function - FIXED to match backend precision
  const detectLanguage = (text: string): 'es' | 'en' => {
    // ULTRA-specific Spanish words that NEVER appear in English (matching backend)
    const spanishIndicators = [
      // Spanish-specific words with accents (100% Spanish markers)
      'presentación', 'diapositivas', 'análisis', 'información', 'solución', 'gráfica', 'gráfico',
      // Spanish command forms that are unmistakably Spanish
      'creame', 'hazme', 'genérame', 'generame', 'dame', 'muéstrame', 'muestrame', 'ayúdame', 'ayudame',
      // Spanish modification words with clear Spanish spelling
      'añade', 'añadir', 'agrega', 'agregar', 'modifica', 'modificar',
      'actualiza', 'actualizar', 'edita', 'editar', 'incluye', 'incluir',
      // Spanish-specific time words
      'trimestres', 'trimestre', 'crecimiento',
      // Spanish articles that are clearly Spanish
      'del', 'los', 'las',
      // Spanish verbs with clear Spanish conjugation
      'está', 'están', 'tiene', 'tienen', 'puede', 'pueden', 'debe', 'deben',
      'quiero', 'necesito', 'deseo', 'busco', 'solicito', 'requiero',
      // Spanish question words with accents
      'qué', 'cómo', 'cuándo', 'dónde', 'por qué',
      // Spanish connectors
      'también', 'además', 'mientras', 'entonces',
      // Spanish pronouns that don't exist in English
      'nuestro', 'vuestro'
    ];

    const lowerText = text.toLowerCase();
    let spanishScore = 0;
    let totalWords = lowerText.split(/\s+/).filter(word => word.length > 0).length;

    // Count Spanish indicators with word boundaries to avoid partial matches
    spanishIndicators.forEach(indicator => {
      const regex = new RegExp(`\\b${indicator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
      const matches = lowerText.match(regex);
      if (matches) {
        spanishScore += matches.length;
      }
    });

    // Calculate percentage of Spanish indicators
    const spanishPercentage = totalWords > 0 ? (spanishScore / totalWords) * 100 : 0;

    console.log('🔍 FIXED Language Detection:', {
      text: text,
      spanishScore: spanishScore,
      totalWords: totalWords,
      percentage: spanishPercentage.toFixed(1) + '%',
      result: spanishPercentage >= 20 ? 'es' : 'en'
    });

    // Use 20% threshold to match backend
    return spanishPercentage >= 20 ? 'es' : 'en';
  };

  // Progress simulation effect
  useEffect(() => {
    const hasLoadingMessage = messages.some(msg => msg.isLoading);
    
    if (hasLoadingMessage) {
      // Determine if this is a modification (quick) or new presentation (slow)
      const lastUserMessage = [...messages].reverse().find(msg => msg.role === 'user');
      const isModification = lastUserMessage && (
        lastUserMessage.text.toLowerCase().includes('change') ||
        lastUserMessage.text.toLowerCase().includes('modify') ||
        lastUserMessage.text.toLowerCase().includes('update') ||
        lastUserMessage.text.toLowerCase().includes('edit') ||
        lastUserMessage.text.toLowerCase().includes('replace') ||
        lastUserMessage.text.toLowerCase().includes('remove') ||
        lastUserMessage.text.toLowerCase().includes('add') ||
        lastUserMessage.text.toLowerCase().includes('fix') ||
        // Spanish modification keywords
        lastUserMessage.text.toLowerCase().includes('cambiar') ||
        lastUserMessage.text.toLowerCase().includes('modificar') ||
        lastUserMessage.text.toLowerCase().includes('actualizar') ||
        lastUserMessage.text.toLowerCase().includes('editar') ||
        lastUserMessage.text.toLowerCase().includes('reemplazar') ||
        lastUserMessage.text.toLowerCase().includes('quitar') ||
        lastUserMessage.text.toLowerCase().includes('añadir') ||
        lastUserMessage.text.toLowerCase().includes('agregar') ||
        lastUserMessage.text.toLowerCase().includes('corregir') ||
        messages.length > 2 // If there are already messages, likely a modification
      );
      
      // Define reasoning steps for new presentations
      const newPresentationSteps = [
        "Analyzing your request and requirements...",
        "Understanding the presentation context and goals...",
        "Determining optimal presentation structure...",
        "Selecting appropriate slide layouts and themes...",
        "Planning content hierarchy and flow...",
        "Generating title slide and introduction...",
        "Creating main content slides...",
        "Developing supporting visuals and charts...",
        "Crafting compelling slide transitions...",
        "Optimizing content for audience engagement...",
        "Reviewing slide consistency and branding...",
        "Fine-tuning layout and visual elements...",
        "Generating executive summary content...",
        "Adding final touches and polish...",
        "Preparing presentation for delivery...",
        "Performing quality checks...",
        "Finalizing slide arrangements..."
      ];
      
      // Define reasoning steps for modifications
      const modificationSteps = [
        "Understanding your modification request...",
        "Analyzing current slide content...",
        "Planning content adjustments...",
        "Implementing requested changes...",
        "Optimizing updated content...",
        "Ensuring consistency with existing slides...",
        "Applying final refinements..."
      ];
      
      const steps = isModification ? modificationSteps : newPresentationSteps;
      
      // Start at 5% immediately
      setGenerationProgress(5);
      setCurrentReasoningStep(steps[0]);
      
      // Set timing based on type of request
      const interval = isModification ? 278 : 1667; // 5s/18steps vs 30s/18steps (5% to 90% = 17 steps)
      
      let stepIndex = 0;
      
      // Increase by 5% at each interval until we reach 90%
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            setCurrentReasoningStep("Completing generation...");
            return 90; // Stop at 90%
          }
          
          stepIndex++;
          if (stepIndex < steps.length) {
            setCurrentReasoningStep(steps[stepIndex]);
          }
          
          return prev + 5; // Increase by 5% each time
        });
      }, interval);
      
      return () => clearInterval(progressInterval);
    } else {
      // Complete to 100% when loading finishes
      setGenerationProgress(100);
      setCurrentReasoningStep("Generation complete!");
      setTimeout(() => {
        setGenerationProgress(0);
        setCurrentReasoningStep("");
      }, 600);
    }
  }, [messages.some(msg => msg.isLoading)]); // Start when loading begins

  // Keyboard navigation for fullscreen preview
  useEffect(() => {
    if (!showFullscreenPreview) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          if (activeSlide > 0) {
            setActiveSlide(activeSlide - 1);
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (activeSlide < memoizedSlides.length - 1) {
            setActiveSlide(activeSlide + 1);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setShowFullscreenPreview(false);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [showFullscreenPreview, activeSlide, memoizedSlides.length]);

  // Drag and drop handlers for slide reordering
  const handleDragStart = (e: React.DragEvent, slideIndex: number) => {
    setDraggedSlideIndex(slideIndex);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', ''); // Required for some browsers
  };

  const handleDragOver = (e: React.DragEvent, slideIndex: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(slideIndex);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedSlideIndex === null || draggedSlideIndex === dropIndex) {
      setDraggedSlideIndex(null);
      setDragOverIndex(null);
      return;
    }

    // Update the presentation data with reordered slides
    const currentMessages = presentationMessages[currentPresentationId] || [];
    const lastAssistantMessage = [...currentMessages].reverse().find(
      msg => msg.role === 'assistant' && msg.presentationData && !msg.isLoading
    );
    
    if (lastAssistantMessage && lastAssistantMessage.presentationData) {
      const currentSlides = [...lastAssistantMessage.presentationData.slides];
      
      // Remove the dragged slide from its original position
      const [draggedSlide] = currentSlides.splice(draggedSlideIndex, 1);
      
      // Insert it at the new position
      currentSlides.splice(dropIndex, 0, draggedSlide);
      
      const updatedPresentationData = {
        ...lastAssistantMessage.presentationData,
        slides: currentSlides
      };
      
      // Update the message with the new presentation data
      const updatedMessages = currentMessages.map(msg => 
        msg === lastAssistantMessage ? {
          ...msg,
          presentationData: updatedPresentationData
        } : msg
      );
      
      setPresentationMessages(prev => ({
        ...prev,
        [currentPresentationId]: updatedMessages
      }));
      
      // Update active slide if necessary
      if (activeSlide === draggedSlideIndex) {
        setActiveSlide(dropIndex);
      } else if (activeSlide > draggedSlideIndex && activeSlide <= dropIndex) {
        setActiveSlide(activeSlide - 1);
      } else if (activeSlide < draggedSlideIndex && activeSlide >= dropIndex) {
        setActiveSlide(activeSlide + 1);
      }
    }
    
    setDraggedSlideIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedSlideIndex(null);
    setDragOverIndex(null);
  };

  // Delete slide handler
  const handleDeleteSlide = (slideIndex: number) => {
    // Prevent deleting if there's only one slide left
    if (slides.length <= 1) {
      console.log('Cannot delete the last remaining slide');
      return;
    }

    // Get current presentation data
    const currentMessages = presentationMessages[currentPresentationId] || [];
    const lastAssistantMessage = [...currentMessages].reverse().find(
      msg => msg.role === 'assistant' && msg.presentationData && !msg.isLoading
    );
    
    if (lastAssistantMessage && lastAssistantMessage.presentationData) {
      const currentSlides = [...lastAssistantMessage.presentationData.slides];
      
      // Remove the slide at the specified index
      currentSlides.splice(slideIndex, 1);
      
      const updatedPresentationData = {
        ...lastAssistantMessage.presentationData,
        slides: currentSlides
      };
      
      // Update the message with the new presentation data
      const updatedMessages = currentMessages.map(msg => 
        msg === lastAssistantMessage 
          ? { ...msg, presentationData: updatedPresentationData }
          : msg
      );
      
      // Update the state
      setPresentationMessages(prev => ({
        ...prev,
        [currentPresentationId]: updatedMessages
      }));
      
      // Adjust active slide if necessary
      if (slideIndex === activeSlide && activeSlide > 0) {
        setActiveSlide(activeSlide - 1);
      } else if (slideIndex < activeSlide) {
        setActiveSlide(activeSlide - 1);
      } else if (activeSlide >= currentSlides.length) {
        setActiveSlide(currentSlides.length - 1);
      }
      
      console.log(`🗑️ Deleted slide ${slideIndex + 1}. Remaining slides: ${currentSlides.length}`);
    }
  };


  console.log('🚨🚨🚨 EDITOR PAGE: About to return SimpleAutosave component');
  console.log('🚨🚨🚨 CURRENT PRESENTATION DATA:', {
    currentPresentationId,
    currentWorkspace,
    messagesLength: messages.length,
    currentPresentationDataTitle: currentPresentationData?.title,
    workspacePresentationsCount: workspacePresentations[currentWorkspace]?.length || 0,
    isDataLoaded
  });

  // Export mode: render only the slide content for PDF generation
  if (isExportMode) {
    console.log('📄📄📄 EXPORT MODE ACTIVE: Rendering with data:', { 
      hasSlideData: !!exportSlideData, 
      slideDataId: exportSlideData?.id,
      slideDataType: exportSlideData?.type,
      slideDataBlocks: exportSlideData?.blocks?.length,
      isDataLoaded: isDataLoaded 
    });
    
    // ALWAYS render .slide-content div to prevent timeout, even if there's an error
    // If we don't have slide data yet, show loading
    if (!exportSlideData) {
      return (
        <div className="bg-white" style={{ width: '1920px', height: '1080px', overflow: 'hidden', position: 'relative' }}>
          <div 
            className="slide-content"
            style={{
              width: '881px',
              height: '495px',
              transform: 'none',
              position: 'absolute',
              top: '0px',
              left: '0px'
            }}
          >
            <div className="flex items-center justify-center w-full h-full">
              <div className="text-gray-500">Loading slide data...</div>
            </div>
          </div>
        </div>
      );
    }
    
    // CRITICAL: Wrap everything in try-catch to ensure .slide-content always renders
    return (
      <div className="bg-white" style={{ width: '1920px', height: '1080px', overflow: 'hidden', position: 'relative' }}>
        <div 
          className="slide-content"
          style={{
            width: '881px',
            height: '495px',
            transform: 'none',
            position: 'absolute',
            top: '0px',
            left: '0px'
          }}
        >
          {(() => {
            try {
              if (!exportSlideData.blocks || !Array.isArray(exportSlideData.blocks)) {
                console.error('❌ No blocks found in exportSlideData');
                return <div className="p-4 text-red-800">No blocks to render</div>;
              }
              
              return exportSlideData.blocks.map((block: any, index: number) => {
                try {
                  console.log('📄📄📄 Export mode: Rendering block', index, block.type, 'Props keys:', Object.keys(block.props || {}));
                  const result = renderBlock(block, index, false);
                  console.log('✅✅✅ Export mode: Successfully rendered block', index, block.type);
                  return result;
                } catch (error) {
                  console.error('❌❌❌ Error rendering block in export mode:', block.type, error);
                  return (
                    <div key={index} className="p-4 bg-red-100 text-red-800 text-xs">
                      Error rendering {block.type}: {error instanceof Error ? error.message : String(error)}
                    </div>
                  );
                }
              });
            } catch (error) {
              console.error('❌ Critical error in export mode rendering:', error);
              return (
                <div className="p-4 bg-red-100 text-red-800">
                  Critical rendering error: {error instanceof Error ? error.message : String(error)}
                </div>
              );
            }
          })()}
        </div>
      </div>
    );
  }

  // Show loading while component is mounting or workspaces are being loaded
  if (!isMounted || workspacesLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[#1c1c1c] flex items-center justify-center">
          <LoadingCircle />
        </div>
      </ProtectedRoute>
    );
  }

  // Show loading state while checking for presentations
  if (!isDataLoaded) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center h-screen w-screen bg-white">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[#002903] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[#002903] text-lg font-medium">Loading...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
    <SimpleAutosave
      presentationId={currentPresentationId}
      workspace={currentWorkspace}
      messages={messages}
      activeSlide={activeSlide}
      presentationTitle={currentPresentationData?.title}
      workspaceTitle={workspacePresentations[currentWorkspace]?.find(p => p.id === currentPresentationId)?.title}
      onDataLoadComplete={() => {
        console.log('🔄🔄🔄 DATA LOAD COMPLETE: No database data found, using defaults')
        setIsDataLoaded(true)
      }}
      onStateRestored={(state) => {
        console.log('🔄🔄🔄 SUPABASE AUTOSAVE: State restored:', {
          slidesCount: state.slides?.length,
          messagesCount: state.messages?.length,
          activeSlide: state.activeSlide,
          title: state.title
        })
        
        console.log('🔍🔍🔍 EDITOR DEBUG: Current state before restoration:', {
          currentPresentationId,
          currentMessages: messages.length,
          presentationMessagesKeys: Object.keys(presentationMessages)
        })
        
        // If we have slides but no messages, check if it's truly empty or has content
        if (state.slides && state.slides.length > 0 && (!state.messages || state.messages.length === 0)) {
          console.log('🔧🔧🔧 Checking if presentation has actual content or is empty...')
          
          // Check if slides have actual content (blocks with meaningful data)
          // Treat instruction slides as empty - they should not show chat messages
          const hasActualContent = state.slides.some((slide: any) => 
            slide.blocks && slide.blocks.length > 0 && 
            slide.blocks.some((block: any) => 
              (block.type === 'text' && block.content && block.content.trim() !== '' && 
               !block.content.includes('To generate your presentation write in the input box below')) ||
              (block.type === 'TextBlock' && block.props?.text && block.props.text.trim() !== '' && 
               !block.props.text.includes('To generate your presentation write in the input box below')) ||
              (block.type === 'image' && block.imageUrl) ||
              (block.type === 'layout' && block.layoutType)
            )
          );
          
          if (hasActualContent) {
            console.log('🔧🔧🔧 Presentation has actual content, reconstructing messages...')
          
          const reconstructedMessages = [
            {
              role: 'user',
              text: `Create a presentation about ${state.title || 'business presentation'}`
            },
            {
              role: 'assistant',
              text: `I've created your presentation: "${state.title || 'Untitled Presentation'}"`,
              isLoading: false,
              presentationData: {
                title: state.title || 'Untitled Presentation',
                slides: state.slides
              },
              version: 1,
              userMessage: `Create a presentation about ${state.title || 'business presentation'}`
            }
          ]
          
            console.log('🔄🔄🔄 Setting presentation messages with reconstructed data:', reconstructedMessages)
          setPresentationMessages(prev => {
            const updated = {
              ...prev,
              [currentPresentationId]: reconstructedMessages
            }
              console.log('📝📝📝 Updated presentationMessages:', updated)
            return updated
          })
          
            console.log('✅✅✅ Presentation data reconstructed with', state.slides.length, 'slides')
          } else {
            console.log('🔧🔧🔧 Presentation appears to be empty - NOT creating any messages')
            // Don't create any messages for empty presentations
            // Just update the slides state without messages
            setWorkspaceSlides(prev => ({
              ...prev,
              [currentWorkspace]: {
                ...prev[currentWorkspace],
                [currentPresentationId]: state.slides.map((slide: any) => ({ title: slide.title || 'Untitled Slide' }))
              }
            }));
          }
        } else if (state.messages) {
          console.log('🔄🔄🔄 RESTORE CHAT MESSAGES: Loading messages from database:', state.messages)
          
          // 🔧 RESTORE MESSAGES: Load actual messages from database
          const processedMessages = state.messages.map((msg: any) => {
            const processedMsg = {
              role: msg.role || 'user',
              text: msg.content || msg.text || '',
              isLoading: false,
              ...(msg.presentationData && { presentationData: msg.presentationData }),
              // Restore version information if it exists
              ...(msg.version && { version: msg.version }),
              ...(msg.userMessage && { userMessage: msg.userMessage })
            };
            
            return processedMsg;
          });

          // 🔧 FALLBACK VERSION RECONSTRUCTION: Only if version info is missing
          // This handles older presentations that don't have version data saved
          let assistantCount = 0;
          let lastUserMessage = '';
          
          processedMessages.forEach((msg: any, index: number) => {
            if (msg.role === 'user') {
              lastUserMessage = msg.text; // Store user message for next assistant
            } else if (msg.role === 'assistant' && msg.presentationData && !msg.version) {
              // Only reconstruct if version doesn't exist (older presentations)
              assistantCount++;
              processedMessages[index] = {
                ...msg,
                version: assistantCount,
                userMessage: lastUserMessage
              };
            } else if (msg.role === 'assistant' && msg.version) {
              // Count existing versions to keep track
              assistantCount = Math.max(assistantCount, msg.version);
            }
          });

          // 🔧 CRITICAL FIX: If we have slides but assistant messages don't have presentationData, 
          // reconstruct the presentationData from the loaded slides
          if (state.slides && state.slides.length > 0) {
            console.log('🔧🔧🔧 FIXING PRESENTATION DATA: Ensuring assistant messages have complete presentation data')
            
            const presentationDataToAdd = {
              title: state.title || 'Untitled Presentation',
              slides: state.slides
            };
            
            // Find assistant messages and ensure they have presentationData
            processedMessages.forEach((msg: any, index: number) => {
              if (msg.role === 'assistant' && !msg.presentationData) {
                console.log('🔧 Adding presentation data to assistant message', index)
                processedMessages[index] = {
                  ...msg,
                  presentationData: presentationDataToAdd,
                  // Preserve version and userMessage if they exist
                  ...(msg.version && { version: msg.version }),
                  ...(msg.userMessage && { userMessage: msg.userMessage })
                };
              }
            });
          }
          
          console.log('🔄🔄🔄 Setting presentation messages with database data:', processedMessages);
          setPresentationMessages(prev => ({
              ...prev,
            [currentPresentationId]: processedMessages
          }));
          
          // Also update slides if we have them
          if (state.slides) {
            setWorkspaceSlides(prev => ({
              ...prev,
              [currentWorkspace]: {
                ...prev[currentWorkspace],
                [currentPresentationId]: state.slides?.map((slide: any) => ({ title: slide.title || 'Untitled Slide' })) || [{ title: 'Untitled Slide' }]
              }
            }));
          }
        }
        
        // Set active slide
        if (typeof state.activeSlide === 'number') {
          console.log('🔄🔄🔄 Setting active slide to:', state.activeSlide)
          setActiveSlide(state.activeSlide)
        }
        
        console.log('✅✅✅ State restoration completed')
      }}
    >
      <div className="min-h-screen w-full flex flex-row bg-white font-sans">
      <CreditsModal />
      <CreditPacksModal />
      <PricingModal />
      <SettingsModal />
      {showHelpModal && <HelpModal />}
      {showApiOverloadModal && <ApiOverloadModal />}
      <DeleteConfirmationModal />
      
      {showHelpDropdown && (
        <div
          ref={helpDropdownRef}
          className="absolute left-full top-0 ml-2 mt-1 w-64 bg-[#002903] rounded-xl shadow-xl border border-gray-200 py-2 px-0 z-50 animate-modal-in"
        >
          <button 
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-900 hover:bg-white transition"
            onClick={() => {
              setShowHelpDropdown(false);
              setShowHelpModal(true);
            }}
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 20 20" className="text-gray-500"><circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/><path d="M10 6v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="10" cy="14" r="1" fill="currentColor"/></svg>
            Get support
          </button>
          <button 
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-900 hover:bg-white transition"
            onClick={() => {
              setShowHelpDropdown(false);
              setShowHelpModal(true);
            }}
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 20 20" className="text-gray-500"><path d="M10 2l2.39 4.84L18 7.27l-3.91 3.81L14.18 16 10 13.27 5.82 16l.91-4.92L2 7.27l5.61-.43L10 2z" stroke="currentColor" strokeWidth="1.5" fill="none"/></svg>
            What's new
          </button>
          <button 
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-900 hover:bg-white transition"
            onClick={() => {
              setShowHelpDropdown(false);
              setShowHelpModal(true);
            }}
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 20 20" className="text-gray-500"><path d="M3 8.5a7 7 0 1 1 14 0c0 2.5-2 4.5-7 7-5-2.5-7-4.5-7-7z" stroke="currentColor" strokeWidth="1.5" fill="none"/><circle cx="10" cy="8.5" r="2" fill="currentColor"/></svg>
            Join slack community
          </button>
        </div>
      )}
      {/* Sidebar */}
      <aside className={`flex flex-col h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out ${sidebarCollapsed ? "w-14" : "w-[300px]"}`}>
        {sidebarCollapsed ? (
          <>
            {/* Top: sidebar toggle icon (points left) */}
            <div className="flex flex-col items-center pt-4">
              <button
                className="w-9 h-9 rounded-xl bg-transparent hover:bg-gray-100 flex items-center justify-center mb-4 transition"
                aria-label="Open sidebar"
                onClick={() => {
                  setSidebarCollapsed(false);
                  refreshCredits(); // Refresh credits when sidebar opens
                }}
              >
                <img src="/sidebar-green.png" alt="Sidebar Icon" className="w-6 h-6 object-contain" />
              </button>
            </div>
            {/* Middle: empty space */}
            <div className="flex-1" />
            {/* Bottom: hex/star, credits, avatar */}
            <div className="flex flex-col items-center mb-4 gap-2">
              <button onClick={() => setShowCreditsModal(true)} className="focus:outline-none hover:scale-125 transition duration-200 ease-in-out">
                <img src="/ai credit-icon.png" alt="Credit Icon" className="w-9 h-9 object-contain" />
              </button>
              <div className="text-gray-900 font-bold text-xs leading-none">
                {creditsLoading ? 'Loading...' : (credits?.remaining_credits?.toLocaleString() || '0')}
              </div>
              <div className="h-9 w-9 rounded-full bg-[#002903] flex items-center justify-center text-white font-bold text-lg">
                {workspaceDisplayName ? workspaceDisplayName.charAt(0).toUpperCase() : 'M'}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Workspace section at the top */}
            <div className="px-4 pt-4 pb-4 flex items-center gap-3 min-w-0 justify-between border-b border-gray-200">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-8 w-8 rounded-full bg-[#002903] flex items-center justify-center text-white font-medium text-sm">
                  {workspaceDisplayName ? workspaceDisplayName.charAt(0).toUpperCase() : 'M'}
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1">
                    {editingWorkspace ? (
                      <input
                        type="text"
                        defaultValue={workspaceDisplayName}
                        autoFocus
                        onBlur={async (e) => {
                          const newName = e.target.value.trim();
                          if (newName && newName !== workspaceDisplayName) {
                            console.log('🔄 Renaming workspace from:', workspaceDisplayName, 'to:', newName);
                            
                            // Update the database via API
                            try {
                              const { data: { session } } = await supabase.auth.getSession();
                              if (session?.access_token) {
                                const response = await fetch('/api/workspaces/rename', {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${session.access_token}`
                                  },
                                  body: JSON.stringify({ 
                                    oldName: workspaceDisplayName, 
                                    newName: newName 
                                  })
                                });
                                
                                if (response.ok) {
                                  console.log('✅ Workspace renamed in database');
                                  // Update the display name only after successful database update
                                  setWorkspaceDisplayName(newName);
                                  
                                  // Update localStorage
                                  const userSpecificKey = `slaid_workspace_display_name_${user?.id || 'anonymous'}`;
                                  localStorage.setItem(userSpecificKey, newName);
                                } else {
                                  console.error('❌ Failed to rename workspace in database:', response.status);
                                  // Revert the input value
                                  e.target.value = workspaceDisplayName;
                                }
                              }
                            } catch (error) {
                              console.error('❌ Error renaming workspace:', error);
                              // Revert the input value
                              e.target.value = workspaceDisplayName;
                            }
                          }
                          setEditingWorkspace(false);
                        }}
                        onKeyDown={(e) => {
                          e.stopPropagation();
                          if (e.key === 'Enter') {
                            // Trigger the same logic as onBlur
                            e.currentTarget.blur();
                          }
                          if (e.key === 'Escape') {
                            setEditingWorkspace(false);
                          }
                        }}
                        onClick={e => e.stopPropagation()}
                        className="bg-transparent border-none outline-none text-gray-900 font-medium text-sm max-w-[140px]"
                      />
                    ) : (
                      <span className="text-gray-900 font-medium text-sm truncate max-w-[140px]">{workspaceDisplayName}</span>
                    )}
                  </div>
                  <span className="text-gray-500 text-xs">
                    {credits?.plan_type === 'pro' ? 'Pro plan' : 'Free plan'}
                  </span>
                </div>
              </div>
              {/* Sidebar toggle button */}
              <button
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                aria-label="Collapse sidebar"
                onClick={() => setSidebarCollapsed(true)}
              >
                <img src="/sidebar-green.png" alt="Sidebar Icon" className="w-5 h-5 object-contain" />
              </button>
            </div>
            {/* Main scrollable section */}
            <div className="flex-1 min-h-0 flex flex-col">
              <div className="px-4 mt-3">
                <button
                  className="w-full flex items-center justify-start gap-2 bg-[#f3f4f6] hover:bg-gray-200 text-[#002903] rounded-lg py-1.5 mb-3 transition font-medium pl-3"
                  onClick={async () => {
                    // 🚨 CRITICAL: SET ONBOARDING FIRST - BEFORE ANY OTHER STATE UPDATES
                    console.log('🚀🚀🚀 SETTING ONBOARDING STATE FIRST - BEFORE EVERYTHING ELSE');
                    setShowOnboarding(true);
                    setOnboardingStep(1);
                    console.log('✅✅✅ ONBOARDING STATE SET FIRST - should be visible immediately');
                    
                    const currentPresentations = workspacePresentations[currentWorkspace] || [];
                    const newId = uuidv4(); // Generate UUID for new presentation
                    const newPresentation = { id: newId, title: "Untitled Presentation" };
                    
                    // Track this ID for future reloads
                    persistCreatedId(newId);
                    
                    // Update UI immediately
                    setWorkspacePresentations(prev => ({
                      ...prev,
                      [currentWorkspace]: [...currentPresentations, newPresentation]
                    }));
                    setWorkspaceSlides(prev => ({
                      ...prev,
                      [currentWorkspace]: {
                        ...(prev[currentWorkspace] || {}),
                        [newId]: [{ title: "New Slide 1" }]
                      }
                    }));
                    lastCreatedPresentationId.current = newId;
                    setCurrentPresentationId(newId);
                    setActiveSlide(0);
                    
                    // 🚨 CRITICAL FIX: Initialize empty messages for new presentation
                    setPresentationMessages(prev => ({
                      ...prev,
                      [newId]: [] // Start with completely empty messages
                    }));
                    
                    // 🚨 PREVENT AUTO-LOADING: Mark this as a new presentation to prevent SimpleAutosave from loading old data
                    window.slaidNewPresentationFlag = newId;
                    
                    console.log('💾💾💾 CREATING NEW PRESENTATION (in-memory only, will save after generation):', { id: newId, title: "Untitled Presentation" })
                    
                    // MVP: Don't save to database yet - only save after user generates content through onboarding
                    // The presentation will be saved automatically when slides are generated
                    
                    // Onboarding already set at the beginning - no need to set again
                    
                    // Use setTimeout to ensure the state has updated before starting to edit
                    setTimeout(() => {
                      setEditingTitle(newId);
                    }, 0);
                  }}
                >
                  <span className="text-[#002903] text-lg font-bold leading-none">+</span>
                  <span className="font-medium text-sm">New presentation</span>
                </button>
              </div>
              <div className="px-4 mt-2 flex-1 min-h-0 flex flex-col">
                <div className="text-gray-500 text-xs font-medium mb-3 uppercase tracking-wide">PRESENTATIONS</div>
                <div className="flex flex-col gap-1 overflow-y-auto flex-1 min-h-0 scrollbar-thin scrollbar-thumb-[#31343b] scrollbar-track-[#18191c]">
                  {(workspacePresentations[currentWorkspace] || []).map(p => (
                    <div
                      key={p.id}
                      className={`w-full text-left px-3 py-1.5 rounded-lg ${
                        // If we're editing the currently selected presentation, keep selection on it
                        (editingTitle === currentPresentationId && p.id === currentPresentationId) ||
                        // Show selection on original presentation if we're editing a different one
                        (originalSelectedPresentation !== null && editingTitle !== null && editingTitle !== currentPresentationId && p.id === originalSelectedPresentation) ||
                        // Show selection on current presentation if not editing
                        (editingTitle === null && p.id === currentPresentationId)
                          ? "bg-[#002903] text-white font-medium" 
                          : "text-gray-700 hover:bg-gray-100 font-normal"
                      } text-sm transition group relative cursor-pointer`}
                    >
                      {editingTitle === p.id ? (
                        <>
                        {console.log('🚨🚨🚨 RENDERING TITLE INPUT FOR PRESENTATION:', p.id, 'CURRENT VALUE:', p.title)}
                        <input
                          type="text"
                          value={p.title || ''}
                          autoFocus
                          onChange={e => {
                            e.stopPropagation();
                            const newTitle = e.target.value;
                          
                            // Only update UI state - don't save to database yet
                            setWorkspacePresentations(prev => ({
                              ...prev,
                              [currentWorkspace]: prev[currentWorkspace].map(presentation =>
                                presentation.id === p.id ? { ...presentation, title: newTitle } : presentation
                              )
                            }));
                          }}
                          onBlur={() => {
                            const finalTitle = p.title?.trim() || 'Untitled Presentation';
                            
                            if (!p.title?.trim()) {
                              setWorkspacePresentations(prev => ({
                                ...prev,
                                [currentWorkspace]: prev[currentWorkspace].map(presentation =>
                                  presentation.id === p.id ? { ...presentation, title: 'Untitled Presentation' } : presentation
                                )
                              }));
                            }
                            
                            // Save title to database when editing finishes
                            // BUT ONLY if the presentation has messages (i.e., has been used)
                            const saveTitle = async () => {
                              try {
                                const messages = presentationMessages[p.id] || [];
                                
                                // MVP: Don't save if presentation is still empty (no messages)
                                if (messages.length === 0) {
                                  console.log('⏭️ Skipping save - presentation is empty (no messages yet)');
                                  return;
                                }
                                
                                const headers = await getAuthHeaders();
                                
                                fetch('/api/presentations/save', {
                                  method: 'POST',
                                  headers,
                                  body: JSON.stringify({ 
                                    presentationId: p.id,
                                    state: {
                                      title: finalTitle,
                                      slides: [{ id: 'slide-1', blocks: [] }],
                                      messages: [],
                                      activeSlide: 0
                                    }
                                  })
                                }).then(response => {
                                  if (response.ok) {
                                    console.log('✅ Title saved successfully:', finalTitle);
                                  } else {
                                    console.error('❌ Failed to save title:', response.status);
                                  }
                                }).catch(error => {
                                  console.error('❌ Error saving title:', error);
                                });
                              } catch (error) {
                                console.error('❌ Error getting auth headers:', error);
                              }
                            };
                            saveTitle();
                            
                            // Don't switch presentations - just finish editing
                            setEditingTitle(null);
                            setOriginalSelectedPresentation(null);
                          }}
                          onKeyDown={e => {
                            e.stopPropagation();
                            if (e.key === 'Enter') {
                              const finalTitle = p.title?.trim() || 'Untitled Presentation';
                              
                              if (!p.title?.trim()) {
                                setWorkspacePresentations(prev => ({
                                  ...prev,
                                  [currentWorkspace]: prev[currentWorkspace].map(presentation =>
                                    presentation.id === p.id ? { ...presentation, title: 'Untitled Presentation' } : presentation
                                  )
                                }));
                              }
                              
                              // Save title to database when Enter is pressed
                              // BUT ONLY if the presentation has messages (i.e., has been used)
                              const saveTitleOnEnter = async () => {
                                try {
                                  const messages = presentationMessages[p.id] || [];
                                  
                                  // MVP: Don't save if presentation is still empty (no messages)
                                  if (messages.length === 0) {
                                    console.log('⏭️ Skipping save on Enter - presentation is empty (no messages yet)');
                                    return;
                                  }
                                  
                                  const headers = await getAuthHeaders();
                                  
                                  fetch('/api/presentations/save', {
                                    method: 'POST',
                                    headers,
                                    body: JSON.stringify({ 
                                      presentationId: p.id,
                                      state: {
                                        title: finalTitle,
                                        slides: [{ id: 'slide-1', blocks: [] }],
                                        messages: [],
                                        activeSlide: 0
                                      }
                                    })
                                  }).then(response => {
                                    if (response.ok) {
                                      console.log('✅ Title saved successfully on Enter:', finalTitle);
                                  } else {
                                    console.error('❌ Failed to save title on Enter:', response.status);
                                  }
                                }).catch(error => {
                                  console.error('❌ Error saving title on Enter:', error);
                                });
                              } catch (error) {
                                console.error('❌ Error getting auth headers:', error);
                              }
                            };
                            saveTitleOnEnter();
                              
                              // Don't switch presentations - just finish editing
                              setEditingTitle(null);
                              setOriginalSelectedPresentation(null);
                            }
                            if (e.key === 'Escape') {
                              setWorkspacePresentations(prev => ({
                                ...prev,
                                [currentWorkspace]: prev[currentWorkspace].map(presentation =>
                                  presentation.id === p.id ? { ...presentation, title: 'Untitled Presentation' } : presentation
                                )
                              }));
                              // Don't switch presentations - just finish editing
                              setEditingTitle(null);
                              setOriginalSelectedPresentation(null);
                            }
                          }}
                          onClick={e => e.stopPropagation()}
                          className="w-full bg-transparent border-none outline-none text-sm font-medium"
                          style={{ color: 'inherit' }}
                        />
                        </>
                      ) : (
                        <div className="flex items-center justify-between w-full">
                          <span 
                            className="block flex-1 truncate text-sm cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Only change selection if we're not currently editing any title
                              if (editingTitle === null) {
                                setCurrentPresentationId(p.id);
                                
                                // Close onboarding when switching to any existing presentation
                                if (showOnboarding) {
                                  setShowOnboarding(false);
                                  setOnboardingStep(1);
                                  
                                  // Clean up: Remove any empty presentations that were never saved to database
                                  // (presentations with no messages and only created in-memory)
                                  const currentPresentations = workspacePresentations[currentWorkspace] || [];
                                  const filteredPresentations = currentPresentations.filter(presentation => {
                                    // Keep the presentation we're switching to
                                    if (presentation.id === p.id) return true;
                                    
                                    // Check if this presentation has any messages
                                    const hasMessages = (presentationMessages[presentation.id]?.length || 0) > 0;
                                    
                                    // Only keep presentations that have messages (were actually generated/saved)
                                    return hasMessages;
                                  });
                                  
                                  if (filteredPresentations.length !== currentPresentations.length) {
                                    console.log('🧹 Cleaning up empty unsaved presentations');
                                    setWorkspacePresentations(prev => ({
                                      ...prev,
                                      [currentWorkspace]: filteredPresentations
                                    }));
                                  }
                                }
                              }
                            }}
                            onDoubleClick={(e) => {
                              e.stopPropagation();
                              // Double click: store original selection and start editing
                              if (originalSelectedPresentation === null && p.id !== currentPresentationId) {
                                setOriginalSelectedPresentation(currentPresentationId);
                              }
                              setEditingTitle(p.id);
                            }}
                          >
                            {p.title || "Untitled Presentation"}
                          </span>
                          <button
                            className="opacity-0 group-hover:opacity-100 ml-2 p-1 rounded hover:bg-black/20 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Edit button: store original selection and start editing
                              if (p.id !== currentPresentationId) {
                                setOriginalSelectedPresentation(currentPresentationId);
                              }
                              setEditingTitle(p.id);
                            }}
                            aria-label="Edit title"
                          >
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" className="text-current">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Fixed bottom section */}
            <div className="px-4 pb-4 border-t border-gray-200 pt-4">
              <button className="w-full bg-[#002903] hover:bg-[#002903]/90 text-white font-medium rounded-lg py-1.5 mb-4 text-sm transition" onClick={() => setShowPricingModal(true)}>Upgrade plan</button>
              <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2.5 mb-4">
                <span className="flex items-center gap-2 text-gray-700 text-sm font-medium">
                  <img src="/ai credit-icon.png" alt="Credit Icon" className="w-6 h-6 object-contain" />
                  {creditsLoading ? 'Loading...' : `${credits?.remaining_credits?.toLocaleString() || '96'} Credits`}
                </span>
                <button className="hidden bg-[#002903] text-white text-xs font-medium rounded-md px-3 py-1.5 hover:bg-[#002903]/90 transition" onClick={() => setShowCreditsModal(true)}>Buy more</button>
              </div>
              <button className="w-full flex items-center gap-3 text-gray-600 text-sm py-1.5 px-3 rounded-lg hover:bg-gray-100 transition mb-2" onClick={() => setShowSettingsModal(true)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gray-500">
                  <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Settings
              </button>
              <button
                ref={helpButtonRef}
                data-featurebase-feedback
                className="w-full flex items-center gap-3 text-gray-600 text-sm py-1.5 px-3 rounded-lg hover:bg-gray-100 transition"
                onClick={e => {
                  e.stopPropagation();
                  console.log('🔘 Help & Support button clicked with data-featurebase-feedback');
                  console.log('🔍 Checking Featurebase availability:', window.Featurebase);
                  console.log('🔍 Button element:', e.currentTarget);
                  console.log('🔍 Data attribute:', e.currentTarget.getAttribute('data-featurebase-feedback'));
                  
                  // Manual trigger as fallback
                  if (window.Featurebase) {
                    console.log('🚀 Manually triggering Featurebase widget...');
                    try {
                      window.Featurebase('show');
                    } catch (error) {
                      console.log('⚠️ Manual trigger failed:', error);
                    }
                  } else {
                    console.log('❌ Featurebase not available on window');
                  }
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gray-500">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Help & support
              </button>
            </div>
          </>
        )}
      </aside>
      {/* Main content: chat + slide preview */}
      <main className="flex-1 flex flex-row h-screen">
        {/* Chat/editor column - Hide during onboarding */}
        {!showOnboarding && (
          <section className="hidden w-[420px] flex flex-col h-full bg-white border-r border-gray-200 px-0 py-0">
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-2 relative">
            <h2 className="text-[#002903] text-xl font-medium break-words w-full line-clamp-2">
              {currentPresentation?.title || "Untitled Presentation"}
            </h2>
            {/* Three dots icon */}
            <button
              className="ml-2 p-2 rounded-full hover:bg-gray-100 transition text-gray-500"
              onClick={e => {
                e.stopPropagation();
                setShowTitleMenu(v => !v);
              }}
              aria-label="Presentation options"
            >
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                <circle cx="5" cy="12" r="2" fill="currentColor"/>
                <circle cx="12" cy="12" r="2" fill="currentColor"/>
                <circle cx="19" cy="12" r="2" fill="currentColor"/>
              </svg>
            </button>
          </div>
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-6 pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full w-full">
                <img src="/Favicon Slaid.png" alt="Slaid Icon" className="w-10 h-10 object-contain mb-3 mt-12" />
                <div className="text-[#002903] text-base font-normal mb-4">Ask slaid what you want...</div>
              </div>
            ) : (
              <div className="flex flex-col gap-6 mb-6 mt-6">
                {/* Version History Notice */}
                
                {/* 🔧 CRITICAL FIX: USER MESSAGE ALWAYS FIRST - Simple chronological order */}
                {messages.map((msg, i) =>
                  msg.role === 'user' ? (
                    <div key={msg.id || `user-${i}`} className="flex flex-col items-end gap-1">
                      <div className="flex flex-row-reverse items-end gap-2">
                        <div className="h-9 w-9 rounded-full bg-[#002903] flex items-center justify-center text-white font-medium text-lg">
                          {workspaceDisplayName ? workspaceDisplayName.charAt(0).toUpperCase() : 'M'}
                        </div>
                        <div className="bg-[#002903] text-white rounded-xl px-4 py-2 max-w-xs mb-1 text-sm">{msg.text}</div>
                      </div>
                    </div>
                  ) : msg.role === 'assistant' ? (
                    <div key={msg.id || `assistant-${i}`} className="flex flex-col items-start w-full">
                      {msg.isLoading ? (
                        // Loading state with Cursor-style UI
                        <div className="flex flex-col w-full">
                          <div className="flex items-center gap-2 text-[#002903] text-sm mb-3">
                            <LoadingCircle size={16} color="#002903" progress={generationProgress} />
                            <span className="font-semibold">Reasoning</span>
                          </div>
                          <div className="text-[#002903] text-sm leading-relaxed whitespace-pre-line mb-3">
                            {currentReasoningStep}
                          </div>
                        </div>
                      ) : (
                        // Regular completed message
                        <>
                          <div className="text-[#002903] text-sm mb-2"><span className="font-semibold text-[#002903]">Reasoning</span></div>
                          <div className="text-[#002903] text-sm mb-3">{msg.text}</div>
                          <div className={`rounded-lg px-4 py-3 flex flex-col border w-full max-w-xs ${(() => {
                            const latestVersion = messages.filter(m => m.role === 'assistant' && m.version).slice(-1)[0]?.version;
                            const currentActiveVersion = activeVersion !== null ? activeVersion : latestVersion;
                            return msg.version === currentActiveVersion ? 'bg-[#f3f4f6] border-gray-200' : 'bg-[#f3f4f6] border-gray-200 opacity-80';
                          })()}`}>
                            <div className="flex items-center justify-between mb-1">
                              <span className={(() => {
                                const latestVersion = messages.filter(m => m.role === 'assistant' && m.version).slice(-1)[0]?.version;
                                const currentActiveVersion = activeVersion !== null ? activeVersion : latestVersion;
                                return msg.version === currentActiveVersion ? 'text-[#002903] font-semibold text-sm' : 'text-[#002903] font-medium text-sm';
                              })()}>{truncateVersionTitle(msg.userMessage || 'True Full Screen Slide Display')}</span>
                              {(() => {
                                const latestVersion = messages.filter(m => m.role === 'assistant' && m.version).slice(-1)[0]?.version;
                                const currentActiveVersion = activeVersion !== null ? activeVersion : latestVersion;
                                
                                if (msg.version !== undefined && msg.version === currentActiveVersion) {
                                  return <span className="flex items-center gap-1 text-xs text-[#00e676]">●<span>Version {msg.version}</span></span>;
                                } else if (msg.version !== undefined) {
                                  return (
                                    <button className="text-gray-500 text-xs hover:text-gray-900 hover:underline transition" onClick={() => {
                                      console.log('🔄 VERSION HISTORY: Go back button clicked for version', msg.version);
                                      console.log('🔄 VERSION HISTORY: Current activeVersion before click:', activeVersion);
                                      setActiveVersion(msg.version!);
                                      console.log('🔄 VERSION HISTORY: Setting activeVersion to:', msg.version);
                                    }}>go back</button>
                                  );
                                } else {
                                  return null;
                                }
                              })()}
                            </div>
                            {(() => {
                              const latestVersion = messages.filter(m => m.role === 'assistant' && m.version).slice(-1)[0]?.version;
                              const currentActiveVersion = activeVersion !== null ? activeVersion : latestVersion;
                              return msg.version !== undefined && msg.version !== currentActiveVersion ? (
                                <div className="text-gray-500 text-xs">Version {msg.version}</div>
                              ) : null;
                            })()}
                          </div>
                        </>
                      )}
                    </div>
                  ) : null
                )}
              </div>
            )}
          </div>
          {/* Chat Input */}
          <form
            className="px-6 pb-4 pt-2"
            onSubmit={async (e) => {
              // 🚨 ULTRA CRITICAL DEBUG: Form submission started
              console.log('🚨 ULTRA CRITICAL DEBUG: Form onSubmit called with input:', chatInput);
              console.log('🚨 ULTRA CRITICAL DEBUG: Checking investor deck detection for:', chatInput);
              
              // 🚨 TEST INVESTOR DECK DETECTION IMMEDIATELY
              const testInvestorDetection = chatInput.toLowerCase().includes('investor deck') || 
                     chatInput.toLowerCase().includes('pitch deck') || 
                     chatInput.toLowerCase().includes('fundraising deck');
              console.log('🚨 TEST INVESTOR DECK DETECTION:', {
                input: chatInput,
                lowerInput: chatInput.toLowerCase(),
                hasInvestorDeck: chatInput.toLowerCase().includes('investor deck'),
                hasPitchDeck: chatInput.toLowerCase().includes('pitch deck'),
                hasFundraisingDeck: chatInput.toLowerCase().includes('fundraising deck'),
                testResult: testInvestorDetection
              });
              
              e.preventDefault();
              if (chatInput.trim() || fileData) {
                // 🚨 EMERGENCY DEBUG: Check if we reach this point for reports
                console.log('🚨 EMERGENCY DEBUG - onSubmit called with:', {
                  chatInput: chatInput,
                  isQBR: chatInput.toLowerCase().includes('qbr'),
                  isSalesReport: chatInput.toLowerCase().includes('sales report'),
                  isQuarterlyBusinessReview: chatInput.toLowerCase().includes('quarterly business review'),
                  isPitchDeck: chatInput.toLowerCase().includes('pitch deck'),
                  isInvestorDeck: chatInput.toLowerCase().includes('investor deck'),
                  isFundraisingDeck: chatInput.toLowerCase().includes('fundraising deck')
                });
                
                // 🔧 RESTORE CHAT MESSAGES: Add user message and loading indicator TOGETHER
                // Add both user message and loading message in a single state update to ensure correct order
                const userMessage = { 
                  id: `user-${Date.now()}-${Math.random()}`, // Unique ID
                  role: "user" as const, 
                  text: chatInput, 
                  attachments: attachedFiles 
                };
                
                const loadingMessage = { 
                  id: `assistant-${Date.now()}-${Math.random()}`, // Unique ID
                  role: "assistant" as const, 
                  text: "Generating your presentation...", 
                  isLoading: true 
                };
                
                // Add both messages together to guarantee order
                setPresentationMessages(prev => ({
                  ...prev,
                  [currentPresentationId]: [
                    ...(prev[currentPresentationId] || []),
                    userMessage,
                    loadingMessage
                  ]
                }));

                // 🚨 CRITICAL FIX: Preserve original intent BEFORE Excel processing
                const originalPrompt = chatInput; // Preserve original user input for intent detection
                
                // Keep the user prompt clean - don't modify it with file analysis
                const userPrompt = chatInput; // Use original user input, not enhanced with file data
                setChatInput("");
                setAttachedFiles([]);
                if (fileData) {
                  setFileData(null);
                }

                // Get the LATEST presentation data at submission time
                // Include the user message that was just added to state
                const existingMessages = presentationMessages[currentPresentationId] || [];
                const currentMessages = [...existingMessages, userMessage];
                const latestPresentationData = getCurrentPresentationData(currentMessages);
                
                // If no presentation data but we have assistant messages, try to get from last assistant message
                const assistantMessage = [...currentMessages].reverse().find(m => m.role === 'assistant' && !m.isLoading);
                const fallbackPresentationData = !latestPresentationData && assistantMessage ? 
                  (assistantMessage as any).presentationData : null;
                
                const effectivePresentationData = latestPresentationData || fallbackPresentationData;
                
                // Determine if this is a modification request
                // 🎯 ENHANCED INTENT CLASSIFICATION - Use ORIGINAL prompt for intent detection
                const isCreateNewRequest = isCreateNewPresentationRequest(originalPrompt);
                const isAddSlideRequest = isAddNewSlideRequest(originalPrompt);
                const isModificationAttempt = isModificationRequest(originalPrompt);
                const hasExistingPresentation = !!effectivePresentationData;
                const hasAnyAssistantMessages = currentMessages.some(m => m.role === 'assistant' && !m.isLoading);
                
                // Intent-based logic:
                // 1. CREATE NEW: Always create new presentation (ignore existing data)
                // 2. ADD SLIDE: Create single slide (requires existing presentation context)
                // 3. MODIFY: Modify existing content (requires existing data)
                // 4. DEFAULT: If no clear intent and no existing data, create new presentation
                
                let finalIntent = 'create_new'; // Default
                let isModification = false;
                
                if (isCreateNewRequest) {
                  finalIntent = 'create_new';
                  isModification = false;
                } else if (isAddSlideRequest) {
                  // If adding a slide but no existing presentation, create new presentation instead
                  if (!hasExistingPresentation && !hasAnyAssistantMessages) {
                    console.log('🔄 Add slide requested but no existing presentation - creating new presentation instead');
                    finalIntent = 'create_new';
                    isModification = false;
                  } else {
                    finalIntent = 'add_slide';
                    isModification = false;
                  }
                } else if (isModificationAttempt && (hasExistingPresentation || hasAnyAssistantMessages)) {
                  finalIntent = 'modify';
                  isModification = true;
                } else if (!isModificationAttempt && !hasExistingPresentation && !hasAnyAssistantMessages) {
                  // No clear intent, no existing data -> create new presentation
                  finalIntent = 'create_new';
                  isModification = false;
                } else {
                  // Ambiguous case: assume modification if we have data, otherwise create new
                  if (hasExistingPresentation || hasAnyAssistantMessages) {
                    finalIntent = 'modify';
                    isModification = true;
                  } else {
                    finalIntent = 'create_new';
                    isModification = false;
                  }
                }
                
                console.log('🎯 Enhanced Intent Classification:', {
                  userPrompt: userPrompt,
                  isCreateNewRequest: isCreateNewRequest,
                  isAddSlideRequest: isAddSlideRequest,
                  isModificationAttempt: isModificationAttempt,
                  hasExistingPresentation: hasExistingPresentation,
                  hasAnyAssistantMessages: hasAnyAssistantMessages,
                  finalIntent: finalIntent,
                  isModification: isModification,
                  currentPresentationSlides: effectivePresentationData?.slides?.length || 0,
                  currentPresentationTitle: effectivePresentationData?.title,
                  currentPresentationId: currentPresentationId,
                  messageCount: messages.length,
                  presentationMessageKeys: Object.keys(presentationMessages),
                  willSendExistingPresentation: isModification && !!effectivePresentationData,
                  existingPresentationTitle: effectivePresentationData?.title
                });
                
                // Special case: modification request on existing presentation without chat history
                if (isModificationAttempt && currentPresentation && !effectivePresentationData && !hasAnyAssistantMessages) {
                  console.log('🚫 Cannot modify existing presentation without chat history');
                  
                  // Only add assistant response (user message already added above)
                  setPresentationMessages(prev => ({
                    ...prev,
                    [currentPresentationId]: [
                      ...(prev[currentPresentationId] || []),
                        {
                          role: "assistant",
                          text: `**Cannot modify this presentation**\n\nThis presentation doesn't have any chat history, so I can't modify it. To use font changes like "Instrument Serif", please:\n\n1. **Start a new chat** by clicking "New Presentation", or\n2. **Create a new presentation** with your desired content\n\n*Example: "Create a presentation about dogs using Instrument Serif font"*`,
                          version: 1
                        }
                    ]
                  }));
                  
                  return;
                }

                // Generate dynamic reasoning based on user prompt
                const { text: dynamicReasoning } = generateReasoningWithTiming(userPrompt, isModification);
                
                // 🔧 CLEAN CHAT: Skip adding loading message to keep chat clean
                // Instead of showing loading messages, just process silently

                try {
                  console.log('Making API call to /api/generate...');
                  
                  // Prepare uploaded images data
                  const uploadedImages = attachedFiles
                    .filter(file => file.isUploaded && file.uploadStatus === 'completed' && file.serverUrl)
                    .map(file => ({
                      originalName: file.name,
                      serverUrl: file.serverUrl,
                      suggestedVariant: file.suggestedVariant || 'illustration',
                      type: file.type
                    }));

                  // 🎯 PRODUCT DOSSIER DETECTION AND AUTOMATIC SPLIT
                  const isProductDossierRequest = (prompt: string): boolean => {
                    const lowerPrompt = prompt.toLowerCase();
                    
                    // Exclude sales/excel-related presentations from product dossier detection
                    if (lowerPrompt.includes('sales') || 
                        lowerPrompt.includes('excel') || 
                        lowerPrompt.includes('report') ||
                        lowerPrompt.includes('forecast') ||
                        lowerPrompt.includes('revenue')) {
                      return false;
                    }
                    
                    return lowerPrompt.includes('product dossier') || 
                           lowerPrompt.includes('dossier') ||
                           lowerPrompt.includes('product deck') ||
                           lowerPrompt.includes('product overview') ||
                           lowerPrompt.includes('solution overview') ||
                           lowerPrompt.includes('solution brief') ||
                           lowerPrompt.includes('capability deck') ||
                           lowerPrompt.includes('capabilities deck') ||
                           lowerPrompt.includes('sales collateral') ||
                           lowerPrompt.includes('product collateral') ||
                           lowerPrompt.includes('sales enablement deck') ||
                           lowerPrompt.includes('product enablement deck') ||
                           lowerPrompt.includes('product brochure') ||
                           lowerPrompt.includes('solution brochure') ||
                           lowerPrompt.includes('product datasheet') ||
                           lowerPrompt.includes('data sheet') ||
                           lowerPrompt.includes('fact sheet') ||
                           lowerPrompt.includes('factsheet') ||
                           lowerPrompt.includes('customer pitch') ||
                           lowerPrompt.includes('prospect pitch') ||
                           lowerPrompt.includes('customer presentation') ||
                           lowerPrompt.includes('prospect presentation') ||
                           lowerPrompt.includes('product demo deck') ||
                           lowerPrompt.includes('product demo presentation') ||
                           lowerPrompt.includes('value proposition deck') ||
                           lowerPrompt.includes('value prop deck') ||
                           lowerPrompt.includes('product documentation') ||
                           lowerPrompt.includes('product presentation') ||
                           (lowerPrompt.includes('product') && lowerPrompt.includes('dossier'));
                  };

                  // 🎯 INVESTOR DECK DETECTION AND AUTOMATIC SPLIT
                  const isInvestorDeckRequest = (prompt: string): boolean => {
                    const lowerPrompt = prompt.toLowerCase();
                    const isInvestor = lowerPrompt.includes('investor deck') || 
                           lowerPrompt.includes('pitch deck') || 
                           lowerPrompt.includes('fundraising deck') || 
                           lowerPrompt.includes('vc pitch') || 
                           lowerPrompt.includes('startup pitch') || 
                           lowerPrompt.includes('seed deck') || 
                           lowerPrompt.includes('pre-seed deck') || 
                           lowerPrompt.includes('series a deck') || 
                           lowerPrompt.includes('series b deck') || 
                           lowerPrompt.includes('teaser deck') || 
                           lowerPrompt.includes('raise round deck');
                    console.log('🔍 Investor Deck Detection:', { prompt: lowerPrompt, isInvestor });
                    return isInvestor;
                  };

                  // 🎯 REPORT PLAYBOOK DETECTION AND AUTOMATIC SPLIT
                  const isReportRequest = (prompt: string): boolean => {
                    const lowerPrompt = prompt.toLowerCase();
                    
                    // If user explicitly asks for a single slide, it's NOT a report
                    if (lowerPrompt.includes('single slide') || 
                        lowerPrompt.includes('one slide') || 
                        lowerPrompt.includes('create a slide')) {
                      return false;
                    }
                    
                    const isReport = lowerPrompt.includes('sales report') || 
                           lowerPrompt.includes('report using the data') ||  // Added for Excel-based reports
                           lowerPrompt.includes('sales report using') ||     // Added for "sales report using this data"
                           lowerPrompt.includes('create a sales report') ||  // Added for "create a sales report"
                           lowerPrompt.includes('sales analysis') ||         // Added for Excel-based analysis
                           lowerPrompt.includes('sales performance') || 
                           lowerPrompt.includes('revenue report') || 
                           lowerPrompt.includes('pipeline review') || 
                           lowerPrompt.includes('forecast review') || 
                           lowerPrompt.includes('revops report') ||
                           // Spanish sales report keywords
                           lowerPrompt.includes('reporte de ventas') ||
                           lowerPrompt.includes('informe de ventas') ||
                           lowerPrompt.includes('análisis de ventas') ||
                           lowerPrompt.includes('reporte comercial') ||
                           lowerPrompt.includes('informe comercial') ||
                           lowerPrompt.includes('reporte de ingresos') ||
                           lowerPrompt.includes('análisis comercial') ||
                           lowerPrompt.includes('creame un reporte') ||
                           lowerPrompt.includes('créame un reporte') ||
                           lowerPrompt.includes('crea una reporte') ||
                           lowerPrompt.includes('crea un reporte') ||
                           // 🔥 EXCEL-BASED REPORT DETECTION - Only for EXPLICIT sales/business reports with Excel data
                           (!isModification && lowerPrompt.includes('sales report') && lowerPrompt.includes('excel')) ||
                           (!isModification && lowerPrompt.includes('business report') && lowerPrompt.includes('excel')) ||
                           (!isModification && lowerPrompt.includes('revenue report') && lowerPrompt.includes('excel')) ||
                           (!isModification && lowerPrompt.includes('sales analysis') && lowerPrompt.includes('excel')) ||
                           (!isModification && lowerPrompt.includes('forecast') && lowerPrompt.includes('excel')) ||
                           lowerPrompt.includes('qbr') || 
                           lowerPrompt.includes('quarterly business review') || 
                           lowerPrompt.includes('mbr') || 
                           lowerPrompt.includes('monthly business review') || 
                           lowerPrompt.includes('ebr') || 
                           lowerPrompt.includes('executive business review') || 
                           lowerPrompt.includes('customer success health') || 
                           lowerPrompt.includes('cs health') || 
                           lowerPrompt.includes('churn/expansion report') || 
                           lowerPrompt.includes('churn expansion report') || 
                           lowerPrompt.includes('marketing performance report') || 
                           lowerPrompt.includes('campaign report') || 
                           lowerPrompt.includes('product performance report') || 
                           lowerPrompt.includes('feature adoption report') || 
                           lowerPrompt.includes('regional report') || 
                           lowerPrompt.includes('territory report') || 
                           lowerPrompt.includes('partner performance') || 
                           lowerPrompt.includes('channel performance') || 
                           lowerPrompt.includes('finance snapshot') || 
                           lowerPrompt.includes('financial summary');
                    console.log('🔍 Report Detection:', { prompt: lowerPrompt, isReport });
                    return isReport;
                  };

                  // 🎯 TOPIC PRESENTATION DETECTION
                  const isTopicPresentationRequest = (prompt: string): boolean => {
                    const lowerPrompt = prompt.toLowerCase();
                    const isTopic = lowerPrompt.includes('topic presentation') || 
                           lowerPrompt.includes('topic deck') || 
                           lowerPrompt.includes('educational presentation') || 
                           lowerPrompt.includes('topic overview') || 
                           lowerPrompt.includes('presentation about') ||
                           lowerPrompt.includes('information deck') ||
                           lowerPrompt.includes('overview presentation') ||
                           lowerPrompt.includes('knowledge share') ||
                           lowerPrompt.includes('research summary') ||
                           lowerPrompt.includes('market research') ||
                           lowerPrompt.includes('industry analysis') ||
                           lowerPrompt.includes('competitive landscape') ||
                           lowerPrompt.includes('sector overview') ||
                           lowerPrompt.includes('trend report') ||
                           lowerPrompt.includes('market overview');
                    console.log('🔍 Topic Presentation Detection:', { prompt: lowerPrompt, isTopic });
                    return isTopic;
                  };

                  // 🎯 PRODUCT LAUNCH DETECTION
                  const isProductLaunchRequest = (prompt: string): boolean => {
                    const lowerPrompt = prompt.toLowerCase();
                    const isProductLaunch = lowerPrompt.includes('product launch') ||
                           lowerPrompt.includes('product launch presentation') ||
                           lowerPrompt.includes('product launch deck') ||
                           lowerPrompt.includes('launch presentation') ||
                           lowerPrompt.includes('launch deck') ||
                           lowerPrompt.includes('product launch plan') ||
                           lowerPrompt.includes('launch strategy') ||
                           lowerPrompt.includes('product rollout') ||
                           lowerPrompt.includes('product announcement') ||
                           lowerPrompt.includes('launch campaign') ||
                           lowerPrompt.includes('product debut') ||
                           lowerPrompt.includes('product introduction') ||
                           lowerPrompt.includes('new product launch') ||
                           lowerPrompt.includes('product release') ||
                           lowerPrompt.includes('launch event') ||
                           lowerPrompt.includes('product unveiling') ||
                           lowerPrompt.includes('go-to-market launch') ||
                           lowerPrompt.includes('product launch strategy') ||
                           lowerPrompt.includes('launch a product') ||
                           lowerPrompt.includes('product launch for') ||
                           lowerPrompt.includes('launching our product');
                    console.log('🔍 Product Launch Detection:', { prompt: lowerPrompt, isProductLaunch });
                    return isProductLaunch;
                  };

                  // 🎯 CAMPAIGN DETECTION
                  const isCampaignRequest = (prompt: string): boolean => {
                    const lowerPrompt = prompt.toLowerCase();
                    const isCampaign = lowerPrompt.includes('campaign') || 
                           lowerPrompt.includes('campaign presentation') || 
                           lowerPrompt.includes('campaign deck') || 
                           lowerPrompt.includes('marketing campaign') || 
                           lowerPrompt.includes('campaign overview') || 
                           lowerPrompt.includes('campaign strategy') ||
                           lowerPrompt.includes('campaign plan') ||
                           lowerPrompt.includes('campaign proposal') ||
                           lowerPrompt.includes('campaign brief') ||
                           lowerPrompt.includes('campaign launch') ||
                           lowerPrompt.includes('campaign rollout') ||
                           lowerPrompt.includes('advertising campaign') ||
                           lowerPrompt.includes('promotional campaign') ||
                           lowerPrompt.includes('brand campaign') ||
                           lowerPrompt.includes('digital campaign') ||
                           lowerPrompt.includes('social campaign') ||
                           lowerPrompt.includes('campaign materials') ||
                           lowerPrompt.includes('campaign pitch') ||
                           lowerPrompt.includes('campaign summary') ||
                           lowerPrompt.includes('marketing campaign plan') ||
                           lowerPrompt.includes('campaign roadmap') ||
                           lowerPrompt.includes('go-to-market campaign') ||
                           lowerPrompt.includes('launch campaign') ||
                           lowerPrompt.includes('growth campaign') ||
                           lowerPrompt.includes('acquisition campaign') ||
                           lowerPrompt.includes('retention campaign') ||
                           lowerPrompt.includes('paid media campaign') ||
                           lowerPrompt.includes('performance marketing campaign') ||
                           lowerPrompt.includes('google ads campaign') ||
                           lowerPrompt.includes('meta campaign') ||
                           lowerPrompt.includes('facebook ads campaign') ||
                           lowerPrompt.includes('linkedin ads campaign') ||
                           lowerPrompt.includes('tiktok ads campaign') ||
                           lowerPrompt.includes('abm campaign') ||
                           lowerPrompt.includes('email campaign') ||
                           lowerPrompt.includes('drip campaign') ||
                           lowerPrompt.includes('nurture campaign') ||
                           lowerPrompt.includes('seo campaign') ||
                           lowerPrompt.includes('content campaign') ||
                           lowerPrompt.includes('plan a marketing campaign') ||
                           lowerPrompt.includes('create a campaign') ||
                           lowerPrompt.includes('build a campaign presentation') ||
                           lowerPrompt.includes('campaign plan for') ||
                           lowerPrompt.includes('campaign strategy for') ||
                           lowerPrompt.includes('campaign brief for');
                    console.log('🔍 Campaign Detection:', { prompt: lowerPrompt, isCampaign });
                    return isCampaign;
                  };

                  // 🚨 CRITICAL DEBUG: Ensure detection functions are defined
                  console.log('🚨 CRITICAL DEBUG: Detection functions defined', {
                    isInvestorDeckRequest: typeof isInvestorDeckRequest,
                    isProductDossierRequest: typeof isProductDossierRequest,
                    isReportRequest: typeof isReportRequest,
                    isTopicPresentationRequest: typeof isTopicPresentationRequest,
                    isProductLaunchRequest: typeof isProductLaunchRequest,
                    isCampaignRequest: typeof isCampaignRequest
                  });

                  // 🚨 CRITICAL DEBUG: Check all playbook detections
                  console.log('🚨 CRITICAL DEBUG - Playbook Detection Check:', {
                    userPrompt: userPrompt,
                    isInvestorDeck: isInvestorDeckRequest(userPrompt),
                    isProductDossier: isProductDossierRequest(userPrompt),
                    isReport: isReportRequest(userPrompt),
                    isTopicPresentation: isTopicPresentationRequest(userPrompt),
                    isProductLaunch: isProductLaunchRequest(userPrompt),
                    isCampaign: isCampaignRequest(userPrompt),
                    isModification: isModification
                  });

                  if (isInvestorDeckRequest(userPrompt) && !isModification) {
                    console.log('🎯 INVESTOR DECK DETECTED: Making 2 API calls automatically');
                    
                    // Detect language for investor deck API request - USE CURRENT PROMPT ONLY
                    const userLanguage = detectLanguage(userPrompt); // Use current prompt, not message history
                    
                    console.log('🌐 INVESTOR DECK LANGUAGE DEBUG:', {
                      userInput: userPrompt, // Log current prompt, not previous message
                      detectedLanguage: userLanguage,
                      isSpanish: userLanguage === 'es'
                    });
                    
                    try {
                      // Helper function to make investor deck API calls
                    const makeInvestorDeckCall = async (part: 'first' | 'second') => {
                      let partPrompt = part === 'first' 
                        ? `Create slides 1-6 of a SaaS investor deck: Cover_ProductLayout (Investor Deck), Index_LeftAgendaRightText (Agenda), Impact_ImageMetrics (Problem), Product_MacBookCentered (Solution), Lists_CardsLayoutRight (Why Now), Competition_Analysis (Competition). ${userPrompt}`
                        : `Create slides 8-13 of a SaaS investor deck: Pricing_Plans (Business Model), Team_AdaptiveGrid (Team), Impact_KPIOverview (Traction), Metrics_FinancialsSplit (The Round), Quote_LeftTextRightImage (Mission), BackCover_ThankYouWithImage (Back Cover). ${userPrompt}`;

                      // Force Spanish content if user spoke Spanish
                      if (userLanguage === 'es') {
                        partPrompt += `\n\nIMPORTANT: Generate ALL content in Spanish language. All slide titles, text, descriptions, and content must be in Spanish.`;
                      }

                      // 💳 Check if user has at least 1 credit before API call (minimum cost)
                      if (!hasEnoughCredits(1)) {
                        setShowCreditsModal(true);
                        // Update loading message to show insufficient credits
                        setPresentationMessages(prev => ({
                          ...prev,
                          [currentPresentationId]: prev[currentPresentationId].map(msg => 
                            msg.isLoading ? {
                              ...msg,
                              text: 'Insufficient credits to generate presentation. Please purchase more credits or upgrade your plan.',
                              isLoading: false
                            } : msg
                          )
                        }));
                        return;
                      }

                      // Get auth headers
                      const { data: { session } } = await supabase.auth.getSession();
                      const headers: Record<string, string> = {
                        'Content-Type': 'application/json',
                      };
                      if (session?.access_token) {
                        headers['Authorization'] = `Bearer ${session.access_token}`;
                      }

                      const response = await fetch('/api/generate', {
                        method: 'POST',
                        headers,
                        body: JSON.stringify({
                          prompt: partPrompt,
                          language: userLanguage, // Add language parameter
                          existingPresentation: undefined,
                          uploadedImages: uploadedImages.length > 0 ? uploadedImages : undefined,
                          presentationId: currentPresentationId,
                          workspace: currentWorkspace
                        }),
                      });

                      if (!response.ok) {
                        const errorData = await response.json();
                        
                        // Handle insufficient credits
                        if (response.status === 402) {
                          setShowCreditsModal(true);
                          // Update loading message to show insufficient credits
                          setPresentationMessages(prev => ({
                            ...prev,
                            [currentPresentationId]: prev[currentPresentationId].map(msg => 
                              msg.isLoading ? {
                                ...msg,
                                text: 'Insufficient credits to complete generation. Please purchase more credits or upgrade your plan.',
                                isLoading: false
                              } : msg
                            )
                          }));
                          return;
                        }
                        
                        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
                      }

                      return await response.json();
                    };

                    // Make both calls in parallel for faster execution
                    const [firstResponse, secondResponse] = await Promise.all([
                      makeInvestorDeckCall('first'),
                      makeInvestorDeckCall('second')
                    ]);

                    console.log('✅ Both investor deck parts completed, combining...');
                    
                    // Combine responses
                    if (!firstResponse?.slides || !secondResponse?.slides) {
                      throw new Error('One or both investor deck parts failed to generate slides');
                    }

                    const combinedData = {
                      title: firstResponse.title || 'SaaS Investor Deck',
                      slides: [
                        ...firstResponse.slides,
                        ...secondResponse.slides.map((slide: any, index: number) => ({
                          ...slide,
                          id: `slide-${firstResponse.slides.length + index + 1}`
                        }))
                      ]
                    };

                      console.log('✅ SUCCESS: Combined 13-slide investor deck created');
                    
                    // Replace loading message with success - REMOVE AND ADD NEW
                      setPresentationMessages(prev => {
                        const existingMessages = prev[currentPresentationId] || [];
                        const assistantMessages = existingMessages.filter(msg => msg.role === 'assistant' && !msg.isLoading);
                        const nextVersion = assistantMessages.length + 1;
                        
                        return {
                      ...prev,
                          [currentPresentationId]: [
                            ...existingMessages.filter(msg => !msg.isLoading),
                            {
                              id: `assistant-result-${Date.now()}-${Math.random()}`,
                              role: "assistant" as const,
                          text: `Successfully created "${combinedData.title}"\n\nPresentation structure:\n${combinedData.slides.map((slide: any, i: number) => `${i + 1}. ${slide.title || `Slide ${i + 1}`}`).join('\n')}\n\nYour 12-slide investor deck features professional layouts, cohesive visual design, and optimized content hierarchy. Ready for review and presentation.`,
                          isLoading: false,
                              presentationData: combinedData,
                              userMessage: originalPrompt,  // 🔧 Add user input for version display
                              version: nextVersion
                            }
                          ]
                        };
                      });
                      
                      // 🔧 UPDATE WORKSPACE PRESENTATIONS WITH NEW AI-GENERATED TITLE AND MOVE TO TOP
                      setWorkspacePresentations(prev => {
                        const currentPresentations = prev[currentWorkspace] || [];
                        const updatedPresentation = currentPresentations.find(p => p.id === currentPresentationId);
                        const otherPresentations = currentPresentations.filter(p => p.id !== currentPresentationId);
                        
                        if (updatedPresentation) {
                          // Move the generated presentation to the top of the list
                          return {
                        ...prev,
                            [currentWorkspace]: [
                              { ...updatedPresentation, title: combinedData.title },
                              ...otherPresentations
                            ]
                          };
                        }
                        return prev;
                      });
                      
                      // 🔧 ENSURE CURRENT PRESENTATION IS TRACKED
                      persistCreatedId(currentPresentationId);
                      
                      // 🔧 RELOAD PRESENTATIONS TO ENSURE UI IS UPDATED
                      setTimeout(() => {
                        reloadWorkspacePresentations();
                        // 💳 Refresh credits after successful generation
                        console.log('🔄 Refreshing credits after successful generation...');
                        refreshCredits().then(() => {
                          console.log('✅ Credits refreshed, new balance should be visible');
                        }).catch(err => {
                          console.error('❌ Failed to refresh credits:', err);
                        });
                      }, 1000);
                    
                    // Force immediate re-render
                    setTimeout(() => {
                      console.log('🔄 Forcing re-render after investor deck creation');
                      setActiveSlide(prev => prev);
                    }, 100);
                    
                    return;
                    
                    } catch (investorDeckError) {
                      console.error('❌ Investor deck generation failed:', investorDeckError);
                      
                      // Update with investor deck specific error
                      setPresentationMessages(prev => ({
                        ...prev,
                        [currentPresentationId]: prev[currentPresentationId].map(msg => 
                            msg.isLoading ? {
                              ...msg,
                              text: `Investor deck generation failed: ${investorDeckError instanceof Error ? investorDeckError.message : 'Unknown error'}\n\nThis could be due to:\n• Network connectivity issues\n• API timeout\n• Server overload\n\nPlease try again in a moment.`,
                              isLoading: false
                            } : msg
                        )
                      }));
                      
                      return;
                    }
                  }

                  // 🎯 PRODUCT DOSSIER DETECTION AND AUTOMATIC SPLIT
                  if (isProductDossierRequest(userPrompt) && !isModification) {
                    console.log('🎯 PRODUCT DOSSIER DETECTED: Making 2 API calls automatically');
                    
                    // Detect language for product dossier API request - USE CURRENT PROMPT ONLY
                    const userLanguage = detectLanguage(userPrompt); // Use current prompt, not message history
                    
                    console.log('🌐 PRODUCT DOSSIER LANGUAGE DEBUG:', {
                      userInput: userPrompt, // Log current prompt, not previous message
                      detectedLanguage: userLanguage,
                      isSpanish: userLanguage === 'es'
                    });
                    
                    try {
                      // Helper function to make product dossier API calls
                      const makeProductDossierCall = async (part: 'first' | 'second') => {
                        let partPrompt = part === 'first' 
                          ? `Create slides 1-6 of a product dossier: Cover, Index, Context, Problem, Solution, Main Feature. ${userPrompt}`
                          : `Create slides 7-12 of a product dossier: Features, Competition, Benefits, Metrics, Missions, Back Cover. ${userPrompt}`;

                        // Force Spanish content if user spoke Spanish
                        if (userLanguage === 'es') {
                          partPrompt += `\n\nIMPORTANT: Generate ALL content in Spanish language. All slide titles, text, descriptions, and content must be in Spanish.`;
                        }

                        console.log(`📤 Making ${part} product dossier API call with prompt: "${partPrompt}"`);
                        console.log(`🌐 Language for ${part} product dossier: ${userLanguage}`);
                        
                        // Get auth headers for credit tracking
                        const { data: { session } } = await supabase.auth.getSession();
                        const headers: Record<string, string> = {
                          'Content-Type': 'application/json',
                        };
                        if (session?.access_token) {
                          headers['Authorization'] = `Bearer ${session.access_token}`;
                        }
                        
                        const response = await fetch('/api/generate', {
                          method: 'POST',
                          headers,
                        body: JSON.stringify({
                          prompt: partPrompt,
                          language: userLanguage, // Add language parameter
                          existingPresentation: undefined,
                            uploadedImages: uploadedImages.length > 0 ? uploadedImages : undefined,
                            presentationId: currentPresentationId,
                            workspace: currentWorkspace
                        }),
                        });

                        if (!response.ok) {
                          const errorData = await response.json();
                          throw new Error(`Product dossier ${part} part failed: ${errorData.error || response.statusText}`);
                        }

                        const result = await response.json();
                        console.log(`✅ ${part} product dossier part completed with ${result.slides?.length || 0} slides`);
                        console.log(`🔍 ${part} part slide IDs:`, result.slides?.map((s: any) => s.id) || []);
                        console.log(`🔍 ${part} part slide blocks:`, result.slides?.map((s: any) => ({ id: s.id, blockCount: s.blocks?.length || 0 })) || []);
                        return result;
                      };

                      // Make both calls in parallel for faster execution
                      const [firstResponse, secondResponse] = await Promise.all([
                        makeProductDossierCall('first'),
                        makeProductDossierCall('second')
                      ]);

                      console.log('✅ Both product dossier parts completed, combining...');
                      console.log('🔍 First response slides:', firstResponse?.slides?.length || 0);
                      console.log('🔍 Second response slides:', secondResponse?.slides?.length || 0);
                      
                      // Combine responses
                      if (!firstResponse?.slides || !secondResponse?.slides) {
                        throw new Error('One or both product dossier parts failed to generate slides');
                      }

                      // Filter out any slides with empty blocks before combining
                      const validFirstSlides = firstResponse.slides.filter((slide: any) => slide.blocks && slide.blocks.length > 0);
                      const validSecondSlides = secondResponse.slides.filter((slide: any) => slide.blocks && slide.blocks.length > 0);
                      
                      console.log('🔍 Valid first slides:', validFirstSlides.length);
                      console.log('🔍 Valid second slides:', validSecondSlides.length);
                      
                      if (validFirstSlides.length !== firstResponse.slides.length) {
                        console.warn('⚠️ Filtered out', firstResponse.slides.length - validFirstSlides.length, 'invalid slides from first part');
                      }
                      if (validSecondSlides.length !== secondResponse.slides.length) {
                        console.warn('⚠️ Filtered out', secondResponse.slides.length - validSecondSlides.length, 'invalid slides from second part');
                      }
                      
                      const combinedData = {
                        title: firstResponse.title || 'Product Dossier',
                        slides: [
                          ...validFirstSlides,
                          ...validSecondSlides.map((slide: any, index: number) => ({
                            ...slide,
                            id: `slide-${validFirstSlides.length + index + 1}`
                          }))
                        ]
                      };

                      console.log('✅ SUCCESS: Combined 12-slide product dossier created');
                      
                      // Replace loading message with success - REMOVE AND ADD NEW
                        setPresentationMessages(prev => {
                          const existingMessages = prev[currentPresentationId] || [];
                          const assistantMessages = existingMessages.filter(msg => msg.role === 'assistant' && !msg.isLoading);
                          const nextVersion = assistantMessages.length + 1;
                          
                          return {
                        ...prev,
                            [currentPresentationId]: [
                              ...existingMessages.filter(msg => !msg.isLoading),
                              {
                                id: `assistant-result-${Date.now()}-${Math.random()}`,
                                role: "assistant" as const,
                            text: `Successfully created "${combinedData.title}"\n\nPresentation structure:\n${combinedData.slides.map((slide: any, i: number) => `${i + 1}. ${slide.title || `Slide ${i + 1}`}`).join('\n')}\n\nYour 12-slide product dossier features comprehensive product documentation, competitive analysis, detailed feature overview, and company mission. Ready for review and presentation.`,
                            isLoading: false,
                                presentationData: combinedData,
                                userMessage: originalPrompt,  // 🔧 Add user input for version display
                                version: nextVersion
                              }
                            ]
                          };
                        });
                        
                        // Close onboarding after successful generation
                        if (showOnboarding) {
                          setShowOnboarding(false);
                          setOnboardingStep(1); // Reset for next time
                          
                          // Clear the generation timeout
                          if ((window as any).generationTimeout) {
                            clearTimeout((window as any).generationTimeout);
                            (window as any).generationTimeout = null;
                          }
                        }
                        
                        // 🔧 UPDATE WORKSPACE PRESENTATIONS WITH NEW AI-GENERATED TITLE AND MOVE TO TOP
                        setWorkspacePresentations(prev => {
                          const currentPresentations = prev[currentWorkspace] || [];
                          const updatedPresentation = currentPresentations.find(p => p.id === currentPresentationId);
                          const otherPresentations = currentPresentations.filter(p => p.id !== currentPresentationId);
                          
                          if (updatedPresentation) {
                            // Move the generated presentation to the top of the list
                            return {
                          ...prev,
                              [currentWorkspace]: [
                                { ...updatedPresentation, title: combinedData.title },
                                ...otherPresentations
                              ]
                            };
                          }
                          return prev;
                        });
                        
                        // 🔧 ENSURE CURRENT PRESENTATION IS TRACKED
                        persistCreatedId(currentPresentationId);
                        
                        // 🔧 RELOAD PRESENTATIONS TO ENSURE UI IS UPDATED
                        setTimeout(() => {
                          reloadWorkspacePresentations();
                        }, 1000);
                      
                      // Force immediate re-render
                      setTimeout(() => {
                        console.log('🔄 Forcing re-render after product dossier creation');
                        setActiveSlide(prev => prev);
                      }, 100);
                      
                      return;
                      
                    } catch (productDossierError) {
                      console.error('❌ Product dossier generation failed:', productDossierError);
                      
                      // Update with product dossier specific error
                      setPresentationMessages(prev => ({
                        ...prev,
                        [currentPresentationId]: prev[currentPresentationId].map(msg => 
                            msg.isLoading ? {
                              ...msg,
                              text: `Product dossier generation failed: ${productDossierError instanceof Error ? productDossierError.message : 'Unknown error'}\n\nThis could be due to:\n• Network connectivity issues\n• API timeout\n• Server overload\n\nPlease try again in a moment.`,
                              isLoading: false
                            } : msg
                        )
                      }));
                      
                      return;
                    }
                  }

                  // 🎯 PRODUCT LAUNCH DETECTION AND SINGLE API CALL
                  if (isProductLaunchRequest(userPrompt) && !isModification) {
                    console.log('🎯 PRODUCT LAUNCH DETECTED: Making single API call');
                    
                    // Detect language for product launch API request
                    const userLanguage = detectLanguage(userPrompt);
                    
                    let finalPrompt = `Create a 10-slide product launch presentation: Cover, Index, Content, Goals, Product Launch Info, New Features (slide 6), New Features (slide 7), Roadmap, Next Steps, Back Cover. ${userPrompt}`;
                    if (userLanguage === 'es') {
                      finalPrompt += `\n\nIMPORTANT: Generate ALL content in Spanish language. All slide titles, text, descriptions, and content must be in Spanish.`;
                    }

                    // Make single API call for Product Launch (10 slides)
                    const response = await fetch('/api/generate', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
                      },
                      body: JSON.stringify({
                        prompt: finalPrompt,
                        language: userLanguage,
                        presentationId: currentPresentationId,
                        workspace: currentWorkspace,
                        fileData: fileData
                      })
                    });

                    if (response.ok) {
                      const result = await response.json();
                      console.log('✅ Product Launch generated successfully');
                      
                      // Update presentation messages and workspace presentations
                      setPresentationMessages(prev => ({
                        ...prev,
                        [currentPresentationId]: [
                          ...prev[currentPresentationId].filter(msg => !msg.isLoading),
                          {
                            id: `assistant-result-${Date.now()}-${Math.random()}`,
                            role: "assistant" as const,
                            text: `Successfully created "${result.title}"\n\nYour 10-slide product launch presentation is ready!`,
                            isLoading: false,
                            presentationData: result,
                            userMessage: userPrompt,
                            version: 1
                          }
                        ]
                      }));
                      
                      setTimeout(() => reloadWorkspacePresentations(), 1000);
                      return;
                    }
                  }

                  // 🎯 CAMPAIGN DETECTION AND SINGLE API CALL
                  if (isCampaignRequest(userPrompt) && !isModification) {
                    console.log('🎯 CAMPAIGN DETECTED: Making single API call');
                    
                    // Detect language for campaign API request
                    const userLanguage = detectLanguage(userPrompt);
                    
                    let finalPrompt = `Create a 9-slide campaign presentation: Cover, Index, Context, Current Metrics, Goals, Strategy, Roadmap, Next Steps, Back Cover. ${userPrompt}`;
                    if (userLanguage === 'es') {
                      finalPrompt += `\n\nIMPORTANT: Generate ALL content in Spanish language. All slide titles, text, descriptions, and content must be in Spanish.`;
                    }

                    // Make single API call for Campaign (9 slides)
                    const response = await fetch('/api/generate', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
                      },
                      body: JSON.stringify({
                        prompt: finalPrompt,
                        language: userLanguage,
                        presentationId: currentPresentationId,
                        workspace: currentWorkspace,
                        fileData: fileData
                      })
                    });

                    if (response.ok) {
                      const result = await response.json();
                      console.log('✅ Campaign generated successfully');
                      
                      // Update presentation messages and workspace presentations
                      setPresentationMessages(prev => ({
                        ...prev,
                        [currentPresentationId]: [
                          ...prev[currentPresentationId].filter(msg => !msg.isLoading),
                          {
                            id: `assistant-result-${Date.now()}-${Math.random()}`,
                            role: "assistant" as const,
                            text: `Successfully created "${result.title}"\n\nYour 9-slide campaign presentation is ready!`,
                            isLoading: false,
                            presentationData: result,
                            userMessage: userPrompt,
                            version: 1
                          }
                        ]
                      }));
                      
                      setTimeout(() => reloadWorkspacePresentations(), 1000);
                      return;
                    }
                  }

                  // 🎯 TOPIC PRESENTATION DETECTION AND SINGLE API CALL
                  if (isTopicPresentationRequest(userPrompt) && !isModification) {
                    console.log('🎯 TOPIC PRESENTATION DETECTED: Making single API call');
                    
                    // Detect language for topic presentation API request
                    const userLanguage = detectLanguage(userPrompt);
                    
                    let finalPrompt = `Create a 9-slide topic presentation: Cover, Index, Quote, Info Topic (slide 4), Info Topic (slide 5), Info Topic (slide 6), Info Topic (slide 7), Info Topic (slide 8), Back Cover. ${userPrompt}`;
                    if (userLanguage === 'es') {
                      finalPrompt += `\n\nIMPORTANT: Generate ALL content in Spanish language. All slide titles, text, descriptions, and content must be in Spanish.`;
                    }

                    // Make single API call for Topic Presentation (9 slides)
                    const response = await fetch('/api/generate', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
                      },
                      body: JSON.stringify({
                        prompt: finalPrompt,
                        language: userLanguage,
                        presentationId: currentPresentationId,
                        workspace: currentWorkspace,
                        fileData: fileData
                      })
                    });

                    if (response.ok) {
                      const result = await response.json();
                      console.log('✅ Topic Presentation generated successfully');
                      
                      // Update presentation messages and workspace presentations
                      setPresentationMessages(prev => ({
                        ...prev,
                        [currentPresentationId]: [
                          ...prev[currentPresentationId].filter(msg => !msg.isLoading),
                          {
                            id: `assistant-result-${Date.now()}-${Math.random()}`,
                            role: "assistant" as const,
                            text: `Successfully created "${result.title}"\n\nYour 9-slide topic presentation is ready!`,
                            isLoading: false,
                            presentationData: result,
                            userMessage: userPrompt,
                            version: 1
                          }
                        ]
                      }));
                      
                      setTimeout(() => reloadWorkspacePresentations(), 1000);
                      return;
                    }
                  }

                  // 🔥 WORD DOCUMENT WITH EXISTING PLAYBOOKS - Map Word content to appropriate playbook
                  if (fileData && (fileData.type === 'word' || fileData.type === 'document') && !isModification) {
                    console.log('📄 WORD DOCUMENT DETECTED - Analyzing content to determine appropriate playbook');
                    
                    // Analyze Word content to determine which existing playbook to use
                    const wordContent = fileData.processedData?.content || '';
                    const lowerContent = wordContent.toLowerCase();
                    
                    let selectedPlaybook = 'topic'; // Default fallback
                    
                    // Determine playbook based on Word document content
                    if (lowerContent.includes('sales') || lowerContent.includes('revenue') || lowerContent.includes('forecast')) {
                      selectedPlaybook = 'report';
                      console.log('📊 Word content suggests SALES REPORT playbook');
                    } else if (lowerContent.includes('investor') || lowerContent.includes('funding') || lowerContent.includes('pitch')) {
                      selectedPlaybook = 'investor';
                      console.log('💰 Word content suggests INVESTOR DECK playbook');
                    } else if (lowerContent.includes('product') && (lowerContent.includes('launch') || lowerContent.includes('feature'))) {
                      selectedPlaybook = 'product-launch';
                      console.log('🚀 Word content suggests PRODUCT LAUNCH playbook');
                    } else if (lowerContent.includes('product') && (lowerContent.includes('overview') || lowerContent.includes('documentation'))) {
                      selectedPlaybook = 'product-dossier';
                      console.log('📋 Word content suggests PRODUCT DOSSIER playbook');
                    } else if (lowerContent.includes('campaign') || lowerContent.includes('marketing') || lowerContent.includes('strategy')) {
                      selectedPlaybook = 'campaign';
                      console.log('📢 Word content suggests CAMPAIGN playbook');
                    } else {
                      console.log('📚 Word content suggests TOPIC PRESENTATION playbook (default)');
                    }
                    
                    // Trigger the appropriate existing playbook
                    console.log(`🎯 Triggering ${selectedPlaybook.toUpperCase()} playbook for Word document`);
                    
                    // Don't modify the chat input - keep it clean for the user
                    // The Word content will be processed server-side via fileData
                    
                    // Let the existing playbook logic handle the rest
                    // Don't return here - let it fall through to existing playbook detection
                  }

                  // 🔥 DEDICATED EXCEL PLAYBOOK - TRIGGERS AUTOMATICALLY WHEN EXCEL DATA IS PRESENT
                  if (fileData && fileData.type === 'excel' && !isModification) {
                    console.log('🎯 EXCEL PLAYBOOK TRIGGERED - Creating 12-slide Excel analysis presentation');
                    
                    try {
                      // Helper function to make Excel report API calls
                      const makeExcelReportCall = async (part: 'first' | 'second') => {
                        const partPrompt = part === 'first' 
                          ? `Create slides 1-6 of an Excel analysis report: Cover_LeftTitleRightBodyUnderlined (Excel Analysis Report), Index_LeftAgendaRightImage (Data Overview), Lists_LeftTextRightImageDescription (Data Context), Impact_ImageMetrics (Key Metrics), Impact_KPIOverview (Performance KPIs), Metrics_FinancialsSplit (Financial Breakdown). Use the attached Excel data for all charts and metrics. ${userPrompt}`
                          : `Create slides 7-12 of an Excel analysis report: Metrics_FullWidthChart (Trend Analysis), Metrics_FinancialsSplit (Distribution Analysis), Metrics_FullWidthChart (Growth Analysis), Lists_LeftTextRightImage (Key Insights), Quote_LeftTextRightImage (Recommendations), BackCover_ThankYouWithImage (Conclusion). Use the attached Excel data for all charts and metrics. ${userPrompt}`;

                        console.log(`📤 Making ${part} Excel report API call with prompt: "${partPrompt}"`);
                        
                        // Get auth headers for credit tracking
                        const { data: { session } } = await supabase.auth.getSession();
                        const headers: Record<string, string> = {
                          'Content-Type': 'application/json',
                        };
                        if (session?.access_token) {
                          headers['Authorization'] = `Bearer ${session.access_token}`;
                        }
                        
                        const response = await fetch('/api/generate', {
                          method: 'POST',
                          headers,
                          body: JSON.stringify({
                            prompt: partPrompt,
                            existingPresentation: undefined,
                            uploadedImages: uploadedImages.length > 0 ? uploadedImages : undefined,
                            fileData: fileData, // Include Excel file data for analysis
                            presentationId: currentPresentationId,
                            workspace: currentWorkspace
                          }),
                        });

                        if (!response.ok) {
                          throw new Error(`Excel report API call failed: ${response.status}`);
                        }

                        return response.json();
                      };

                      // Execute both parts in parallel
                      const [firstPart, secondPart] = await Promise.all([
                        makeExcelReportCall('first'),
                        makeExcelReportCall('second')
                      ]);

                      // Combine the slides from both parts
                      const combinedSlides = [
                        ...(firstPart.slides || []),
                        ...(secondPart.slides || [])
                      ];

                      console.log(`✅ Excel playbook completed: ${combinedSlides.length} slides generated`);

                      // Update presentation state using the message system
                      const newPresentation = {
                        title: firstPart.title || "Excel Data Analysis",
                        slides: combinedSlides
                      };

                      // Replace loading message with success - REMOVE AND ADD NEW
                        setPresentationMessages(prev => {
                          const existingMessages = prev[currentPresentationId] || [];
                          const assistantMessages = existingMessages.filter(msg => msg.role === 'assistant' && !msg.isLoading);
                          const nextVersion = assistantMessages.length + 1;
                          
                          return {
                        ...prev,
                            [currentPresentationId]: [
                              ...existingMessages.filter(msg => !msg.isLoading),
                              {
                                id: `assistant-result-${Date.now()}-${Math.random()}`,
                                role: "assistant" as const,
                            text: `Successfully created "${newPresentation.title}"\n\nPresentation structure:\n${combinedSlides.map((slide: any, index: number) => `${index + 1}. ${slide.blocks.find((block: any) => block.props?.title)?.props?.title || `Slide ${index + 1}`}`).join('\n')}\n\nYour presentation features professional layouts, cohesive visual design, and optimized content hierarchy. Ready for review and presentation.`,
                            isLoading: false,
                                presentationData: newPresentation,
                                userMessage: originalPrompt,  // 🔧 Add user input for version display
                                version: nextVersion
                              }
                            ]
                          };
                        });
                        
                        // 🔧 UPDATE WORKSPACE PRESENTATIONS WITH NEW AI-GENERATED TITLE AND MOVE TO TOP
                        setWorkspacePresentations(prev => {
                          const currentPresentations = prev[currentWorkspace] || [];
                          const updatedPresentation = currentPresentations.find(p => p.id === currentPresentationId);
                          const otherPresentations = currentPresentations.filter(p => p.id !== currentPresentationId);
                          
                          if (updatedPresentation) {
                            // Move the generated presentation to the top of the list
                            return {
                          ...prev,
                              [currentWorkspace]: [
                                { ...updatedPresentation, title: newPresentation.title },
                                ...otherPresentations
                              ]
                            };
                          }
                          return prev;
                        });
                        
                        // 🔧 ENSURE CURRENT PRESENTATION IS TRACKED
                        persistCreatedId(currentPresentationId);
                        
                        // 🔧 RELOAD PRESENTATIONS TO ENSURE UI IS UPDATED
                        setTimeout(() => {
                          reloadWorkspacePresentations();
                        }, 1000);
                      
                      setActiveSlide(0);
                      setChatInput('');
                      
                      return; // Exit early - Excel playbook complete
                      
                    } catch (error) {
                      console.error('❌ Excel playbook failed:', error);
                      // Fall through to regular generation if playbook fails
                    }
                  }

                  // 🚨 DEBUG: Check what's preventing report detection
                  console.log('🔍 DEBUGGING FLOW BEFORE REPORT DETECTION:', {
                    userPrompt: userPrompt,
                    isModification: isModification,
                    isProductDossier: isProductDossierRequest(userPrompt),
                    isInvestorDeck: isInvestorDeckRequest(userPrompt),
                    isTopicPresentation: isTopicPresentationRequest(userPrompt),
                    isProductLaunch: isProductLaunchRequest(userPrompt),
                    isCampaign: isCampaignRequest(userPrompt)
                  });

                  // 🎯 REPORT PLAYBOOK DETECTION AND AUTOMATIC SPLIT
                  console.log('🚨 REACHED REPORT DETECTION SECTION');
                  console.log('🚨 CRITICAL DEBUG - Report Detection:', { 
                    userPrompt: userPrompt,
                    userPromptLower: userPrompt.toLowerCase(),
                    isModification: isModification,
                    isReport: isReportRequest(userPrompt),
                    shouldTriggerSplit: isReportRequest(userPrompt) && !isModification,
                    containsQBR: userPrompt.toLowerCase().includes('qbr'),
                    containsQuarterly: userPrompt.toLowerCase().includes('quarterly'),
                    containsBusinessReview: userPrompt.toLowerCase().includes('business review')
                  });
                  
                  // 🛡️ FORCE SPLIT FOR REPORTS - MANDATORY
                  if (isReportRequest(userPrompt)) {
                    if (isModification) {
                      console.log('⚠️ Report modification detected - allowing single API call');
                    } else {
                      console.log('🎯 REPORT DETECTED: FORCING split logic (MANDATORY)');
                      // ALWAYS use split logic for reports, never single API call
                      // This prevents the broken 6-slide fallback
                    }
                  }
                  
                  // 🎯 SALES REPORT PLAYBOOK - RE-ENABLED FOR 12-SLIDE STRUCTURE
                  console.log('🚨 CRITICAL DEBUG - REPORT DETECTION CHECK:', {
                    userPrompt: userPrompt,
                    isReportRequest: isReportRequest(userPrompt),
                    isModification: isModification,
                    shouldTriggerPlaybook: isReportRequest(userPrompt) && !isModification
                  });
                  
                  if (isReportRequest(userPrompt) && !isModification) {
                    
                    // Detect language for sales report API request - USE CURRENT PROMPT ONLY
                    const userLanguage = detectLanguage(userPrompt); // Use current prompt, not message history
                    
                    // Debug language detection for sales reports
                    console.log('🌐 SALES REPORT LANGUAGE DEBUG:', {
                      userInput: userPrompt, // Log current prompt, not previous message
                      detectedLanguage: userLanguage,
                      isSpanish: userLanguage === 'es'
                    });
                    
                    try {
                      // Helper function to make report API calls
                      const makeReportCall = async (part: 'first' | 'second') => {
                        let partPrompt = part === 'first' 
                          ? `Create slides 1-6 of a report playbook: Cover_LeftTitleRightBodyUnderlined (Business Report), Index_LeftAgendaRightText (Agenda), Lists_LeftTextRightImageDescription (Context), Impact_ImageMetrics (Our Goals), Impact_KPIOverview (KPIs), Metrics_FinancialsSplit (Financial Analysis). ${userPrompt}`
                          : `Create slides 7-12 of a report playbook: Metrics_FullWidthChart (Performance Trends), Metrics_FinancialsSplit (Budget Overview), Metrics_FullWidthChart (Market Analysis), Lists_LeftTextRightImage (Next Steps), Quote_LeftTextRightImage (Mission), BackCover_ThankYouWithImage (Thank You). ${userPrompt}`;

                        // Force Spanish content if user spoke Spanish
                        if (userLanguage === 'es') {
                          partPrompt += `\n\nIMPORTANT: Generate ALL content in Spanish language. All slide titles, text, descriptions, and content must be in Spanish.`;
                        }

                        console.log(`📤 Making ${part} report API call with prompt: "${partPrompt}"`);
                        console.log(`🌐 Language for ${part} report: ${userLanguage}`);
                        
                        // Get auth headers for credit tracking
                        const { data: { session } } = await supabase.auth.getSession();
                        const headers: Record<string, string> = {
                          'Content-Type': 'application/json',
                        };
                        if (session?.access_token) {
                          headers['Authorization'] = `Bearer ${session.access_token}`;
                        }
                        
                        const response = await fetch('/api/generate', {
                          method: 'POST',
                          headers,
                          body: JSON.stringify({
                            prompt: partPrompt,
                            language: userLanguage, // Add language parameter
                            existingPresentation: undefined,
                            uploadedImages: uploadedImages.length > 0 ? uploadedImages : undefined,
                            fileData: fileData, // Include Excel/Word file data for analysis in reports
                            presentationId: currentPresentationId,
                            workspace: currentWorkspace
                          }),
                        });

                        if (!response.ok) {
                          throw new Error(`Sales report ${part} part failed: ${response.statusText}`);
                        }

                        const result = await response.json();
                        console.log(`✅ ${part} sales report part completed with ${result.slides?.length || 0} slides`);
                        console.log(`🔍 ${part} part slide IDs:`, result.slides?.map((s: any) => s.id) || []);
                        console.log(`🔍 ${part} part slide blocks:`, result.slides?.map((s: any) => ({ id: s.id, blockCount: s.blocks?.length || 0 })) || []);
                        return result;
                      };

                      // Make both API calls in parallel
                      const [firstResponse, secondResponse] = await Promise.all([
                        makeReportCall('first'),
                        makeReportCall('second')
                      ]);

                      console.log('✅ Both report parts completed, combining...');
                      console.log('🔍 First response slides:', firstResponse?.slides?.length || 0);
                      console.log('🔍 Second response slides:', secondResponse?.slides?.length || 0);
                      
                      // Combine responses
                      if (!firstResponse?.slides || !secondResponse?.slides) {
                        throw new Error('One or both sales report parts failed to generate slides');
                      }

                      // Filter out any slides with empty blocks before combining
                      const validFirstSlides = firstResponse.slides.filter((slide: any) => slide.blocks && slide.blocks.length > 0);
                      const validSecondSlides = secondResponse.slides.filter((slide: any) => slide.blocks && slide.blocks.length > 0);
                      
                      if (validFirstSlides.length !== firstResponse.slides.length) {
                        console.warn(`⚠️ Filtered out ${firstResponse.slides.length - validFirstSlides.length} slides with empty blocks from first part`);
                      }
                      if (validSecondSlides.length !== secondResponse.slides.length) {
                        console.warn(`⚠️ Filtered out ${secondResponse.slides.length - validSecondSlides.length} slides with empty blocks from second part`);
                      }

                      const combinedData = {
                        title: firstResponse.title || 'Sales Report',
                        slides: [
                          ...validFirstSlides,
                          ...validSecondSlides
                        ]
                      };

                      console.log('✅ SUCCESS: Combined 12-slide report created');
                      
                      // 🛡️ CRITICAL FAILSAFE: Validate slide count for reports
                      if (combinedData.slides.length < 10) {
                        throw new Error(`CRITICAL: Report generated incomplete slides (${combinedData.slides.length}/12). This should NEVER happen.`);
                      }
                      
                      // Replace loading message with success - REMOVE AND ADD NEW
                        setPresentationMessages(prev => {
                          const existingMessages = prev[currentPresentationId] || [];
                          const assistantMessages = existingMessages.filter(msg => msg.role === 'assistant' && !msg.isLoading);
                          const nextVersion = assistantMessages.length + 1;
                          
                          return {
                        ...prev,
                            [currentPresentationId]: [
                              ...existingMessages.filter(msg => !msg.isLoading),
                              {
                                id: `assistant-result-${Date.now()}-${Math.random()}`,
                                role: "assistant" as const,
                            text: `Successfully created "${combinedData.title}"\n\nPresentation structure:\n${combinedData.slides.map((slide: any, i: number) => `${i + 1}. ${slide.title || `Slide ${i + 1}`}`).join('\n')}\n\nYour 12-slide business report features comprehensive performance overview, strategic goals, KPI tracking, 4 detailed chart visualizations, next steps planning, strategic roadmap, and actionable insights. Ready for review and presentation.`,
                            isLoading: false,
                                presentationData: combinedData,
                                userMessage: originalPrompt,  // 🔧 Add user input for version display
                                version: nextVersion
                              }
                            ]
                          };
                        });
                        
                        // 🔧 UPDATE WORKSPACE PRESENTATIONS WITH NEW AI-GENERATED TITLE AND MOVE TO TOP
                        setWorkspacePresentations(prev => {
                          const currentPresentations = prev[currentWorkspace] || [];
                          const updatedPresentation = currentPresentations.find(p => p.id === currentPresentationId);
                          const otherPresentations = currentPresentations.filter(p => p.id !== currentPresentationId);
                          
                          if (updatedPresentation) {
                            // Move the generated presentation to the top of the list
                            return {
                          ...prev,
                              [currentWorkspace]: [
                                { ...updatedPresentation, title: combinedData.title },
                                ...otherPresentations
                              ]
                            };
                          }
                          return prev;
                        });
                        
                        // 🔧 ENSURE CURRENT PRESENTATION IS TRACKED
                        persistCreatedId(currentPresentationId);
                        
                        // 🔧 RELOAD PRESENTATIONS TO ENSURE UI IS UPDATED
                        setTimeout(() => {
                          reloadWorkspacePresentations();
                        }, 1000);
                      
                      // Force immediate re-render
                      setTimeout(() => {
                        console.log('🔄 Forcing re-render after report creation');
                        setActiveSlide(prev => prev);
                      }, 100);
                      
                      return;
                      
                      } catch (reportError: any) {
                      console.error('❌ Report generation failed:', reportError);
                      
                      // Check if it's an API overload error
                      const errorMessage = reportError instanceof Error ? reportError.message : 'Unknown error';
                      const isOverloadError = errorMessage.includes('529') || 
                                            errorMessage.includes('Overloaded') || 
                                            errorMessage.includes('overloaded_error') ||
                                            errorMessage.includes('Report second part failed');
                      
                      if (isOverloadError) {
                        // Show API overload modal instead of error message
                        setShowApiOverloadModal(true);
                        
                        // Clear the loading message
                        setPresentationMessages(prev => ({
                          ...prev,
                          [currentPresentationId]: prev[currentPresentationId].filter(msg => !msg.isLoading)
                        }));
                      } else {
                        // Handle other errors with message
                        const userFriendlyMessage = `❌ Report generation failed: ${errorMessage}\n\nThis could be due to:\n• Network connectivity issues\n• API timeout\n• Server overload\n\nPlease try again in a moment.`;
                        
                        // Update with report specific error
                        setPresentationMessages(prev => ({
                          ...prev,
                          [currentPresentationId]: prev[currentPresentationId].map(msg => 
                            msg.isLoading ? {
                              ...msg,
                              text: userFriendlyMessage,
                              isLoading: false
                            } : msg
                          )
                        }));
                      }
                      
                      return;
                    }
                  }

                  // 🎯 QUOTE LAYOUT TEST - Add Mission slide for testing
                  const includeQuoteLayout = userPrompt.toLowerCase().includes('quote') || 
                                           userPrompt.toLowerCase().includes('mission') ||
                                           userPrompt.toLowerCase().includes('test quote');
                  
                  if (includeQuoteLayout && !isModification) {
                    console.log('🎯 QUOTE LAYOUT TEST: Adding Mission slide with Quote_LeftTextRightImage');
                    
                    // Add loading message for quote test
                    setPresentationMessages(prev => ({
                      ...prev,
                      [currentPresentationId]: [
                        ...prev[currentPresentationId],
                        {
                          id: Date.now().toString(),
                          role: 'assistant',
                          text: 'Creating presentation with Quote layout test...\n\nGenerating 7 slides including a Mission slide with Quote_LeftTextRightImage layout.\n\nThis will test the quote layout rendering.',
                          isLoading: true,
                          timestamp: new Date()
                        }
                      ]
                    }));
                    
                    // Modify the prompt to include Mission slide
                    const modifiedPrompt = `Create a 7-slide presentation: Cover, Index, Problem, Solution, Why Now, Market, Mission (use Quote_LeftTextRightImage layout). ${userPrompt}`;
                    
                    // Use modified prompt for the API call
                  const requestData = { 
                      prompt: modifiedPrompt,
                    existingPresentation: isModification ? effectivePresentationData : undefined,
                    uploadedImages: uploadedImages.length > 0 ? uploadedImages : undefined
                    };
                    
                    // Get auth headers for credit tracking
                    const { data: { session } } = await supabase.auth.getSession();
                    const headers: Record<string, string> = {
                      'Content-Type': 'application/json',
                    };
                    if (session?.access_token) {
                      headers['Authorization'] = `Bearer ${session.access_token}`;
                    }

                    // Add auth data to request
                    (requestData as any).presentationId = currentPresentationId;
                    (requestData as any).workspace = currentWorkspace;
                    
                    // Make the API call with quote layout
                    const response = await fetch('/api/generate', {
                      method: 'POST',
                      headers,
                      body: JSON.stringify(requestData)
                    });
                    
                    if (!response.ok) {
                      throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    
                    const result = await response.json();
                    
                    // Replace loading message with success - REMOVE AND ADD NEW
                    setPresentationMessages(prev => {
                      const existingMessages = prev[currentPresentationId] || [];
                      const assistantMessages = existingMessages.filter(msg => msg.role === 'assistant' && !msg.isLoading);
                      const nextVersion = assistantMessages.length + 1;
                      
                      return {
                      ...prev,
                        [currentPresentationId]: [
                          ...existingMessages.filter(msg => !msg.isLoading),
                          {
                            id: `assistant-result-${Date.now()}-${Math.random()}`,
                            role: "assistant" as const,
                          text: `Successfully created "${result.title}"\n\nPresentation structure:\n${result.slides.map((slide: any, i: number) => `${i + 1}. ${slide.title || `Slide ${i + 1}`}`).join('\n')}\n\nYour presentation includes a Mission slide with Quote_LeftTextRightImage layout for testing.`,
                          isLoading: false,
                            presentationData: result,
                            userMessage: originalPrompt,  // 🔧 Add user input for version display
                            version: nextVersion
                          }
                        ]
                      };
                    });
                    
                    // 🔧 UPDATE WORKSPACE PRESENTATIONS WITH NEW AI-GENERATED TITLE AND MOVE TO TOP
                    setWorkspacePresentations(prev => {
                      const currentPresentations = prev[currentWorkspace] || [];
                      const updatedPresentation = currentPresentations.find(p => p.id === currentPresentationId);
                      const otherPresentations = currentPresentations.filter(p => p.id !== currentPresentationId);
                      
                      if (updatedPresentation) {
                        // Move the generated presentation to the top of the list
                        return {
                      ...prev,
                          [currentWorkspace]: [
                            { ...updatedPresentation, title: result.title },
                            ...otherPresentations
                          ]
                        };
                      }
                      return prev;
                    });
                    
                    // 🔧 ENSURE CURRENT PRESENTATION IS TRACKED
                    persistCreatedId(currentPresentationId);
                    
                    // 🔧 RELOAD PRESENTATIONS TO ENSURE UI IS UPDATED
                    setTimeout(() => {
                      reloadWorkspacePresentations();
                    }, 1000);
                    
                    return;
                  }

                    // 🎯 DEFAULT FALLBACK: Handle modifications OR create Topic Presentation
                    console.log('🎯 REACHED DEFAULT HANDLER:', {
                      isModification: isModification,
                      userPrompt: userPrompt
                    });
                    
                    // Detect language for API request - USE CURRENT PROMPT ONLY, NOT PREVIOUS MESSAGES
                    const userLanguage = detectLanguage(userPrompt); // Use current prompt, not message history
                    
                    // Debug language detection
                    console.log('🌐 LANGUAGE DEBUG:', {
                      userInput: userPrompt, // Log current prompt, not previous message
                      detectedLanguage: userLanguage,
                      isSpanish: userLanguage === 'es'
                    });
                    
                    let finalPrompt;
                    
                    if (isModification) {
                      // 🔧 MODIFICATION: Pass user request directly without forcing structure
                      console.log('🔧 MODIFICATION REQUEST: Passing user prompt directly');
                      finalPrompt = userPrompt;
                      if (userLanguage === 'es') {
                        finalPrompt += `\n\nIMPORTANT: Generate ALL content in Spanish language. All slide titles, text, descriptions, and content must be in Spanish.`;
                      }
                    } else if (finalIntent === 'add_slide') {
                      // 🆕 ADD SLIDE: Pass user request directly without forcing structure
                      console.log('🆕 ADD SLIDE REQUEST: Passing user prompt directly');
                      finalPrompt = userPrompt;
                      if (userLanguage === 'es') {
                        finalPrompt += `\n\nIMPORTANT: Generate ALL content in Spanish language. All slide titles, text, descriptions, and content must be in Spanish.`;
                      }
                    } else {
                      // 🎯 NEW PRESENTATION: Force Topic Presentation structure for unmatched requests
                      console.log('🎯 NO SPECIFIC PLAYBOOK DETECTED: Defaulting to TOPIC PRESENTATION');
                      finalPrompt = `Create a 9-slide topic presentation: Cover, Index, Quote, Info Topic (slide 4), Info Topic (slide 5), Info Topic (slide 6), Info Topic (slide 7), Info Topic (slide 8), Back Cover. ${userPrompt}`;
                      if (userLanguage === 'es') {
                        finalPrompt += `\n\nIMPORTANT: Generate ALL content in Spanish language. All slide titles, text, descriptions, and content must be in Spanish.`;
                      }
                    }
                    
                    const requestData = { 
                      prompt: finalPrompt,
                      language: userLanguage, // Add language information
                      existingPresentation: (isModification || finalIntent === 'add_slide') ? effectivePresentationData : undefined,
                      uploadedImages: uploadedImages.length > 0 ? uploadedImages : undefined,
                    currentSlideIndex: activeSlide,
                    fileData: fileData // Include Excel/Word file data for analysis
                  };
                  
                  console.log('📤 API Request Data:', {
                    prompt: requestData.prompt,
                    hasExistingPresentation: !!requestData.existingPresentation,
                    existingPresentationTitle: requestData.existingPresentation?.title,
                    existingPresentationSlides: requestData.existingPresentation?.slides?.length || 0,
                    uploadedImagesCount: uploadedImages.length,
                    uploadedImageNames: uploadedImages.map(img => img.originalName)
                  });
                  
                  // Call Claude API with timeout
                  console.log('🚀 Making API request to /api/generate');
                  
                  // Create AbortController for timeout
                  const controller = new AbortController();
                  const timeoutId = setTimeout(() => {
                    controller.abort();
                    console.log('⏰ Frontend request timeout after 70 seconds');
                  }, 70000); // 70 second timeout (longer than backend)
                  
                  // 💳 Check if user has at least 1 credit before API call (minimum cost)
                  if (!hasEnoughCredits(1)) {
                    setShowCreditsModal(true);
                    // Update loading message to show insufficient credits
                    setPresentationMessages(prev => ({
                      ...prev,
                      [currentPresentationId]: prev[currentPresentationId].map(msg => 
                        msg.isLoading ? {
                          ...msg,
                          text: 'Insufficient credits to generate content. Please purchase more credits or upgrade your plan.',
                          isLoading: false
                        } : msg
                      )
                    }));
                    return;
                  }

                  // Get auth headers
                  const { data: { session } } = await supabase.auth.getSession();
                  const headers: Record<string, string> = {
                    'Content-Type': 'application/json',
                  };
                  if (session?.access_token) {
                    headers['Authorization'] = `Bearer ${session.access_token}`;
                  }

                  // Add auth data to request
                  (requestData as any).presentationId = currentPresentationId;
                  (requestData as any).workspace = currentWorkspace;

                  const response = await fetch('/api/generate', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(requestData),
                    signal: controller.signal,
                  });
                  
                  clearTimeout(timeoutId);

                  console.log('API response status:', response.status);
                  
                  // Handle insufficient credits error
                  if (response.status === 402) {
                    setShowCreditsModal(true);
                    // Update loading message to show insufficient credits
                    setPresentationMessages(prev => ({
                      ...prev,
                      [currentPresentationId]: prev[currentPresentationId].map(msg => 
                        msg.isLoading ? {
                          ...msg,
                          text: 'Insufficient credits to complete generation. Please purchase more credits or upgrade your plan.',
                          isLoading: false
                        } : msg
                      )
                    }));
                    return;
                  }
                  
                  let data;
                  try {
                    data = await response.json();
                    console.log('API response data:', {
                      success: response.ok,
                      title: data?.title,
                      slideCount: data?.slides?.length,
                      error: data?.error,
                      hasBackgroundBlocks: false
                    });
                  
                  // 🛡️ CRITICAL FAILSAFE: Validate report slide count
                  if (isReportRequest(userPrompt) && !isModification && data?.slides) {
                    if (data.slides.length < 10) {
                      console.error('🚨 CRITICAL ERROR: Report generated incomplete slides via single API call!');
                      console.error('🚨 This should NEVER happen - split logic should have been used');
                      throw new Error(`CRITICAL: Report generated only ${data.slides.length} slides instead of 12. Split logic failed to trigger.`);
                    }
                  }
                  } catch (jsonError) {
                    console.error('Failed to parse API response as JSON:', jsonError);
                    throw new Error(`Failed to parse server response: ${jsonError instanceof Error ? jsonError.message : 'Invalid JSON'}`);
                  }

                  console.log('🚨 Response status check:', { ok: response.ok, status: response.status, dataType: data?.type });
                  console.log('🚨 Full API response data:', data);

                  if (response.ok) {
                    console.log('🎉 SUCCESS: API call successful, processing response...');
                    console.log('🔍 API SUCCESS DEBUG: About to check response type and structure');
                    
                    // Check if this is an informational response
                    if (data.type === 'informational') {
                      console.log('Received informational response:', data.response);
                      
                      // Replace loading message with success - REMOVE AND ADD NEW
                      setPresentationMessages(prev => {
                        const existingMessages = prev[currentPresentationId] || [];
                        const assistantMessages = existingMessages.filter(msg => msg.role === 'assistant' && !msg.isLoading);
                        const nextVersion = assistantMessages.length + 1;
                        
                        return {
                        ...prev,
                          [currentPresentationId]: [
                            ...existingMessages.filter(msg => !msg.isLoading),
                            {
                              id: `assistant-result-${Date.now()}-${Math.random()}`,
                              role: "assistant" as const,
                            text: `${data.response}`,
                            isLoading: false,
                              presentationData: null, // No presentation data for informational responses
                              version: nextVersion
                            }
                          ]
                        };
                      });
                      
                      return; // Exit early for informational responses
                    }
                    
                    // Handle both full presentation and single slide modification responses
                    console.log('🔍 RESPONSE STRUCTURE DEBUG:', {
                      hasId: !!data.id,
                      hasBlocks: !!data.blocks,
                      hasTitle: !!data.title,
                      hasSlides: Array.isArray(data.slides),
                      slideCount: Array.isArray(data.slides) ? data.slides.length : 0,
                      responseType: data.id && data.blocks ? 'direct-slide' : 
                                   !data.title && Array.isArray(data.slides) ? 'wrapped-slides' : 
                                   'full-presentation'
                    });
                    
                    if (data.id && data.blocks) {
                      // Single slide modification response (direct slide object)
                      console.log('🔄 Processing single slide modification (direct):', {
                        slideId: data.id,
                        blockCount: data.blocks.length
                      });
                      
                      // Update the existing presentation with the modified slide
                      if (effectivePresentationData) {
                        // Add a timestamp to force re-render even if content is similar
                        const slideWithTimestamp = {
                          ...data,
                          _lastModified: Date.now()
                        };
                        
                        const updatedPresentation = {
                          ...effectivePresentationData,
                          slides: effectivePresentationData.slides.map((slide: any) => 
                            slide.id === data.id ? slideWithTimestamp : slide
                          )
                        };
                        
                        console.log('🎉 SUCCESS: Single slide modification completed');
                        console.log('🔍 DIRECT SUCCESS DEBUG: About to replace loading message with success');
                        
                        // Replace loading message with success - REMOVE AND ADD NEW
                        setPresentationMessages(prev => {
                          const existingMessages = prev[currentPresentationId] || [];
                          const assistantMessages = existingMessages.filter(msg => msg.role === 'assistant' && !msg.isLoading);
                          const nextVersion = assistantMessages.length + 1;
                          
                          return {
                          ...prev,
                            [currentPresentationId]: [
                              ...existingMessages.filter(msg => !msg.isLoading),
                              {
                                id: `assistant-result-${Date.now()}-${Math.random()}`,
                                role: "assistant" as const,
                                text: `Successfully updated slide "${data.id}". Chart color changed to green.`,
                              isLoading: false,
                                presentationData: updatedPresentation,
                                userMessage: originalPrompt,
                                version: nextVersion
                              }
                            ]
                          };
                        });
                        console.log('🔍 DIRECT SUCCESS DEBUG: Success message replacement completed');
                        
                        return; // Exit early for single slide modifications
                      } else {
                        throw new Error('Cannot modify slide: No existing presentation found');
                      }
                    } else if (!data.title && Array.isArray(data.slides) && data.slides.length > 0) {
                      // Single slide modification or add new slide response (wrapped in slides array)
                      console.log('🔄 Processing single slide modification/addition (wrapped):', {
                        slideCount: data.slides.length,
                        firstSlideId: data.slides[0]?.id,
                        intent: finalIntent
                      });
                      console.log('🔍 WRAPPED SLIDES DEBUG: About to process wrapped slides response');
                      
                      // Update the existing presentation with the modified/added slide(s)
                      if (effectivePresentationData) {
                        let updatedPresentation = { ...effectivePresentationData };
                        
                        // Handle add new slide vs modify existing slide
                        if (finalIntent === 'add_slide') {
                          console.log('🆕 Adding new slide(s) to presentation');
                          // Add new slides to the end of the presentation
                          data.slides.forEach((newSlide: any) => {
                            const slideWithTimestamp = {
                              ...newSlide,
                              _lastModified: Date.now()
                            };
                            
                            // Check if slide already exists (shouldn't happen for add_slide)
                            const existingSlideIndex = updatedPresentation.slides.findIndex((slide: any) => slide.id === newSlide.id);
                            if (existingSlideIndex === -1) {
                              // Add new slide to the end
                              updatedPresentation.slides.push(slideWithTimestamp);
                              console.log(`✅ Added new slide: ${newSlide.id}`);
                            } else {
                              console.warn(`⚠️ Slide ${newSlide.id} already exists, replacing instead of adding`);
                              updatedPresentation.slides[existingSlideIndex] = slideWithTimestamp;
                            }
                          });
                        } else {
                          console.log('🔄 Modifying existing slide(s)');
                          // Update each modified slide (existing behavior)
                          data.slides.forEach((modifiedSlide: any) => {
                            // Add a timestamp to force re-render even if content is similar
                            const slideWithTimestamp = {
                              ...modifiedSlide,
                              _lastModified: Date.now()
                            };
                            
                            updatedPresentation.slides = updatedPresentation.slides.map((slide: any) => 
                              slide.id === modifiedSlide.id ? slideWithTimestamp : slide
                            );
                          });
                        }

                        // Handle slide deletions if present in the response
                        if (data.deletedSlides && Array.isArray(data.deletedSlides) && data.deletedSlides.length > 0) {
                          console.log('🗑️ Processing slide deletions:', data.deletedSlides);
                          data.deletedSlides.forEach((deletedSlideId: string) => {
                            const slideIndex = updatedPresentation.slides.findIndex((slide: any) => slide.id === deletedSlideId);
                            if (slideIndex !== -1) {
                              updatedPresentation.slides.splice(slideIndex, 1);
                              console.log(`✅ Deleted slide: ${deletedSlideId}`);
                            } else {
                              console.warn(`⚠️ Slide ${deletedSlideId} not found for deletion`);
                            }
                          });
                        }
                        
                        console.log('🎉 SUCCESS: Single slide operation completed');
                        console.log('📊 Updated presentation now has', updatedPresentation.slides.length, 'slides');
                        console.log('🔍 WRAPPED SUCCESS DEBUG: About to replace loading message with success');
                        
                        // Replace loading message with success - REMOVE AND ADD NEW
                        setPresentationMessages(prev => {
                          const existingMessages = prev[currentPresentationId] || [];
                          const assistantMessages = existingMessages.filter(msg => msg.role === 'assistant' && !msg.isLoading);
                          const nextVersion = assistantMessages.length + 1;
                          
                          return {
                          ...prev,
                            [currentPresentationId]: [
                              ...existingMessages.filter(msg => !msg.isLoading),
                              {
                                id: `assistant-result-${Date.now()}-${Math.random()}`,
                                role: "assistant" as const,
                                text: `Successfully updated ${data.slides.length} slide(s). Changes applied to presentation.`,
                              isLoading: false,
                                presentationData: updatedPresentation,
                                userMessage: originalPrompt,
                                version: nextVersion
                              }
                            ]
                          };
                        });
                        console.log('🔍 WRAPPED SUCCESS DEBUG: Success message replacement completed');
                        
                        return; // Exit early for single slide operations
                      } else {
                        throw new Error('Cannot modify slide: No existing presentation found');
                      }
                    } else if (!data.title && (!Array.isArray(data.slides) || data.slides.length === 0)) {
                      // Invalid response structure - must have either title+slides (full presentation) or slides array (single slide mod)
                      console.error('❌ INVALID RESPONSE STRUCTURE:', data);
                      console.error('❌ Expected: title+slides OR slides array with length > 0');
                      throw new Error('Invalid presentation data received from server');
                    }
                    
                    console.log('✅ VALIDATION PASSED: Response structure is valid, proceeding to success handler');

                    console.log('🎉 SUCCESS HANDLER REACHED! Successfully received presentation data:', {
                      title: data.title,
                      slideCount: data.slides.length,
                      backgroundBlocks: []
                    });

                    // Create detailed change summary
                    const createChangeDescription = (data: any, userPrompt: string) => {
                      let changeDesc = '';
                      
                      // Analyze what changed
                      if (userPrompt.toLowerCase().includes('color')) {
                        changeDesc = `🎨 Color Changes Applied Based On: "${userPrompt}"`;
                      } else {
                        changeDesc = `✏️ Changes Applied Based On: "${userPrompt}"`;
                      }
                      
                      return changeDesc;
                    };

                    // 🔧 CLEAN CHAT: Skip adding success messages to keep chat clean
                    // Instead of showing chat messages, just update presentation data directly
                    console.log('🎉 SUCCESS: Presentation generated, updating slides directly without chat messages');
                      
                      console.log('🎯 About to store presentation data:', {
                        currentPresentationId,
                        hasData: !!data,
                        dataTitle: data?.title,
                        slideCount: data?.slides?.length
                      });
                      
                      // Force immediate re-render by triggering a state change
                        setTimeout(() => {
                        console.log('🔄 Forcing re-render after presentation data update');
                          // Trigger a re-render after state update
                          setActiveSlide(prev => prev);
                          // 💳 Refresh credits after successful generation
                          console.log('🔄 Refreshing credits after successful generation...');
                        refreshCredits().then(() => {
                          console.log('✅ Credits refreshed, new balance should be visible');
                        }).catch(err => {
                          console.error('❌ Failed to refresh credits:', err);
                        });
                      }, 100);
                      
                  } else {
                    // 🔧 RESTORE ERROR MESSAGES: Show HTTP error in chat
                    const errorMessage = data?.error || data?.message || `HTTP ${response.status}: ${response.statusText}`;
                    // Replace loading message with error - REMOVE AND ADD NEW
                    setPresentationMessages(prev => ({
                      ...prev,
                      [currentPresentationId]: [
                        ...prev[currentPresentationId].filter(msg => !msg.isLoading),
                        {
                          id: `assistant-error-${Date.now()}-${Math.random()}`,
                          role: "assistant" as const,
                          text: `Error: ${errorMessage}`,
                          isLoading: false
                        }
                      ]
                    }));
                  }
                } catch (error) {
                  // Update with network error
                  
                  let errorMessage = 'Unknown error occurred';
                  if (error instanceof Error) {
                    // Handle specific error types
                    if (error.name === 'AbortError') {
                      errorMessage = 'Request timed out. The AI is taking longer than expected. Please try again with a simpler request.';
                    } else if (error.message?.includes('timeout')) {
                      errorMessage = 'Request timed out. Please try again in a moment.';
                    } else {
                    errorMessage = error.message;
                    }
                  } else if (typeof error === 'string') {
                    errorMessage = error;
                  }
                  
                  // Check if it's an API overload error (529)
                  const isOverloadError = errorMessage.includes('529') || 
                                        errorMessage.includes('Overloaded') || 
                                        errorMessage.includes('overloaded_error');
                  
                  if (isOverloadError) {
                    // Show API overload modal
                    setShowApiOverloadModal(true);
                  } else {
                    // Replace loading message with error - REMOVE AND ADD NEW
                  setPresentationMessages(prev => ({
                    ...prev,
                    [currentPresentationId]: [
                      ...prev[currentPresentationId].filter(msg => !msg.isLoading),
                      {
                        id: `assistant-error-${Date.now()}-${Math.random()}`,
                        role: "assistant" as const,
                        text: `Error: ${errorMessage}`,
                        isLoading: false
                      }
                    ]
                  }));
                  }
                }
              } else if (attachedFiles.length > 0) {
                setShowInputError(true);
                setTimeout(() => setShowInputError(false), 2000);
              }
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
              multiple
              onChange={async (e) => {
                const files = Array.from(e.target.files || []);
                
                for (const file of files) {
                  if (file.type.startsWith('image/')) {
                    // Handle image upload
                    const tempFile = {
                      url: URL.createObjectURL(file),
                      type: file.type,
                      name: file.name,
                      isUploaded: true,
                      uploadStatus: 'uploading' as const
                    };
                    
                    setAttachedFiles(prev => [...prev, tempFile]);
                    
                    try {
                      // Upload to server
                      const formData = new FormData();
                      formData.append('file', file);
                      
                      const response = await fetch('/api/upload', {
                        method: 'POST',
                        body: formData
                      });
                      
                      if (response.ok) {
                        const result = await response.json();
                        
                        // Update the file with server response
                        setAttachedFiles(prev => prev.map(f => 
                          f.url === tempFile.url ? {
                            ...f,
                            uploadStatus: 'completed' as const,
                            serverUrl: result.url,
                            suggestedVariant: result.suggestedVariant
                          } : f
                        ));
                      } else {
                        const error = await response.json();
                        const errorMessage = error.error || `Upload failed (${response.status})`;
                        
                        console.error('Server upload error:', {
                          status: response.status,
                          statusText: response.statusText,
                          error: error
                        });
                        
                        // Show server error with alert for debugging
                        alert(`Server Error: ${errorMessage}\nStatus: ${response.status}\nCheck browser console for details.`);
                        
                        setAttachedFiles(prev => prev.map(f => 
                          f.url === tempFile.url ? {
                            ...f,
                            uploadStatus: 'error' as const,
                            uploadError: errorMessage
                          } : f
                        ));
                      }
                    } catch (error) {
                      console.error('Upload error:', error);
                      
                      // More detailed error logging
                      let errorMessage = 'Network error';
                      if (error instanceof Error) {
                        errorMessage = error.message;
                        console.error('Error details:', {
                          name: error.name,
                          message: error.message,
                          stack: error.stack
                        });
                      }
                      
                      // Show error in UI with alert for debugging
                      alert(`Upload Error: ${errorMessage}\nCheck browser console for details.`);
                      
                      setAttachedFiles(prev => prev.map(f => 
                        f.url === tempFile.url ? {
                          ...f,
                          uploadStatus: 'error' as const,
                          uploadError: errorMessage
                        } : f
                      ));
                    }
                  } else {
                    // Handle non-image files (existing behavior)
                    const newFile = { url: URL.createObjectURL(file), type: file.type, name: file.name };
                    setAttachedFiles(prev => [...prev, newFile]);
                  }
                }
                
                // Clear the input
                e.target.value = '';
              }}
            />
            <div className="bg-white flex flex-col">
              {attachedFiles.length > 0 && (
                <div className="flex items-center gap-2 px-4 pt-4 flex-wrap">
                  {attachedFiles.map((file, idx) => (
                    file.type.startsWith('image/') ? (
                      <div key={file.url} className="relative group w-20 h-20 bg-[#2a2a2a] rounded-md flex flex-col items-center justify-center overflow-hidden border border-gray-200">
                        <div className="relative w-full h-full">
                          <img src={file.url} alt="Attachment" className="w-full h-full object-cover" />
                          
                          {/* Upload status overlay */}
                          {file.isUploaded && file.uploadStatus === 'uploading' && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            </div>
                          )}
                          
                          {file.isUploaded && file.uploadStatus === 'error' && (
                            <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className="text-red-400">
                                <path d="M10 6V10M10 14H10.01M19 10C19 14.9706 14.9706 19 10 19C5.02944 19 1 14.9706 1 10C1 5.02944 5.02944 1 10 1C14.9706 1 19 5.02944 19 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                          )}
                          

                        </div>
                        

                        
                        <button
                          type="button"
                          className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center bg-[#002903] rounded-full text-gray-500 hover:text-gray-900 hover:bg-[#ef4444] transition opacity-0 group-hover:opacity-100"
                          onClick={() => setAttachedFiles(prev => prev.filter((_, i) => i !== idx))}
                          aria-label="Remove attachment"
                        >
                          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <line x1="5.5" y1="5.5" x2="14.5" y2="14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            <line x1="14.5" y1="5.5" x2="5.5" y2="14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                        </button>
                        
                        {/* Error tooltip */}
                        {file.uploadError && (
                          <div className="absolute -top-8 left-0 right-0 bg-red-600 text-gray-900 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            {file.uploadError}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div key={file.url} className="relative group w-16 h-16 bg-[#2a2a2a] rounded-md flex flex-col items-center justify-center border border-gray-200">
                        {file.name.toLowerCase().endsWith('.pdf') && (
                          <img src="/pdf-icon.png" alt="PDF Icon" className="w-8 h-8 mb-1 object-contain" />
                        )}
                        {file.name.toLowerCase().endsWith('.doc') || file.name.toLowerCase().endsWith('.docx') ? (
                          <img src="/doc-icon.png" alt="DOC Icon" className="w-8 h-8 mb-1 object-contain" />
                        ) : null}
                        {file.name.toLowerCase().endsWith('.xls') || file.name.toLowerCase().endsWith('.xlsx') ? (
                          <img src="/xls-icon.png" alt="XLS Icon" className="w-8 h-8 mb-1 object-contain" />
                        ) : null}
                        <span className="text-xs text-gray-500 truncate w-14 text-center">{file.name}</span>
                        <button
                          type="button"
                          className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center bg-[#002903] rounded-full text-gray-500 hover:text-gray-900 hover:bg-[#ef4444] transition opacity-0 group-hover:opacity-100"
                          onClick={() => setAttachedFiles(prev => prev.filter((_, i) => i !== idx))}
                          aria-label="Remove attachment"
                        >
                          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <line x1="5.5" y1="5.5" x2="14.5" y2="14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            <line x1="14.5" y1="5.5" x2="5.5" y2="14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                        </button>
                      </div>
                    )
                  ))}
                </div>
              )}
              <div className="bg-[#f3f3f5] rounded-lg">
              <textarea
                ref={textareaRef}
                rows={1}
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onFocus={() => setSidebarCollapsed(true)}
                onClick={() => setSidebarCollapsed(true)}
                onKeyDown={e => {
                  // Close sidebar when user starts typing
                  setSidebarCollapsed(true);
                  
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    const form = e.currentTarget.form;
                    if (form) {
                      form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                    }
                  }
                }}
                  className={`bg-transparent outline-none border-none ${chatInput ? 'text-[#002903]' : 'text-gray-500'} text-base placeholder-[#717182] px-4 pt-5 pb-16 w-full focus:text-[#002903] focus:outline-none focus:ring-0 focus:border-none resize-none overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100`}
                placeholder="Ask what you want"
                style={{ minHeight: '56px', maxHeight: '180px' }}
              />
              
                <div className="flex items-center justify-end px-4 py-2">
                <button type="submit" className={`rounded-full w-8 h-8 flex items-center justify-center transition ${chatInput ? 'bg-[#002903] text-white' : 'bg-gray-200 text-gray-500 hover:bg-[#002903] hover:text-white'}`} disabled={!chatInput.trim()}><svg width="18" height="18" fill="none" viewBox="0 0 20 20"><path d="M10 15V5M10 5l-5 5m5-5l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
                </div>
              </div>
            </div>
          </form>
          {/* Render the error popup above the input box */}
          {showInputError && (
            <div className="w-full flex justify-center mb-2">
              <div className="bg-red-600 text-gray-900 text-sm rounded-lg px-4 py-2 shadow-lg">You need to write</div>
            </div>
          )}
        </section>
        )}
        {/* Onboarding Flow - Replace main content area */}
        {showOnboarding ? (
          <section className={`flex-1 flex flex-col items-center ${onboardingStep === 3 && selectedSlideCount ? 'justify-start' : 'justify-center'} bg-[#f9fafb] h-full p-8`}>
            {onboardingStep === 1 && (
              <div className="relative w-full max-w-md">
                <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-12 shadow-xl border border-gray-100 min-h-[300px] sm:min-h-[350px] lg:min-h-[400px] flex flex-col items-center justify-center relative">
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
                    {isUploading || isAnalyzing ? (
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#002903] mx-auto mb-2"></div>
                        <p className="text-sm text-[#002903]">
                          {isUploading ? 'Uploading file...' : 'Analyzing data...'}
                        </p>
                      </div>
                    ) : (
                    <p className="text-center mb-2 sm:mb-3 text-xs sm:text-sm" style={{ color: '#002903' }}>
                      Drag and drop your files here, or{' '}
                  <button 
                        className="text-blue-500 hover:underline"
                        onClick={() => {
                          // Trigger file input click
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.multiple = true;
                          input.accept = '.xlsx,.xls,.csv,.docx,.doc,.pdf';
                      input.onchange = (e) => {
                        const files = Array.from((e.target as HTMLInputElement).files || []);
                        console.log('Files selected:', files);
                        if (files.length > 0) {
                                // Handle file upload with comprehensive analysis
                                handleFileUpload(files[0]);
                        }
                      };
                          input.click();
                        }}
                      >
                        click to select
                      </button>.
                    </p>
                        )}
                        
                        {uploadError && (
                          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600 text-center">{uploadError}</p>
                            {uploadError.includes('taking longer than expected') && (
                              <div className="mt-2 text-xs text-gray-600 text-center">
                                <p>Try reducing your dataset size or simplifying your prompt.</p>
                                <button 
                                  onClick={() => setUploadError('')}
                                  className="mt-1 text-blue-600 hover:underline"
                                >
                                  Try Again
                                </button>
                </div>
                            )}
                          </div>
                        )}
                    
                    <p className="text-xs text-center mt-2" style={{ color: '#002903' }}>Support formats: .xlsx, .xsl, .csv</p>
                </div>
              </div>
            </div>
            )}

            {onboardingStep === 2 && (
              <div className="max-w-2xl w-full relative">
                {/* Back Button */}
                <button
                  onClick={() => setOnboardingStep(1)}
                  className="absolute top-0 left-0 p-2 text-[#002903] hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Go back"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m15 18-6-6 6-6"/>
                  </svg>
                </button>
                
                {/* Title */}
                <h2 className="text-xl font-normal text-[#002903] mb-8 text-center">Describe what your presentation will be about</h2>

                {/* Text Area with Send Button */}
                <div className="mb-8 relative">
                  <textarea
                    className="w-full h-40 p-4 pr-16 bg-[#f3f4f6] border-none rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#002903] focus:border-transparent placeholder-[#717182] text-[#002903]"
                    placeholder="Enter your description here..."
                    style={{ fontSize: '16px' }}
                    value={presentationPrompt}
                    onChange={(e) => setPresentationPrompt(e.target.value)}
                  />
                  {/* Send Button */}
                  <button 
                    className="absolute bottom-4 right-4 w-8 h-8 bg-[#002903] hover:bg-[#002903]/90 rounded-full flex items-center justify-center transition disabled:opacity-50"
                    onClick={handlePresentationPromptAnalysis}
                    disabled={!presentationPrompt.trim() || isAnalyzingPrompt}
                  >
                    {isAnalyzingPrompt ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
                      <path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    )}
                  </button>
                </div>
                
                {uploadError && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600 text-center">{uploadError}</p>
                  </div>
                )}
            </div>
            )}

            {onboardingStep === 3 && !selectedSlideCount && (
              <div className="max-w-2xl w-full relative">
                {/* Back Button */}
                <button
                  onClick={() => setOnboardingStep(2)}
                  className="absolute top-0 left-0 p-2 text-[#002903] hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Go back"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m15 18-6-6 6-6"/>
                  </svg>
                </button>
                
                {/* Title */}
                <h2 className="text-xl font-normal text-[#002903] mb-8 text-center">¿How many slides do you want?</h2>

                {/* Slide Count Selection Buttons */}
                <div className="flex flex-wrap justify-center gap-4">
                  {['Less than 5', '6-10', '11-15', '16-20', 'More than 20'].map((option) => (
                    <button 
                      key={option}
                      className="px-6 py-3 bg-white border-2 border-gray-200 rounded-full text-gray-700 hover:border-[#002903] hover:text-[#002903] font-medium transition"
                      onClick={async () => {
                        // Set slide count and immediately start generation
                        setSelectedSlideCount(option);
                        
                        // Validate all required fields
                        if (!uploadResult || !presentationPrompt.trim()) {
                          console.error('❌ Missing required fields:', {
                            hasUploadResult: !!uploadResult,
                            presentationPrompt: presentationPrompt.trim()
                          });
                          setUploadError('Please ensure all fields are filled: file uploaded and description provided.');
                          return;
                        }

                        // Convert slide count text to number
                        const slideCountNum = getSlideCountNumber(option);
                        
                        if (slideCountNum < 1) {
                          console.error('❌ Invalid slide count:', option);
                          setUploadError('Please select a valid slide count.');
                          return;
                        }

                        setIsLoading(true);
                        setUploadError('');

                        // Calculate batches (10 slides per batch)
                        const SLIDES_PER_BATCH = 10;
                        const totalBatches = Math.ceil(slideCountNum / SLIDES_PER_BATCH);

                        console.log(`📊 Starting generation: ${slideCountNum} slides in ${totalBatches} batch(es)`);

                        let allSlides: any[] = [];
                        let allMessages: any[] = [];

                        try {
                          for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
                            const startSlide = batchIndex * SLIDES_PER_BATCH + 1;
                            const endSlide = Math.min((batchIndex + 1) * SLIDES_PER_BATCH, slideCountNum);
                            const slidesInBatch = endSlide - startSlide + 1;

                            console.log(`📦 Batch ${batchIndex + 1}/${totalBatches}: Generating slides ${startSlide}-${endSlide}`);
                            
                            // Update batch progress
                            setBatchProgress({
                              current: batchIndex + 1,
                              total: totalBatches,
                              slideRange: `${startSlide}-${endSlide}`
                            });

                            // Step 1: Start analyzing content
                            setLoadingStep(1);

                            let batchMessages: any[] = [];
                            if (batchIndex === 0) {
                              batchMessages = [
                                { role: 'user', text: presentationPrompt },
                                { role: 'assistant', text: 'Creating presentation...', isLoading: true }
                              ];
                            }

                            // Step 2: Generate slides for this batch
                            setLoadingStep(2);
                            
                            const requestBody = {
                              uploadResult: uploadResult,
                              presentationPrompt: presentationPrompt,
                              slideCount: slidesInBatch,
                              batchNumber: batchIndex + 1,
                              totalBatches: totalBatches,
                              slideStart: startSlide,
                              slideEnd: endSlide,
                              comprehensiveAnalysis: comprehensiveAnalysis
                            };

                            console.log(`🤖 Sending batch ${batchIndex + 1} to API...`);
                            
                            const response = await fetch('/api/generate-excel-presentation', {
                              method: 'POST',
                              headers: { 
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token || ''}`
                              },
                              body: JSON.stringify(requestBody)
                            });

                            if (!response.ok) {
                              const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                              throw new Error(errorData.error || `Failed to generate presentation (batch ${batchIndex + 1})`);
                            }

                            const data = await response.json();
                            console.log(`✅ Batch ${batchIndex + 1} response:`, data);

                            if (data.presentation) {
                              // Append slides from this batch
                              allSlides = [...allSlides, ...data.presentation.slides];
                              console.log(`📚 Total slides so far: ${allSlides.length}`);
                              
                              // For first batch, set up messages
                              if (batchIndex === 0) {
                                batchMessages = [
                                  { role: 'user', text: presentationPrompt },
                                  {
                                    role: 'assistant',
                                    text: `Successfully created "${data.presentation.title}"`,
                                    isLoading: false,
                                    presentationData: data.presentation
                                  }
                                ];
                                allMessages = batchMessages;
                              }
                            } else {
                              throw new Error(`No presentation data in batch ${batchIndex + 1} response`);
                            }
                          }

                          // Step 3: Apply design (all batches complete)
                          setLoadingStep(3);
                          await new Promise(resolve => setTimeout(resolve, 500));

                          // After all batches complete, create final presentation with all slides
                          const finalPresentation = {
                            title: uploadedFiles[0]?.name?.replace(/\.[^/.]+$/, '') || 'Data Analysis',
                            slides: allSlides
                          };

                          console.log('🎉 All batches complete! Final presentation:', {
                            totalSlides: finalPresentation.slides.length,
                            batches: Math.ceil(slideCountNum / 10)
                          });

                          // Set the presentation data with all messages
                          setPresentationMessages(prev => ({
                            ...prev,
                            [currentPresentationId]: [
                              { role: 'user', text: presentationPrompt },
                              {
                                role: 'assistant',
                                text: `Successfully created "${finalPresentation.title}" with ${finalPresentation.slides.length} slides`,
                                isLoading: false,
                                presentationData: finalPresentation
                              }
                            ]
                          }));

                          setShowOnboarding(false);
                          setIsLoading(false);
                          setActiveSlide(0);

                        } catch (error: any) {
                          console.error('❌ Error during batch generation:', error);
                          setUploadError(error.message || 'Failed to generate presentation');
                          setIsLoading(false);
                          setLoadingStep(1);
                          setBatchProgress({ current: 1, total: 1, slideRange: '' });
                        }
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {onboardingStep === 3 && selectedSlideCount && isLoading && (
              <div className="w-full h-full flex flex-col items-center justify-center">
                {/* Multi-Step Loading State */}
                <div className="flex flex-col items-start gap-6 w-full max-w-md mx-auto py-8">
                    {/* Loading Step 1 - Analyzing content */}
                    <div className="flex items-center gap-4 w-full">
                      {loadingStep > 1 ? (
                        <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 bg-green-100 rounded-full">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                        </div>
                      ) : (
                        <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 relative">
                          <div className="absolute inset-0 rounded-full border-2 border-gray-200"></div>
                          <div className="absolute inset-0 rounded-full border-2 border-[#002903] border-t-transparent animate-spin"></div>
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-base font-medium text-gray-900">Analyzing content</h3>
                        <p className="text-sm text-gray-500">Processing your data and requirements</p>
                      </div>
                    </div>

                    {/* Loading Step 2 - Generating slides */}
                    <div className={`flex items-center gap-4 w-full ${loadingStep < 2 ? 'opacity-50' : ''}`}>
                      {loadingStep > 2 ? (
                        <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 bg-green-100 rounded-full">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                        </div>
                      ) : loadingStep === 2 ? (
                        <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 relative">
                          <div className="absolute inset-0 rounded-full border-2 border-gray-200"></div>
                          <div className="absolute inset-0 rounded-full border-2 border-[#002903] border-t-transparent animate-spin"></div>
                        </div>
                      ) : (
                        <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 bg-gray-100 rounded-full">
                          <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className={`text-base font-medium ${loadingStep < 2 ? 'text-gray-400' : 'text-gray-900'}`}>Generating slides...</h3>
                        <p className={`text-sm ${loadingStep < 2 ? 'text-gray-400' : 'text-gray-500'}`}>
                          {batchProgress.total > 1 ? (
                            `Batch ${batchProgress.current}/${batchProgress.total}: Slides ${batchProgress.slideRange}`
                          ) : (
                            'Creating your presentation structure'
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Loading Step 3 - Applying design */}
                    <div className={`flex items-center gap-4 w-full ${loadingStep < 3 ? 'opacity-50' : ''}`}>
                      {loadingStep === 3 ? (
                        <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 relative">
                          <div className="absolute inset-0 rounded-full border-2 border-gray-200"></div>
                          <div className="absolute inset-0 rounded-full border-2 border-[#002903] border-t-transparent animate-spin"></div>
                        </div>
                      ) : (
                        <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 bg-gray-100 rounded-full">
                          <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className={`text-base font-medium ${loadingStep < 3 ? 'text-gray-400' : 'text-gray-900'}`}>Applying design</h3>
                        <p className={`text-sm ${loadingStep < 3 ? 'text-gray-400' : 'text-gray-500'}`}>Styling your slides</p>
                      </div>
                    </div>

                    {/* Error Display */}
                    {uploadError && (
                      <div className="w-full mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600 text-center">{uploadError}</p>
                        {uploadError.includes('timeout') && (
                          <>
                            <p className="text-xs text-red-500 text-center mt-2">
                              Try reducing your dataset size or simplifying your prompt.
                            </p>
                            <button 
                              className="mt-3 w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                              onClick={() => {
                                setIsLoading(false);
                                setUploadError('');
                              }}
                            >
                              Try Again
                            </button>
                          </>
                        )}
                      </div>
                    )}
                </div>
              </div>
            )}
          </section>
        ) : (
          /* Normal Slide preview column */
          <section className="flex-1 flex flex-col h-full bg-white">
          {/* Top bar */}
          <div className="bg-[#F9FAFB] border-b border-gray-200 px-8 py-4 flex justify-end">
            <div className="flex gap-3">
              {/* Edit in... button - Hidden for now, will be implemented in future */}
              <button className="hidden flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium text-sm transition border border-gray-200" onClick={() => {
                // TODO: Implement edit in external apps functionality
                console.log('Edit in external apps clicked');
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gray-600">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Edit in...</span>
                <div className="flex items-center gap-1 ml-1">
                  {/* Google Slides icon */}
                  <img src="/google-slide.png" alt="Google Slides" className="w-5 h-5 object-contain" />
                  {/* PowerPoint icon */}
                  <img src="/power-point.png" alt="PowerPoint" className="w-5 h-5 object-contain" />
                </div>
              </button>
              <button className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium text-sm transition border border-gray-200" onClick={() => {
                // Check if user has Pro plan for Preview feature
                if (credits?.plan_type === 'free') {
                  setShowPricingModal(true);
                } else {
                  setShowFullscreenPreview(true);
                }
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-black">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Preview</span>
              </button>
              <button className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium text-sm transition border border-gray-200" onClick={() => {
                // Check if user has Pro plan for Export feature
                if (credits?.plan_type === 'free') {
                  setShowPricingModal(true);
                } else {
                  setShowExportModal(true);
                }
              }}>
                <img src="/export-icon.png" alt="Export" className="w-4 h-4 object-contain" />
                <span>Export</span>
              </button>
            </div>
          </div>
          {/* Slide content area */}
          <div className="flex-1 flex flex-col px-4 md:px-8 py-6 bg-[#f9fafb] overflow-y-auto">
            <div className="flex flex-col items-center gap-6 bg-[#f9fafb]">
              {slides.map((slide: any, slideIndex: number) => (
                              <div
                  key={`slide-${slideIndex}`}
                  className="bg-white relative overflow-hidden flex items-center justify-center border border-gray-200"
          style={{
                    width: sidebarCollapsed ? '1200px' : '1000px',
                    height: sidebarCollapsed ? '675px' : '563px',
            transition: 'width 300ms ease-in-out, height 300ms ease-in-out'
          }}
        >
          <div 
            className="slide-content"
            style={{
                      transform: sidebarCollapsed ? 'scale(1.36)' : 'scale(1.135)',
              transformOrigin: 'center center',
              width: '881px',
              height: '495px',
              transition: 'transform 300ms ease-in-out'
                    }}
                  >
                    {renderSlideContent(slideIndex)}
                        </div>
                      </div>
              ))}
          </div>
        </div>
        </section>
        )}
      </main>
      {showTitleMenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 transition-opacity duration-300 opacity-100" onClick={() => setShowTitleMenu(false)} />
          <div className="relative w-[400px] bg-white rounded-2xl shadow-xl border border-[#23272f] py-6 px-6 animate-scaleIn modal-content z-10">
            <div className="text-gray-500 text-xs font-medium tracking-wide mb-2 px-1">Presentation options</div>
            <div className="flex flex-col gap-1 mb-2 px-1">
              <button 
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition text-gray-900 hover:bg-[#f3f4f6]"
                onClick={async () => {
                  console.log('🔄🔄🔄 DUPLICATING PRESENTATION:', currentPresentation);
                  
                  // Duplicate presentation
                  if (currentPresentation) {
                    const duplicatedPresentation = {
                      id: uuidv4(), // Generate UUID for duplicate presentation
                      title: `${currentPresentation.title} (Copy)`
                    };
                    
                    // Track this ID for future reloads
                    persistCreatedId(duplicatedPresentation.id);
                    
                    console.log('💾💾💾 SAVING DUPLICATED PRESENTATION TO DATABASE:', duplicatedPresentation);
                    
                    // 🚨 NEW: Save duplicated presentation to database immediately
                    try {
                      // Get current presentation data to duplicate
                      const currentData = getCurrentPresentationData();
                      const slidesToDuplicate = currentData?.slides || [{ id: 'slide-1', blocks: [] }];
                      const messagesToDuplicate = messages.length > 0 ? messages : [{
                        role: 'assistant',
                        text: `Duplicated presentation: "${duplicatedPresentation.title}"`,
                        presentationData: {
                          title: duplicatedPresentation.title,
                          slides: slidesToDuplicate
                        }
                      }];
                      
                      const headers = await getAuthHeaders();
                      const response = await fetch('/api/presentations/save', {
                        method: 'POST',
                        headers,
                        body: JSON.stringify({ 
                          presentationId: duplicatedPresentation.id,
                          state: {
                            title: duplicatedPresentation.title,
                            slides: slidesToDuplicate,
                            messages: messagesToDuplicate,
                            activeSlide: 0
                          }
                        })
                      });
                      
                      if (response.ok) {
                        console.log('✅✅✅ DUPLICATED PRESENTATION SAVED TO DATABASE:', duplicatedPresentation.id)
                        
                        // 🚨 CRITICAL: Reload all workspace presentations to include the new duplicate
                        console.log('🔄🔄🔄 RELOADING WORKSPACE PRESENTATIONS AFTER DUPLICATE...')
                        setTimeout(async () => {
                          await reloadWorkspacePresentations();
                        }, 500); // Small delay to ensure database write is complete
                        
                      } else {
                        console.error('❌❌❌ FAILED TO SAVE DUPLICATED PRESENTATION:', response.status)
                      }
                    } catch (error) {
                      console.error('❌❌❌ ERROR SAVING DUPLICATED PRESENTATION:', error)
                    }
                    
                    // 🚨 IMMEDIATELY update UI state (don't wait for database verification)
                    console.log('🔄🔄🔄 IMMEDIATELY UPDATING UI WITH DUPLICATE:', duplicatedPresentation);
                    setWorkspacePresentations(prev => {
                      const currentPresentations = prev[currentWorkspace] || [];
                      const isDuplicate = currentPresentations.some(p => p.id === duplicatedPresentation.id);
                      if (!isDuplicate) {
                        console.log('🔄🔄🔄 ADDING DUPLICATE TO UI IMMEDIATELY');
                        return {
                      ...prev,
                          [currentWorkspace]: [...currentPresentations, duplicatedPresentation]
                        };
                      }
                      return prev;
                    });
                    // Duplicate slides for the new presentation
                    setWorkspaceSlides(prev => ({
                      ...prev,
                      [currentWorkspace]: {
                        ...prev[currentWorkspace],
                        [duplicatedPresentation.id]: [...slides]
                      }
                    }));
                    // Select the newly duplicated presentation
                    lastCreatedPresentationId.current = duplicatedPresentation.id;
                    setCurrentPresentationId(duplicatedPresentation.id);
                    setActiveSlide(0);
                  }
                  setShowTitleMenu(false);
                }}
              >
                Duplicate
              </button>
              <button 
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition text-gray-900 hover:bg-[#f3f4f6]"
                onClick={() => {
                  setShowTitleMenu(false);
                  // Check if user has Pro plan for Preview feature
                  if (credits?.plan_type === 'free') {
                    setShowPricingModal(true);
                  } else {
                    setShowFullscreenPreview(true);
                  }
                }}
              >
                Preview presentation
              </button>
              <button 
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition text-gray-900 hover:bg-[#f3f4f6]"
                onClick={() => {
                  setShowTitleMenu(false);
                  // Check if user has Pro plan for Export feature
                  if (credits?.plan_type === 'free') {
                    setShowPricingModal(true);
                  } else {
                    setShowExportModal(true);
                  }
                }}
              >
                Export as PDF
              </button>
              <button 
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition text-[#ef4444] hover:bg-[#f3f4f6]" 
                onClick={async () => {
                  console.log('🗑️🗑️🗑️ DELETING PRESENTATION from database:', currentPresentationId)
                  
                  // Delete from database first
                  try {
                    const headers = await getAuthHeaders();
                    const response = await fetch(`/api/presentations/delete?presentationId=${currentPresentationId}`, {
                      method: 'DELETE',
                      headers
                    });
                    
                    if (response.ok) {
                      console.log('✅✅✅ PRESENTATION DELETED from database successfully')
                    } else {
                      console.error('❌❌❌ Failed to delete presentation from database:', response.status)
                      // Continue with UI deletion even if database deletion fails
                    }
                  } catch (error) {
                    console.error('❌❌❌ Error deleting presentation from database:', error)
                    // Continue with UI deletion even if database deletion fails
                  }
                  
                  // Delete from UI
                  const updatedPresentations = workspacePresentations[currentWorkspace]?.filter(p => p.id !== currentPresentationId) || [];
                  setWorkspacePresentations(prev => ({
                    ...prev,
                    [currentWorkspace]: updatedPresentations
                  }));
                  
                  // Remove slides for deleted presentation
                  setWorkspaceSlides(prev => {
                    const { [currentPresentationId]: deletedSlides, ...rest } = prev[currentWorkspace] || {};
                    return {
                      ...prev,
                      [currentWorkspace]: rest
                    };
                  });
                  
                  // Remove presentation messages
                  setPresentationMessages(prev => {
                    const { [currentPresentationId]: deletedMessages, ...rest } = prev;
                    return rest;
                  });
                  
                  // Select the first presentation or create a new one if none exist
                  if (updatedPresentations.length === 0) {
                    console.log('💾💾💾 CREATING DEFAULT PRESENTATION after deletion')
                    const newId = uuidv4(); // Generate UUID for new presentation
                    const newPresentation = { id: newId, title: "Untitled presentation" };
                    
                    // Track this ID for future reloads
                    persistCreatedId(newId);
                    
                    setWorkspacePresentations(prev => ({
                      ...prev,
                      [currentWorkspace]: [newPresentation]
                    }));
                    
                    // Create and save new default presentation with instruction slide
                    // Create a single instruction slide with no messages
                    const instructionSlide = {
                      id: 'slide-1',
                      blocks: [
                        {
                          type: 'BackgroundBlock',
                          props: { color: 'bg-white' }
                        },
                        {
                          type: 'TextBlock',
                          props: {
                            text: 'To generate your presentation write in the input box below',
                            fontSize: 'text-xl',
                            textAlign: 'text-center',
                            color: 'text-gray-600'
                          }
                        }
                      ]
                    };
                    
                    // Get authentication headers and save to database
                    try {
                      const headers = await getAuthHeaders();
                      
                      const response = await fetch('/api/presentations/save', {
                        method: 'POST',
                        headers,
                        body: JSON.stringify({ 
                          presentationId: newId,
                          state: {
                            title: "Untitled presentation",
                            slides: [instructionSlide],
                            messages: [], // NO messages - completely empty chat
                            activeSlide: 0
                          }
                        })
                      });
                    
                      if (response.ok) {
                        console.log('✅✅✅ DEFAULT PRESENTATION WITH INSTRUCTION SLIDE SAVED TO DATABASE')
                      } else {
                        console.error('❌❌❌ Failed to save default presentation:', response.status)
                      }
                    } catch (error) {
                      console.error('❌❌❌ Error creating default presentation:', error)
                    }
                    
                    setCurrentPresentationId(newId);
                  } else {
                    setCurrentPresentationId(updatedPresentations[0].id);
                  }
                  
                  setActiveSlide(0);
                  setShowTitleMenu(false);
                }}
              >
                Delete presentation
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn modal-overlay">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowExportModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-gray-200 animate-scaleIn modal-content z-10">
            <h2 className="text-[#002903] text-xl font-semibold mb-4">Export Presentation</h2>
            <p className="text-[#002903] text-sm mb-6">
              Your presentation <span className="text-[#002903] font-medium">{currentPresentation?.title || 'Untitled'}</span> contains <span className="text-[#002903] font-medium">{slides.length} slides</span>.
            </p>
            
            {/* Progress Bar */}
            {isExporting && (
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[#002903] text-xs">Generating PDF...</span>
                  <span className="text-[#002903] text-xs">{Math.round(exportProgress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-[#002903] h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${exportProgress}%` }}
                  />
                </div>
              </div>
            )}
            
            <button 
              className="w-full bg-[#002903] hover:bg-[#002903]/90 text-white font-medium py-3 px-4 rounded-lg transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleExportPDF}
              disabled={isExporting}
            >
              {isExporting ? 'Generating PDF...' : 'Export PDF'}
            </button>
          </div>
          <style jsx>{`
            .animate-modal-in {
              animation: modalIn 0.3s cubic-bezier(0.4,0,0.2,1);
            }
            @keyframes modalIn {
              0% { opacity: 0; transform: scale(0.95); }
              100% { opacity: 1; transform: scale(1); }
            }
          `}</style>
        </div>
      )}
      {/* Fullscreen Preview */}
      {showFullscreenPreview && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          {/* Close button */}
          <button 
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition z-10"
            onClick={() => setShowFullscreenPreview(false)}
          >
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          {/* Slide navigation */}
          {memoizedSlides.length > 1 && (
            <>
              <button 
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition disabled:opacity-30 disabled:cursor-not-allowed z-10 bg-black/20 hover:bg-black/40 rounded-full p-3"
                onClick={() => setActiveSlide(Math.max(0, activeSlide - 1))}
                disabled={activeSlide === 0}
                aria-label="Previous slide"
              >
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
                  <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button 
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition disabled:opacity-30 disabled:cursor-not-allowed z-10 bg-black/20 hover:bg-black/40 rounded-full p-3"
                onClick={() => setActiveSlide(Math.min(memoizedSlides.length - 1, activeSlide + 1))}
                disabled={activeSlide === memoizedSlides.length - 1}
                aria-label="Next slide"
              >
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
                  <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </>
          )}
          
          {/* Slide content */}
          <div className="w-full h-full flex items-center justify-center relative">
            {/* Fullscreen canvas that properly scales the content */}
            <div 
              className="bg-white relative overflow-hidden"
              style={{
                width: '100vw',
                height: '100vh'
              }}
            >
              <div 
                className="w-full h-full flex items-center justify-center"
              >
                <div 
                  style={{
                    width: '881px',
                    height: '495px'
                  }}
                  ref={(el) => {
                    if (el) {
                      // Calculate scale to fill viewport more aggressively
                      const availableWidth = window.innerWidth;
                      const availableHeight = window.innerHeight;
                      
                      const scaleX = availableWidth / 881;
                      const scaleY = availableHeight / 495;
                      
                      // Use the larger scale factor to fill more screen space
                      // This will crop some content but eliminate white spaces
                      const scale = Math.max(scaleX, scaleY);
                      
                      // Apply scaling to make content fill the screen
                      el.style.transform = `scale(${scale})`;
                      el.style.transformOrigin = 'center center';
                    }
                  }}
                >
                  {renderSlideContent(activeSlide, true)}
                </div>
              </div>
            </div>
          </div>
          
          {/* Slide counter */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
            {activeSlide + 1} / {memoizedSlides.length}
          </div>
        </div>
      )}
    </div>
    </SimpleAutosave>
      
      {/* Featurebase Widget */}
      <FeaturebaseWidget appId="68fbb468fbac8b30b2071011" />
    </ProtectedRoute>
  );
}