import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhxWorkflowButtonsComponent } from './phx-workflow-buttons.component';

describe('PhxWorkflowButtonsComponent', () => {
  let component: PhxWorkflowButtonsComponent;
  let fixture: ComponentFixture<PhxWorkflowButtonsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhxWorkflowButtonsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhxWorkflowButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
