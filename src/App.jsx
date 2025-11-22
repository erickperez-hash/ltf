import { useState } from 'react';
import URLInput from './components/URLInput';
import LoadingState from './components/LoadingState';
import ResultsCard from './components/ResultsCard';
import ImageComparison from './components/ImageComparison';
import PriceHistory from './components/PriceHistory';
import TextAnalysis from './components/TextAnalysis';
import { scrapeZillow } from './hooks/useApify';
import { getStreetView } from './hooks/useStreetView';
import { compareImages, analyzeDescription } from './hooks/useClaudeVision';
import { calculateOverallRisk } from './utils/calculateRisk';

function App() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);

  const analyzeFullAddress = (listing) => {
    if (listing.address && typeof listing.address === 'string') {
      return listing.address;
    }

    const parts = [
      listing.address,
      listing.city,
      listing.state,
      listing.zipcode
    ].filter(Boolean);

    return parts.join(', ');
  };

  const analyzePriceHistory = (listing) => {
    const priceHistory = listing.priceHistory || [];

    if (priceHistory.length === 0) {
      return {
        confidence: 20,
        riskLevel: 'low',
        dropCount: 0,
        totalDecrease: 0,
        daysOnMarket: listing.daysOnMarket || 0,
        timeline: listing.price ? [{ date: new Date().toISOString(), price: listing.price }] : [],
        explanation: 'No price history available. Property may be new to market.'
      };
    }

    let dropCount = 0;
    let totalDecrease = 0;

    for (let i = 1; i < priceHistory.length; i++) {
      if (priceHistory[i].price < priceHistory[i - 1].price) {
        dropCount++;
        const decrease = ((priceHistory[i - 1].price - priceHistory[i].price) / priceHistory[i - 1].price) * 100;
        totalDecrease += decrease;
      }
    }

    totalDecrease = Math.round(totalDecrease);

    let confidence = 0;
    let riskLevel = 'low';

    if (dropCount >= 3 || totalDecrease >= 20 || listing.daysOnMarket > 60) {
      confidence = 80;
      riskLevel = 'high';
    } else if (dropCount >= 2 || totalDecrease >= 10) {
      confidence = 60;
      riskLevel = 'medium';
    } else {
      confidence = 30;
      riskLevel = 'low';
    }

    let explanation = '';
    if (riskLevel === 'high') {
      explanation = 'Multiple price drops and/or extended time on market suggests potential issues with the property or area.';
    } else if (riskLevel === 'medium') {
      explanation = 'Some price adjustments detected. Property may be overpriced or have minor concerns.';
    } else {
      explanation = 'Price history appears normal. No significant red flags.';
    }

    return {
      confidence,
      riskLevel,
      dropCount,
      totalDecrease,
      daysOnMarket: listing.daysOnMarket || 0,
      timeline: priceHistory,
      explanation
    };
  };

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError('');
    setResults(null);

    try {
      // Step 1: Scrape listing from Zillow
      setLoadingStep('scraping');
      const listing = await scrapeZillow(url);

      if (!listing || !listing.address) {
        throw new Error('Could not extract listing data. Please check the URL and try again.');
      }

      // Step 2: Get Street View
      setLoadingStep('streetview');
      const fullAddress = analyzeFullAddress(listing);
      let streetViewUrl;
      let imageAnalysis = null;

      try {
        streetViewUrl = await getStreetView(fullAddress);

        // Step 3: Compare images
        setLoadingStep('images');
        const listingImage = listing.images && listing.images.length > 0
          ? listing.images[0]
          : null;

        if (listingImage && streetViewUrl) {
          imageAnalysis = await compareImages(listingImage, streetViewUrl);
        } else {
          imageAnalysis = {
            skipped: true,
            reason: 'No exterior photo available in listing'
          };
        }
      } catch (streetViewError) {
        console.error('Street View error:', streetViewError);
        imageAnalysis = {
          skipped: true,
          reason: 'Google Street View not available for this address'
        };
      }

      // Step 4: Analyze price history
      setLoadingStep('price');
      const priceAnalysis = analyzePriceHistory(listing);

      // Step 5: Analyze description
      setLoadingStep('text');
      let textAnalysis = null;

      if (listing.description && listing.description.trim().length > 0) {
        try {
          textAnalysis = await analyzeDescription(listing.description);
        } catch (textError) {
          console.error('Text analysis error:', textError);
          textAnalysis = {
            confidence: 0,
            riskLevel: 'low',
            redFlags: [],
            recommendations: []
          };
        }
      } else {
        textAnalysis = {
          confidence: 0,
          riskLevel: 'low',
          redFlags: [],
          recommendations: []
        };
      }

      // Calculate overall risk
      const overallRisk = calculateOverallRisk(
        imageAnalysis?.skipped ? null : imageAnalysis,
        priceAnalysis,
        textAnalysis
      );

      // Generate recommendations
      const recommendations = [];

      if (imageAnalysis && !imageAnalysis.skipped && imageAnalysis.discrepancies) {
        imageAnalysis.discrepancies.forEach(disc => {
          recommendations.push(`Verify: ${disc}`);
        });
      }

      if (priceAnalysis.dropCount > 0) {
        recommendations.push(`Ask why the price has dropped ${priceAnalysis.dropCount} time(s)`);
      }

      if (textAnalysis.recommendations) {
        recommendations.push(...textAnalysis.recommendations);
      }

      setResults({
        overallRisk,
        imageAnalysis,
        priceAnalysis,
        textAnalysis,
        recommendations,
        listing: {
          address: fullAddress,
          price: listing.price
        }
      });

    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message || 'An error occurred during analysis. Please try again.');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Listing Truth Finder 🔍
          </h1>
          <p className="text-xl text-gray-600">
            Verify before you visit
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Analyze Zillow listings for photo manipulation, price red flags, and misleading language
          </p>
        </div>

        {/* URL Input */}
        <div className="mb-8">
          <URLInput
            value={url}
            onChange={setUrl}
            onAnalyze={handleAnalyze}
            isLoading={isLoading}
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="max-w-3xl mx-auto mb-8 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <span className="text-red-600 text-xl">⚠️</span>
              <div>
                <h3 className="font-semibold text-red-900">Error</h3>
                <p className="text-red-700">{error}</p>
                <p className="text-sm text-red-600 mt-2">
                  Try a different listing URL or try again in a moment.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <LoadingState currentStep={loadingStep} />
        )}

        {/* Results */}
        {results && !isLoading && (
          <div className="space-y-6">
            {/* Listing Info */}
            <div className="max-w-3xl mx-auto bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <div className="text-sm text-blue-900">
                <div className="font-semibold">{results.listing.address}</div>
                {results.listing.price && (
                  <div className="text-blue-700">
                    Price: {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                      minimumFractionDigits: 0
                    }).format(results.listing.price)}
                  </div>
                )}
              </div>
            </div>

            {/* Overall Assessment */}
            <ResultsCard
              overallRisk={results.overallRisk}
              recommendations={results.recommendations}
            />

            {/* Image Comparison */}
            <ImageComparison analysis={results.imageAnalysis} />

            {/* Price History */}
            <PriceHistory analysis={results.priceAnalysis} />

            {/* Text Analysis */}
            <TextAnalysis analysis={results.textAnalysis} />

            {/* Analyze Another */}
            <div className="text-center py-6">
              <button
                onClick={() => {
                  setResults(null);
                  setUrl('');
                }}
                className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
              >
                Analyze Another Listing
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        {!results && !isLoading && (
          <div className="text-center mt-12 text-sm text-gray-500">
            <p>Built for TRAE SOLO Hackathon - RAI in Practice Track</p>
            <p className="mt-2">Using AI to detect AI manipulation in real estate listings</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
