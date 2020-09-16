import { UrlHandlingStrategy, RouteReuseStrategy, ActivatedRouteSnapshot, DetachedRouteHandle } from "@angular/router";
export class Ng1Ng2UrlHandlingStrategy implements UrlHandlingStrategy {
  shouldProcessUrl(url) {
    console.log(url);
    return true;
    //console.log('hii');
    //return url.toString().startsWith("/test");
  }

  extract(url) {
    return url;
  }

  merge(url, whole) {
    return url;
  }
}