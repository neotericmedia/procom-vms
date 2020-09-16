import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DemoAttachmentsComponent } from './demo-attachments.component';

describe('DemoAttachmentsComponent', () => {
  let component: DemoAttachmentsComponent;
  let fixture: ComponentFixture<DemoAttachmentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DemoAttachmentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DemoAttachmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
