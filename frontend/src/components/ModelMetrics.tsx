import React from 'react';
import { ModelMetricsResponse } from '../types';
import { Trophy, CheckCircle2, Award, Info } from 'lucide-react';

interface ModelMetricsProps {
  metrics?: ModelMetricsResponse;
}

export const ModelMetrics: React.FC<ModelMetricsProps> = ({ metrics }) => {
  if (!metrics || !metrics.validation) {
    return (
      <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 text-center text-gray-400">
        <Info className="w-6 h-6 mx-auto mb-2 text-blue-400 opacity-60" />
        <p className="text-sm">Model metrics will appear after training.</p>
      </div>
    );
  }

  const models = Object.keys(metrics.validation);

  return (
    <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <h2 className="text-base font-bold text-white tracking-wide">
              Model Performance & Benchmark Comparison
            </h2>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Evaluated using chronological train-validation-test split (70% train, 15% validation, 15% test).
          </p>
        </div>

        {/* Selected Best Model Badge */}
        <div className="flex items-center space-x-2 bg-yellow-500/10 border border-yellow-500/30 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-yellow-300">
          <Award className="w-4 h-4 text-yellow-400 shrink-0" />
          <span>Selected Champion: {metrics.selected_model}</span>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400 uppercase tracking-wider font-semibold">
              <th className="py-3 px-4">Algorithm</th>
              <th className="py-3 px-4">Accuracy</th>
              <th className="py-3 px-4">F1-Score</th>
              <th className="py-3 px-4">Precision</th>
              <th className="py-3 px-4">Recall</th>
              <th className="py-3 px-4">ROC-AUC</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60 font-medium mono-numbers">
            {models.map((modelName) => {
              const m = metrics.validation[modelName];
              const isSelected = metrics.selected_model === modelName;

              return (
                <tr
                  key={modelName}
                  className={`transition-colors ${
                    isSelected ? 'bg-blue-600/10 text-white font-semibold' : 'text-gray-300 hover:bg-gray-900/40'
                  }`}
                >
                  <td className="py-3.5 px-4 font-sans flex items-center space-x-2">
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />}
                    <span>{modelName}</span>
                  </td>
                  <td className="py-3.5 px-4">{(m.accuracy * 100).toFixed(1)}%</td>
                  <td className="py-3.5 px-4">{m.f1.toFixed(3)}</td>
                  <td className="py-3.5 px-4">{(m.precision * 100).toFixed(1)}%</td>
                  <td className="py-3.5 px-4">{(m.recall * 100).toFixed(1)}%</td>
                  <td className="py-3.5 px-4">
                    {m.roc_auc !== null ? m.roc_auc.toFixed(3) : 'N/A'}
                  </td>
                  <td className="py-3.5 px-4 font-sans">
                    {isSelected ? (
                      <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold">
                        ACTIVE INFERENCE
                      </span>
                    ) : (
                      <span className="text-gray-500 text-[10px]">Benchmarked</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Out-of-Sample Test Evaluation Summary */}
      {metrics.test && (
        <div className="mt-5 p-4 rounded-xl bg-gray-900/60 border border-gray-800/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-xs">
            <span className="font-semibold text-gray-300">Out-Of-Sample Test Holdout Score:</span>
            <span className="text-gray-400">
              (Unseen 15% future data validation)
            </span>
          </div>

          <div className="flex items-center space-x-4 text-xs font-semibold mono-numbers">
            <div>
              <span className="text-gray-400">Accuracy: </span>
              <span className="text-white">{(metrics.test.accuracy * 100).toFixed(1)}%</span>
            </div>
            <div>
              <span className="text-gray-400">F1 Score: </span>
              <span className="text-white">{metrics.test.f1.toFixed(3)}</span>
            </div>
            {metrics.test.roc_auc !== null && (
              <div>
                <span className="text-gray-400">ROC-AUC: </span>
                <span className="text-emerald-400">{metrics.test.roc_auc.toFixed(3)}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
