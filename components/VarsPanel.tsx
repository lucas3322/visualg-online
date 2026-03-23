'use client';

import { Database } from 'lucide-react';
import { VisuAlgValue } from '@/lib/visualg-interpreter';

interface VarsPanelProps {
  vars: Record<string, VisuAlgValue>;
  running: boolean;
}

function formatValue(v: VisuAlgValue): { display: string; badge: string; color: string } {
  if (typeof v === 'boolean') {
    return {
      display: v ? 'VERDADEIRO' : 'FALSO',
      badge: 'lógico',
      color: v ? 'text-emerald-400' : 'text-red-400',
    };
  }
  if (typeof v === 'number') {
    const display = Number.isInteger(v) ? String(v) : v.toFixed(4).replace(/\.?0+$/, '');
    return { display, badge: Number.isInteger(v) ? 'inteiro' : 'real', color: 'text-amber-300' };
  }
  if (typeof v === 'string') {
    return { display: `"${v}"`, badge: 'caractere', color: 'text-emerald-300' };
  }
  if (Array.isArray(v)) {
    const preview = v.slice(1, 6).map(x =>
      typeof x === 'string' ? `"${x}"` :
      typeof x === 'boolean' ? (x ? 'V' : 'F') :
      String(x ?? 0)
    ).join(', ');
    return {
      display: `[${preview}${v.length > 6 ? ', …' : ''}]`,
      badge: 'vetor',
      color: 'text-sky-300',
    };
  }
  return { display: String(v), badge: '?', color: 'text-zinc-400' };
}

export default function VarsPanel({ vars, running }: VarsPanelProps) {
  const entries = Object.entries(vars);
  const isEmpty = entries.length === 0;

  return (
    <div className="bg-[#0d0d0d] rounded-xl border border-zinc-800 overflow-hidden flex-shrink-0">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-zinc-800 bg-[#111111]">
        <Database size={13} className="text-zinc-500" />
        <span className="text-xs font-medium text-zinc-500 tracking-widest uppercase">Variáveis</span>
        {running && (
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            <span className="text-[10px] text-violet-400 font-mono">live</span>
          </div>
        )}
        {!isEmpty && !running && (
          <span className="ml-auto text-[10px] text-zinc-600 font-mono">{entries.length} var{entries.length !== 1 ? 's' : ''}</span>
        )}
      </div>

      {/* Content */}
      <div className="max-h-[200px] overflow-y-auto">
        {isEmpty ? (
          <div className="flex items-center justify-center py-5 text-xs text-zinc-700 font-mono">
            {running ? 'aguardando execução...' : 'execute o programa para ver as variáveis'}
          </div>
        ) : (
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-zinc-800/60">
                <th className="text-left px-4 py-1.5 text-zinc-600 font-medium w-1/3">nome</th>
                <th className="text-left px-2 py-1.5 text-zinc-600 font-medium">valor</th>
                <th className="text-right px-4 py-1.5 text-zinc-600 font-medium">tipo</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(([name, value]) => {
                const { display, badge, color } = formatValue(value);
                return (
                  <tr key={name} className="border-b border-zinc-800/30 hover:bg-zinc-900/40 transition-colors">
                    <td className="px-4 py-1.5 text-violet-300">{name}</td>
                    <td className={`px-2 py-1.5 truncate max-w-[120px] ${color}`}>{display}</td>
                    <td className="px-4 py-1.5 text-right">
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500">{badge}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
