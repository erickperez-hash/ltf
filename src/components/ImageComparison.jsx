import RiskBadge from './RiskBadge';

export default function ImageComparison({ analysis }) {
  if (!analysis || analysis.skipped) {
    return (
      <div className="w-full max-w-3xl mx-auto card-premium p-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-warning-500 to-warning-600 rounded-xl flex items-center justify-center shadow-soft">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-neutral-900 tracking-tight">Exterior Verification</h2>
          </div>
        </div>
        <div className="bg-gradient-to-br from-warning-50 to-warning-100/50 border-2 border-warning-200 rounded-xl p-6 shadow-soft">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-warning-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-warning-800 leading-relaxed">
              {analysis?.reason || 'Could not verify exterior - Google Street View not available for this address'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto card-premium p-8">
      <div className="flex items-start gap-4 mb-6">
        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center shadow-soft">
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-neutral-900 tracking-tight">Exterior Verification</h2>
        </div>
      </div>

      <div className="mb-8">
        <RiskBadge level={analysis.riskLevel} score={analysis.confidence} />
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
            <h3 className="font-semibold text-neutral-900">Listing Photo</h3>
          </div>
          <img
            src={analysis.listingImage}
            alt="Listing exterior"
            className="w-full rounded-xl border-2 border-neutral-200 shadow-soft hover:shadow-medium transition-shadow"
          />
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="font-semibold text-neutral-900">Google Street View</h3>
          </div>
          <img
            src={analysis.streetViewImage}
            alt="Street View exterior"
            className="w-full rounded-xl border-2 border-neutral-200 shadow-soft hover:shadow-medium transition-shadow"
          />
        </div>
      </div>

      {analysis.discrepancies && analysis.discrepancies.length > 0 && (
        <div className="p-5 bg-gradient-to-br from-warning-50/50 to-white rounded-xl border border-warning-200 mb-6">
          <div className="flex items-start gap-3 mb-4">
            <svg className="w-5 h-5 text-warning-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <h3 className="font-semibold text-neutral-900 text-lg">Differences Found</h3>
          </div>
          <ul className="space-y-3">
            {analysis.discrepancies.map((diff, idx) => (
              <li key={idx} className="flex items-start gap-3 text-neutral-700">
                <svg className="w-5 h-5 text-warning-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="flex-1">{diff}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {analysis.verdict && (
        <div className="p-5 bg-gradient-to-br from-neutral-50 to-white rounded-xl border border-neutral-200">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-brand-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="text-neutral-700 leading-relaxed">{analysis.verdict}</p>
          </div>
        </div>
      )}
    </div>
  );
}
