// (function (window) {
//     if (typeof window.angular == 'undefined') return;

//     angular.element(document).ready(
//     function () {
//         var initInjector = angular.injector(['ng', 'phoenixapi.service']);
//         var phoneixapi = initInjector.get('phoenixapi');
//         var phoneixauth = initInjector.get('phoenixauth');
//         var timeout = initInjector.get('$timeout');
//         var q = initInjector.get('$q');

//         if (!window.runAppNext) {
//             phoneixapi.query('code').then(function (rsp) {
//                 window.PhoenixCodeValues = rsp.Items;
//                 return phoneixauth.loadContext();
//             })
//                 .then(function (rsp) {
//                     timeout(function () { angular.bootstrap(document, ['Phoenix']); });
//                 });
//         }
//         else {
//             var lc = phoneixauth.loadContext();

//             var pcv = phoneixapi.query('code')
//                 .then(function (rsp) {
//                     window.PhoenixCodeValues = rsp.Items;
//                 });

//             q.all([lc, pcv])
//             .then(function () {
//                 console.log('bootstrapAppNext');
//                 window.bootstrapAppNext = true;
//             });
//         }
//     }
// );


// })(window);