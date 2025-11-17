import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

const API_BASE = 'https://api.tcgdex.net/v2/en';

export interface TcgSet {
  id: string;
  name: string;
  releaseDate?: string;
  logo?: string;
  symbol?: string;
  cardCount?: {
    official?: number;
    total?: number;
  };
  cards?: TcgCardBrief[];
}

export interface TcgCardBrief {
  id: string;
  name: string;
  image: string;
  localId: string;
}

export interface CardmarketPricing {
  unit: string;      // "EUR"
  avg?: number;
  low?: number;
  trend?: number;
  avg1?: number;
  avg7?: number;
  avg30?: number;
}

export interface CardPricing {
  cardmarket?: CardmarketPricing;
}

export interface TcgCard extends TcgCardBrief {
  category?: string;
  illustrator?: string;
  rarity?: string;
  hp?: number | string;
  types?: string[];
  evolveFrom?: string;
  description?: string;
  stage?: string;
  attacks?: {
    name: string;
    effect?: string;
    damage?: number | string;
    cost?: string[];
  }[];
  weaknesses?: {
    type: string;
    value: string;
  }[];
  retreat?: number;
  regulationMark?: string;
  legal?: {
    standard?: boolean;
    expanded?: boolean;
  };
  set?: {
    id: string;
    name: string;
  };
  pricing?: CardPricing;
}

@Injectable({
  providedIn: 'root'
})
export class CardService {

  constructor(private http: HttpClient) {}

  /** Lista di set */
  getSets(): Observable<TcgSet[]> {
    return this.http.get<TcgSet[]>(`${API_BASE}/sets`);
  }

  /** Dettaglio set + carte incluse */
  getSetById(id: string): Observable<TcgSet> {
    return this.http.get<TcgSet>(`${API_BASE}/sets/${id}`);
  }

  /** Lista carte base (usata per home) – prendo le prime N per non esagerare */
  getCards(): Observable<TcgCard[]> {
    return this.http.get<TcgCard[]>(`${API_BASE}/cards`);
  }


  /** Singola carta */
  getCardById(id: string): Observable<TcgCard> {
    return this.http.get<TcgCard>(`${API_BASE}/cards/${id}`);
  }
}
