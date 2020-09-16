import { Injectable, Inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

import { ApiService } from './api.service';
import { CommonService } from './common.service';

import { locale as dxLocale } from 'devextreme/localization';
import * as moment from 'moment';
import { AuthService } from './auth.service';
import { CodeValueService } from './code-value.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { UserInfo } from '../model';

@Injectable()
export class PhxLocalizationService {

    private defaultCultureId: number = 48;
    private currentLocale: string = 'en-CA';
    private translations: any = {};

    public onLangChanged: BehaviorSubject<string> = new BehaviorSubject<string>(this.currentLocale);

    constructor(
        private apiService: ApiService,
        // private authService: AuthService, // fix me
        private currencyPipe: CurrencyPipe
    ) {
        // const userSub = this.authService.getCurrentUser()
        //     .subscribe(currentUser => {
        //         const lang = this.getLangFromUser(currentUser);
        //         this.setLocale(lang);
        //         userSub.unsubscribe();
        //     },
        //     error => {
        //         console.log(error);
        //     });
    }

    public getLangFromCultureId(cultureId: number): string {
        let lang = 'en-CA';
        if (cultureId === 88) {
            lang = 'fr-CA';
        }
        return lang;
    }

    public getLangFromUser(user: UserInfo) {
        const cultureId = user && user['PreferredCultureId'] || this.defaultCultureId;
        let lang = 'en-CA';
        if (cultureId === 88) {
            lang = 'fr-CA';
        }
        return lang;
    }

    public get currentLang() {
        return this.currentLocale;
    }

    public setLocale(lang: string): void {
        if (lang !== this.currentLang) {
            this.currentLocale = lang;
            this.onLangChanged.next(lang);
            this.localizeThirdPartyModules(lang);
        }
    }

    public localizeThirdPartyModules(lang: string) {
        dxLocale(lang);         // devextreme
        moment.locale(lang);    // moment
    }

    private loadAllTranslations(language: string) {

        return new Promise((resolve, reject) => {

            this.apiService.query(`localization/${language}`, false)
                .then((response: any) => {
                    this.translations = response;
                    resolve(response);

                    console.log('all', JSON.stringify(response, null, '\t'));
                })
                .catch(ex => {
                    reject(ex);
                });
        });
    }

    private loadTranslationsForModule(language: string, moduleName: string) {

        return new Promise((resolve, reject) => {
            this.apiService.query(`localization/${language}/${moduleName}`, false)
                .then((response: any) => {
                    this.translations[moduleName] = response;
                    resolve(response);
                })
                .catch(ex => {
                    reject(ex);
                });
        });

    }

    private getTranslationForNodeList(translationKeyList: Array<string>) {

        let localTranslationsObj = window['PhxTranslations'] || this.getDefaultTranslateObj();
        let result = null;

        for (const node of translationKeyList) {
            if (localTranslationsObj.hasOwnProperty(node)) {
                localTranslationsObj = localTranslationsObj[node];
                if (node === translationKeyList[translationKeyList.length - 1]) {
                    result = localTranslationsObj;
                }
            } else {
                break;
            }
        }

        return result;
    }

    private getTranslation(key: string): string {

        const translationKeyList = key.split('.');

        const translation = this.getTranslationForNodeList(translationKeyList);

        if (translation === null) {
            return key;
        } else {

            return translation;
        }

    }

    public translate(key: string, ...substitutes: any[]) {
        if (!key) {
            return '';
        }

        let translated = this.getTranslation(key);

        if (substitutes) {

            for (let i = 0; i < substitutes.length; i++) {

                const tokenMarker: string = '\\{' + i.toString() + '\\}';
                translated = translated.replace(new RegExp(tokenMarker, 'g'), substitutes[i]);
            }

        }

        return translated;
    }

    // Format money by current locale, eg. currentLocale='fr-CA', $54000 will be 54 000,00$
    // currencyCode --- eg. input 'CAD' will display 54 000,00$CAD
    public formatMoney(val: number, currencyCode?: string) {
        return this.currencyPipe.transform(val, currencyCode, 'symbol', '1.2-2', this.currentLocale);
    }

    private getDefaultTranslateObj() {
        return {
            'common': {
                'generic': {
                    'loadingText': 'Please wait ...' // Veuillez patienter ...
                }
            }
        };
    }
}
