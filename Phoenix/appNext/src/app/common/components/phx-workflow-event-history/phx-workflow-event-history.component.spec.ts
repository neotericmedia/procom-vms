/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PhxWorkflowEventHistoryComponent } from './phx-workflow-event-history.component';

describe('PhxWorkflowEventHistoryComponent', () => {
  let component: PhxWorkflowEventHistoryComponent;
  let fixture: ComponentFixture<PhxWorkflowEventHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhxWorkflowEventHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhxWorkflowEventHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
