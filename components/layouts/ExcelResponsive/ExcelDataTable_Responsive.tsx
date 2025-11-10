import React from 'react';

interface ExcelDataTableResponsiveProps {
  title?: string;
  description?: string;
  headers?: string[];
  data?: Array<Record<string, any>>;
  canvasWidth?: number;
  canvasHeight?: number;
}

const ExcelDataTable_Responsive: React.FC<ExcelDataTableResponsiveProps> = ({ 
  title = "Performance Overview",
  description = "Comprehensive metrics and key performance indicators showing quarterly growth trends and revenue optimization.",
  headers = ["Metric", "Value", "Change"],
  data = [
    { "Metric": "Total Revenue", "Value": "$648,000", "Change": "+18.2%" },
    { "Metric": "Average Monthly", "Value": "$54,000", "Change": "+12.5%" },
    { "Metric": "Peak Month", "Value": "$68,000", "Change": "December" },
    { "Metric": "Units Sold", "Value": "16,200", "Change": "+15.3%" },
    { "Metric": "Target Achievement", "Value": "94.2%", "Change": "-5.8%" }
  ],
  canvasWidth = 1280,
  canvasHeight = 720
}) => {
  // Calculate responsive scale factor
  const scaleFactor = Math.min(canvasWidth / 1280, canvasHeight / 720);
  
  // Derive headers from data if not provided
  const actualHeaders = headers && headers.length > 0 
    ? headers 
    : (data && data.length > 0 ? Object.keys(data[0]) : ["Column 1"]);
  
  // Responsive measurements
  const padding = `${24 * scaleFactor}px`;
  const paddingTop = `${48 * scaleFactor}px`;
  const titleFontSize = `${24 * scaleFactor}px`;
  const descriptionFontSize = `${12 * scaleFactor}px`;
  const tableFontSize = `${14 * scaleFactor}px`;
  const marginBottom = `${24 * scaleFactor}px`;
  const marginLeft = `${24 * scaleFactor}px`;
  const cellPaddingX = `${16 * scaleFactor}px`;
  const cellPaddingY = `${8 * scaleFactor}px`;
  const borderWidth = `${0.5 * scaleFactor}px`;

  return (
    <div 
      className="w-full h-full bg-white" 
      style={{ 
        aspectRatio: '16/9', 
        fontFamily: 'Helvetica, Arial, sans-serif',
        padding: padding,
        paddingTop: paddingTop,
        width: `${canvasWidth}px`,
        height: `${canvasHeight}px`
      }}
    >
      {/* Title Section */}
      <div className="flex items-start justify-between" style={{ marginBottom: marginBottom, marginLeft: marginLeft }}>
        <h1 className="font-medium text-black" style={{ fontSize: titleFontSize }}>{title}</h1>
        <div className="text-left" style={{ maxWidth: `${448 * scaleFactor}px`, marginLeft: `${-64 * scaleFactor}px` }}>
          {description.split('\n').map((line, index) => (
            <p key={index} className="text-gray-600" style={{ fontSize: descriptionFontSize }}>
              {line || description}
            </p>
          ))}
        </div>
      </div>
      
      {/* Table - PowerPoint compatible styling with dynamic columns */}
      <div className="overflow-hidden" style={{ marginLeft: marginLeft }}>
        <table className="w-full border-collapse" style={{ fontSize: tableFontSize }}>
          <thead>
            <tr style={{ backgroundColor: '#fcfcfc' }} className="text-black">
              {actualHeaders.map((header, idx) => (
                <th 
                  key={idx}
                  className="text-left" 
                  style={{ 
                    padding: `${cellPaddingY} ${cellPaddingX}`,
                    ...(idx < actualHeaders.length - 1 && { borderRight: `${borderWidth} solid #f3f4f6` }),
                    borderBottom: `${borderWidth} solid #f3f4f6` 
                  }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIdx) => (
              <tr key={rowIdx} style={{ backgroundColor: '#fcfcfc' }}>
                {actualHeaders.map((header, colIdx) => {
                  const cellValue = row[header];
                  const isLastColumn = colIdx === actualHeaders.length - 1;
                  const isLastRow = rowIdx === data.length - 1;
                  
                  // Check if it's a change/growth column (contains +/- or % at start)
                  const isChangeColumn = header.toLowerCase().includes('change') || 
                                        header.toLowerCase().includes('growth') ||
                                        header.toLowerCase().includes('variation');
                  const cellText = String(cellValue || '-');
                  
                  return (
                    <td 
                      key={colIdx}
                      className={
                        isChangeColumn && cellText.startsWith('+') ? 'text-green-600' : 
                        isChangeColumn && cellText.startsWith('-') ? 'text-red-600' : 'text-black'
                      } 
                      style={{ 
                        padding: `${cellPaddingY} ${cellPaddingX}`,
                        ...(!isLastColumn && { borderRight: `${borderWidth} solid #f3f4f6` }),
                        ...(!isLastRow && { borderBottom: `${borderWidth} solid #f3f4f6` }) 
                      }}
                    >
                      {cellText}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExcelDataTable_Responsive;

