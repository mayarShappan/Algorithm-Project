import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Code2 } from 'lucide-react';
import { ImprovedAlgorithmVisualization } from './ImprovedAlgorithmVisualization';
import { PythonCodeViewer } from './PythonCodeViewer';
import { GraphNode, GraphEdge } from '../App';

interface EnhancedVisualizationPageProps {
  onNavigateToHome: () => void;
  customGraph: { nodes: GraphNode[]; edges: GraphEdge[] } | null;
}

export function EnhancedVisualizationPage({ onNavigateToHome, customGraph }: EnhancedVisualizationPageProps) {
  const [showCode, setShowCode] = useState(true);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<'both' | 'dijkstra' | 'warshall'>('both');

  return (
    <div className="min-h-screen">
      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-indigo-500/30 shadow-xl"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <motion.button
              whileHover={{ scale: 1.05, x: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={onNavigateToHome}
              className="flex items-center gap-2 text-indigo-300 hover:text-indigo-100 transition-colors group px-4 py-2 rounded-xl hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Home</span>
            </motion.button>
            
            <h2 className="text-white flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Algorithm Visualization
            </h2>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCode(!showCode)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                showCode
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50'
                  : 'bg-slate-800/50 text-indigo-300 hover:bg-slate-700/50'
              }`}
            >
              <Code2 className="w-5 h-5" />
              <span>{showCode ? 'Hide' : 'Show'} Code</span>
            </motion.button>
          </div>

          {/* Algorithm Selector */}
          <div className="flex gap-2 justify-center">
            {[
              { value: 'both', label: 'Both Algorithms', gradient: 'from-blue-600 to-purple-600' },
              { value: 'dijkstra', label: 'Dijkstra Only', gradient: 'from-blue-600 to-cyan-600' },
              { value: 'warshall', label: 'Warshall Only', gradient: 'from-purple-600 to-pink-600' },
            ].map((option) => (
              <motion.button
                key={option.value}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedAlgorithm(option.value as any)}
                className={`px-6 py-2 rounded-xl transition-all ${
                  selectedAlgorithm === option.value
                    ? `bg-gradient-to-r ${option.gradient} text-white shadow-lg`
                    : 'bg-slate-800/50 text-indigo-300 hover:bg-slate-700/50'
                }`}
              >
                {option.label}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <ImprovedAlgorithmVisualization 
            customGraph={customGraph} 
            selectedView={selectedAlgorithm}
          />
        </motion.div>

        {/* Python Code Section */}
        <AnimatePresence>
          {showCode && (
            <motion.div
              initial={{ opacity: 0, y: 30, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: 30, height: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-12"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-6 text-center"
              >
                <h2 className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  Python Implementations
                </h2>
                <p className="text-indigo-200">
                  Learn how these algorithms work with detailed, syntax-highlighted code
                </p>
              </motion.div>

              <div className="grid lg:grid-cols-2 gap-8">
                {(selectedAlgorithm === 'both' || selectedAlgorithm === 'dijkstra') && (
                  <PythonCodeViewer algorithm="dijkstra" />
                )}
                {(selectedAlgorithm === 'both' || selectedAlgorithm === 'warshall') && (
                  <PythonCodeViewer algorithm="warshall" />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
