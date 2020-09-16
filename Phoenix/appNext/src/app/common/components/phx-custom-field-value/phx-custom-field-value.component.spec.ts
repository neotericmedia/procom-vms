import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhxCustomFieldValueComponent } from './phx-custom-field-value.component';

describe('PhxCustomFieldValueComponent', () => {
  let component: PhxCustomFieldValueComponent;
  let fixture: ComponentFixture<PhxCustomFieldValueComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhxCustomFieldValueComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhxCustomFieldValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
