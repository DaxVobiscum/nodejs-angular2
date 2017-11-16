import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule} from '@angular/router';
import { AuthMode } from './auth.metadata';
import { AuthForm } from './auth.form';
import { AuthGuard } from './auth.guard';

const authRoutes: Routes = [
    { path: 'sign-in', component: AuthForm, data: { authMode: AuthMode.SignIn } },
    { path: 'sign-out', component: AuthForm, data: { authMode: AuthMode.SignOut } },
    { path: 'sign-up', component: AuthForm, data: { authMode: AuthMode.SignUp } }
];

export const authRoutingProviders: any [] = [
    
];

export const authRouting: ModuleWithProviders = RouterModule.forChild(authRoutes);