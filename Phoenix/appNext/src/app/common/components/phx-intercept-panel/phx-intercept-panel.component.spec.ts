import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhxInterceptPanelComponent } from './phx-intercept-panel.component';

describe('PhxErrorPageComponent', () => {
  let component: PhxInterceptPanelComponent;
  let fixture: ComponentFixture<PhxInterceptPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhxInterceptPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhxInterceptPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
