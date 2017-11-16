import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { NavLinkGroup } from './app.metadata';
import { AuthService } from './plugins/auth';

@Injectable()
export class AppService {
    
    authSub: any;
    userLoggedIn: boolean;
    
    private nav_links: NavLinkGroup = [ ];
    navLinks: BehaviorSubject<NavLinkGroup>;
    
    constructor(private authService: AuthService) {
        
        this.nav_links = [
            { href: '/home', text: 'Home', auth: false },
            { href: '/home', text: 'Something', auth: true }
        ];
        
        this.initializeService();
    }
    
    initializeService() {
        
        this.navLinks = new BehaviorSubject<NavLinkGroup>(this.nav_links);
        
        this.authSub = this.authService.getUserLoggedIn()
            .subscribe(userLoggedIn => this.userLoggedIn = userLoggedIn);
    }
    
    addNavLinks(navLinks: NavLinkGroup) {
        
        for (let navLink of navLinks) {
            
            this.nav_links.push(navLink);
        }
    }
    
    getNavLinks(): Observable<NavLinkGroup> {
        
        return this.navLinks.asObservable();
    }
    
    getUserLoggedIn(): boolean {
        
        return this.userLoggedIn;
    }
    
    sayHello() {
        
        alert("Hello!");
    }
    
    saySomething(message: string) {
        
        alert(message);
    }
    
    setNavLinks(navLinks: NavLinkGroup): void {
        
        this.nav_links = navLinks;
    }
}