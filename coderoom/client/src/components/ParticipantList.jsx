const ParticipantList = ({ participants }) => {
  return (
    <div className="flex items-center gap-1">
      {participants.map((p, i) => (
        <div
          key={p.socketId || i}
          title={p.name}
          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-gray-900"
          style={{ backgroundColor: p.color }}
        >
          {p.name?.charAt(0).toUpperCase()}
        </div>
      ))}
      {participants.length === 0 && (
        <span className="text-gray-500 text-xs">No participants</span>
      )}
    </div>
  )
}

export default ParticipantList