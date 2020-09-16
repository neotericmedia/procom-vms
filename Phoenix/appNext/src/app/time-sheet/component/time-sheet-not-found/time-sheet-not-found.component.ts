import { PhxLocalizationService } from './../../../common/services/phx-localization.service';
import { TimeSheetService } from './../../service/time-sheet.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { PhxInterceptPanelButtonModel, PhxInterceptPanelType } from '../../../common/model/index';

@Component({
  selector: 'app-time-sheet-not-found',
  templateUrl: './time-sheet-not-found.component.html',
  styleUrls: ['./time-sheet-not-found.component.less']
})
export class TimeSheetNotFoundComponent implements OnInit {
  private timeSheetId: number;

  navButton: PhxInterceptPanelButtonModel =  {
    ActionEventName: 'continue',
    DisplayText: 'common.generic.continu',
    ClassName : 'btn btn-primary',
    IsDisabled: false
  };

  PhxInterceptPanelType: typeof PhxInterceptPanelType = PhxInterceptPanelType;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private localizationService: PhxLocalizationService
  ) { }

  ngOnInit() {
    this.applyLocalization();
  }

  applyLocalization() {
    this.navButton.DisplayText = this.localizationService.translate(this.navButton.DisplayText);
  }

  onGoToList(actionEventName: string) {
    this.navButton.IsDisabled = true;
    this.goToList();
  }

  goToList() {
    this.router.navigate(['./search'], { relativeTo: this.activatedRoute.parent })
    .catch((err) => {
      console.error(`error navigating to search`, err);
    });
  }
}
