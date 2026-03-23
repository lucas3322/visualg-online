/**
 * Auto-indenta código VisuAlg.
 * Regras de indentação baseadas nas palavras-chave de bloco.
 */

const INDENT = '   '; // 3 espaços (padrão VisuAlg)

// Palavras que REDUZEM o indent ANTES de escrever a linha
const DEDENT_BEFORE = new Set([
  'senao', 'fimse',
  'fimpara', 'fimenquanto',
  'fimfuncao', 'fimprocedimento',
  'fimalgoritmo',
]);

// Palavras que AUMENTAM o indent DEPOIS de escrever a linha
const INDENT_AFTER = new Set([
  'inicio', 'var',
  'entao', 'senao',
  'faca',
  'repita',
  'funcao', 'procedimento',
]);

// Palavras que REDUZEM o indent DEPOIS de escrever a linha
const DEDENT_AFTER = new Set([
  'fimse', 'fimpara', 'fimenquanto',
  'fimfuncao', 'fimprocedimento',
]);

// Palavras que resetam indent para 0
const RESET_ZERO = new Set(['algoritmo', 'fimalgoritmo', 'var', 'inicio']);

// Extrai a primeira palavra-chave de uma linha (lowercase, sem espaços)
function firstKeyword(line: string): string {
  return line.trim().split(/[\s(]/)[0].toLowerCase();
}

export function formatVisuAlg(source: string): string {
  const lines = source.split('\n');
  const result: string[] = [];
  let depth = 0;

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();

    // Linhas vazias ou comentários isolados: mantém sem indent forçado
    if (trimmed === '') {
      result.push('');
      continue;
    }

    const kw = firstKeyword(trimmed);

    // Reset para zero em palavras de nível global
    if (RESET_ZERO.has(kw)) {
      depth = 0;
    }

    // Reduz antes de imprimir
    if (DEDENT_BEFORE.has(kw) && depth > 0) {
      depth--;
    }

    result.push(INDENT.repeat(depth) + trimmed);

    // Aumenta depois de imprimir
    if (INDENT_AFTER.has(kw)) {
      depth++;
    }

    // Reduz depois de imprimir (palavras que fecham e não sobem mais)
    if (DEDENT_AFTER.has(kw) && depth > 0) {
      depth--;
    }

    // "ate" só fecha repita — heurística: se estiver em depth > 0 e for "ate"
    // standalone (não parte de "para x de y ate z faca")
    // Detectamos "ate" sozinho na linha (fecha repita)
    if (kw === 'ate' && !trimmed.toLowerCase().includes(' faca') && depth > 0) {
      depth--;
    }
  }

  return result.join('\n');
}
