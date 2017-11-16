import { NgModule }  from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { LocalStorageService } from 'angular2-localstorage/LocalStorageEmitter';

import { AppComponent } from './app.component';
import { AppNavigation } from './app.navigation';
import { appRouting, appRoutingProviders } from './app.routes';
import { AppService } from './app.service';
import { AuthGuard, AuthModule, AuthNavigation, AuthService } from './plugins/auth';
import { HomeModule } from './spaces/home';

@NgModule({
    imports: [ BrowserModule, appRouting, AuthModule, HomeModule ],
    declarations: [ 
        AppComponent, 
        AppNavigation,
        AuthNavigation
    ],
    providers: [
        AuthGuard, 
        AppService, 
        AuthService, 
        LocalStorageService, 
        appRoutingProviders 
    ],
    bootstrap: [ AppComponent ]
})

export class AppModule {  }