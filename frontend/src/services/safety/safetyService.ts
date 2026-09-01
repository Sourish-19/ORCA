import { SafetyEvaluation, HazardWarning } from '../../types';

export function checkSafety(
  windKnots: number = 12.5,
  waveM: number = 1.2,
  activeWarnings: HazardWarning[] = []
): SafetyEvaluation {
  const hasCyclone = activeWarnings.some(
    (w) => w.severity === 'RED' || w.warning_type === 'CYCLONE'
  );

  if (hasCyclone || windKnots > 25.0 || waveM > 2.5) {
    return {
      is_safe: false,
      veto_triggered: true,
      risk_level: 'SEVERE',
      veto_reasons: [
        'IMD Severe Cyclonic Storm Warning active in sector',
        `Wind speed (${windKnots} kts) or Wave height (${waveM}m) threshold exceeded`
      ],
      warnings_found: activeWarnings,
      freshness_acceptable: true,
      safety_summary: '🚨 SAFETY VETO ACTIVE — DO NOT VENTURE TO SEA'
    };
  }

  return {
    is_safe: true,
    veto_triggered: false,
    risk_level: 'LOW',
    veto_reasons: [],
    warnings_found: [],
    freshness_acceptable: true,
    safety_summary: '✓ SAFE TO PROCEED — Clear Marine Weather'
  };
}
