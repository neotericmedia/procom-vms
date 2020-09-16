export const environment = {
  production: true,
  isProduction: 'false',
  allowUnfinishedFeatures: false,
  apiUrl: 'https://staging.flexbackoffice.com/api/',
  rollbar: {
    accessToken: '',
    captureUncaught: true,
    captureUnhandledRejections: true,
    payload: {
      environment: 'staging'
    }
  },
  gaTrackingId: '',
  hotjarId: '',
  hotjarSV: '',
  fullStoryId: ''
};