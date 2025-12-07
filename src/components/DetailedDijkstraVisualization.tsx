import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  FastForward, 
  Info, 
  Route, 
  ChevronsRight, 
  GitCommit, 
  ArrowRight,
  CheckCircle2,
  MapPin,
  List
} from 'lucide-react';
import { GraphNode, GraphEdge } from '../App';
import { runDijkstra } from './../utils/algorithms';

interface DetailedDijkstraVisualizationProps {
  customGraph?: { nodes: GraphNode[]; edges: GraphEdge[] } | null;
}

export function DetailedDijkstraVisualization({ customGraph }: DetailedDijkstraVisualizationProps) {
  const inputNodes = customGraph?.nodes || [];
  const inputEdges = customGraph?.edges || [];

  // 1. Center Nodes Logic
  const centeredNodes = useMemo(() => {
    if (inputNodes.length === 0) return [];
    
    const xs = inputNodes.map(n => n.x);
    const ys = inputNodes.map(n => n.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const graphWidth = maxX - minX;
    const graphHeight = maxY - minY;
    
    // Fit into 800x600 Canvas (Updated Height)
    const offsetX = (800 - graphWidth) / 2 - minX;
    const offsetY = (600 - graphHeight) / 2 - minY;

    return inputNodes.map(n => ({
      ...n,
      x: n.x + offsetX,
      y: n.y + offsetY
    }));
  }, [inputNodes]);

  // 2. Generate Steps
  const steps = useMemo(() => {
    if (centeredNodes.length === 0) return [];
    // Ensure we have a valid start node
    const startNode = centeredNodes[0];
    if (!startNode) return [];
    
    return runDijkstra(centeredNodes, inputEdges, startNode.id);
  }, [centeredNodes, inputEdges]);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1500); // ms per step

  const currentStep = steps[currentStepIndex] || steps[0];

  // 3. Auto Play Logic
  useEffect(() => {
    let interval: any;
    if (isPlaying && currentStepIndex < steps.length - 1) {
      interval = setInterval(() => {
        setCurrentStepIndex(p => p + 1);
      }, speed);
    } else if (currentStepIndex >= steps.length - 1) {
      setIsPlaying(false);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStepIndex, steps.length, speed]);

  if (!currentStep) return <div className="p-10 text-white text-center">Initializing Graph Logic...</div>;

  // 4. Edge Path Calculation (Curved if bidirectional)
  const getEdgePath = (edge: GraphEdge) => {
    const fromNode = centeredNodes.find(n => n.id === edge.from);
    const toNode = centeredNodes.find(n => n.id === edge.to);
    if (!fromNode || !toNode) return { path: "", midX: 0, midY: 0 };

    const isBiDirectional = inputEdges.some(e => e.from === edge.to && e.to === edge.from);
    
    if (isBiDirectional) {
        // Curve Logic
        const dx = toNode.x - fromNode.x;
        const dy = toNode.y - fromNode.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Offset for curve control point
        const offset = 40; 
        const midX = (fromNode.x + toNode.x) / 2;
        const midY = (fromNode.y + toNode.y) / 2;
        
        // Normal vector for curve
        const normX = -dy / dist;
        const normY = dx / dist;
        
        const controlX = midX + normX * offset;
        const controlY = midY + normY * offset;
        
        return {
            path: `M ${fromNode.x} ${fromNode.y} Q ${controlX} ${controlY} ${toNode.x} ${toNode.y}`,
            midX: controlX,
            midY: controlY
        };
    } else {
        // Straight Line
        return {
            path: `M ${fromNode.x} ${fromNode.y} L ${toNode.x} ${toNode.y}`,
            midX: (fromNode.x + toNode.x) / 2,
            midY: (fromNode.y + toNode.y) / 2
        };
    }
  };

  // 5. Build Path Helper (Reconstruct path from previous)
  const buildPath = (targetNodeId: string): string[] => {
    const path: string[] = [];
    let current: string | null = targetNodeId;
    const finalStep = steps[steps.length - 1];
    const startNodeId = centeredNodes[0].id;
    
    // Safety break to prevent infinite loops
    let limit = 0;
    while (current !== null && limit < 100) {
      path.unshift(current);
      if (current === startNodeId) break;
      current = finalStep.previous[current];
      limit++;
    }
    
    return path;
  };

  const isAlgorithmComplete = currentStepIndex === steps.length - 1;

  return (
    <>
    {/* Page Header */}
    <div className="text-center mb-6 px-4">
      <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 mb-2">
        Dijkstra's Algorithm - Step by Step
      </h1>
      <p className="text-slate-400">
        Watch how the shortest path is calculated from the source node
      </p>
    </div>

    {/* Added 'items-start' to ensure dynamic height columns align to top correctly */}
    <div className="grid lg:grid-cols-3 gap-6 h-full p-2 items-start font-sans text-slate-200">
      
      {/* LEFT COLUMN: VISUALIZATION & CONTROLS */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        
        {/* Graph Canvas - Increased Height to 600px */}
        <div className="bg-slate-900/80 backdrop-blur rounded-3xl border border-slate-700 p-1 shadow-2xl relative overflow-hidden h-[600px]">
           <h3 className="text-center font-bold text-xl text-blue-400 mb-4 pt-4">Graph Visualization</h3>
           <svg className="w-full h-full bg-slate-950/50 rounded-2xl" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet">
            <defs>
              {/* Arrow Heads */}
              <marker id="arrow-idle" markerWidth="6" markerHeight="6" refX="24" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6" fill="#475569" />
              </marker>
              <marker id="arrow-active" markerWidth="8" markerHeight="8" refX="24" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6" fill="#22c55e" stroke="#22c55e" strokeWidth="1"/>
              </marker>
              <marker id="arrow-path" markerWidth="6" markerHeight="6" refX="24" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6" fill="#3b82f6" />
              </marker>

              {/* Node Gradients */}
              <linearGradient id="grad-idle" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#334155" />
                  <stop offset="100%" stopColor="#1e293b" />
              </linearGradient>
              <linearGradient id="grad-explored" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22c55e" />
                  <stop offset="100%" stopColor="#15803d" />
              </linearGradient>
              <linearGradient id="grad-queue" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#c2410c" />
              </linearGradient>
              <linearGradient id="grad-current" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="#b91c1c" />
              </linearGradient>

              {/* Glow Filter */}
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* 1. Edges Layer */}
            {inputEdges.map((edge, idx) => {
              const { path, midX, midY } = getEdgePath(edge);
              if (!path) return null;

              const isActive = currentStep.activeEdges.some(e => e.from === edge.from && e.to === edge.to);
              const isInPath = currentStep.previous[edge.to] === edge.from;
              
              const strokeColor = isActive ? "#22c55e" : (isInPath ? "#3b82f6" : "#334155");
              const strokeWidth = isActive ? 4 : (isInPath ? 3 : 2);
              const marker = isActive ? "url(#arrow-active)" : (isInPath ? "url(#arrow-path)" : "url(#arrow-idle)");

              return (
                <g key={`edge-${idx}`}>
                   <motion.path 
                     d={path} 
                     fill="none"
                     stroke={strokeColor}
                     strokeWidth={strokeWidth}
                     markerEnd={marker}
                     initial={false}
                     animate={{ stroke: strokeColor, strokeWidth: strokeWidth }}
                     transition={{ duration: 0.3 }}
                   />
                   {/* Weight Badge */}
                   <circle cx={midX} cy={midY} r="9" fill="#0f172a" stroke={strokeColor} strokeWidth="1"/>
                   <text x={midX} y={midY} dy="3" textAnchor="middle" className="fill-white text-[10px] font-bold font-mono">
                     {edge.weight}
                   </text>
                </g>
              );
            })}

            {/* 2. Nodes Layer */}
            {centeredNodes.map((node) => {
              const isCurrent = currentStep.current === node.id;
              const isTarget = currentStep.targetNeighbor === node.id;
              const isExplored = currentStep.visited.includes(node.id);
              const isInQueue = currentStep.queue.some(q => q.id === node.id);
              const dist = currentStep.distances[node.id];

              let fillUrl = "url(#grad-idle)";
              let strokeColor = "#475569";
              
              if (isCurrent) { fillUrl = "url(#grad-current)"; strokeColor = "#fecaca"; }
              else if (isExplored) { fillUrl = "url(#grad-explored)"; strokeColor = "#86efac"; }
              else if (isInQueue) { fillUrl = "url(#grad-queue)"; strokeColor = "#fdba74"; }
              else if (isTarget) { strokeColor = "#fde047"; } // Target just gets stroke highlight

              return (
                <g key={node.id}>
                   {/* Pulse Effect for Current Node */}
                   {isCurrent && (
                     <motion.circle 
                       cx={node.x} cy={node.y} r="35" 
                       fill="none" stroke="#ef4444" strokeWidth="2"
                       initial={{ scale: 1, opacity: 1 }}
                       animate={{ scale: 1.5, opacity: 0 }}
                       transition={{ duration: 1.5, repeat: Infinity }}
                     />
                   )}

                   <circle 
                     cx={node.x} cy={node.y} r="28" 
                     fill={fillUrl} 
                     stroke={strokeColor} 
                     strokeWidth={isTarget || isCurrent ? 3 : 2}
                     filter={isCurrent || isTarget ? "url(#glow)" : ""}
                   />
                   
                   <text x={node.x} y={node.y} dy="5" textAnchor="middle" className="fill-white text-lg font-bold pointer-events-none drop-shadow-md">
                     {node.label}
                   </text>

                   {/* Distance Tag - BELOW Node */}
                   <g transform={`translate(${node.x + 20}, ${node.y - 24})`}>
                      <rect x="0" y="0" width="34" height="20" rx="4" fill="#020617" stroke={strokeColor} strokeWidth="1" />
                      <text x="17" y="14" textAnchor="middle" className="fill-white text-[11px] font-mono font-bold">
                        {dist === Infinity ? '∞' : dist}
                      </text>
                   </g>
                </g>
              );
            })}
           </svg>
        </div>

        {/* Playback Controls */}
        <div className="bg-slate-900/50 backdrop-blur rounded-2xl border border-slate-700 p-6 flex flex-wrap items-center justify-center gap-3">
            {/* Reset Button */}
            <motion.button 
              onClick={() => {setIsPlaying(false); setCurrentStepIndex(0)}} 
              className="w-14 h-14 bg-slate-800/80 hover:bg-slate-700 rounded-full text-slate-300 hover:text-white transition-all flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <RotateCcw size={22} />
            </motion.button>

            {/* Previous Button */}
            <motion.button 
              onClick={() => {setIsPlaying(false); setCurrentStepIndex(p => Math.max(0, p-1))}} 
              className="w-14 h-14 bg-slate-800/80 hover:bg-slate-700 rounded-full text-slate-300 hover:text-white transition-all flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronsRight size={22} className="rotate-180" />
            </motion.button>

            {/* Play/Pause Button (Large, Square with rounded corners) */}
            <motion.button 
              onClick={() => setIsPlaying(!isPlaying)} 
              className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-2xl text-white transition-all flex items-center justify-center shadow-lg shadow-purple-500/50"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {isPlaying ? <Pause size={28} fill="white" /> : <Play size={28} fill="white" />}
            </motion.button>

            {/* Next Button */}
            <motion.button 
              onClick={() => {setIsPlaying(false); setCurrentStepIndex(p => Math.min(steps.length-1, p+1))}} 
              className="w-14 h-14 bg-slate-800/80 hover:bg-slate-700 rounded-full text-slate-300 hover:text-white transition-all flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronsRight size={22} />
            </motion.button>

            {/* Speed Control */}
            <div className="ml-4 flex items-center gap-3 bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700">
              <span className="text-xs text-slate-400 font-semibold">Speed</span>
              <select 
                value={speed} 
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="bg-slate-900 text-slate-300 text-sm px-3 py-1 rounded-lg border border-slate-600 focus:outline-none focus:border-blue-500 cursor-pointer"
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

            {/* Step Counter */}
            <div className="ml-2 bg-slate-800 px-4 py-2 rounded-full text-blue-300 font-mono text-sm border border-slate-700">
              {currentStepIndex + 1} / {steps.length}
            </div>
        </div>
      </div>

      {/* RIGHT COLUMN: DATA TABLES & INFO */}
      <div className="bg-slate-900/90 rounded-3xl border border-slate-700 p-6 flex flex-col gap-6">
        
        {/* 1. Explanation Box */}
        <div className="shrink-0">
             <h3 className="text-blue-400 font-bold mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
                <GitCommit size={16}/> Current Operation
             </h3>
             <div className="bg-slate-950/50 border-l-4 border-blue-500 rounded-r-lg p-4 min-h-[90px] shadow-inner flex items-center">
                 <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line font-mono">
                    {currentStep.description}
                 </p>
             </div>
        </div>

        {/* 2. Priority Queue Visualization - MODIFIED DESIGN */}
        {/* Changed to look like Split Cards (Letter Top, Number Bottom) */}
        <div className="shrink-0">
            <h3 className="text-orange-400 font-bold mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
                <ChevronsRight size={16}/> Priority Queue (Min Heap)
            </h3>
            <div className="flex gap-2 overflow-x-auto pb-2 min-h-[80px] custom-scrollbar">
                <AnimatePresence>
                    {currentStep.queue.length === 0 ? (
                        <span className="text-slate-600 text-xs italic p-2">Queue is empty</span>
                    ) : (
                        currentStep.queue.map((item, i) => {
                             const node = centeredNodes.find(n => n.id === item.id);
                             return (
                                 <motion.div 
                                    key={`${item.id}-${item.val}`}
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    // New Card Style: Vertical Split
                                    className="flex flex-col items-center bg-slate-800 min-w-[50px] h-[65px] rounded-lg border border-orange-500/30 shadow-md shrink-0 relative overflow-hidden group"
                                 >
                                    {/* Top Part: Label */}
                                    <div className="w-full h-1/2 bg-slate-800 flex items-center justify-center border-b border-slate-700 group-hover:bg-slate-700 transition-colors">
                                        <span className="text-orange-400 font-bold text-lg">{node?.label}</span>
                                    </div>
                                    
                                    {/* Bottom Part: Value */}
                                    <div className="w-full h-1/2 bg-slate-900/50 flex items-center justify-center">
                                        <span className="text-slate-400 text-xs font-mono font-bold">{item.val}</span>
                                    </div>

                                    {/* Indicator Dot */}
                                    {i === 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_5px_#3b82f6]"></span>}
                                 </motion.div>
                             );
                        })
                    )}
                </AnimatePresence>
            </div>
        </div>

        {/* 3. Distance Table */}
        <div className="flex-1 flex flex-col">
            <h3 className="text-emerald-400 font-bold mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
                <Info size={16}/> Shortest Path Table
            </h3>
            <div className="custom-scrollbar bg-slate-950/30 rounded-xl border border-slate-800">
                <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-slate-900 z-10 shadow-sm ring-1 ring-slate-800">
                        <tr className="text-slate-500 text-xs font-bold uppercase">
                            <th className="py-2 px-3 bg-slate-900">Node</th>
                            <th className="py-2 px-3 bg-slate-900">Dist</th>
                            <th className="py-2 px-3 bg-slate-900">Prev</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-slate-800/40">
                        {centeredNodes.map(node => {
                            const dist = currentStep.distances[node.id];
                            const prev = currentStep.previous[node.id];
                            const isCurrent = currentStep.current === node.id;
                            const isUpdated = currentStep.tableHighlight === node.id;
                            
                            return (
                                <tr key={node.id} className={`
                                    transition-colors duration-200
                                    ${isCurrent ? 'bg-red-500/10' : 'hover:bg-slate-800/50'}
                                    ${isUpdated ? 'bg-blue-500/20' : ''}
                                `}>
                                    <td className="py-2 px-3 font-bold text-slate-200">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${currentStep.visited.includes(node.id) ? 'bg-green-500' : 'bg-slate-600'}`}></div>
                                            {node.label}
                                        </div>
                                    </td>
                                    
                                    {/* MODIFICATION: Plain text distance (Removed oval background) */}
                                    <td className="py-2 px-3">
                                        <span className={`font-mono font-bold ${dist === Infinity ? 'text-slate-600' : 'text-blue-400'}`}>
                                            {dist === Infinity ? '∞' : dist}
                                        </span>
                                    </td>
                                    
                                    <td className="py-2 px-3 font-mono text-slate-400 text-xs">
                                        {prev ? (
                                            <span className="text-emerald-400 font-bold">{centeredNodes.find(n=>n.id===prev)?.label}</span>
                                        ) : '-'}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>

      </div>
    </div>

    {/* FINAL PATHS SECTION - Shows only when algorithm complete */}
    {isAlgorithmComplete && (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-8 bg-gradient-to-br from-emerald-900/30 to-teal-900/30 backdrop-blur-xl rounded-3xl border-2 border-emerald-500/40 p-8 shadow-2xl"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-500/50" />
          <h3 className="text-white text-2xl">🎯 Shortest Paths from {centeredNodes[0]?.label}</h3>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {centeredNodes.slice(1).map((targetNode) => {
            const pathNodeIds = buildPath(targetNode.id);
            const pathLabels = pathNodeIds.map(id => centeredNodes.find(n => n.id === id)?.label || id);
            const distance = steps[steps.length - 1].distances[targetNode.id];
            
            return (
              <motion.div
                key={targetNode.id}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="bg-slate-900/60 rounded-2xl border border-emerald-500/30 p-5 hover:border-emerald-400/50 transition-all hover:shadow-lg hover:shadow-emerald-500/20"
              >
                {/* Destination */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-emerald-300">To Node</span>
                  <div className="bg-emerald-600 px-4 py-1.5 rounded-lg">
                    <span className="text-white font-bold text-lg">{targetNode.label}</span>
                  </div>
                </div>

                {/* Distance */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-700">
                  <span className="text-slate-400 text-sm">Total Distance:</span>
                  <span className="text-cyan-400 font-bold text-2xl font-mono">
                    {distance === Infinity ? '∞' : distance}
                  </span>
                </div>

                {/* Path */}
                <div>
                  <span className="text-slate-400 text-xs uppercase tracking-wider">Path:</span>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {pathLabels.map((label, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className={`px-3 py-1.5 rounded-lg font-bold text-sm ${
                          idx === 0 
                            ? 'bg-blue-600 text-white'
                            : idx === pathLabels.length - 1
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-700 text-slate-200'
                        }`}>
                          {label}
                        </div>
                        {idx < pathLabels.length - 1 && (
                          <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-6 border-t border-emerald-500/20 flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-600" />
            <span className="text-slate-300">Source Node</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-emerald-600" />
            <span className="text-slate-300">Destination Node</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-slate-700" />
            <span className="text-slate-300">Intermediate Node</span>
          </div>
        </div>
      </motion.div>
    )}
    </>
  );
}