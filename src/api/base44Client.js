import { getCurrentClient } from '@/data/dataSourceStore';

const wrapService = (key) => ({
  list: (...args) => getCurrentClient()[key].list(...args),
  get: (...args) => getCurrentClient()[key].get?.(...args),
  create: (...args) => getCurrentClient()[key].create?.(...args),
  update: (...args) => getCurrentClient()[key].update?.(...args),
  remove: (...args) => getCurrentClient()[key].remove?.(...args),
});

export const base44 = {
  entities: {
    Player: wrapService('players'),
    Match: wrapService('matches'),
    Prediction: wrapService('predictions'),
    SourceCompliance: wrapService('compliance'),
    Alias: wrapService('alias'),
    ModelWeights: wrapService('modelWeights'),
    ModelFeedback: wrapService('modelFeedback'),
  },
  auth: {
    me: (...args) => getCurrentClient().auth.me(...args),
    logout: (...args) => getCurrentClient().auth.logout(...args),
    redirectToLogin: (...args) => getCurrentClient().auth.redirectToLogin(...args),
  },
  appLogs: {
    logUserInApp: (...args) => getCurrentClient().appLogs.logUserInApp(...args),
  },
};
