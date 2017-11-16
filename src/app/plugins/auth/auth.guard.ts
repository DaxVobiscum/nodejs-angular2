import { Injectable } from '@angular/core';
import { ActivatedRoute, CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
    
    constructor(private authService: AuthService, private route: ActivatedRoute, private router: Router) { }
    
    canActivate() {
        
        console.info("AuthGuard triggered.");
        
        return new Observable<boolean>(observer => {
                
                let userCanActivate: boolean;
                
                this.authService.getUserLoggedIn()
                    .subscribe(status => {
                        
                        userCanActivate = status;
                        
                        if (!userCanActivate) {
                            
                            this.router.navigateByUrl('/sign-in', { relativeTo: this.route });
                        }
                        
                        observer.next(userCanActivate);
                        
                        observer.complete();
                    });
            });
    }
}