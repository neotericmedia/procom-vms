export const environment = {
  production: true,
  isProduction: 'true',
  allowUnfinishedFeatures: false,
  apiUrl: 'https://www.flexbackoffice.com/api/',
  rollbar: {
    accessToken: '59accf7cf61943c4816d727bc64cc5be',
    captureUncaught: true,
    captureUnhandledRejections: true,
    payload: {
      environment: 'Production'
    }
  },
  gaTrackingId: '',
  hotjarId: '',
  hotjarSV: '',
  fullStoryId: ''
};
