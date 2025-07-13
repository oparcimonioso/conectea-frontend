import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AuthService, RegisterUser, LoginResponse } from '../../services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  templateUrl: './auth.html',
  styleUrls: ['./auth.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class AuthComponent {
  isLoginMode = true;
  loading = false;
  menorDeIdade = false;
  errorMessage = '';
  cadastroSucesso = false;
  signupFormSubmitted = false;
  loginFormSubmitted = false;

  loginForm: FormGroup;
  signupForm: FormGroup;

  criancasTEA: { tipo: string; idade: number | null }[] = [
    { tipo: 'crianca', idade: null }
  ];

  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    this.signupForm = this.fb.group({
      nome: ['', Validators.required],
      sobrenome: ['', Validators.required],
      dataNascimento: ['', Validators.required],
      cep: ['', [Validators.required, Validators.pattern(/^\d{5}-\d{3}$/)]],
      rua: ['', Validators.required],
      numero: ['', Validators.required],
      bairro: ['', Validators.required],
      cidade: ['', Validators.required],
      estado: ['', [Validators.required, Validators.maxLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.senhasIguais.bind(this) });
  }

  private senhasIguais(group: FormGroup) {
    const senha = group.get('password')?.value;
    const confirmar = group.get('confirmPassword')?.value;
    return senha === confirmar ? null : { mismatch: true };
  }

  switchMode() {
    this.isLoginMode = !this.isLoginMode;
    this.errorMessage = '';
    this.cadastroSucesso = false;
    this.signupFormSubmitted = false;
    this.loginFormSubmitted = false;
  }

  onLogin() {
    this.loginFormSubmitted = true;
    if (this.loginForm.invalid) {
      this.errorMessage = 'Por favor, preencha todos os campos corretamente';
      return;
    }
    
    this.loading = true;
    this.errorMessage = '';
    
    const { email, password } = this.loginForm.value;
    
    this.authService.login(email, password).subscribe({
      next: (res: LoginResponse) => {
        localStorage.setItem('token', res.token);
        this.loading = false;
        this.snackBar.open(`Bem-vindo, ${res.name}!`, 'Fechar', {
          duration: 3000,
          panelClass: ['snackbar-success']
        });
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.errorMessage = err.message || 'Erro no login. Verifique suas credenciais.';
        this.loading = false;
        this.snackBar.open(this.errorMessage, 'Fechar', {
          duration: 3000,
          panelClass: ['snackbar-error']
        });
      }
    });
  }

  onSignup() {
    this.signupFormSubmitted = true;
    
    if (this.signupForm.invalid) {
      this.errorMessage = 'Por favor, preencha todos os campos corretamente';
      return;
    }
    
    if (this.menorDeIdade) {
      this.errorMessage = 'Você precisa ter 18 anos ou mais para se cadastrar';
      return;
    }
    
    this.loading = true;
    this.errorMessage = '';
    this.cadastroSucesso = false;
    
    const formValue = this.signupForm.value;
    const userData: RegisterUser = {
      firstName: formValue.nome,
      lastName: formValue.sobrenome,
      birthDate: formValue.dataNascimento,
      cep: formValue.cep,
      rua: formValue.rua,
      numero: formValue.numero,
      bairro: formValue.bairro,
      cidade: formValue.cidade,
      estado: formValue.estado,
      email: formValue.email,
      password: formValue.password
    };

    if (this.criancasTEA.length > 0 && this.criancasTEA[0].idade !== null) {
      userData.childOrTeen = this.criancasTEA[0].tipo;
      userData.childAge = this.criancasTEA[0].idade;
    }

    this.authService.register(userData).subscribe({
      next: () => {
        this.cadastroSucesso = true;
        this.loading = false;
        this.signupForm.reset();
        this.criancasTEA = [{ tipo: 'crianca', idade: null }];
        this.signupFormSubmitted = false;
        this.errorMessage = '';
      },
      error: (err) => {
        this.errorMessage = err.message || 'Erro no cadastro. Tente novamente mais tarde.';
        this.loading = false;
      }
    });
  }

  onBirthDateChange() {
    const value = this.signupForm.get('dataNascimento')?.value;
    if (value) {
      const birth = new Date(value);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
      this.menorDeIdade = age < 18;
    }
  }

  buscarCep() {
    const cep = this.signupForm.get('cep')?.value.replace(/\D/g, '');
    if (cep.length === 8) {
      fetch(`https://viacep.com.br/ws/${cep}/json/`)
        .then(response => response.json())
        .then(data => {
          if (!data.erro) {
            this.signupForm.patchValue({
              rua: data.logradouro,
              bairro: data.bairro,
              cidade: data.localidade,
              estado: data.uf
            });
          } else {
            this.snackBar.open('CEP não encontrado', 'Fechar', { duration: 3000 });
          }
        })
        .catch(() => {
          this.snackBar.open('Erro ao buscar CEP', 'Fechar', { duration: 3000 });
        });
    }
  }

  adicionarCriancaTEA() {
    if (this.criancasTEA.length < 4) this.criancasTEA.push({ tipo: 'crianca', idade: null });
  }

  removerCriancaTEA(i: number) {
    if (this.criancasTEA.length > 1) this.criancasTEA.splice(i, 1);
  }

  onTipoTEAChange(i: number) {
    this.criancasTEA[i].idade = null;
  }

  getIdadesTEA(tipo: string): number[] {
    const min = tipo === 'crianca' ? 2 : 13;
    return Array.from({ length: 16 }, (_, idx) => idx + min);
  }
}