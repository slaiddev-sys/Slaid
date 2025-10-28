// EMERGENCY FIX: Inject KPI data directly into the editor
console.log('🚨 EMERGENCY FIX: Injecting KPI data directly');

// Wait for the editor to load
setTimeout(() => {
  // Create the KPI data directly
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
                  "icon": "Users"
                },
                {
                  "title": "Conversion Rate",
                  "value": "20%",
                  "subtitle": "Above 18%",
                  "trend": "up",
                  "trendValue": "+2%",
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

  // Try to inject into React state
  if (window.React && window.React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
    console.log('✅ EMERGENCY: React found, attempting state injection');
    
    // Force trigger a re-render with the data
    const event = new CustomEvent('emergencyKPIData', { detail: emergencyData });
    window.dispatchEvent(event);
  }
}, 2000);
