import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RestrictionSelectorComponent } from './restriction-selector.component';

describe('RestrictionSelectorComponent', () => {
  let component: RestrictionSelectorComponent;
  let fixture: ComponentFixture<RestrictionSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RestrictionSelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RestrictionSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
