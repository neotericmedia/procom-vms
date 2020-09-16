import { Component, OnInit, EventEmitter, Input, Output, ViewChild, OnDestroy, OnChanges } from '@angular/core';
import { PhxDialogComponentConfigModel, PhxDialogComponentEventEmitterInterface, PhxDialogComponentConfigModelButton } from './phx-dialog.component.model';
import { CodeValueService } from '../../services/code-value.service';
import { CommonService } from '../../services/common.service';

@Component({
  selector: 'app-phx-dialog',
  templateUrl: './phx-dialog.component.html',
  styleUrls: ['./phx-dialog.component.less']
})
export class PhxDialogComponent implements OnInit, OnDestroy {
  @Input()
  config: PhxDialogComponentConfigModel;
  @Output()
  onCallBack: EventEmitter<PhxDialogComponentEventEmitterInterface> = new EventEmitter();
  @ViewChild('phxDialogComponent')
  phxDialogComponent: any;
  isValidDate = false;
  terminationReasons: any = [];
  codeValueGroups: any;

  constructor(private codeValueService: CodeValueService, private commonservice: CommonService) {}
  public ngOnInit() {}
  public ngOnDestroy() {}

  public open() {
    this.phxDialogComponent.show();
  }

  public close() {
    this.phxDialogComponent.hide();
  }

  public onButtonClick(button: PhxDialogComponentConfigModelButton) {
    this.phxDialogComponent.hide();
    const callBackObj: PhxDialogComponentEventEmitterInterface = {
      buttonId: button.Id,
      config: this.config
    };
    if (button.ClickEvent != null) {
      button.ClickEvent(callBackObj);
    } else if (this.onCallBack != null) {
      this.onCallBack.emit(callBackObj);
    }
  }

  public isValidChangeHandler($event) {
    this.isValidDate = $event;
  }

}
