import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WcbSubdivisionSearchComponent } from './wcb-subdivision-search.component';

describe('WcbSubdivisionSearchComponent', () => {
  let component: WcbSubdivisionSearchComponent;
  let fixture: ComponentFixture<WcbSubdivisionSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WcbSubdivisionSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WcbSubdivisionSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
