import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhxDialogCommentComponent } from './phx-dialog-comment.component';

describe('PhxDialogCommentComponent', () => {
  let component: PhxDialogCommentComponent;
  let fixture: ComponentFixture<PhxDialogCommentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhxDialogCommentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhxDialogCommentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
