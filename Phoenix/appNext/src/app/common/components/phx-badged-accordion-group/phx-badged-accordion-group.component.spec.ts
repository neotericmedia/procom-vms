import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhxBadgedAccordionGroupComponent } from './phx-badged-accordion-group.component';

describe('PhxBadgedAccordionGroupComponent', () => {
  let component: PhxBadgedAccordionGroupComponent;
  let fixture: ComponentFixture<PhxBadgedAccordionGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhxBadgedAccordionGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhxBadgedAccordionGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
