import { Component, OnInit, Input, EventEmitter, Output, forwardRef, ElementRef, NgZone, ViewChild, AfterContentInit, Inject, PLATFORM_ID, AfterViewInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DxComponent, DxTemplateHost, WatcherHelper, DxTagBoxComponent } from 'devextreme-angular';
import { TransferState } from '@angular/platform-browser';
@Component({
  selector: 'app-phx-tag-box',
  templateUrl: './phx-tag-box.component.html',
  styleUrls: ['./phx-tag-box.component.less'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => PhxTagBoxComponent),
    }
  ]
})
export class PhxTagBoxComponent extends DxComponent implements OnInit, ControlValueAccessor, AfterContentInit, AfterViewInit {
  @Input() items: any;
  @Input() placeholder: string;
  @Input() dataSource: any;
  @Input() displayExpr: any;
  @Input() valueExpr: any;
  @Input() itemTemplate: string = 'item-template';
  @Input() fieldTemplate: string = 'field-template';
  @Input() tagTemplate: string = 'tag-template';
  @Input() showSelectionControls: boolean = false;
  @Input() searchEnabled: boolean = false;
  @Input() applyValueMode: string = 'useButtons';
  @Input() maxDisplayedTags: number;

  @Output() valueChanged: EventEmitter<any> = new EventEmitter();
  // tslint:disable-next-line:no-input-rename
  @Input('value') _value: any;
  get value() {
    return this._value;
  }
  set value(val) {
    this._value = val;
    this.onChange(val);
    this.onTouched();
  }

  @ViewChild('tagBox') tagBox: DxTagBoxComponent;
  constructor(
    private eRef: ElementRef
    , ngZone: NgZone
    , private templateHost: DxTemplateHost
    , private _watcherHelper: WatcherHelper
    , transferState: TransferState
    , @Inject(PLATFORM_ID) platformId: any
  ) {
    super(eRef, ngZone, templateHost, _watcherHelper, null, null);
  }

  _createInstance(element: any, options: any) {
    return this.tagBox.instance;
  }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    if (this.createInstanceOnInit) {
      this.tagBox.instance.endUpdate();
    }
  }

  ngAfterContentInit(): void {
    if (this.templates) {
      const itemTemplates = this.templates.filter(t => t.name === this.itemTemplate);
      if (itemTemplates && itemTemplates.length) {
        this.tagBox.itemTemplate = itemTemplates[0];
      }

      const fieldTemplates = this.templates.filter(t => t.name === this.fieldTemplate);
      if (fieldTemplates && fieldTemplates.length) {
        this.tagBox.fieldTemplate = fieldTemplates[0];
      }

      const tagTemplates = this.templates.filter(t => t.name === this.tagTemplate);
      if (tagTemplates && tagTemplates.length) {
        this.tagBox.tagTemplate = tagTemplates[0];
      }
    }
  }

  writeValue(value: any) {
    this.value = value;
  }

  onChange = (_) => { };

  onTouched = () => { };

  registerOnChange(fn) {
    this.onChange = fn;
  }

  registerOnTouched(fn) {
    this.onTouched = fn;
  }

  onValueChanged(event: any) {
    this.value = event.value;
    this.valueChanged.emit(event);
  }

  clear() {
    this.tagBox.value = undefined;
  }
}
