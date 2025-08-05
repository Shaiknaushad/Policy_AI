
import React from 'react';
import type { AnalysisResult } from '../types';

interface ResultDisplayProps {
  result: AnalysisResult;
}

const DecisionBadge: React.FC<{ decision: AnalysisResult['decision'] }> = ({ decision }) => {
    const baseClasses = "px-3 py-1 text-sm font-semibold rounded-full inline-block";
    if (decision === 'Approved') {
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>Approved</span>;
    }
    if (decision === 'Rejected') {
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>Rejected</span>;
    }
    return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>Further Review</span>;
};

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <h3 className="text-sm font-medium text-slate-500 mb-1">Decision</h3>
          <p className="text-2xl font-bold text-slate-800">
            <DecisionBadge decision={result.decision} />
          </p>
        </div>
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <h3 className="text-sm font-medium text-slate-500 mb-1">Payout Amount</h3>
          <p className="text-2xl font-bold text-slate-800">
            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(result.amount)}
          </p>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-slate-700 mb-3">Justification</h3>
        <div className="space-y-4">
          {result.justification.map((item, index) => (
            <div key={index} className="bg-slate-50 p-4 rounded-lg border border-slate-200 transition-shadow hover:shadow-sm">
              <p className="font-semibold text-sky-700 mb-2">{item.clause}</p>
              <blockquote className="border-l-4 border-slate-300 pl-4 text-slate-600 mb-3">
                <p className="italic">"{item.text}"</p>
              </blockquote>
              <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-slate-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-slate-700"><span className="font-medium">Reasoning:</span> {item.reasoning}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Add a simple fade-in animation to tailwind config (not possible here, so using CSS-in-JS style for demonstration)
// In a real project this would be in tailwind.config.js
if (typeof window !== 'undefined') {
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
            animation: fadeIn 0.5s ease-out forwards;
        }
    `;
    document.head.appendChild(style);
}


export default ResultDisplay;
