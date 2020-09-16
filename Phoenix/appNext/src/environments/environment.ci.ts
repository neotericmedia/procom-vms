export const environment = {
  production: true,
  isProduction: '#{isProduction}',
  allowUnfinishedFeatures: <string>'#{allowUnfinishedFeatures}' === 'true',
  apiUrl: '#{apiUrl}',
  rollbar: {
    accessToken: '#{Rollbar.FrontEndAccessToken}',
    captureUncaught: true,
    captureUnhandledRejections: true,
    payload: {
      environment: '#{Rollbar.Environment}'
    }
  },
  gaTrackingId: '#{gaTrackingId}',
  hotjarId: '#{hotjarId}',
  hotjarSV: '#{hotjarSV}',
  fullStoryId: '#{fullStoryId}',
  allowDuplicateSIN: <string> '#{allowDuplicateSIN}'  === 'true'
};
