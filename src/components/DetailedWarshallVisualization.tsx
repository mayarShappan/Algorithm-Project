import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RotateCcw, FastForward, Rewind, Info, CheckCircle2 } from 'lucide-react';

interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
}

interface GraphEdge {
  from: string;
  to: string;
  weight: number;
}

interface DetailedWarshallVisualizationProps {
  customGraph?: { nodes: GraphNode[]; edges: GraphEdge[] } | null;
}

interface WarshallStep {
  currentK: number; // -1 = adjacency matrix, 0-3 = intermediate nodes
  allMatrices: number[][][]; // كل الماتريكس (adjacency + k0 + k1 + k2 + k3)
  i: number;
  j: number;
  descriptions: string[]; // وصف لكل matrix
  stepType: 'adjacency' | 'k-start' | 'checking' | 'found' | 'no-change' | 'k-complete' | 'complete';
  activeNodes: string[];
}

const generateWarshallSteps = (nodes: GraphNode[], edges: GraphEdge[]) => {
  const n = nodes.length;
  const steps: WarshallStep[] = [];
  
  // Initialize all matrices (M0, M1, M2, ..., Mn)
  const allMatrices: number[][][] = [];
  
  // M0 - Initial adjacency matrix
  const initialMatrix = Array(n).fill(0).map(() => Array(n).fill(0));
  edges.forEach(edge => {
    const fromIdx = nodes.findIndex(node => node.id === edge.from);
    const toIdx = nodes.findIndex(node => node.id === edge.to);
    if (fromIdx !== -1 && toIdx !== -1) {
      initialMatrix[fromIdx][toIdx] = 1;
    }
  });
  
  allMatrices.push(initialMatrix.map(row => [...row]));
  
  // Initialize descriptions array
  const initialDescriptions = Array(n + 1).fill('');
  initialDescriptions[0] = 'Initial Matrix M0\\n\\nDirect edges only.\\nBased on graph connections.';
  
  // Initial step
  steps.push({
    currentK: -1,
    allMatrices: allMatrices.map(m => m.map(row => [...row])),
    i: -1,
    j: -1,
    descriptions: [...initialDescriptions],
    stepType: 'init',
    activeNodes: []
  });

  // Create matrices M1 to Mn
  for (let k = 0; k < n; k++) {
    // Create new matrix Mk+1 based on Mk (previous matrix)
    const previousMatrix = allMatrices[k];
    const newMatrix = previousMatrix.map(row => [...row]);
    allMatrices.push(newMatrix);
    
    const newDescriptions = [...initialDescriptions];
    newDescriptions[k + 1] = `Matrix M${k+1}\\n\\nUsing ${nodes[k].label} as intermediate node.`;
    
    // K-start step
    steps.push({
      currentK: k,
      allMatrices: allMatrices.map(m => m.map(row => [...row])),
      i: -1,
      j: -1,
      descriptions: newDescriptions,
      stepType: 'k-start',
      activeNodes: [nodes[k].id]
    });

    // Process all pairs (i,j)
    for (let i = 0; i < n; i++) {
      // OPTIMIZATION: Skip rows that are all 0 (no outgoing paths)
      // If row i is all 0, it will remain all 0
      const rowHasAnyPath = previousMatrix[i].some(val => val === 1);
      if (!rowHasAnyPath) {
        continue; // Skip this row entirely
      }

      for (let j = 0; j < n; j++) {
        if (i === k || j === k) continue; // Skip row k and column k (intermediate node is fixed)
        
        const currentValue = previousMatrix[i][j]; // Read from PREVIOUS matrix
        
        // Skip cells that are already 1 (no need to compute)
        if (currentValue === 1) {
          newMatrix[i][j] = 1; // Copy to new matrix
          continue;
        }
        
        const hasIK = previousMatrix[i][k]; // Read from PREVIOUS matrix
        const hasKJ = previousMatrix[k][j]; // Read from PREVIOUS matrix

        // خطوة الفحص
        const checkDesc = [...newDescriptions];
        checkDesc[k + 1] = `Matrix M${k+1} - Computing\\n\\nChecking [${i}][${j}]: ${nodes[i].label}→${nodes[j].label}\\nCurrent (from M${k}): ${currentValue}\\n${nodes[i].label}→${nodes[k].label}: ${hasIK}\\n${nodes[k].label}→${nodes[j].label}: ${hasKJ}\\n\\nRule: M[i][j] OR (M[i][k] AND M[k][j])${i === j ? '\\n\\n(Checking for cycle)' : ''}`;
        
        steps.push({
          currentK: k,
          allMatrices: allMatrices.map(m => m.map(row => [...row])),
          i,
          j,
          descriptions: checkDesc,
          stepType: 'checking',
          activeNodes: [nodes[i].id, nodes[k].id, nodes[j].id]
        });

        // التحديث - Write to NEW matrix
        if (hasIK === 1 && hasKJ === 1) {
          newMatrix[i][j] = 1; // Update NEW matrix
          allMatrices[k + 1] = newMatrix.map(row => [...row]); // Update in allMatrices
          
          const foundDesc = [...checkDesc];
          foundDesc[k + 1] = `Matrix M${k+1} - Updated! ✓\\n\\n[${i}][${j}]: ${nodes[i].label}→${nodes[j].label}\\n${currentValue} OR (${hasIK} AND ${hasKJ}) = 1\\n\\nNew path found:\\n${nodes[i].label} → ${nodes[k].label} → ${nodes[j].label}${i === j ? '\\n\\n🔄 CYCLE: ' + nodes[i].label + ' reaches itself!' : ''}`;
          
          steps.push({
            currentK: k,
            allMatrices: allMatrices.map(m => m.map(row => [...row])),
            i,
            j,
            descriptions: foundDesc,
            stepType: 'found',
            activeNodes: [nodes[i].id, nodes[k].id, nodes[j].id]
          });
        } else {
          newMatrix[i][j] = 0; // Keep as 0 in NEW matrix
          allMatrices[k + 1] = newMatrix.map(row => [...row]); // Update in allMatrices
          
          const noChangeDesc = [...checkDesc];
          noChangeDesc[k + 1] = `Matrix M${k+1}\\n\\n[${i}][${j}]: ${nodes[i].label}→${nodes[j].label}\\n${currentValue} OR (${hasIK} AND ${hasKJ}) = 0\\n\\nNo path through ${nodes[k].label}.`;
          
          steps.push({
            currentK: k,
            allMatrices: allMatrices.map(m => m.map(row => [...row])),
            i,
            j,
            descriptions: noChangeDesc,
            stepType: 'no-change',
            activeNodes: [nodes[i].id, nodes[k].id, nodes[j].id]
          });
        }
      }
    }

    // Copy unchanged rows and columns (row k and column k stay same as previous)
    for (let i = 0; i < n; i++) {
      newMatrix[k][i] = previousMatrix[k][i]; // Copy row k
      newMatrix[i][k] = previousMatrix[i][k]; // Copy column k
    }
    allMatrices[k + 1] = newMatrix.map(row => [...row]);

    // K-complete step
    const completeDesc = [...newDescriptions];
    completeDesc[k + 1] = `Matrix M${k+1} - Complete\\n\\nFinished computing with ${nodes[k].label}.\\nAll paths through ${nodes[k].label} have been found.`;
    
    steps.push({
      currentK: k,
      allMatrices: allMatrices.map(m => m.map(row => [...row])),
      i: -1,
      j: -1,
      descriptions: completeDesc,
      stepType: 'k-complete',
      activeNodes: []
    });
  }

  return steps;
};

export default function DetailedWarshallVisualization({ customGraph }: DetailedWarshallVisualizationProps) {
  const defaultNodes: GraphNode[] = [
    { id: 'A', label: 'A', x: 200, y: 150 },
    { id: 'B', label: 'B', x: 400, y: 150 },
    { id: 'C', label: 'C', x: 600, y: 150 },
    { id: 'D', label: 'D', x: 400, y: 350 }
  ];

  const defaultEdges: GraphEdge[] = [
    { from: 'A', to: 'B', weight: 1 },
    { from: 'B', to: 'C', weight: 1 },
    { from: 'C', to: 'D', weight: 1 },
    { from: 'D', to: 'A', weight: 1 }
  ];

  const inputNodes = customGraph?.nodes || defaultNodes;
  const inputEdges = customGraph?.edges || defaultEdges;

  // Center nodes to fit in SVG viewBox (800x500)
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
    
    // Fit into 800x500 Canvas with padding
    const padding = 80; // Add padding for node radius
    const targetWidth = 800 - (padding * 2);
    const targetHeight = 500 - (padding * 2);
    
    // Calculate scale to fit
    const scaleX = graphWidth > 0 ? targetWidth / graphWidth : 1;
    const scaleY = graphHeight > 0 ? targetHeight / graphHeight : 1;
    const scale = Math.min(scaleX, scaleY, 1); // Don't scale up, only down if needed
    
    // Calculate offset to center
    const scaledWidth = graphWidth * scale;
    const scaledHeight = graphHeight * scale;
    const offsetX = (800 - scaledWidth) / 2 - (minX * scale);
    const offsetY = (500 - scaledHeight) / 2 - (minY * scale);

    return inputNodes.map(n => ({
      ...n,
      x: n.x * scale + offsetX,
      y: n.y * scale + offsetY
    }));
  }, [inputNodes]);

  const steps = useMemo(() => generateWarshallSteps(centeredNodes, inputEdges), [centeredNodes, inputEdges]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(2000);
  const currentStep = steps[currentStepIndex];

  useEffect(() => {
    let interval: any;
    if (isPlaying && currentStepIndex < steps.length - 1) {
      interval = setInterval(() => {
        setCurrentStepIndex(prev => prev + 1);
      }, speed);
    } else if (currentStepIndex >= steps.length - 1) {
      setIsPlaying(false);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStepIndex, steps.length, speed]);

  const MatrixDisplay = ({ matrix, matrixIndex, label }: { matrix: number[][], matrixIndex: number, label: string }) => {
    const isCurrentMatrix = matrixIndex === currentStep.currentK + 1;
    const description = currentStep.descriptions[matrixIndex];
    
    return (
      <div 
        className={`bg-slate-900/80 rounded-2xl border p-4 transition-all ${
          isCurrentMatrix 
            ? 'border-pink-500 shadow-lg shadow-pink-500/20' 
            : 'border-slate-700'
        }`}
      >
        <h3 className={`text-center font-bold mb-3 text-lg ${
          isCurrentMatrix ? 'text-pink-400' : 'text-slate-400'
        }`}>
          {label}
        </h3>
        
        <div className="flex justify-center mb-3">
          <div className="inline-block">
            {/* Headers */}
            <div className="flex mb-1">
              <div className="w-10 h-10"></div>
              {inputNodes.map(n => (
                <div key={n.id} className="w-10 h-10 flex items-center justify-center text-sm font-bold text-purple-400">
                  {n.label}
                </div>
              ))}
            </div>
            
            {/* Matrix Rows */}
            {matrix.map((row, i) => (
              <div key={i} className="flex mb-1">
                <div className="w-10 h-10 flex items-center justify-center text-sm font-bold text-purple-400">
                  {inputNodes[i].label}
                </div>
                {row.map((val, j) => {
                  const isHighlight = isCurrentMatrix && currentStep.i === i && currentStep.j === j;
                  
                  return (
                    <motion.div
                      key={`${i}-${j}`}
                      initial={false}
                      animate={{ 
                        scale: isHighlight ? 1.2 : 1,
                        backgroundColor: isHighlight 
                          ? 'rgba(236, 72, 153, 0.5)' 
                          : val 
                          ? 'rgba(139, 92, 246, 0.3)' 
                          : 'rgba(30, 41, 59, 0.4)',
                        borderColor: isHighlight ? '#ec4899' : val ? '#8b5cf6' : '#334155'
                      }}
                      className={`w-10 h-10 mx-0.5 rounded-lg border flex items-center justify-center text-sm font-bold ${
                        val ? 'text-white' : 'text-slate-600'
                      }`}
                    >
                      {val}
                    </motion.div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className={`rounded-lg p-4 transition-colors duration-300 ${ 
            isCurrentMatrix 
              ? currentStep.stepType === 'found'
                ? 'bg-emerald-900/25 border border-emerald-500/50'
                : currentStep.stepType === 'checking'
                ? 'bg-blue-900/25 border border-blue-500/50'
                : 'bg-slate-800/30 border border-slate-600/50'
              : 'bg-slate-800/20 border border-slate-700/30'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-600/30">
            <h4 className={`text-sm font-semibold ${ 
              isCurrentMatrix 
                ? currentStep.stepType === 'found'
                  ? 'text-emerald-400'
                  : currentStep.stepType === 'checking'
                  ? 'text-blue-400'
                  : 'text-pink-400'
                : 'text-slate-400'
            }`}>
              {description.split('\\n')[0]}
            </h4>

            {/* Status badge */}
            {isCurrentMatrix && (
              <span className={`px-2.5 py-1 rounded text-xs font-semibold ${ 
                currentStep.stepType === 'found'
                  ? 'bg-emerald-500/25 text-emerald-300'
                  : currentStep.stepType === 'checking'
                  ? 'bg-blue-500/25 text-blue-300'
                  : 'bg-pink-500/25 text-pink-300'
              }`}>
                {currentStep.stepType === 'found' && '✓ Updated'}
                {currentStep.stepType === 'checking' && 'Computing'}
                {currentStep.stepType === 'k-complete' && '✓ Done'}
                {currentStep.stepType === 'k-start' && 'Starting'}
                {currentStep.stepType === 'no-change' && 'No Change'}
              </span>
            )}
          </div>

          {/* Content */}
          <div className="space-y-2 text-sm">
            {description.split('\\n').slice(1).map((line, idx) => {
              if (!line.trim()) return null;
              
              const isFormula = line.includes('OR') || line.includes('AND') || line.includes('=');
              const isPath = line.includes('→');
              
              return (
                <div key={idx}>
                  {isFormula ? (
                    <div className={`p-2.5 rounded-md font-mono text-center font-medium ${ 
                      isCurrentMatrix && currentStep.stepType === 'found'
                        ? 'bg-emerald-500/15 text-emerald-200'
                        : isCurrentMatrix && currentStep.stepType === 'checking'
                        ? 'bg-blue-500/15 text-blue-200'
                        : 'bg-slate-700/40 text-slate-300'
                    }`}>
                      {line}
                    </div>
                  ) : isPath ? (
                    <div className={`p-2.5 rounded-md font-mono text-center font-semibold ${ 
                      isCurrentMatrix && currentStep.stepType === 'found'
                        ? 'bg-emerald-500/15 text-emerald-100'
                        : 'bg-slate-700/40 text-slate-200'
                    }`}>
                      {line}
                    </div>
                  ) : (
                    <div className={`leading-relaxed ${isCurrentMatrix ? 'text-slate-300' : 'text-slate-400'}`}>
                      {line}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6">
      <div className="max-w-[1600px] mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
            Warshall's Algorithm - Step by Step
          </h1>
          <p className="text-slate-400">Watch how each matrix builds the transitive closure</p>
        </div>

        {/* Top Row: Graph + Adjacency Matrix */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Graph Visualization */}
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-indigo-500/20 p-6">
            <h3 className="text-center font-bold text-xl text-purple-400 mb-4">Graph Visualization</h3>
            <div className="flex items-center justify-center" style={{height: '400px'}}>
              <svg className="w-full h-full" viewBox="0 0 800 500">
                <defs>
                  <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                    <polygon points="0 0, 10 3, 0 6" fill="#6366f1" />
                  </marker>
                  <marker id="arrow-active" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                    <polygon points="0 0, 10 3, 0 6" fill="#ec4899" />
                  </marker>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                </defs>

                {inputEdges.map((edge, idx) => {
                  const from = centeredNodes.find(n => n.id === edge.from);
                  const to = centeredNodes.find(n => n.id === edge.to);
                  if (!from || !to) return null;

                  const isActive = currentStep.activeNodes.includes(edge.from) && currentStep.activeNodes.includes(edge.to);
                  
                  // Check if this is a bidirectional edge
                  const isBiDirectional = inputEdges.some(
                    e => e.from === edge.to && e.to === edge.from
                  );

                  const dx = to.x - from.x;
                  const dy = to.y - from.y;
                  const nodeRadius = 38;

                  let pathD = "";

                  if (isBiDirectional) {
                    // Curved path for bidirectional edges
                    const midX = (from.x + to.x) / 2;
                    const midY = (from.y + to.y) / 2;
                    
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const curvature = 50;
                    
                    const controlX = midX - (dy / dist) * curvature;
                    const controlY = midY + (dx / dist) * curvature;

                    const endAngle = Math.atan2(to.y - controlY, to.x - controlX);
                    const arrowX = to.x - nodeRadius * Math.cos(endAngle);
                    const arrowY = to.y - nodeRadius * Math.sin(endAngle);

                    pathD = `M ${from.x} ${from.y} Q ${controlX} ${controlY} ${arrowX} ${arrowY}`;
                  } else {
                    // Straight line for unidirectional edges
                    const angle = Math.atan2(dy, dx);
                    const arrowX = to.x - nodeRadius * Math.cos(angle);
                    const arrowY = to.y - nodeRadius * Math.sin(angle);
                    
                    pathD = `M ${from.x} ${from.y} L ${arrowX} ${arrowY}`;
                  }

                  return (
                    <motion.path
                      key={idx}
                      d={pathD}
                      fill="none"
                      stroke={isActive ? "#ec4899" : "#6366f1"}
                      strokeWidth={isActive ? "5" : "3"}
                      markerEnd={isActive ? "url(#arrow-active)" : "url(#arrow)"}
                      initial={false}
                      animate={{
                        stroke: isActive ? "#ec4899" : "#6366f1",
                        strokeWidth: isActive ? 5 : 3
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  );
                })}

                {centeredNodes.map((node) => {
                  const isActive = currentStep.activeNodes.includes(node.id);
                  return (
                    <g key={node.id}>
                      {isActive && (
                        <motion.circle
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1.3, opacity: 0.4 }}
                          cx={node.x} cy={node.y} r="50"
                          fill="none" stroke="#ec4899" strokeWidth="3"
                        />
                      )}
                      <circle 
                        cx={node.x} cy={node.y} r="35" 
                        fill={isActive ? "#ec4899" : "#6366f1"} 
                        filter="url(#glow)"
                      />
                      <circle cx={node.x - 15} cy={node.y - 15} r="8" fill="white" opacity="0.4" />
                      <text 
                        x={node.x} y={node.y} 
                        textAnchor="middle" 
                        dominantBaseline="middle" 
                        className="fill-white text-2xl font-bold"
                      >
                        {node.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Adjacency Matrix */}
          <MatrixDisplay 
            matrix={currentStep.allMatrices[0]} 
            matrixIndex={0} 
            label="M⁰ - Adjacency Matrix"
          />
        </div>

        {/* Bottom: 4 Intermediate Matrices (2x2) */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {currentStep.allMatrices.slice(1).map((matrix, idx) => (
            <MatrixDisplay 
              key={idx}
              matrix={matrix} 
              matrixIndex={idx + 1} 
              label={`M${idx + 1} - Via ${inputNodes[idx]?.label}`}
            />
          ))}
        </div>

        {/* Controls */}
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-indigo-500/20 p-6 flex flex-wrap items-center justify-center gap-3">
          {/* Reset Button */}
          <motion.button 
            onClick={() => { setIsPlaying(false); setCurrentStepIndex(0); }} 
            className="w-14 h-14 bg-slate-800/80 hover:bg-slate-700 rounded-full text-slate-300 hover:text-white transition-all flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            title="Reset"
          >
            <RotateCcw size={22} />
          </motion.button>
          
          {/* Previous Button */}
          <motion.button 
            onClick={() => { setIsPlaying(false); setCurrentStepIndex(p => Math.max(0, p - 1)); }} 
            className="w-14 h-14 bg-slate-800/80 hover:bg-slate-700 rounded-full text-slate-300 hover:text-white transition-all flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            title="Previous Step"
          >
            <Rewind size={22} />
          </motion.button>
          
          {/* Play/Pause Button (Large, Square with rounded corners) */}
          <motion.button 
            onClick={() => setIsPlaying(!isPlaying)} 
            className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-2xl text-white transition-all flex items-center justify-center shadow-lg shadow-purple-500/50"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause size={28} fill="white" /> : <Play size={28} fill="white" />}
          </motion.button>
          
          {/* Next Button */}
          <motion.button 
            onClick={() => { setIsPlaying(false); setCurrentStepIndex(p => Math.min(steps.length - 1, p + 1)); }} 
            className="w-14 h-14 bg-slate-800/80 hover:bg-slate-700 rounded-full text-slate-300 hover:text-white transition-all flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            title="Next Step"
          >
            <FastForward size={22} />
          </motion.button>

          {/* Speed Control */}
          <div className="ml-4 flex items-center gap-3 bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700">
            <span className="text-xs text-slate-400 font-semibold">Speed</span>
            <select 
              value={speed} 
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="bg-slate-900 text-slate-300 text-sm px-3 py-1 rounded-lg border border-slate-600 focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value={3000}>0.5x</option>
              <option value={2500}>0.75x</option>
              <option value={2000}>1x</option>
              <option value={1500}>1.5x</option>
              <option value={1000}>2x</option>
              <option value={500}>3x</option>
              <option value={300}>4x</option>
              <option value={100}>5x</option>
            </select>
          </div>

          {/* Step Counter */}
          <div className="ml-2 bg-slate-800 px-4 py-2 rounded-full text-pink-300 font-mono text-sm border border-slate-700">
            {currentStepIndex + 1} / {steps.length}
          </div>

          {currentStep.stepType === 'complete' && (
            <div className="ml-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full text-white font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Complete!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}