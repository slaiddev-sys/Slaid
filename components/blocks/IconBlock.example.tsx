import React from 'react';
import IconBlock, { CommonIcons } from './IconBlock';

/**
 * Example usage of IconBlock component
 * 
 * This file demonstrates various ways to use the IconBlock component
 * with Lucide icons from https://lucide.dev/
 */
export default function IconBlockExample() {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold mb-6">IconBlock Examples</h1>
      
      {/* Basic Usage */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Basic Usage</h2>
        <div className="flex items-center gap-4">
          <IconBlock iconName="Heart" />
          <IconBlock iconName="Star" />
          <IconBlock iconName="TrendingUp" />
          <IconBlock iconName="BarChart" />
        </div>
      </section>
      
      {/* Custom Sizes */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Custom Sizes</h2>
        <div className="flex items-center gap-4">
          <IconBlock iconName="Heart" size={16} />
          <IconBlock iconName="Heart" size={24} />
          <IconBlock iconName="Heart" size={32} />
          <IconBlock iconName="Heart" size={48} />
        </div>
      </section>
      
      {/* Custom Colors */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Custom Colors</h2>
        <div className="flex items-center gap-4">
          <IconBlock iconName="Heart" color="#ef4444" />
          <IconBlock iconName="Star" color="#f59e0b" />
          <IconBlock iconName="TrendingUp" color="#10b981" />
          <IconBlock iconName="CheckCircle" color="#3b82f6" />
        </div>
      </section>
      
      {/* Custom Stroke Width */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Custom Stroke Width</h2>
        <div className="flex items-center gap-4">
          <IconBlock iconName="Circle" strokeWidth={1} />
          <IconBlock iconName="Circle" strokeWidth={2} />
          <IconBlock iconName="Circle" strokeWidth={3} />
          <IconBlock iconName="Circle" strokeWidth={4} />
        </div>
      </section>
      
      {/* Business Icons */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Business & Analytics Icons</h2>
        <div className="flex items-center gap-4">
          <IconBlock iconName="TrendingUp" color="#10b981" size={32} />
          <IconBlock iconName="TrendingDown" color="#ef4444" size={32} />
          <IconBlock iconName="BarChart" color="#3b82f6" size={32} />
          <IconBlock iconName="PieChart" color="#8b5cf6" size={32} />
          <IconBlock iconName="DollarSign" color="#f59e0b" size={32} />
        </div>
      </section>
      
      {/* Using CommonIcons helper */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Using CommonIcons Helper</h2>
        <div className="flex items-center gap-4">
          <IconBlock iconName={CommonIcons.ArrowLeft} />
          <IconBlock iconName={CommonIcons.ArrowRight} />
          <IconBlock iconName={CommonIcons.Check} />
          <IconBlock iconName={CommonIcons.X} />
        </div>
      </section>
      
      {/* Interactive Icons */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Interactive Icons</h2>
        <div className="flex items-center gap-4">
          <IconBlock 
            iconName="Heart" 
            color="#ef4444" 
            className="cursor-pointer hover:scale-110 transition-transform"
            onClick={() => alert('Heart clicked!')}
            ariaLabel="Like button"
          />
          <IconBlock 
            iconName="Share" 
            color="#3b82f6" 
            className="cursor-pointer hover:scale-110 transition-transform"
            onClick={() => alert('Share clicked!')}
            ariaLabel="Share button"
          />
        </div>
      </section>
    </div>
  );
}
