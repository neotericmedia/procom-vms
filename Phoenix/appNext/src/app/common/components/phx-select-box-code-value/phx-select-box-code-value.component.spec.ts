import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhxSelectBoxCodeValueComponent } from './phx-select-box-code-value.component';

describe('PhxSelectBoxCodeValueComponent', () => {
  let component: PhxSelectBoxCodeValueComponent;
  let fixture: ComponentFixture<PhxSelectBoxCodeValueComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhxSelectBoxCodeValueComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhxSelectBoxCodeValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
