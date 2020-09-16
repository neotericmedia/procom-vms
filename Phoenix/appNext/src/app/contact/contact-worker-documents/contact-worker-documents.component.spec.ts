import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactWorkerDocumentsComponent } from './contact-worker-documents.component';

describe('ContactWorkerDocumentsComponent', () => {
  let component: ContactWorkerDocumentsComponent;
  let fixture: ComponentFixture<ContactWorkerDocumentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContactWorkerDocumentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactWorkerDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
