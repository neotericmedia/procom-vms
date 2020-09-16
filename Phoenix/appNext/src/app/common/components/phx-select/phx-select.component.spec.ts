import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhxSelectComponent } from './phx-select.component';

describe('PhxSelectComponent', () => {
  let component: PhxSelectComponent;
  let fixture: ComponentFixture<PhxSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhxSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhxSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
