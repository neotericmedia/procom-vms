import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { IProfile } from '../state';
import { PhxConstants } from '../../common';
import { PhxModalComponent } from '../../common/components/phx-modal/phx-modal.component';
import { ContactGarnisheesComponent } from '../contact-garnishees/contact-garnishees.component';

@Component({
  selector: 'app-contact-garnishee-search',
  templateUrl: './contact-garnishee-search.component.html',
  styleUrls: ['./contact-garnishee-search.component.less']
})

export class ContactGarnisheeSearchComponent implements OnInit {

  @Input() profile: IProfile;
  phxConstants: typeof PhxConstants = null;
  garnisheeId: number;
  @ViewChild('modalGarnisheeEdit') modalGarnisheeEdit: PhxModalComponent;
  @ViewChild('modalGarnisheeNew') modalGarnisheeNew: PhxModalComponent;
  @ViewChild('grid') grid: ContactGarnisheesComponent;
  @Output() outputResponse = new EventEmitter();

  public modalFabButtons = null; // fix me

  constructor() {
    this.phxConstants = PhxConstants;
  }

  ngOnInit() {
    this.modalGarnisheeEdit.addClassToConfig('modal-lg garnishee-modal');
    this.modalGarnisheeNew.addClassToConfig('modal-lg garnishee-modal');
  }

  onOutputEvent(id: number) {
    this.garnisheeId = id;
    this.modalGarnisheeEdit.show();
  }

  onClickAddNewGarnishee() {
    this.modalGarnisheeNew.show();
  }

  onOutputResponse() {
    this.refresh();
    this.outputResponse.emit();
  }

  public refresh() {
    this.grid.refresh();
  }

}
