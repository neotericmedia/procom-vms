import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentTypeSearchComponent } from './document-type-search.component';

describe('DocumentTypeSearchComponent', () => {
  let component: DocumentTypeSearchComponent;
  let fixture: ComponentFixture<DocumentTypeSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentTypeSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentTypeSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
