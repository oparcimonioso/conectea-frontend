import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDarkMode = false;

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    this.applyTheme();
  }

  private applyTheme() {
    if (this.isDarkMode) {
      document.documentElement.style.setProperty('--background', '#121212');
      document.documentElement.style.setProperty('--text-dark', '#E0E0E0');
    } else {
      document.documentElement.style.setProperty('--background', '#F8F9FA');
      document.documentElement.style.setProperty('--text-dark', '#333333');
    }
  }
}