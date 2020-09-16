import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhxDialogCommentTemplateComponent } from './phx-dialog-comment-template.component';

describe('PhxDialogCommentTemplateComponent', () => {
  let component: PhxDialogCommentTemplateComponent;
  let fixture: ComponentFixture<PhxDialogCommentTemplateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhxDialogCommentTemplateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhxDialogCommentTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
