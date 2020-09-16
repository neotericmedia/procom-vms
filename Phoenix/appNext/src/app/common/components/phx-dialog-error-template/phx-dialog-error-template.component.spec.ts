import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhxDialogErrorTemplateComponent } from './phx-dialog-error-template.component';

describe('PhxDialogErrorTemplateComponent', () => {
  let component: PhxDialogErrorTemplateComponent;
  let fixture: ComponentFixture<PhxDialogErrorTemplateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhxDialogErrorTemplateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhxDialogErrorTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
