export const environment = {
  production: true,
  isProduction: 'false',
  allowUnfinishedFeatures: false,
  apiUrl: 'http://zinc.flashbackoffice.com/api/',
  rollbar: {
    accessToken: '1ad0a540ce664047a1b2bb9764f447de',
    captureUncaught: true,
    captureUnhandledRejections: true,
    payload: {
      environment: 'zinc'
    }
  },
  gaTrackingId: 'UA-100117931-1',
  hotjarId: '',
  hotjarSV: '',
  fullStoryId: ''
};
