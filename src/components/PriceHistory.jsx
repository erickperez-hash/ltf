import RiskBadge from './RiskBadge';

export default function PriceHistory({ analysis }) {
  if (!analysis) {
    return null;
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="w-full max-w-3xl mx-auto card-premium p-8">
      <div className="flex items-start gap-4 mb-6">
        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center shadow-soft">
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
        </div>
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-neutral-900 tracking-tight">Price History Analysis</h2>
        </div>
      </div>

      <div className="mb-8">
        <RiskBadge level={analysis.riskLevel} score={analysis.confidence} />
      </div>

      {analysis.timeline && analysis.timeline.length > 0 && (
        <div className="mb-6 p-5 bg-gradient-to-br from-neutral-50 to-white rounded-xl border border-neutral-200">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="font-semibold text-neutral-900 text-lg">Price Timeline</h3>
          </div>
          <div className="space-y-2">
            {analysis.timeline.map((entry, idx) => {
              const isDecrease = idx > 0 && entry.price < analysis.timeline[idx - 1].price;
              const percentChange = idx > 0
                ? Math.round(((entry.price - analysis.timeline[idx - 1].price) / analysis.timeline[idx - 1].price) * 100)
                : 0;

              return (
                <div key={idx} className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${isDecrease ? 'bg-danger-50/50 border-danger-200' : 'bg-white border-neutral-200'}`}>
                  <div className="flex-shrink-0 w-28">
                    <div className="text-xs text-neutral-500 font-medium uppercase tracking-wide">Date</div>
                    <div className="text-sm text-neutral-700 font-semibold">
                      {formatDate(entry.date)}
                    </div>
                  </div>
                  <div className="flex-grow">
                    <div className="text-xs text-neutral-500 font-medium uppercase tracking-wide">Price</div>
                    <span className="text-xl font-bold text-neutral-900">{formatPrice(entry.price)}</span>
                    {isDecrease && (
                      <span className="ml-3 px-3 py-1 text-sm text-danger-700 font-bold bg-danger-100 rounded-lg">
                        {percentChange}%
                      </span>
                    )}
                  </div>
                  {isDecrease && (
                    <div className="flex-shrink-0 w-10 h-10 bg-danger-500 rounded-xl flex items-center justify-center shadow-soft">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {analysis.dropCount !== undefined && (
          <div className="p-5 bg-gradient-to-br from-danger-50 to-white rounded-xl border-2 border-danger-200 shadow-soft">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
              <div className="text-xs text-neutral-600 font-semibold uppercase tracking-wide">Price Drops</div>
            </div>
            <div className="text-3xl font-bold text-danger-600">{analysis.dropCount}</div>
          </div>
        )}
        {analysis.totalDecrease !== undefined && (
          <div className="p-5 bg-gradient-to-br from-warning-50 to-white rounded-xl border-2 border-warning-200 shadow-soft">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-xs text-neutral-600 font-semibold uppercase tracking-wide">Total Decrease</div>
            </div>
            <div className="text-3xl font-bold text-warning-600">{analysis.totalDecrease}%</div>
          </div>
        )}
        {analysis.daysOnMarket !== undefined && (
          <div className="p-5 bg-gradient-to-br from-brand-50 to-white rounded-xl border-2 border-brand-200 shadow-soft">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div className="text-xs text-neutral-600 font-semibold uppercase tracking-wide">Days on Market</div>
            </div>
            <div className="text-3xl font-bold text-brand-600">{analysis.daysOnMarket}</div>
          </div>
        )}
      </div>

      {analysis.explanation && (
        <div className="p-5 bg-gradient-to-br from-neutral-50 to-white rounded-xl border border-neutral-200">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-brand-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="text-neutral-700 leading-relaxed">{analysis.explanation}</p>
          </div>
        </div>
      )}
    </div>
  );
}
