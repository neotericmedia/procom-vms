import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhxDialogWaitTemplateComponent } from './phx-dialog-wait-template.component';

describe('PhxDialogWaitTemplateComponent', () => {
  let component: PhxDialogWaitTemplateComponent;
  let fixture: ComponentFixture<PhxDialogWaitTemplateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhxDialogWaitTemplateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhxDialogWaitTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
