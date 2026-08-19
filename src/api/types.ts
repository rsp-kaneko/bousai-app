export interface Hypocenter {
  name: string;
  latitude: number | string;
  longitude: number | string;
  depth: number | string;
  magnitude: number | string;
}

export interface EarthquakeInfo {
  time: string;
  maxScale: number | null;
  domesticTsunami: 'None' | 'Unknown' | 'Checking' | 'NonEffective' | 'Watch' | 'Warning' | string;
  hypocenter: Hypocenter;
}

export interface IssueInfo {
  time?: string;
  type: 'ScalePrompt' | 'Destination' | 'ScaleAndDestination' | 'DetailScale' | 'Foreign' | 'Other' | string;
  source: string;
}

export interface ObservationPoint {
  pref?: string;
  addr: string;
  scale: number;
  isArea?: boolean;
}

export interface BousaiData {
  _id: { $oid: string };
  code: number;
  time: string;
  created_at?: string;
  earthquake?: EarthquakeInfo;
  issue?: IssueInfo;
  points?: ObservationPoint[];
  // 感知情報 (code: 5610など) 用の定義
  areas?: Record<string, number>;
  prefs?: Record<string, number>;
  regions?: Record<string, number>;
  count?: number;
}
