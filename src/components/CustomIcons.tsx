import React from 'react';

export const NoodleBowlIcon = ({ className = "w-6 h-6", ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 100 100" 
    className={className} 
    fill="none" 
    {...props}
  >
    {/* Orange blob (dumpling/meat) */}
    <path d="M 52 50 C 52 28, 78 30, 75 50" fill="#FFB997" />
    
    {/* Green arc (lime/veg) */}
    <path d="M 33 50 A 9 9 0 0 1 47 50" stroke="#4ADE80" strokeWidth="5.5" strokeLinecap="round" />
    
    {/* Dark grey dome (noodles) */}
    <path d="M 27 50 A 15 15 0 0 1 53 50" stroke="#4B5563" strokeWidth="5.5" strokeLinecap="round" />
    
    {/* Chopsticks */}
    <line x1="53" y1="38" x2="67" y2="22" stroke="#4B5563" strokeWidth="5.5" strokeLinecap="round" />
    <line x1="63" y1="38" x2="73" y2="28" stroke="#4B5563" strokeWidth="5.5" strokeLinecap="round" />
    
    {/* Bowl Rim */}
    <line x1="18" y1="52" x2="82" y2="52" stroke="#4B5563" strokeWidth="5.5" strokeLinecap="round" />
    
    {/* Bowl Body */}
    <path d="M 22 52 C 22 83, 78 83, 78 52" stroke="#4B5563" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
    
    {/* Bowl Foot */}
    <rect x="41" y="80" width="18" height="6" rx="3" stroke="#4B5563" strokeWidth="5.5" strokeLinejoin="round" />
  </svg>
);
