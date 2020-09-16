import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountNotificationSettingsComponent } from './account-notification-settings.component';

describe('AccountNotificationSettingsComponent', () => {
  let component: AccountNotificationSettingsComponent;
  let fixture: ComponentFixture<AccountNotificationSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountNotificationSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountNotificationSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
