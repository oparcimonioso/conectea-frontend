import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ReviewDTO {
  id: number;
  rating: number;
  comment: string;
  date: string;
  userName: string;
  userId: number;
}

export interface Institution {
  id: number;
  nome: string;
  telefone: string;
  endereco: string;
  latitude: number;
  longitude: number;
  descricao: string;
  reviews: ReviewDTO[];
  imageUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class InstitutionService {
  private readonly baseUrl = 'http://localhost:8080/api/institutions';

  constructor(private http: HttpClient) {}

  getAllInstitutions(): Observable<Institution[]> {
    return this.http.get<Institution[]>(this.baseUrl);
  }

  getInstitutionById(id: number): Observable<Institution> {
    return this.http.get<Institution>(`${this.baseUrl}/${id}`);
  }
}