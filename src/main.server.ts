import { bootstrapApplication } from '@angular/platform-browser';
// Correção aqui ↓
import { AppComponent } from './app/app';
import { config } from './app/app.config.server';

// Correção aqui ↓
const bootstrap = () => bootstrapApplication(AppComponent, config);

export default bootstrap;