import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavLink, NavLinkGroup } from './app.metadata';
import { AppService } from './app.service';
import { AuthService } from './plugins/auth';

@Component({
    selector: 'app-navigation',
    template: `
        <ul class='nav nav-tabs'>
            <li *ngFor="let link of navLinks">
                <a [routerLink]="link.href" [ngClass]="authLink(link.auth) ? '' : 'disabled'">{{link.text}}</a>
            </li>
        </ul>
    `
})
export class AppNavigation implements OnInit, OnDestroy {
    
    authSub: any;
    navSub: any;
    
    navLinks: NavLinkGroup;
    userLoggedIn: boolean;
    
    constructor(private appService: AppService, private authService: AuthService) { }
    
    authLink(requiresAuth: boolean): boolean {
        
        return (!requiresAuth || this.userLoggedIn);
    }
    
    ngOnInit() {
        
        this.appService.setNavLinks(this.navLinks);
        
        this.authSub = this.authService.getUserLoggedIn()
            .subscribe(userLoggedIn => this.userLoggedIn = userLoggedIn);
        
        this.navSub = this.appService.getNavLinks()
            .subscribe(navLinks => this.navLinks = navLinks);
    }
    
    ngOnDestroy() {
        
        this.authSub.unsubscribe();
        this.navSub.unsubscribe();
    }
}