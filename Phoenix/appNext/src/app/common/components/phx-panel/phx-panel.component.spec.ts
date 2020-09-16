import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhxPanelComponent } from './phx-panel.component';

describe('PhxPanelComponent', () => {
  let component: PhxPanelComponent;
  let fixture: ComponentFixture<PhxPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhxPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhxPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
