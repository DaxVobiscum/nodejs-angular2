import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthAlertService, AuthAlerts } from './auth.alerts';
import { AuthAlertType, AuthErrorCode, AuthMode, AuthAlert, AuthError, User, UserCreds, UserGoogle } from './auth.metadata';
import { AuthService } from './auth.service';

@Component({
    styles: [`
        div {
            color: blue;
        }
    `],
    template: `
        <form class="form-signin" method="post">
            <h2 class="form-signin-heading">{{modeText}}</h2>
            <label for="inputEmail" class="sr-only">E-mail</label>
            <input type="email" name="username" id="inputEmail" [(ngModel)]="userCreds.username" class="form-control" placeholder="you@somepl.ace" required autofocus [autocomplete]="mode === ${AuthMode.SignIn}" />
            <label for="inputPass" class="sr-only">Password</label>
            <input type="password" name="password" id="inputPass" [(ngModel)]="userCreds.password" class="form-control" placeholder="8-12 characters" required [autocomplete]="mode === ${AuthMode.SignIn}" />
            <div *ngIf="mode === ${AuthMode.SignUp}">
                <label for="inputPassVerify" class="sr-only">Password Verification</label>
                <input type="password" name="passwordVerify" id="inputPassVerify" [(ngModel)]="passwordVerify" class="form-control" placholder="Password again" required autocomplete="off" />
            </div>
            <div class="checkbox" *ngIf="mode === ${AuthMode.SignIn}">
                <label>
                    <input type="checkbox" name="rememberMe" id="inputRememberMe" [(ngModel)]="rememberMe"> Remember me
                </label>
            </div>
            <button class="btn btn-lg btn-primary btn-block" type="submit" (click)="onSubmit()">{{modeText}}</button>
            <button class="btn btn-lg btn-primary btn-block" type="submit" (click)="onGoogle()">Google</button>
            <auth-alerts></auth-alerts>
        </form>
    `
})
export class AuthForm implements OnInit {
    
    mode: AuthMode;
    
    modeText: string;
    
    userLoggedIn: boolean = false;
    
    userCreds: UserCreds;
    passwordVerify: string;
    rememberMe: boolean;
    
    alertClass: () => string;
    
    onGoogle: () => void;
    onSubmit: () => void;
    
    redirectHome: () => void;
    redirectSignIn: () => void;
    
    constructor(private authAlertService: AuthAlertService, private authService: AuthService, private route: ActivatedRoute, private router: Router) { }
    
    ngOnInit(): void {
        
        let _self = this;
        
        const handleError = (error: AuthError) => {
            
            _self.showErrorAlert(error);
        };
        
        this.onGoogle = () => {
            
            this.authService.userGoogle()
                .then((userGoogle: UserGoogle) => {
                    
                    if (!!userGoogle) {
                        
                        console.info("Logged in with Google.");
                    }
                    else {
                        
                        console.error("Google login failed.");
                    }
                });
            
        //         .then((result: any) => {
                    
        //             if (!!result.profile) {
                        
        //                 let userGoogle = result as UserGoogle;
                        
        //                 console.info(`User '${userGoogle.profile.displayName}' authenticated.`);
                        
        //                 this.authService.setUserLoggedIn(true);
                        
        //                 this.redirectHome();
        //             }
        //             else {
                        
        //                 throw result as AuthError;
        //             }
        //         })
        //         .catch(handleError);
        };
        
        this.onSubmit = () => {
            
            if (AuthMode.SignIn === this.mode) {
                
                this.authService.userLogin(this.userCreds)
                    .then((result: any) => {
                        
                        if (!!result.username) {
                            
                            let currentUser = result as User;
                            
                            console.info(`User '${currentUser.username}' authenticated.`);
                            
                            this.authService.setCurrentUser(currentUser, this.rememberMe);
                            this.authService.setUserLoggedIn(true);
                            
                            this.redirectHome();
                        }
                        else {
                            
                            throw result as AuthError;
                        }
                    })
                    .catch(handleError);   
            }
            else if (AuthMode.SignUp === this.mode) {
                
                // password validation
                
                if (this.passwordVerify !== this.userCreds.password) {
                    
                    this.showErrorAlert(new AuthError(AuthErrorCode.InvalidPassword, "Passwords don't match."));
                }
                else {
                    
                    this.authService.userRegister(this.userCreds)
                        .then(err => {
                            
                            // if success, redirect to sign-in and show message
                                // "Your registration was successful. You may now sign in."
                            if (!err) {
                                
                                this.showSuccessAlert("Registration successful. You may now sign in.");
                                
                                this.redirectSignIn();
                            }
                            
                            // if fail, refresh and show message
                            else {
                                
                                // "Registration failed!"
                                throw err as AuthError;
                            }
                        }).
                        catch(handleError);
                }
            }
        };
        
        this.redirectHome = () => {
            
            this.router.navigateByUrl('/home', { relativeTo: this.route });
        };
        
        this.redirectSignIn = () => {
            
            this.router.navigateByUrl('/sign-in', { relativeTo: this.route });
        };
        
        this.postInit();
    }
    
    postInit(): void {
        
        let _self = this;
        
        this.route.data.forEach((data: { authMode: AuthMode }) => {
            
            this.mode = data.authMode;
        });
        
        this.modeText = ((mode: AuthMode): string => {
            
            switch (mode) {
                
                case AuthMode.SignOut:
                    return 'Sign Out';
                
                case AuthMode.SignUp:
                    return 'Sign Up';
                
                case AuthMode.SignIn:
                default: 
                    return 'Sign In';
            }
        })(this.mode);
        
        this.userCreds = new UserCreds();
        
        if (AuthMode.SignOut === this.mode) {
            
            this.authService.userLogout()
                .then((userLoggedOut: boolean) => {
                    
                    if (userLoggedOut) {
                        
                        console.info(`User logged out.`);
                        
                        this.userLoggedIn = userLoggedOut;
                        
                        this.showSuccessAlert("You have been signed out.");
                        
                        this.redirectSignIn();
                    }
                    else {
                        
                        console.info(`Something happened and we couldn't log you out.`);
                    }
                });
        }
        else {
        
            this.authService.checkForUser()
                .subscribe(status => {
                    
                   _self.userLoggedIn = status; 
                   
                   if (_self.userLoggedIn) {
                       
                       this.redirectHome();
                   }
                });
        }
    }
    
    private showSuccessAlert (message: string): void {
        
        let alert = new AuthAlert(message, AuthAlertType.Success);
        
        this.authAlertService.showAlert(alert);
    }
    
    private showErrorAlert (error: AuthError): void {
        
        let alert = new AuthAlert(error.message, AuthAlertType.Error);
        
        this.authAlertService.showAlert(alert);
    }
}