import { getCurrentClient } from '@/data/dataSourceStore';

<<<<<<< HEAD
const wrapService = (key) => ({
  list: (...args) => getCurrentClient()[key].list(...args),
  get: (...args) => getCurrentClient()[key].get?.(...args),
  create: (...args) => getCurrentClient()[key].create?.(...args),
  update: (...args) => getCurrentClient()[key].update?.(...args),
  remove: (...args) => getCurrentClient()[key].remove?.(...args),
=======
const { appId, serverUrl, token, functionsVersion } = appParams;

//Create a client with authentication required
export const base44 = createClient({
  appId,
  serverUrl,
  token,
  functionsVersion,
  requiresAuth: true
>>>>>>> 93b199770ad6bdfb6dd2756c9afae9a1983d3fde
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
