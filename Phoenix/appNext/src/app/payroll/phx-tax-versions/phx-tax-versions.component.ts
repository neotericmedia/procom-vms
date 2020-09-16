import { Component, OnInit, OnChanges, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { PhxConstants, CommonService, CodeValueService } from '../../common/index';

@Component({
  selector: 'app-phx-tax-versions',
  templateUrl: './phx-tax-versions.component.html',
  styleUrls: ['./phx-tax-versions.component.less']
})

export class PhxTaxVersionsComponent implements OnInit, OnChanges {

  @Input() taxVersions;
  @Input() currentVersionId: number;
  @Input() editable: boolean;
  @Output() selectedTaxVersion: EventEmitter<any> = new EventEmitter<any>();
  phxTaxVersions: any[] = [];
  applicationConstants: any;
  phxConstants: any;
  codeValueGroups: any;

  constructor(private commonService: CommonService,
    private codeValueService: CodeValueService) {
  }

  ngOnInit() {
    this.codeValueGroups = this.commonService.CodeValueGroups;
    this.phxConstants = PhxConstants;
  }

  onVersionClick(version: any) {
    if (this.editable && this.currentVersionId !== version.Id) {
      this.commonService.logWarning('Option to change version is disabled in "Edit" mode');
    } else {
      this.currentVersionId = version.Id;
      this.selectedTaxVersion.emit(version);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['taxVersions'] && changes['taxVersions'].currentValue != null) {
      this.phxTaxVersions = changes['taxVersions'].currentValue;
    }

    if (changes['currentVersionId']) {
      this.currentVersionId = changes['currentVersionId'].currentValue;
    }
  }

  getSalesTaxStatus(id: number) {
    return (this.codeValueService.getCodeValue(id, 'payroll.CodeTaxVersionStatus')).text;
  }
}
