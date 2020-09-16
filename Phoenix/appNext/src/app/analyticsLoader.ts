import { environment } from '../environments/environment';

export function LoadAnalyticsScripts() {
    LoadGoogleAnalyticsScript();
    LoadHotjarScript();
    LoadFullStoryScript();
}

function LoadGoogleAnalyticsScript() {
    const gaTrackingId = environment.gaTrackingId;
    if (!!gaTrackingId) {
        const devMode = false; // environment.apiUrl.indexOf('localhost:') !== -1;
        const scriptSource = 'https://www.google-analytics.com/' + (devMode ? 'analytics_debug.js' : 'analytics.js');
        /*--Google Analytics --*/
        (function (i, s, o, g, r, a, m) {
            i['GoogleAnalyticsObject'] = r; i[r] = i[r] || function () {
                (i[r].q = i[r].q || []).push(arguments);
            }, i[r].l = 1 * <any>new Date(); a = s.createElement(o),
                m = s.getElementsByTagName(o)[0]; a.async = 1; a.src = g; m.parentNode.insertBefore(a, m);
        })(window, document, 'script', scriptSource, 'ga', undefined, undefined);
        (<any>window).ga('create', gaTrackingId, 'auto');
        /*--End Google Analytics --*/
    }
}

function LoadHotjarScript() {
    const hotjarId = environment.hotjarId;
    const hotjarSV = environment.hotjarSV;
    if (!!hotjarId && !!hotjarSV) {
        (function(h, o, t, j, a, r) {

            h.hj = h.hj || function() {(h.hj.q = h.hj.q || []).push(arguments); };

            h._hjSettings = {hjid: hotjarId, hjsv: hotjarSV};

            a = o.getElementsByTagName('head')[0];

            r = o.createElement('script'); r.async = 1;

            r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;

            a.appendChild(r);

        })(<any>window, document, 'https://static.hotjar.com/c/hotjar-', '.js?sv=');
    }
}

function LoadFullStoryScript(){
    const fullStoryId = environment.fullStoryId;
    if(!!fullStoryId){
        window['_fs_debug'] = false;
        window['_fs_host'] = 'fullstory.com';
        window['_fs_org'] = fullStoryId;
        window['_fs_namespace'] = 'FS';
        (function(m,n,e,t,l,o,g,y){
            if (e in m) {if(m.console && m.console.log) { m.console.log('FullStory namespace conflict. Please set window["_fs_namespace"].');} return;}
            g=m[e]=function(a,b){g.q?g.q.push([a,b]):g._api(a,b);};g.q=[];
            o=n.createElement(t);o.async=1;o.src='https://'+window['_fs_host']+'/s/fs.js';
            y=n.getElementsByTagName(t)[0];y.parentNode.insertBefore(o,y);
            g.identify=function(i,v){g(l,{uid:i});if(v)g(l,v)};g.setUserVars=function(v){g(l,v)};
            g.shutdown=function(){g("rec",!1)};g.restart=function(){g("rec",!0)};
            g.consent=function(a){g("consent",!arguments.length||a)};
            g.identifyAccount=function(i,v){o='account';v=v||{};v.acctId=i;g(o,v)};
            g.clearUserCookie=function(){};
        })(window,document,window['_fs_namespace'],'script','user');
    }
}
