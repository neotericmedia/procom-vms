import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentTypeHistoryComponent } from './document-type-history.component';

describe('DocumentTypeHistoryComponent', () => {
  let component: DocumentTypeHistoryComponent;
  let fixture: ComponentFixture<DocumentTypeHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentTypeHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentTypeHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
