import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DemoLocalizationComponent } from './demo-localization.component';

describe('DemoLocalizationComponent', () => {
  let component: DemoLocalizationComponent;
  let fixture: ComponentFixture<DemoLocalizationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DemoLocalizationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DemoLocalizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
