import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus, Minus, Trash2, Play, RotateCcw, Undo, Redo,
  Info, Zap, Shuffle, MousePointer2 // Added MousePointer2 icon
} from 'lucide-react';
import { GraphNode, GraphEdge } from '../App';
import { ModernWeightModal } from './ModernWeightModal';

interface ImprovedGraphBuilderProps {
  onNavigateToVisualization: (graph: { nodes: GraphNode[]; edges: GraphEdge[] }) => void;
}

interface HistoryState {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export function ImprovedGraphBuilder({ onNavigateToVisualization }: ImprovedGraphBuilderProps) {
  const [nodes, setNodes] = useState<GraphNode[]>([
    { id: '0', x: 150, y: 150, label: 'A' },
    { id: '1', x: 350, y: 100, label: 'B' },
    { id: '2', x: 350, y: 200, label: 'C' },
    { id: '3', x: 550, y: 150, label: 'D' },
  ]);
  const [edges, setEdges] = useState<GraphEdge[]>([
    { from: '0', to: '1', weight: 4 },
    { from: '0', to: '2', weight: 2 },
    { from: '1', to: '3', weight: 3 },
    { from: '2', to: '1', weight: 1 },
    { from: '2', to: '3', weight: 5 },
  ]);
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [edgeStart, setEdgeStart] = useState<string | null>(null);
  // Added 'move' mode
  const [mode, setMode] = useState<'node' | 'edge' | 'delete' | 'move'>('node');
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(true);
  const [weightModalOpen, setWeightModalOpen] = useState(false);
  const [editingEdge, setEditingEdge] = useState<{ from: string; to: string; weight: number } | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);

  // Save initial state to history
  useEffect(() => {
      if (history.length === 0) {
          saveToHistory(nodes, edges);
      }
  }, []);


  const saveToHistory = (newNodes: GraphNode[], newEdges: GraphEdge[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ nodes: [...newNodes], edges: [...newEdges] });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setNodes(prevState.nodes);
      setEdges(prevState.edges);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setNodes(nextState.nodes);
      setEdges(nextState.edges);
      setHistoryIndex(historyIndex + 1);
    }
  };

  const generateRandomGraph = () => {
    const nodeCount = 5;
    const newNodes: GraphNode[] = [];
    const newEdges: GraphEdge[] = [];

    const centerX = 450;
    const centerY = 250;
    const radius = 180;

    for (let i = 0; i < nodeCount; i++) {
      const angle = (i * 2 * Math.PI) / nodeCount - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      newNodes.push({
        id: Date.now().toString() + i,
        x,
        y,
        label: String.fromCharCode(65 + i),
      });
    }

    for (let i = 0; i < nodeCount; i++) {
      const nextIdx = (i + 1) % nodeCount;
      newEdges.push({
        from: newNodes[i].id,
        to: newNodes[nextIdx].id,
        weight: Math.floor(Math.random() * 9) + 1,
      });
    }

    const additionalEdges = Math.floor(Math.random() * 4) + 5;
    for (let i = 0; i < additionalEdges; i++) {
      const fromIdx = Math.floor(Math.random() * nodeCount);
      let toIdx = Math.floor(Math.random() * nodeCount);

      let attempts = 0;
      while ((toIdx === fromIdx || newEdges.some(
        e => e.from === newNodes[fromIdx].id && e.to === newNodes[toIdx].id
      )) && attempts < 20) {
        toIdx = Math.floor(Math.random() * nodeCount);
        attempts++;
      }

      if (attempts < 20) {
        newEdges.push({
          from: newNodes[fromIdx].id,
          to: newNodes[toIdx].id,
          weight: Math.floor(Math.random() * 9) + 1,
        });
      }
    }

    setNodes(newNodes);
    setEdges(newEdges);
    saveToHistory(newNodes, newEdges);
  };

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    // Fix: Only allow node creation if clicking directly on the SVG canvas, not its children
    if (e.target !== svgRef.current) return;
    // Don't create nodes in 'move' or 'delete' mode
    if (mode !== 'node') return;

    const svg = svgRef.current;
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Improved ID and Label generation to avoid duplicates
    const newId = String(nodes.length > 0 ? Math.max(...nodes.map(n => parseInt(n.id))) + 1 : 0);
    const newLabel = String.fromCharCode(65 + (nodes.length % 26)) + (Math.floor(nodes.length / 26) > 0 ? Math.floor(nodes.length / 26) : '');

    const newNodes = [...nodes, { id: newId, x, y, label: newLabel }];
    setNodes(newNodes);
    saveToHistory(newNodes, edges);
  };

  const handleNodeClick = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (mode === 'delete') {
      const newNodes = nodes.filter(n => n.id !== nodeId);
      const newEdges = edges.filter(e => e.from !== nodeId && e.to !== nodeId);
      setNodes(newNodes);
      setEdges(newEdges);
      saveToHistory(newNodes, newEdges);
      return;
    }

    if (mode === 'edge') {
      if (edgeStart === null) {
        setEdgeStart(nodeId);
      } else if (edgeStart !== nodeId) {
        // Check if edge already exists
        const exists = edges.some(e => e.from === edgeStart && e.to === nodeId);
        if (!exists) {
            const weight = Math.floor(Math.random() * 9) + 1;
            const newEdges = [...edges, { from: edgeStart, to: nodeId, weight }];
            setEdges(newEdges);
            saveToHistory(nodes, newEdges);
        }
        setEdgeStart(null);
      }
    }

    // In 'move' mode, just select the node
    setSelectedNode(nodeId);
  };

  const handleNodeDragStart = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Allow dragging in 'node' and 'move' modes
    if (mode === 'node' || mode === 'move') {
        setDraggedNode(nodeId);
    }
  };

  const handleNodeDrag = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!draggedNode || !svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setNodes(nodes.map(n =>
      n.id === draggedNode ? { ...n, x, y } : n
    ));
  };

  const handleNodeDragEnd = () => {
    if (draggedNode) {
      saveToHistory(nodes, edges);
    }
    setDraggedNode(null);
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    handleSvgClick(e);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (draggedNode) {
      handleNodeDrag(e);
    }
  };

  const handleCanvasMouseUp = () => {
    handleNodeDragEnd();
  };

  const handleEdgeClick = (from: string, to: string) => {
    if (mode === 'delete') {
      const newEdges = edges.filter(edge => !(edge.from === from && edge.to === to));
      setEdges(newEdges);
      saveToHistory(nodes, newEdges);
    } else {
      // Allow editing in other modes (like 'move' or 'node')
      const edge = edges.find(e => e.from === from && e.to === to);
      if (edge) {
        setEditingEdge(edge);
        setWeightModalOpen(true);
      }
    }
  };

  const handleWeightSave = (newWeight: number) => {
    if (!editingEdge) return;

    const newEdges = edges.map(edge =>
      edge.from === editingEdge.from && edge.to === editingEdge.to
        ? { ...edge, weight: newWeight }
        : edge
    );
    setEdges(newEdges);
    saveToHistory(nodes, newEdges);
  };

  const clearGraph = () => {
    setNodes([]);
    setEdges([]);
    saveToHistory([], []);
    setSelectedNode(null);
    setEdgeStart(null);
  };

  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600/40 via-purple-600/40 to-pink-600/40 backdrop-blur-xl rounded-2xl mb-6 border-2 border-indigo-400/30 shadow-xl"
          >
            <Zap className="w-5 h-5 text-yellow-400" />
            <span className="text-indigo-100 text-lg">Advanced Graph Builder</span>
          </motion.div>

          <h2 className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Design Your Custom Graph
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-slate-900/50 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-indigo-500/20"
        >
          {/* Toolbar */}
          <div className="flex flex-wrap gap-3 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
            {/* Mode Controls */}
            <div className="flex gap-2">
              {/* New 'Move' Mode Button */}
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMode('move')}
                className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg ${
                  mode === 'move'
                    ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-gray-500/50'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
                title="Move/Select Mode"
              >
                <MousePointer2 className="w-4 h-4" />
                <span>Move</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMode('node')}
                className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg ${
                  mode === 'node'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-blue-500/50'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>Node</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMode('edge')}
                className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg ${
                  mode === 'edge'
                    ? 'bg-gradient-to-r from-green-600 to-emerald-700 text-white shadow-green-500/50'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <Minus className="w-4 h-4 rotate-90" />
                <span>Edge</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMode('delete')}
                className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg ${
                  mode === 'delete'
                    ? 'bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-red-500/50'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </motion.button>
            </div>

            <div className="h-8 w-px bg-gray-300 dark:bg-gray-600" />

            {/* Tools */}
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={undo}
                disabled={historyIndex <= 0}
                className="p-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg"
                title="Undo"
              >
                <Undo className="w-4 h-4" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
                className="p-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg"
                title="Redo"
              >
                <Redo className="w-4 h-4" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={generateRandomGraph}
                className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg flex items-center gap-2"
                title="Generate Random Graph"
              >
                <Shuffle className="w-4 h-4" />
                <span>Random</span>
              </motion.button>
            </div>

            {/* Right side controls */}
            <div className="ml-auto flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowTooltip(!showTooltip)}
                className={`p-2.5 rounded-xl transition-all shadow-lg ${
                  showTooltip
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
                title="Toggle Hints"
              >
                <Info className="w-4 h-4" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={clearGraph}
                className="px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all shadow-lg flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Clear</span>
              </motion.button>
            </div>
          </div>

          {/* Instructions */}
          <AnimatePresence>
            {showTooltip && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800 overflow-hidden"
              >
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-gray-700 dark:text-gray-300">
                    <strong className="block mb-1">
                      {mode === 'move' && '🖱️ Move Mode: Drag nodes to reposition or click weights to edit'}
                      {mode === 'node' && '➕ Node Mode: Click on empty space to add nodes'}
                      {mode === 'edge' && '🔗 Edge Mode: Click two nodes to connect them'}
                      {mode === 'delete' && '🗑️ Delete Mode: Click nodes or edges to remove'}
                    </strong>
                    <p className="text-sm opacity-80">
                      💡 Use the Move mode to edit weights without adding nodes.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Canvas */}
          <div className="mb-6">
            <svg
              ref={svgRef}
              className={`w-full bg-gradient-to-br from-slate-950/80 to-indigo-950/40 rounded-2xl border-2 border-indigo-500/30 shadow-inner ${mode === 'node' ? 'cursor-crosshair' : mode === 'move' ? 'cursor-grab' : 'cursor-default'}`}
              style={{ height: '500px' }}
              viewBox="0 0 900 500"
              preserveAspectRatio="xMidYMid meet"
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
            >
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="10"
                  refX="9"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3, 0 6" fill="#6366f1" />
                </marker>
                <filter id="edgeGlow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
                <linearGradient id="nodeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4f46e5" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
                <linearGradient id="nodeActiveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              {/* Edge creation preview */}
              {edgeStart && (
                <motion.line
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  x1={nodes.find(n => n.id === edgeStart)?.x}
                  y1={nodes.find(n => n.id === edgeStart)?.y}
                  x2={nodes.find(n => n.id === edgeStart)?.x}
                  y2={nodes.find(n => n.id === edgeStart)?.y}
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeDasharray="8,4"
                />
              )}

              {/* Edges */}
              {edges.map((edge, idx) => {
                const fromNode = nodes.find((n) => n.id === edge.from);
                const toNode = nodes.find((n) => n.id === edge.to);
                if (!fromNode || !toNode) return null;

                const isBiDirectional = edges.some(
                  (e) => e.from === edge.to && e.to === edge.from
                );

                const dx = toNode.x - fromNode.x;
                const dy = toNode.y - fromNode.y;
                const angle = Math.atan2(dy, dx);
                
                const nodeRadius = 38;

                let pathD = "";
                let textX = 0;
                let textY = 0;

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

                  pathD = `M ${fromNode.x} ${fromNode.y} Q ${controlX} ${controlY} ${arrowX} ${arrowY}`;
                  
                  textX = controlX;
                  textY = controlY;
                } else {
                  const arrowX = toNode.x - nodeRadius * Math.cos(angle);
                  const arrowY = toNode.y - nodeRadius * Math.sin(angle);
                  
                  pathD = `M ${fromNode.x} ${fromNode.y} L ${arrowX} ${arrowY}`;
                  
                  textX = (fromNode.x + toNode.x) / 2;
                  textY = (fromNode.y + toNode.y) / 2 - 10;
                }

                return (
                  <g key={`edge-${edge.from}-${edge.to}-${idx}`}>
                    <motion.path
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.5 }}
                      d={pathD}
                      fill="none"
                      stroke="#6366f1"
                      strokeWidth="3"
                      markerEnd="url(#arrowhead)"
                      filter="url(#edgeGlow)"
                      className={`transition-colors ${mode !== 'delete' ? 'cursor-pointer hover:stroke-indigo-400' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdgeClick(edge.from, edge.to);
                      }}
                    />
                    
                    {/* Weight Label Background */}
                    <circle cx={textX} cy={textY} r="12" fill="#0f172a" opacity="0.8" className={mode !== 'delete' ? 'cursor-pointer' : ''} onClick={(e) => { e.stopPropagation(); handleEdgeClick(edge.from, edge.to); }}/>
                    
                    {/* Weight Label */}
                    <text
                      x={textX}
                      y={textY}
                      dy="5"
                      textAnchor="middle"
                      className={`fill-white select-none text-sm font-bold ${mode !== 'delete' ? 'cursor-pointer' : ''}`}
                      style={{ textShadow: '0 0 5px rgba(0,0,0,0.5)' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdgeClick(edge.from, edge.to);
                      }}
                    >
                      {edge.weight}
                    </text>
                  </g>
                );
              })}

              {/* Nodes */}
              {nodes.map((node) => (
                <g
                  key={`node-${node.id}`}
                  className={`${mode === 'move' || mode === 'node' ? 'cursor-move' : mode === 'delete' ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    handleNodeDragStart(node.id, e as any);
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNodeClick(node.id, e as any);
                  }}
                >
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="38"
                    fill="none"
                    stroke={
                      selectedNode === node.id
                        ? '#3b82f6'
                        : edgeStart === node.id
                        ? '#10b981'
                        : 'transparent'
                    }
                    strokeWidth="2"
                    opacity="0.5"
                  />

                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="30"
                    fill={
                      selectedNode === node.id
                        ? 'url(#nodeActiveGradient)'
                        : edgeStart === node.id
                        ? '#10b981'
                        : 'url(#nodeGradient)'
                    }
                    stroke={
                      selectedNode === node.id || edgeStart === node.id
                        ? '#1d4ed8'
                        : '#9ca3af'
                    }
                    strokeWidth="3"
                    filter="url(#glow)"
                    className="hover:stroke-blue-400 transition-all"
                  />
                  
                  {/* Restore the small white dot */}
                  <circle
                    cx={node.x - 12}
                    cy={node.y - 12}
                    r="6"
                    fill="white"
                    opacity="0.4"
                    filter="url(#glow)"
                  />

                  <text
                    x={node.x}
                    y={node.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-white select-none pointer-events-none text-xl font-semibold"
                  >
                    {node.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl border border-blue-200 dark:border-blue-800 shadow-lg"
            >
              <div className="text-blue-600 dark:text-blue-400">Nodes</div>
              <motion.div 
                className="text-gray-900 dark:text-white"
                key={nodes.length}
                initial={{ scale: 1.5 }}
                animate={{ scale: 1 }}
              >
                {nodes.length}
              </motion.div>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              className="p-4 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-800/30 rounded-xl border border-green-200 dark:border-green-800 shadow-lg"
            >
              <div className="text-green-600 dark:text-green-400">Edges</div>
              <motion.div 
                className="text-gray-900 dark:text-white"
                key={edges.length}
                initial={{ scale: 1.5 }}
                animate={{ scale: 1 }}
              >
                {edges.length}
              </motion.div>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              className="p-4 bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-800/30 rounded-xl border border-purple-200 dark:border-purple-800 shadow-lg"
            >
              <div className="text-purple-600 dark:text-purple-400">Density</div>
              <div className="text-gray-900 dark:text-white">
                {nodes.length > 1 ? ((edges.length / (nodes.length * (nodes.length - 1))) * 100).toFixed(0) : 0}%
              </div>
            </motion.div>
          </div>

          {/* Visualize Button */}
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigateToVisualization({ nodes, edges })}
            disabled={nodes.length === 0}
            className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-2xl hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-2xl relative overflow-hidden group"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              initial={{ x: '-100%' }}
              whileHover={{ x: '100%' }}
              transition={{ duration: 0.6 }}
            />
            <Play className="w-5 h-5 relative z-10" />
            <span className="relative z-10">Visualize Graph with Algorithms</span>
          </motion.button>
        </motion.div>
      </div>

      {/* Modals */}
      {editingEdge && (
        <ModernWeightModal
          isOpen={weightModalOpen}
          onClose={() => setWeightModalOpen(false)}
          onSave={handleWeightSave}
          currentWeight={editingEdge.weight}
          fromLabel={nodes.find(n => n.id === editingEdge.from)?.label || ''}
          toLabel={nodes.find(n => n.id === editingEdge.to)?.label || ''}
        />
      )}
    </section>
  );
}