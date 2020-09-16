import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentTypeRulesComponent } from './document-type-rules.component';

describe('DocumentTypeRulesComponent', () => {
  let component: DocumentTypeRulesComponent;
  let fixture: ComponentFixture<DocumentTypeRulesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentTypeRulesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentTypeRulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
