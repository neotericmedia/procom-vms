import { Component, Input, HostBinding } from '@angular/core';
import { PhxAccordionGroupComponent } from '../phx-accordion-group/phx-accordion-group.component';

@Component({
  selector: 'app-phx-accordion',
  templateUrl: './phx-accordion.component.html',
  styleUrls: ['./phx-accordion.component.less']
})
export class PhxAccordionComponent {

  @Input() public closeOthers: boolean;

  protected groups: PhxAccordionGroupComponent[] = [];

  public closeOtherPanels(openGroup: PhxAccordionGroupComponent): void {
    if (!this.closeOthers) {
      return;
    }

    this.groups.forEach((group: PhxAccordionGroupComponent) => {
      if (group !== openGroup) {
        new Promise(null).then(() => {
          group.isOpen = false;
        });
      }
    });
  }

  public addGroup(group: PhxAccordionGroupComponent): void {
    this.groups.push(group);
  }

  public removeGroup(group: PhxAccordionGroupComponent): void {
    const index = this.groups.indexOf(group);
    if (index !== -1) {
      this.groups.splice(index, 1);
    }
  }
}
