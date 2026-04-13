const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' }
]

const LanguageSelector = ({ language, onChange }) => {
  return (
    <select
      value={language}
      onChange={(e) => onChange(e.target.value)}
      className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
    >
      {LANGUAGES.map(lang => (
        <option key={lang.value} value={lang.value}>
          {lang.label}
        </option>
      ))}
    </select>
  )
}

export default LanguageSelector