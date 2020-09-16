import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommissionSearchTemplatesComponent } from './commission-search-templates.component';

describe('CommissionSearchTemplatesComponent', () => {
  let component: CommissionSearchTemplatesComponent;
  let fixture: ComponentFixture<CommissionSearchTemplatesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommissionSearchTemplatesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommissionSearchTemplatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
