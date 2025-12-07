import { motion } from 'motion/react';

export function ComparisonTable() {
  const comparisons = [
    {
      feature: 'Type',
      dijkstra: 'Greedy',
      warshall: 'Dynamic Programming',
    },
    {
      feature: 'Answers',
      dijkstra: 'How much?',
      warshall: 'Whether?',
    },
    {
      feature: 'Problem Solved',
      dijkstra: 'Single Source Shortest Path',
      warshall: 'All-Pairs Reachability (Transitive Closure)',
    },
    {
      feature: 'Output',
      dijkstra: 'Shortest distances from source to all nodes',
      warshall: 'Reachability matrix for all node pairs',
    },
    {
      feature: 'Graph Type',
      dijkstra: 'Weighted Graph',
      warshall: 'Unweighted / Treats weights as 0–1',
    },
    {
      feature: 'Time Complexity',
      dijkstra: 'O((V + E) log V) with min-heap',
      warshall: 'O(V³)',
    },
    {
      feature: 'Space Complexity',
      dijkstra: 'O(V)',
      warshall: 'O(V²)',
    },
    {
      feature: 'Best Use',
      dijkstra: 'when you need exact shortest distances from one source',
      warshall: 'when you need to know reachability for all pairs',
    },
  ];

  return (
    <section className="py-20 relative">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Algorithm Comparison
          </h2>
          <p className="text-indigo-200 max-w-2xl mx-auto text-lg">
            Key differences between Dijkstra's and Warshall's algorithms at a glance
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="overflow-x-auto"
        >
          <table className="w-full bg-slate-900/50 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl border border-indigo-500/20">
            <thead>
              <tr className="bg-gradient-to-r from-indigo-900/50 via-purple-900/50 to-indigo-900/50">
                <th className="px-6 py-4 text-left text-white">
                  Feature
                </th>
                <th className="px-6 py-4 text-left text-blue-400">
                  Dijkstra
                </th>
                <th className="px-6 py-4 text-left text-purple-400">
                  Warshall
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisons.map((row, idx) => (
                <motion.tr
                  key={row.feature}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="border-t border-indigo-500/10 hover:bg-indigo-500/5 transition-colors"
                >
                  <td className="px-6 py-4 text-white">
                    {row.feature}
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg border border-blue-500/30">
                      {row.dijkstra}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-lg border border-purple-500/30">
                      {row.warshall}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </section>
  );
}