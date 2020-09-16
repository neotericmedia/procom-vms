import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentRuleComponent } from './document-rule.component';

describe('DocumentRuleComponent', () => {
  let component: DocumentRuleComponent;
  let fixture: ComponentFixture<DocumentRuleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentRuleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentRuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
