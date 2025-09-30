// Legal content and intelligence types
export interface LegalUpdate {
  id: string;
  title: string;
  titleAr: string;
  titleFr: string;
  content: string;
  contentAr: string;
  contentFr: string;
  summary: string;
  summaryAr: string;
  summaryFr: string;
  category: LegalCategory;
  priority: 'high' | 'medium' | 'low';
  source: LegalSource;
  publishedAt: Date;
  effectiveDate?: Date;
  tags: string[];
  tagsAr: string[];
  tagsFr: string[];
  impactLevel: 'critical' | 'high' | 'medium' | 'low';
  sectors: Sector[];
  ministryId?: string;
  isBookmarked?: boolean;
  readStatus?: 'read' | 'unread';
}

export interface LegalSource {
  id: string;
  name: string;
  nameAr: string;
  nameFr: string;
  type:
    | 'government_social'
    | 'parliamentary'
    | 'qanoun_tn'
    | 'traditional_law'
    | 'ministry_official';
  url?: string;
  credibilityScore: number;
  lastUpdated: Date;
}

export type LegalCategory =
  | 'business_law'
  | 'civil_law'
  | 'administrative_law'
  | 'labor_law'
  | 'tax_law'
  | 'family_law'
  | 'criminal_law'
  | 'constitutional_law'
  | 'commercial_law'
  | 'environmental_law';

export type Sector =
  | 'money'
  | 'food'
  | 'agriculture'
  | 'business'
  | 'tourism'
  | 'education'
  | 'healthcare'
  | 'technology'
  | 'manufacturing'
  | 'services';

export interface LegalIntelligenceResponse {
  id: string;
  query: string;
  queryAr: string;
  queryFr: string;
  sources: IntelligenceSource[];
  traditionalLegalAnswer: string;
  traditionalLegalAnswerAr: string;
  traditionalLegalAnswerFr: string;
  governmentPosition?: GovernmentPosition;
  parliamentaryContext?: ParliamentaryContext;
  predictions?: LegalPrediction[];
  confidenceScore: number;
  lastUpdated: Date;
  culturalContext: TunisianContext;
  relatedUpdates: string[]; // IDs of related legal updates
}

export interface IntelligenceSource {
  type: 'traditional_law' | 'government_social' | 'parliamentary' | 'qanoun_tn';
  content: string;
  contentAr: string;
  contentFr: string;
  url?: string;
  timestamp: Date;
  relevanceScore: number;
  vectorEmbedding?: number[];
}

export interface GovernmentPosition {
  ministryId: string;
  ministryName: string;
  ministryNameAr: string;
  ministryNameFr: string;
  stance: 'supportive' | 'neutral' | 'opposing' | 'unclear';
  statement: string;
  statementAr: string;
  statementFr: string;
  confidence: number;
  lastUpdated: Date;
}

export interface ParliamentaryContext {
  sessionId: string;
  lawId?: string;
  currentStage:
    | 'committee'
    | 'first_reading'
    | 'second_reading'
    | 'final_vote'
    | 'passed'
    | 'rejected';
  votingPattern?: VotingPattern;
  timeline: ParliamentaryTimeline;
  keyPlayers: ParliamentaryMember[];
}

export interface VotingPattern {
  forVotes: number;
  againstVotes: number;
  abstentions: number;
  totalMembers: number;
  passageProbability: number;
}

export interface ParliamentaryTimeline {
  estimatedCompletion: Date;
  nextMilestone: string;
  nextMilestoneAr: string;
  nextMilestoneFr: string;
  nextMilestoneDate: Date;
  riskFactors: string[];
  riskFactorsAr: string[];
  riskFactorsFr: string[];
}

export interface ParliamentaryMember {
  id: string;
  name: string;
  nameAr: string;
  party: string;
  partyAr: string;
  position: string;
  positionAr: string;
  influence: 'high' | 'medium' | 'low';
  stance: 'supportive' | 'neutral' | 'opposing' | 'unknown';
}

export interface LegalPrediction {
  type: 'law_passage' | 'regulation_change' | 'enforcement_action';
  description: string;
  descriptionAr: string;
  descriptionFr: string;
  probability: number;
  timeframe: string;
  timeframeAr: string;
  timeframeFr: string;
  impactAssessment: string;
  impactAssessmentAr: string;
  impactAssessmentFr: string;
  confidenceLevel: number;
}

export interface TunisianContext {
  culturalReferences: CulturalReference[];
  dialectTerms: DialectTerm[];
  regionalRelevance: RegionalRelevance[];
  historicalContext?: string;
  historicalContextAr?: string;
  historicalContextFr?: string;
}

export interface CulturalReference {
  term: string;
  termAr: string;
  explanation: string;
  explanationAr: string;
  explanationFr: string;
  significance: 'high' | 'medium' | 'low';
}

export interface DialectTerm {
  tunisianTerm: string;
  standardArabic: string;
  french: string;
  english: string;
  context: string;
  contextAr: string;
  usage: 'formal' | 'informal' | 'legal' | 'colloquial';
}

export interface RegionalRelevance {
  region:
    | 'tunis'
    | 'sfax'
    | 'sousse'
    | 'kairouan'
    | 'bizerte'
    | 'gabes'
    | 'gafsa'
    | 'national';
  regionAr: string;
  relevanceScore: number;
  specificConsiderations: string[];
  specificConsiderationsAr: string[];
}
