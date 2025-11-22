import RiskBadge from './RiskBadge';

export default function ImageComparison({ analysis }) {
  if (!analysis || analysis.skipped) {
    return (
      <div className="w-full max-w-3xl mx-auto bg-white rounded-lg border-2 border-gray-200 p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-4 text-gray-900">Exterior Verification</h2>
        <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
          <p className="text-amber-800">
            ⚠️ {analysis?.reason || 'Could not verify exterior - Google Street View not available for this address'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-lg border-2 border-gray-200 p-6 shadow-sm">
      <h2 className="text-xl font-bold mb-4 text-gray-900">Exterior Verification</h2>

      <div className="mb-4">
        <RiskBadge level={analysis.riskLevel} score={analysis.confidence} />
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <h3 className="font-semibold text-sm text-gray-600 mb-2">Listing Photo</h3>
          <img
            src={analysis.listingImage}
            alt="Listing exterior"
            className="w-full rounded-lg border-2 border-gray-300"
          />
        </div>
        <div>
          <h3 className="font-semibold text-sm text-gray-600 mb-2">Google Street View</h3>
          <img
            src={analysis.streetViewImage}
            alt="Street View exterior"
            className="w-full rounded-lg border-2 border-gray-300"
          />
        </div>
      </div>

      {analysis.discrepancies && analysis.discrepancies.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Differences Found:</h3>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            {analysis.discrepancies.map((diff, idx) => (
              <li key={idx}>{diff}</li>
            ))}
          </ul>
        </div>
      )}

      {analysis.verdict && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700">{analysis.verdict}</p>
        </div>
      )}
    </div>
  );
}
