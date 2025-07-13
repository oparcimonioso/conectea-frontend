import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { JwtHelperService } from '@auth0/angular-jwt';

export interface LoginResponse {
  token: string;
  name: string;
  email: string;
  roles: string[];
}

export interface RegisterUser {
  firstName: string;
  lastName: string;
  birthDate: string;
  cep: string;
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  childOrTeen?: string;
  childAge?: number; 
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private jwtHelper = new JwtHelperService();
  private apiUrl = 'http://localhost:8080/api/auth';
  private isAuthenticatedSubject: BehaviorSubject<boolean>;
  public isAuthenticated$: Observable<boolean>;
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
    this.isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  }

  private hasToken(): boolean {
    if (this.isBrowser) {
      return !!localStorage.getItem('token');
    }
    return false;
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(res => {
          if (this.isBrowser) {
            localStorage.setItem('token', res.token);
          }
          this.isAuthenticatedSubject.next(true);
        }),
        catchError(error => {
          let errorMsg = 'Erro desconhecido';
          if (error.status === 401) {
            errorMsg = 'Credenciais inválidas';
          }
          return throwError(() => new Error(errorMsg));
        })
      );
  }

  register(user: RegisterUser): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, user)
      .pipe(
        catchError(error => {
          let errorMsg = 'Erro no cadastro';
          if (error.error && error.error.message) {
            errorMsg = error.error.message;
          } else if (error.status === 400) {
            errorMsg = 'Dados inválidos';
          }
          return throwError(() => new Error(errorMsg));
        })
      );
  }

  getToken(): string | null {
    if (this.isBrowser) {
      return localStorage.getItem('token');
    }
    return null;
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('token');
    }
    this.isAuthenticatedSubject.next(false);
  }

  isAuthenticated(): boolean {
    return this.hasToken();
  }

  getCurrentUserEmail(): string | null {
    if (!this.isBrowser) {
      return null;
    }
    
    const token = this.getToken();
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub || null;
    } catch (e) {
      return null;
    }
  }
  getCurrentUser(): { id: number; isAdmin: boolean } | null {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const decoded = this.jwtHelper.decodeToken(token);
      return {
        id: parseInt(decoded.userId, 10),
        isAdmin: decoded.isAdmin === true || decoded.isAdmin === 'true'
      };
    } catch (e) {
      console.error('Erro ao decodificar token', e);
      return null;
    }
  }
}