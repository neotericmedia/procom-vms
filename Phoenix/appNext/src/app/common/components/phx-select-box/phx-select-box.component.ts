import { Component, OnInit, OnChanges, SimpleChanges, Input, EventEmitter, Output, forwardRef, ElementRef, NgZone, ViewChild, AfterContentInit, Inject, PLATFORM_ID, AfterViewInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DxComponent, DxTemplateHost, WatcherHelper, DxSelectBoxComponent } from 'devextreme-angular';
import { TransferState } from '@angular/platform-browser';

@Component({
  selector: 'app-phx-select-box',
  templateUrl: './phx-select-box.component.html',
  styleUrls: ['./phx-select-box.component.less'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => PhxSelectBoxComponent)
    }
  ]
})
export class PhxSelectBoxComponent extends DxComponent implements OnInit, OnChanges, ControlValueAccessor, AfterContentInit, AfterViewInit {
  @Input() items: any;
  @Input() placeholder: string;
  @Input() showClearButton: boolean = true;
  @Input() readOnly: boolean = false;
  @Input() disabled: boolean = false;
  @Input() searchable: boolean = true;
  @Input() acceptCustomValue: boolean = false;
  @Input() maxLength: number = null;
  @Input() textField: string;
  @Input() valueField: string;
  @Input() width: any; // "55px", "80%", "auto", "inherit" (default = undefined )
  @Input() itemTemplate: string = 'item-template';
  @Input() fieldTemplate: string = 'field-template';
  @Input() dropDownButtonTemplate: string = 'drop-down-button-template';
  @Input() dropdownWidth: any; // "55px", "80%", "auto", "inherit" (default = undefined )

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

  @Output() valueChanged: EventEmitter<any> = new EventEmitter();
  @Output() customItemCreating: EventEmitter<any> = new EventEmitter();

  @ViewChild('selectBox') selectBox: DxSelectBoxComponent;

  dataSource: any;

  constructor(
    private eRef: ElementRef
    , ngZone: NgZone
    , private templateHost: DxTemplateHost
    , private _watcherHelper: WatcherHelper
    , transferState: TransferState
    , @Inject(PLATFORM_ID) platformId: any
    ) {
    super(eRef, ngZone, templateHost, _watcherHelper, transferState, platformId);
  }

  _createInstance(element: any, options: any) {
    return this.selectBox.instance;
  }

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.items) {
      this.dataSource = {
        store: this.items || [],
        paginate: true
      };
    }
  }

  ngAfterContentInit(): void {
    if (this.templates) {
      const itemTemplates = this.templates.filter(t => t.name === this.itemTemplate);
      if (itemTemplates && itemTemplates.length) {
        this.selectBox.itemTemplate = itemTemplates[0];
      }

      const fieldTemplates = this.templates.filter(t => t.name === this.fieldTemplate);
      if (fieldTemplates && fieldTemplates.length) {
        this.selectBox.fieldTemplate = fieldTemplates[0];
      }

      const dropDownButtonTemplates = this.templates.filter(t => t.name === this.dropDownButtonTemplate);
      if (dropDownButtonTemplates && dropDownButtonTemplates.length) {
        this.selectBox.dropDownButtonTemplate = dropDownButtonTemplates[0];
      }
    }
  }

  ngAfterViewInit(): void {
    if (this.createInstanceOnInit) {
      this.selectBox.instance.endUpdate();
    }
  }

  writeValue(value: any) {
    this.value = value;
  }

  onChange = _ => {};

  onTouched = () => {};

  registerOnChange(fn) {
    this.onChange = fn;
  }

  registerOnTouched(fn) {
    this.onTouched = fn;
  }

  onValueChanged(event: any) {
    // event contains `value` and `previousValue`
    this.value = event.value;
    this.valueChanged.emit(event);
  }

  onCustomItemCreating(event: any) {
    this.customItemCreating.emit(event);
  }

  clear() {
    this.selectBox.value = undefined;
  }

  onOpened(event: any) {
    this.setCustomDropdownWidth(event);
  }

  private setCustomDropdownWidth(event: any) {
    setTimeout(() => {
      event.component._popup.option('width', this.dropdownWidth);
    });
  }
}
