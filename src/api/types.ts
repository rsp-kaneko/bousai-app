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

export type ShityosonText = {
  pref: string
  munic: string
}

/**
 * インタラクション内のステップ種別
 */
export type InteractionStepType = 
  | 'user_input'
  | 'model_output'
  | 'function_call'
  | 'function_response'
  | 'thought';

/**
 * 各ステップの共通基底インターフェース
 */
export interface BaseInteractionStep {
  id?: string;
  type: InteractionStepType | string;
  created_at?: string | number;
}

/**
 * ユーザー入力ステップ
 */
export interface UserInputStep extends BaseInteractionStep {
  type: 'user_input';
  text: string;
}

/**
 * モデル出力ステップ
 */
export interface ModelOutputStep extends BaseInteractionStep {
  type: 'model_output';
  text: string;
}

/**
 * ツール／ファンクション呼び出しステップ
 */
export interface FunctionCallStep extends BaseInteractionStep {
  type: 'function_call';
  name: string;
  arguments: Record<string, unknown>;
}

/**
 * ツール／ファンクション実行結果ステップ
 */
export interface FunctionResponseStep extends BaseInteractionStep {
  type: 'function_response';
  name: string;
  response: Record<string, unknown>;
}

/**
 * モデルの思考プロセス（Reasoning）ステップ
 */
export interface ThoughtStep extends BaseInteractionStep {
  type: 'thought';
  summary?: string;
  text?: string;
}

/**
 * ステップの判別可能なユニオン型
 */
export type InteractionStep =
  | UserInputStep
  | ModelOutputStep
  | FunctionCallStep
  | FunctionResponseStep
  | ThoughtStep;

/**
 * トークン使用量
 */
export interface InteractionUsage {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
}

/**
 * https://generativelanguage.googleapis.com/v1beta/interactions
 * レスポンス（result）データ型
 */
export interface GeminiInteractionResult {
  /** インタラクションの一意なID */
  id: string;
  /** オブジェクト種別 */
  object?: string;
  /** ステータス ('completed' | 'in_progress' | 'failed' など) */
  status?: 'completed' | 'in_progress' | 'failed' | string;
  /** 使用モデル名 (例: 'gemini-3.6-flash') */
  model: string;
  /** 作成日時タイムスタンプ */
  created_at?: string | number;
  /** 対話・思考・ツール呼び出しの時系列ステップリスト */
  steps: InteractionStep[];
  /** 最終的なテキスト出力の便利フィールド (SDK/ヘルパー提供) */
  output_text?: string;
  /** トークン消費情報 */
  usage?: InteractionUsage;
}
