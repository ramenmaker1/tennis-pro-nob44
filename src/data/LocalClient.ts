import { buildSamplePlayers } from '@/utils/sampleData';
import { generateAllPredictions } from '@/utils/predictionGenerator';
import { generateMLPrediction } from '@/utils/mlPrediction';
import type {
  Avatar,
  AuthUser,
  ComplianceSource,
  DataClient,
  ListOptions,
  Match,
  ModelFeedback,
  ModelWeights,
  Player,
  Prediction,
} from './DataClient';

const DEFAULT_USER: AuthUser = {
  id: 'local-admin',
  display_name: 'Local Admin',
  full_name: 'Local Admin',
  email: 'admin@local.app',
  role: 'admin',
};

const DEFAULT_COMPLIANCE_SOURCES: ComplianceSource[] = [
  {
    id: 'source-1',
    data_source_name: 'ATP Official',
    compliance_status: 'compliant',
    reviewer: 'Local Admin',
    last_reviewed: new Date().toISOString(),
    terms_url: 'https://www.atptour.com',
    notes: 'Primary ranking feed',
  },
  {
    id: 'source-2',
    data_source_name: 'Tennis Abstract',
    compliance_status: 'pending_review',
    reviewer: 'Local Admin',
    last_reviewed: new Date().toISOString(),
    terms_url: 'https://www.tennisabstract.com',
  },
];

const DEFAULT_SURFACES = ['hard', 'clay', 'grass'];
const DEFAULT_TOURNAMENTS = ['Australian Open', 'French Open', 'Wimbledon', 'US Open'];

export class LocalDataClient implements DataClient {
  private playersData: Player[] = [];
  private matchesData: Match[] = [];
  private predictionsData: Prediction[] = [];
  private complianceData: ComplianceSource[] = [];
  private modelWeightsData: ModelWeights[] = [];
  private modelFeedbackData: ModelFeedback[] = [];
  private aliasData: Avatar[] = [];
  private counters = {
    player: 0,
    match: 0,
    prediction: 0,
    compliance: 0,
    modelWeights: 0,
    modelFeedback: 0,
    alias: 0,
  };

  public players = {
    list: (options?: string | ListOptions) => this.listItems(this.playersData, options),
    get: async (id: string) => this.playersData.find((player) => player.id === id),
    create: async (data: Partial<Player>) => this.createPlayer(data),
    update: async (id: string, data: Partial<Player>) =>
      this.updateEntity(this.playersData, id, data),
    remove: async (id: string) => this.removeEntity(this.playersData, id),
  };

  public matches = {
    list: (options?: string | ListOptions) => this.listItems(this.matchesData, options),
    create: async (data: Partial<Match>) => this.createMatch(data),
  };

  public predictions = {
    list: (options?: string | ListOptions) => this.listItems(this.predictionsData, options),
    create: async (data: Partial<Prediction>) => this.createPrediction(data),
    update: async (id: string, data: Partial<Prediction>) => this.updatePrediction(id, data),
  };

  public compliance = {
    list: (options?: string | ListOptions) => this.listItems(this.complianceData, options),
    create: async (data: Partial<ComplianceSource>) => this.createComplianceSource(data),
    update: async (id: string, data: Partial<ComplianceSource>) =>
      this.updateEntity(this.complianceData, id, data),
  };

  public modelWeights = {
    list: (options?: string | ListOptions) => this.listItems(this.modelWeightsData, options),
    create: async (data: Partial<ModelWeights>) => this.createModelWeights(data),
    update: async (id: string, data: Partial<ModelWeights>) =>
      this.updateEntity(this.modelWeightsData, id, data),
  };

  public modelFeedback = {
    list: (options?: string | ListOptions) => this.listItems(this.modelFeedbackData, options),
    create: async (data: Partial<ModelFeedback>) => this.createModelFeedback(data),
  };

  public alias = {
    create: async (data: Partial<Avatar>) => this.createAlias(data),
  };

  public auth = {
    me: async () => this.clone(DEFAULT_USER),
    logout: () => undefined,
    redirectToLogin: () => undefined,
  };

  public appLogs = {
    logUserInApp: async () => undefined,
  };

  constructor() {
    this.seed();
  }

  private seed() {
    const samplePlayers = buildSamplePlayers(14);
    samplePlayers.forEach((player) => this.createPlayer(player));
    this.seedMatches();
    this.seedCompliance();
    this.seedModelWeights();
  }

  private seedMatches() {
    const players = [...this.playersData];
    for (let i = 0; i < players.length - 1; i += 2) {
      const match = this.createMatch({
        player1_id: players[i].id,
        player2_id: players[i + 1].id,
        tournament_name: DEFAULT_TOURNAMENTS[i % DEFAULT_TOURNAMENTS.length],
        surface: DEFAULT_SURFACES[i % DEFAULT_SURFACES.length],
        round: 'QF',
        best_of: 3,
        utc_start: new Date(Date.now() - i * 86400000).toISOString(),
        status: 'completed',
      });
      this.createPredictionsForMatch(match);
    }
  }

  private seedCompliance() {
    this.complianceData = DEFAULT_COMPLIANCE_SOURCES.map((source) => ({ ...source }));
  }

  private seedModelWeights() {
    const now = new Date().toISOString();
    const weights = {
      id: this.generateId('modelWeights'),
      model_version: 'v4.2',
      is_active: true,
      ranking_weight: 0.25,
      serve_weight: 0.18,
      return_weight: 0.15,
      surface_weight: 0.15,
      h2h_weight: 0.1,
      form_weight: 0.1,
      fatigue_weight: 0.05,
      injury_weight: 0.02,
      last_updated: now,
      notes: 'Seeded local weights',
    };
    this.modelWeightsData = [weights];
  }

  private createPlayer(data: Partial<Player>) {
    const now = new Date().toISOString();
    const player: Player = {
      id: data.id ?? this.generateId('player'),
      created_at: data.created_at ?? now,
      created_date: data.created_date ?? now,
      ...data,
    } as Player;
    this.playersData.unshift(player);
    return this.clone(player);
  }

  private createMatch(data: Partial<Match>) {
    const now = new Date().toISOString();
    const match: Match = {
      id: data.id ?? this.generateId('match'),
      created_at: data.created_at ?? now,
      surface: data.surface ?? 'hard',
      tournament_name: data.tournament_name ?? 'Local Tournament',
      round: data.round ?? 'R16',
      best_of: data.best_of ?? 3,
      status: data.status ?? 'scheduled',
      utc_start: data.utc_start ?? now,
      ...data,
    } as Match;
    this.matchesData.unshift(match);
    return this.clone(match);
  }

  private createPrediction(data: Partial<Prediction>) {
    const now = new Date().toISOString();
    const prediction: Prediction = {
      id: data.id ?? this.generateId('prediction'),
      created_at: data.created_at ?? now,
      created_date: data.created_date ?? now,
      confidence_level: data.confidence_level ?? 'medium',
      key_factors: data.key_factors ?? this.sampleKeyFactors(data.model_type),
      was_correct: data.was_correct ?? Math.random() > 0.5,
      ...data,
    } as Prediction;
    this.predictionsData.unshift(prediction);
    const match = this.matchesData.find((m) => m.id === prediction.match_id);
    if (match) {
      this.recordModelFeedbackFromPrediction(prediction, match);
    }
    return this.clone(prediction);
  }

  private createComplianceSource(data: Partial<ComplianceSource>) {
    const now = new Date().toISOString();
    const source: ComplianceSource = {
      id: data.id ?? this.generateId('compliance'),
      compliance_status: data.compliance_status ?? 'pending_review',
      last_reviewed: data.last_reviewed ?? now,
      ...data,
    } as ComplianceSource;
    this.complianceData.unshift(source);
    return this.clone(source);
  }

  private createModelWeights(data: Partial<ModelWeights>) {
    const now = new Date().toISOString();
    const weights: ModelWeights = {
      id: data.id ?? this.generateId('modelWeights'),
      last_updated: data.last_updated ?? now,
      ...data,
    } as ModelWeights;
    this.modelWeightsData.unshift(weights);
    return this.clone(weights);
  }

  private createModelFeedback(data: Partial<ModelFeedback>) {
    const now = new Date().toISOString();
    const feedback: ModelFeedback = {
      id: data.id ?? this.generateId('modelFeedback'),
      feedback_date: data.feedback_date ?? now,
      ...data,
    } as ModelFeedback;
    this.modelFeedbackData.unshift(feedback);
    return this.clone(feedback);
  }

  private createAlias(data: Partial<Avatar>) {
    const now = new Date().toISOString();
    const alias: Avatar = {
      id: data.id ?? this.generateId('alias'),
      ...data,
      created_at: now,
    };
    this.aliasData.unshift(alias);
    return this.clone(alias);
  }

  private updateEntity<T extends { id: string }>(collection: T[], id: string, data: Partial<T>) {
    const index = collection.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error('Entity not found');
    }
    collection[index] = { ...collection[index], ...data };
    return this.clone(collection[index]);
  }

  private removeEntity<T extends { id: string }>(collection: T[], id: string) {
    const index = collection.findIndex((item) => item.id === id);
    if (index !== -1) {
      collection.splice(index, 1);
    }
  }

  private updatePrediction(id: string, data: Partial<Prediction>) {
    const prediction = this.updateEntity(this.predictionsData, id, data);
    const match = this.matchesData.find((m) => m.id === prediction.match_id);
    if (match) {
      this.recordModelFeedbackFromPrediction(prediction, match);
    }
    return prediction;
  }

  private listItems<T>(items: T[], options?: string | ListOptions) {
    const normalized = this.normalizeListOptions(options);
    let result = this.applyFilters([...items], normalized.filters);
    result = this.applySort(result, normalized.sort);
    if (normalized.limit) {
      result = result.slice(0, normalized.limit);
    }
    return Promise.resolve(result.map((item) => this.clone(item)));
  }

  private normalizeListOptions(options?: string | ListOptions): ListOptions {
    if (!options) {
      return {};
    }
    if (typeof options === 'string') {
      return { sort: options };
    }
    return options;
  }

  private applyFilters<T>(items: T[], filters?: Record<string, any>) {
    if (!filters) return items;
    return items.filter((item) => {
      return Object.entries(filters).every(([key, value]) => {
        if (key === '$or' && Array.isArray(value)) {
          return value.some((condition) => this.matchesCondition(item, condition));
        }
        if (typeof value === 'object' && value !== null) {
          if (value.$contains) {
            const fieldValue = String((item as any)[key] ?? '').toLowerCase();
            return fieldValue.includes(String(value.$contains).toLowerCase());
          }
          if (Array.isArray(value.$in)) {
            return value.$in.includes((item as any)[key]);
          }
        }
        return (item as any)[key] === value;
      });
    });
  }

  private matchesCondition<T>(item: T, condition: Record<string, any>) {
    return Object.entries(condition).every(([key, value]) => {
      if (typeof value === 'object' && value !== null && value.$contains) {
        const fieldValue = String((item as any)[key] ?? '').toLowerCase();
        return fieldValue.includes(String(value.$contains).toLowerCase());
      }
      return (item as any)[key] === value;
    });
  }

  private applySort<T>(items: T[], sort?: string) {
    if (!sort) return items;
    const direction = sort.startsWith('-') ? -1 : 1;
    const key = sort.replace(/^[-+]/, '');
    return [...items].sort((a, b) => {
      const aValue = (a as any)[key];
      const bValue = (b as any)[key];
      if (aValue === bValue) return 0;
      if (aValue == null) return direction;
      if (bValue == null) return -direction;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return direction * aValue.localeCompare(bValue);
      }
      return direction * (aValue > bValue ? 1 : -1);
    });
  }

  private createPredictionsForMatch(match: Match) {
    const player1 = this.playersData.find((player) => player.id === match.player1_id);
    const player2 = this.playersData.find((player) => player.id === match.player2_id);
    if (!player1 || !player2) return;
    const predictions = generateAllPredictions(match, player1, player2);
    predictions.forEach((prediction) => {
      this.createPrediction({
        ...prediction,
        match_id: match.id,
        key_factors: this.sampleKeyFactors(prediction.model_type),
      });
    });
    const mlPrediction = generateMLPrediction(match, player1, player2);
    this.createPrediction({
      ...mlPrediction,
      match_id: match.id,
      key_factors: this.sampleKeyFactors(mlPrediction.model_type),
    });
  }

  private recordModelFeedbackFromPrediction(prediction: Prediction, match: Match) {
    this.modelFeedbackData.unshift({
      id: this.generateId('modelFeedback'),
      prediction_id: prediction.id,
      match_id: match.id,
      model_type: prediction.model_type,
      was_correct: prediction.was_correct,
      confidence_level: prediction.confidence_level,
      calibration_error: Math.round(Math.random() * 8),
      feedback_date: new Date().toISOString(),
      surface: match.surface,
      player1_id: match.player1_id,
      player2_id: match.player2_id,
      feature_snapshot: {
        ranking_delta:
          (prediction.player1_win_probability ?? 0) - (prediction.player2_win_probability ?? 0),
      },
    });
  }

  private sampleKeyFactors(modelType?: string) {
    const base = ['ranking', 'serve_quality', 'return_quality'];
    if (modelType === 'ml') {
      base.push('ml_features');
    }
    return base;
  }

  private generateId(type: keyof LocalDataClient['counters']) {
    this.counters[type] += 1;
    return `${type}-${this.counters[type]}`;
  }

  private clone<T>(value: T) {
    return JSON.parse(JSON.stringify(value));
  }
}

export const localDataClient = new LocalDataClient();
