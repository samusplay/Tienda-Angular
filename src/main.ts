import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';

import { importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { NgxSpinnerModule } from 'ngx-spinner';
import { routes } from './app/app.routes';

bootstrapApplication(App, {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    importProvidersFrom(NgxSpinnerModule)
  ]
}).catch(err => console.error(err));
