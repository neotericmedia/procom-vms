import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhxResponsiveButtonsComponent } from './phx-responsive-buttons.component';

describe('PhxResponsiveButtonsComponent', () => {
  let component: PhxResponsiveButtonsComponent;
  let fixture: ComponentFixture<PhxResponsiveButtonsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhxResponsiveButtonsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhxResponsiveButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
