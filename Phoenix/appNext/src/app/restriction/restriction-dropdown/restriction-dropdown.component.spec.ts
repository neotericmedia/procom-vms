import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RestrictionDropdownComponent } from './restriction-dropdown.component';

describe('RestrictionDropdownComponent', () => {
  let component: RestrictionDropdownComponent;
  let fixture: ComponentFixture<RestrictionDropdownComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RestrictionDropdownComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RestrictionDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
