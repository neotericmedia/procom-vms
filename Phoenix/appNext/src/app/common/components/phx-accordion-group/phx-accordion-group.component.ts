import { Component, OnInit, Input, Output, HostBinding, Inject, OnDestroy, EventEmitter } from '@angular/core';
import { PhxAccordionComponent } from '../phx-accordion/phx-accordion.component';

@Component({
  selector: 'app-phx-accordion-group',
  templateUrl: './phx-accordion-group.component.html',
  styleUrls: ['./phx-accordion-group.component.less'],
})
export class PhxAccordionGroupComponent implements OnInit, OnDestroy {

  @Input() public heading: string;
  @Input() public panelClass: string;
  @Input() public isDisabled: boolean;
  @Input() public showToggle: boolean = true;

  @HostBinding('class.panel-open')
  @Input()
  public get isOpen(): boolean {
    return this._isOpen;
  }
  @Output() isOpenChange = new EventEmitter();
  public set isOpen(value: boolean) {
    this._isOpen = value;
    this.isOpenChange.emit(this.isOpen);
    if (value) {
      this.accordion.closeOtherPanels(this);
    }
  }

  @Input() public showBorders: boolean = false;

  protected _isOpen: boolean;

  public constructor( private accordion: PhxAccordionComponent) {
  }

  public ngOnInit(): any {
    this.panelClass = this.panelClass || 'panel-default';
    this.accordion.addGroup(this);
  }

  public ngOnDestroy(): any {
    this.accordion.removeGroup(this);
  }

  public toggleOpen(event: Event): any {
    if (!this.isDisabled) {
      this.isOpen = !this.isOpen;
    }
  }
}
