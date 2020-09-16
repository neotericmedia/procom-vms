import { Component, ElementRef, Input, Output, Inject, EventEmitter, OnInit, SimpleChanges, OnChanges, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl } from '@angular/forms';
// HostListener

const noop = () => {
};

export const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => PhxSelectComponent),
  multi: true
};

@Component({
  selector: 'app-phx-select',
  templateUrl: './phx-select.component.html',
  styleUrls: ['./phx-select.component.less'],
  providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR]
})
export class PhxSelectComponent implements OnInit, OnChanges, ControlValueAccessor {

  private hasInited = false;
  private holdingUntilReadyActiveValue = null;
  private waitingForItemsToLoad = false;
  private firstWaitPassed = false;
  private lastKnownItems = null;
  private originalItems = null;
  @Input() items: any;
  @Input() active: any[] = null;
  @Input() allowclear: boolean = true;
  @Input() placeholder: String = '';
  @Input() disabled: boolean = false;
  @Input() multiple: boolean = false;
  @Input() customwidth: any = null;
  @Input() textField: string | (() => string);
  @Input() valueField: string | number | (() => string) = null;
  @Input() orderField: string = null;
  @Input() decreasingOrder: boolean = false;
  @Input() disabledSearch?: boolean = false;

  @Output() data: EventEmitter<any> = new EventEmitter<any>();
  @Output() selected: EventEmitter<any> = new EventEmitter();
  @Output() removed: EventEmitter<any> = new EventEmitter<any>();
  @Output() typed: EventEmitter<any> = new EventEmitter<any>();

  private _onTouchedCallback: () => void = () => { };
  private _onChangeCallback: (_: any) => void = (_: any) => { };

  constructor(private elRef: ElementRef) { }

  ngOnInit() {
    this.findTextIfOnlyIdWasProvided();
    this.hasInited = true;
  }

  getTextField(valueObj: any, item: any) {
    if (typeof valueObj === 'string') {
      return item[valueObj];
    } else if (typeof valueObj === 'function') {
      return valueObj(item);
    } else {
      return null;
    }
  }

  getValueField(valueObj: any, item: any) {
    if (typeof valueObj === 'string' || typeof valueObj === 'number') {
      return item[valueObj];
    } else if (typeof valueObj === 'function') {
      return valueObj(item);
    } else {
      return null;
    }
  }

  findTextIfOnlyIdWasProvided() {
    if (this.items && this.items !== this.lastKnownItems) {
      const returnList = [];
      this.originalItems = this.items;
      if (this.orderField === null) {
        for (let i = 0; i < this.items.length; i++) {
          returnList.push({ id: this.getValueField(this.valueField, this.items[i]), text: this.getTextField(this.textField, this.items[i]) });
        }
      } else {
        for (let i = 0; i < this.items.length; i++) {
          returnList.push({ id: this.getValueField(this.valueField, this.items[i]), text: this.getTextField(this.textField, this.items[i]), order: this.items[i][this.orderField] });
        }
      }
      this.items = returnList;
      this.lastKnownItems = returnList;
    }

    if (this.waitingForItemsToLoad === true) {
      this.waitingForItemsToLoad = false;
      if (this.holdingUntilReadyActiveValue != null) {
        this.active = this.holdingUntilReadyActiveValue;
      }
      this.firstWaitPassed = true;
    }

    if (this.active && this.items) {
      this.firstWaitPassed = true;
      // if only id was provided. Also take the text field from this.items
      let isFoundId = false;
      let isFoundText = false;
      // if no array with object was provided and only a string or number, then search for the text field.
      if (typeof this.active === 'number' || typeof this.active === 'string') {
        isFoundId = true;
        this.active = [{ id: this.active }];
      } else {
        isFoundId = this.active && this.active[0] && this.active[0].id && typeof this.active[0]['id'] !== 'undefined';
        isFoundText = this.active && this.active[0] && this.active[0].text && typeof this.active[0]['text'] !== 'undefined';
      }
      if (isFoundId && !isFoundText) {
        for (let t = 0; t < this.items.length; t++) {
          const idNumber = this.items[t].id;
          const activeNumber = this.active[0].id;
          if (idNumber === activeNumber) {
            // use objects parameters.
            this.active[0].text = this.items[t].text;
          }
        }
        if (this.orderField !== null) {
          this.items.sort(function (a, b) {
            if (this.decreasingOrder) {
              return b.order - a.order;
            } else {
              return a.order - b.order;
            }
          });
        }
        if (!this.active[0].text && this.active[0].text !== null) {
          this.active = [];
        }
      } else if (isFoundId && isFoundText && this.orderField && this.orderField !== null) {
        // if both fields are provided, then order them using the order by property.
        const returnItems = [];
        for (let y = 0; y < this.items.length; y++) {
          this.items[y].sortOrder = this.items[y][this.orderField];
          returnItems.push(this.items[y]);
        }
        returnItems.sort(function (a, b) {
          if (this.decreasingOrder) {
            return b.order - a.order;
          } else {
            return a.order - b.order;
          }
        });
        this.items = returnItems;
      }
    } else {
      if (!this.items && this.active) {
        if (this.firstWaitPassed === false) {
          this.holdingUntilReadyActiveValue = this.active;
          this.active = [];
          this.waitingForItemsToLoad = true;
        }
      }
    }

  }

  selectedActivity(value: any) {
    for (let y = 0; y < this.originalItems.length; y++) {
      if (this.getValueField(this.valueField, this.originalItems[y]) === value.id) {
        value.obj = this.originalItems[y];
      }
    }
    this.selected.emit(value);
    this._onChangeCallback(value);
  }

  dataActivity(value: any) {
    this.data.emit(value);
    this.addWidthContraint();
    this._onTouchedCallback();
  }

  removedActivity(value: any) {
    this.active = [];
    this.removed.emit(value);
    this._onTouchedCallback();
    this._onChangeCallback(null);
  }

  typedActivity(value: any) {
    this.typed.emit(value);
    this._onTouchedCallback();
  }

  addWidthContraint() {
    if (this.customwidth != null) {
      const allowClearSpan = this.elRef.nativeElement.querySelectorAll('.ui-select-container, .open');
      let allowClearSpanelement = null;
      if (typeof allowClearSpan !== 'undefined' && allowClearSpan.length !== 0) {
        allowClearSpanelement = allowClearSpan[0];
        allowClearSpanelement.style.width = this.customwidth;
      }
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.hasInited) {

      if (changes['active']) {
        this.findTextIfOnlyIdWasProvided();
        this._onChangeCallback(this.active);
      }

      if (changes['items']) {
        if (this.items) {
          this.findTextIfOnlyIdWasProvided();
        }
      }
    }
  }

  writeValue(selected: any): void {
    if (typeof selected === 'function') {
      console.log('Incorrect initialization for control!');
      return;
    }

    if (this.originalItems && this.originalItems.length) {
      if (this.valueField) {
        const selectedObject = this.originalItems.find(item => this.getValueField(this.valueField, item) === selected);
        if (selectedObject) {
          this.active = [selectedObject];
          if (this.textField) {
            this.active[0].text = this.getTextField(this.textField, this.active[0]);
          }
        }
      }
    }
  }

  registerOnChange(fn: any): void {
    this._onChangeCallback = fn;
  }

  registerOnTouched(fn: any): void {
    this._onTouchedCallback = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
