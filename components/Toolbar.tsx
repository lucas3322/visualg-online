'use client';

import { useState } from 'react';
import { Play, Square, Trash2, AlignLeft, BookOpen, FootprintsIcon, StepForward } from 'lucide-react';
import ReferenceModal from './ReferenceModal';

interface ToolbarProps {
  running: boolean;
  stepping: boolean;
  onRun: () => void;
  onStop: () => void;
  onClear: () => void;
  onFormat: () => void;
  onStartStep: () => void;
  onNextStep: () => void;
}

export default function Toolbar({
  running, stepping, onRun, onStop, onClear, onFormat, onStartStep, onNextStep,
}: ToolbarProps) {
  const [refOpen, setRefOpen] = useState(false);

  return (
    <>
      <header className="flex items-center gap-3 px-6 py-3 border-b border-zinc-800 bg-[#0a0a0a]">
        {/* Logo */}
        <div className="flex items-center gap-3 mr-4">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <span className="text-white text-xs font-black">V</span>
          </div>
          <div>
            <div className="text-sm font-bold text-white tracking-tight">VisuAlg</div>
            <div className="text-[10px] text-zinc-500 -mt-0.5 tracking-wider">INTERPRETER</div>
          </div>
        </div>

        <div className="h-4 w-px bg-zinc-800" />

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Executar / Parar */}
          {!running && !stepping ? (
            <button
              onClick={onRun}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-all duration-150 shadow-lg shadow-violet-500/20 active:scale-95"
            >
              <Play size={13} className="fill-white" />
              Executar
            </button>
          ) : (running && !stepping) ? (
            <button
              onClick={onStop}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition-all duration-150 shadow-lg shadow-red-500/20 active:scale-95 animate-pulse"
            >
              <Square size={13} className="fill-white" />
              Parar
            </button>
          ) : null}

          {/* Passo a passo / Próximo passo */}
          {!running && !stepping ? (
            <button
              onClick={onStartStep}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 border border-amber-600/40 text-amber-400 hover:text-amber-300 text-xs font-medium transition-all duration-150 active:scale-95"
              title="Executar passo a passo"
            >
              <FootprintsIcon size={13} />
              Passo a Passo
            </button>
          ) : stepping ? (
            <div className="flex items-center gap-2">
              <button
                onClick={onNextStep}
                className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all duration-150 shadow-lg shadow-amber-500/20 active:scale-95"
              >
                <StepForward size={13} />
                Próximo
              </button>
              <button
                onClick={onStop}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 border border-red-600/40 text-red-400 hover:text-red-300 text-xs font-medium transition-all duration-150 active:scale-95"
              >
                <Square size={13} />
                Parar
              </button>
            </div>
          ) : null}

          <div className="h-4 w-px bg-zinc-800 mx-1" />

          <button
            onClick={onFormat}
            disabled={running || stepping}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 text-xs font-medium transition-all duration-150 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <AlignLeft size={13} />
            Indentar
          </button>

          <button
            onClick={onClear}
            disabled={running || stepping}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 text-xs font-medium transition-all duration-150 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Trash2 size={13} />
            Limpar
          </button>

          <button
            onClick={() => setRefOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 text-xs font-medium transition-all duration-150 active:scale-95"
          >
            <BookOpen size={13} />
            Referência
          </button>
        </div>

        {/* Status */}
        {running && !stepping && (
          <div className="flex items-center gap-2 ml-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs text-emerald-400 font-mono">executando...</span>
          </div>
        )}
        {stepping && (
          <div className="flex items-center gap-2 ml-2">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs text-amber-400 font-mono">modo passo a passo</span>
          </div>
        )}

        <div className="ml-auto flex items-center gap-4">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="text-[10px] text-zinc-500 font-mono">VisuAlg 2.5</span>
          </div>
        </div>
      </header>

      <ReferenceModal open={refOpen} onClose={() => setRefOpen(false)} />
    </>
  );
}
