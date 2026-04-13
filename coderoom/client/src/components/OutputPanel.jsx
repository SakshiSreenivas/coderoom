const OutputPanel = ({ output, running }) => {
  return (
    <div className="w-80 bg-gray-900 border-l border-gray-800 flex flex-col flex-shrink-0">

      {/* Header */}
      <div className="px-4 py-2 border-b border-gray-800 flex items-center justify-between">
        <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
          Output
        </span>
        {running && (
          <span className="text-yellow-400 text-xs animate-pulse">
            Running...
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto font-mono text-sm">
        {!output && !running && (
          <div className="text-gray-600 text-xs">
            Click "Run Code" to see output here
          </div>
        )}

        {running && (
          <div className="text-yellow-400 text-xs animate-pulse">
            Executing code...
          </div>
        )}

        {output && (
          <div className="flex flex-col gap-3">

            {/* Status */}
            <div className={`text-xs font-semibold px-2 py-1 rounded w-fit
              ${output.status === 'Accepted'
                ? 'bg-green-900/50 text-green-400'
                : 'bg-red-900/50 text-red-400'
              }`}
            >
              {output.status}
            </div>

            {/* stdout */}
            {output.stdout && (
              <div>
                <div className="text-gray-500 text-xs mb-1">stdout</div>
                <pre className="text-green-400 text-xs whitespace-pre-wrap break-words bg-gray-800 p-3 rounded-lg">
                  {output.stdout}
                </pre>
              </div>
            )}

            {/* stderr */}
            {output.stderr && (
              <div>
                <div className="text-gray-500 text-xs mb-1">stderr</div>
                <pre className="text-red-400 text-xs whitespace-pre-wrap break-words bg-gray-800 p-3 rounded-lg">
                  {output.stderr}
                </pre>
              </div>
            )}

            {/* compile error */}
            {output.compileOutput && (
              <div>
                <div className="text-gray-500 text-xs mb-1">Compile Error</div>
                <pre className="text-orange-400 text-xs whitespace-pre-wrap break-words bg-gray-800 p-3 rounded-lg">
                  {output.compileOutput}
                </pre>
              </div>
            )}

            {/* Time + Memory */}
            {output.time && (
              <div className="text-gray-600 text-xs">
                Time: {output.time}s
                {output.memory && ` | Memory: ${output.memory} KB`}
              </div>
            )}

          </div>
        )}
      </div>

    </div>
  )
}

export default OutputPanel