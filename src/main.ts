import 'zone.js';

import { importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient, withFetch, HTTP_INTERCEPTORS } from '@angular/common/http'; // Atualizado com withFetch
import { TokenInterceptor } from './app/interceptors/token.interceptor';
import { AppComponent } from './app/app'; // Importe AppComponent diretamente

import { routes } from './app/app.routes'; // Importe as rotas

import * as L from 'leaflet';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'assets/marker-icon-2x.png',
  iconUrl: 'assets/marker-icon.png',
  shadowUrl: 'assets/marker-shadow.png'
});

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withFetch()), // Usando withFetch para HttpClient
    importProvidersFrom(
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