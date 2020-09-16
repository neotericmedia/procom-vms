import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhxSelectBoxComponent } from './phx-select-box.component';

describe('PhxSelectBoxComponent', () => {
  let component: PhxSelectBoxComponent;
  let fixture: ComponentFixture<PhxSelectBoxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhxSelectBoxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhxSelectBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
