import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentTypeTemplatesComponent } from './document-type-templates.component';

describe('DocumentTypeTemplatesComponent', () => {
  let component: DocumentTypeTemplatesComponent;
  let fixture: ComponentFixture<DocumentTypeTemplatesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentTypeTemplatesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentTypeTemplatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
