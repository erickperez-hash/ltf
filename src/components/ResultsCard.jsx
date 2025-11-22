import RiskBadge from './RiskBadge';

export default function ResultsCard({ overallRisk, recommendations }) {
  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-lg border-2 border-gray-200 p-6 shadow-sm">
      <h2 className="text-2xl font-bold mb-4 text-gray-900">Overall Assessment</h2>

      <div className="mb-6">
        <RiskBadge level={overallRisk.level} score={overallRisk.score} />
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Summary</h3>
          <p className="text-gray-700">
            Found {overallRisk.flagCount} potential issue{overallRisk.flagCount !== 1 ? 's' : ''} with this listing.
            {overallRisk.level === 'high' && ' We recommend proceeding with caution or skipping this property.'}
            {overallRisk.level === 'medium' && ' We recommend verifying the issues below before scheduling a viewing.'}
            {overallRisk.level === 'low' && ' This listing appears mostly accurate, but always verify in person.'}
          </p>
        </div>

        {recommendations && recommendations.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">What to Verify in Person:</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              {recommendations.map((rec, idx) => (
                <li key={idx}>{rec}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
