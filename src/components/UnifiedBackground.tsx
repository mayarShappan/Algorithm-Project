import { motion } from 'motion/react';

export function UnifiedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-br from-gray-950 via-slate-950 to-gray-950">
      {/* Base animated gradient mesh */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            'radial-gradient(circle at 20% 30%, rgba(79, 70, 229, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.15) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 30%, rgba(79, 70, 229, 0.15) 0%, transparent 50%), radial-gradient(circle at 20% 70%, rgba(139, 92, 246, 0.15) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 50%)',
            'radial-gradient(circle at 50% 80%, rgba(79, 70, 229, 0.15) 0%, transparent 50%), radial-gradient(circle at 50% 20%, rgba(139, 92, 246, 0.15) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 50%)',
          ],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
      />

      {/* Floating gradient orbs */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-3xl opacity-20"
          style={{
            width: `${Math.random() * 500 + 200}px`,
            height: `${Math.random() * 500 + 200}px`,
            background: `radial-gradient(circle, ${
              ['#4f46e5', '#8b5cf6', '#6366f1', '#7c3aed'][i % 4]
            } 0%, transparent 70%)`,
          }}
          animate={{
            x: [
              `${-20 + Math.random() * 40}%`,
              `${-20 + Math.random() * 40}%`,
              `${-20 + Math.random() * 40}%`,
            ],
            y: [
              `${-20 + Math.random() * 40}%`,
              `${-20 + Math.random() * 40}%`,
              `${-20 + Math.random() * 40}%`,
            ],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 25 + i * 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        />
      ))}

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(99, 102, 241, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(99, 102, 241, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }}
        />
      </div>

      {/* Animated stars/particles */}
      {[...Array(40)].map((_, i) => (
        <motion.div
          key={`star-${i}`}
          className="absolute w-1 h-1 bg-indigo-400 rounded-full"
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 0.8, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: 3,
            delay: Math.random() * 5,
            repeat: Infinity,
          }}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        />
      ))}

      {/* Top glow */}
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-indigo-950/30 to-transparent" />
      
      {/* Bottom vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
    </div>
  );
}
