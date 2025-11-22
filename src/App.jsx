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
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-6 bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl shadow-medium">
            <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-neutral-900 mb-4 tracking-tight">
            <span className="text-gradient">Listing Truth</span> Finder
          </h1>
          <p className="text-xl sm:text-2xl text-neutral-600 font-medium mb-3">
            Verify before you visit
          </p>
          <p className="text-base text-neutral-500 max-w-2xl mx-auto">
            Enterprise-grade AI analysis for Zillow listings. Detect photo manipulation, price red flags, and misleading language with confidence.
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
          <div className="max-w-3xl mx-auto mb-8 p-6 bg-gradient-to-br from-danger-50 to-danger-100/50 border-2 border-danger-200 rounded-2xl shadow-soft animate-slide-up">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-danger-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-danger-900 text-lg mb-1">Analysis Error</h3>
                <p className="text-danger-700 mb-2">{error}</p>
                <p className="text-sm text-danger-600">
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
          <div className="space-y-6 animate-slide-up">
            {/* Listing Info */}
            <div className="max-w-3xl mx-auto card-premium p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center shadow-soft">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-neutral-900 text-lg mb-1">Property Details</h3>
                  <div className="text-neutral-700">{results.listing.address}</div>
                  {results.listing.price && (
                    <div className="text-2xl font-bold text-brand-600 mt-2">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        minimumFractionDigits: 0
                      }).format(results.listing.price)}
                    </div>
                  )}
                </div>
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
            <div className="text-center py-8">
              <button
                onClick={() => {
                  setResults(null);
                  setUrl('');
                }}
                className="btn-secondary"
              >
                <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Analyze Another Listing
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        {!results && !isLoading && (
          <div className="text-center mt-16 space-y-4">
            <div className="flex items-center justify-center gap-6 text-sm text-neutral-400">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Enterprise Security</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
                <span>Trusted by Thousands</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                <span>AI-Powered Analysis</span>
              </div>
            </div>
            <div className="pt-4 border-t border-neutral-200 max-w-md mx-auto">
              <p className="text-sm text-neutral-500">Built for TRAE SOLO Hackathon - RAI in Practice Track</p>
              <p className="text-xs text-neutral-400 mt-1">Using AI to detect AI manipulation in real estate listings</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
