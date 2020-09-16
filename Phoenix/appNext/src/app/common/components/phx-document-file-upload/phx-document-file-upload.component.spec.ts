import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhxDocumentFileUploadComponent } from './phx-document-file-upload.component';

describe('PhxDocumentFileUploadComponent', () => {
  let component: PhxDocumentFileUploadComponent;
  let fixture: ComponentFixture<PhxDocumentFileUploadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhxDocumentFileUploadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhxDocumentFileUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
