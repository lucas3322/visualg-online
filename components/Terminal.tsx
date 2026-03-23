'use client';

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { Terminal as TerminalIcon } from 'lucide-react';

export interface TerminalLine {
  type: 'output' | 'input' | 'error' | 'info' | 'prompt';
  text: string;
}

export interface TerminalHandle {
  addLine: (line: TerminalLine) => void;
  clear: () => void;
  requestInput: (resolve: (val: string) => void) => void;
}

const Terminal = forwardRef<TerminalHandle>((_, ref) => {
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: 'info', text: '▶  VisuAlg Interpreter — pronto para executar.' },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isWaiting, setIsWaiting] = useState(false);
  const [promptText, setPromptText] = useState('');
  const resolverRef = useRef<((val: string) => void) | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  useEffect(() => {
    if (isWaiting) inputRef.current?.focus();
  }, [isWaiting]);

  useImperativeHandle(ref, () => ({
    addLine(line: TerminalLine) {
      setLines(prev => [...prev, line]);
    },
    clear() {
      setLines([{ type: 'info', text: '▶  VisuAlg Interpreter — pronto para executar.' }]);
    },
    requestInput(resolve: (val: string) => void) {
      resolverRef.current = resolve;
      setIsWaiting(true);
      setPromptText('');
    },
  }));

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolverRef.current) return;
    const val = inputValue;
    setLines(prev => [...prev, { type: 'input', text: val }]);
    setInputValue('');
    setIsWaiting(false);
    resolverRef.current(val);
    resolverRef.current = null;
  };

  const lineColor = (type: TerminalLine['type']) => {
    switch (type) {
      case 'error': return 'text-red-400';
      case 'info': return 'text-sky-400';
      case 'input': return 'text-emerald-300';
      case 'prompt': return 'text-yellow-300';
      default: return 'text-zinc-100';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0d0d0d] rounded-xl border border-zinc-800 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-zinc-800 bg-[#111111]">
        <TerminalIcon size={14} className="text-zinc-500" />
        <span className="text-xs font-medium text-zinc-500 tracking-widest uppercase">Terminal</span>
        <div className="ml-auto flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-zinc-700" />
          <div className="w-3 h-3 rounded-full bg-zinc-700" />
          <div className="w-3 h-3 rounded-full bg-zinc-700" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 font-mono text-sm space-y-0.5 leading-relaxed">
        {lines.map((line, i) => (
          <div key={i} className={`whitespace-pre-wrap break-all ${lineColor(line.type)}`}>
            {line.type === 'input' && <span className="text-zinc-600 mr-1">{'>'}</span>}
            {line.text}
          </div>
        ))}

        {isWaiting && (
          <form onSubmit={handleInputSubmit} className="flex items-center gap-2 mt-1">
            <span className="text-emerald-400">{'>'}</span>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              className="flex-1 bg-transparent outline-none text-emerald-300 caret-emerald-400 font-mono text-sm"
              placeholder="digite e pressione Enter..."
              autoFocus
            />
          </form>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
});

Terminal.displayName = 'Terminal';
export default Terminal;
