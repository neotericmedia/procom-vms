import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EppPendingReleaseComponent } from './epp-pending-release.component';

describe('EppPendingReleaseComponent', () => {
  let component: EppPendingReleaseComponent;
  let fixture: ComponentFixture<EppPendingReleaseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EppPendingReleaseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EppPendingReleaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
