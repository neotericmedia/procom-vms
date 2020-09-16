import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TurnoverFieldComponent } from './turnover-field.component';

describe('PtFieldViewComponent', () => {
  let component: TurnoverFieldComponent;
  let fixture: ComponentFixture<TurnoverFieldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TurnoverFieldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TurnoverFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
