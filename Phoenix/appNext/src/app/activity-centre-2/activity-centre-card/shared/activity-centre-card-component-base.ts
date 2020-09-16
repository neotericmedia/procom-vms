import { Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { PhxConstants, PhxLocalizationService, CodeValueService, CommonService } from '../../../common';
import { Router, ActivatedRoute } from '@angular/router';
import { CardBase, ActivityCentreModuleResourceKeys } from './../../model';
import { BaseComponentOnDestroy } from '../../../common/state/epics/base-component-on-destroy';
import { CodeValueGroups } from '../../../common/model/phx-code-value-groups';
import { ActivityCentreApiServiceLocator } from './../../shared/activity-centre.api.service.locator';
import { UrlData } from '../../../common/services/urlData.service';

export abstract class ActivityCentreCardComponentBase extends BaseComponentOnDestroy implements OnChanges {

    @Input() cardInfo: CardBase;
    @Input() selectable: boolean = true;
    @Output() changeSelection = new EventEmitter<CardBase>();
    phxConstants: typeof PhxConstants;
    codeValueGroups: typeof CodeValueGroups;
    protected router: Router;
    protected localizationService: PhxLocalizationService;
    protected codeValueService: CodeValueService;
    protected urlData: UrlData;
    protected route: ActivatedRoute;
    protected commonService: CommonService;

    constructor() {
        super();
        this.phxConstants = PhxConstants;
        this.codeValueGroups = CodeValueGroups;
        this.commonService = ActivityCentreApiServiceLocator.injector.get<CommonService>(CommonService, null);
        this.route = ActivityCentreApiServiceLocator.injector.get<ActivatedRoute>(ActivatedRoute, null);
        this.urlData = ActivityCentreApiServiceLocator.injector.get<UrlData>(UrlData, null);
        this.router = ActivityCentreApiServiceLocator.injector.get<Router>(Router, null);
        this.localizationService = ActivityCentreApiServiceLocator.injector.get<PhxLocalizationService>(PhxLocalizationService, null);
        this.codeValueService = ActivityCentreApiServiceLocator.injector.get<CodeValueService>(CodeValueService, null);
    }

    abstract ngOnChanges(changes: SimpleChanges);

    // Do not remove the comments until next release
    selectCard(event: MouseEvent) {
        // this.cardInfo.selected = !this.cardInfo.selected;

        if (this.selectable) {
            // event.preventDefault();
            // this.changeSelection.emit(this.cardInfo);
        }
    }

    isMobilePlatform() {
        if (navigator.userAgent.match(/Android/i)
            || navigator.userAgent.match(/webOS/i)
            || navigator.userAgent.match(/iPhone/i)
            || navigator.userAgent.match(/iPad/i)
            || navigator.userAgent.match(/iPod/i)
            || navigator.userAgent.match(/BlackBerry/i)
            || navigator.userAgent.match(/Windows Phone/i)
        ) {
            return true;
        } else {
            return false;
        }
    }

    onPress(e) {
        if (this.isMobilePlatform()) {
            this.selectCard(e);
        }
    }

    navigate() {
        this.urlData.setUrl(window.location.hash.replace('#/', ''));

        if (!this.cardInfo.actionLink) {
            // TODO: Need translation
            this.commonService.logWarning('Unrecognized document');
            // this.commonService.logWarning(this.localizationService.translate(ActivityCentreModuleResourceKeys.messages.unrecognizeddocument));
            return;
        }

        this.router.navigateByUrl(this.cardInfo.actionLink).catch((reason) => {
            console.log(reason);
        });
    }

}
