import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentRuleHeaderComponent } from './document-rule-header.component';

describe('DocumentRuleHeaderComponent', () => {
  let component: DocumentRuleHeaderComponent;
  let fixture: ComponentFixture<DocumentRuleHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentRuleHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentRuleHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
