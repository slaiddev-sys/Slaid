'use client';

import React from 'react';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { CanvasOverlayProvider } from '../../components/figma/CanvasOverlay';

// Import all available layout components
import Metrics_FinancialsSplit from '../../components/layouts/Metrics/Metrics_FinancialsSplit';
import Metrics_FullWidthChart from '../../components/layouts/Metrics/Metrics_FullWidthChart';
// Direct imports to avoid export issues
import Cover_LeftImageTextRight from '../../components/layouts/Cover/Cover_LeftImageTextRight';
import Cover_ProductLayout from '../../components/layouts/Cover/Cover_ProductLayout';
import Cover_TextCenter from '../../components/layouts/Cover/Cover_TextCenter';
// import Cover_LeftTitleRightBodyUnderlined from '../../components/layouts/Cover/Cover_LeftTitleRightBodyUnderlined'; // Temporarily disabled - empty component file
// Index layouts - direct imports to bypass export issues
import Index_LeftAgendaRightImage from '../../components/layouts/Index/Index_LeftAgendaRightImage';
import Index_LeftAgendaRightText from '../../components/layouts/Index/Index_LeftAgendaRightText';
// BackCover layouts
import BackCover_ThankYou from '../../components/layouts/BackCover/BackCover_ThankYou';
import BackCover_ThankYouWithImage from '../../components/layouts/BackCover/BackCover_ThankYouWithImage';
import Quote_MissionStatement from '../../components/layouts/Quote/Quote_MissionStatement';
import Quote_LeftTextRightImage from '../../components/layouts/Quote/Quote_LeftTextRightImage';
import Impact_KPIOverview from '../../components/layouts/Impact/Impact_KPIOverview';
import Impact_SustainabilityMetrics from '../../components/layouts/Impact/Impact_SustainabilityMetrics';
import Impact_ImageMetrics from '../../components/layouts/Impact/Impact_ImageMetrics';
import Team_AdaptiveGrid from '../../components/layouts/Team/Team_AdaptiveGrid';
import Team_MemberProfile from '../../components/layouts/Team/Team_MemberProfile';
import Lists_LeftTextRightImage from '../../components/layouts/Lists/Lists_LeftTextRightImage';
import Lists_GridLayout from '../../components/layouts/Lists/Lists_GridLayout';
import Lists_LeftTextRightImageDescription from '../../components/layouts/Lists/Lists_LeftTextRightImageDescription';
import Lists_CardsLayout from '../../components/layouts/Lists/Lists_CardsLayout';
import Lists_CardsLayoutRight from '../../components/layouts/Lists/Lists_CardsLayoutRight';
import Market_SizeAnalysis from '../../components/layouts/Market/Market_SizeAnalysis';
import Competition_Analysis from '../../components/layouts/Competition/Competition_Analysis';
import Roadmap_Timeline from '../../components/layouts/Roadmap/Roadmap_Timeline';
import Product_MacBookCentered from '../../components/layouts/Product/Product_MacBookCentered';
import Product_iPhoneInCenter from '../../components/layouts/Product/Product_iPhoneInCenter';
import Product_PhysicalProduct from '../../components/layouts/Product/Product_PhysicalProduct';
import McBook_Feature from '../../components/layouts/Product/McBook_Feature';
import iPhone_StandaloneFeature from '../../components/layouts/Product/iPhone_StandaloneFeature';
import Pricing_Plans from '../../components/layouts/Pricing/Pricing_Plans';

export default function LayoutsPreviewPage() {


  // Sample data for all layout types
  const sampleProps = {
    // Cover layout props
    coverProps: {
      title: "Our solution",
      subtitle: "Q4 2024 Performance & Strategy",
      description: "Comprehensive analysis of our business performance, key achievements, and strategic initiatives for the upcoming quarter.",
      imageUrl: "/Default-Image-2.png",
      backgroundColor: "bg-gradient-to-br from-blue-50 to-indigo-100",
      showImage: true,
      showLogo: true,
      logoUrl: "/logo-placeholder.png"
    },

    // Index layout props
    indexProps: {
      title: "Meeting Agenda",
      agenda: [
        { title: "Market Analysis", duration: "15 min", description: "Current market trends and opportunities" },
        { title: "Product Updates", duration: "20 min", description: "Latest feature releases and roadmap" },
        { title: "Financial Review", duration: "25 min", description: "Q4 performance and budget planning" },
        { title: "Strategic Planning", duration: "30 min", description: "2025 goals and initiatives" },
        { title: "Customer Insights", duration: "20 min", description: "Voice of customer feedback and analysis" },
        { title: "Next Steps", duration: "10 min", description: "Action items and follow-up tasks" }
      ],
      imageUrl: "/Default-Image-1.png",
      layout: {
        showTitle: true,
        showAgenda: true,
        showImage: true
      }
    },

    // Index text layout props
    indexTextProps: {
      title: "Presentation Overview",
      description: "Lorem ipsum dolor sit amet consectetur adipiscing elit etiam nec suscipit dui sed cursus nibh id risus ultrices convallis phasellus vel tristique diam nam placerat.",
      agenda: [
        { title: "Introduction", duration: "10 min", description: "Overview and objectives" },
        { title: "Main Content", duration: "25 min", description: "Core presentation material" },
        { title: "Discussion", duration: "15 min", description: "Q&A and feedback session" },
        { title: "Next Steps", duration: "10 min", description: "Action items and follow-up" }
      ],
      layout: {
        showTitle: true,
        showDescription: true,
        showAgenda: true
      }
    },

    // Index grid layout props
    indexGridProps: {
      title: "Meeting Agenda",
      description: "Comprehensive overview of today's discussion topics and timeline.",
      agenda: [
        { title: "Market Analysis", duration: "15 min", description: "Industry trends" },
        { title: "Financial Performance", duration: "20 min", description: "Revenue growth" },
        { title: "Customer Insights", duration: "15 min", description: "Voice of customer" },
        { title: "Product Roadmap", duration: "25 min", description: "Development pipeline" },
        { title: "Sales Strategy", duration: "20 min", description: "GTM approach" },
        { title: "Digital Transformation", duration: "15 min", description: "Technology initiatives" },
        { title: "Operational Excellence", duration: "20 min", description: "Process optimization" },
        { title: "Talent Development", duration: "15 min", description: "Team growth" },
        { title: "Strategic Partnerships", duration: "10 min", description: "Alliance development" }
      ],
      layout: {
        showTitle: true,
        showDescription: true,
        showAgenda: true
      }
    },

    // 18 items layout props (specific for Index_LeftAgendaRightText)
    eighteenItemsProps: {
      title: "Meeting Agenda",
      agenda: [
        { title: "Market Analysis", duration: "15 min", description: "Current market trends and opportunities" },
        { title: "Product Updates", duration: "20 min", description: "Latest feature releases and roadmap" },
        { title: "Financial Review", duration: "25 min", description: "Q4 performance and budget planning" },
        { title: "Strategic Planning", duration: "30 min", description: "2025 goals and initiatives" },
        { title: "Customer Insights", duration: "20 min", description: "Voice of customer feedback and analysis" },
        { title: "Next Steps", duration: "10 min", description: "Action items and follow-up tasks" },
        { title: "Team Updates", duration: "15 min", description: "Department progress and milestones" },
        { title: "Budget Review", duration: "20 min", description: "Quarterly budget analysis and planning" },
        { title: "Risk Assessment", duration: "15 min", description: "Current risks and mitigation strategies" },
        { title: "Innovation Lab", duration: "25 min", description: "New technology and innovation updates" },
        { title: "Partnership Review", duration: "20 min", description: "Strategic partnerships and alliances" },
        { title: "Compliance Update", duration: "15 min", description: "Regulatory changes and compliance status" },
        { title: "Market Expansion", duration: "30 min", description: "New market opportunities and strategies" },
        { title: "Technology Stack", duration: "20 min", description: "Technical infrastructure and updates" },
        { title: "Customer Success", duration: "15 min", description: "Customer satisfaction and retention metrics" },
        { title: "Competitive Analysis", duration: "25 min", description: "Market positioning and competitor insights" },
        { title: "Resource Planning", duration: "20 min", description: "Human resources and capacity planning" },
        { title: "Action Items", duration: "10 min", description: "Summary and next steps assignment" }
      ],
      layout: {
        showTitle: true,
        showDescription: true,
        showAgenda: true
      }
    },

    // Quote layout props
    quoteProps: {
      title: "Our Mission",
      quote: '"To empower businesses with innovative solutions that drive sustainable growth and create lasting value for all stakeholders."',
      author: "Leadership Team",
      backgroundColor: "bg-white"
    },

    // BackCover layout props
    backCoverProps: {
      title: "Thank you",
      logoUrl: "/logo-placeholder.png",
      logoAlt: "Company logo",
      contact: {
        email: "hello@creatable.co.nz",
        social: "@creatable.co.nz",
        phone: "+64221638003",
        phone2: "+64221638004",
        location: {
          city: "Auckland Central",
          country: "New Zealand"
        },
        website: "creatable.co.nz"
      },
      layout: {
        showTitle: true,
        showLogo: true,
        showContact: true
      }
    },

    // BackCover with image layout props
    backCoverWithImageProps: {
      title: "Thank you",
      logoUrl: "/logo-placeholder.png",
      logoAlt: "Company logo",
      imageUrl: "/Default-Image-1.png",
      imageAlt: "Thank you image",
      contact: {
        email: "hello@creatable.co.nz",
        social: "@creatable.co.nz",
        phone: "+64221638003",
        phone2: "+64221638004",
        location: {
          city: "Auckland Central",
          country: "New Zealand"
        },
        website: "creatable.co.nz"
      },
      layout: {
        showTitle: true,
        showLogo: true,
        showContact: true,
        showImage: true
      }
    },

    // Impact layout props
    impactProps: {
      title: "Key Performance Indicators",
      stats: [
        { label: "Revenue Growth", value: "24.5%", trend: "up", description: "Year over year" },
        { label: "Customer Satisfaction", value: "94%", trend: "up", description: "NPS Score" },
        { label: "Market Share", value: "18.2%", trend: "up", description: "Industry position" },
        { label: "Team Growth", value: "156", trend: "up", description: "Total employees" }
      ]
    },

    // KPI Overview layout props
    kpiOverviewProps: {
      title: "KPI Overview",
      description: "Product performance is the backbone of growth. By evaluating how web features resonate with users and their impact on engagement, we unlock opportunities to scale effectively.",
      kpiCards: [
        {
          title: 'Active Users',
          value: '35,000',
          subtitle: '+3.2% compared to previous',
          trend: 'up',
          trendValue: '+3.2%',
          icon: 'Users',
          hasChart: true,
          chartType: 'area'
        },
        {
          title: 'Retention Rate',
          value: '88%',
          subtitle: 'Monthly stable, but needs improvement',
          trend: 'neutral',
          icon: 'Users',
          hasChart: true,
          chartType: 'area'
        },
        {
          title: 'Revenue Growth',
          value: '24.5%',
          subtitle: 'Year over year growth',
          trend: 'up',
          trendValue: '+5.2%',
          icon: 'DollarSign',
          hasChart: true,
          chartType: 'bar'
        },
        {
          title: 'NPS Score',
          value: '45',
          subtitle: 'Company Goal Target: 50+',
          trend: 'neutral',
          icon: 'Star'
        },
        {
          title: 'Monthly Churn Rate',
          value: '4.5%',
          subtitle: 'Down from last year\'s 8%',
          trend: 'down',
          trendValue: '-3.5%',
          icon: 'AlertTriangle'
        }
      ],
      chart: {
        type: 'area' as const,
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        series: [
          { id: 'Active Users', data: [28.5, 31.2, 29.8, 33.1, 34.2, 35.0], color: '#3b82f6' },
          { id: 'Revenue Growth', data: [18.5, 20.5, 19.2, 22.8, 23.1, 24.5], color: '#8b5cf6' },
          { id: 'NPS Score', data: [42, 43, 44, 44, 45, 45], color: '#10b981' }
        ],
        showLegend: true,
        showGrid: true,
        animate: true,
        stacked: false,
        legendPosition: 'bottom',
        legendSize: 'small'
      },
      layout: {
        showTitle: true,
        showDescription: true,
        showKpiCards: true,
        showChart: true,
        showSummary: true
      }
    },

    // Legend and Metrics layout props
    sustainabilityMetricsProps: {
      title: "Impactful Metrics",
      description: "Carbon dioxide emissions are a critical challenge facing our planet. Our solutions directly address this problem by reducing CO₂ output and creating measurable environmental impact.",
      metricsData: {
        metric1: {
          value: '',
          label: 'CO₂ Emissions Reduced',
          description: 'Direct reduction in carbon dioxide emissions compared to traditional industrial processes and energy consumption.',
          icon: 'Leaf'
        },
        metric2: {
          value: '',
          label: 'Carbon Footprint Impact',
          description: 'Measurable decrease in overall carbon footprint through innovative solutions and process optimization.',
          icon: 'TrendingDown'
        },
        metric3: {
          value: '',
          label: 'Clean Energy Generated',
          description: 'Carbon-neutral energy production that replaces fossil fuel dependency and reduces atmospheric CO₂.',
          icon: 'Zap'
        },
        metric4: {
          value: '',
          label: 'Emission Prevention',
          description: 'Proactive measures preventing future CO₂ emissions through sustainable practices and technology.',
          icon: 'Shield'
        }
      },
      impactNumbers: {
        number1: {
          value: '500 tons',
          label: 'CO₂ Emissions Reduced'
        },
        number2: {
          value: '14,000 kWh',
          label: 'Clean Energy Generated'
        },
        number3: {
          value: '80%',
          label: 'Carbon Footprint Impact'
        },
        number4: {
          value: '2.3M kg',
          label: 'Emission Prevention'
        }
      }
    },

    // Image Metrics layout props
    imageMetricsProps: {
      title: "Environmental Impact",
      description: "Our comprehensive approach to environmental sustainability creates measurable impact across multiple dimensions, driving positive change for our planet.",
      image: {
        src: 'Default-Image-2.png',
        alt: 'Environmental impact visualization',
        rounded: false
      },
      impactNumbers: {
        number1: {
          value: '500 tons',
          label: 'CO₂ Emissions Reduced'
        },
        number2: {
          value: '14,000 kWh',
          label: 'Clean Energy Generated'
        },
        number3: {
          value: '80%',
          label: 'Carbon Footprint Impact'
        },
        number4: {
          value: '2.3M kg',
          label: 'Emission Prevention'
        }
      }
    },

    // Lists cards layout props
    listsCardsProps: {
      title: "Investor\nBenefits",
      description: "Web3 is one of the fastest-growing sectors in tech, and early investors have the opportunity to shape its future while unlocking high-growth potential, equity rewards, and exclusive token benefits.",
      cards: [
        {
          icon: 'Target',
          title: 'Access to Token',
          description: 'Web3 is one of the fastest-growing sectors in tech, and early investors have the opportunity to shape its future while unlocking high-growth potential, equity rewards, and exclusive token benefits.'
        },
        {
          icon: 'TrendingUp',
          title: 'Equity & Profit-Sharing Opportunities',
          description: 'Web3 is one of the fastest-growing sectors in tech, and early investors have the opportunity to shape its future while unlocking high-growth potential, equity rewards, and exclusive token benefits.'
        },
        {
          icon: 'Zap',
          title: 'High-Growth Potential',
          description: 'Web3 is one of the fastest-growing sectors in tech, and early investors have the opportunity to shape its future while unlocking high-growth potential, equity rewards, and exclusive token benefits.'
        },
        {
          icon: 'Shield',
          title: 'Secure Investment Framework',
          description: 'Built on blockchain technology with transparent smart contracts, ensuring secure and verifiable investment processes with full audit trails.'
        }
      ],
      layout: {
        showTitle: true,
        showDescription: true,
        showCards: true
      }
    },

    // Team layout props
    teamProps: {
      title: "Leadership Team",
      members: [
        { name: "Sarah Johnson", role: "CEO", bio: "15+ years in tech leadership", imageUrl: "profile-photo-1.jpg" },
        { name: "Michael Chen", role: "CTO", bio: "Expert in scalable architecture", imageUrl: "profile-photo-2.jpg" },
        { name: "Emily Rodriguez", role: "VP Marketing", bio: "Growth marketing specialist", imageUrl: "profile-photo-3.jpg" },
        { name: "David Kim", role: "VP Sales", bio: "B2B sales strategist", imageUrl: "profile-photo-4.jpg" }
      ]
    },


    // Metrics layout props - using component defaults for exact match
    metricsProps: {
      // Using component defaults - no props needed to show default appearance
    },
    
    // Full Width Chart specific props with progress metric
    metricsFullWidthProps: {
      layout: {
        showTitle: true,
        showDescription: true,
        titleAlignment: 'left' as const,
        rightMargin: 'mr-8 lg:mr-12',
        showProgressMetric: true
      },
      chart: {
        type: 'area' as const,
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        series: [
          {
            id: 'Revenue',
            data: [6500, 11200, 9800, 15100, 18200, 24500],
            color: '#4A3AFF'
          },
          {
            id: 'GMV',
            data: [4200, 7800, 6900, 10500, 13400, 18200],
            color: '#C893FD'
          }
        ],
        showLegend: true,
        showGrid: true,
        animate: true,
        legendPosition: 'bottom' as const,
        legendSize: 'medium' as const
      }
    },

    // Lists layout props
    listsProps: {
      title: "Q4 Financial Performance",
      description: "Comprehensive overview of our quarterly achievements and key metrics.",
      bulletPoints: [
        {
          icon: 'TrendingUp',
          title: 'Revenue Growth',
          description: 'Achieved 32% year-over-year growth with strong performance across all segments'
        },
        {
          icon: 'Users',
          title: 'Customer Base',
          description: 'Expanded customer base by 45% while maintaining high satisfaction scores'
        },
        {
          icon: 'DollarSign',
          title: 'Profit Margins',
          description: 'Improved profit margins by 8% through operational efficiency initiatives'
        },
        {
          icon: 'Target',
          title: 'Market Share',
          description: 'Increased market share to 23% in our primary vertical markets'
        },
        {
          icon: 'Globe',
          title: 'Global Expansion',
          description: 'Successfully launched operations in 5 new international markets'
        },
        {
          icon: 'Award',
          title: 'Industry Recognition',
          description: 'Received multiple awards for innovation and customer service excellence'
        }
      ],
      image: {
        src: '/Default-Image-1.png',
        alt: 'Financial performance dashboard showing growth metrics',
        size: 'full' as const,
        fit: 'cover' as const,
        rounded: 'lg' as const,
        shadow: true
      }
    },

    // Lists description layout props
    listsDescriptionProps: {
      title: "Our Solution",
      description: "We provide comprehensive solutions that address the core challenges facing modern businesses. Our approach combines innovative technology with proven methodologies to deliver measurable results that drive growth and efficiency across all aspects of your organization.",
      image: {
        src: '/Default-Image-1.png',
        alt: 'Solution visualization',
        size: 'full',
        fit: 'cover',
        rounded: false,
        shadow: false
      },
      layout: {
        showTitle: true,
        showDescription: true,
        showBulletPoints: false,
        imagePosition: 'right'
      }
    },

    // Market layout props
    marketProps: {
      title: "Market Size",
      description: "Our initial focus is on underserved industrial and municipal sectors in high-growth regions. With a clear product-market fit and scalable deployment model, we're positioned to capture a strong share of a rapidly growing multi-billion dollar opportunity.",
      marketData: {
        tam: {
          value: '$4.5B',
          label: 'TAM',
          description: 'Global CleanTech Market'
        },
        sam: {
          value: '$2B', 
          label: 'SAM',
          description: 'B2B Waste-to-Energy Systems in Target Sectors'
        },
        som: {
          value: '$876M',
          label: 'SOM', 
          description: 'Initial Target Market'
        }
      }
    },

    // Roadmap layout props
    roadmapProps: {
      title: "Timeline for Implementation",
      description: "Based on the identified usability issues, we've outlined specific and actionable UX improvements. These solutions aim to reduce friction, enhance usability, and align with best practices in interaction design.",
      roadmapData: {
        periods: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7'],
        items: [
          {
            name: 'Design',
            timeline: {
              period: 'Week 1',
              duration: 1,
              color: '#F59E0B' // Amber/orange color for design phase
            }
          },
          {
            name: 'Planning',
            timeline: {
              period: 'Week 1',
              duration: 1,
              color: '#C893FD' // Light purple (complementary to the blue sequence)
            }
          },
          {
            name: 'Quick Wins',
            timeline: {
              period: 'Week 1',
              duration: 1,
              color: '#A1B7FF'
            }
          },
          {
            name: 'Core Journey Redesign',
            timeline: {
              period: 'Week 2',
              duration: 3,
              color: '#8B5CF6'
            }
          },
          {
            name: 'User Testing',
            timeline: {
              period: 'Week 5',
              duration: 2,
              color: '#3044E3'
            }
          },
          {
            name: 'Final Launch',
            timeline: {
              period: 'Week 7',
              duration: 1,
              color: '#1C00BB'
            }
          }
        ]
      }
    },

    // Pricing layout props
    pricingProps: {
      title: "Pricing",
      description: "Lorem ipsum dolor sit amet consectetur. Est facilisis amet consectetur eu egestas gravida eu. Tempor malesuada posuere id consequat eu tortor quam aenean. Tortor turpis lectus sem proin.",
      pricingData: {
        plans: [
          {
            name: 'Free',
            price: '$0',
            period: 'per user/month, billed annually',
            targetAudience: 'For Small Teams',
            features: [
              'Real-time contact syncing',
              'Automatic data enrichment',
              'Up to 3 seats',
              'Basic support'
            ]
          },
          {
            name: 'Basic',
            price: '$39',
            period: 'per user/month, billed annually',
            discount: '-15%',
            targetAudience: 'For Growing Teams',
            features: [
              'Private lists',
              'Enhanced email sending',
              'No seat limits',
              'Advanced analytics',
              'Priority support',
              'Custom integrations'
            ]
          },
          {
            name: 'Enterprise',
            price: '$129',
            period: 'per user/month, billed annually',
            targetAudience: 'For Big Corporation',
            features: [
              'Unlimited reporting',
              'SAML and SSO',
              'Custom billing',
              'Dedicated account manager',
              'White-label options',
              'API access',
              'Advanced security',
              '24/7 phone support'
            ]
          }
        ]
      }
    },

    // Competition layout props
    competitionProps: {
      title: "Competitive Edge",
      description: "Our CleanTech solution stands out from legacy systems and simple retrofits by excelling in cost, speed, and sustainability. Thanks to our unique AI optimization and modular design, we provide a competitive advantage that is both technically sound and commercially viable.",
      competitionData: {
        features: ['Upfront Cost', 'Implementation Speed', 'Sustainability Rating', 'ROI Timeline'],
        ourProduct: {
          name: 'Our Solution',
          values: ['Low', 'Fast', 'High', '6 months']
        },
        competitors: [
          {
            name: 'Competitor A',
            values: ['Medium', 'Medium', 'Medium', '12 months']
          },
          {
            name: 'Competitor B', 
            values: ['High', 'Slow', 'Low', '18 months']
          }
        ]
      }
    },

    // Product layout props
    productProps: {
      title: "Our Solution",
      description: "Discover the next generation of innovation with our cutting-edge solution designed for modern businesses. Experience seamless integration, powerful performance, and intuitive design that transforms the way you work.",
      productImages: {
        background: {
          src: '/Default-Image-1.png',
          alt: 'Product background gradient',
          size: 'full' as const,
          fit: 'cover' as const,
          rounded: 'xl' as const
        },
        mockup: {
          src: '/Hand-iPhone-MockUp.png',
          alt: 'iPhone in hand mockup',
          size: 'full' as const,
          fit: 'contain' as const,
          rounded: false
        },
        uiOverlay: {
          src: '/Default-Image-1.png',
          alt: 'Product UI interface screenshot',
          size: 'full' as const,
          fit: 'cover' as const,
          rounded: 'lg' as const
        }
      }
    },


    // MacBook Centered layout props (separate from productProps)
    macBookCenteredProps: {
      title: "Our Solution",
      description: "Discover the next generation of innovation with our cutting-edge solution designed for modern businesses. Experience seamless integration, powerful performance, and intuitive design that transforms the way you work.",
      productImages: {
        background: {
          src: '/Default-Image-1.png',
          alt: 'Product background gradient',
          size: 'full' as const,
          fit: 'cover' as const,
          rounded: 'xl' as const
        },
        mockup: {
          src: '/McBook-MockUp.png?v=4',
          alt: 'MacBook mockup',
          size: 'full' as const,
          fit: 'contain' as const,
          rounded: false
        },
        ui: {
          src: '/Saas-preview.png?v=5',
          alt: 'SaaS application interface preview',
          size: 'full' as const,
          fit: 'cover' as const,
          rounded: 'lg' as const
        }
      }
    }
  };

  // Layout definitions organized by category - all available layouts
  const layoutCategories = [
    {
      title: "Cover Layouts",
      description: "Opening slide layouts for presentations",
      layouts: [
        { name: "Left Image Text Right", component: Cover_LeftImageTextRight, props: sampleProps.coverProps },
        { name: "Product Layout", component: Cover_ProductLayout, props: sampleProps.coverProps },
        { name: "Text Center", component: Cover_TextCenter, props: sampleProps.coverProps },
        { name: "Left Title Right Body Underlined", component: Cover_TextCenter, props: sampleProps.coverProps }
      ]
    },
    {
      title: "Index Layouts",
      description: "Agenda and index slide layouts",
      layouts: [
        { name: "Left Agenda Right Image", component: Index_LeftAgendaRightImage, props: sampleProps.indexProps },
        { name: "18 items", component: Index_LeftAgendaRightText, props: sampleProps.eighteenItemsProps }
      ]
    },
    {
      title: "Quote Layouts",
      description: "Quote and mission statement layouts", 
      layouts: [
        { name: "Mission Statement", component: Quote_MissionStatement, props: sampleProps.quoteProps },
        { name: "Left Text Right Image", component: Quote_LeftTextRightImage, props: sampleProps.quoteProps }
      ]
    },
    {
      title: "BackCover Layouts",
      description: "Back cover and closing slide layouts",
      layouts: [
        { name: "Thank You", component: BackCover_ThankYou, props: sampleProps.backCoverProps },
        { name: "Thank You With Image", component: BackCover_ThankYouWithImage, props: sampleProps.backCoverWithImageProps }
      ]
    },
    {
      title: "Impact Layouts",
      description: "Statistics and performance layouts",
      layouts: [
        { name: "KPI Overview", component: Impact_KPIOverview, props: sampleProps.kpiOverviewProps },
        { name: "Legend and Metrics", component: Impact_SustainabilityMetrics, props: sampleProps.sustainabilityMetricsProps },
        { name: "Image Metrics", component: Impact_ImageMetrics, props: sampleProps.imageMetricsProps }
      ]
    },
    {
      title: "Team Layouts",
      description: "Team member and profile layouts",
      layouts: [
        { name: "Team Members", component: Team_AdaptiveGrid, props: sampleProps.teamProps },
        { name: "Member Profile", component: Team_MemberProfile, props: { ...sampleProps.teamProps, members: [sampleProps.teamProps.members[0]] } },
      ]
    },
    {
      title: "Metrics Layouts", 
      description: "Chart and data visualization layouts",
      layouts: [
        { name: "Financials Split", component: Metrics_FinancialsSplit, props: sampleProps.metricsProps },
        { name: "Full Width Chart", component: Metrics_FullWidthChart, props: sampleProps.metricsFullWidthProps }
      ]
    },
    {
      title: "Lists Layouts",
      description: "Lists and structured content layouts",
      layouts: [
        { name: "Left Text Right Image", component: Lists_LeftTextRightImage, props: sampleProps.listsProps },
        { name: "Grid Layout", component: Lists_GridLayout, props: sampleProps.listsProps },
        { name: "Text Image Description", component: Lists_LeftTextRightImageDescription, props: sampleProps.listsDescriptionProps },
        { name: "Cards Layout", component: Lists_CardsLayout, props: sampleProps.listsCardsProps },
        { name: "Cards Layout Right", component: Lists_CardsLayoutRight, props: sampleProps.listsCardsProps }
      ]
    },
    {
      title: "Market Layouts",
      description: "Market analysis and business strategy layouts",
      layouts: [
        { name: "Size Analysis", component: Market_SizeAnalysis, props: sampleProps.marketProps }
      ]
    },
    {
      title: "Roadmap Layouts",
      description: "Project roadmaps and timeline layouts",
      layouts: [
        { name: "Roadmap Timeline", component: Roadmap_Timeline, props: sampleProps.roadmapProps }
      ]
    },
    {
      title: "Competition Layouts",
      description: "Competitive analysis and comparison layouts",
      layouts: [
        { name: "Competition Analysis", component: Competition_Analysis, props: sampleProps.competitionProps }
      ]
    },
    {
      title: "Product Layouts",
      description: "Product showcase and demonstration layouts",
      layouts: [
        { name: "MacBook Centered", component: Product_MacBookCentered, props: sampleProps.macBookCenteredProps },
        { name: "iPhone in the center", component: Product_iPhoneInCenter, props: { 
          title: "Our Solution",
          description: "Experience the future of productivity with our innovative platform designed to streamline your workflow and boost efficiency."
        } },
        { name: "Physical Product", component: Product_PhysicalProduct, props: sampleProps.productProps },
        { name: "McBook Feature", component: McBook_Feature, props: { 
          title: sampleProps.coverProps.title,
          paragraph: sampleProps.coverProps.description,
          imageUrl: sampleProps.coverProps.imageUrl,
          showImage: sampleProps.coverProps.showImage
        } },
        { name: "iPhone Standalone Feature", component: iPhone_StandaloneFeature, props: { 
          title: sampleProps.coverProps.title,
          paragraph: sampleProps.coverProps.description,
          imageUrl: sampleProps.coverProps.imageUrl,
          showImage: sampleProps.coverProps.showImage
        } }
      ]
    },
    {
      title: "Pricing Layouts",
      description: "Pricing tables and subscription plan layouts",
      layouts: [
        { name: "Pricing Plans", component: Pricing_Plans, props: sampleProps.pricingProps }
      ]
    }
  ];

  const totalLayouts = layoutCategories.reduce((sum, category) => sum + category.layouts.length, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Slide Layouts Preview
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Preview and test all available slide layouts for presentations
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {totalLayouts} total layouts
            </span>
            {layoutCategories.map((category) => (
              <span key={category.title} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                {category.layouts.length} {category.title.toLowerCase()}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Layout Categories */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {layoutCategories.map((category) => (
          <div key={category.title} className="mb-16">
            {/* Category Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {category.title}
              </h2>
              <p className="text-gray-600 mb-4">{category.description}</p>
              <div className="h-px bg-gray-200"></div>
            </div>

            {/* Layouts Grid */}
            <div className="grid grid-cols-1 gap-8">
              {category.layouts.map((layout) => {
                const LayoutComponent = layout.component;
                
                // Safety check to prevent undefined component errors
                if (!LayoutComponent) {
                  return (
                    <div key={layout.name} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {layout.name}
                        </h3>
                      </div>
                      <div className="p-6">
                        <div 
                          className="bg-red-50 border border-red-200 rounded-lg flex items-center justify-center mx-auto"
                          style={{ 
                            width: '881px',
                            height: '495px'
                          }}
                        >
                          <p className="text-red-600">Component not found: {layout.name}</p>
                        </div>
                      </div>
                    </div>
                  );
                }
                
                return (
                  <div key={layout.name} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {/* Layout Header */}
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {layout.name}
                      </h3>
                    </div>
                    
                    {/* Layout Preview */}
                    <div className="p-6">
                      <div 
                        className="bg-white border border-gray-200 rounded-lg relative mx-auto"
                        style={{ 
                          width: '881px',
                          height: '495px',
                          // CRITICAL: Slide acts as clipping mask - clips content at slide boundary
                          overflow: 'hidden',
                          // Prevent this container from growing due to child overflow
                          contain: 'layout style',
                          flexShrink: 0,
                          minWidth: '881px',
                          minHeight: '495px',
                          maxWidth: '881px',
                          maxHeight: '495px'
                        }}
                      >
                        <ErrorBoundary fallback={
                          <div className="flex items-center justify-center h-full">
                            <div className="text-center p-4">
                              <p className="text-red-600 font-semibold">{layout.name} Error</p>
                              <p className="text-sm text-gray-500">This layout failed to render</p>
                            </div>
                          </div>
                        }>
                          <div className="relative w-full z-10" style={{ overflow: 'visible' }}>
                            <CanvasOverlayProvider>
                              <LayoutComponent 
                                {...(layout.props as any)} 
                                useFixedDimensions={true}
                                canvasWidth={881}
                                canvasHeight={495}
                              />
                            </CanvasOverlayProvider>
                          </div>
                        </ErrorBoundary>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 px-6 py-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-600">
            Total of {totalLayouts} slide layouts available for presentations
          </p>
        </div>
      </div>
    </div>
  );
}