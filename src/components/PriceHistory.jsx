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
    <div className="w-full max-w-3xl mx-auto bg-white rounded-lg border-2 border-gray-200 p-6 shadow-sm">
      <h2 className="text-xl font-bold mb-4 text-gray-900">Price History Analysis</h2>

      <div className="mb-4">
        <RiskBadge level={analysis.riskLevel} score={analysis.confidence} />
      </div>

      {analysis.timeline && analysis.timeline.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Price Timeline:</h3>
          <div className="space-y-3">
            {analysis.timeline.map((entry, idx) => {
              const isDecrease = idx > 0 && entry.price < analysis.timeline[idx - 1].price;
              const percentChange = idx > 0
                ? Math.round(((entry.price - analysis.timeline[idx - 1].price) / analysis.timeline[idx - 1].price) * 100)
                : 0;

              return (
                <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-24 text-sm text-gray-600">
                    {formatDate(entry.date)}
                  </div>
                  <div className="flex-grow">
                    <span className="font-semibold text-gray-900">{formatPrice(entry.price)}</span>
                    {isDecrease && (
                      <span className="ml-2 text-sm text-red-600 font-medium">
                        ({percentChange}%)
                      </span>
                    )}
                  </div>
                  {isDecrease && (
                    <div className="flex-shrink-0 text-red-600">
                      ↓
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-4">
        {analysis.dropCount !== undefined && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Price Drops</div>
            <div className="text-2xl font-bold text-gray-900">{analysis.dropCount}</div>
          </div>
        )}
        {analysis.totalDecrease !== undefined && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Total Decrease</div>
            <div className="text-2xl font-bold text-gray-900">{analysis.totalDecrease}%</div>
          </div>
        )}
        {analysis.daysOnMarket !== undefined && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Days on Market</div>
            <div className="text-2xl font-bold text-gray-900">{analysis.daysOnMarket}</div>
          </div>
        )}
      </div>

      {analysis.explanation && (
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700">{analysis.explanation}</p>
        </div>
      )}
    </div>
  );
}
