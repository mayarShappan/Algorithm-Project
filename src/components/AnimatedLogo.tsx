import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

export function AnimatedLogo() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhase((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Logo nodes positions
  const nodes = [
    { id: 'A', x: 150, y: 100 },
    { id: 'B', x: 300, y: 50 },
    { id: 'C', x: 300, y: 150 },
    { id: 'D', x: 450, y: 100 },
  ];

  // Edges
  const edges = [
    { from: 0, to: 1, weight: 4 },
    { from: 0, to: 2, weight: 2 },
    { from: 1, to: 3, weight: 3 },
    { from: 2, to: 1, weight: 1 },
    { from: 2, to: 3, weight: 5 },
  ];

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-indigo-500/20 blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <svg
        width="100%"
        height="200"
        viewBox="0 0 600 200"
        className="relative z-10"
      >
        {/* Animated particles in background */}
        {[...Array(20)].map((_, i) => (
          <motion.circle
            key={`particle-${i}`}
            cx={Math.random() * 600}
            cy={Math.random() * 200}
            r="2"
            fill="url(#particleGradient)"
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
              x: [(Math.random() - 0.5) * 100],
              y: [(Math.random() - 0.5) * 100],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Gradient Definitions */}
        <defs>
          <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
          <linearGradient id="nodeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <linearGradient id="particleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
          
          {/* Glow filter */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Edges with animation */}
        {edges.map((edge, idx) => {
          const fromNode = nodes[edge.from];
          const toNode = nodes[edge.to];
          
          // Calculate if this edge is active in current phase
          const isActive = phase === 0 ? idx < 2 : phase === 1 ? idx === 2 || idx === 3 : idx === 4;

          return (
            <g key={`edge-${idx}`}>
              {/* Background edge */}
              <motion.line
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke="#e5e7eb"
                strokeWidth="2"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.3 }}
                transition={{ duration: 1, delay: idx * 0.2 }}
              />
              
              {/* Active edge with animation */}
              <motion.line
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke="url(#edgeGradient)"
                strokeWidth="3"
                strokeLinecap="round"
                filter="url(#glow)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{
                  pathLength: isActive ? 1 : 0,
                  opacity: isActive ? 1 : 0,
                }}
                transition={{
                  duration: 0.8,
                  ease: "easeInOut",
                }}
              />

              {/* Animated particle along edge */}
              {isActive && (
                <circle
                  r="4"
                  fill="#60a5fa"
                  filter="url(#glow)"
                >
                  <animateMotion
                    dur="1.5s"
                    repeatCount="indefinite"
                    path={`M ${fromNode.x} ${fromNode.y} L ${toNode.x} ${toNode.y}`}
                  />
                  <animate
                    attributeName="opacity"
                    values="0;1;1;0"
                    dur="1.5s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}

              {/* Weight label */}
              <motion.text
                x={(fromNode.x + toNode.x) / 2}
                y={(fromNode.y + toNode.y) / 2 - 15}
                textAnchor="middle"
                className="fill-transparent"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 0, scale: 0 }}
                transition={{ duration: 0 }}
              >
              </motion.text>
            </g>
          );
        })}

        {/* Nodes with pulsing animation */}
        {nodes.map((node, idx) => {
          const isActive = phase === 0 ? idx === 0 : phase === 1 ? idx === 2 : idx === 1;
          
          return (
            <motion.g
              key={`node-${idx}`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                duration: 0.6,
                delay: 0.5 + idx * 0.15,
                type: "spring",
                stiffness: 200,
              }}
            >
              {/* Outer glow ring */}
              <motion.circle
                cx={node.x}
                cy={node.y}
                r="35"
                fill="none"
                stroke="url(#edgeGradient)"
                strokeWidth="2"
                opacity="0.3"
                animate={isActive ? {
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 0, 0.3],
                } : {}}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* Main node circle */}
              <motion.circle
                cx={node.x}
                cy={node.y}
                r="28"
                fill="url(#nodeGradient)"
                filter="url(#glow)"
                animate={isActive ? {
                  scale: [1, 1.15, 1],
                } : {}}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* Inner shine */}
              <circle
                cx={node.x - 8}
                cy={node.y - 8}
                r="8"
                fill="white"
                opacity="0.4"
              />

              {/* Node label */}
              <text
                x={node.x}
                y={node.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-white pointer-events-none select-none"
              >
                {node.id}
              </text>
            </motion.g>
          );
        })}

        {/* Algorithm label with transition */}
        <motion.text
          x="300"
          y="185"
          textAnchor="middle"
          className="fill-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0 }}
        >
        </motion.text>
      </svg>
    </div>
  );
}