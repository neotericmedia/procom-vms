import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingSpinnerOverlayComponent } from './loading-spinner-overlay.component';

describe('LoadingSpinnerOverlayComponent', () => {
  let component: LoadingSpinnerOverlayComponent;
  let fixture: ComponentFixture<LoadingSpinnerOverlayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoadingSpinnerOverlayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadingSpinnerOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
