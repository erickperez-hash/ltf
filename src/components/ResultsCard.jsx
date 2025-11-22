import RiskBadge from './RiskBadge';

export default function ResultsCard({ overallRisk, recommendations }) {
  return (
    <div className="w-full max-w-3xl mx-auto card-premium p-8">
      <div className="flex items-start gap-4 mb-6">
        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center shadow-soft">
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-neutral-900 tracking-tight">Overall Assessment</h2>
        </div>
      </div>

      <div className="mb-8">
        <RiskBadge level={overallRisk.level} score={overallRisk.score} />
      </div>

      <div className="space-y-6">
        <div className="p-5 bg-gradient-to-br from-neutral-50 to-white rounded-xl border border-neutral-200">
          <div className="flex items-start gap-3 mb-3">
            <svg className="w-5 h-5 text-brand-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <h3 className="font-semibold text-neutral-900 text-lg mb-2">Summary</h3>
              <p className="text-neutral-700 leading-relaxed">
                Found <span className="font-semibold text-brand-600">{overallRisk.flagCount} potential issue{overallRisk.flagCount !== 1 ? 's' : ''}</span> with this listing.
                {overallRisk.level === 'high' && ' We recommend proceeding with caution or skipping this property.'}
                {overallRisk.level === 'medium' && ' We recommend verifying the issues below before scheduling a viewing.'}
                {overallRisk.level === 'low' && ' This listing appears mostly accurate, but always verify in person.'}
              </p>
            </div>
          </div>
        </div>

        {recommendations && recommendations.length > 0 && (
          <div className="p-5 bg-gradient-to-br from-brand-50/50 to-white rounded-xl border border-brand-200">
            <div className="flex items-start gap-3 mb-4">
              <svg className="w-5 h-5 text-brand-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <h3 className="font-semibold text-neutral-900 text-lg">What to Verify in Person</h3>
            </div>
            <ul className="space-y-3">
              {recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-3 text-neutral-700">
                  <svg className="w-5 h-5 text-brand-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="flex-1">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
