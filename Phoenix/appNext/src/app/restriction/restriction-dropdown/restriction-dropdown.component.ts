import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { RestrictionItem, RestrictionSelectorType } from '../share/index';
import { RestrictionSelectorComponent } from '../restriction-selector/restriction-selector.component';

@Component({
  selector: 'app-restriction-dropdown',
  templateUrl: './restriction-dropdown.component.html',
  styleUrls: ['./restriction-dropdown.component.less']
})
export class RestrictionDropdownComponent implements OnInit {

  @Input() editable: boolean = true;
  @Input() labelText: string = 'Restrictions';
  @Input() dropdownText: string = 'Add/Edit Restrictions';
  @Input() dropdowmitems: Array<RestrictionItem> = [];

  @Input() items: Array<{ id: number, text: string, type: RestrictionSelectorType }>;
  @Input() selectedItems: Array<number>;
  @Output() restrictionItemClick: EventEmitter<RestrictionItem> = new EventEmitter<RestrictionItem>();
  @Output() selectedItemsChanged: EventEmitter<{ restirctionItem: RestrictionItem, selectedItems: Array<{ id: number, text: string }> }> = new EventEmitter<{ restirctionItem: RestrictionItem, selectedItems: Array<{ id: number, text: string }> }>();

  @ViewChild('itemModal') itemModal: any;
  @ViewChild('restrictionSelector') restrictionSelector: RestrictionSelectorComponent;

  selectedRestriction: RestrictionItem;

  constructor() { }

  ngOnInit() {
  }

  itemClick(item: RestrictionItem) {
    this.restrictionItemClick.emit(item);
    this.selectedRestriction = item;

    if (this.items === undefined) {
      this.items = [];
    }

    this.selectedItems = [];
    this.itemModal.show();
  }

  close() {
    this.itemModal.hide();
  }

  cancel() {
    this.itemModal.hide();
  }

  ok() {
    this.itemModal.hide();
    this.selectedItemsChanged.emit({ restirctionItem: this.selectedRestriction, selectedItems: this.restrictionSelector.selectedItemsWithText });
  }

  public openRestrictionSelector(id: number) {
    const item = this.dropdowmitems.find((i) => i.id === id);
    if (item) {
      this.itemClick(item);
    }
  }
}
