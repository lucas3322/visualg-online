'use client';

import { Play, Square, Trash2, AlignLeft } from 'lucide-react';

interface ToolbarProps {
  running: boolean;
  onRun: () => void;
  onStop: () => void;
  onClear: () => void;
  onFormat: () => void;
}

export default function Toolbar({ running, onRun, onStop, onClear, onFormat }: ToolbarProps) {
  return (
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
        {!running ? (
          <button
            onClick={onRun}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-all duration-150 shadow-lg shadow-violet-500/20 active:scale-95"
          >
            <Play size={13} className="fill-white" />
            Executar
          </button>
        ) : (
          <button
            onClick={onStop}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition-all duration-150 shadow-lg shadow-red-500/20 active:scale-95 animate-pulse"
          >
            <Square size={13} className="fill-white" />
            Parar
          </button>
        )}

        <button
          onClick={onFormat}
          disabled={running}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 text-xs font-medium transition-all duration-150 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
          title="Indentar código (Alt+Shift+F)"
        >
          <AlignLeft size={13} />
          Indentar
        </button>

        <button
          onClick={onClear}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 text-xs font-medium transition-all duration-150 active:scale-95"
        >
          <Trash2 size={13} />
          Limpar
        </button>
      </div>

      {running && (
        <div className="flex items-center gap-2 ml-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs text-emerald-400 font-mono">executando...</span>
        </div>
      )}

      <div className="ml-auto flex items-center gap-4">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span className="text-[10px] text-zinc-500 font-mono">VisuAlg 2.5</span>
        </div>

      </div>
    </header>
  );
}
