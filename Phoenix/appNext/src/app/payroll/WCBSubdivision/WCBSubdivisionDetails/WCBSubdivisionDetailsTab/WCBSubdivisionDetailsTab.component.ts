import { Component, OnInit, Inject, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import * as _ from 'lodash';

@Component({
  selector: 'app-WCBSubdivisionDetailsTab',
  templateUrl: './WCBSubdivisionDetailsTab.component.html',
  styleUrls: ['./WCBSubdivisionDetailsTab.component.css'],
})
export class WCBSubdivisionDetailsTabComponent implements OnInit, OnDestroy {



  @Input() workerCompensations: any[];
  availableWorkerCompensations: any[];
  @Input() selectableWorkerCompensations: any[];
  workflowAvailableActions: any[];
  ApplicationConstants: any;
  isWorkflowSceduleChange: boolean;
  hasModifyAccess: boolean;
  @Input() wcb: any;
  @Input() parentForm: NgForm;
  @Input() editMode: boolean;
  @Input() selectedVersion: any;
  @Input() waitCounter: any;
  @Input() validationMessages: any;
  @Input() versionId: number;
  @Output() wcbChange = new EventEmitter();
  @Output() selectedVersionChange = new EventEmitter();
  @Output() editModeChange = new EventEmitter();

  constructor(
  ) {
    this.editMode = false;
  }

  updateParent() {
    this.wcbChange.emit(this.wcb);
    this.editModeChange.emit(this.editMode);
    this.selectedVersionChange.emit(this.selectedVersion);

  }

  ngOnInit() {

  }


  changeClassifiaction(e, d) {
    if (this.workerCompensations && d.WorkerCompensationId > 0) {
      d.WorkerCompensation = this.workerCompensations.find(wc => wc.Id === d.WorkerCompensationId);
      this.setSelectableWorkerCompensations();
    }
  }
  getTics() {
    return (new Date()).getTime().toString();

  }
  canChooseClassification(d): boolean {
    // only if the classification is still active
    let canChange = false;

    if (d.WorkerCompensationId && d.WorkerCompensationId > 0 && this.workerCompensations) {
      canChange = (typeof (this.workerCompensations.find(wc => wc.Id === d.WorkerCompensationId)) !== 'undefined');
    }

    return this.editMode && ((!d.WorkerCompensationId || d.WorkerCompensationId === 0) || ((d.Id === 0 || !d.id) && (this.selectedVersion.WCBSubdivisionDetail.length === 1 && canChange)) && <any>this.selectableWorkerCompensations);
    // (!(d.Id > 0) && this.selectedVersion.WCBSubdivisionDetail.length==1) && !(this.versionId > 0 && d.WorkerCompensationId > 0)
  }


  changeProfiles(e, pt, i) {
    pt.IsDeleted = (pt.Id > 0 && !pt.IsSelected);


  }

  setSelectableWorkerCompensations() {
    this.selectableWorkerCompensations =
      this.selectedVersion.WCBSubdivisionDetail.length === 1
        ?
        this.workerCompensations
        :
        _.difference(this.workerCompensations, this.workerCompensations.filter(item => this.selectedVersion.WCBSubdivisionDetail.some(d => d.WorkerCompensationId === item.Id)));

  }



  showWait() {
    this.validationMessages = this.waitCounter > 0 ? null : this.validationMessages;
    // fix me
    // this.$rootScope.activateGlobalSpinner = this.waitCounter > 0;
  }

  removeDetail(d) {
    const indx = this.selectedVersion.WCBSubdivisionDetail.indexOf(d);
    this.selectedVersion.WCBSubdivisionDetail.splice(indx, 1);
    this.setSelectableWorkerCompensations();
  }


  ngOnDestroy() {
  }
}
