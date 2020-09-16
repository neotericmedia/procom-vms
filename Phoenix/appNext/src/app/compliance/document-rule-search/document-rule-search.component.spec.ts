import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentRuleSearchComponent } from './document-rule-search.component';

describe('DocumentRuleSearchComponent', () => {
  let component: DocumentRuleSearchComponent;
  let fixture: ComponentFixture<DocumentRuleSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentRuleSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentRuleSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
