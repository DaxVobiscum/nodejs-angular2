import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { homeRouting, homeRoutingProviders } from './home.routes';

@NgModule({
    imports: [ CommonModule, homeRouting ],
    declarations: [ HomeComponent ],
    exports: [ HomeComponent ],
    providers: [ homeRoutingProviders ]
})

export class HomeModule { }