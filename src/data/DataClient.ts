export type ID = string;

export type ConfidenceLevel = 'low' | 'medium' | 'high';

export interface ListOptions {
  filters?: Record<string, any>;
  sort?: string;
  limit?: number;
}

export interface Player {
  id: ID;
  display_name?: string;
  first_name?: string;
  last_name?: string;
  slug?: string;
  nationality?: string;
  current_rank?: number;
  peak_rank?: number;
  elo_rating?: number;
  first_serve_pct?: number;
  first_serve_win_pct?: number;
  second_serve_win_pct?: number;
  first_return_win_pct?: number;
  second_return_win_pct?: number;
  break_points_converted_pct?: number;
  hard_court_win_pct?: number;
  clay_court_win_pct?: number;
  grass_court_win_pct?: number;
  data_source?: string;
  is_verified?: boolean;
  [key: string]: any;
}

export interface Match {
  id: ID;
  player1_id: ID;
  player2_id: ID;
  tournament_name?: string;
  surface?: string;
  round?: string;
  best_of?: number;
  utc_start?: string;
  status?: string;
  created_at?: string;
  [key: string]: any;
}

export interface Prediction {
  id: ID;
  match_id: ID;
  model_type?: string;
  predicted_winner_id?: ID;
  player1_win_probability?: number;
  player2_win_probability?: number;
  confidence_level?: ConfidenceLevel;
  key_factors?: string[];
  created_at?: string;
  created_date?: string;
  actual_winner_id?: ID;
  was_correct?: boolean;
  completed_at?: string;
  point_by_point_data?: Record<string, any>[];
  metadata?: Record<string, any>;
  [key: string]: any;
}

export interface ComplianceSource {
  id: ID;
  data_source_name: string;
  terms_url?: string;
  compliance_status: 'compliant' | 'pending_review' | 'violation';
  reviewer?: string;
  notes?: string;
  last_reviewed?: string;
  [key: string]: any;
}

export interface ModelWeights {
  id: ID;
  model_version?: string;
  is_active?: boolean;
  ranking_weight?: number;
  serve_weight?: number;
  return_weight?: number;
  surface_weight?: number;
  h2h_weight?: number;
  form_weight?: number;
  fatigue_weight?: number;
  injury_weight?: number;
  last_updated?: string;
  notes?: string;
  [key: string]: any;
}

export interface ModelFeedback {
  id: ID;
  prediction_id?: ID;
  match_id?: ID;
  model_type?: string;
  was_correct?: boolean;
  confidence_level?: 'low' | 'medium' | 'high';
  calibration_error?: number;
  feedback_date?: string;
  surface?: string;
  player1_id?: ID;
  player2_id?: ID;
  metadata?: Record<string, any>;
  feature_snapshot?: Record<string, number>;
  [key: string]: any;
}

export interface Avatar {
  id: ID;
  alias_text?: string;
  player_id?: ID;
  is_auto_generated?: boolean;
  [key: string]: any;
}

export interface PlayerService {
  list: (options?: string | ListOptions) => Promise<Player[]>;
  get: (id: ID) => Promise<Player | undefined>;
  create: (data: Partial<Player>) => Promise<Player>;
  update: (id: ID, data: Partial<Player>) => Promise<Player>;
  remove: (id: ID) => Promise<void>;
}

export interface MatchService {
  list: (options?: string | ListOptions) => Promise<Match[]>;
  create: (data: Partial<Match>) => Promise<Match>;
}

export interface PredictionService {
  list: (options?: string | ListOptions) => Promise<Prediction[]>;
  create: (data: Partial<Prediction>) => Promise<Prediction>;
  update: (id: ID, data: Partial<Prediction>) => Promise<Prediction>;
}

export interface ComplianceService {
  list: (options?: string | ListOptions) => Promise<ComplianceSource[]>;
  create: (data: Partial<ComplianceSource>) => Promise<ComplianceSource>;
  update: (id: ID, data: Partial<ComplianceSource>) => Promise<ComplianceSource>;
}

export interface ModelWeightsService {
  list: (options?: string | ListOptions) => Promise<ModelWeights[]>;
  create: (data: Partial<ModelWeights>) => Promise<ModelWeights>;
  update: (id: ID, data: Partial<ModelWeights>) => Promise<ModelWeights>;
}

export interface ModelFeedbackService {
  list: (options?: string | ListOptions) => Promise<ModelFeedback[]>;
  create: (data: Partial<ModelFeedback>) => Promise<ModelFeedback>;
}

export interface AliasService {
  create: (data: Partial<Avatar>) => Promise<Avatar>;
}

export interface AuthUser {
  id: ID;
  email?: string;
  display_name?: string;
  full_name?: string;
  role?: string;
  [key: string]: any;
}

export interface AuthService {
  me: () => Promise<AuthUser>;
  logout: (redirectUrl?: string) => void;
  redirectToLogin: (redirectUrl?: string) => void;
}

export interface AppLogService {
  logUserInApp: (pageName: string) => Promise<void>;
}

export interface DataClient {
  players: PlayerService;
  matches: MatchService;
  predictions: PredictionService;
  compliance: ComplianceService;
  modelWeights: ModelWeightsService;
  modelFeedback: ModelFeedbackService;
  alias: AliasService;
  auth: AuthService;
  appLogs: AppLogService;
}
