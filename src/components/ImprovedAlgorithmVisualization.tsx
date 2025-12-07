import { useState } from 'react';
import { GraphNode, GraphEdge } from '../App';
import { DetailedDijkstraVisualization } from './DetailedDijkstraVisualization';
import DetailedWarshallVisualization from './DetailedWarshallVisualization';
import { SimplifiedBothVisualization } from './SimplifiedBothVisualization';

interface ImprovedAlgorithmVisualizationProps {
  customGraph?: { nodes: GraphNode[]; edges: GraphEdge[] } | null;
  selectedView: 'both' | 'dijkstra' | 'warshall';
}

export function ImprovedAlgorithmVisualization({ customGraph, selectedView }: ImprovedAlgorithmVisualizationProps) {
  if (selectedView === 'dijkstra') {
    return <DetailedDijkstraVisualization customGraph={customGraph} />;
  }
  
  if (selectedView === 'warshall') {
    return <DetailedWarshallVisualization customGraph={customGraph} />;
  }
  
  // Both view with simplified comparison
  return <SimplifiedBothVisualization customGraph={customGraph} />;
}