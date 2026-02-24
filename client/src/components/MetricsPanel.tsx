import { Metrics } from '../types';

interface MetricsPanelProps {
  metrics: Metrics;
  violations: string[];
}

export default function MetricsPanel({ metrics, violations }: MetricsPanelProps) {
  return (
    <div className="bg-slate-900 p-6 rounded-lg border border-slate-700">
      <h2 className="text-2xl font-bold mb-4">Metrics</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-800 p-4 rounded">
          <div className="text-sm text-slate-400">Conflicts</div>
          <div className={`text-3xl font-bold ${metrics.conflicts === 0 ? 'text-green-500' : 'text-red-500'}`}>
            {metrics.conflicts}
          </div>
        </div>
        
        <div className="bg-slate-800 p-4 rounded">
          <div className="text-sm text-slate-400">Soft Score</div>
          <div className="text-3xl font-bold text-blue-500">
            {(metrics.softScore * 100).toFixed(0)}%
          </div>
        </div>
        
        <div className="bg-slate-800 p-4 rounded">
          <div className="text-sm text-slate-400">Gap Score</div>
          <div className="text-3xl font-bold text-purple-500">
            {(metrics.gapScore * 100).toFixed(0)}%
          </div>
        </div>
        
        <div className="bg-slate-800 p-4 rounded">
          <div className="text-sm text-slate-400">Balance Score</div>
          <div className="text-3xl font-bold text-orange-500">
            {(metrics.balanceScore * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      {violations.length > 0 && (
        <div className="bg-red-900/20 border border-red-700 rounded p-4">
          <h3 className="font-bold text-red-400 mb-2">Violations</h3>
          <ul className="space-y-1 text-sm">
            {violations.map((v, i) => (
              <li key={i} className="text-red-300">• {v}</li>
            ))}
          </ul>
        </div>
      )}

      {violations.length === 0 && (
        <div className="bg-green-900/20 border border-green-700 rounded p-4 text-center">
          <span className="text-green-400 font-medium">✓ No violations detected</span>
        </div>
      )}
    </div>
  );
}
