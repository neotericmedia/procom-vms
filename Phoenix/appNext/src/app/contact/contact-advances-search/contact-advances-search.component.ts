import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { IProfile } from '../state';
import { PhxConstants } from '../../common';
import { PhxModalComponent } from '../../common/components/phx-modal/phx-modal.component';
import { ContactAdvancesComponent } from '../contact-advances/contact-advances.component';


@Component({
  selector: 'app-contact-advances-search',
  templateUrl: './contact-advances-search.component.html',
  styleUrls: ['./contact-advances-search.component.less']
})
export class ContactAdvancesSearchComponent implements OnInit {


  @Input() profile: IProfile;
  phxConstants: typeof PhxConstants = null;
  advanceId: number;
  @ViewChild('modalAdvanceEdit') modalAdvanceEdit: PhxModalComponent;
  @ViewChild('modalAdvanceAdd') modalAdvanceAdd: PhxModalComponent;
  @ViewChild('grid') grid: ContactAdvancesComponent;
  @Output() outputResponse = new EventEmitter();

  public modalFabButtons = null; // fix me
  constructor() {
    this.phxConstants = PhxConstants;
  }

  ngOnInit() {
    this.modalAdvanceEdit.addClassToConfig('modal-lg garnishee-modal');
    this.modalAdvanceAdd.addClassToConfig('modal-lg garnishee-modal');
  }

  onOutputEvent(id: number) {
     this.advanceId = id;
     this.modalAdvanceEdit.show();
  }

  onClickAddNewAdvance() {
     this.modalAdvanceAdd.show();
  }

  onOutputResponse() {
    this.refresh();
    this.outputResponse.emit();
  }

  public refresh() {
    this.grid.refresh();
  }
}
