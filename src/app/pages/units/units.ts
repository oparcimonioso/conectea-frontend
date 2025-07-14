import {
  Component,
  PLATFORM_ID,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  Inject
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';

import { InstitutionService } from '../../services/institution.service';
import { ReviewService } from '../../services/review.service';
import { AuthService } from '../../services/auth.service';
import { AverageRatingPipe } from '../../pipes/average-rating.pipe';

@Component({
  selector: 'app-units',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    AverageRatingPipe,
    RouterModule
  ],
  templateUrl: './units.html',
  styleUrls: ['./units.scss']
})
export class UnitsComponent implements AfterViewInit, OnDestroy {
  institutions: any[] = [];
  selectedInstitution: any = null;
  showDetails = false;

  newComment = '';
  newRating = 0;
  isLoggedIn = false;
  currentUser: { id: number; isAdmin: boolean } | null = null;
  cep: string = '50060-060';
  raioKm: number = 6;

  private map: any;
  private L: any;
  private openDetailsListener!: EventListener;

  @ViewChild('cepInput', { static: false }) cepInput!: ElementRef;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(Router) private router: Router,
    private institutionService: InstitutionService,
    private reviewService: ReviewService,
    private authService: AuthService,
    @Inject(MatSnackBar) private snackBar: MatSnackBar
  ) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      import('leaflet').then(L => {
        this.L = L;
        this.initMap();
        this.fetchInstitutions();

        this.openDetailsListener = (e: Event) => {
          const customEvent = e as CustomEvent<number>;
          this.openDetails(customEvent.detail);
        };
        window.addEventListener('openDetails', this.openDetailsListener);

        setTimeout(() => {
          if (this.cepInput) {
            this.cepInput.nativeElement.focus();
          }
          this.searchByCep();
        }, 500);

      }).catch(err => console.error('Erro ao carregar Leaflet:', err));
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId) && this.openDetailsListener) {
      window.removeEventListener('openDetails', this.openDetailsListener);
    }
  }

  private initMap(): void {
    this.map = this.L.map('map').setView([-8.0476, -34.8770], 12);
    this.L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      { attribution: '&copy; OpenStreetMap contributors' }
    ).addTo(this.map);
  }

  private fetchInstitutions(): void {
    this.institutionService.getAllInstitutions().subscribe({
      next: (data) => {
        this.institutions = data;
        this.addMarkers();
      },
      error: (err) => console.error('Erro ao buscar instituições', err)
    });
  }

  private calculateAverageRating(reviews: any[]): number {
    if (!reviews || reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return total / reviews.length;
  }

  private addMarkers(): void {
    if (!this.map || !this.L) return;

    const customIcon = this.L.icon({
      iconUrl: 'assets/images/location-pin.png',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });

    this.institutions.forEach(inst => {
      const avgRating = this.calculateAverageRating(inst.reviews || []);
      const stars = Array.from({ length: 5 }, (_, i) =>
        i < Math.round(avgRating) ? '★' : '☆'
      ).join('');

      const popupHtml = `
        <strong>${inst.nome}</strong><br>
        ${inst.endereco}<br>
        <img src="assets/images/escola-recife.png" width="80" height="60"
             style="border-radius:5px; margin:5px 0;"><br>
        <em>${stars}</em><br>
        <button onclick="window.dispatchEvent(new CustomEvent('openDetails',{ detail: ${inst.id} }))">Mais detalhes</button>
      `;

      this.L.marker([inst.latitude, inst.longitude], { icon: customIcon })
        .addTo(this.map)
        .bindPopup(popupHtml);
    });
  }

  searchByCep(): void {
    if (!this.cep) return;

    const cepCoords: { [key: string]: [number, number] } = {
      '50060-060': [-8.0631, -34.8711]
    };

    const coords = cepCoords[this.cep] || [-8.0476, -34.8770];
    this.centerMap(coords[0], coords[1]);
  }

  private centerMap(lat: number, lng: number): void {
    if (!this.map || !this.L) return;
    this.map.setView([lat, lng], 13);
  }

  openDetails(id: number): void {
    this.institutionService.getInstitutionById(id).subscribe({
      next: (institution) => {
        this.selectedInstitution = institution;
        this.showDetails = true;
        this.isLoggedIn = this.authService.isAuthenticated();
        this.currentUser = this.authService.getCurrentUser();
      },
      error: (err) => {
        console.error('Erro ao buscar detalhes da instituição', err);
        this.snackBar.open('Erro ao carregar detalhes da instituição', 'Fechar', {
          duration: 3000
        });
      }
    });
  }

  closeDetails(): void {
    this.showDetails = false;
    this.selectedInstitution = null;
    this.newComment = '';
    this.newRating = 0;
  }

  counter(n: number): number[] {
    return Array.from({ length: n }, (_, i) => i);
  }

  setRating(r: number): void {
    this.newRating = r;
  }

  submitReview(): void {
    if (!this.newComment.trim() || this.newRating === 0) {
      this.snackBar.open('Por favor, preencha sua avaliação e selecione uma classificação', 'Fechar', {
        duration: 3000
      });
      return;
    }
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/entrar'], {
        queryParams: { returnUrl: '/unidades' }
      });
      return;
    }
    if (this.selectedInstitution) {
      const reviewData = { rating: this.newRating, comment: this.newComment };
      this.reviewService.createReview(this.selectedInstitution.id, reviewData).subscribe({
        next: () => {
          this.snackBar.open('Avaliação enviada com sucesso!', 'Fechar', { duration: 3000 });
          this.openDetails(this.selectedInstitution.id);
          this.newComment = '';
          this.newRating = 0;
        },
        error: (err) => {
          console.error('Erro ao enviar avaliação', err);
          this.snackBar.open('Erro ao enviar avaliação. Tente novamente.', 'Fechar', { duration: 3000 });
        }
      });
    }
  }

  navigateToLogin(): void {
    this.router.navigate(['/entrar'], {
      queryParams: { returnUrl: '/unidades' }
    });
  }

  canDeleteReview(review: any): boolean {
    if (!this.isLoggedIn || !this.currentUser) return false;
    if (this.currentUser.isAdmin) return true;
    return review.userId === this.currentUser.id;
  }

  deleteReview(reviewId: number): void {
    if (!this.selectedInstitution) return;
    if (confirm('Tem certeza que deseja excluir esta avaliação?')) {
      this.reviewService.deleteReview(reviewId).subscribe({
        next: (response) => {
          const message = response || 'Avaliação excluída com sucesso!';
          this.snackBar.open(message, 'Fechar', { duration: 3000 });
          const index = this.selectedInstitution.reviews.findIndex((r: any) => r.id === reviewId);
          if (index !== -1) {
            this.selectedInstitution.reviews.splice(index, 1);
          }
        },
        error: (err) => {
          console.error('Erro ao excluir avaliação', err);
          this.snackBar.open('Erro ao excluir avaliação', 'Fechar', { duration: 3000 });
        }
      });
    }
  }
}
