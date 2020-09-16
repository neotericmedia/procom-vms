import { Routes, RouterModule } from '@angular/router';


// common
import { PhxConstants } from './../common/index';
import { TemplateComponent } from './template/template.component';


const routes: Routes = [
  {
    path: '',
    redirectTo: 'search'
  },
  {
    path: ':module/:templateId/:tabId',
    component: TemplateComponent,
    pathMatch: 'full'
  },
];

export const TemplateRoutes = RouterModule.forChild(routes);

