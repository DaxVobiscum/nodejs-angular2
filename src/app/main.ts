//import deps
//import 'zone.js';
//import 'zone.js/dist/long-stack-trace-zone';
//import 'reflect-metadata';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app.module';
//you may need es6-shim if you get an error relating to list.fill
//import es6-shim;

platformBrowserDynamic().bootstrapModule(AppModule)