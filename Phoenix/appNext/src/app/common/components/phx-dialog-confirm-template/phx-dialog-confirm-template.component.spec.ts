import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhxDialogConfirmTemplateComponent } from './phx-dialog-confirm-template.component';

describe('PhxDialogConfirmTemplateComponent', () => {
  let component: PhxDialogConfirmTemplateComponent;
  let fixture: ComponentFixture<PhxDialogConfirmTemplateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhxDialogConfirmTemplateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhxDialogConfirmTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
