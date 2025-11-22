import { useState } from 'react';
import { validateZillowUrl } from '../utils/extractAddress';

export default function URLInput({ value, onChange, onAnalyze, isLoading }) {
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const url = e.target.value;
    onChange(url);

    // Clear error when user types
    if (error) setError('');
  };

  const handleAnalyze = () => {
    const validation = validateZillowUrl(value);

    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setError('');
    onAnalyze();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAnalyze();
    }
  };

  const validation = validateZillowUrl(value);
  const isValid = validation.valid;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          placeholder="https://www.zillow.com/homedetails/..."
          disabled={isLoading}
          className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        {value && !isLoading && (
          <button
            onClick={() => { onChange(''); setError(''); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Clear"
          >
            ✕
          </button>
        )}
      </div>

      {error && (
        <div className="text-red-600 text-sm">
          ⚠️ {error}
        </div>
      )}

      <button
        onClick={handleAnalyze}
        disabled={!value || !isValid || isLoading}
        className="w-full py-3 px-6 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Analyzing...
          </span>
        ) : (
          'Analyze Listing'
        )}
      </button>

      {!isLoading && (
        <p className="text-sm text-gray-500 text-center">
          This takes 30-60 seconds
        </p>
      )}
    </div>
  );
}
