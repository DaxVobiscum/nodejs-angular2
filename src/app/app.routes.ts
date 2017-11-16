import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { AppNavigation } from './app.navigation';
import { AuthGuard } from './plugins/auth';

const appRoutes: Routes = [
    // { path: '', redirectTo: '/sign-in', pathMatch: 'full',  canActivate: [ AuthGuard ] }
    // { path: '', redirectTo: '/sign-in', pathMatch: 'full' }
    { path: '', component: AppNavigation, pathMatch: 'prefix', canActivate: [ AuthGuard ] }
];

export const appRoutingProviders: any [] = [
    
];

export const appRouting: ModuleWithProviders = RouterModule.forRoot(appRoutes);