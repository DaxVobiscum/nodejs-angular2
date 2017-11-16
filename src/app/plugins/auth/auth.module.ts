import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule} from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AuthAlertService, AuthAlerts } from './auth.alerts';
import { AuthForm } from './auth.form';
import { AuthorizeLinkPipe } from './auth.pipes';
import { authRouting, authRoutingProviders } from './auth.routes';

@NgModule({
    imports: [ CommonModule, FormsModule, HttpModule, authRouting ],
    declarations: [ AuthAlerts, AuthForm, AuthorizeLinkPipe ],
    providers: [ AuthAlertService, authRoutingProviders ]
})
export class AuthModule { }