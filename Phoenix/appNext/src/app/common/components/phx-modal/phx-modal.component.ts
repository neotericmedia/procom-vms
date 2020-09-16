import { Component, OnInit, Input, ViewChild, TemplateRef, Output, EventEmitter, OnChanges, SimpleChange, SimpleChanges, HostListener } from '@angular/core';
import { PhxButton } from '../../../common/model';
import { BsModalService, BsModalRef, ModalOptions } from 'ngx-bootstrap/modal';
import { createInjector } from '@angular/core/src/view/refs';
import { PhxConstants } from '../..';

@Component({
  selector: 'app-phx-modal',
  templateUrl: './phx-modal.component.html',
  styleUrls: ['./phx-modal.component.less']
})
export class PhxModalComponent implements OnInit, OnChanges {
  @ViewChild('itemModal') itemModal: any;
  @Input() buttons: PhxButton[] = [];
  @Input() title: string;
  @Input() showCloseButton: boolean = true;
  @Input() cssClass: string;
  @Input() fullScreen: boolean = false;

  @Output() closeModal: EventEmitter<any> = new EventEmitter();

  modalRef: BsModalRef;
  isVisible: boolean;

  isMobile = false;
  @HostListener('window:resize', ['$event']) onResize(event) {
    this.isWindowMobileSize(event.target);
  }

  isWindowMobileSize(window) {
    this.isMobile = window.innerWidth < PhxConstants.MOBILE_WIDTH;
  }

  private modalConfig: ModalOptions = {
    backdrop: 'static',
    keyboard: true,
    class: 'responsive-modal modal-md ',
  };

  constructor(private modalService: BsModalService) { }

  ngOnInit() {
    this.isWindowMobileSize(window);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.cssClass) {
      if (changes.cssClass.currentValue && changes.cssClass.currentValue !== '') {
        this.addClassToConfig(changes.cssClass.currentValue);
      } else if (changes.cssClass.previousValue && changes.cssClass.previousValue !== '') {
        this.removeClassFromConfig(changes.cssClass.previousValue);
      }
    }
  }

  addClassToConfig(cssClass: string) {
    if (!this.modalConfig.class.includes(cssClass)) {
      this.modalConfig.class += ` ${cssClass}`;
    }
  }

  removeClassFromConfig(cssClass: string) {
    if (this.modalConfig.class.includes(cssClass)) {
      this.modalConfig.class.replace(cssClass, '');
    }
  }

  setModalClasses() {
    if (this.fullScreen === true) {
      this.addClassToConfig('phx-full-screen-modal');
      this.removeClassFromConfig('phx-modal');
    } else {
      this.removeClassFromConfig('phx-full-screen-modal');
      this.addClassToConfig('phx-modal');
    }
  }

  show() {
    this.setModalClasses();
    this.modalRef = this.modalService.show(this.itemModal, this.modalConfig);
    this.isVisible = true;
  }

  hide() {
    this.modalRef.hide();
    this.closeModal.emit();
    this.isVisible = false;
  }

}
