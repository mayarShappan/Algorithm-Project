import { useState } from 'react';
import { HomePage } from './components/HomePage';
import { EnhancedVisualizationPage } from './components/EnhancedVisualizationPage';
import { UnifiedBackground } from './components/UnifiedBackground';

export interface GraphNode {
  id: string;
  x: number;
  y: number;
  label: string;
}

export interface GraphEdge {
  from: string;
  to: string;
  weight: number;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'visualization'>('home');
  const [customGraph, setCustomGraph] = useState<{ nodes: GraphNode[]; edges: GraphEdge[] } | null>(null);

  const navigateToVisualization = (graph?: { nodes: GraphNode[]; edges: GraphEdge[] }) => {
    if (graph) {
      setCustomGraph(graph);
    }
    setCurrentPage('visualization');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToHome = () => {
    setCurrentPage('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen text-white">
      <UnifiedBackground />
      
      {currentPage === 'home' ? (
        <HomePage onNavigateToVisualization={navigateToVisualization} />
      ) : (
        <EnhancedVisualizationPage 
          onNavigateToHome={navigateToHome}
          customGraph={customGraph}
        />
      )}
    </div>
  );
}
