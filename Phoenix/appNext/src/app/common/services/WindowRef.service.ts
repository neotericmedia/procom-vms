import { Injectable } from '@angular/core';

function _window(): any {
    // return the global native browser window object
    return window;
}

@Injectable()
export class WindowRefService {
    get nativeWindow(): any {
        return _window();
    }

    openUrl(url: string, target: string = '_blank') {
        this.nativeWindow.open(url, target);
    }
}
