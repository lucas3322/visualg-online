import { ASTNode, Expr, Statement, VarDecl } from './visualg-parser';

export type VisuAlgValue = number | string | boolean | VisuAlgValue[];

export interface InterpreterCallbacks {
  onOutput: (text: string) => void;
  onInput: (prompt: string) => Promise<string>;
  onVarsUpdate?: (vars: Record<string, VisuAlgValue>) => void;
  onStep?: (line: number) => Promise<void>;
}

class InterruptSignal {}
class ReturnSignal { constructor(public value?: VisuAlgValue) {} }

const BUILTINS: Record<string, (...args: VisuAlgValue[]) => VisuAlgValue> = {
  abs: (x) => Math.abs(x as number),
  int: (x) => Math.trunc(x as number),
  sqrt: (x) => Math.sqrt(x as number),
  raizq: (x) => Math.sqrt(x as number),
  sen: (x) => Math.sin((x as number) * Math.PI / 180),
  cos: (x) => Math.cos((x as number) * Math.PI / 180),
  tan: (x) => Math.tan((x as number) * Math.PI / 180),
  arctan: (x) => Math.atan(x as number) * 180 / Math.PI,
  exp: (x) => Math.exp(x as number),
  log: (x) => Math.log(x as number),
  log2: (x) => Math.log2(x as number),
  logn: (x, b) => Math.log(x as number) / Math.log(b as number),
  pi: () => Math.PI,
  rand: () => Math.random(),
  randi: (n) => Math.floor(Math.random() * (n as number) + 1),
  maiusc: (s) => String(s).toUpperCase(),
  minusc: (s) => String(s).toLowerCase(),
  compr: (s) => String(s).length,
  copia: (s, i, n) => String(s).substring((i as number) - 1, (i as number) - 1 + (n as number)),
  pos: (sub, s) => { const idx = String(s).indexOf(String(sub)); return idx === -1 ? 0 : idx + 1; },
  concat: (...args) => args.map(String).join(''),
  carac: (n) => String.fromCharCode(n as number),
  asc: (s) => String(s).charCodeAt(0),
  numpcarac: (s) => parseFloat(String(s)),
  caracpnum: (s) => parseFloat(String(s)),
  real: (x) => parseFloat(String(x)),
  inteiro: (x) => parseInt(String(x)),
  xou: (a, b) => Boolean(a) !== Boolean(b),
  eof: () => false,
};

export class Interpreter {
  private env: Map<string, VisuAlgValue> = new Map();
  private stepCount = 0;
  private maxSteps = 100000;

  constructor(private callbacks: InterpreterCallbacks) {}

  async run(ast: ASTNode) {
    if (ast.kind !== 'Program') throw new Error('AST inválida');
    this.initVars(ast.vars);
    await this.execBlock(ast.body);
  }

  private initVars(decls: VarDecl[]) {
    for (const decl of decls) {
      for (const name of decl.names) {
        if (decl.type === 'vetor' && decl.size) {
          const [lo, hi] = decl.size;
          const len = hi - lo + 1;
          this.env.set(name.toLowerCase(), new Array(len + 1).fill(0));
        } else {
          const def: VisuAlgValue = decl.type === 'logico' ? false : decl.type === 'caractere' ? '' : 0;
          this.env.set(name.toLowerCase(), def);
        }
      }
    }
  }

  private async execBlock(stmts: Statement[]) {
    for (const stmt of stmts) {
      await this.execStmt(stmt);
    }
  }

  private async execStmt(stmt: Statement) {
    this.stepCount++;
    if (this.stepCount > this.maxSteps) throw new Error('Limite de execução atingido (loop infinito?)');

    if (this.callbacks.onStep && 'line' in stmt) {
      this.notifyVars();
      await this.callbacks.onStep((stmt).line);
    }

    switch (stmt.kind) {
      case 'Assign': {
        const val = await this.evalExpr(stmt.value);
        const key = stmt.target.toLowerCase();
        if (stmt.index) {
          const arr = this.env.get(key) as VisuAlgValue[];
          if (!Array.isArray(arr)) throw new Error(`Linha ${stmt.line}: '${stmt.target}' não é um vetor`);
          const idx = await this.evalExpr(stmt.index[0]) as number;
          arr[idx] = val;
        } else {
          this.env.set(key, val);
        }
        this.notifyVars();
        break;
      }
      case 'Escreva': {
        const parts: string[] = [];
        for (const arg of stmt.args) {
          const val = await this.evalExpr(arg);
          parts.push(this.formatValue(val));
        }
        const text = parts.join('');
        this.callbacks.onOutput(stmt.newline ? text + '\n' : text);
        break;
      }
      case 'Leia': {
        for (const target of stmt.targets) {
          const key = target.name.toLowerCase();
          const raw = await this.callbacks.onInput('');
          const current = this.env.get(key);
          let parsed: VisuAlgValue;
          if (typeof current === 'boolean' || raw.toLowerCase() === 'verdadeiro' || raw.toLowerCase() === 'falso') {
            parsed = raw.toLowerCase() === 'verdadeiro';
          } else if (!isNaN(parseFloat(raw)) && raw.trim() !== '') {
            parsed = parseFloat(raw);
          } else {
            parsed = raw;
          }
          if (target.index) {
            const arr = this.env.get(key) as VisuAlgValue[];
            const idx = await this.evalExpr(target.index[0]) as number;
            arr[idx] = parsed;
          } else {
            this.env.set(key, parsed);
          }
          this.notifyVars();
        }
        break;
      }
      case 'Se': {
        const cond = await this.evalExpr(stmt.cond);
        if (this.isTruthy(cond)) {
          await this.execBlock(stmt.then);
        } else if (stmt.else) {
          await this.execBlock(stmt.else);
        }
        break;
      }
      case 'Para': {
        let i = await this.evalExpr(stmt.from) as number;
        const to = await this.evalExpr(stmt.to) as number;
        const step = stmt.step ? await this.evalExpr(stmt.step) as number : 1;
        const key = stmt.var.toLowerCase();
        this.env.set(key, i);
        const ascending = step > 0;
        while (ascending ? i <= to : i >= to) {
          this.env.set(key, i);
          try { await this.execBlock(stmt.body); }
          catch (e) { if (e instanceof InterruptSignal) break; throw e; }
          i += step;
        }
        break;
      }
      case 'Enquanto': {
        while (this.isTruthy(await this.evalExpr(stmt.cond))) {
          try { await this.execBlock(stmt.body); }
          catch (e) { if (e instanceof InterruptSignal) break; throw e; }
        }
        break;
      }
      case 'Repita': {
        do {
          try { await this.execBlock(stmt.body); }
          catch (e) { if (e instanceof InterruptSignal) break; throw e; }
        } while (!this.isTruthy(await this.evalExpr(stmt.cond)));
        break;
      }
      case 'Interrompa': throw new InterruptSignal();
      case 'Retorne': throw new ReturnSignal(stmt.value ? await this.evalExpr(stmt.value) : undefined);
      case 'CallStmt': {
        for (const arg of stmt.args) await this.evalExpr(arg);
        break;
      }
    }
  }

  private async evalExpr(expr: Expr): Promise<VisuAlgValue> {
    switch (expr.kind) {
      case 'Number': return expr.value;
      case 'String': return expr.value;
      case 'Bool': return expr.value;
      case 'Var': {
        const key = expr.name.toLowerCase();
        const val = this.env.get(key);
        if (val === undefined) throw new Error(`Variável '${expr.name}' não declarada`);
        if (expr.index) {
          if (!Array.isArray(val)) throw new Error(`'${expr.name}' não é um vetor`);
          const idx = await this.evalExpr(expr.index[0]) as number;
          return val[idx] ?? 0;
        }
        return val;
      }
      case 'Call': return await this.evalCall(expr.name, expr.args);
      case 'Formatted': {
        const val = await this.evalExpr(expr.expr);
        let str: string;
        if (typeof val === 'number') {
          str = expr.decimals > 0 ? val.toFixed(expr.decimals) : String(val);
        } else if (typeof val === 'boolean') {
          str = val ? 'VERDADEIRO' : 'FALSO';
        } else {
          str = String(val);
        }
        return expr.width > 0 ? str.padStart(expr.width) : str;
      }
      case 'UnOp': {
        const v = await this.evalExpr(expr.expr);
        if (expr.op === '-') return -(v as number);
        if (expr.op === 'nao') return !this.isTruthy(v);
        return v;
      }
      case 'BinOp': return await this.evalBinOp(expr.op, expr.left, expr.right);
    }
  }

  private async evalBinOp(op: string, leftExpr: Expr, rightExpr: Expr): Promise<VisuAlgValue> {
    const left = await this.evalExpr(leftExpr);
    const right = await this.evalExpr(rightExpr);

    switch (op) {
      case '+':
        if (typeof left === 'string' || typeof right === 'string') return String(left) + String(right);
        return (left as number) + (right as number);
      case '-': return (left as number) - (right as number);
      case '*': return (left as number) * (right as number);
      case '/': {
        if ((right as number) === 0) throw new Error('Divisão por zero');
        return (left as number) / (right as number);
      }
      case 'div': return Math.trunc((left as number) / (right as number));
      case 'mod': return (left as number) % (right as number);
      case '^': return Math.pow(left as number, right as number);
      case '=': return left === right;
      case '<>': return left !== right;
      case '<': return (left as number) < (right as number);
      case '>': return (left as number) > (right as number);
      case '<=': return (left as number) <= (right as number);
      case '>=': return (left as number) >= (right as number);
      case 'e': return this.isTruthy(left) && this.isTruthy(right);
      case 'ou': return this.isTruthy(left) || this.isTruthy(right);
      default: throw new Error(`Operador desconhecido: ${op}`);
    }
  }

  private async evalCall(name: string, argExprs: Expr[]): Promise<VisuAlgValue> {
    const args: VisuAlgValue[] = [];
    for (const a of argExprs) args.push(await this.evalExpr(a));
    const fn = BUILTINS[name];
    if (fn) return fn(...args);
    throw new Error(`Função '${name}' não encontrada`);
  }

  private notifyVars() {
    if (!this.callbacks.onVarsUpdate) return;
    const snapshot: Record<string, VisuAlgValue> = {};
    this.env.forEach((val, key) => { snapshot[key] = val; });
    this.callbacks.onVarsUpdate(snapshot);
  }

  private isTruthy(v: VisuAlgValue): boolean {
    if (typeof v === 'boolean') return v;
    if (typeof v === 'number') return v !== 0;
    if (typeof v === 'string') return v.length > 0;
    return false;
  }

  private formatValue(v: VisuAlgValue): string {
    if (typeof v === 'boolean') return v ? 'VERDADEIRO' : 'FALSO';
    if (typeof v === 'number') {
      if (Number.isInteger(v)) return String(v);
      return v.toFixed(4).replace(/\.?0+$/, '');
    }
    return String(v);
  }
}
