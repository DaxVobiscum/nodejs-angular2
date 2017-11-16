import { Component, OnInit } from '@angular/core';

import { Observable } from 'rxjs/Observable';

import { User } from './../../plugins/auth';
import { AuthService } from './../../plugins/auth';

@Component({
    template: `
        <h2>Welcome Home</h2>
        <br />
        <div *ngIf="userLoggedIn">
            <span>You are logged in as:&nbsp;</span>
            <span>{{currentUser.username}}</span>
        </div>
    `
})
export class HomeComponent implements OnInit {
    
    userLoggedIn: boolean;
    
    currentUser: User;
    
    constructor(private authService: AuthService) { }
    
    ngOnInit() {
        
        let _self = this;
        
        this.authService.getUserLoggedIn()
            .subscribe(status => {
                
                _self.userLoggedIn = status;
                
                if (_self.userLoggedIn) {
                    
                    _self.currentUser = _self.authService.getCurrentUser();
                }
            });
        
        this.currentUser = this.authService.getCurrentUser();
    }
}