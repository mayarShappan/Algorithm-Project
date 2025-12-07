import { GraphNode, GraphEdge } from '../App';

// ==========================================
// 1. Interfaces & Types (التعريفات)
// ==========================================

export interface DijkstraStep {
  visited: string[];              // Nodes finalized (Green)
  queue: { id: string, val: number }[]; // Current PQ state (Yellow/Orange)
  distances: Record<string, number>;
  previous: Record<string, string | null>; // العمود الثالث المهم (Previous Node)
  current: string | null;         // Node being processed (Red)
  targetNeighbor: string | null;  // Neighbor being checked
  activeEdges: { from: string, to: string }[];
  description: string;            // شرح الخطوة للنص اللي بيظهر
  tableHighlight: string | null;  // لتظليل الصف الذي يتم تحديثه في الجدول
}

export interface WarshallStep {
  type: 'init' | 'k-start' | 'checking' | 'found' | 'no-change' | 'k-complete' | 'complete';
  k: number; 
  i: number; 
  j: number;
  matrix: boolean[][];
  description: string;
  activeNodes?: string[];
}

// ==========================================
// 2. PriorityQueue (MinHeap) Implementation
// ==========================================
// هذا كلاس كامل لترتيب النودز حسب أقل مسافة
class PriorityQueue {
  values: { id: string, val: number }[];

  constructor() {
    this.values = [];
  }

  // إضافة عنصر جديد وإعادة الترتيب
  enqueue(id: string, val: number) {
    this.values.push({ id, val });
    this.bubbleUp();
  }

  // سحب أقل عنصر وإعادة الترتيب
  dequeue() {
    if (this.values.length === 0) return undefined;
    const min = this.values[0];
    const end = this.values.pop();
    if (this.values.length > 0 && end) {
      this.values[0] = end;
      this.bubbleDown();
    }
    return min;
  }

  bubbleUp() {
    let idx = this.values.length - 1;
    const element = this.values[idx];
    while (idx > 0) {
      let parentIdx = Math.floor((idx - 1) / 2);
      let parent = this.values[parentIdx];
      if (element.val >= parent.val) break;
      this.values[parentIdx] = element;
      this.values[idx] = parent;
      idx = parentIdx;
    }
  }

  bubbleDown() {
    let idx = 0;
    const length = this.values.length;
    const element = this.values[0];
    while (true) {
      let leftChildIdx = 2 * idx + 1;
      let rightChildIdx = 2 * idx + 2;
      let leftChild, rightChild;
      let swap = null;

      if (leftChildIdx < length) {
        leftChild = this.values[leftChildIdx];
        if (leftChild.val < element.val) {
          swap = leftChildIdx;
        }
      }
      if (rightChildIdx < length) {
        rightChild = this.values[rightChildIdx];
        if (
          (swap === null && rightChild.val < element.val) ||
          (swap !== null && rightChild.val < leftChild!.val)
        ) {
          swap = rightChildIdx;
        }
      }
      if (swap === null) break;
      this.values[idx] = this.values[swap];
      this.values[swap] = element;
      idx = swap;
    }
  }

  isEmpty() {
    return this.values.length === 0;
  }

  // دالة مساعدة عشان نعرض محتوى الـ Queue في الشاشة
  getSnapshot() {
    return [...this.values].sort((a, b) => a.val - b.val);
  }
}

// ==========================================
// 3. Dijkstra Algorithm (Table-Centric Style)
// ==========================================

export const runDijkstra = (nodes: GraphNode[], edges: GraphEdge[], startNodeId: string): DijkstraStep[] => {
  const steps: DijkstraStep[] = [];
  
  // 1. تحضير الجراف (Adjacency List)
  const graph: Record<string, { to: string, weight: number }[]> = {};
  nodes.forEach(n => graph[n.id] = []);
  edges.forEach(e => {
    if (graph[e.from]) graph[e.from].push({ to: e.to, weight: e.weight });
    // لو الجراف Undirected (رايح جاي)، شيل علامة الـ Comment من السطر الجاي:
    // if (graph[e.to]) graph[e.to].push({ to: e.from, weight: e.weight });
  });

  // 2. تهيئة الجدول (Initialization)
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  
  nodes.forEach(n => {
    distances[n.id] = Infinity; // المسافة لا نهائية في البداية
    previous[n.id] = null;      // العمود الثالث فاضي
  });
  distances[startNodeId] = 0; // نقطة البداية صفر

  const pq = new PriorityQueue();
  pq.enqueue(startNodeId, 0);

  const visitedSet = new Set<string>();

  const getLabel = (id: string) => nodes.find(n => n.id === id)?.label || id;

  // الخطوة 0: البداية
  steps.push({
    visited: [],
    queue: pq.getSnapshot(),
    distances: { ...distances },
    previous: { ...previous },
    current: null,
    targetNeighbor: null,
    activeEdges: [],
    tableHighlight: startNodeId,
    description: `INITIALIZATION:\nSet Start Node (${getLabel(startNodeId)}) distance to 0.\nSet all other nodes to Infinity (∞).\nPrevious Node column is empty.`,
  });

  while (!pq.isEmpty()) {
    // الخطوة 1: سحب أقل نود من الـ PQ
    const currentItem = pq.dequeue()!;
    const u = currentItem.id;
    const currentDist = currentItem.val;
    
    // تسجيل الخطوة (Pop)
    steps.push({
      visited: Array.from(visitedSet),
      queue: pq.getSnapshot(),
      distances: { ...distances },
      previous: { ...previous },
      current: u,
      targetNeighbor: null,
      activeEdges: [],
      tableHighlight: u,
      description: `SELECT NODE ${getLabel(u)}:\nIt has the minimum distance (${currentDist}).\nMark it as Current (Red).`,
    });

    // لو لقينا مسافة أكبر من المسجلة، نتجاهلها (Optimization)
    if (currentDist > distances[u]) continue; 

    visitedSet.add(u); // نعتبرها Visited

    // فحص الجيران
    const neighbors = graph[u] || [];
    for (const { to: v, weight } of neighbors) {
      if (visitedSet.has(v)) continue; // لو انتهينا منها قبل كده منتفحصهاش

      const vLabel = getLabel(v);
      const uLabel = getLabel(u);
      const newDist = distances[u] + weight;
      const oldDist = distances[v];
      const oldDistText = oldDist === Infinity ? '∞' : oldDist;

      // الخطوة 2: المقارنة (Comparison)
      steps.push({
        visited: Array.from(visitedSet),
        queue: pq.getSnapshot(),
        distances: { ...distances },
        previous: { ...previous },
        current: u,
        targetNeighbor: v,
        activeEdges: [{ from: u, to: v }],
        tableHighlight: v,
        description: `CHECK NEIGHBOR ${vLabel}:\nCalculate cost: ${distances[u]} (current) + ${weight} (edge) = ${newDist}.\nCompare: Is ${newDist} < ${oldDistText}?`,
      });

      // الطوة 3: التحديث (Relaxation)
      if (newDist < oldDist) {
        distances[v] = newDist;
        previous[v] = u; // تحديث عمود Previous Node
        pq.enqueue(v, newDist);

        steps.push({
          visited: Array.from(visitedSet),
          queue: pq.getSnapshot(),
          distances: { ...distances },
          previous: { ...previous },
          current: u,
          targetNeighbor: v,
          activeEdges: [{ from: u, to: v }],
          tableHighlight: v,
          description: `UPDATE TABLE for ${vLabel}:\n1. Distance updated to ${newDist}.\n2. Previous Node set to ${uLabel}.\n3. Added to Priority Queue.`,
        });
      }
    }

    // الخطوة 4: الانتهاء من النود
    steps.push({
      visited: Array.from(visitedSet),
      queue: pq.getSnapshot(),
      distances: { ...distances },
      previous: { ...previous },
      current: null,
      targetNeighbor: null,
      activeEdges: [],
      tableHighlight: null,
      description: `FINISHED processing ${getLabel(u)}.\nProceed to next node in Queue.`,
    });
  }

  // الخطوة النهائية
  steps.push({
    visited: Array.from(visitedSet),
    queue: [],
    distances: { ...distances },
    previous: { ...previous },
    current: null,
    targetNeighbor: null,
    activeEdges: [],
    tableHighlight: null,
    description: "ALGORITHM COMPLETE:\nAll reachable nodes visited.\nUse the 'Previous' column to trace back paths.",
  });

  return steps;
};

// ==========================================
// 4. Warshall Implementation - مفصل زي الفيديو
// ==========================================
export function runWarshall(nodes: GraphNode[], edges: GraphEdge[]): WarshallStep[] {
  const steps: WarshallStep[] = [];
  const V = nodes.length;

  // Initialize matrix - نبدأ بـ false في كل مكان
  let currentMatrix: boolean[][] = Array(V).fill(0).map(() => 
    Array(V).fill(false)
  );

  const idToIndex: Record<string, number> = {};
  nodes.forEach((n, i) => idToIndex[n.id] = i);

  // ملء الـ edges المباشرة
  edges.forEach(edge => {
    const u = idToIndex[edge.from];
    const v = idToIndex[edge.to];
    if (u !== undefined && v !== undefined) currentMatrix[u][v] = true;
  });

  steps.push({
    type: 'init',
    k: -1, i: -1, j: -1,
    matrix: currentMatrix.map(row => [...row]),
    description: 'Initial Reachability Matrix:\\nBased on direct edges in the graph.\\ntrue = Path exists',
    activeNodes: []
  });

  // الخوارزمية الرئيسية
  for (let k = 0; k < V; k++) {
    steps.push({
      type: 'k-start',
      k, i: -1, j: -1,
      matrix: currentMatrix.map(row => [...row]),
      description: `Using ${nodes[k].label} as intermediate node:\\nChecking all pairs (i,j) through ${nodes[k].label}.`,
      activeNodes: [nodes[k].id]
    });

    // Create NEW matrix based on PREVIOUS matrix
    const previousMatrix = currentMatrix;
    const newMatrix = previousMatrix.map(row => [...row]);

    for (let i = 0; i < V; i++) {
      // OPTIMIZATION: Skip rows that are all false (no outgoing paths)
      // If row i is all false, it will remain all false
      const rowHasAnyPath = previousMatrix[i].some(val => val === true);
      if (!rowHasAnyPath) {
        continue; // Skip this row entirely
      }

      for (let j = 0; j < V; j++) {
        if (i === k || j === k) continue; // Skip row k and column k (intermediate node is fixed)
        
        const currentValue = previousMatrix[i][j]; // Read from PREVIOUS matrix
        
        // Skip cells that are already true (no need to compute)
        if (currentValue === true) {
          newMatrix[i][j] = true; // Copy to new matrix
          continue;
        }
        
        const hasIK = previousMatrix[i][k]; // Read from PREVIOUS matrix
        const hasKJ = previousMatrix[k][j]; // Read from PREVIOUS matrix

        // خطوة الفحص
        steps.push({
          type: 'checking',
          k, i, j,
          matrix: previousMatrix.map(row => [...row]), // Show PREVIOUS matrix during check
          description: `Checking: ${nodes[i].label} → ${nodes[j].label}\\n\\nCurrent (from M${k}): ${currentValue ? 'true (1)' : 'false (0)'}\\n${nodes[i].label}→${nodes[k].label}: ${hasIK ? '✓ (true)' : '✗ (false)'}\\n${nodes[k].label}→${nodes[j].label}: ${hasKJ ? '✓ (true)' : '✗ (false)'}${i === j ? '\\n\\n(Checking for cycle back to same node)' : ''}`,
          activeNodes: [nodes[i].id, nodes[k].id, nodes[j].id]
        });

        // إذا وجدنا مسار جديد
        if (hasIK && hasKJ) {
          newMatrix[i][j] = true; // Update NEW matrix
          steps.push({
            type: 'found',
            k, i, j,
            matrix: newMatrix.map(row => [...row]), // Show NEW matrix after update
            description: `✓ PATH FOUND!\\n${nodes[i].label} → ${nodes[k].label} → ${nodes[j].label}\\n\\nSince both connections exist:\\n• ${nodes[i].label}→${nodes[k].label} = true\\n• ${nodes[k].label}→${nodes[j].label} = true\\n\\nUpdate matrix[${i}][${j}] = true${i === j ? '\\n\\n🔄 CYCLE DETECTED: ' + nodes[i].label + ' can reach itself!' : ''}`,
            activeNodes: [nodes[i].id, nodes[k].id, nodes[j].id]
          });
        } else {
          // لا يوجد مسار عبر k
          newMatrix[i][j] = false; // Keep as false in NEW matrix
          steps.push({
            type: 'no-change',
            k, i, j,
            matrix: newMatrix.map(row => [...row]),
            description: `✗ No path through ${nodes[k].label}:\\nCannot reach both ${nodes[k].label} from ${nodes[i].label}\\nand ${nodes[j].label} from ${nodes[k].label}.\\n\\nNo update (remains false).`,
            activeNodes: [nodes[i].id, nodes[j].id, nodes[k].id]
          });
        }
      }
    }

    // Copy unchanged rows and columns (row k and column k stay same as previous)
    for (let i = 0; i < V; i++) {
      newMatrix[k][i] = previousMatrix[k][i]; // Copy row k
      newMatrix[i][k] = previousMatrix[i][k]; // Copy column k
    }

    // Update currentMatrix to newMatrix for next iteration
    currentMatrix = newMatrix;

    steps.push({
      type: 'k-complete',
      k, i: -1, j: -1,
      matrix: currentMatrix.map(row => [...row]),
      description: `Completed node ${nodes[k].label}:\\nAll pairs checked through ${nodes[k].label}.\\n\\nMoving to next intermediate node...`,
      activeNodes: [nodes[k].id]
    });
  }

  steps.push({
    type: 'complete',
    k: V, i: V, j: V,
    matrix: currentMatrix.map(row => [...row]),
    description: '✓ WARSHALL ALGORITHM COMPLETE!\\n\\nTransitive Closure computed.\\ntrue = Path exists\\nfalse = No path',
    activeNodes: []
  });

  return steps;
}