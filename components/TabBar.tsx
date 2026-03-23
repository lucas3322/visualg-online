'use client';

import { useRef, useState } from 'react';
import { X, Plus, ChevronDown } from 'lucide-react';

export interface Tab {
  id: string;
  name: string;
  code: string;
}

const EXAMPLES = [
  {
    label: 'Olá Mundo',
    code: `algoritmo "Ola Mundo"
var
   nome: caractere
inicio
   escreva("Qual e o seu nome? ")
   leia(nome)
   escreval("Ola, ", nome, "!")
fimalgoritmo`,
  },
  {
    label: 'Fatorial',
    code: `algoritmo "Fatorial"
var
   n, fat, i: inteiro
inicio
   escreva("Digite um numero: ")
   leia(n)
   fat <- 1
   para i de 1 ate n faca
      fat <- fat * i
   fimpara
   escreval("Fatorial de ", n, " = ", fat)
fimalgoritmo`,
  },
  {
    label: 'Fibonacci',
    code: `algoritmo "Fibonacci"
var
   n, a, b, temp, i: inteiro
inicio
   escreva("Quantos termos? ")
   leia(n)
   a <- 0
   b <- 1
   escreva(a, " ")
   para i de 1 ate n - 1 faca
      escreva(b, " ")
      temp <- a + b
      a <- b
      b <- temp
   fimpara
   escreval("")
fimalgoritmo`,
  },
  {
    label: 'Verificar Primo',
    code: `algoritmo "Primo"
var
   n, i: inteiro
   primo: logico
inicio
   escreva("Digite um numero: ")
   leia(n)
   primo <- verdadeiro
   se n < 2 entao
      primo <- falso
   fimse
   i <- 2
   enquanto (i * i <= n) e primo faca
      se n mod i = 0 entao
         primo <- falso
      fimse
      i <- i + 1
   fimenquanto
   se primo entao
      escreval(n, " e primo.")
   senao
      escreval(n, " nao e primo.")
   fimse
fimalgoritmo`,
  },
  {
    label: 'Média com Vetor',
    code: `algoritmo "Media"
var
   notas: vetor[1..5] de real
   soma, media: real
   i: inteiro
inicio
   soma <- 0
   para i de 1 ate 5 faca
      escreva("Nota ", i, ": ")
      leia(notas[i])
      soma <- soma + notas[i]
   fimpara
   media <- soma / 5
   escreval("Media: ", media)
   se media >= 6 entao
      escreval("Aprovado!")
   senao
      escreval("Reprovado!")
   fimse
fimalgoritmo`,
  },
  {
    label: 'Bubble Sort',
    code: `algoritmo "BubbleSort"
var
   v: vetor[1..10] de inteiro
   i, j, temp, n: inteiro
inicio
   n <- 10
   escreval("Digite 10 numeros:")
   para i de 1 ate n faca
      escreva("v[", i, "]: ")
      leia(v[i])
   fimpara
   para i de 1 ate n - 1 faca
      para j de 1 ate n - i faca
         se v[j] > v[j + 1] entao
            temp <- v[j]
            v[j] <- v[j + 1]
            v[j + 1] <- temp
         fimse
      fimpara
   fimpara
   escreval("Vetor ordenado:")
   para i de 1 ate n faca
      escreva(v[i], " ")
   fimpara
   escreval("")
fimalgoritmo`,
  },
  {
    label: 'Calculadora',
    code: `algoritmo "Calculadora"
var
   a, b, resultado: real
   op: caractere
inicio
   escreval("=== Calculadora ===")
   escreva("Primeiro numero: ")
   leia(a)
   escreva("Operador (+, -, *, /): ")
   leia(op)
   escreva("Segundo numero: ")
   leia(b)
   se op = "+" entao
      resultado <- a + b
   senao
      se op = "-" entao
         resultado <- a - b
      senao
         se op = "*" entao
            resultado <- a * b
         senao
            se op = "/" entao
               se b <> 0 entao
                  resultado <- a / b
               senao
                  escreval("Erro: divisao por zero!")
                  interrompa
               fimse
            fimse
         fimse
      fimse
   fimse
   escreval("Resultado: ", resultado)
fimalgoritmo`,
  },
];

export { EXAMPLES };

interface TabBarProps {
  tabs: Tab[];
  activeId: string;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
  onAdd: () => void;
  onRename: (id: string, name: string) => void;
  onOpenExample: (label: string, code: string) => void;
}

export default function TabBar({
  tabs, activeId, onSelect, onClose, onAdd, onRename, onOpenExample,
}: TabBarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showExamples, setShowExamples] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const startEdit = (tab: Tab, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(tab.id);
    setEditValue(tab.name);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const commitEdit = () => {
    if (editingId && editValue.trim()) {
      onRename(editingId, editValue.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="flex items-end gap-0 px-3 pt-2 bg-[#0a0a0a] border-b border-zinc-800 min-h-[38px] relative">
      {/* Tabs */}
      <div className="flex items-end gap-1 flex-1 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const isActive = tab.id === activeId;
          return (
            <div
              key={tab.id}
              onClick={() => onSelect(tab.id)}
              onDoubleClick={(e) => startEdit(tab, e)}
              className={`
                group flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg cursor-pointer select-none
                text-xs font-medium transition-all duration-100 min-w-0 max-w-[160px] shrink-0
                ${isActive
                  ? 'bg-[#0d0d0d] text-zinc-200 border border-b-0 border-zinc-700'
                  : 'bg-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 border border-transparent'
                }
              `}
            >
              {/* Dot indicator for active */}
              {isActive && <div className="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />}

              {/* Name or input */}
              {editingId === tab.id ? (
                <input
                  ref={inputRef}
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  onBlur={commitEdit}
                  onKeyDown={e => {
                    if (e.key === 'Enter') commitEdit();
                    if (e.key === 'Escape') setEditingId(null);
                    e.stopPropagation();
                  }}
                  onClick={e => e.stopPropagation()}
                  className="bg-transparent outline-none w-[80px] text-zinc-200 font-mono"
                  autoFocus
                />
              ) : (
                <span className="truncate font-mono">{tab.name}</span>
              )}

              {/* Close button */}
              {tabs.length > 1 && (
                <button
                  onClick={e => { e.stopPropagation(); onClose(tab.id); }}
                  className={`
                    rounded p-0.5 transition-all shrink-0
                    ${isActive ? 'opacity-40 hover:opacity-100 hover:bg-zinc-700' : 'opacity-0 group-hover:opacity-40 hover:!opacity-100 hover:bg-zinc-700'}
                  `}
                >
                  <X size={10} />
                </button>
              )}
            </div>
          );
        })}

        {/* Add tab button */}
        <button
          onClick={onAdd}
          className="flex items-center justify-center w-6 h-6 mb-1 ml-0.5 rounded text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-all shrink-0"
          title="Nova aba"
        >
          <Plus size={13} />
        </button>
      </div>

      {/* Examples dropdown */}
      <div className="relative shrink-0 mb-1 ml-2" ref={dropdownRef}>
        <button
          onClick={() => setShowExamples(v => !v)}
          className="flex items-center gap-1 px-2.5 py-1 rounded text-xs text-zinc-500 hover:text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-all"
        >
          Exemplos
          <ChevronDown size={11} className={`transition-transform ${showExamples ? 'rotate-180' : ''}`} />
        </button>

        {showExamples && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowExamples(false)}
            />
            <div className="absolute right-0 top-full mt-1 z-20 bg-[#161616] border border-zinc-700 rounded-lg shadow-2xl shadow-black/60 overflow-hidden min-w-[160px]">
              {EXAMPLES.map(ex => (
                <button
                  key={ex.label}
                  onClick={() => {
                    onOpenExample(ex.label, ex.code);
                    setShowExamples(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors font-mono"
                >
                  {ex.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
