import { Token, TokenType } from './visualg-lexer';

export type ASTNode =
  | { kind: 'Program'; name: string; vars: VarDecl[]; body: Statement[] }
  | { kind: 'VarDecl'; names: string[]; type: VarType; size?: number[] }
  | Statement;

export type VarType = 'inteiro' | 'real' | 'logico' | 'caractere' | 'vetor';

export interface VarDecl {
  names: string[];
  type: VarType;
  size?: number[];
}

export type Statement =
  | { kind: 'Assign'; target: string; index?: Expr[]; value: Expr; line: number }
  | { kind: 'Escreva'; args: Expr[]; newline: boolean; line: number }
  | { kind: 'Leia'; targets: { name: string; index?: Expr[] }[]; line: number }
  | { kind: 'Se'; cond: Expr; then: Statement[]; else?: Statement[]; line: number }
  | { kind: 'Para'; var: string; from: Expr; to: Expr; step?: Expr; body: Statement[]; line: number }
  | { kind: 'Enquanto'; cond: Expr; body: Statement[]; line: number }
  | { kind: 'Repita'; body: Statement[]; cond: Expr; line: number }
  | { kind: 'Interrompa'; line: number }
  | { kind: 'Retorne'; value?: Expr; line: number }
  | { kind: 'CallStmt'; name: string; args: Expr[]; line: number };

export type Expr =
  | { kind: 'Number'; value: number }
  | { kind: 'String'; value: string }
  | { kind: 'Bool'; value: boolean }
  | { kind: 'Var'; name: string; index?: Expr[] }
  | { kind: 'BinOp'; op: string; left: Expr; right: Expr }
  | { kind: 'UnOp'; op: string; expr: Expr }
  | { kind: 'Call'; name: string; args: Expr[] }
  | { kind: 'Formatted'; expr: Expr; width: number; decimals: number };

export class Parser {
  private pos = 0;

  constructor(private tokens: Token[]) {}

  private peek(offset = 0): Token {
    return this.tokens[this.pos + offset] ?? { type: 'EOF', value: '', line: 0, col: 0 };
  }

  private eat(type?: TokenType): Token {
    const tok = this.tokens[this.pos];
    if (type && tok.type !== type) {
      throw new Error(`Linha ${tok.line}: esperado '${type}' mas encontrou '${tok.value}' (${tok.type})`);
    }
    this.pos++;
    return tok;
  }

  private skipNewlines() {
    while (this.peek().type === 'NEWLINE') this.pos++;
  }

  parse(): ASTNode {
    this.skipNewlines();
    this.eat('ALGORITMO');
    const nameTok = this.eat('STRING');
    const name = nameTok.value;
    this.skipNewlines();

    const vars: VarDecl[] = [];
    if (this.peek().type === 'VAR') {
      this.eat('VAR');
      this.skipNewlines();
      while (!['INICIO', 'EOF'].includes(this.peek().type)) {
        const decl = this.parseVarDecl();
        if (decl) vars.push(decl);
        this.skipNewlines();
      }
    }

    this.eat('INICIO');
    this.skipNewlines();

    const body: Statement[] = [];
    while (!['FIMALGORITMO', 'EOF'].includes(this.peek().type)) {
      const stmt = this.parseStatement();
      if (stmt) body.push(stmt);
      this.skipNewlines();
    }

    return { kind: 'Program', name, vars, body };
  }

  private parseVarDecl(): VarDecl | null {
    if (this.peek().type !== 'IDENTIFIER') { this.skipNewlines(); return null; }

    const names: string[] = [];
    names.push(this.eat('IDENTIFIER').value);
    while (this.peek().type === 'COMMA') {
      this.eat('COMMA');
      names.push(this.eat('IDENTIFIER').value);
    }
    this.eat('COLON');

    if (this.peek().type === 'VETOR') {
      this.eat('VETOR');
      this.eat('LBRACKET');
      const sizes: number[] = [];
      sizes.push(parseInt(this.eat('NUMBER').value));
      this.eat('DOTDOT');
      sizes.push(parseInt(this.eat('NUMBER').value));
      while (this.peek().type === 'COMMA') {
        this.eat('COMMA');
        sizes.push(parseInt(this.eat('NUMBER').value));
        this.eat('DOTDOT');
        sizes.push(parseInt(this.eat('NUMBER').value));
      }
      this.eat('RBRACKET');
      this.eat('DE' as TokenType);
      const type = this.parseType();
      this.skipNewlines();
      return { names, type: 'vetor', size: sizes };
    }

    const type = this.parseType();
    this.skipNewlines();
    return { names, type };
  }

  private parseType(): VarType {
    const tok = this.peek();
    if (tok.type === 'INTEIRO') { this.pos++; return 'inteiro'; }
    if (tok.type === 'REAL') { this.pos++; return 'real'; }
    if (tok.type === 'LOGICO') { this.pos++; return 'logico'; }
    if (tok.type === 'CARACTERE') { this.pos++; return 'caractere'; }
    throw new Error(`Linha ${tok.line}: tipo desconhecido '${tok.value}'`);
  }

  private parseStatement(): Statement | null {
    this.skipNewlines();
    const tok = this.peek();

    if (tok.type === 'NEWLINE') { this.pos++; return null; }
    if (tok.type === 'EOF') return null;

    switch (tok.type) {
      case 'ESCREVA':
      case 'ESCREVAL': return this.parseEscreva();
      case 'LEIA': return this.parseLeia();
      case 'SE': return this.parseSe();
      case 'PARA': return this.parsePara();
      case 'ENQUANTO': return this.parseEnquanto();
      case 'REPITA': return this.parseRepita();
      case 'INTERROMPA': this.pos++; return { kind: 'Interrompa', line: tok.line };
      case 'RETORNE': return this.parseRetorne();
      case 'IDENTIFIER': return this.parseAssignOrCall();
      default:
        this.pos++;
        return null;
    }
  }

  private parseEscreva(): Statement {
    const tok = this.peek();
    const newline = tok.type === 'ESCREVAL';
    this.pos++;
    this.eat('LPAREN');
    const args: Expr[] = [];
    if (this.peek().type !== 'RPAREN') {
      args.push(this.parseEscrevaArg());
      while (this.peek().type === 'COMMA') {
        this.eat('COMMA');
        args.push(this.parseEscrevaArg());
      }
    }
    this.eat('RPAREN');
    return { kind: 'Escreva', args, newline, line: tok.line };
  }

  // Parseia um argumento de escreva/escreval com especificador opcional: expr:width:decimals
  private parseEscrevaArg(): Expr {
    let expr = this.parseExpr();
    if (this.peek().type === 'COLON' && this.peek(1).type === 'NUMBER') {
      this.eat('COLON');
      const width = parseInt(this.eat('NUMBER').value);
      let decimals = 0;
      if (this.peek().type === 'COLON' && this.peek(1).type === 'NUMBER') {
        this.eat('COLON');
        decimals = parseInt(this.eat('NUMBER').value);
      }
      expr = { kind: 'Formatted', expr, width, decimals };
    }
    return expr;
  }

  private parseLeia(): Statement {
    const tok = this.eat('LEIA');
    this.eat('LPAREN');
    const targets: { name: string; index?: Expr[] }[] = [];
    targets.push(this.parseLeiaTarget());
    while (this.peek().type === 'COMMA') {
      this.eat('COMMA');
      targets.push(this.parseLeiaTarget());
    }
    this.eat('RPAREN');
    return { kind: 'Leia', targets, line: tok.line };
  }

  private parseLeiaTarget(): { name: string; index?: Expr[] } {
    const name = this.eat('IDENTIFIER').value;
    if (this.peek().type === 'LBRACKET') {
      this.eat('LBRACKET');
      const idx = [this.parseExpr()];
      this.eat('RBRACKET');
      return { name, index: idx };
    }
    return { name };
  }

  private parseSe(): Statement {
    const tok = this.eat('SE');
    const cond = this.parseExpr();
    this.eat('ENTAO');
    this.skipNewlines();
    const then: Statement[] = [];
    while (!['SENAO', 'FIMSE', 'EOF'].includes(this.peek().type)) {
      const s = this.parseStatement();
      if (s) then.push(s);
      this.skipNewlines();
    }
    let elseBody: Statement[] | undefined;
    if (this.peek().type === 'SENAO') {
      this.eat('SENAO');
      this.skipNewlines();
      elseBody = [];
      while (!['FIMSE', 'EOF'].includes(this.peek().type)) {
        const s = this.parseStatement();
        if (s) elseBody.push(s);
        this.skipNewlines();
      }
    }
    this.eat('FIMSE');
    return { kind: 'Se', cond, then, else: elseBody, line: tok.line };
  }

  private parsePara(): Statement {
    const tok = this.eat('PARA');
    const varName = this.eat('IDENTIFIER').value;
    this.eat('DE' as TokenType);
    const from = this.parseExpr();
    this.eat('ATE');
    const to = this.parseExpr();
    let step: Expr | undefined;
    if (this.peek().type === 'PASSO') {
      this.eat('PASSO');
      step = this.parseExpr();
    }
    this.eat('FACA');
    this.skipNewlines();
    const body: Statement[] = [];
    while (!['FIMPARA', 'EOF'].includes(this.peek().type)) {
      const s = this.parseStatement();
      if (s) body.push(s);
      this.skipNewlines();
    }
    this.eat('FIMPARA');
    return { kind: 'Para', var: varName, from, to, step, body, line: tok.line };
  }

  private parseEnquanto(): Statement {
    const tok = this.eat('ENQUANTO');
    const cond = this.parseExpr();
    this.eat('FACA');
    this.skipNewlines();
    const body: Statement[] = [];
    while (!['FIMENQUANTO', 'EOF'].includes(this.peek().type)) {
      const s = this.parseStatement();
      if (s) body.push(s);
      this.skipNewlines();
    }
    this.eat('FIMENQUANTO');
    return { kind: 'Enquanto', cond, body, line: tok.line };
  }

  private parseRepita(): Statement {
    const tok = this.eat('REPITA');
    this.skipNewlines();
    const body: Statement[] = [];
    while (!['ATE', 'EOF'].includes(this.peek().type)) {
      const s = this.parseStatement();
      if (s) body.push(s);
      this.skipNewlines();
    }
    this.eat('ATE');
    const cond = this.parseExpr();
    return { kind: 'Repita', body, cond, line: tok.line };
  }

  private parseRetorne(): Statement {
    const tok = this.eat('RETORNE');
    if (this.peek().type !== 'NEWLINE' && this.peek().type !== 'EOF') {
      return { kind: 'Retorne', value: this.parseExpr(), line: tok.line };
    }
    return { kind: 'Retorne', line: tok.line };
  }

  private parseAssignOrCall(): Statement {
    const tok = this.eat('IDENTIFIER');
    const name = tok.value;

    if (this.peek().type === 'LBRACKET') {
      this.eat('LBRACKET');
      const idx = [this.parseExpr()];
      this.eat('RBRACKET');
      this.eat('ASSIGN');
      const value = this.parseExpr();
      return { kind: 'Assign', target: name, index: idx, value, line: tok.line };
    }

    if (this.peek().type === 'ASSIGN') {
      this.eat('ASSIGN');
      const value = this.parseExpr();
      return { kind: 'Assign', target: name, value, line: tok.line };
    }

    if (this.peek().type === 'LPAREN') {
      this.eat('LPAREN');
      const args: Expr[] = [];
      if (this.peek().type !== 'RPAREN') {
        args.push(this.parseExpr());
        while (this.peek().type === 'COMMA') { this.eat('COMMA'); args.push(this.parseExpr()); }
      }
      this.eat('RPAREN');
      return { kind: 'CallStmt', name, args, line: tok.line };
    }

    return { kind: 'Assign', target: name, value: { kind: 'Var', name }, line: tok.line };
  }

  private parseExpr(): Expr { return this.parseOr(); }

  private parseOr(): Expr {
    let left = this.parseAnd();
    while (this.peek().type === 'OU') {
      this.pos++;
      left = { kind: 'BinOp', op: 'ou', left, right: this.parseAnd() };
    }
    return left;
  }

  private parseAnd(): Expr {
    let left = this.parseNot();
    while (this.peek().type === 'E') {
      this.pos++;
      left = { kind: 'BinOp', op: 'e', left, right: this.parseNot() };
    }
    return left;
  }

  private parseNot(): Expr {
    if (this.peek().type === 'NAO') {
      this.pos++;
      return { kind: 'UnOp', op: 'nao', expr: this.parseNot() };
    }
    return this.parseComparison();
  }

  private parseComparison(): Expr {
    let left = this.parseAddSub();
    const ops: TokenType[] = ['EQ', 'NEQ', 'LT', 'GT', 'LTE', 'GTE'];
    while (ops.includes(this.peek().type)) {
      const op = this.peek().value;
      this.pos++;
      left = { kind: 'BinOp', op, left, right: this.parseAddSub() };
    }
    return left;
  }

  private parseAddSub(): Expr {
    let left = this.parseMulDiv();
    while (this.peek().type === 'PLUS' || this.peek().type === 'MINUS') {
      const op = this.peek().value;
      this.pos++;
      left = { kind: 'BinOp', op, left, right: this.parseMulDiv() };
    }
    return left;
  }

  private parseMulDiv(): Expr {
    let left = this.parsePow();
    while (['MULT', 'DIV_OP', 'DIV', 'MOD'].includes(this.peek().type)) {
      const op = this.peek().value.toLowerCase();
      this.pos++;
      left = { kind: 'BinOp', op, left, right: this.parsePow() };
    }
    return left;
  }

  private parsePow(): Expr {
    let left = this.parseUnary();
    if (this.peek().type === 'POW') {
      this.pos++;
      left = { kind: 'BinOp', op: '^', left, right: this.parsePow() };
    }
    return left;
  }

  private parseUnary(): Expr {
    if (this.peek().type === 'MINUS') { this.pos++; return { kind: 'UnOp', op: '-', expr: this.parsePrimary() }; }
    if (this.peek().type === 'PLUS') { this.pos++; return this.parsePrimary(); }
    return this.parsePrimary();
  }

  private parsePrimary(): Expr {
    const tok = this.peek();

    if (tok.type === 'NUMBER') { this.pos++; return { kind: 'Number', value: parseFloat(tok.value) }; }
    if (tok.type === 'STRING') { this.pos++; return { kind: 'String', value: tok.value }; }
    if (tok.type === 'VERDADEIRO') { this.pos++; return { kind: 'Bool', value: true }; }
    if (tok.type === 'FALSO') { this.pos++; return { kind: 'Bool', value: false }; }

    if (tok.type === 'LPAREN') {
      this.eat('LPAREN');
      const expr = this.parseExpr();
      this.eat('RPAREN');
      return expr;
    }

    if (tok.type === 'IDENTIFIER') {
      this.pos++;
      if (this.peek().type === 'LPAREN') {
        this.eat('LPAREN');
        const args: Expr[] = [];
        if (this.peek().type !== 'RPAREN') {
          args.push(this.parseExpr());
          while (this.peek().type === 'COMMA') { this.eat('COMMA'); args.push(this.parseExpr()); }
        }
        this.eat('RPAREN');
        return { kind: 'Call', name: tok.value.toLowerCase(), args };
      }
      if (this.peek().type === 'LBRACKET') {
        this.eat('LBRACKET');
        const idx = [this.parseExpr()];
        this.eat('RBRACKET');
        return { kind: 'Var', name: tok.value, index: idx };
      }
      return { kind: 'Var', name: tok.value };
    }

    throw new Error(`Linha ${tok.line}: expressão inesperada '${tok.value}'`);
  }
}
