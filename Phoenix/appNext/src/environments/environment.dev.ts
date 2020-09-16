export const environment = {
  production: true,
  isProduction: 'false',
  allowUnfinishedFeatures: true,
  apiUrl: 'http://dev.flashbackoffice.com/blueapi/',
  rollbar: {
    accessToken: '1ad0a540ce664047a1b2bb9764f447de',
    captureUncaught: true,
    captureUnhandledRejections: true,
    payload: {
      environment: 'dev'
    }
  },
  gaTrackingId: '',
  hotjarId: '',
  hotjarSV: '',
  fullStoryId: '',
  allowDuplicateSIN: true
};
