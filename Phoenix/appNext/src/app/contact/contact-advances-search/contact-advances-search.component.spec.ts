import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactAdvancesSearchComponent } from './contact-advances-search.component';

describe('ContactAdvancesSearchComponent', () => {
  let component: ContactAdvancesSearchComponent;
  let fixture: ComponentFixture<ContactAdvancesSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContactAdvancesSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactAdvancesSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
