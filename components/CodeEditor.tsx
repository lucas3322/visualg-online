'use client';

import dynamic from 'next/dynamic';
import { forwardRef, useImperativeHandle, useRef } from 'react';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

function defineVisuAlgLanguage(monaco: any) {
  if (monaco.languages.getLanguages().some((l: any) => l.id === 'visualg')) return;

  monaco.languages.register({ id: 'visualg' });

  monaco.languages.setMonarchTokensProvider('visualg', {
    ignoreCase: true,
    keywords: [
      'algoritmo', 'fimalgoritmo', 'var', 'inicio',
      'se', 'entao', 'senao', 'fimse',
      'para', 'de', 'ate', 'passo', 'faca', 'fimpara',
      'enquanto', 'fimenquanto', 'repita',
      'escreva', 'escreval', 'leia',
      'e', 'ou', 'nao',
      'div', 'mod',
      'verdadeiro', 'falso',
      'inteiro', 'real', 'logico', 'caractere', 'vetor',
      'funcao', 'procedimento', 'retorne', 'fimfuncao', 'fimprocedimento',
      'interrompa',
    ],
    tokenizer: {
      root: [
        [/\/\/.*$/, 'comment'],
        [/\{[^}]*\}/, 'comment'],
        [/"[^"]*"/, 'string'],
        [/\b\d+(\.\d+)?\b/, 'number'],
        [/[a-zA-ZáàãâéêíóôõúüçÁÀÃÂÉÊÍÓÔÕÚÜÇ_][\w]*/, {
          cases: {
            '@keywords': 'keyword',
            '@default': 'identifier',
          },
        }],
        [/<-|:=/, 'operator'],
        [/[<>]=?|=|<>/, 'operator'],
        [/[+\-*/^]/, 'operator'],
      ],
    },
  });

  monaco.editor.defineTheme('visualg-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: 'c792ea', fontStyle: 'bold' },
      { token: 'string', foreground: 'c3e88d' },
      { token: 'number', foreground: 'f78c6c' },
      { token: 'comment', foreground: '546e7a', fontStyle: 'italic' },
      { token: 'operator', foreground: '89ddff' },
      { token: 'identifier', foreground: 'eeffff' },
    ],
    colors: {
      'editor.background': '#0d0d0d',
      'editor.foreground': '#eeffff',
      'editorLineNumber.foreground': '#3d3d3d',
      'editorLineNumber.activeForeground': '#6b6b6b',
      'editor.selectionBackground': '#2d2d2d',
      'editor.lineHighlightBackground': '#161616',
      'editorCursor.foreground': '#c792ea',
      'editor.inactiveSelectionBackground': '#1a1a1a',
    },
  });
}

export interface CodeEditorHandle {
  setActiveLine: (line: number | null) => void;
}

interface CodeEditorProps {
  value: string;
  onChange: (val: string) => void;
}

const CodeEditor = forwardRef<CodeEditorHandle, CodeEditorProps>(({ value, onChange }, ref) => {
  const editorRef = useRef<any>(null);
  const decorationsRef = useRef<string[]>([]);

  useImperativeHandle(ref, () => ({
    setActiveLine(line: number | null) {
      const editor = editorRef.current;
      if (!editor) return;
      decorationsRef.current = editor.deltaDecorations(
        decorationsRef.current,
        line !== null
          ? [{
              range: { startLineNumber: line, endLineNumber: line, startColumn: 1, endColumn: 1 },
              options: {
                isWholeLine: true,
                className: 'step-line-highlight',
                glyphMarginClassName: 'step-line-glyph',
              },
            }]
          : []
      );
      if (line !== null) {
        editor.revealLineInCenterIfOutsideViewport(line);
      }
    },
  }));

  return (
    <div className="flex-1 h-full">
      <MonacoEditor
        height="100%"
        language="visualg"
        value={value}
        onChange={(v) => onChange(v ?? '')}
        beforeMount={defineVisuAlgLanguage}
        theme="visualg-dark"
        onMount={(editor) => { editorRef.current = editor; }}
        options={{
          fontSize: 14,
          fontFamily: '"Fira Code", "Cascadia Code", Consolas, monospace',
          fontLigatures: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          lineNumbers: 'on',
          glyphMargin: true,
          folding: true,
          lineDecorationsWidth: 0,
          lineNumbersMinChars: 3,
          renderLineHighlight: 'line',
          tabSize: 3,
          wordWrap: 'on',
          automaticLayout: true,
          padding: { top: 12, bottom: 12 },
          cursorBlinking: 'smooth',
          cursorStyle: 'line',
          smoothScrolling: true,
          contextmenu: false,
          scrollbar: {
            verticalScrollbarSize: 6,
            horizontalScrollbarSize: 6,
          },
        }}
      />
    </div>
  );
});

CodeEditor.displayName = 'CodeEditor';
export default CodeEditor;
