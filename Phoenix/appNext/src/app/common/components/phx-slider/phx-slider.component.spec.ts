import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhxSliderComponent } from './phx-slider.component';

describe('PhxSliderComponent', () => {
  let component: PhxSliderComponent;
  let fixture: ComponentFixture<PhxSliderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhxSliderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhxSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
