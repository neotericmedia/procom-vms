import { Component, OnInit, Input, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-phx-textarea-expanding',
  templateUrl: './phx-textarea-expanding.component.html',
  styleUrls: ['./phx-textarea-expanding.component.less']
})
export class PhxTextareaExpandingComponent implements OnInit {

  @Input() isDisabled: boolean;
  @Input() textValue: string;
  @Input() placeHolder: string;
  @Input() maxLength: number;

  @ViewChild('phxTextareaExpanding') phxTextareaExpanding: ElementRef;
  @Output() udpatedText: EventEmitter<string> = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  update(updatedText?: string) {
    this.udpatedText.emit(updatedText);
    this.resizeTextarea();
  }

  resizeTextarea() {

    const textarea = <HTMLTextAreaElement>this.phxTextareaExpanding.nativeElement;

    const height = ( textarea.scrollHeight > 52 ) ?  textarea.scrollHeight : 52;

    textarea.style.overflow = 'hidden';

    textarea.style.height = height + 'px';
  }

}
