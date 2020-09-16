import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewEmailInBrowserComponent } from './view-email-in-browser.component';

describe('ViewEmailInBrowserComponent', () => {
  let component: ViewEmailInBrowserComponent;
  let fixture: ComponentFixture<ViewEmailInBrowserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ViewEmailInBrowserComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewEmailInBrowserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
