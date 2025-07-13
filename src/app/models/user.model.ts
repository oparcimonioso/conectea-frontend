export interface User {
  id?: number;
  email: string;
  password: string;
  nomeCompleto: string;
  endereco: string;
  telefone?: string;
  latitude?: number;
  longitude?: number;
  institution?: {
    id: number;
  };
}