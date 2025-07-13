import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  logoText = 'Conectea';
  mobileMenuActive = false;
  isAuthenticated = false;
  private authSubscription!: Subscription;

  navItems = [
    { label: 'Home', path: '/', color: '1' },           // #391BA6
    { label: 'Quem Somos', path: '/quem-somos', color: '2' }, // #0B8CBF
    { label: 'Unidades', path: '/unidades', color: '3' },     // #7CBF17
    { label: 'Entrar', path: '/entrar', color: '4' }          // #F2BB13
  ];

  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit() {
    this.authSubscription = this.authService.isAuthenticated$.subscribe(
      isAuth => {
        this.isAuthenticated = isAuth;
      }
    );
  }

  ngOnDestroy() {
    this.authSubscription.unsubscribe();
  }

  toggleMobileMenu() {
    this.mobileMenuActive = !this.mobileMenuActive;
    document.body.style.overflow = this.mobileMenuActive ? 'hidden' : '';
  }

  closeMobileMenu() {
    this.mobileMenuActive = false;
    document.body.style.overflow = '';
  }

  logout() {
    this.authService.logout();
    this.snackBar.open('Sua conta foi desconectada com sucesso', 'Fechar', {
      duration: 3000,
      panelClass: ['snackbar-success']
    });
    this.router.navigate(['/']);
    this.closeMobileMenu();
  }
}