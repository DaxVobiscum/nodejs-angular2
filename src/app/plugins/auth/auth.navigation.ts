import { Component, OnInit, OnDestroy } from '@angular/core';

import { AuthLinkVisibility, AuthLink, AuthLinkGroup } from './auth.metadata';
import { AuthService } from './auth.service';

@Component({
    selector: 'auth-navigation',
    template: `
        <ul class="nav nav-pills abs-right">
            <li *ngFor="let link of authLinks" [style.display]="hideLink(link.show) ? 'none' : 'inherit'">
                <a [routerLink]="link.href">{{link.text}}</a>
            </li>
        </ul>
    `
})
export class AuthNavigation implements OnInit, OnDestroy {
    
    authSub: any;
    
    authLinks: AuthLinkGroup;
    
    userLoggedIn: boolean = false;
    
    constructor(private authService: AuthService) {
        
        this.authLinks = [
            { href: '/sign-in', text: 'Sign In', auth: false, show: AuthLinkVisibility.ShowAnonymous },
            { href: '/sign-up', text: 'Sign Up', auth: false, show: AuthLinkVisibility.ShowAnonymous },
            { href: '/sign-out', text: 'Sign Out', auth: true, show: AuthLinkVisibility.ShowAuthenticated }
        ];
    }
    
    hideLink(visibility: AuthLinkVisibility): boolean {
        
        switch (visibility) {
            
            case AuthLinkVisibility.ShowAlways:
                return false; // never hide
            
            case AuthLinkVisibility.ShowAuthenticated:
                return false === this.userLoggedIn; // hide if user not logged in
            
            case AuthLinkVisibility.ShowAnonymous:
                return true === this.userLoggedIn; // hide if user is logged in
                
            default:
                return true; // hide if garbage value
        }
    }
    
    ngOnInit() {
        
        this.authSub = this.authService.getUserLoggedIn()
            .subscribe(userLoggedIn => {
                
                this.userLoggedIn = userLoggedIn;
            });
    }
    
    ngOnDestroy() {
        
        this.authSub.unsubscribe();
    }
}