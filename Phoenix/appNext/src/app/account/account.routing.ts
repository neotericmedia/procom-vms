import { AccountChangePasswordComponent } from './account-change-password/account-change-password.component';
import { PendingChangesGuard } from './../common/guards/pending-changes.guard';
import { AccountManageComponent } from './account-manage/account-manage.component';
import { RouterModule } from '@angular/router';
import { AccountPictureComponent } from './account-picture/account-picture.component';
import { ProfileSelectorComponent } from './profile-selector/profile-selector.component';

export const routing = RouterModule.forChild([
  { path: '', component: AccountManageComponent, pathMatch: 'full' },
  { path: 'manage', component: AccountManageComponent, pathMatch: 'full' }, // , canDeactivate: [PendingChangesGuard]}, // TODO: wait for fix routing form ng2 to ng1 or full ng2 migration
  { path: 'change-password', component: AccountChangePasswordComponent, pathMatch: 'full' }, // , canDeactivate: [PendingChangesGuard]}, // TODO: wait for fix routing form ng2 to ng1 or full ng2 migration
  { path: 'profile-picture', component: AccountPictureComponent, pathMatch: 'full' },
  { path: 'profile-selector', component: ProfileSelectorComponent, pathMatch: 'full'},
]);
