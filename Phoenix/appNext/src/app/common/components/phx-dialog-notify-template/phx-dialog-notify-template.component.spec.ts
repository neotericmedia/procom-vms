import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhxDialogNotifyTemplateComponent } from './phx-dialog-notify-template.component';

describe('PhxDialogNotifyTemplateComponent', () => {
  let component: PhxDialogNotifyTemplateComponent;
  let fixture: ComponentFixture<PhxDialogNotifyTemplateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhxDialogNotifyTemplateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhxDialogNotifyTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
