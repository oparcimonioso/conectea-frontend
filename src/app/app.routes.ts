import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { AboutComponent } from './pages/about/about';
import { UnitsComponent } from './pages/units/units';
import { AuthComponent } from './pages/auth/auth';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'quem-somos', component: AboutComponent },
  { path: 'unidades', component: UnitsComponent },
  { path: 'entrar', component: AuthComponent },
  { path: '**', redirectTo: '' }
];