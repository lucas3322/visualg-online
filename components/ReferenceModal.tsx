'use client';

import { useState, useEffect } from 'react';
import { X, BookOpen, ChevronRight } from 'lucide-react';

interface Section {
  id: string;
  label: string;
  icon: string;
}

const SECTIONS: Section[] = [
  { id: 'tipos', label: 'Tipos de Variáveis', icon: '📦' },
  { id: 'operadores', label: 'Operadores', icon: '⚙️' },
  { id: 'io', label: 'Entrada e Saída', icon: '💬' },
  { id: 'controle', label: 'Controle de Fluxo', icon: '🔀' },
  { id: 'lacos', label: 'Laços de Repetição', icon: '🔁' },
  { id: 'funcoes', label: 'Funções Nativas', icon: '🧮' },
];

const CODE = (s: string) => (
  <code className="font-mono text-violet-300 bg-zinc-800/80 px-1 py-0.5 rounded text-[11px]">{s}</code>
);

const Block = ({ code }: { code: string }) => (
  <pre className="bg-[#0d0d0d] border border-zinc-800 rounded-lg p-3 text-[11px] font-mono text-zinc-300 leading-relaxed overflow-x-auto whitespace-pre">
    {code.trim()}
  </pre>
);

const Tag = ({ color, label }: { color: string; label: string }) => (
  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${color}`}>{label}</span>
);

const CONTENT: Record<string, React.ReactNode> = {
  tipos: (
    <div className="space-y-5">
      <p className="text-zinc-400 text-xs leading-relaxed">
        Todas as variáveis devem ser declaradas na seção <code className="text-violet-300 font-mono">var</code>, antes de {CODE('inicio')}.
        A sintaxe é: {CODE('nome : tipo')}
      </p>

      {[
        {
          type: 'inteiro',
          color: 'bg-amber-500/10 border-amber-500/30',
          badge: <Tag color="bg-amber-500/20 text-amber-300" label="inteiro" />,
          desc: 'Números inteiros, positivos ou negativos, sem casas decimais.',
          range: 'Intervalo: -2.147.483.648 até 2.147.483.647',
          code: `var\n   idade: inteiro\n   contador: inteiro\ninicio\n   idade <- 20\n   contador <- contador + 1\n   escreval("Idade: ", idade)`,
        },
        {
          type: 'real',
          color: 'bg-sky-500/10 border-sky-500/30',
          badge: <Tag color="bg-sky-500/20 text-sky-300" label="real" />,
          desc: 'Números com casas decimais (ponto flutuante). Use ponto como separador.',
          range: 'Ex: 3.14, -0.5, 1000.99',
          code: `var\n   preco: real\n   desconto: real\ninicio\n   preco <- 49.90\n   desconto <- preco * 0.1\n   escreval("Desconto: ", desconto:0:2)`,
        },
        {
          type: 'logico',
          color: 'bg-emerald-500/10 border-emerald-500/30',
          badge: <Tag color="bg-emerald-500/20 text-emerald-300" label="lógico" />,
          desc: 'Armazena apenas dois valores: VERDADEIRO ou FALSO.',
          range: 'Valores: verdadeiro / falso',
          code: `var\n   aprovado: logico\n   maior: logico\ninicio\n   aprovado <- verdadeiro\n   maior <- 10 > 5\n   se aprovado entao\n      escreval("Passou!")\n   fimse`,
        },
        {
          type: 'caractere',
          color: 'bg-pink-500/10 border-pink-500/30',
          badge: <Tag color="bg-pink-500/20 text-pink-300" label="caractere" />,
          desc: 'Texto (string). Valores entre aspas duplas.',
          range: 'Ex: "Olá", "João", "A"',
          code: `var\n   nome: caractere\n   letra: caractere\ninicio\n   nome <- "Maria"\n   escreva("Digite seu nome: ")\n   leia(nome)\n   escreval("Ola, ", nome)`,
        },
        {
          type: 'vetor',
          color: 'bg-violet-500/10 border-violet-500/30',
          badge: <Tag color="bg-violet-500/20 text-violet-300" label="vetor" />,
          desc: 'Array de valores do mesmo tipo. Índice começa em 1 por convenção.',
          range: 'Sintaxe: vetor[inicio..fim] de tipo',
          code: `var\n   notas: vetor[1..5] de real\n   i: inteiro\ninicio\n   para i de 1 ate 5 faca\n      leia(notas[i])\n   fimpara\n   escreval("Nota 1: ", notas[1])`,
        },
      ].map(item => (
        <div key={item.type} className={`border rounded-lg p-4 space-y-2.5 ${item.color}`}>
          <div className="flex items-center gap-2">
            {item.badge}
            <span className="text-xs text-zinc-400">{item.desc}</span>
          </div>
          <p className="text-[10px] text-zinc-600 font-mono">{item.range}</p>
          <Block code={item.code} />
        </div>
      ))}
    </div>
  ),

  operadores: (
    <div className="space-y-5">
      {[
        {
          title: 'Aritméticos',
          rows: [
            ['+', 'Adição', 'a + b'],
            ['-', 'Subtração', 'a - b'],
            ['*', 'Multiplicação', 'a * b'],
            ['/', 'Divisão real', 'a / b'],
            ['div', 'Divisão inteira', '7 div 2  →  3'],
            ['mod', 'Resto da divisão', '7 mod 2  →  1'],
            ['^', 'Potenciação', '2 ^ 8  →  256'],
          ],
        },
        {
          title: 'Relacionais',
          rows: [
            ['=', 'Igual a', 'a = b'],
            ['<>', 'Diferente de', 'a <> b'],
            ['<', 'Menor que', 'a < b'],
            ['>', 'Maior que', 'a > b'],
            ['<=', 'Menor ou igual', 'a <= b'],
            ['>=', 'Maior ou igual', 'a >= b'],
          ],
        },
        {
          title: 'Lógicos',
          rows: [
            ['e', 'E lógico (AND)', '(a > 0) e (b > 0)'],
            ['ou', 'OU lógico (OR)', '(a = 1) ou (b = 1)'],
            ['nao', 'NÃO lógico (NOT)', 'nao (a = b)'],
          ],
        },
        {
          title: 'Atribuição',
          rows: [
            ['<-', 'Atribui valor à variável', 'x <- 10'],
          ],
        },
      ].map(group => (
        <div key={group.title}>
          <h3 className="text-xs font-semibold text-zinc-400 mb-2">{group.title}</h3>
          <div className="bg-[#0d0d0d] border border-zinc-800 rounded-lg overflow-hidden">
            <table className="w-full text-xs font-mono">
              <tbody>
                {group.rows.map(([op, desc, ex]) => (
                  <tr key={op} className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-900/40">
                    <td className="px-3 py-2 text-violet-300 w-12">{op}</td>
                    <td className="px-3 py-2 text-zinc-400">{desc}</td>
                    <td className="px-3 py-2 text-emerald-300/70">{ex}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  ),

  io: (
    <div className="space-y-5">
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-zinc-400 flex items-center gap-2">
          <span className="text-emerald-400">escreva()</span>
          <Tag color="bg-zinc-800 text-zinc-500" label="saída" />
        </h3>
        <p className="text-xs text-zinc-500 leading-relaxed">Imprime na tela sem pular linha. Aceita múltiplos argumentos separados por vírgula.</p>
        <Block code={`escreva("Resultado: ", x)\nescreva("a=", a, " b=", b)`} />
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-zinc-400 flex items-center gap-2">
          <span className="text-emerald-400">escreval()</span>
          <Tag color="bg-zinc-800 text-zinc-500" label="saída + nova linha" />
        </h3>
        <p className="text-xs text-zinc-500 leading-relaxed">Igual ao {CODE('escreva')}, mas pula uma linha no final.</p>
        <Block code={`escreval("Linha 1")\nescreval("Linha 2")\nescreval("Valor: ", x:0:2)`} />
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-zinc-400 flex items-center gap-2">
          <span className="text-sky-400">leia()</span>
          <Tag color="bg-zinc-800 text-zinc-500" label="entrada" />
        </h3>
        <p className="text-xs text-zinc-500 leading-relaxed">Lê um valor digitado pelo usuário e armazena na variável. Aceita múltiplas variáveis.</p>
        <Block code={`leia(nome)\nleia(a, b, c)\nleia(vetor[i])`} />
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-zinc-400 flex items-center gap-2">
          <span className="text-amber-400">Formatação numérica</span>
          <Tag color="bg-amber-500/20 text-amber-300" label="expr:largura:decimais" />
        </h3>
        <p className="text-xs text-zinc-500 leading-relaxed">
          Controla a exibição de números. <code className="text-zinc-300 font-mono">largura</code> define espaços totais (0 = sem padding), <code className="text-zinc-300 font-mono">decimais</code> define casas decimais.
        </p>
        <Block code={`escreval(pi:0:4)       // 3.1416\nescreval(valor:8:2)    //   123.50  (8 chars)\nescreval(n:0:0)        // sem decimais`} />
      </div>
    </div>
  ),

  controle: (
    <div className="space-y-5">
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-zinc-400">se / entao / senao / fimse</h3>
        <p className="text-xs text-zinc-500 leading-relaxed">Executa um bloco de código condicionalmente. O {CODE('senao')} é opcional.</p>
        <Block code={`se condicao entao\n   // bloco se verdadeiro\nsenao\n   // bloco se falso\nfimse`} />
        <Block code={`se (nota >= 6) e (faltas <= 25) entao\n   escreval("Aprovado!")\nsenao\n   escreval("Reprovado.")\nfimse`} />
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-zinc-400">se aninhado</h3>
        <p className="text-xs text-zinc-500 leading-relaxed">Condições dentro de condições para múltiplos casos.</p>
        <Block code={`se nota >= 9 entao\n   escreval("A")\nsenao\n   se nota >= 7 entao\n      escreval("B")\n   senao\n      escreval("C")\n   fimse\nfimse`} />
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-zinc-400">interrompa</h3>
        <p className="text-xs text-zinc-500 leading-relaxed">Encerra imediatamente o laço mais interno.</p>
        <Block code={`para i de 1 ate 100 faca\n   se i mod 7 = 0 entao\n      escreval("Primeiro mult. de 7: ", i)\n      interrompa\n   fimse\nfimpara`} />
      </div>
    </div>
  ),

  lacos: (
    <div className="space-y-5">
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-zinc-400">para / de / ate / faca / fimpara</h3>
        <p className="text-xs text-zinc-500 leading-relaxed">Repete um bloco um número determinado de vezes. Use {CODE('passo')} para incremento diferente de 1.</p>
        <Block code={`para i de 1 ate 10 faca\n   escreval(i)\nfimpara\n\n// Contagem regressiva (passo negativo)\npara i de 10 ate 1 passo -1 faca\n   escreva(i, " ")\nfimpara`} />
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-zinc-400">enquanto / faca / fimenquanto</h3>
        <p className="text-xs text-zinc-500 leading-relaxed">Testa a condição <strong className="text-zinc-300">antes</strong> de cada iteração. Pode não executar nenhuma vez.</p>
        <Block code={`enquanto x > 0 faca\n   x <- x div 2\n   contador <- contador + 1\nfimenquanto\nescreval("Bits: ", contador)`} />
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-zinc-400">repita / ate</h3>
        <p className="text-xs text-zinc-500 leading-relaxed">Testa a condição <strong className="text-zinc-300">depois</strong> de cada iteração. Executa ao menos uma vez. Para quando a condição for <strong className="text-zinc-300">verdadeira</strong>.</p>
        <Block code={`repita\n   escreva("Digite um numero positivo: ")\n   leia(n)\nate n > 0\nescreval("Voce digitou: ", n)`} />
      </div>
    </div>
  ),

  funcoes: (
    <div className="space-y-5">
      <p className="text-zinc-400 text-xs leading-relaxed">Funções matemáticas e de string disponíveis nativamente. Chamadas diretamente em expressões.</p>

      {[
        {
          title: 'Matemáticas',
          color: 'text-amber-300',
          fns: [
            ['abs(x)', 'Valor absoluto', 'abs(-5) → 5'],
            ['int(x)', 'Parte inteira (trunca)', 'int(3.9) → 3'],
            ['sqrt(x) / raizq(x)', 'Raiz quadrada', 'sqrt(16) → 4'],
            ['exp(x)', 'e elevado a x', 'exp(1) → 2.718'],
            ['log(x)', 'Logaritmo natural (base e)', 'log(1) → 0'],
            ['log2(x)', 'Logaritmo base 2', 'log2(8) → 3'],
            ['pi()', 'Retorna π', 'pi() → 3.14159'],
            ['rand()', 'Número aleatório [0,1)', ''],
            ['randi(n)', 'Inteiro aleatório [1,n]', 'randi(6)'],
          ],
        },
        {
          title: 'Trigonométricas (graus)',
          color: 'text-sky-300',
          fns: [
            ['sen(x)', 'Seno em graus', 'sen(90) → 1'],
            ['cos(x)', 'Cosseno em graus', 'cos(0) → 1'],
            ['tan(x)', 'Tangente em graus', 'tan(45) → 1'],
            ['arctan(x)', 'Arco tangente (→ graus)', ''],
          ],
        },
        {
          title: 'Strings (caractere)',
          color: 'text-emerald-300',
          fns: [
            ['compr(s)', 'Comprimento da string', 'compr("abc") → 3'],
            ['maiusc(s)', 'Converte para maiúsculas', 'maiusc("ab") → "AB"'],
            ['minusc(s)', 'Converte para minúsculas', 'minusc("AB") → "ab"'],
            ['copia(s,i,n)', 'Subcadeia de i com n chars', 'copia("abcde",2,3) → "bcd"'],
            ['pos(sub, s)', 'Posição de sub em s (0=não achou)', 'pos("b","abc") → 2'],
            ['concat(a, b)', 'Concatena strings', 'concat("Oi","!") → "Oi!"'],
            ['asc(c)', 'Código ASCII do caractere', 'asc("A") → 65'],
            ['carac(n)', 'Caractere de código ASCII', 'carac(65) → "A"'],
          ],
        },
      ].map(group => (
        <div key={group.title}>
          <h3 className={`text-xs font-semibold mb-2 ${group.color}`}>{group.title}</h3>
          <div className="bg-[#0d0d0d] border border-zinc-800 rounded-lg overflow-hidden">
            <table className="w-full text-xs font-mono">
              <tbody>
                {group.fns.map(([fn, desc, ex]) => (
                  <tr key={fn} className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-900/40">
                    <td className="px-3 py-2 text-violet-300 whitespace-nowrap">{fn}</td>
                    <td className="px-3 py-2 text-zinc-400">{desc}</td>
                    <td className="px-3 py-2 text-emerald-300/60 whitespace-nowrap">{ex}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  ),
};

interface ReferenceModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ReferenceModal({ open, onClose }: ReferenceModalProps) {
  const [active, setActive] = useState('tipos');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-3xl h-[80vh] bg-[#0f0f0f] border border-zinc-700 rounded-2xl shadow-2xl shadow-black flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-zinc-800 bg-[#111111] shrink-0">
          <BookOpen size={15} className="text-violet-400" />
          <div>
            <span className="text-sm font-semibold text-white">Referência VisuAlg</span>
            <span className="ml-2 text-[10px] text-zinc-600 font-mono">guia de variáveis e comandos</span>
          </div>
          <button
            onClick={onClose}
            className="ml-auto text-zinc-600 hover:text-zinc-300 transition-colors p-1 rounded-lg hover:bg-zinc-800"
          >
            <X size={15} />
          </button>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Sidebar */}
          <nav className="w-48 shrink-0 border-r border-zinc-800 bg-[#0a0a0a] py-2">
            {SECTIONS.map(s => (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={`
                  w-full flex items-center gap-2.5 px-4 py-2.5 text-xs transition-all text-left
                  ${active === s.id
                    ? 'text-white bg-zinc-800/80 border-r-2 border-violet-500'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'}
                `}
              >
                <span className="text-sm">{s.icon}</span>
                <span className="font-medium">{s.label}</span>
                {active === s.id && <ChevronRight size={10} className="ml-auto text-violet-400" />}
              </button>
            ))}
          </nav>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5">
            {CONTENT[active]}
          </div>
        </div>
      </div>
    </div>
  );
}
