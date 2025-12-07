import { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { Play, Pause, RotateCcw, MapPin, Navigation, Table2 } from 'lucide-react';
import { GraphNode, GraphEdge } from '../App';
import { runDijkstra, runWarshall, DijkstraStep, WarshallStep } from '../utils/algorithms';
import React from 'react';

interface SimplifiedBothVisualizationProps {
  customGraph?: { nodes: GraphNode[]; edges: GraphEdge[] } | null;
}

// Real-life scenario: City Road Network
const defaultNodes: GraphNode[] = [
  { id: '0', x: 100, y: 150, label: 'A' },
  { id: '1', x: 300, y: 80, label: 'B' },
  { id: '2', x: 300, y: 220, label: 'C' },
  { id: '3', x: 500, y: 80, label: 'D' },
  { id: '4', x: 500, y: 220, label: 'E' },
];

const defaultEdges: GraphEdge[] = [
  { from: '0', to: '1', weight: 4 },
  { from: '0', to: '2', weight: 2 },
  { from: '1', to: '3', weight: 5 },
  { from: '2', to: '1', weight: 1 },
  { from: '2', to: '4', weight: 8 },
  { from: '3', to: '4', weight: 3 },
];

export function SimplifiedBothVisualization({ customGraph }: SimplifiedBothVisualizationProps) {
  const nodes = customGraph?.nodes || defaultNodes;
  const edges = customGraph?.edges || defaultEdges;
  
  const [sourceNode, setSourceNode] = useState<string>(nodes[0]?.id || '0');
  const [fromNode, setFromNode] = useState<string>(nodes[0]?.id || '0');
  const [toNode, setToNode] = useState<string>(nodes[1]?.id || '1');
  const [dijkstraSteps, setDijkstraSteps] = useState<DijkstraStep[]>([]);
  const [warshallSteps, setWarshallSteps] = useState<WarshallStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(2000);
  const [showComparison, setShowComparison] = useState(false);

  // Dynamic ViewBox Calculation
  const viewBox = useMemo(() => {
    if (nodes.length === 0) return "0 0 600 350";
    const xValues = nodes.map(n => n.x);
    const yValues = nodes.map(n => n.y);
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);
    const padding = 80;
    const width = maxX - minX + (padding * 2);
    const height = maxY - minY + (padding * 2);
    return `${minX - padding} ${minY - padding} ${width} ${height}`;
  }, [nodes]);

  useEffect(() => {
    if (nodes.length === 0) return;
    const dSteps = runDijkstra(nodes, edges, sourceNode);
    const wSteps = runWarshall(nodes, edges);
    setDijkstraSteps(dSteps);
    setWarshallSteps(wSteps);
    setCurrentStep(0);
    setPlaying(false);
  }, [nodes, edges, sourceNode]);

  useEffect(() => {
    if (playing && currentStep < Math.max(dijkstraSteps.length, warshallSteps.length) - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timer);
    } else if (currentStep >= Math.max(dijkstraSteps.length, warshallSteps.length) - 1) {
      setPlaying(false);
    }
  }, [playing, currentStep, dijkstraSteps.length, warshallSteps.length, speed]);

  const currentDijkstra = dijkstraSteps[Math.min(currentStep, dijkstraSteps.length - 1)] || dijkstraSteps[0];
  const currentWarshall = warshallSteps[Math.min(currentStep, warshallSteps.length - 1)] || warshallSteps[0];

  // Calculate reachability from Dijkstra results
  const dijkstraReachability = useMemo(() => {
    if (!currentDijkstra?.distances) return [];
    return nodes.map(node => ({
      id: node.id,
      label: node.label,
      reachable: currentDijkstra.distances[node.id] !== Infinity
    }));
  }, [currentDijkstra, nodes]);

  // Calculate reachability from Warshall results
  const warshallReachability = useMemo(() => {
    if (!currentWarshall?.matrix) return [];
    const sourceIndex = nodes.findIndex(n => n.id === sourceNode);
    if (sourceIndex === -1) return [];
    
    return nodes.map((node, idx) => ({
      id: node.id,
      label: node.label,
      reachable: currentWarshall.matrix[sourceIndex][idx]
    }));
  }, [currentWarshall, nodes, sourceNode]);

  // Path Query Analysis
  const pathQuery = useMemo(() => {
    const fromIdx = nodes.findIndex(n => n.id === fromNode);
    const toIdx = nodes.findIndex(n => n.id === toNode);
    
    if (fromIdx === -1 || toIdx === -1 || !currentDijkstra || !currentWarshall) {
      return null;
    }

    // Check if fromNode matches sourceNode for Dijkstra
    const dijkstraCanAnswer = fromNode === sourceNode;
    const dijkstraDistance = dijkstraCanAnswer ? currentDijkstra.distances?.[toNode] : null;
    const dijkstraReachable = dijkstraDistance !== null && dijkstraDistance !== Infinity;
    
    // Warshall can always answer
    const warshallReachable = currentWarshall.matrix[fromIdx][toIdx];
    
    // Determine which algorithm is better
    let betterAlgorithm = '';
    let reason = '';
    
    if (!dijkstraCanAnswer) {
      betterAlgorithm = 'warshall';
      reason = `Dijkstra cannot answer this query because the source is ${nodes.find(n => n.id === sourceNode)?.label}, not ${nodes.find(n => n.id === fromNode)?.label}. You would need to rerun Dijkstra from ${nodes.find(n => n.id === fromNode)?.label}.`;
    } else if (dijkstraReachable) {
      betterAlgorithm = 'dijkstra';
      reason = `Dijkstra is better here because it not only confirms reachability but also provides the exact shortest distance (${dijkstraDistance} km).`;
    } else {
      betterAlgorithm = 'both';
      reason = 'Both algorithms correctly identify that there is no path. Warshall is more efficient for checking just reachability.';
    }
    
    return {
      fromIdx,
      toIdx,
      dijkstraCanAnswer,
      dijkstraDistance,
      dijkstraReachable,
      warshallReachable,
      betterAlgorithm,
      reason
    };
  }, [fromNode, toNode, sourceNode, nodes, currentDijkstra, currentWarshall]);

  // Helper for Curves
  const getEdgePath = (fromNode: GraphNode, toNode: GraphNode, isBiDirectional: boolean) => {
    const dx = toNode.x - fromNode.x;
    const dy = toNode.y - fromNode.y;
    const nodeRadius = 38;

    if (isBiDirectional) {
      const midX = (fromNode.x + toNode.x) / 2;
      const midY = (fromNode.y + toNode.y) / 2;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const curvature = 50;
      
      const controlX = midX - (dy / dist) * curvature;
      const controlY = midY + (dx / dist) * curvature;

      const endAngle = Math.atan2(toNode.y - controlY, toNode.x - controlX);
      const arrowX = toNode.x - nodeRadius * Math.cos(endAngle);
      const arrowY = toNode.y - nodeRadius * Math.sin(endAngle);

      return {
        path: `M ${fromNode.x} ${fromNode.y} Q ${controlX} ${controlY} ${arrowX} ${arrowY}`,
        textX: controlX,
        textY: controlY
      };
    } else {
      const angle = Math.atan2(dy, dx);
      const arrowX = toNode.x - nodeRadius * Math.cos(angle);
      const arrowY = toNode.y - nodeRadius * Math.sin(angle);
      
      return {
        path: `M ${fromNode.x} ${fromNode.y} L ${arrowX} ${arrowY}`,
        textX: (fromNode.x + toNode.x) / 2,
        textY: (fromNode.y + toNode.y) / 2 - 10
      };
    }
  };

  // SVG Defs
  const SvgDefs = ({ idPrefix }: { idPrefix: string }) => (
    <defs>
      <marker id={`${idPrefix}-arrow-default`} markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
        <polygon points="0 0, 10 3, 0 6" fill="#6366f1" />
      </marker>
      <marker id={`${idPrefix}-arrow-active`} markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
        <polygon points="0 0, 10 3, 0 6" fill="#3b82f6" />
      </marker>
      <marker id={`${idPrefix}-arrow-warshall`} markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
        <polygon points="0 0, 10 3, 0 6" fill="#a855f7" />
      </marker>
      <linearGradient id={`${idPrefix}-node-gradient`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4f46e5" />
        <stop offset="100%" stopColor="#7c3aed" />
      </linearGradient>
      <linearGradient id={`${idPrefix}-node-active`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#06b6d4" />
      </linearGradient>
      <linearGradient id={`${idPrefix}-node-visited`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#059669" />
        <stop offset="100%" stopColor="#34d399" />
      </linearGradient>
      <linearGradient id={`${idPrefix}-node-source`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#ef4444" />
      </linearGradient>
      <filter id={`${idPrefix}-glow`}>
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <filter id={`${idPrefix}-edge-glow`}>
        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h2 className="text-white mb-3">Compare Dijkstra and Warshall Algorithms on a Real-Life Problem</h2>
          <div className="flex items-center justify-center gap-2 text-indigo-300 mb-4">
            <MapPin className="w-5 h-5" />
            <p className="text-lg">
              Scenario: <span className="text-white font-semibold">City Road Network</span>
            </p>
          </div>
          <p className="text-slate-300 max-w-3xl mx-auto mb-2">
            A small city with intersections (nodes) connected by roads (edges). Each road has a distance in kilometers.
          </p>
          <p className="text-indigo-200 max-w-3xl mx-auto">
            <span className="text-yellow-400 font-semibold">Tasks:</span> Determine reachability and calculate shortest distances from a source intersection.
          </p>
        </motion.div>

        {/* Source Selection */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-indigo-500/20 p-6 max-w-2xl mx-auto mb-6"
        >
          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="flex items-center gap-3">
              <Navigation className="w-5 h-5 text-orange-400" />
              <span className="text-white font-semibold">Select Source Intersection:</span>
            </div>
            <div className="flex gap-2">
              {nodes.map(node => (
                <motion.button
                  key={node.id}
                  onClick={() => setSourceNode(node.id)}
                  className={`px-6 py-2 rounded-xl font-bold transition-all ${
                    sourceNode === node.id
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/50'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {node.label}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
        
        {/* Controls */}
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-indigo-500/20 p-6 flex flex-wrap items-center justify-center gap-3">
          <motion.button
            onClick={() => {
              setCurrentStep(0);
              setPlaying(false);
            }}
            className="w-14 h-14 bg-slate-800/80 hover:bg-slate-700 rounded-full text-slate-300 hover:text-white transition-all flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <RotateCcw size={22} />
          </motion.button>

          <motion.button
            onClick={() => setPlaying(!playing)}
            className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-2xl text-white transition-all flex items-center justify-center shadow-lg shadow-blue-500/50"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {playing ? <Pause size={28} fill="white" /> : <Play size={28} fill="white" />}
          </motion.button>

          <div className="ml-4 flex items-center gap-3 bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700">
            <span className="text-xs text-slate-400 font-semibold">Speed</span>
            <select 
              value={speed} 
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="bg-slate-900 text-slate-300 text-sm px-3 py-1 rounded-lg border border-slate-600 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value={3000}>0.5x</option>
              <option value={2000}>0.75x</option>
              <option value={1500}>1x</option>
              <option value={1000}>1.5x</option>
              <option value={500}>2x</option>
              <option value={300}>3x</option>
              <option value={200}>4x</option>
              <option value={100}>5x</option>
            </select>
          </div>

          <div className="ml-2 bg-slate-800 px-4 py-2 rounded-full text-indigo-300 font-mono text-sm border border-slate-700">
            {currentStep + 1} / {Math.max(dijkstraSteps.length, warshallSteps.length)}
          </div>

          <motion.button
            onClick={() => setShowComparison(!showComparison)}
            className={`ml-4 px-6 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 ${
              showComparison
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/50'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Table2 size={18} />
            {showComparison ? 'Hide' : 'Show'} Comparison Table
          </motion.button>
        </div>

        {/* Progress */}
        <div className="max-w-2xl mx-auto mt-4">
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / Math.max(dijkstraSteps.length, warshallSteps.length)) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* === Dijkstra Section === */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gradient-to-br from-slate-900/90 to-blue-900/40 backdrop-blur-xl rounded-3xl border-2 border-blue-500/40 p-8 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-blue-400 animate-pulse shadow-lg shadow-blue-500/50" />
              <span className="text-2xl">Dijkstra&apos;s Algorithm</span>
            </h3>
          </div>

          <div className="mb-6 space-y-3">
            <div className="p-3 bg-orange-950/30 rounded-xl border border-orange-500/30">
              <p className="text-orange-200 text-center text-sm">
                ⚠️ <span className="text-white font-semibold">Limitation:</span> Only from source {nodes.find(n => n.id === sourceNode)?.label}. For paths from other nodes, must rerun.
              </p>
            </div>
          </div>

          {/* Graph Visualization */}
          <div className="bg-slate-950/70 rounded-2xl border border-blue-500/20 mb-6 relative overflow-hidden" style={{ minHeight: '300px' }}>
            <svg width="100%" height="100%" viewBox={viewBox} preserveAspectRatio="xMidYMid meet" className="w-full h-full">
              <SvgDefs idPrefix="dijk" />
              {edges.map((edge, idx) => {
                const fromNode = nodes.find(n => n.id === edge.from);
                const toNode = nodes.find(n => n.id === edge.to);
                if (!fromNode || !toNode) return null;
                const isBiDirectional = edges.some(e => e.from === edge.to && e.to === edge.from);
                const { path, textX, textY } = getEdgePath(fromNode, toNode, isBiDirectional);
                const isActive = currentDijkstra?.activeEdges?.some((e: any) => e.from === edge.from && e.to === edge.to);
                
                return (
                  <g key={`d-edge-${idx}`}>
                    <motion.path
                      d={path} fill="none"
                      stroke={isActive ? '#3b82f6' : '#6366f1'}
                      strokeWidth={isActive ? 4 : 3}
                      markerEnd={`url(#dijk-arrow-${isActive ? 'active' : 'default'})`}
                      filter={`url(#dijk-edge-glow)`}
                      animate={{ strokeOpacity: isActive ? 1 : 0.4 }}
                      className="transition-colors duration-300"
                    />
                    <circle cx={textX} cy={textY} r="14" fill="#0f172a" opacity="0.9" stroke="#3b82f6" strokeWidth="1" />
                    <text x={textX} y={textY} dy="5" textAnchor="middle" className="fill-white text-sm font-bold pointer-events-none">{edge.weight} km</text>
                  </g>
                );
              })}
              {nodes.map((node) => {
                const isCurrent = currentDijkstra?.current === node.id;
                const isVisited = currentDijkstra?.visited?.includes(node.id);
                const isSource = node.id === sourceNode;
                
                return (
                  <g key={`d-node-${node.id}`}>
                    {isCurrent && (
                        <motion.circle cx={node.x} cy={node.y} r="45" stroke="#3b82f6" strokeWidth="2" fill="none" initial={{ scale: 0.8, opacity: 1 }} animate={{ scale: 1.2, opacity: 0 }} transition={{ duration: 1.5, repeat: Infinity }} />
                    )}
                    <circle cx={node.x} cy={node.y} r="38" fill="none" stroke={isCurrent ? '#3b82f6' : isVisited ? '#059669' : 'transparent'} strokeWidth="2" opacity="0.5" />
                    <circle cx={node.x} cy={node.y} r="30" fill={`url(#dijk-node-${isSource ? 'source' : isCurrent ? 'active' : isVisited ? 'visited' : 'gradient'})`} stroke={isSource ? '#f59e0b' : isCurrent ? '#60a5fa' : isVisited ? '#34d399' : '#9ca3af'} strokeWidth="3" filter={`url(#dijk-glow)`} />
                    <text x={node.x} y={node.y} dy="1" textAnchor="middle" dominantBaseline="middle" className="fill-white text-xl font-bold pointer-events-none">{node.label}</text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Distance Table */}
          <div className="space-y-3">
            <h4 className="text-blue-300 text-center mb-3">Shortest Distances from {nodes.find(n => n.id === sourceNode)?.label}</h4>
            <div className="grid grid-cols-2 gap-3">
              {nodes.map((node) => {
                const isCurrent = currentDijkstra?.current === node.id;
                const isVisited = currentDijkstra?.visited?.includes(node.id);
                const distance = currentDijkstra?.distances?.[node.id];
                const isReachable = distance !== Infinity;
                
                return (
                  <motion.div
                    key={node.id}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      isCurrent
                        ? 'bg-blue-500/30 border-blue-400 shadow-lg shadow-blue-500/50'
                        : isVisited
                        ? 'bg-blue-500/20 border-blue-500/50'
                        : 'bg-slate-800/50 border-slate-600/50'
                    }`}
                    animate={isCurrent ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-blue-200 font-semibold">{node.label}</span>
                      <div className="text-right">
                        <div className="text-white text-xl font-bold">
                          {distance === Infinity ? '∞' : `${distance} km`}
                        </div>
                        <div className={`text-xs font-semibold ${isReachable ? 'text-green-400' : 'text-red-400'}`}>
                          {isReachable ? '✓ Reachable' : '✗ Unreachable'}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Current Step Info */}
          {currentDijkstra?.description && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-blue-950/50 rounded-xl border border-blue-500/30"
            >
              <p className="text-blue-200 text-center text-sm">{currentDijkstra.description}</p>
            </motion.div>
          )}
        </motion.div>

        {/* === Warshall Section === */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gradient-to-br from-slate-900/90 to-purple-900/40 backdrop-blur-xl rounded-3xl border-2 border-purple-500/40 p-8 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-purple-400 animate-pulse shadow-lg shadow-purple-500/50" />
              <span className="text-2xl">Warshall&apos;s Algorithm</span>
            </h3>
          </div>

          <div className="mb-6 space-y-3">
            <div className="p-3 bg-green-950/30 rounded-xl border border-green-500/30">
              <p className="text-green-200 text-center text-sm">
                ✓ <span className="text-white font-semibold">Advantage:</span> Answers reachability for ANY pair, independent of source.
              </p>
            </div>
          </div>

          {/* Graph Visualization */}
          <div className="bg-slate-950/70 rounded-2xl border border-purple-500/20 mb-6 relative overflow-hidden" style={{ minHeight: '300px' }}>
            <svg width="100%" height="100%" viewBox={viewBox} preserveAspectRatio="xMidYMid meet" className="w-full h-full">
              <SvgDefs idPrefix="war" />
              {/* Base Edges */}
              {edges.map((edge, idx) => {
                const fromNode = nodes.find(n => n.id === edge.from);
                const toNode = nodes.find(n => n.id === edge.to);
                if (!fromNode || !toNode) return null;
                const isBiDirectional = edges.some(e => e.from === edge.to && e.to === edge.from);
                const { path, textX, textY } = getEdgePath(fromNode, toNode, isBiDirectional);
                return (
                  <g key={`w-base-edge-${idx}`}>
                    <motion.path d={path} fill="none" stroke="#4b5563" strokeWidth="2" markerEnd="url(#war-arrow-default)" opacity="0.3" />
                    <circle cx={textX} cy={textY} r="14" fill="#0f172a" opacity="0.7" stroke="#6b7280" strokeWidth="1" />
                    <text x={textX} y={textY} dy="5" textAnchor="middle" className="fill-slate-400 text-sm font-bold pointer-events-none">{edge.weight} km</text>
                  </g>
                );
              })}
              {/* Transitive Paths */}
              {currentWarshall && nodes.map((fromNode, i) =>
                nodes.map((toNode, j) => {
                  if (i === j || !currentWarshall.matrix[i][j]) return null;
                  const hasDirectEdge = edges.some(e => e.from === fromNode.id && e.to === toNode.id);
                  if (hasDirectEdge) return null;
                  const isBiDirectional = currentWarshall.matrix[j][i];
                  const { path } = getEdgePath(fromNode, toNode, isBiDirectional);
                  return (
                    <motion.path key={`w-trans-${i}-${j}`} d={path} fill="none" stroke="#a855f7" strokeWidth="3" strokeDasharray="6,4" markerEnd="url(#war-arrow-warshall)" filter="url(#war-edge-glow)" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 0.8 }} />
                  );
                })
              )}
              {nodes.map((node) => {
                const isActive = currentWarshall?.activeNodes?.includes(node.id);
                const isSource = node.id === sourceNode;
                
                return (
                  <g key={`w-node-${node.id}`}>
                    {isActive && (
                      <motion.circle 
                        cx={node.x} cy={node.y} r="45" 
                        stroke="#a855f7" strokeWidth="2" fill="none" 
                        initial={{ scale: 0.8, opacity: 1 }} 
                        animate={{ scale: 1.2, opacity: 0 }} 
                        transition={{ duration: 1.5, repeat: Infinity }} 
                      />
                    )}
                    <circle 
                      cx={node.x} cy={node.y} r="30" 
                      fill={isSource ? "url(#war-node-source)" : isActive ? "#a855f7" : "url(#war-node-gradient)"} 
                      stroke={isSource ? "#f59e0b" : isActive ? "#d946ef" : "#a855f7"} 
                      strokeWidth="3" 
                      filter="url(#war-glow)" 
                    />
                    <text x={node.x} y={node.y} dy="1" textAnchor="middle" dominantBaseline="middle" className="fill-white text-xl font-bold pointer-events-none">{node.label}</text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Reachability from Source */}
          <div className="space-y-3 mb-6">
            <h4 className="text-purple-300 text-center mb-3">Reachability from {nodes.find(n => n.id === sourceNode)?.label}</h4>
            <div className="grid grid-cols-2 gap-3">
              {warshallReachability.map((item) => (
                <motion.div
                  key={item.id}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    item.reachable
                      ? 'bg-purple-500/20 border-purple-500/50'
                      : 'bg-slate-800/50 border-slate-600/50'
                  }`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-purple-200 font-semibold">{item.label}</span>
                    <div className={`text-sm font-semibold ${item.reachable ? 'text-green-400' : 'text-red-400'}`}>
                      {item.reachable ? '✓ Reachable' : '✗ Unreachable'}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Reachability Matrix (Compact) */}
          <div className="space-y-3">
            <h4 className="text-purple-300 text-center mb-3">Full Reachability Matrix (All Pairs)</h4>
            <div className="flex justify-center">
              <div className="inline-block p-4 bg-slate-950/50 rounded-xl">
                <div 
                  className="grid gap-2 items-center justify-items-center" 
                  style={{ gridTemplateColumns: `auto repeat(${nodes.length}, minmax(0, 1fr))` }}
                >
                  <div className="w-8 h-8"></div>
                  {nodes.map(node => (
                    <div key={`col-header-${node.id}`} className="text-purple-300 font-bold text-lg">
                      {node.label}
                    </div>
                  ))}
                  {currentWarshall?.matrix.map((row: boolean[], i: number) => (
                    <React.Fragment key={`row-${i}`}>
                      <div key={`row-header-${nodes[i]?.id}`} className="text-purple-300 font-bold text-lg mr-2">
                        {nodes[i]?.label}
                      </div>
                      {row.map((cell, j) => (
                        <motion.div
                          key={`${i}-${j}`}
                          className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg transition-all ${
                            cell
                              ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/50 border-2 border-purple-300'
                              : 'bg-slate-800/70 text-slate-500 border-2 border-slate-600/50'
                          }`}
                          animate={{
                            scale: cell ? [1, 1.15, 1] : 1,
                            backgroundColor: cell ? '#a855f7' : '#1e293b'
                          }}
                          transition={{ 
                            scale: { duration: 0.4 },
                            backgroundColor: { duration: 0.3 }
                          }}
                        >
                          {cell ? '1' : '0'}
                        </motion.div>
                      ))}
                    </React.Fragment>
                  ))}
                </div>
                <div className="mt-3 text-center">
                  <p className="text-purple-200 text-xs">
                    <span className="text-white font-semibold">1</span> = Path exists • <span className="text-slate-400 font-semibold">0</span> = No path
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Current Step Info */}
          {currentWarshall?.description && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-purple-950/50 rounded-xl border border-purple-500/30"
            >
              <p className="text-purple-200 text-center text-sm whitespace-pre-line">{currentWarshall.description.replace(/\\n/g, '\n')}</p>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Path Query Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-slate-900/90 to-cyan-900/40 backdrop-blur-xl rounded-3xl border-2 border-cyan-500/40 p-8 shadow-2xl"
      >
        <h3 className="text-white mb-6 text-center text-2xl flex items-center justify-center gap-3">
          <Navigation className="w-6 h-6 text-cyan-400" />
          Test Your Own Path Query
        </h3>
        
        <p className="text-center text-slate-300 mb-6 max-w-2xl mx-auto">
          Select any two intersections to see which algorithm performs better for your specific query.
        </p>

        {/* From/To Selection */}
        <div className="bg-slate-950/50 rounded-2xl border border-cyan-500/20 p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* From Node */}
            <div>
              <label className="text-cyan-300 font-semibold mb-3 block text-center">From Intersection:</label>
              <div className="flex gap-2 justify-center flex-wrap">
                {nodes.map(node => (
                  <motion.button
                    key={`from-${node.id}`}
                    onClick={() => setFromNode(node.id)}
                    className={`px-5 py-2 rounded-xl font-bold transition-all ${
                      fromNode === node.id
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/50'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {node.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* To Node */}
            <div>
              <label className="text-cyan-300 font-semibold mb-3 block text-center">To Intersection:</label>
              <div className="flex gap-2 justify-center flex-wrap">
                {nodes.map(node => (
                  <motion.button
                    key={`to-${node.id}`}
                    onClick={() => setToNode(node.id)}
                    className={`px-5 py-2 rounded-xl font-bold transition-all ${
                      toNode === node.id
                        ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg shadow-pink-500/50'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {node.label}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Query Display */}
          <div className="mt-6 text-center p-4 bg-gradient-to-r from-cyan-950/50 to-pink-950/50 rounded-xl border border-cyan-500/30">
            <p className="text-white text-lg">
              Query: Can I travel from <span className="font-bold text-cyan-400">{nodes.find(n => n.id === fromNode)?.label}</span> to <span className="font-bold text-pink-400">{nodes.find(n => n.id === toNode)?.label}</span>?
            </p>
          </div>
        </div>

        {/* Results Comparison */}
        {pathQuery && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            {/* Results Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Dijkstra Result */}
              <div className={`p-6 rounded-2xl border-2 transition-all ${
                pathQuery.dijkstraCanAnswer
                  ? 'bg-blue-950/50 border-blue-500/50'
                  : 'bg-red-950/30 border-red-500/30 opacity-60'
              }`}>
                <h4 className="text-blue-300 font-semibold mb-4 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-400" />
                  Dijkstra&apos;s Answer
                </h4>
                
                {pathQuery.dijkstraCanAnswer ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                      <span className="text-blue-200">Reachable:</span>
                      <span className={`font-bold ${pathQuery.dijkstraReachable ? 'text-green-400' : 'text-red-400'}`}>
                        {pathQuery.dijkstraReachable ? '✓ Yes' : '✗ No'}
                      </span>
                    </div>
                    {pathQuery.dijkstraReachable && (
                      <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                        <span className="text-blue-200">Shortest Distance:</span>
                        <span className="font-bold text-white">{pathQuery.dijkstraDistance} km</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-red-900/20 rounded-lg border border-red-500/30">
                    <p className="text-red-200 text-sm">
                      ⚠️ Cannot answer! Dijkstra&apos;s source is <span className="font-bold">{nodes.find(n => n.id === sourceNode)?.label}</span>, not <span className="font-bold">{nodes.find(n => n.id === fromNode)?.label}</span>.
                    </p>
                  </div>
                )}
              </div>

              {/* Warshall Result */}
              <div className="p-6 rounded-2xl border-2 bg-purple-950/50 border-purple-500/50">
                <h4 className="text-purple-300 font-semibold mb-4 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-400" />
                  Warshall&apos;s Answer
                </h4>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                    <span className="text-purple-200">Reachable:</span>
                    <span className={`font-bold ${pathQuery.warshallReachable ? 'text-green-400' : 'text-red-400'}`}>
                      {pathQuery.warshallReachable ? '✓ Yes' : '✗ No'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                    <span className="text-purple-200">Shortest Distance:</span>
                    <span className="font-bold text-slate-400">N/A</span>
                  </div>
                  <div className="p-3 bg-green-950/20 rounded-lg border border-green-500/30">
                    <p className="text-green-200 text-sm flex items-center gap-2">
                      <span>✓</span>
                      Can answer queries for ANY pair!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Verdict */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-2xl border-2 ${
                pathQuery.betterAlgorithm === 'dijkstra'
                  ? 'bg-blue-950/50 border-blue-500/50'
                  : pathQuery.betterAlgorithm === 'warshall'
                  ? 'bg-purple-950/50 border-purple-500/50'
                  : 'bg-slate-900/50 border-slate-600/50'
              }`}
            >
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <span className="text-2xl">🏆</span>
                Verdict: Which Algorithm is Better?
              </h4>
              
              <div className="mb-4">
                <p className={`text-lg font-bold ${
                  pathQuery.betterAlgorithm === 'dijkstra'
                    ? 'text-blue-300'
                    : pathQuery.betterAlgorithm === 'warshall'
                    ? 'text-purple-300'
                    : 'text-slate-300'
                }`}>
                  {pathQuery.betterAlgorithm === 'dijkstra' && 'Dijkstra is better for this query'}
                  {pathQuery.betterAlgorithm === 'warshall' && 'Warshall is better for this query'}
                  {pathQuery.betterAlgorithm === 'both' && 'Both algorithms work equally well'}
                </p>
              </div>

              <div className="p-4 bg-slate-950/70 rounded-lg border border-slate-700">
                <p className="text-slate-200 text-sm leading-relaxed">
                  <span className="text-yellow-400 font-semibold">Reason:</span> {pathQuery.reason}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>

      {/* Comparison Table */}
      {showComparison && (
        <motion.div
          initial={{ opacity: 0, y: 20, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: 20, height: 0 }}
          className="bg-gradient-to-br from-slate-900/90 to-indigo-900/40 backdrop-blur-xl rounded-3xl border-2 border-indigo-500/40 p-8 shadow-2xl overflow-hidden"
        >
          <h3 className="text-white mb-6 text-center text-2xl flex items-center justify-center gap-3">
            <Table2 className="w-6 h-6 text-indigo-400" />
            Detailed Comparison Table
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-indigo-500/30">
                  <th className="text-left p-4 text-indigo-300 font-semibold">Aspect</th>
                  <th className="text-left p-4 text-blue-300 font-semibold">Dijkstra&apos;s Algorithm</th>
                  <th className="text-left p-4 text-purple-300 font-semibold">Warshall&apos;s Algorithm</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                <tr className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-slate-300 font-semibold">Reachability from {nodes.find(n => n.id === sourceNode)?.label}</td>
                  <td className="p-4">
                    <div className="space-y-1">
                      {dijkstraReachability.map(item => (
                        <div key={item.id} className="flex items-center gap-2">
                          <span className="text-blue-200">{item.label}:</span>
                          <span className={item.reachable ? 'text-green-400' : 'text-red-400'}>
                            {item.reachable ? '✓ Yes' : '✗ No'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      {warshallReachability.map(item => (
                        <div key={item.id} className="flex items-center gap-2">
                          <span className="text-purple-200">{item.label}:</span>
                          <span className={item.reachable ? 'text-green-400' : 'text-red-400'}>
                            {item.reachable ? '✓ Yes' : '✗ No'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
                <tr className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-slate-300 font-semibold">Shortest Paths</td>
                  <td className="p-4">
                    <div className="space-y-1">
                      {nodes.map(node => {
                        const distance = currentDijkstra?.distances?.[node.id];
                        return (
                          <div key={node.id} className="flex items-center gap-2">
                            <span className="text-blue-200">To {node.label}:</span>
                            <span className="text-white font-semibold">
                              {distance === Infinity ? '∞' : `${distance} km`}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </td>
                  <td className="p-4 text-purple-200">
                    Does not calculate distances, only confirms path existence
                  </td>
                </tr>
                <tr className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-slate-300 font-semibold">Source Dependency</td>
                  <td className="p-4">
                    <span className="text-orange-400">⚠️ Single Source Only</span>
                    <p className="text-blue-200 text-sm mt-1">
                      Results are only valid from source {nodes.find(n => n.id === sourceNode)?.label}. 
                      To find paths from {nodes.find(n => n.id !== sourceNode)?.label}, must rerun the algorithm.
                    </p>
                  </td>
                  <td className="p-4">
                    <span className="text-green-400">✓ All-Pairs Independent</span>
                    <p className="text-purple-200 text-sm mt-1">
                      Can answer reachability between ANY two nodes, regardless of which is considered the source.
                    </p>
                  </td>
                </tr>
                <tr className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-slate-300 font-semibold">Real-Life Example</td>
                  <td className="p-4 text-blue-200">
                    GPS navigation: &quot;What is the shortest route from my current location to destination X?&quot;
                  </td>
                  <td className="p-4 text-purple-200">
                    Network connectivity: &quot;Can any computer in the network reach any other computer?&quot;
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Key Differences Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 backdrop-blur-xl rounded-3xl border-2 border-indigo-500/40 p-8 shadow-2xl"
      >
        <h4 className="text-white mb-6 text-center text-2xl">Key Differences Summary</h4>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-blue-950/30 rounded-2xl border border-blue-500/30">
            <div className="text-5xl mb-4">📏</div>
            <h5 className="text-blue-300 mb-3 text-xl font-semibold">What They Calculate</h5>
            <div className="space-y-2">
              <p className="text-blue-200 text-sm">
                <span className="text-white font-bold">Dijkstra:</span> Exact distances (cost)
              </p>
              <p className="text-purple-200 text-sm">
                <span className="text-white font-bold">Warshall:</span> Path existence (yes/no)
              </p>
            </div>
          </div>
          
          <div className="text-center p-6 bg-purple-950/30 rounded-2xl border border-purple-500/30">
            <div className="text-5xl mb-4">🎯</div>
            <h5 className="text-purple-300 mb-3 text-xl font-semibold">Scope</h5>
            <div className="space-y-2">
              <p className="text-blue-200 text-sm">
                <span className="text-white font-bold">Dijkstra:</span> Single source to all
              </p>
              <p className="text-purple-200 text-sm">
                <span className="text-white font-bold">Warshall:</span> All pairs to all
              </p>
            </div>
          </div>
          
          <div className="text-center p-6 bg-pink-950/30 rounded-2xl border border-pink-500/30">
            <div className="text-5xl mb-4">⚡</div>
            <h5 className="text-pink-300 mb-3 text-xl font-semibold">Performance</h5>
            <div className="space-y-2">
              <p className="text-blue-200 text-sm">
                <span className="text-white font-bold">Dijkstra:</span> Faster for sparse graphs
              </p>
              <p className="text-purple-200 text-sm">
                <span className="text-white font-bold">Warshall:</span> Better for dense graphs
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 p-6 bg-gradient-to-r from-orange-950/30 to-red-950/30 rounded-2xl border border-orange-500/30">
          <h5 className="text-orange-300 mb-3 text-center font-semibold">Important Note: Source Dependency</h5>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-orange-900/20 rounded-xl">
              <p className="text-orange-200 text-sm">
                <span className="text-white font-bold">Dijkstra&apos;s Limitation:</span> If you select source {nodes.find(n => n.id === sourceNode)?.label}, 
                it only finds paths FROM {nodes.find(n => n.id === sourceNode)?.label}. 
                To find paths from {nodes.find(n => n.id !== sourceNode)?.label}, you must rerun the algorithm with {nodes.find(n => n.id !== sourceNode)?.label} as the source.
              </p>
            </div>
            <div className="p-4 bg-green-900/20 rounded-xl">
              <p className="text-green-200 text-sm">
                <span className="text-white font-bold">Warshall&apos;s Advantage:</span> Computes reachability for ALL pairs at once. 
                You can immediately answer &quot;Can {nodes[0]?.label} reach {nodes[1]?.label}?&quot; or &quot;Can {nodes[2]?.label} reach {nodes[3]?.label}?&quot; 
                without rerunning anything.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}