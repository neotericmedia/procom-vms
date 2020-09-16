import { Component, OnInit, EventEmitter, Output, Input, ElementRef, ViewChild } from '@angular/core';
import { PhxTextareaExpandingComponent } from '../../../common/components/phx-textarea-expanding/phx-textarea-expanding.component';

@Component({
  selector: 'app-time-sheet-notes-attachments-edit',
  templateUrl: './time-sheet-notes-attachments-edit.component.html',
  styleUrls: ['./time-sheet-notes-attachments-edit.component.less']
})
export class TimeSheetNotesAttachmentsEditComponent implements OnInit {

  @Output() udpatedNote: EventEmitter<string> = new EventEmitter();

  @Input() isEditable: boolean;
  @Input() noteText: string;
  @Input() noteLabel: string;
  @Input() maxLength: number;
  @ViewChild('noteTextarea') noteTextarea: PhxTextareaExpandingComponent;

  isEditing: boolean = false;

  constructor() { }

  ngOnInit() { }

  save() {

    this.isEditing = false;
      this.udpatedNote.emit(this.noteTextarea.textValue.trim());    // UI team confirmed to trim the spaces in the background
  }

  edit() {

    this.isEditing = true;
    this.noteTextarea.textValue = this.noteText;
    setTimeout(() => {

      this.noteTextarea.resizeTextarea();

    }, 100);

  }

  cancel() {

    this.isEditing = false;

  }

  clear() {

    this.isEditing = false;
    this.udpatedNote.emit(null);

  }

}
