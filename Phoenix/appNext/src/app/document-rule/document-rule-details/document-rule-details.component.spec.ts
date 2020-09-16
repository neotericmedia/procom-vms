import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentRuleDetailsComponent } from './document-rule-details.component';

describe('DocumentRuleDetailsComponent', () => {
  let component: DocumentRuleDetailsComponent;
  let fixture: ComponentFixture<DocumentRuleDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentRuleDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentRuleDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
