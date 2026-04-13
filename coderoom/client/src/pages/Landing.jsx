import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api/axios'

const Landing = () => {
  const navigate = useNavigate()
  const [userName, setUserName] = useState('')
  const [joinId, setJoinId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const createRoom = async () => {
    if (!userName.trim()) return setError('Enter your name first')
    setLoading(true)
    try {
      const res = await API.post('/api/rooms')
      localStorage.setItem('userName', userName)
      navigate(`/room/${res.data.roomId}`)
    } catch (err) {
      setError('Failed to create room')
    } finally {
      setLoading(false)
    }
  }

  const joinRoom = () => {
    if (!userName.trim()) return setError('Enter your name first')
    if (!joinId.trim()) return setError('Enter a room ID')
    localStorage.setItem('userName', userName)
    navigate(`/room/${joinId.trim()}`)
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">⌨️</div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Code<span className="text-indigo-400">Room</span>
          </h1>
          <p className="text-gray-400 text-sm">
            Real-time collaborative code editor
          </p>
        </div>

        {/* Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">

          {error && (
            <div className="bg-red-900/30 border border-red-800 text-red-400 px-4 py-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          {/* Name input */}
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-400 block mb-2">
              Your Name
            </label>
            <input
              type="text"
              placeholder="e.g. Sakshi"
              value={userName}
              onChange={(e) => {
                setUserName(e.target.value)
                setError('')
              }}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-500"
            />
          </div>

          {/* Create room */}
          <button
            onClick={createRoom}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50 mb-4"
          >
            {loading ? 'Creating...' : '+ Create New Room'}
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-gray-800"></div>
            <span className="text-gray-500 text-xs">or join existing</span>
            <div className="flex-1 h-px bg-gray-800"></div>
          </div>

          {/* Join room */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter Room ID"
              value={joinId}
              onChange={(e) => {
                setJoinId(e.target.value)
                setError('')
              }}
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-500"
            />
            <button
              onClick={joinRoom}
              className="bg-gray-700 hover:bg-gray-600 text-white px-5 py-3 rounded-lg font-semibold transition"
            >
              Join
            </button>
          </div>

        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 text-xs mt-6">
          Share the room ID with friends to code together
        </p>

      </div>
    </div>
  )
}

export default Landing