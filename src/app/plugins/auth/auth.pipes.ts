import { Pipe, PipeTransform } from '@angular/core';
import { AuthLinkVisibility } from './auth.metadata';
import { AuthService } from './auth.service';

@Pipe({ name: 'authorizeLink' })
export class AuthorizeLinkPipe implements PipeTransform {
    
    authSub: any;
    
    userLoggedIn: boolean = false;
    
    constructor(private authService: AuthService) {
        
        this.initializePipe();
    }
    
    initializePipe() {
        
        this.authSub = this.authService.getUserLoggedIn()
            .subscribe(userLoggedIn => this.userLoggedIn = userLoggedIn);
    }
    
    transform(visibility): boolean {
        
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
}