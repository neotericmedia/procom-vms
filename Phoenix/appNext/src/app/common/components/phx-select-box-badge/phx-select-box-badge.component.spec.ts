import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhxSelectBoxBadgeComponent } from './phx-select-box-badge.component';

describe('PhxSelectBoxBadgeComponent', () => {
  let component: PhxSelectBoxBadgeComponent;
  let fixture: ComponentFixture<PhxSelectBoxBadgeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhxSelectBoxBadgeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhxSelectBoxBadgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
