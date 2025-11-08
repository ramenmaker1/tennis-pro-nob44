import { localDataClient } from '@/data/LocalClient';

export const base44 = {
  entities: {
    Player: localDataClient.players,
    Match: localDataClient.matches,
    Prediction: localDataClient.predictions,
    SourceCompliance: localDataClient.compliance,
    Alias: localDataClient.alias,
    ModelWeights: localDataClient.modelWeights,
    ModelFeedback: localDataClient.modelFeedback,
  },
  auth: localDataClient.auth,
  appLogs: localDataClient.appLogs,
};
