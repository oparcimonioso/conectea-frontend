import 'zone.js';

import { importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withHashLocation } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { appConfig } from './app/app.config';

import { App } from './app/app';
import { routes } from './app/app.routes';
import { TokenInterceptor } from './app/interceptors/token.interceptor';

import * as L from 'leaflet';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'assets/marker-icon-2x.png',
  iconUrl: 'assets/marker-icon.png',
  shadowUrl: 'assets/marker-shadow.png'
});

bootstrapApplication(App, {
  providers: [
    provideRouter(routes, withHashLocation()),

    importProvidersFrom(
      HttpClientModule,
      BrowserAnimationsModule
    ),

    { 
      provide: HTTP_INTERCEPTORS, 
      useClass: TokenInterceptor, 
      multi: true 
    }
  ]
})
.catch(err => console.error(err));
