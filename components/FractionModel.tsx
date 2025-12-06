import React, { useMemo } from 'react';
import { Fraction, FractionModelProps } from '../types';

// Constants for layout
const BAR_HEIGHT = 64; // h-16 = 64px
const GAP = 48; // Space between bars
const BAR_1_Y = 0;
// We'll calculate layout dynamically inside based on mode

export const FractionModel: React.FC<FractionModelProps> = ({
  fraction1,
  fraction2,
  step,
  commonDenominator,
  mode,
}) => {
  
  const BAR_2_Y = BAR_HEIGHT + GAP;
  // If subtraction, we move math up because the second bar is hidden
  const MATH_Y = mode === 'subtract' ? BAR_HEIGHT + 64 : BAR_2_Y + BAR_HEIGHT + 80;
  const CONTAINER_HEIGHT = MATH_Y + 60;

  // We calculate the individual "Unit Blocks" (1/LCM size)
  // Each block has a unique ID and a target position based on the current step.
  
  const blocks = useMemo(() => {
    const unitWidth = 100 / commonDenominator;
    
    // Convert original fractions to common denominator counts
    const count1 = fraction1.n * (commonDenominator / fraction1.d);
    const count2 = fraction2.n * (commonDenominator / fraction2.d);
    
    const allBlocks = [];

    if (mode === 'add') {
      // --- ADDITION LOGIC ---
      // Fraction 1 (Blue)
      for (let i = 0; i < count1; i++) {
        allBlocks.push({
          id: `f1-${i}`,
          type: 'f1',
          initialIndex: i,
          targetIndex: i, 
          startBar: 1,
        });
      }
      // Fraction 2 (Orange) moves to Bar 1
      for (let i = 0; i < count2; i++) {
        allBlocks.push({
          id: `f2-${i}`,
          type: 'f2',
          initialIndex: i,
          targetIndex: count1 + i, 
          startBar: 2,
        });
      }
    } else {
      // --- SUBTRACTION LOGIC ---
      // Fraction 1 (Blue) is the Minuend.
      // We do not render Fraction 2 blocks as a separate bar.
      // Instead, we mark the *last* count2 blocks of Fraction 1 to be crossed out.
      
      for (let i = 0; i < count1; i++) {
        // We want to cross out the last `count2` blocks
        const isCrossedOut = i >= (count1 - count2);
        
        allBlocks.push({
          id: `f1-${i}`,
          type: 'f1',
          initialIndex: i,
          targetIndex: i, // No movement
          startBar: 1,
          isCrossedOut,
        });
      }
    }

    return allBlocks;
  }, [fraction1, fraction2, commonDenominator, mode]);

  // Helper to determine position based on step
  const getBlockStyle = (block: any) => {
    const unitWidth = 100 / commonDenominator;
    
    let top = 0;
    let left = 0;
    const width = unitWidth;

    if (mode === 'add') {
      if (step < 2) {
        // Before animation: blocks stay in their original bars
        top = block.startBar === 1 ? BAR_1_Y : BAR_2_Y;
        left = block.initialIndex * unitWidth;
      } else {
        // Step 2: Animation (Combine)
        const targetSlot = block.targetIndex;
        if (targetSlot < commonDenominator) {
          top = BAR_1_Y;
          left = targetSlot * unitWidth;
        } else {
          const overflowIndex = targetSlot - commonDenominator;
          top = BAR_2_Y;
          left = overflowIndex * unitWidth;
        }
      }
    } else {
      // Subtraction: Blocks stay in Bar 1
      top = BAR_1_Y;
      left = block.initialIndex * unitWidth;
    }

    return {
      top: `${top + 2}px`, // Offset by 2px to align inside the top border
      left: `${left}%`,
      width: `${width}%`,
      height: `${BAR_HEIGHT}px`,
      marginLeft: '-1px', // Slight nudge left for visual alignment
    };
  };

  // Generate grid lines for Bar 1 (Original Denominator)
  const renderOriginalGrid = (denom: number, yPos: number, isDotted: boolean = false) => {
    const lines = [];
    for (let i = 1; i < denom; i++) {
      lines.push(
        <div
          key={`grid-${denom}-${i}`}
          className={`absolute top-0 bottom-0 border-r-2 ${isDotted ? 'border-dashed border-slate-300' : 'border-slate-800'} pointer-events-none z-20`}
          style={{
            left: `${(i / denom) * 100}%`,
            height: `${BAR_HEIGHT}px`,
            top: `${yPos}px`,
          }}
        />
      );
    }
    return lines;
  };

  // Generate LCM grid lines (The "Cuts")
  const renderLCMGrid = (yPos: number) => {
    const lines = [];
    for (let i = 1; i < commonDenominator; i++) {
      lines.push(
        <div
          key={`lcm-${i}`}
          className="absolute border-r border-dashed border-slate-400/70 pointer-events-none z-10 transition-opacity duration-500"
          style={{
            left: `${(i / commonDenominator) * 100}%`,
            top: `${yPos}px`,
            height: `${BAR_HEIGHT}px`,
            opacity: step >= 1 ? 1 : 0, // Fade in at Step 1
          }}
        />
      );
    }
    return lines;
  };

  // Component for displaying vertical fraction calculation with arrows
  const CalculationDisplay = ({ 
    fraction, 
    factor, 
    colorClass, 
    delay 
  }: { 
    fraction: Fraction; 
    factor: number; 
    colorClass: string;
    delay: string;
  }) => {
    const newN = fraction.n * factor;
    const newD = fraction.d * factor;

    // Only visible at step 1. Fades out at step 2.
    return (
      <div className={`flex items-center gap-4 transition-all duration-500 ${delay} ${step === 1 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95 pointer-events-none'}`}>
        <div className={`relative flex items-center gap-3 font-bold font-mono text-2xl ${colorClass}`}>
          
          {/* Top Arrow (Numerator) -45 deg */}
          <div className="absolute -top-8 left-0 w-full flex justify-center">
             <div className="relative w-16 h-8">
               <svg width="100%" height="100%" viewBox="0 0 60 30" preserveAspectRatio="none" className="overflow-visible">
                 <path d="M 10 25 Q 30 0 50 25" fill="none" stroke="currentColor" strokeWidth="2" />
                 <path d="M 50 25 L 45 18 M 50 25 L 55 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" transform="rotate(-45 50 25)" />
                 <text x="30" y="10" textAnchor="middle" fill="currentColor" fontSize="12" fontWeight="bold">×{factor}</text>
               </svg>
             </div>
          </div>

          {/* Original Fraction */}
          <div className="flex flex-col items-center">
            <span>{fraction.n}</span>
            <div className="w-8 h-0.5 bg-current my-1"></div>
            <span>{fraction.d}</span>
          </div>

          <span>=</span>

          {/* New Fraction */}
          <div className="flex flex-col items-center">
            <span>{newN}</span>
            <div className="w-10 h-0.5 bg-current my-1"></div>
            <span>{newD}</span>
          </div>

          {/* Bottom Arrow (Denominator) +45 deg */}
          <div className="absolute -bottom-8 left-0 w-full flex justify-center">
             <div className="relative w-16 h-8">
               <svg width="100%" height="100%" viewBox="0 0 60 30" preserveAspectRatio="none" className="overflow-visible">
                 <path d="M 10 5 Q 30 30 50 5" fill="none" stroke="currentColor" strokeWidth="2" />
                 <path d="M 50 5 L 45 12 M 50 5 L 55 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" transform="rotate(45 50 5)" />
                 <text x="30" y="28" textAnchor="middle" fill="currentColor" fontSize="12" fontWeight="bold">×{factor}</text>
               </svg>
             </div>
          </div>

        </div>
      </div>
    );
  };

  const factor1 = commonDenominator / fraction1.d;
  const factor2 = commonDenominator / fraction2.d;
  
  const eqN1 = fraction1.n * factor1;
  const eqN2 = fraction2.n * factor2;
  const resultN = mode === 'add' ? eqN1 + eqN2 : eqN1 - eqN2;

  return (
    <div className="relative w-full max-w-2xl mx-auto" style={{ height: `${CONTAINER_HEIGHT}px` }}>
      
      {/* --- EQUATION HEADER FOR SUBTRACTION (Since Bar 2 is hidden) --- */}
      {mode === 'subtract' && (
        <div className="absolute w-full top-0 flex justify-center -mt-10">
          <div className="text-xl font-bold text-slate-500 font-mono">
             {fraction1.n}/{fraction1.d} - {fraction2.n}/{fraction2.d} = ?
          </div>
        </div>
      )}

      {/* --- BAR 1 BACKGROUND & GRID --- */}
      <div 
        className="absolute w-full border-2 border-slate-800 bg-slate-100/50 overflow-hidden box-content -ml-[2px]"
        style={{ top: BAR_1_Y, height: BAR_HEIGHT }}
      >
        {/* Step 1: Show LCM grid */}
        {renderLCMGrid(0)}
        {/* Always: Show Original grid */}
        {renderOriginalGrid(fraction1.d, 0)}
      </div>

      {/* --- BAR 2 BACKGROUND & GRID (Only for Addition) --- */}
      {mode === 'add' && (
        <div 
          className="absolute w-full border-2 border-slate-800 bg-slate-100/50 overflow-hidden box-content -ml-[2px]"
          style={{ top: BAR_2_Y, height: BAR_HEIGHT }}
        >
          {renderLCMGrid(0)}
          {renderOriginalGrid(fraction2.d, 0)}
        </div>
      )}

      {/* --- ANIMATING BLOCKS --- */}
      {blocks.map((block) => {
        const style = getBlockStyle(block);
        const isF1 = block.type === 'f1';
        const showDivisions = step >= 1; // Only show internal cuts at Step 2 (Index 1) or later
        
        // Visual logic for crossing out
        const showCrossOut = mode === 'subtract' && block.isCrossedOut && step >= 2;

        return (
          <div
            key={block.id}
            className={`absolute transition-all duration-1000 ease-in-out flex items-center justify-center overflow-hidden
              ${isF1 ? 'bg-indigo-500' : 'bg-orange-500'}
              ${step >= 2 ? 'z-30' : 'z-0'}
              ${showDivisions ? 'border-r border-white/20 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]' : ''}
            `}
            style={{
              ...style,
            }}
          >
             {/* Subtraction Cross Out Effect */}
             {showCrossOut && (
                <div className="absolute inset-0 z-40 flex items-center justify-center animate-in fade-in zoom-in duration-500">
                    <svg viewBox="0 0 24 24" className="w-full h-full text-red-600/80 p-1" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                    <div className="absolute inset-0 bg-slate-900/40 mix-blend-multiply"></div>
                </div>
             )}

            {/* Optional: Show value inside block if space permits */}
            <div className={`w-full h-full flex items-center justify-center transition-opacity ${showDivisions ? 'opacity-0 hover:opacity-100' : 'opacity-0'}`}>
              <span className="text-[10px] text-white font-mono">1/{commonDenominator}</span>
            </div>
          </div>
        );
      })}

      {/* --- LABELS --- */}
      <div 
        className="absolute -left-12 sm:-left-16 flex items-center justify-end w-12 sm:w-16 font-bold text-slate-700 text-lg sm:text-xl pr-4"
        style={{ top: BAR_1_Y, height: BAR_HEIGHT }}
      >
        {fraction1.n}/{fraction1.d}
      </div>
      
      {mode === 'add' && (
        <div 
          className="absolute -left-12 sm:-left-16 flex items-center justify-end w-12 sm:w-16 font-bold text-slate-700 text-lg sm:text-xl pr-4"
          style={{ top: BAR_2_Y, height: BAR_HEIGHT }}
        >
          {fraction2.n}/{fraction2.d}
        </div>
      )}

      {/* --- CALCULATIONS (Appears at Step 2 / Index 1) --- */}
      <div 
        className="absolute w-full flex justify-around items-center px-8"
        style={{ top: MATH_Y }}
      >
        <CalculationDisplay 
          fraction={fraction1} 
          factor={factor1} 
          colorClass="text-indigo-600" 
          delay="delay-0"
        />
        <CalculationDisplay 
          fraction={fraction2} 
          factor={factor2} 
          colorClass="text-orange-600" 
          delay="delay-200"
        />
      </div>

      {/* --- FINAL EQUATION (Appears at Step 3 / Index 2) --- */}
      <div 
        className={`absolute w-full flex justify-center items-center transition-all duration-700 delay-700`}
        style={{ 
            top: MATH_Y, 
            opacity: step >= 2 ? 1 : 0,
            transform: step >= 2 ? 'translateY(0)' : 'translateY(20px)',
            pointerEvents: step >= 2 ? 'auto' : 'none'
        }}
      >
        <div className="bg-white/80 backdrop-blur-md px-6 py-4 rounded-xl shadow-lg border border-slate-200 text-slate-800 text-2xl font-bold flex items-center gap-6">
           
           {/* Fraction 1 (Equivalent) */}
           <div className="flex flex-col items-center text-indigo-600">
             <span>{eqN1}</span>
             <div className="w-full h-0.5 bg-indigo-600 my-1"></div>
             <span>{commonDenominator}</span>
           </div>

           <span className="text-slate-400">
             {mode === 'add' ? '+' : '−'}
           </span>

           {/* Fraction 2 (Equivalent) */}
           <div className="flex flex-col items-center text-orange-600">
             <span>{eqN2}</span>
             <div className="w-full h-0.5 bg-orange-600 my-1"></div>
             <span>{commonDenominator}</span>
           </div>

           <span className="text-slate-400">=</span>

           {/* Result */}
           <div className="flex flex-col items-center text-slate-900 bg-green-50 px-3 py-1 rounded-lg border border-green-100">
             <span>{resultN}</span>
             <div className="w-full h-0.5 bg-slate-900 my-1"></div>
             <span>{commonDenominator}</span>
           </div>
        </div>
      </div>

    </div>
  );
};