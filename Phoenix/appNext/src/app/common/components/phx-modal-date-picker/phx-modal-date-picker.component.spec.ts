import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhxModalDatePickerComponent } from './phx-modal-date-picker.component';

describe('PhxModalDatePickerComponent', () => {
  let component: PhxModalDatePickerComponent;
  let fixture: ComponentFixture<PhxModalDatePickerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhxModalDatePickerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhxModalDatePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
