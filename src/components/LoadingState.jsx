export default function LoadingState({ currentStep }) {
  const steps = [
    { id: 'scraping', label: 'Scraping listing data', order: 1 },
    { id: 'streetview', label: 'Fetching Street View', order: 2 },
    { id: 'images', label: 'Analyzing images', order: 3 },
    { id: 'price', label: 'Checking price history', order: 4 },
    { id: 'text', label: 'Analyzing description', order: 5 }
  ];

  const getCurrentStepOrder = () => {
    const step = steps.find(s => s.id === currentStep);
    return step ? step.order : 0;
  };

  const currentOrder = getCurrentStepOrder();

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-lg border-2 border-gray-200 p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-center gap-3 mb-6">
          <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <h2 className="text-xl font-bold text-gray-900">Analyzing Listing...</h2>
        </div>

        <div className="space-y-3">
          {steps.map((step) => {
            const isComplete = step.order < currentOrder;
            const isCurrent = step.order === currentOrder;

            return (
              <div key={step.id} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  isComplete ? 'bg-green-500' :
                  isCurrent ? 'bg-blue-500' :
                  'bg-gray-200'
                }`}>
                  {isComplete ? (
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : isCurrent ? (
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                  ) : (
                    <div className="w-3 h-3 bg-gray-400 rounded-full" />
                  )}
                </div>
                <span className={`text-sm ${
                  isComplete || isCurrent ? 'text-gray-900 font-medium' : 'text-gray-500'
                }`}>
                  {step.label}
                  {isComplete && ' ✓'}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-6">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(currentOrder / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
