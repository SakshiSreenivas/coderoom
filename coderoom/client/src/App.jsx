import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Room from './pages/Room'

function App() {
  return (
    <div className="min-h-screen bg-gray-950">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/room/:roomId" element={<Room />} />
      </Routes>
    </div>
  )
}

export default App