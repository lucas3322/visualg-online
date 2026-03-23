export type TokenType =
  | 'ALGORITMO' | 'VAR' | 'INICIO' | 'FIMALGORITMO'
  | 'SE' | 'ENTAO' | 'SENAO' | 'FIMSE'
  | 'PARA' | 'DE' | 'ATE' | 'PASSO' | 'FACA' | 'FIMPARA'
  | 'ENQUANTO' | 'FIMENQUANTO'
  | 'REPITA' | 'REPITA_ATE'
  | 'ESCREVA' | 'ESCREVAL' | 'LEIA'
  | 'INTEIRO' | 'REAL' | 'LOGICO' | 'CARACTERE' | 'VETOR'
  | 'VERDADEIRO' | 'FALSO'
  | 'E' | 'OU' | 'NAO'
  | 'DIV' | 'MOD'
  | 'IDENTIFIER' | 'NUMBER' | 'STRING'
  | 'ASSIGN' | 'PLUS' | 'MINUS' | 'MULT' | 'DIV_OP' | 'POW'
  | 'EQ' | 'NEQ' | 'LT' | 'GT' | 'LTE' | 'GTE'
  | 'LPAREN' | 'RPAREN' | 'LBRACKET' | 'RBRACKET'
  | 'COMMA' | 'COLON' | 'DOTDOT'
  | 'NEWLINE' | 'EOF'
  | 'FUNCAO' | 'PROCEDIMENTO' | 'RETORNE' | 'FIMFUNCAO' | 'FIMPROCEDIMENTO'
  | 'INTERROMPA';

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  col: number;
}

const KEYWORDS: Record<string, TokenType> = {
  'algoritmo': 'ALGORITMO',
  'var': 'VAR',
  'inicio': 'INICIO',
  'fimalgoritmo': 'FIMALGORITMO',
  'se': 'SE',
  'entao': 'ENTAO',
  'senao': 'SENAO',
  'fimse': 'FIMSE',
  'para': 'PARA',
  'de': 'DE',
  'ate': 'ATE',
  'passo': 'PASSO',
  'faca': 'FACA',
  'fimpara': 'FIMPARA',
  'enquanto': 'ENQUANTO',
  'fimenquanto': 'FIMENQUANTO',
  'repita': 'REPITA',
  'escreva': 'ESCREVA',
  'escreval': 'ESCREVAL',
  'leia': 'LEIA',
  'inteiro': 'INTEIRO',
  'real': 'REAL',
  'logico': 'LOGICO',
  'caractere': 'CARACTERE',
  'vetor': 'VETOR',
  'verdadeiro': 'VERDADEIRO',
  'falso': 'FALSO',
  'e': 'E',
  'ou': 'OU',
  'nao': 'NAO',
  'div': 'DIV',
  'mod': 'MOD',
  'funcao': 'FUNCAO',
  'procedimento': 'PROCEDIMENTO',
  'retorne': 'RETORNE',
  'fimfuncao': 'FIMFUNCAO',
  'fimprocedimento': 'FIMPROCEDIMENTO',
  'interrompa': 'INTERROMPA',
};

export class Lexer {
  private pos = 0;
  private line = 1;
  private col = 1;
  private tokens: Token[] = [];

  constructor(private source: string) {}

  tokenize(): Token[] {
    while (this.pos < this.source.length) {
      this.skipWhitespaceAndComments();
      if (this.pos >= this.source.length) break;

      const ch = this.source[this.pos];

      if (ch === '\n') {
        this.tokens.push({ type: 'NEWLINE', value: '\n', line: this.line, col: this.col });
        this.line++;
        this.col = 1;
        this.pos++;
        continue;
      }

      if (ch === '\r') {
        this.pos++;
        continue;
      }

      if (/\d/.test(ch)) { this.readNumber(); continue; }
      if (ch === '"') { this.readString(); continue; }
      if (/[a-zA-ZáàãâéêíóôõúüçÁÀÃÂÉÊÍÓÔÕÚÜÇ_]/.test(ch)) { this.readIdentifier(); continue; }

      const startCol = this.col;
      switch (ch) {
        case '<':
          if (this.peek(1) === '-') { this.addToken('ASSIGN', '<-', startCol); this.pos += 2; this.col += 2; }
          else if (this.peek(1) === '>') { this.addToken('NEQ', '<>', startCol); this.pos += 2; this.col += 2; }
          else if (this.peek(1) === '=') { this.addToken('LTE', '<=', startCol); this.pos += 2; this.col += 2; }
          else { this.addToken('LT', '<', startCol); this.pos++; this.col++; }
          break;
        case '>':
          if (this.peek(1) === '=') { this.addToken('GTE', '>=', startCol); this.pos += 2; this.col += 2; }
          else { this.addToken('GT', '>', startCol); this.pos++; this.col++; }
          break;
        case ':':
          if (this.peek(1) === '=') { this.addToken('ASSIGN', ':=', startCol); this.pos += 2; this.col += 2; }
          else { this.addToken('COLON', ':', startCol); this.pos++; this.col++; }
          break;
        case '.':
          if (this.peek(1) === '.') { this.addToken('DOTDOT', '..', startCol); this.pos += 2; this.col += 2; }
          else { this.pos++; this.col++; }
          break;
        case '=': this.addToken('EQ', '=', startCol); this.pos++; this.col++; break;
        case '+': this.addToken('PLUS', '+', startCol); this.pos++; this.col++; break;
        case '-': this.addToken('MINUS', '-', startCol); this.pos++; this.col++; break;
        case '*': this.addToken('MULT', '*', startCol); this.pos++; this.col++; break;
        case '/': this.addToken('DIV_OP', '/', startCol); this.pos++; this.col++; break;
        case '^': this.addToken('POW', '^', startCol); this.pos++; this.col++; break;
        case '(': this.addToken('LPAREN', '(', startCol); this.pos++; this.col++; break;
        case ')': this.addToken('RPAREN', ')', startCol); this.pos++; this.col++; break;
        case '[': this.addToken('LBRACKET', '[', startCol); this.pos++; this.col++; break;
        case ']': this.addToken('RBRACKET', ']', startCol); this.pos++; this.col++; break;
        case ',': this.addToken('COMMA', ',', startCol); this.pos++; this.col++; break;
        default: this.pos++; this.col++;
      }
    }

    this.tokens.push({ type: 'EOF', value: '', line: this.line, col: this.col });
    return this.tokens;
  }

  private addToken(type: TokenType, value: string, col: number) {
    this.tokens.push({ type, value, line: this.line, col });
  }

  private peek(offset = 1): string {
    return this.source[this.pos + offset] ?? '';
  }

  private skipWhitespaceAndComments() {
    while (this.pos < this.source.length) {
      const ch = this.source[this.pos];
      if (ch === ' ' || ch === '\t') { this.pos++; this.col++; continue; }
      if (ch === '/' && this.peek() === '/') {
        while (this.pos < this.source.length && this.source[this.pos] !== '\n') this.pos++;
        continue;
      }
      if (ch === '{') {
        while (this.pos < this.source.length && this.source[this.pos] !== '}') this.pos++;
        this.pos++;
        continue;
      }
      break;
    }
  }

  private readNumber() {
    const startCol = this.col;
    let num = '';
    while (this.pos < this.source.length && /[\d.]/.test(this.source[this.pos])) {
      num += this.source[this.pos];
      this.pos++;
      this.col++;
    }
    this.tokens.push({ type: 'NUMBER', value: num, line: this.line, col: startCol });
  }

  private readString() {
    const startCol = this.col;
    this.pos++; this.col++;
    let str = '';
    while (this.pos < this.source.length && this.source[this.pos] !== '"') {
      str += this.source[this.pos];
      this.pos++;
      this.col++;
    }
    this.pos++; this.col++;
    this.tokens.push({ type: 'STRING', value: str, line: this.line, col: startCol });
  }

  private readIdentifier() {
    const startCol = this.col;
    let id = '';
    while (this.pos < this.source.length && /[a-zA-ZáàãâéêíóôõúüçÁÀÃÂÉÊÍÓÔÕÚÜÇ_\d]/.test(this.source[this.pos])) {
      id += this.source[this.pos];
      this.pos++;
      this.col++;
    }
    const lower = id.toLowerCase();
    const type = KEYWORDS[lower] ?? 'IDENTIFIER';
    this.tokens.push({ type, value: id, line: this.line, col: startCol });
  }
}
