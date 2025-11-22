export default function LoadingState({ currentStep }) {
  const steps = [
    { id: 'scraping', label: 'Scraping listing data', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z', order: 1 },
    { id: 'streetview', label: 'Fetching Street View', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z', order: 2 },
    { id: 'images', label: 'Analyzing images', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z', order: 3 },
    { id: 'price', label: 'Checking price history', icon: 'M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z', order: 4 },
    { id: 'text', label: 'Analyzing description', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', order: 5 }
  ];

  const getCurrentStepOrder = () => {
    const step = steps.find(s => s.id === currentStep);
    return step ? step.order : 0;
  };

  const currentOrder = getCurrentStepOrder();

  return (
    <div className="w-full max-w-3xl mx-auto card-premium p-8 animate-slide-up">
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center gap-4 mb-8">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl flex items-center justify-center shadow-hard">
              <svg className="animate-spin h-10 w-10 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success-500 rounded-full border-4 border-white animate-pulse" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-neutral-900 mb-1">Analyzing Listing</h2>
            <p className="text-sm text-neutral-500">This may take up to 60 seconds</p>
          </div>
        </div>

        <div className="space-y-3">
          {steps.map((step) => {
            const isComplete = step.order < currentOrder;
            const isCurrent = step.order === currentOrder;

            return (
              <div
                key={step.id}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300 ${
                  isComplete ? 'bg-gradient-to-r from-success-50 to-white border-success-200' :
                  isCurrent ? 'bg-gradient-to-r from-brand-50 to-white border-brand-300 shadow-soft' :
                  'bg-white border-neutral-200'
                }`}
              >
                <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center shadow-sm transition-all duration-300 ${
                  isComplete ? 'bg-success-500' :
                  isCurrent ? 'bg-gradient-to-br from-brand-500 to-brand-600 animate-pulse' :
                  'bg-neutral-200'
                }`}>
                  {isComplete ? (
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : isCurrent ? (
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={step.icon} />
                    </svg>
                  ) : (
                    <svg className="w-7 h-7 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={step.icon} />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <span className={`text-base font-semibold ${
                    isComplete ? 'text-success-700' :
                    isCurrent ? 'text-brand-700' :
                    'text-neutral-500'
                  }`}>
                    {step.label}
                  </span>
                  {isComplete && (
                    <span className="ml-2 text-success-600 text-sm">Complete</span>
                  )}
                  {isCurrent && (
                    <span className="ml-2 text-brand-600 text-sm animate-pulse">In progress...</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 space-y-2">
          <div className="flex justify-between text-xs font-semibold text-neutral-600 uppercase tracking-wide">
            <span>Progress</span>
            <span>{Math.round((currentOrder / steps.length) * 100)}%</span>
          </div>
          <div className="relative w-full bg-neutral-200 rounded-full h-3 overflow-hidden shadow-inner">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-brand-500 to-brand-600 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${(currentOrder / steps.length) * 100}%` }}
            >
              <div className="absolute inset-0 bg-white/30 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
