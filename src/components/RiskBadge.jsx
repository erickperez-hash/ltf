import { getRiskColor, getRiskIcon } from '../utils/calculateRisk';

export default function RiskBadge({ level, score }) {
  const colorClass = getRiskColor(level);
  const icon = getRiskIcon(level);

  return (
    <div className={`inline-flex items-center gap-3 px-6 py-4 rounded-2xl border-2 font-semibold shadow-soft transition-all hover:shadow-medium ${colorClass}`}>
      <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${icon.color} bg-white/80 shadow-sm`}>
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={icon.path} />
        </svg>
      </div>
      <div className="flex flex-col">
        <span className="uppercase text-xs font-bold tracking-wider opacity-80">
          Risk Assessment
        </span>
        <span className="text-lg font-bold tracking-tight">
          {level.charAt(0).toUpperCase() + level.slice(1)} Risk
        </span>
      </div>
      <div className="ml-2 px-4 py-2 bg-white/60 rounded-xl">
        <span className="text-2xl font-bold">{score}%</span>
      </div>
    </div>
  );
}
