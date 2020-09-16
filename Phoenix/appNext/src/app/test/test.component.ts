import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ValidationExtensions } from '../common/components/phx-form-control/validation.extensions';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.less']
})
export class TestComponent implements OnInit {

  public testForm: FormGroup;

  constructor(private formBuilder: FormBuilder) {
    this.testForm = formBuilder.group({
      firstInput: ['vasad', Validators.compose([
        ValidationExtensions.required('Dude, this is required!'),
        ValidationExtensions.custom(this.divisibleByTen, 'Divide by 10!')
      ])],
      secondInput: ['', Validators.compose([
        Validators.required,
        ValidationExtensions.custom(this.divisibleByTen, 'Divide by 10!')
      ])],
      thirdInput: ['', Validators.compose([
        Validators.required,
        this.divisibleByTen
      ])],
    });
  }

  divisibleByTen(control: FormControl) {
    return parseInt(control.value, 10) % 10 === 0 ? null : {
      divisibleByTen: true
    }
  }

  ngOnInit() {
  }

}
