import { NgModule } from '@angular/core';
import { HomeComponent } from './home.component';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PhxLocalizationService } from '../common/services/phx-localization.service';
import { AboutComponent } from './about.component';

const homeRoutes: Routes = [
    { path: '', component: HomeComponent, pathMatch: 'full' }
];
export const homeRouting = RouterModule.forChild(homeRoutes);

@NgModule({
    imports: [CommonModule, homeRouting],
    exports: [],
    declarations: [
        HomeComponent,
        AboutComponent // fix me
    ],
    providers: [PhxLocalizationService],
})

export class HomeModule { }

