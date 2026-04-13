import MonacoEditor from '@monaco-editor/react'

const Editor = ({ code, language, theme, onChange }) => {
  return (
    <MonacoEditor
      height="100%"
      language={language}
      value={code}
      theme={theme || 'vs-dark'}
      onChange={(value) => onChange(value || '')}
      options={{
        fontSize: 14,
        fontFamily: 'JetBrains Mono, Fira Code, monospace',
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        tabSize: 2,
        automaticLayout: true,
        padding: { top: 16 },
        smoothScrolling: true,
        cursorBlinking: 'smooth',
        renderLineHighlight: 'all',
        lineNumbers: 'on',
      }}
    />
  )
}

export default Editor