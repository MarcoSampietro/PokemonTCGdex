import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

const API_BASE = 'https://api.tcgdex.net/v2/it';

// =====================
//        MODELS
// =====================
export interface TcgCard {
  id: string;
  name: string;

  number?: string;
  localId?: string;
  image: string;
  image_high?: string;

  rarity?: string;
  types?: string[];

  set?: {
    id: string;
    name: string;
  };

  hp?: number | string;

  attacks?: {
    name: string;
    damage?: string | number;
    effect?: string;
  }[];

  weaknesses?: {
    type: string;
    value: string;
  }[];

  description?: string;

  pricing?: {
    cardmarket?: {
      unit: string;
      avg?: number;
      low?: number;
      trend?: number;
      avg1?: number;
      avg7?: number;
      avg30?: number;
    };
  };
}

// =====================
//        SERVICE
// =====================
@Injectable({
  providedIn: 'root'
})
export class CardService {

  constructor(private http: HttpClient) {}

  // ---------- FILTRI GLOBALI ----------
  getAllTypes(): Observable<string[]> {
    return this.http.get<string[]>(`${API_BASE}/types`);
  }

  getAllRarities(): Observable<string[]> {
    return this.http.get<string[]>(`${API_BASE}/rarities`);
  }

  getAllSets(): Observable<any[]> {
    return this.http.get<any[]>(`${API_BASE}/sets`);
  }

  // ---------- PAGINAZIONE / RICERCA GLOBALE ----------
  getCardsPage(
    page: number,
    itemsPerPage: number,
    filters: { name?: string; type?: string; rarity?: string }
  ): Observable<TcgCard[]> {

    let url =
      `${API_BASE}/cards?pagination:page=${page}&pagination:itemsPerPage=${itemsPerPage}`;

    if (filters.name)
      url += `&name=${encodeURIComponent(filters.name)}`;

    if (filters.type)
      url += `&types=${encodeURIComponent(filters.type)}`;

    if (filters.rarity)
      url += `&rarity=${encodeURIComponent(filters.rarity)}`;

    return this.http.get<TcgCard[]>(url).pipe(
      map((cards: TcgCard[]) =>
        cards.map((c: TcgCard) => ({
          ...c,
          image_high: c.image ? c.image + '/high.webp' : undefined
        }))
      )
    );
  }

  // ---------- CARTE DI UN SET (usando l'ID) ----------
  getCardsBySetId(setId: string): Observable<TcgCard[]> {
    return this.http.get<any>(`${API_BASE}/sets/${setId}`).pipe(
      map((set: any) => set.cards ?? []),
      map((cards: any[]) =>
        cards.map((c: any) => ({
          ...c,
          image_high: c.image ? c.image + '/high.webp' : undefined
        }))
      )
    );
  }

  // ---------- DETTAGLIO CARTA ----------
  getCardById(id: string): Observable<TcgCard> {
    return this.http.get<TcgCard>(`${API_BASE}/cards/${id}`).pipe(
      map((c: TcgCard) => ({
        ...c,
        image_high: c.image ? c.image + '/high.webp' : undefined
      }))
    );
  }
}
