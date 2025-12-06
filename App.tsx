import React, { useState, useCallback, useEffect } from 'react';
import { FractionModel } from './components/FractionModel';
import { Controls } from './components/Controls';
import { getRandomFraction, lcm } from './utils/math';
import { Fraction } from './types';
import { RefreshCw, ArrowRight, CheckCircle2, Plus, Minus } from 'lucide-react';

export default function App() {
  const [fraction1, setFraction1] = useState<Fraction>({ n: 1, d: 2 });
  const [fraction2, setFraction2] = useState<Fraction>({ n: 1, d: 3 });
  const [step, setStep] = useState<number>(0);
  const [commonDenominator, setCommonDenominator] = useState<number>(6);
  const [mode, setMode] = useState<'add' | 'subtract'>('add');

  const generateFractions = useCallback(() => {
    // Generate two random fractions with denominators between 2 and 8
    // Ensure denominators are not equal to make it interesting
    let f1 = getRandomFraction(2, 8);
    let f2 = getRandomFraction(2, 8);
    
    // Prevent same denominators for better educational value in this specific app
    while (f1.d === f2.d) {
      f2 = getRandomFraction(2, 8);
    }
    
    if (mode === 'subtract') {
      // Ensure fraction1 > fraction2 for positive results
      const val1 = f1.n / f1.d;
      const val2 = f2.n / f2.d;
      
      if (val1 < val2) {
        [f1, f2] = [f2, f1]; // Swap
      } else if (val1 === val2) {
        // Regenerate if equal (unlikely with different denoms but possible, e.g. 1/2 and 2/4)
        // Simple fix: force f1 to be larger or regenerate
        f1 = { n: 3, d: 4 };
        f2 = { n: 1, d: 3 }; 
      }
    }
    
    setFraction1(f1);
    setFraction2(f2);
    setStep(0);
    setCommonDenominator(lcm(f1.d, f2.d));
  }, [mode]);

  // Initial generation
  useEffect(() => {
    generateFractions();
  }, [generateFractions]);

  const handleNextStep = () => {
    setStep((prev) => Math.min(prev + 1, 3));
  };

  const handleReset = () => {
    setStep(0);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center py-8 px-4 sm:px-6">
      <header className="max-w-4xl w-full mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
          Visual Fraction {mode === 'add' ? 'Addition' : 'Subtraction'}
        </h1>
        <p className="text-slate-600 max-w-2xl mx-auto mb-6">
          Explore how to {mode === 'add' ? 'add' : 'subtract'} fractions with different denominators using interactive bar models.
        </p>

        {/* Mode Toggle */}
        <div className="inline-flex bg-slate-200 p-1 rounded-xl shadow-inner">
          <button
            onClick={() => setMode('add')}
            className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all ${
              mode === 'add' 
                ? 'bg-white text-indigo-700 shadow-sm' 
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <Plus size={16} /> Addition
          </button>
          <button
            onClick={() => setMode('subtract')}
            className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all ${
              mode === 'subtract' 
                ? 'bg-white text-orange-700 shadow-sm' 
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <Minus size={16} /> Subtraction
          </button>
        </div>
      </header>

      <main className="max-w-4xl w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Visual Area */}
        <div className="p-6 md:p-10 bg-slate-50 border-b border-slate-200 min-h-[400px] flex flex-col justify-center">
          <FractionModel 
            fraction1={fraction1} 
            fraction2={fraction2} 
            step={step} 
            commonDenominator={commonDenominator}
            mode={mode}
          />
        </div>

        {/* Controls & Explanation Area */}
        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="md:col-span-2 space-y-6">
            <div className={`border rounded-xl p-5 ${mode === 'add' ? 'bg-blue-50 border-blue-100' : 'bg-orange-50 border-orange-100'}`}>
              <h3 className={`font-semibold mb-2 flex items-center gap-2 ${mode === 'add' ? 'text-blue-900' : 'text-orange-900'}`}>
                {step === 0 && <span className="bg-white/50 px-2 py-0.5 rounded-full text-xs border border-black/5">Step 1</span>}
                {step === 1 && <span className="bg-white/50 px-2 py-0.5 rounded-full text-xs border border-black/5">Step 2</span>}
                {step >= 2 && <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs border border-green-200">Complete</span>}
                <span className="ml-1">
                  {step === 0 && (mode === 'add' ? "Represent the Fractions" : "Represent the Minuend")}
                  {step === 1 && "Find Common Denominator"}
                  {step >= 2 && (mode === 'add' ? "Combine the Parts" : "Subtract the Parts")}
                </span>
              </h3>
              <p className={`${mode === 'add' ? 'text-blue-800/80' : 'text-orange-800/80'} leading-relaxed`}>
                {step === 0 && (
                   mode === 'add' 
                    ? `We start with two fractions: ${fraction1.n}/${fraction1.d} and ${fraction2.n}/${fraction2.d}. The bars are divided differently, so we can't simply add the pieces yet.`
                    : `We want to subtract ${fraction2.n}/${fraction2.d} from ${fraction1.n}/${fraction1.d}. First, we represent the starting amount (minuend) ${fraction1.n}/${fraction1.d} using a bar model.`
                )}
                {step === 1 && (
                  <>
                    To {mode === 'add' ? 'add' : 'subtract'} them, we need to make the pieces the same size. 
                    The Least Common Multiple (LCM) of {fraction1.d} and {fraction2.d} is <strong>{commonDenominator}</strong>.
                    We divide the bar{mode === 'add' ? 's' : ''} into {commonDenominator} equal parts.
                  </>
                )}
                {step >= 2 && (
                  mode === 'add' ? (
                    <>
                      Now that all parts are size 1/{commonDenominator}, we can move the shaded parts from the second bar to the first.
                      <br/>
                      <span className="font-semibold mt-1 block">
                        {fraction1.n}/{fraction1.d} + {fraction2.n}/{fraction2.d} = 
                        {(fraction1.n * (commonDenominator / fraction1.d)) + (fraction2.n * (commonDenominator / fraction2.d))}/{commonDenominator}
                      </span>
                    </>
                  ) : (
                    <>
                      Now that we have common parts, we can cross out the parts equal to the subtrahend ({fraction2.n}/{fraction2.d}).
                      <br/>
                      <span className="font-semibold mt-1 block">
                        {fraction1.n}/{fraction1.d} - {fraction2.n}/{fraction2.d} = 
                        {(fraction1.n * (commonDenominator / fraction1.d)) - (fraction2.n * (commonDenominator / fraction2.d))}/{commonDenominator}
                      </span>
                    </>
                  )
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 justify-center">
            <div className="flex gap-2">
              <button
                onClick={handleNextStep}
                disabled={step >= 2}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all
                  ${step >= 2 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                    : `${mode === 'add' ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/25' : 'bg-orange-600 hover:bg-orange-700 shadow-orange-500/25'} text-white shadow-lg active:scale-95`
                  }`}
              >
                {step >= 2 ? (
                  <>
                    <CheckCircle2 size={18} /> Done
                  </>
                ) : (
                  <>
                    Next Step <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleReset}
                disabled={step === 0}
                className="flex-1 py-2 px-4 rounded-lg font-medium border border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors disabled:opacity-50"
              >
                Reset Step
              </button>
              <button
                onClick={generateFractions}
                className="flex-1 py-2 px-4 rounded-lg font-medium border border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw size={16} /> New Problem
              </button>
            </div>
          </div>

        </div>
      </main>
      
      <footer className="mt-8 text-slate-400 text-sm">
        Educational Visualizer
      </footer>
    </div>
  );
}