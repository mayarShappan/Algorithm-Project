import { motion } from 'motion/react';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface PythonCodeViewerProps {
  algorithm: 'dijkstra' | 'warshall';
}

interface CodeToken {
  text: string;
  type: 'keyword' | 'function' | 'string' | 'number' | 'operator' | 'comment' | 'normal' | 'variable';
}

// ==========================================
// 1. DIJKSTRA CODE (Min-Heap Version)
// ==========================================

const DIJKSTRA_CODE = [
  [
    { text: 'import', type: 'keyword' },
    { text: ' ', type: 'normal' },
    { text: 'heapq', type: 'variable' },
  ],
  [
    { text: 'def', type: 'keyword' },
    { text: ' ', type: 'normal' },
    { text: 'dijkstra', type: 'function' },
    { text: '(', type: 'operator' },
    { text: 'graph', type: 'variable' },
    { text: ', ', type: 'normal' },
    { text: 'src', type: 'variable' },
    { text: '):', type: 'operator' },
  ],
  [
    { text: '    ', type: 'normal' },
    { text: 'V', type: 'variable' },
    { text: ' = ', type: 'operator' },
    { text: 'len', type: 'function' },
    { text: '(', type: 'operator' },
    { text: 'graph', type: 'variable' },
    { text: ')', type: 'operator' },
    { text: '  # Number of vertices', type: 'comment' },
  ],
  [
    { text: '    ', type: 'normal' },
    { text: 'dist', type: 'variable' },
    { text: ' = [', type: 'operator' },
    { text: 'float', type: 'function' },
    { text: '(', type: 'operator' },
    { text: "'inf'", type: 'string' },
    { text: ')] * ', type: 'operator' },
    { text: 'V', type: 'variable' },
    { text: '  # Initialize distances', type: 'comment' },
  ],
  [
    { text: '    ', type: 'normal' },
    { text: 'dist', type: 'variable' },
    { text: '[', type: 'operator' },
    { text: 'src', type: 'variable' },
    { text: '] = ', type: 'operator' },
    { text: '0', type: 'number' },
    { text: '  # Source distance is 0', type: 'comment' },
  ],
  [
    { text: '    ', type: 'normal' },
    { text: 'pq', type: 'variable' },
    { text: ' = [(', type: 'operator' },
    { text: '0', type: 'number' },
    { text: ', ', type: 'normal' },
    { text: 'src', type: 'variable' },
    { text: ')]', type: 'operator' },
    { text: '  # Priority queue', type: 'comment' },
  ],
  [
    { text: '    ', type: 'normal' },
    { text: 'while', type: 'keyword' },
    { text: ' ', type: 'normal' },
    { text: 'pq', type: 'variable' },
    { text: ':', type: 'operator' },
    { text: '  # Process queue', type: 'comment' },
  ],
  [
    { text: '        ', type: 'normal' },
    { text: 'current_dist', type: 'variable' },
    { text: ', ', type: 'normal' },
    { text: 'u', type: 'variable' },
    { text: ' = ', type: 'operator' },
    { text: 'heapq', type: 'variable' },
    { text: '.', type: 'operator' },
    { text: 'heappop', type: 'function' },
    { text: '(', type: 'operator' },
    { text: 'pq', type: 'variable' },
    { text: ')', type: 'operator' },
    { text: '  # Pop smallest', type: 'comment' },
  ],
  [
    { text: '        ', type: 'normal' },
    { text: 'if', type: 'keyword' },
    { text: ' ', type: 'normal' },
    { text: 'current_dist', type: 'variable' },
    { text: ' > ', type: 'operator' },
    { text: 'dist', type: 'variable' },
    { text: '[', type: 'operator' },
    { text: 'u', type: 'variable' },
    { text: ']:', type: 'operator' },
    { text: '  # Skip outdated', type: 'comment' },
  ],
  [
    { text: '            ', type: 'normal' },
    { text: 'continue', type: 'keyword' },
  ],
  [
    { text: '        ', type: 'normal' },
    { text: 'for', type: 'keyword' },
    { text: ' ', type: 'normal' },
    { text: 'v', type: 'variable' },
    { text: ', ', type: 'normal' },
    { text: 'weight', type: 'variable' },
    { text: ' ', type: 'normal' },
    { text: 'in', type: 'keyword' },
    { text: ' ', type: 'normal' },
    { text: 'graph', type: 'variable' },
    { text: '[', type: 'operator' },
    { text: 'u', type: 'variable' },
    { text: ']:', type: 'operator' },
    { text: '  # Visit neighbors', type: 'comment' },
  ],
  [
    { text: '            ', type: 'normal' },
    { text: 'if', type: 'keyword' },
    { text: ' ', type: 'normal' },
    { text: 'dist', type: 'variable' },
    { text: '[', type: 'operator' },
    { text: 'u', type: 'variable' },
    { text: '] + ', type: 'operator' },
    { text: 'weight', type: 'variable' },
    { text: ' < ', type: 'operator' },
    { text: 'dist', type: 'variable' },
    { text: '[', type: 'operator' },
    { text: 'v', type: 'variable' },
    { text: ']:', type: 'operator' },
    { text: '  # Relaxation', type: 'comment' },
  ],
  [
    { text: '                ', type: 'normal' },
    { text: 'dist', type: 'variable' },
    { text: '[', type: 'operator' },
    { text: 'v', type: 'variable' },
    { text: '] = ', type: 'operator' },
    { text: 'dist', type: 'variable' },
    { text: '[', type: 'operator' },
    { text: 'u', type: 'variable' },
    { text: '] + ', type: 'operator' },
    { text: 'weight', type: 'variable' },
  ],
  [
    { text: '                ', type: 'normal' },
    { text: 'heapq', type: 'variable' },
    { text: '.', type: 'operator' },
    { text: 'heappush', type: 'function' },
    { text: '(', type: 'operator' },
    { text: 'pq', type: 'variable' },
    { text: ', (', type: 'operator' },
    { text: 'dist', type: 'variable' },
    { text: '[', type: 'operator' },
    { text: 'v', type: 'variable' },
    { text: '], ', type: 'operator' },
    { text: 'v', type: 'variable' },
    { text: '))', type: 'operator' },
    { text: '  # Push new dist', type: 'comment' },
  ],
  [
    { text: '    ', type: 'normal' },
    { text: 'return', type: 'keyword' },
    { text: ' ', type: 'normal' },
    { text: 'dist', type: 'variable' },
  ],
] as CodeToken[][];

// ==========================================
// 2. WARSHALL CODE (Same as before)
// ==========================================

const WARSHALL_CODE = [
  [
    { text: 'def', type: 'keyword' },
    { text: ' ', type: 'normal' },
    { text: 'transitive_closure', type: 'function' },
    { text: '(', type: 'operator' },
    { text: 'graph', type: 'variable' },
    { text: '):', type: 'operator' },
    { text: '  # Compute transitive closure', type: 'comment' },
  ],
  [
    { text: '    ', type: 'normal' },
    { text: 'V', type: 'variable' },
    { text: ' = ', type: 'operator' },
    { text: 'len', type: 'function' },
    { text: '(', type: 'operator' },
    { text: 'graph', type: 'variable' },
    { text: ')', type: 'operator' },
  ],
  [
    { text: '    ', type: 'normal' },
    { text: 'closure', type: 'variable' },
    { text: ' = [[', type: 'operator' },
    { text: '0', type: 'number' },
    { text: '] * ', type: 'operator' },
    { text: 'V', type: 'variable' },
    { text: ' ', type: 'normal' },
    { text: 'for', type: 'keyword' },
    { text: ' _ ', type: 'normal' },
    { text: 'in', type: 'keyword' },
    { text: ' ', type: 'normal' },
    { text: 'range', type: 'function' },
    { text: '(', type: 'operator' },
    { text: 'V', type: 'variable' },
    { text: ')]', type: 'operator' },
  ],
  [
    { text: '    ', type: 'normal' },
    { text: 'for', type: 'keyword' },
    { text: ' ', type: 'normal' },
    { text: 'i', type: 'variable' },
    { text: ' ', type: 'normal' },
    { text: 'in', type: 'keyword' },
    { text: ' ', type: 'normal' },
    { text: 'range', type: 'function' },
    { text: '(', type: 'operator' },
    { text: 'V', type: 'variable' },
    { text: '):', type: 'operator' },
    { text: '  # Copy original graph', type: 'comment' },
  ],
  [
    { text: '        ', type: 'normal' },
    { text: 'for', type: 'keyword' },
    { text: ' ', type: 'normal' },
    { text: 'j', type: 'variable' },
    { text: ' ', type: 'normal' },
    { text: 'in', type: 'keyword' },
    { text: ' ', type: 'normal' },
    { text: 'range', type: 'function' },
    { text: '(', type: 'operator' },
    { text: 'V', type: 'variable' },
    { text: '):', type: 'operator' },
  ],
  [
    { text: '            ', type: 'normal' },
    { text: 'closure', type: 'variable' },
    { text: '[', type: 'operator' },
    { text: 'i', type: 'variable' },
    { text: '][', type: 'operator' },
    { text: 'j', type: 'variable' },
    { text: '] = ', type: 'operator' },
    { text: 'graph', type: 'variable' },
    { text: '[', type: 'operator' },
    { text: 'i', type: 'variable' },
    { text: '][', type: 'operator' },
    { text: 'j', type: 'variable' },
    { text: ']', type: 'operator' },
  ],
  [
    { text: '    ', type: 'normal' },
    { text: 'for', type: 'keyword' },
    { text: ' ', type: 'normal' },
    { text: 'k', type: 'variable' },
    { text: ' ', type: 'normal' },
    { text: 'in', type: 'keyword' },
    { text: ' ', type: 'normal' },
    { text: 'range', type: 'function' },
    { text: '(', type: 'operator' },
    { text: 'V', type: 'variable' },
    { text: '):', type: 'operator' },
    { text: '  # Intermediate vertex', type: 'comment' },
  ],
  [
    { text: '        ', type: 'normal' },
    { text: 'for', type: 'keyword' },
    { text: ' ', type: 'normal' },
    { text: 'i', type: 'variable' },
    { text: ' ', type: 'normal' },
    { text: 'in', type: 'keyword' },
    { text: ' ', type: 'normal' },
    { text: 'range', type: 'function' },
    { text: '(', type: 'operator' },
    { text: 'V', type: 'variable' },
    { text: '):', type: 'operator' },
    { text: '  # Source vertex', type: 'comment' },
  ],
  [
    { text: '            ', type: 'normal' },
    { text: 'for', type: 'keyword' },
    { text: ' ', type: 'normal' },
    { text: 'j', type: 'variable' },
    { text: ' ', type: 'normal' },
    { text: 'in', type: 'keyword' },
    { text: ' ', type: 'normal' },
    { text: 'range', type: 'function' },
    { text: '(', type: 'operator' },
    { text: 'V', type: 'variable' },
    { text: '):', type: 'operator' },
    { text: '  # Destination vertex', type: 'comment' },
  ],
  [
    { text: '                ', type: 'normal' },
    { text: 'closure', type: 'variable' },
    { text: '[', type: 'operator' },
    { text: 'i', type: 'variable' },
    { text: '][', type: 'operator' },
    { text: 'j', type: 'variable' },
    { text: '] = ', type: 'operator' },
    { text: 'closure', type: 'variable' },
    { text: '[', type: 'operator' },
    { text: 'i', type: 'variable' },
    { text: '][', type: 'operator' },
    { text: 'j', type: 'variable' },
    { text: '] ', type: 'operator' },
    { text: 'or', type: 'keyword' },
    { text: ' (', type: 'operator' },
    { text: 'closure', type: 'variable' },
    { text: '[', type: 'operator' },
    { text: 'i', type: 'variable' },
    { text: '][', type: 'operator' },
    { text: 'k', type: 'variable' },
    { text: '] ', type: 'operator' },
    { text: 'and', type: 'keyword' },
    { text: ' ', type: 'normal' },
    { text: 'closure', type: 'variable' },
    { text: '[', type: 'operator' },
    { text: 'k', type: 'variable' },
    { text: '][', type: 'operator' },
    { text: 'j', type: 'variable' },
    { text: '])', type: 'operator' },
  ],
  [
    { text: '    ', type: 'normal' },
    { text: 'return', type: 'keyword' },
    { text: ' ', type: 'normal' },
    { text: 'closure', type: 'variable' },
  ],
] as CodeToken[][];

// ==========================================
// 3. Color Logic (Modern Neon Hex)
// ==========================================

const getTokenColor = (type: string) => {
  switch (type) {
    case 'keyword':
      return '#ff79c6'; // Hot Pink
    case 'function':
      return '#8be9fd'; // Cyan
    case 'string':
      return '#f1fa8c'; // Yellow
    case 'number':
      return '#bd93f9'; // Purple
    case 'operator':
      return '#ffb86c'; // Orange
    case 'comment':
      return '#6272a4'; // Blue-Gray
    case 'variable':
      return '#f8f8f2'; // White
    default:
      return '#f8f8f2'; // Default White
  }
};

export function PythonCodeViewer({ algorithm }: PythonCodeViewerProps) {
  const [copied, setCopied] = useState(false);
  const code = algorithm === 'dijkstra' ? DIJKSTRA_CODE : WARSHALL_CODE;
  const title = algorithm === 'dijkstra' ? "Dijkstra's Algorithm" : "Warshall's Algorithm";
  const borderColor = 'border-white/10';
  const headerGradient = 'from-[#1e1e1e] via-[#252526] to-[#1e1e1e]';

  const handleCopy = () => {
    const plainText = code.map(line => line.map(token => token.text).join('')).join('\n');
    navigator.clipboard.writeText(plainText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-[#0d1117] rounded-2xl border ${borderColor} shadow-2xl overflow-hidden`}
    >
      {/* Header */}
      <div className={`bg-gradient-to-r ${headerGradient} border-b ${borderColor} p-6`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white mb-2 flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <span className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="w-3 h-3 rounded-full bg-green-500" />
              <span className="ml-4">{title}</span>
            </h3>
            <p className={`text-sm ${algorithm === 'dijkstra' ? 'text-blue-300' : 'text-purple-300'}`}>
              Python Implementation
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCopy}
            className={`px-4 py-2 ${algorithm === 'dijkstra' ? 'bg-blue-600/30 hover:bg-blue-600/50 border-blue-500/30 text-blue-300' : 'bg-purple-600/30 hover:bg-purple-600/50 border-purple-500/30 text-purple-300'} rounded-xl transition-all flex items-center gap-2 border`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-400" />
                <span className="text-green-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy</span>
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Code Content */}
      <div className="p-6 overflow-x-auto max-h-96 overflow-y-auto custom-scrollbar bg-[#0D1117]">
        <div className="font-mono text-sm leading-7">
          {code.map((line, i) => {
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                className="hover:bg-white/5 px-3 py-0.5 rounded transition-all group"
              >
                <div className="flex items-start gap-3">
                  <span className={`${algorithm === 'dijkstra' ? 'text-blue-400/30' : 'text-purple-400/30'} select-none w-10 text-right flex-shrink-0 text-xs font-medium group-hover:text-opacity-60`}>
                    {i + 1}
                  </span>
                  <pre className="flex-1 m-0 p-0 bg-transparent">
                    <code>
                      {line.map((token, j) => (
                        <span 
                          key={j} 
                          style={{ 
                            color: getTokenColor(token.type),
                            fontStyle: token.type === 'comment' ? 'italic' : 'normal'
                          }}
                        >
                          {token.text}
                        </span>
                      ))}
                      {line.length === 0 && ' '}
                    </code>
                  </pre>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Footer Legend - Colored Dots + Gray Text */}
      <div className={`bg-gradient-to-r ${headerGradient} border-t ${borderColor} p-4`}>
        <div className="flex flex-wrap gap-4 text-xs font-medium text-gray-400">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ff79c6' }} />
            <span>Keywords</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#8be9fd' }} />
            <span>Functions</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#f8f8f2' }} />
            <span>Variables</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#f1fa8c' }} />
            <span>Strings</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#bd93f9' }} />
            <span>Numbers</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ffb86c' }} />
            <span>Operators</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#6272a4' }} />
            <span>Comments</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}