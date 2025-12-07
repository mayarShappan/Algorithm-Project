import { EnhancedHero } from './EnhancedHero';
import { ConceptExplanation } from './ConceptExplanation';
import { ImprovedGraphBuilder } from './ImprovedGraphBuilder';
import { ComparisonTable } from './ComparisonTable';
import { GraphNode, GraphEdge } from '../App';

interface HomePageProps {
  onNavigateToVisualization: (graph?: { nodes: GraphNode[]; edges: GraphEdge[] }) => void;
}

export function HomePage({ onNavigateToVisualization }: HomePageProps) {
  return (
    <div className="relative">
      <EnhancedHero onNavigateToVisualization={onNavigateToVisualization} />
      <ConceptExplanation />
      <div id="builder">
        <ImprovedGraphBuilder onNavigateToVisualization={onNavigateToVisualization} />
      </div>
      <ComparisonTable />
    </div>
  );
}
