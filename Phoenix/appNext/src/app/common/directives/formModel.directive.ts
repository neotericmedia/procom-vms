import { Directive, ElementRef, Input, OnInit, OnDestroy } from '@angular/core';
import { NgModel, NgForm } from '@angular/forms';

@Directive({
  selector: '[phxFormModel]'
})
export class FormModelDirective implements OnInit, OnDestroy {

  private el: HTMLInputElement;

  @Input('phxFormModel') public phxFormModel: NgForm;
  @Input('registerModel') public registerModel: NgModel;
  @Input('ctrlName') public ctrlName: string;
  constructor(el: ElementRef) {
    this.el = el.nativeElement;
  }

  ngOnInit() {

    if (this.phxFormModel && this.registerModel) {
      this.el.name = this.ctrlName;
      this.phxFormModel.form.addControl(this.el.name, this.registerModel.control);
    }
  }

  ngOnDestroy() {
    if (this.phxFormModel && this.registerModel) {
      this.phxFormModel.form.removeControl(this.el.name);
    }
  }
}
