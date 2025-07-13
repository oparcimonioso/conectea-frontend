import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideIcons } from '@ng-icons/core';
import { provideHttpClient } from '@angular/common/http';

import {
  bootstrapTelephone,
  bootstrapEnvelope,
  bootstrapFacebook,
  bootstrapInstagram,
  bootstrapLinkedin,
  bootstrapWhatsapp,
  bootstrapYoutube
} from '@ng-icons/bootstrap-icons';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideRouter(routes),
    provideIcons({
      bootstrapTelephone,
      bootstrapEnvelope,
      bootstrapFacebook,
      bootstrapInstagram,
      bootstrapLinkedin,
      bootstrapWhatsapp,
      bootstrapYoutube
    })
  ]
};