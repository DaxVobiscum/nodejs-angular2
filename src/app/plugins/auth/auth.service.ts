import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';

import { LocalStorage, SessionStorage } from 'angular2-localstorage/WebStorage';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/toPromise';

import * as io from 'socket.io-client';

import { AuthError, User, UserCreds, UserGoogle } from './auth.metadata';

@Injectable()
export class AuthService {
    
    @SessionStorage()
    userStoreSession: User = new User();
    
    @LocalStorage()
    userStoreLocal: User = new User();
    
    private user_logged_in: boolean = false;
    // userLoggedIn: Observable<boolean>;
    // userLoggedInObserver: Observer<boolean>;
    userLoggedIn: BehaviorSubject<boolean>;
    
    constructor(private http: Http) {
        
        // this.userLoggedIn = Observable.create(observer => {
            
        //     this.userLoggedInObserver = observer;
        // });
        this.userLoggedIn = new BehaviorSubject<boolean>(false);
    }
    
    private handleError = (error: AuthError) => {
        
      // any internal logging
      console.error(error.message);
    };
    
    checkForUser(): Observable<boolean> {
        
        if (!this.user_logged_in) {
            
            let currentUser: User = this.getCurrentUser();
            
            if (!!currentUser.token) {
                
                this.setCurrentUser(currentUser);
                this.setUserLoggedIn(true);
            }
        }
        
        return this.getUserLoggedIn();
    }
    
    getCurrentUser(): User {
        
        return this.userStoreSession || this.userStoreLocal;
    }
    
    getUserLoggedIn(): Observable<boolean> {
        
        // return this.userLoggedIn;
        
        return this.userLoggedIn.asObservable();
    }
    
    setCurrentUser(currentUser: User, persistent: boolean = false): void {
        
        if (persistent) {
            
            this.userStoreLocal = currentUser;
        }
        
        this.userStoreSession = currentUser;
    }
    
    setUserLoggedIn(isLoggedIn: boolean) {
        
        this.user_logged_in = isLoggedIn;
        
        // this.userLoggedInObserver.next(this.user_logged_in);
        
        this.userLoggedIn.next(this.user_logged_in);
    }
    
    userGoogle(): Promise<UserGoogle> {
        
        let _self = this;
        
        let openAuthWindow = (parent) => {
            
            let width = 445;
            let height = 590;
            
            let left = (parent.top.outerWidth / 2) + parent.top.screenX - (width / 2);
            let top = (parent.top.outerHeight / 2) + parent.top.screenY - (height / 2);
            
            let windowParams = {
                 'toolbar': 'no',
                 'location': 'no', 
                 'directories': 'no',
                 'status': 'no', 
                 'menubar': 'no', 
                 'scrollbars': 'no', 
                 'resizable': 'no', 
                 'copyhistory': 'no', 
                 'width': width, 
                 'height': height,
                 'top': top,
                 'left': left 
            };
            
            return parent.open('login/google', 'Google Auth', 
                ((params) => {
                    
                    let p = [];
                    
                    for (var param in params) {
                        
                        p.push([ param, params[param] ].join('='));
                    }
                    
                    return p.join(',');
                })(windowParams));
        };
        
        return new Observable(observer => {
            
            let _observer = observer;
            
            let authSocket: any;
            let authWindow: any;
            
            try {
                
                authSocket = io('/auth/google');
                
                authSocket.on('connect', function () {
                    
                    authSocket.emit('login', function (ready) {
                        
                        if (ready) {
                            
                            // authWindow = window.open('login/google', 'Google Auth', 'chrome=yes,dialog,modal,centerscreen,width=445,height=590');
                            
                            authWindow = openAuthWindow(window);
                            
                            if (!!authWindow) {
                                
                                authWindow.onunload = (e): void => {
                                    
                                    console.info('Modal closed.');
                                };
                            }
                            else {
                                
                                console.error("Couldn't open the window.");
                            }
                        }
                        else {
                            
                            console.error("Server responded not ready. Google authentication aborted.");
                        }
                    });
                });
                
                authSocket.on('complete', function (profile) {
                    
                    if (!!authWindow) {
                        
                        let userGoogle = new UserGoogle(profile, "");
                        
                        // _self.setUserGoogle(userGoogle);
                        _self.setCurrentUser(userGoogle.asUser());
                        _self.setUserLoggedIn(true);
                        
                        _observer.next(userGoogle);
                    }
                    
                    if (!!authWindow) { authWindow.close(); }
                    if (!!authSocket) { authSocket.close(); }
                    
                    observer.complete();
                });
            }
            catch (e) {
                
                console.error(e.message);
                
                observer.next(false);
            }
        })
        .toPromise();
    }
    
    userLogin(userCreds: UserCreds): Promise<User | AuthError> {
        
        console.info(`User '${userCreds.username}' logging in`);
        
        return this.http.post('login/local', userCreds)
            .toPromise()
            .then((response: Response) => {
                
                let data = response.json();
                
                if (!!data.token) {
                    
                    return data as User;
                }
                else {
                    
                    return data as AuthError;
                }
            })
            .catch(this.handleError);
    }
    
    userLogout(): Promise<boolean> {
        
        console.info(`User logging out`);
        
        let _self = this;
        
        return new Observable(observer => {
                
                try {
                    
                    _self.setCurrentUser(new User());
                    _self.setUserLoggedIn(false);
                    
                    observer.next(true);
                }
                catch (e) {
                    
                    console.error(e.message);
                    
                    observer.next(false);
                }
                finally {
                    
                    observer.complete();
                }
            })
            .toPromise();
    }
    
    userRegister(userCreds: UserCreds): Promise<boolean | AuthError> {
        
        console.info(`Registering user '${userCreds.username}'`);
        
        return this.http.post('register/local', userCreds)
            .toPromise()
            .then((response: Response) => {
                
                let err = response.json();
                
                if (!!err) {
                    
                    return err as AuthError;
                }
                else {
                    
                    return false;
                }
            })
            .catch(this.handleError);
    }
}