export interface ParticleClassification {
  type: string;
  count: number;
  colors: string[];
  sizeRange: string;
  percentage: number;
}

export interface AnalysisResult {
  reportId: string;
  analysisDate: string;
  detection: {
    totalCount: number;
    confidence: 'High' | 'Medium' | 'Low';
    reasoning: string;
  };
  classification: ParticleClassification[];
  severity: {
    particlesPerLiter: number;
    score: number;
    level: string;
    calculation: string;
  };
  sources: {
    source: string;
    confidence: number;
    reasoning: string;
  }[];
  healthRisk: {
    marineRisk: string;
    humanRiskLevel: 'NEGLIGIBLE' | 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
    humanRiskSummary: string;
    highestRiskTypes: string[];
    healthEffects: string;
    vulnerablePopulations: string;
  };
  remediation: {
    immediate: string[];
    policy: string[];
    community: string[];
  };
  fullReportMarkdown: string;
}
