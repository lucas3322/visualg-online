'use client';

import { useRef, useState, useCallback } from 'react';
import CodeEditor from '@/components/CodeEditor';
import Terminal, { TerminalHandle } from '@/components/Terminal';
import Toolbar from '@/components/Toolbar';
import TabBar, { Tab } from '@/components/TabBar';
import VarsPanel from '@/components/VarsPanel';
import { Lexer } from '@/lib/visualg-lexer';
import { Parser } from '@/lib/visualg-parser';
import { Interpreter, VisuAlgValue } from '@/lib/visualg-interpreter';
import { formatVisuAlg } from '@/lib/visualg-formatter';

let tabCounter = 1;

const DEFAULT_CODE = `algoritmo "Meu Programa"
var
   nome: caractere
   idade: inteiro
inicio
   escreval("=== Bem-vindo ao VisuAlg! ===")
   escreva("Qual e o seu nome? ")
   leia(nome)
   escreva("Qual e a sua idade? ")
   leia(idade)
   escreval("Ola, ", nome, "! Voce tem ", idade, " anos.")
   se idade >= 18 entao
      escreval("Voce e maior de idade.")
   senao
      escreval("Voce e menor de idade.")
   fimse
fimalgoritmo`;

function makeTab(name: string, code: string): Tab {
  return { id: `tab-${++tabCounter}`, name, code };
}

export default function Home() {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: 'tab-1', name: 'programa.alg', code: DEFAULT_CODE },
  ]);
  const [activeId, setActiveId] = useState('tab-1');
  const [running, setRunning] = useState(false);
  const [vars, setVars] = useState<Record<string, VisuAlgValue>>({});
  const terminalRef = useRef<TerminalHandle>(null);
  const stopRef = useRef(false);

  const activeTab = tabs.find(t => t.id === activeId)!;

  const updateActiveCode = useCallback((code: string) => {
    setTabs(prev => prev.map(t => t.id === activeId ? { ...t, code } : t));
  }, [activeId]);

  const handleAddTab = useCallback(() => {
    const tab = makeTab(`novo-${tabCounter}.alg`, `algoritmo "Novo"\nvar\ninicio\n   escreval("Ola!")\nfimalgoritmo`);
    setTabs(prev => [...prev, tab]);
    setActiveId(tab.id);
  }, []);

  const handleCloseTab = useCallback((id: string) => {
    setTabs(prev => {
      const next = prev.filter(t => t.id !== id);
      if (id === activeId && next.length > 0) {
        const idx = prev.findIndex(t => t.id === id);
        setActiveId(next[Math.min(idx, next.length - 1)].id);
      }
      return next;
    });
  }, [activeId]);

  const handleRename = useCallback((id: string, name: string) => {
    setTabs(prev => prev.map(t => t.id === id ? { ...t, name } : t));
  }, []);

  const handleOpenExample = useCallback((label: string, code: string) => {
    const tab = makeTab(`${label}.alg`, code);
    setTabs(prev => [...prev, tab]);
    setActiveId(tab.id);
  }, []);

  const run = useCallback(async () => {
    if (running) return;
    terminalRef.current?.clear();
    stopRef.current = false;
    setRunning(true);
    setVars({});

    const addLine = terminalRef.current?.addLine.bind(terminalRef.current);
    const code = activeTab.code;

    try {
      const tokens = new Lexer(code).tokenize();
      const ast = new Parser(tokens).parse();

      addLine?.({ type: 'info', text: `▷  Executando "${(ast as any).name}"...\n` });

      let outputBuffer = '';

      const interpreter = new Interpreter({
        onOutput: (text) => {
          outputBuffer += text;
          if (text.endsWith('\n')) {
            const lines = outputBuffer.split('\n');
            for (let i = 0; i < lines.length - 1; i++) {
              addLine?.({ type: 'output', text: lines[i] });
            }
            outputBuffer = lines[lines.length - 1];
          }
        },
        onInput: () => {
          if (outputBuffer) {
            addLine?.({ type: 'output', text: outputBuffer });
            outputBuffer = '';
          }
          return new Promise<string>((resolve, reject) => {
            if (stopRef.current) { reject(new Error('Execução interrompida')); return; }
            terminalRef.current?.requestInput((val) => {
              if (stopRef.current) { reject(new Error('Execução interrompida')); return; }
              resolve(val);
            });
          });
        },
        onVarsUpdate: (snapshot) => {
          setVars({ ...snapshot });
        },
      });

      await interpreter.run(ast);

      if (outputBuffer) addLine?.({ type: 'output', text: outputBuffer });
      addLine?.({ type: 'info', text: '\n✓  Programa finalizado com sucesso.' });
    } catch (e: any) {
      if (!stopRef.current) {
        addLine?.({ type: 'error', text: `\n✗  Erro: ${e.message}` });
      }
    } finally {
      setRunning(false);
    }
  }, [activeTab, running]);

  const stop = useCallback(() => {
    stopRef.current = true;
    setRunning(false);
    terminalRef.current?.addLine({ type: 'error', text: '\n⚠  Execução interrompida pelo usuário.' });
  }, []);

  const clear = useCallback(() => {
    terminalRef.current?.clear();
    setVars({});
  }, []);

  const format = useCallback(() => {
    const formatted = formatVisuAlg(activeTab.code);
    setTabs(prev => prev.map(t => t.id === activeId ? { ...t, code: formatted } : t));
  }, [activeTab, activeId]);

  return (
    <div className="flex flex-col h-screen bg-[#080808] text-white overflow-hidden">
      <Toolbar running={running} onRun={run} onStop={stop} onClear={clear} onFormat={format} />

      <div className="flex flex-1 overflow-hidden">
        {/* Editor area com abas */}
        <div className="flex flex-col flex-1 min-w-0">
          <TabBar
            tabs={tabs}
            activeId={activeId}
            onSelect={setActiveId}
            onClose={handleCloseTab}
            onAdd={handleAddTab}
            onRename={handleRename}
            onOpenExample={handleOpenExample}
          />
          <div className="flex-1 bg-[#0d0d0d] overflow-hidden">
            <CodeEditor value={activeTab.code} onChange={updateActiveCode} />
          </div>
        </div>

        {/* Painel direito: vars + terminal */}
        <div className="flex flex-col w-[400px] flex-shrink-0 p-3 pl-0 gap-3">
          <VarsPanel vars={vars} running={running} />
          <div className="flex-1 min-h-0">
            <Terminal ref={terminalRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
