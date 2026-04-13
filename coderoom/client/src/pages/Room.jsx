import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import API from '../api/axios'
import useSocket from '../hooks/useSocket'
import Editor from '../components/Editor'
import OutputPanel from '../components/OutputPanel'
import ParticipantList from '../components/ParticipantList'
import LanguageSelector from '../components/LanguageSelector'

const THEMES = ['vs-dark', 'light', 'hc-black']
const THEME_LABELS = {
  'vs-dark': '🌙 Dark',
  'light': '☀️ Light',
  'hc-black': '⚫ High Contrast'
}

const Room = () => {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const socketRef = useSocket()

  const [code, setCode] = useState('// Start coding together...\n')
  const [language, setLanguage] = useState('javascript')
  const [participants, setParticipants] = useState([])
  const [output, setOutput] = useState(null)
  const [running, setRunning] = useState(false)
  const [copied, setCopied] = useState(false)
  const [shared, setShared] = useState(false)
  const [theme, setTheme] = useState('vs-dark')
  const [saveStatus, setSaveStatus] = useState('saved')
  const [typingUsers, setTypingUsers] = useState([])
  const [chatOpen, setChatOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [chatInput, setChatInput] = useState('')

  const isRemoteChange = useRef(false)
  const typingTimeout = useRef(null)

  // Fix 1 — lock userName at mount time
  const [userName] = useState(() => localStorage.getItem('userName') || 'Anonymous')

  useEffect(() => {
    const socket = socketRef.current
    if (!socket) return

    API.get(`/api/rooms/${roomId}`)
      .then(res => {
        setCode(res.data.code)
        setLanguage(res.data.language)
      })
      .catch(() => navigate('/'))

    socket.emit('join-room', { roomId, userName })

    socket.on('room-state', ({ code, language, participants }) => {
      isRemoteChange.current = true
      setCode(code)
      setLanguage(language)
      setParticipants(participants)
    })

    socket.on('code-updated', ({ code }) => {
      isRemoteChange.current = true
      setCode(code)
      setSaveStatus('saved')
    })

    socket.on('language-updated', ({ language }) => {
      setLanguage(language)
    })

    socket.on('participant-joined', (participant) => {
      setParticipants(prev => [...prev, participant])
    })

    socket.on('participant-left', ({ socketId }) => {
      setParticipants(prev => prev.filter(p => p.socketId !== socketId))
      setTypingUsers(prev => prev.filter(u => u.socketId !== socketId))
    })

    socket.on('user-typing', ({ socketId, name }) => {
      setTypingUsers(prev => {
        if (prev.find(u => u.socketId === socketId)) return prev
        return [...prev, { socketId, name }]
      })
    })

    socket.on('user-stop-typing', ({ socketId }) => {
      setTypingUsers(prev => prev.filter(u => u.socketId !== socketId))
    })

    socket.on('chat-message', (message) => {
      setMessages(prev => [...prev, message])
    })

    return () => {
      socket.off('room-state')
      socket.off('code-updated')
      socket.off('language-updated')
      socket.off('participant-joined')
      socket.off('participant-left')
      socket.off('user-typing')
      socket.off('user-stop-typing')
      socket.off('chat-message')
    }
  }, [roomId])

  const handleCodeChange = (newCode) => {
    if (isRemoteChange.current) {
      isRemoteChange.current = false
      return
    }
    setCode(newCode)
    setSaveStatus('saving')
    socketRef.current?.emit('code-change', { roomId, code: newCode })

    socketRef.current?.emit('typing-start', { roomId, name: userName })
    if (typingTimeout.current) clearTimeout(typingTimeout.current)
    typingTimeout.current = setTimeout(() => {
      socketRef.current?.emit('typing-stop', { roomId })
      setSaveStatus('saved')
    }, 1500)
  }

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang)
    socketRef.current?.emit('language-change', { roomId, language: newLang })
  }

  // Fix 2 — all languages via backend API
  const runCode = async () => {
    setRunning(true)
    setOutput(null)
    try {
      const res = await API.post('/api/execute', { code, language })
      setOutput(res.data)
    } catch (err) {
      setOutput({
        stdout: null,
        stderr: 'Execution failed. Please try again.',
        status: 'Error'
      })
    } finally {
      setRunning(false)
    }
  }

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareRoom = () => {
    const url = `${window.location.origin}/room/${roomId}`
    navigator.clipboard.writeText(url)
    setShared(true)
    setTimeout(() => setShared(false), 2000)
  }

  const sendMessage = () => {
    if (!chatInput.trim()) return
    const message = {
      name: userName,
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    socketRef.current?.emit('send-chat', { roomId, message })
    setMessages(prev => [...prev, message])
    setChatInput('')
  }

  return (
    <div className="h-screen bg-gray-950 flex flex-col overflow-hidden">

      {/* Toolbar */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-2 flex items-center justify-between flex-shrink-0">

        <div className="flex items-center gap-3">
          <span
            onClick={() => navigate('/')}
            className="text-white font-bold cursor-pointer hover:text-indigo-400 transition text-sm"
          >
            ⌨️ CodeRoom
          </span>

          <div className="flex items-center gap-2 bg-gray-800 px-3 py-1.5 rounded-lg">
            <span className="text-gray-400 text-xs">Room:</span>
            <span className="text-indigo-400 font-mono text-xs font-bold">{roomId}</span>
            <button onClick={copyRoomId} className="text-gray-400 hover:text-white text-xs ml-1">
              {copied ? '✅' : '📋'}
            </button>
          </div>

          <button
            onClick={shareRoom}
            className="bg-indigo-900 hover:bg-indigo-800 text-indigo-300 px-3 py-1.5 rounded-lg text-xs font-medium transition"
          >
            {shared ? '✅ Link Copied!' : '🔗 Share Room'}
          </button>

          <div className={`text-xs flex items-center gap-1
            ${saveStatus === 'saving' ? 'text-yellow-400' : 'text-green-400'}`}
          >
            {saveStatus === 'saving' ? (
              <><span className="animate-pulse">●</span> Saving...</>
            ) : (
              <><span>●</span> Saved</>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <LanguageSelector language={language} onChange={handleLanguageChange} />
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-white text-xs rounded-lg px-2 py-1.5 focus:outline-none cursor-pointer"
          >
            {THEMES.map(t => (
              <option key={t} value={t}>{THEME_LABELS[t]}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <ParticipantList participants={participants} />
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition
              ${chatOpen
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
          >
            💬 Chat {messages.length > 0 && `(${messages.length})`}
          </button>

          <button
            onClick={runCode}
            disabled={running}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition disabled:opacity-50 flex items-center gap-2"
          >
            {running ? <><span className="animate-spin">⟳</span> Running...</> : '▶ Run Code'}
          </button>
        </div>

      </div>

      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <div className="bg-gray-900 px-4 py-1 border-b border-gray-800">
          <span className="text-yellow-400 text-xs animate-pulse">
            ✏️ {typingUsers.map(u => u.name).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
          </span>
        </div>
      )}

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">

        <div className="flex-1 overflow-hidden">
          <Editor
            code={code}
            language={language}
            theme={theme}
            onChange={handleCodeChange}
          />
        </div>

        <OutputPanel output={output} running={running} />

        {/* Chat sidebar */}
        {chatOpen && (
          <div className="w-72 bg-gray-900 border-l border-gray-800 flex flex-col flex-shrink-0">
            <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
              <span className="text-white text-sm font-semibold">💬 Room Chat</span>
              <button onClick={() => setChatOpen(false)} className="text-gray-500 hover:text-white text-xs">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
              {messages.length === 0 ? (
                <div className="text-gray-600 text-xs text-center mt-8">No messages yet. Say hi! 👋</div>
              ) : (
                messages.map((msg, i) => (
                  <div key={i} className={`flex flex-col ${msg.name === userName ? 'items-end' : 'items-start'}`}>
                    <span className="text-gray-500 text-xs mb-0.5">{msg.name} · {msg.time}</span>
                    <div className={`px-3 py-2 rounded-xl text-xs max-w-full break-words
                      ${msg.name === userName
                        ? 'bg-indigo-600 text-white rounded-br-none'
                        : 'bg-gray-800 text-gray-200 rounded-bl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 border-t border-gray-800 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-gray-500"
              />
              <button
                onClick={sendMessage}
                disabled={!chatInput.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-xs disabled:opacity-50 transition"
              >
                Send
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default Room