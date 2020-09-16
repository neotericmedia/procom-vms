import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhxStateActionButtonsComponent } from './phx-state-action-buttons.component';

describe('PhxStateActionDropdownComponent', () => {
  let component: PhxStateActionButtonsComponent;
  let fixture: ComponentFixture<PhxStateActionButtonsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhxStateActionButtonsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhxStateActionButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
