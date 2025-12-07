import { motion } from 'motion/react';
import { Target, Network, Zap } from 'lucide-react';

export function ConceptExplanation() {
  return (
    <section id="concepts" className="py-20 relative">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-block mb-4"
          >
            <h2 className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Understanding Both Algorithms
            </h2>
          </motion.div>
          <p className="text-indigo-200 max-w-2xl mx-auto text-lg">
            Two different approaches to solving graph problems, each with its unique purpose
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Dijkstra Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="relative group"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            />
            <div className="relative bg-gradient-to-br from-slate-900/80 to-blue-900/40 backdrop-blur-xl p-8 rounded-3xl border-2 border-blue-500/30 shadow-2xl">
              <div className="flex items-start gap-4 mb-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="p-4 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl shadow-xl"
                >
                  <Target className="w-8 h-8 text-white" />
                </motion.div>
                <div>
                  <h3 className="text-white mb-3">Dijkstra's Algorithm</h3>
                  <p className="text-blue-200 text-lg mb-2">Greedy Approach</p>
                  <p className="text-blue-300/80 leading-relaxed">
                    Finds the shortest path from a source node to all other nodes in a weighted graph. Uses priority queue for optimal selection.
                  </p>
                </div>
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-blue-950/60 to-cyan-950/40 backdrop-blur-sm p-6 rounded-2xl border border-blue-400/30 mb-4"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Zap className="w-5 h-5 text-cyan-400" />
                  <h4 className="text-blue-200">Question it answers:</h4>
                </div>
                <p className="text-white text-xl mb-0">
                  "How much does the path cost?"
                </p>
              </motion.div>
            </div>
          </motion.div>

          {/* Warshall Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="relative group"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-violet-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            />
            <div className="relative bg-gradient-to-br from-slate-900/80 to-purple-900/40 backdrop-blur-xl p-8 rounded-3xl border-2 border-purple-500/30 shadow-2xl">
              <div className="flex items-start gap-4 mb-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="p-4 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-xl"
                >
                  <Network className="w-8 h-8 text-white" />
                </motion.div>
                <div>
                  <h3 className="text-white mb-3">Warshall's Algorithm</h3>
                  <p className="text-purple-200 text-lg mb-2">Dynamic Programming</p>
                  <p className="text-purple-300/80 leading-relaxed">
                    Computes the transitive closure of a graph, determining reachability between all pairs of nodes. Uses adjacency matrix approach.
                  </p>
                </div>
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-purple-950/60 to-pink-950/40 backdrop-blur-sm p-6 rounded-2xl border border-purple-400/30 mb-4"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Zap className="w-5 h-5 text-pink-400" />
                  <h4 className="text-purple-200">Question it answers:</h4>
                </div>
                <p className="text-white text-xl mb-0">
                  "Is there a connection?"
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}