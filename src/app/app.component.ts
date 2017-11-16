import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/distinctUntilChanged';

import { AppNavigation } from './app.navigation';
import { AppService } from './app.service';

import { AuthNavigation } from './plugins/auth';

@Component({
    selector: "node-ng2",
    entryComponents: [ AppNavigation, AuthNavigation ],
    template: `
        <div class="container">
            <h1>NodeJS - Angular2</h1>
            <div class="row nav-height">
                <auth-navigation></auth-navigation>
            </div>
            <div class="row nav-height">
                <app-navigation></app-navigation>
            </div>
            <router-outlet></router-outlet>
        </div>
    `
})
export class AppComponent implements OnInit {
    
    constructor(private appService: AppService) { }
    
    ngOnInit() {
        
        // this.appService.addNavLinks([
        //     { href: '/home', text: 'Home', auth: false }
        // ]);
    }
}