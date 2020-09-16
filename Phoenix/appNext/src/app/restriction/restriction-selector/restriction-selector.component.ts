import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter, ViewChild } from '@angular/core';
import { RestrictionSelectorType } from '../share/index';
import { PhxSelectBoxComponent } from '../../common/components/phx-select-box/phx-select-box.component';

@Component({
  selector: 'app-restriction-selector',
  templateUrl: './restriction-selector.component.html',
  styleUrls: ['./restriction-selector.component.less']
})
export class RestrictionSelectorComponent implements OnInit, OnChanges {

  @Input() restrictionSelectorType: RestrictionSelectorType = RestrictionSelectorType.Dropdown;
  @Input() labelText: string = 'Restriction';

  @Input() items: Array<{ id: number, text: string }>;
  @Input() selectedItems: Array<number>;

  @ViewChild('select') select: PhxSelectBoxComponent;

  dropdownItems: any[];
  checkboxItems: any[];
  selectedItemsWithText: Array<{ id: number, text: string }> = [];
  restrictionSelectorTypeEnum = RestrictionSelectorType;

  constructor(
  ) { }

  ngOnInit() {

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.items || changes.selectedItems) {
      if (this.restrictionSelectorType === RestrictionSelectorType.Dropdown) {
        this.generateDropdownItems();
      } else if (this.restrictionSelectorType === RestrictionSelectorType.Checkbox) {
        this.generateCheckboxItems();
      }
    }
  }

  generateDropdownItems() {
    if (this.items == null) {
      return;
    }

    this.dropdownItems = this.spreadAndSortArray(this.items);
    this.selectedItemsWithText = [];

    if (this.selectedItems == null) {
      return;
    }

    this.selectedItems.forEach(selectedItemId => {
      this.addItemToSelectedList(this.dropdownItems, selectedItemId);
      this.removeItemFromDropdownItems(selectedItemId);
    });

    this.selectedItemsWithText = this.spreadAndSortArray(this.selectedItemsWithText);
  }

  removeItemFromDropdownItems(id: number) {
    if (id !== null) {
      this.dropdownItems.splice(this.dropdownItems.findIndex(i => i.id === id), 1);

      // to force angular change detection work on array
      this.dropdownItems = this.spreadAndSortArray(this.dropdownItems);
    }
  }

  addDeletedItemToItemList(id: number) {
    if (id !== null) {
      this.selectedItemsWithText.splice(this.selectedItemsWithText.findIndex(i => i.id === id), 1);

      const idx = this.items.findIndex(i => i.id === id);
      if (idx !== -1) {
        this.dropdownItems.push(this.items[idx]);
      }

      // to force angular change detection work on array
      this.selectedItemsWithText = this.spreadAndSortArray(this.selectedItemsWithText);
      this.dropdownItems = this.spreadAndSortArray(this.dropdownItems);
    }
  }

  addItemToSelectedList(source: Array<{ id: number, text: string }>, id: number) {
    if (id !== null) {
      const idx = source.findIndex(i => i.id === id);
      if (idx !== -1) {
        this.selectedItemsWithText.push({ id: id, text: source[idx].text });
      }

      this.selectedItemsWithText = this.spreadAndSortArray(this.selectedItemsWithText);
    }
  }

  spreadAndSortArray(array: Array<any>): Array<any> {
    return [...array.sort((a, b) => {
      if (a.text < b.text) {
        return -1;
      }
      if (a.text > b.text) {
        return 1;
      }
      return 0;
    })];
  }

  dropdownChanged(id) {
    if (id) {
      this.addItemToSelectedList(this.dropdownItems, id);
      this.removeItemFromDropdownItems(id);
      this.select.clear();
    }
  }

  generateCheckboxItems() {
    if (this.items == null) {
      return;
    }

    this.checkboxItems = this.spreadAndSortArray(this.items);
    this.selectedItemsWithText = [];

    if (this.selectedItems == null) {
      return;
    }

    this.selectedItems.forEach(selectedItemId => {
      const idx = this.checkboxItems.findIndex(item => item.id === selectedItemId);
      if (idx != null && idx !== -1) {
        this.checkboxItems[idx].checked = true;
        this.addItemToSelectedList(this.checkboxItems, selectedItemId);
      }
    });

    this.checkboxItems = this.spreadAndSortArray(this.checkboxItems);
    this.selectedItemsWithText = this.spreadAndSortArray(this.selectedItemsWithText);
  }

  removeItemFromSelectedItemsWithText(id: number) {
    if (id !== null) {
      this.selectedItemsWithText.splice(this.selectedItemsWithText.findIndex(i => i.id === id), 1);

      // to force angular change detection work on array
      this.selectedItemsWithText = this.spreadAndSortArray(this.selectedItemsWithText);
    }
  }

  checkboxChanged(id: number, event) {
    if (event.target.checked === true) {
      this.addItemToSelectedList(this.checkboxItems, id);
    } else {
      this.removeItemFromSelectedItemsWithText(id);
    }
  }
}
