import RiskBadge from './RiskBadge';

export default function TextAnalysis({ analysis }) {
  if (!analysis) {
    return null;
  }

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-lg border-2 border-gray-200 p-6 shadow-sm">
      <h2 className="text-xl font-bold mb-4 text-gray-900">Description Analysis</h2>

      <div className="mb-4">
        <RiskBadge level={analysis.riskLevel} score={analysis.confidence} />
      </div>

      {analysis.redFlags && analysis.redFlags.length > 0 ? (
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Misleading Language Found:</h3>
          <div className="space-y-3">
            {analysis.redFlags.map((flag, idx) => (
              <div key={idx} className="p-3 bg-amber-50 border-l-4 border-amber-500 rounded">
                <div className="flex items-start gap-2">
                  <span className="text-amber-600 font-semibold">⚠️</span>
                  <div className="flex-grow">
                    <div className="font-semibold text-gray-900">
                      "{flag.phrase}"
                    </div>
                    <div className="text-sm text-gray-700 mt-1">
                      Translation: {flag.translation}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
          <p className="text-green-800">
            ✓ No obvious misleading language detected in the description.
          </p>
        </div>
      )}

      {analysis.recommendations && analysis.recommendations.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold text-gray-900 mb-2">Questions to Ask:</h3>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            {analysis.recommendations.map((rec, idx) => (
              <li key={idx}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
