import { Component, OnInit, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonService, PhxConstants } from '../../index';
import { NoteService } from '../../services/note.service';
import { StateService } from '../../state/service/state.service';
import {filter, clone, map} from 'lodash';
import { PhxNote } from '../../model/phx-note';
import { getRouterState } from '../../state/router/reducer';

@Component({
  selector: 'app-phx-notes',
  templateUrl: './phx-notes.component.html',
  styleUrls: ['./phx-notes.component.less']
})
export class PhxNotesComponent implements OnInit, OnChanges {

  @Input() entityTypeId: PhxConstants.EntityType;
  @Input() entityId: number;
  @Output() countUpdated = new EventEmitter<any>();
  @ViewChild('noteScroll') noteScroll: ElementRef;
  @Output() readCountNumber = new EventEmitter<any>();

  noteCount: number;
  isCritical: boolean = false;
  dataSourceUrl: string = '';
  criticalCount: number;
  readCount: number;
  note: string;
  unred: boolean = false;
  all: boolean = true;
  critical: boolean = false;
  itemcount: number;
  notes: Array<PhxNote>;
  notesCopy: any[];
  entity = { note: '', isCritical: false };

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public commonService: CommonService,
    private noteService: NoteService,
    private stateService: StateService
  ) { }

  ngOnInit() {
    this.stateService
      .selectOnAction(getRouterState).subscribe(x => {
      });

    this.getComments();
  }

  ngOnChanges(changes: SimpleChanges) {
  }

  getComments() {

    return this.noteService.getNotes(this.entityTypeId, this.entityId).then(result => {
      const items = result.Items;
      this.criticalCount = 0;
      this.readCount = 0;
      this.notes = [];
      this.itemcount = 0;
      items.forEach((item, index) => {

        if (!item.UnreadNote) {
          item.UnreadNote = {
            Id: 0,
            IsRead: false,
            NoteId: item.Id,
            LastModifiedDatetime: item.CreatedDatetime
          };
        }
        this.notes.push(item);
        this.notes.sort((val1, val2) => {
          return new Date(val2.CreatedDatetime).getTime() - new
            Date(val1.CreatedDatetime).getTime();
        });

        this.notesCopy = Object.assign({}, this.notes);
      });
      this.readCount = items.filter(a => !a.UnreadNote.IsRead).length;
      this.criticalCount = items.filter(a => a.IsCritical).length;
      this.itemcount = items.length;
      this.noteService.getCountEmit(this.readCount);
    });
  }

  addNote(comment, isCritical) {

    if (comment.trim().length === 0) {
      return;
    }
    this.noteService.saveNote({ EntityTypeId: this.entityTypeId, EntityId: this.entityId, Comment: comment, IsCritical: isCritical }).then(x => {
      this.notes = [];
      this.getComments();
      this.entity.note = '';
      this.entity.isCritical = false;
      this.countUpdated.emit();
    });
  }

  filterUnread() {
    const temp = map(this.notesCopy, clone);
    this.notes = filter(temp, (note) => { return !note.UnreadNote.IsRead; });
    const scrl = this.noteScroll;
    this.all = false;
    this.unred = true;
    this.critical = false;
  }

  filterCritical() {
    const temp = map(this.notesCopy, clone);
    this.notes = filter(temp, (note) => { return note.IsCritical; });
    this.all = false;
    this.unred = false;
    this.critical = true;
  }

  filterAll() {
    const temp = map(this.notesCopy, clone);
    this.notes = temp;
    this.all = true;
    this.unred = false;
    this.critical = false;
  }


  markCritical(note, isCritical) {
    const markCriticalCommand = {
      EntityTypeId: this.entityTypeId, EntityId: this.entityId, IsCritical: isCritical, NoteId: note.Id,
      LastModifiedDatetime: note.LastModifiedDatetime
    };
    this.noteService.markCritical(markCriticalCommand).then(result => {
      this.getComments();
      this.countUpdated.emit();
    });
  }

  markRead(note, isRead) {
    const markReadCommand = {
      NoteId: note.Id, LastModifiedProfileId: note.LastModifiedByProfileId, IsRead: isRead, Id: note.UnreadNote.Id,
      LastModifiedDatetime: note.UnreadNote.LastModifiedDatetime
    };
    this.noteService.markRead(markReadCommand).then(x => {
      this.getComments();
      this.countUpdated.emit();
    });
  }
}
