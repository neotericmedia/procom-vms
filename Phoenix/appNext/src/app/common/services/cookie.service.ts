import { Injectable } from '@angular/core';
import { CookieService as NgxCookie } from 'ngx-cookie';

@Injectable()
export class CookieService {

  constructor(
    private ngxCookie: NgxCookie
  ) {}

  get CookieStore() {
    return 'phoenixCookie';
  }

  put(key, val) {
    this.ngxCookie.put(key, val);
  }

  getItem(sKey) {
    if (!sKey) { return null; }
    return decodeURIComponent(document.cookie.replace(new RegExp('(?:(?:^|.*;)\\s*' + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, '\\$&') + '\\s*\\=\\s*([^;]*).*$)|^.*$'), '$1')) || null;
  }

  setItem(sKey, sValue, vEnd, sPath, sDomain?: string, bSecure?: boolean) {
    if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return false; }
    let sExpires = '';
    if (vEnd) {
      switch (vEnd.constructor) {
        case Number:
          sExpires = vEnd === Infinity ? '; expires=Fri, 31 Dec 9999 23:59:59 GMT' : '; max-age=' + vEnd;
          break;
        case String:
          sExpires = '; expires=' + vEnd;
          break;
        case Date:
          sExpires = '; expires=' + vEnd.toUTCString();
          break;
      }
    }
    document.cookie = encodeURIComponent(sKey) + '=' + encodeURIComponent(sValue) + sExpires + (sDomain ? '; domain=' + sDomain : '') + (sPath ? '; path=' + sPath : '') + (bSecure ? '; secure' : '');
    return true;
  }

  removeItem(sKey, sPath, sDomain) {
    if (!this.hasItem(sKey)) { return false; }
    document.cookie = encodeURIComponent(sKey) + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT' + (sDomain ? '; domain=' + sDomain : '') + (sPath ? '; path=' + sPath : '');
    return true;
  }

  hasItem(sKey) {
    if (!sKey) { return false; }
    return (new RegExp('(?:^|;\\s*)' + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, '\\$&') + '\\s*\\=')).test(document.cookie);
  }

  keys() {
    const aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, '').split(/\s*(?:\=[^;]*)?;\s*/);
    for (let nLen = aKeys.length, nIdx = 0; nIdx < nLen; nIdx++) {
      aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]);
    }
    return aKeys;
  }

  getProfileIdFromCookie() {
    const defaultProfile: any = { profileId: -1, dbId: -1 };
    // Returns the deserialized value of given cookie key
    return this.ngxCookie.getObject(this.CookieStore || defaultProfile);
  }

  public getProfileIdString() {
    const profileObject: any = this.getProfileIdFromCookie();
    return profileObject ? 'DB_' + profileObject.dbId + '_PROFILE_' + profileObject.profileId : '';
  }

  public putObject(k, v) {
    return this.ngxCookie.putObject(k, v);
  }
}
