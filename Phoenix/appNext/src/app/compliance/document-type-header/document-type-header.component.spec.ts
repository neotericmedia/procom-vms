import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentTypeHeaderComponent } from './document-type-header.component';

describe('DocumentTypeHeaderComponent', () => {
  let component: DocumentTypeHeaderComponent;
  let fixture: ComponentFixture<DocumentTypeHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentTypeHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentTypeHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
