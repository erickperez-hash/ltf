import { getRiskColor, getRiskEmoji } from '../utils/calculateRisk';

export default function RiskBadge({ level, score }) {
  const colorClass = getRiskColor(level);
  const emoji = getRiskEmoji(level);

  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 font-semibold ${colorClass}`}>
      <span className="text-2xl">{emoji}</span>
      <span className="uppercase text-sm">
        {level} RISK ({score}%)
      </span>
    </div>
  );
}
