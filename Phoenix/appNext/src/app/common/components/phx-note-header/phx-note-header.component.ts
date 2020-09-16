import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NoteService } from '../../services/note.service';
import { StateService } from '../../state/service/state.service';
import { PhxNote } from '../../model/phx-note';
import { CommonService, PhxConstants } from '../../index';
import { getRouterState } from '../../state/router/reducer';


@Component({
  selector: 'app-phx-note-header',
  templateUrl: './phx-note-header.component.html',
  styleUrls: ['./phx-note-header.component.less']
})

export class PhxNoteHeaderComponent implements OnInit {

  @Input() entityTypeId: PhxConstants.EntityType;
  @Input() entityId: number;
  @Output() navigateToNote: EventEmitter<any>;
  @Input() showPreview: boolean = false;

  notes: Array<PhxNote>;
  dateArr: any[];
  readCount: number;
  itemcount: number;

  dateColumnFormat = this.commonService.ApplicationConstants.DateFormat.MMM_dd_yyyy;

  constructor(
    public commonService: CommonService,
    private noteService: NoteService,
    private stateService: StateService
  ) {
    this.navigateToNote = new EventEmitter();
    this.noteService.countEmit.subscribe(data => {
      this.readCount = data;
    });
  }

  ngOnInit() {
    this.stateService
      .selectOnAction(getRouterState).subscribe(() => {
      });
    this.getComments();
  }

  getComments() {
    return this.noteService.getNotes(this.entityTypeId, this.entityId).then(result => {
      const items = result.Items;
      this.notes = [];
      this.readCount = 0;
      this.itemcount = 0;

      items.forEach((item) => {
        this.notes.push(item);
        if (item.UnreadNote && !item.UnreadNote.IsRead) {
          this.readCount += 1;
        }

        this.notes.sort((val1, val2) => {
          return new Date(val2.CreatedDatetime).getTime() - new
            Date(val1.CreatedDatetime).getTime();
        });

        this.itemcount = this.notes.length;
      });
    });
  }

  NavigateToContactNotes() {
    this.navigateToNote.emit();
  }

  showNote() {
    this.showPreview = true;
  }
}
