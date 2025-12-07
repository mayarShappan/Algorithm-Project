import { motion } from 'motion/react';
import { ArrowRight, Sparkles, Zap, Code, Brain } from 'lucide-react';
import { AnimatedLogo } from './AnimatedLogo';

interface EnhancedHeroProps {
  onNavigateToVisualization: () => void;
}

export function EnhancedHero({ onNavigateToVisualization }: EnhancedHeroProps) {
  const scrollToBuilder = () => {
    document.getElementById('builder')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToTheory = () => {
    document.getElementById('concepts')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600/40 via-purple-600/40 to-pink-600/40 backdrop-blur-xl rounded-2xl mb-8 border-2 border-indigo-400/30 shadow-2xl shadow-indigo-500/30"
          >
            <motion.div
              animate={{ rotate: 360, scale: [1, 1.2, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-6 h-6 text-yellow-400" />
            </motion.div>
            <span className="bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 bg-clip-text text-transparent text-lg">
              Algorithm Visualization Platform
            </span>
          </motion.div>
        </motion.div>

        {/* Animated Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, type: 'spring' }}
          className="mb-12"
        >
          <AnimatedLogo />
        </motion.div>

        {/* Main Title - Enhanced */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-12"
        >
          <motion.div
            className="mb-8"
            whileHover={{ scale: 1.02 }}
          >
            <div className="relative inline-block">
              <motion.div
                className="absolute inset-0 blur-2xl opacity-50"
                animate={{
                  background: [
                    'radial-gradient(circle, #3b82f6 0%, #8b5cf6 100%)',
                    'radial-gradient(circle, #8b5cf6 0%, #ec4899 100%)',
                    'radial-gradient(circle, #ec4899 0%, #3b82f6 100%)',
                  ],
                }}
                transition={{ duration: 5, repeat: Infinity }}
              />
              <h1 className="relative bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
                GraphAlgo Visualizer
              </h1>
              <motion.div
                className="h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full mx-auto"
                style={{ width: '60%' }}
                animate={{ scaleX: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </motion.div>
          
          <p className="text-indigo-200 text-xl mb-6 max-w-3xl mx-auto">
            Master Dijkstra's and Warshall's algorithms through interactive visualizations
          </p>
          
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="px-6 py-3 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 backdrop-blur-sm border border-blue-400/40 rounded-xl"
            >
              <span className="text-blue-200">Dijkstra:</span>
              <span className="text-white ml-2">"How much does it cost?"</span>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="px-6 py-3 bg-gradient-to-r from-purple-500/30 to-pink-500/30 backdrop-blur-sm border border-purple-400/40 rounded-xl"
            >
              <span className="text-purple-200">Warshall:</span>
              <span className="text-white ml-2">"Is there a path?"</span>
            </motion.div>
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex gap-6 justify-center flex-wrap mb-16"
        >
          <motion.button
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollToBuilder}
            className="group px-10 py-5 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white rounded-2xl transition-all duration-300 flex items-center gap-4 shadow-2xl hover:shadow-blue-500/50 relative overflow-hidden"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              initial={{ x: '-100%' }}
              whileHover={{ x: '200%' }}
              transition={{ duration: 0.8 }}
            />
            <Zap className="w-6 h-6 relative z-10" />
            <span className="relative z-10 text-lg">Start Building</span>
            <ArrowRight className="w-6 h-6 relative z-10 group-hover:translate-x-2 transition-transform" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollToTheory}
            className="px-10 py-5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center gap-3 text-lg"
          >
            <Brain className="w-6 h-6" />
            <span>Explore Theory</span>
          </motion.button>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto"
        >
          {[
            { icon: '⚡', text: 'Real-time Visualization', gradient: 'from-yellow-500/20 to-orange-500/20', border: 'border-yellow-500/30' },
            { icon: '🎨', text: 'Interactive Builder', gradient: 'from-pink-500/20 to-rose-500/20', border: 'border-pink-500/30' },
            { icon: '📊', text: 'Step Analysis', gradient: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-500/30' },
            { icon: '💻', text: 'Code Examples', gradient: 'from-purple-500/20 to-indigo-500/20', border: 'border-purple-500/30' },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 1.2 + i * 0.1, type: 'spring', stiffness: 200 }}
              whileHover={{ scale: 1.1, y: -8 }}
              className="relative group"
            >
              <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-xl`}
              />
              <div className={`relative px-6 py-6 bg-slate-900/60 backdrop-blur-xl rounded-2xl border-2 ${feature.border} shadow-xl hover:shadow-2xl transition-all`}>
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                  className="text-4xl mb-3"
                >
                  {feature.icon}
                </motion.div>
                <div className="text-sm text-gray-200">{feature.text}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-16"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block text-gray-400 dark:text-gray-500"
          >
            <div className="w-6 h-10 border-2 border-current rounded-full mx-auto mb-2 relative">
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1.5 h-1.5 bg-current rounded-full absolute left-1/2 -translate-x-1/2 top-2"
              />
            </div>
            <p className="text-sm">Scroll to explore</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}