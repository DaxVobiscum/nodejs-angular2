import { Component, Injectable, OnInit, OnDestroy } from '@angular/core';
import { AuthAlertType, AuthAlert } from './auth.metadata';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

@Injectable()
export class AuthAlertService {
    
    private alert: AuthAlert;
    
    private alertTimer: any;
    
    private alertSubscription: BehaviorSubject<AuthAlert>;
    
    constructor() {
        
        this.alertSubscription = new BehaviorSubject<AuthAlert>(AuthAlert.getDefault());
    }
    
    getAlertSubscription(): Observable<AuthAlert> {
        
        return this.alertSubscription.asObservable();
    }
    
    showAlert(alert: AuthAlert): void {
        
        let _self = this;
        
        if (!!this.alertTimer) {
            
            clearTimeout(this.alertTimer);
        }
        
        this.alert = alert;
        
        this.alert.active = true;
        
        this.alertTimer = setTimeout(function () {
            
            _self.alert = AuthAlert.getDefault();
            
            _self.updateSubscription();
        }, 5000);
        
        this.updateSubscription();
    }
    
    private updateSubscription(): void {
        
        this.alertSubscription.next(this.alert);
    }
}

@Component({
    selector: 'auth-alerts',
    template: `
        <div [class]="alertClass()" role="alert" [hidden]="!alert.active">{{alert.message}}</div>
    `
})
export class AuthAlerts implements OnInit, OnDestroy {
    
    alert: AuthAlert;
    
    alertSubscription: Subscription;
    
    constructor(private authAlertService: AuthAlertService) { }
    
    alertClass(): string {
        
        switch (this.alert.type) {
            
            case AuthAlertType.Error:
                return "alert alert-danger";
                
            case AuthAlertType.Success:
                return "alert alert-success";
            
            case AuthAlertType.Warn:
                return "alert alert-warning";
                
            case AuthAlertType.Info:
            default:
                return "alert alert-info";
        }
    }
    
    ngOnInit(): void {
        
        this.alertSubscription = this.authAlertService.getAlertSubscription()
            .subscribe(alert => {
                
                this.alert = alert;
            });
    }
    
    ngOnDestroy(): void {
        
        this.alertSubscription.unsubscribe();
    }
}