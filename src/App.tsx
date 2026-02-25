/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Droplets, 
  Upload, 
  Microscope, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  User,
  Search,
  Activity,
  ShieldAlert,
  Download,
  Trash2,
  Loader2,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AnalysisResult } from './types';
import { analyzeSample } from './services/geminiService';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [images, setImages] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('Initializing scan...');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadingMessages = [
    "Scanning image for synthetic polymers...",
    "Classifying particle morphology...",
    "Calculating contamination density...",
    "Assessing environmental health risks...",
    "Attributing potential pollution sources...",
    "Finalizing comprehensive report..."
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAnalyzing) {
      let i = 0;
      interval = setInterval(() => {
        setLoadingMessage(loadingMessages[i % loadingMessages.length]);
        i++;
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    if (images.length === 0) {
      setError("Please upload at least one microscope image.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    try {
      const data = await analyzeSample(images);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "An error occurred during analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setImages([]);
    setResult(null);
    setError(null);
  };

  const downloadReport = () => {
    if (!result) return;
    const blob = new Blob([result.fullReportMarkdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MicroScan_Report_${result.reportId}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-cyan-500/30">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
      </div>

      {/* Header */}
      <header className="border-b border-white/10 p-4 flex justify-between items-center bg-ocean-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <Droplets className="text-cyan-400 w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              MICROSCAN <span className="text-cyan-400 font-light">AQUA</span>
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono text-cyan-500/70 uppercase tracking-[0.2em]">System Active</span>
              <div className="w-1 h-1 bg-cyan-500 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {result && (
            <button 
              onClick={downloadReport}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-[10px] font-mono hover:bg-white/10 transition-all uppercase tracking-wider rounded-md"
            >
              <Download size={14} className="text-cyan-400" /> Export
            </button>
          )}
          <button 
            onClick={reset}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-[10px] font-mono hover:bg-white/10 transition-all uppercase tracking-wider rounded-md"
          >
            <Trash2 size={14} className="text-red-400" /> Reset
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        {/* Left Column: Input */}
        <div className="lg:col-span-4 space-y-6">
          {/* System Info */}
          <section className="glass-panel p-6 rounded-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
              <Info size={40} />
            </div>
            <h2 className="text-cyan-400 font-mono text-[10px] uppercase tracking-[0.3em] mb-3">System Protocol</h2>
            <p className="text-sm leading-relaxed text-slate-400">
              Automated microplastic detection engine. Upload high-resolution microscope imagery for polymer identification and risk assessment.
            </p>
          </section>

          {/* Image Upload */}
          <section className="space-y-3">
            <div className="flex justify-between items-end px-1">
              <label className="text-[9px] font-mono uppercase tracking-[0.2em] text-slate-500">Optical Input</label>
              <span className="text-[9px] font-mono uppercase text-cyan-500/50">{images.length}/5 Slots</span>
            </div>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="glass-panel p-8 rounded-xl flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-cyan-500/50 transition-all group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6 text-cyan-400" />
              </div>
              <div className="text-center relative z-10">
                <p className="text-xs font-bold uppercase tracking-wider text-white">Upload Imagery</p>
                <p className="text-[9px] font-mono text-slate-500 mt-1">RAW / JPG / PNG</p>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                multiple 
                accept="image/*" 
                onChange={handleImageUpload} 
              />
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg border border-white/10 group overflow-hidden">
                    <img src={img} className="w-full h-full object-cover" alt={`Sample ${idx}`} />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                        className="p-1.5 bg-red-500/80 rounded-full text-white hover:bg-red-500"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start gap-3 text-red-400 text-xs"
            >
              <AlertTriangle className="shrink-0" size={16} />
              <p>{error}</p>
            </motion.div>
          )}

          <button 
            onClick={handleAnalyze}
            disabled={isAnalyzing || images.length === 0}
            className={cn(
              "w-full py-5 rounded-xl flex items-center justify-center gap-3 text-sm font-bold uppercase tracking-[0.2em] transition-all relative overflow-hidden group",
              isAnalyzing || images.length === 0 
                ? "bg-white/5 text-slate-600 cursor-not-allowed border border-white/5" 
                : "bg-cyan-500 text-ocean-950 hover:bg-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)] active:scale-[0.98]"
            )}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Processing...
              </>
            ) : (
              <>
                <Activity size={18} />
                Run Analysis
              </>
            )}
            {!isAnalyzing && images.length > 0 && (
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-[-20deg]" />
            )}
          </button>
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {!result && !isAnalyzing && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full glass-panel rounded-2xl flex flex-col items-center justify-center text-center p-12 space-y-6 min-h-[600px]"
              >
                <div className="relative">
                  <div className="w-24 h-24 border border-white/5 rounded-full flex items-center justify-center bg-white/5">
                    <Search className="text-cyan-500/20 w-10 h-10" />
                  </div>
                  <motion.div 
                    className="absolute inset-0 border border-cyan-500/20 rounded-full"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0, 0.2] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold uppercase tracking-widest text-white/40">Awaiting Telemetry</h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                    System ready for input. Please provide microscope imagery and sample parameters to initiate neural scan.
                  </p>
                </div>
              </motion.div>
            )}

            {isAnalyzing && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full glass-panel rounded-2xl p-12 flex flex-col items-center justify-center text-center space-y-10 min-h-[600px]"
              >
                <div className="relative w-48 h-48">
                  <svg className="w-full h-full -rotate-90">
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      className="stroke-white/5 fill-none"
                      strokeWidth="4"
                    />
                    <motion.circle
                      cx="96"
                      cy="96"
                      r="88"
                      className="stroke-cyan-500 fill-none"
                      strokeWidth="4"
                      strokeDasharray="553"
                      animate={{ strokeDashoffset: [553, 0] }}
                      transition={{ duration: 15, repeat: Infinity }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full bg-cyan-500/10 flex items-center justify-center relative overflow-hidden">
                      <Microscope className="w-12 h-12 text-cyan-400" />
                      <div className="scanline animate-scan" />
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-bold uppercase tracking-[0.2em] text-white">{loadingMessage}</h3>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-[9px] font-mono text-cyan-500/70 uppercase tracking-widest">Neural Core Processing</span>
                    <div className="flex gap-1">
                      <motion.div className="w-1 h-1 bg-cyan-500 rounded-full" animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
                      <motion.div className="w-1 h-1 bg-cyan-500 rounded-full" animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} />
                      <motion.div className="w-1 h-1 bg-cyan-500 rounded-full" animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {result && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 pb-12"
              >
                {/* Severity Score Banner */}
                <div className="glass-panel rounded-2xl p-8 overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[80px] -mr-32 -mt-32 rounded-full" />
                  <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
                    <div className="space-y-2">
                      <p className="text-[9px] font-mono uppercase text-cyan-500 tracking-[0.3em]">Analysis Complete</p>
                      <h3 className="text-4xl font-bold uppercase tracking-tight text-white">{result.severity.level}</h3>
                      <p className="text-xs text-slate-400 font-mono">{result.severity.particlesPerLiter.toFixed(2)} PARTICLES / LITER</p>
                    </div>
                    <div className="text-right space-y-4">
                      <div className="flex gap-1.5">
                        {[...Array(10)].map((_, i) => (
                          <motion.div 
                            key={i} 
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className={cn(
                              "w-3 h-10 rounded-sm origin-bottom",
                              i < result.severity.score 
                                ? "bg-gradient-to-t from-cyan-600 to-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.4)]" 
                                : "bg-white/5"
                            )}
                          />
                        ))}
                      </div>
                      <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Severity Index: {result.severity.score}.0 / 10.0</p>
                    </div>
                  </div>
                </div>

                {/* Detection & Classification */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="glass-panel rounded-2xl p-6 space-y-5">
                    <div className="flex justify-between items-center">
                      <h4 className="text-[9px] font-mono uppercase tracking-[0.2em] text-slate-500">01. Detection Stats</h4>
                      <div className={cn(
                        "px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider",
                        result.detection.confidence === 'High' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      )}>
                        {result.detection.confidence} Confidence
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-bold text-white tracking-tighter">{result.detection.totalCount}</span>
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Particles</span>
                      </div>
                      <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                        <p className="text-xs leading-relaxed text-slate-400 italic">"{result.detection.reasoning}"</p>
                      </div>
                    </div>
                  </div>

                  <div className="glass-panel rounded-2xl p-6 space-y-5">
                    <h4 className="text-[9px] font-mono uppercase tracking-[0.2em] text-slate-500">02. Morphological Profile</h4>
                    <div className="space-y-4">
                      {result.classification.map((item, idx) => (
                        <div key={idx} className="space-y-2">
                          <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                            <span className="text-white">{item.type}</span>
                            <span className="text-cyan-400">{item.percentage}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${item.percentage}%` }}
                              className="h-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]" 
                            />
                          </div>
                          <div className="flex justify-between text-[9px] font-mono text-slate-500 uppercase">
                            <span>{item.count} units • {item.sizeRange}</span>
                            <span className="flex gap-1">
                              {item.colors.map(c => (
                                <span key={c} className="px-1 border border-white/10 rounded-sm">{c}</span>
                              ))}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Source Attribution */}
                <div className="glass-panel rounded-2xl p-8 space-y-6">
                  <h4 className="text-[9px] font-mono uppercase tracking-[0.2em] text-slate-500">03. Source Attribution Matrix</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {result.sources.map((source, idx) => (
                      <div key={idx} className="p-5 bg-white/5 rounded-2xl border border-white/5 space-y-3 hover:border-cyan-500/30 transition-colors">
                        <div className="flex justify-between items-center">
                          <h5 className="font-bold uppercase text-xs text-white tracking-wider">{source.source}</h5>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full bg-cyan-500" style={{ width: `${source.confidence}%` }} />
                            </div>
                            <span className="text-[9px] font-mono text-cyan-500">{source.confidence}%</span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">{source.reasoning}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Health Risk */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  <div className="md:col-span-4 glass-panel rounded-2xl p-8 flex flex-col justify-center items-center text-center space-y-5 border-red-500/20 bg-red-500/5">
                    <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                      <ShieldAlert size={32} className="text-red-500 animate-pulse" />
                    </div>
                    <div>
                      <p className="text-[9px] font-mono uppercase text-red-500/70 tracking-[0.3em] mb-1">Health Risk Index</p>
                      <h3 className="text-2xl font-bold uppercase tracking-tighter text-white">{result.healthRisk.humanRiskLevel}</h3>
                    </div>
                  </div>
                  <div className="md:col-span-8 glass-panel rounded-2xl p-8 space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Activity size={14} className="text-cyan-500" />
                        <h4 className="text-[9px] font-mono uppercase tracking-[0.2em] text-slate-500">Ecosystem Impact</h4>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{result.healthRisk.marineRisk}</p>
                    </div>
                    <div className="h-px bg-white/5" />
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-cyan-500" />
                        <h4 className="text-[9px] font-mono uppercase tracking-[0.2em] text-slate-500">Human Exposure Summary</h4>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{result.healthRisk.humanRiskSummary}</p>
                    </div>
                  </div>
                </div>

                {/* Remediation */}
                <div className="glass-panel rounded-2xl p-8 space-y-8">
                  <h4 className="text-[9px] font-mono uppercase tracking-[0.2em] text-slate-500">04. Remediation Protocols</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-5">
                      <div className="flex items-center gap-2 text-cyan-400">
                        <CheckCircle2 size={16} />
                        <h5 className="font-bold uppercase text-[10px] tracking-widest">Immediate</h5>
                      </div>
                      <ul className="space-y-3">
                        {result.remediation.immediate.map((item, idx) => (
                          <li key={idx} className="text-xs text-slate-400 flex gap-3 group">
                            <span className="font-mono text-[9px] text-cyan-500/50 mt-0.5">0{idx+1}</span>
                            <span className="group-hover:text-slate-200 transition-colors">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-5">
                      <div className="flex items-center gap-2 text-cyan-400">
                        <FileText size={16} />
                        <h5 className="font-bold uppercase text-[10px] tracking-widest">Policy</h5>
                      </div>
                      <ul className="space-y-3">
                        {result.remediation.policy.map((item, idx) => (
                          <li key={idx} className="text-xs text-slate-400 flex gap-3 group">
                            <span className="font-mono text-[9px] text-cyan-500/50 mt-0.5">0{idx+1}</span>
                            <span className="group-hover:text-slate-200 transition-colors">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-5">
                      <div className="flex items-center gap-2 text-cyan-400">
                        <User size={16} />
                        <h5 className="font-bold uppercase text-[10px] tracking-widest">Community</h5>
                      </div>
                      <ul className="space-y-3">
                        {result.remediation.community.map((item, idx) => (
                          <li key={idx} className="text-xs text-slate-400 flex gap-3 group">
                            <span className="font-mono text-[9px] text-cyan-500/50 mt-0.5">0{idx+1}</span>
                            <span className="group-hover:text-slate-200 transition-colors">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Full Report Markdown */}
                <div className="glass-panel rounded-2xl p-8 space-y-6">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[9px] font-mono uppercase tracking-[0.2em] text-slate-500">Telemetry Log (Markdown)</h4>
                    <button onClick={downloadReport} className="text-[9px] font-mono uppercase text-cyan-500 hover:text-cyan-400 transition-colors flex items-center gap-2">
                      <Download size={12} /> Save Log
                    </button>
                  </div>
                  <div className="prose prose-invert prose-sm max-w-none font-mono text-[10px] bg-black/40 p-6 rounded-xl border border-white/5 overflow-auto max-h-96 custom-scrollbar">
                    <Markdown>{result.fullReportMarkdown}</Markdown>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 p-12 mt-12 bg-ocean-950/50 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="space-y-6 max-w-md">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center rounded-md">
                <Droplets className="text-cyan-400 w-5 h-5" />
              </div>
              <h4 className="font-bold uppercase tracking-tight text-white">MICROSCAN OCEAN</h4>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Global microplastic monitoring and risk assessment network. Utilizing advanced neural processing to safeguard marine ecosystems and public health.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-16">
            <div className="space-y-4">
              <h5 className="text-[9px] font-mono uppercase tracking-[0.3em] text-slate-600">Network Status</h5>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-emerald-400">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  Neural Engine Online
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-cyan-400">
                  <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full" />
                  Satellite Link Active
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h5 className="text-[9px] font-mono uppercase tracking-[0.3em] text-slate-600">Resources</h5>
              <ul className="text-[10px] space-y-2 font-mono uppercase tracking-wider text-slate-500">
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Protocol Docs</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">API Access</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Data Ethics</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-12 mt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[9px] font-mono uppercase tracking-widest text-white">© 2026 - Made by ONLY Paspula Sai Prasad</p>
          <div className="flex gap-6">
            <span className="text-[9px] font-mono text-slate-800 uppercase">LAT: 37.7749 N</span>
            <span className="text-[9px] font-mono text-slate-800 uppercase">LNG: 122.4194 W</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
