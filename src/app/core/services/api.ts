import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  readonly urlPrincipal = 'http://127.0.0.1:8000';
  readonly urlPagos = 'http://localhost:3000/api';
}
