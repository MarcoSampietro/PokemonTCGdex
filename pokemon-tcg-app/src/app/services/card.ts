import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of, tap } from 'rxjs';

const API_BASE = 'https://api.tcgdex.net/v2/it';

// =====================
//     MODELS
// =====================
export interface CardmarketPricing {
  unit: string;
  avg?: number;
  low?: number;
  trend?: number;
  avg1?: number;
  avg7?: number;
  avg30?: number;
}

export interface TcgCard {
  id: string;
  name: string;

  image: string;
  image_high?: string;

  localId?: string;

  rarity?: string;
  types?: string[];
  hp?: number | string;

  description?: string;

  attacks?: {
    name: string;
    damage?: string | number;
    effect?: string;
  }[];

  weaknesses?: {
    type: string;
    value: string;
  }[];

  set?: {
    id: string;
    name: string;
  };

  pricing?: any;
}

@Injectable({
  providedIn: 'root'
})
export class CardService {

  private cardDetailsCache = new Map<string, TcgCard>();
  private persistentCacheKey = 'tcg_cards_cache_v1';

  constructor(private http: HttpClient) {}

  // ====================
  //  PERSISTENT CACHE
  // ====================

  savePersistentCache() {
    const allCards = Array.from(this.cardDetailsCache.values());
    localStorage.setItem(this.persistentCacheKey, JSON.stringify(allCards));
  }

  loadPersistentCache(): TcgCard[] | null {
    const data = localStorage.getItem(this.persistentCacheKey);
    if (!data) return null;

    try {
      const cards: TcgCard[] = JSON.parse(data);
      cards.forEach(c => this.cardDetailsCache.set(c.id, c));
      return cards;
    } catch {
      return null;
    }
  }

  // ====================
  //       API
  // ====================

  /** CARTE BASE */
  getCards(): Observable<TcgCard[]> {
    return this.http.get<TcgCard[]>(`${API_BASE}/cards`).pipe(
      map(cards =>
        cards.map(c => ({
          ...c,
          image_high: c.image + '/high.webp'
        }))
      )
    );
  }

  /** DETTAGLIO COMPLETO (con cache) */
  getCardDetails(id: string): Observable<TcgCard> {
    if (this.cardDetailsCache.has(id)) {
      return of(this.cardDetailsCache.get(id)!);
    }

    return this.http.get<TcgCard>(`${API_BASE}/cards/${id}`).pipe(
      tap(card => {
        card.image_high = card.image + '/high.webp';
        this.cardDetailsCache.set(id, card);
        this.savePersistentCache();
      })
    );
  }

  getCardById(id: string): Observable<TcgCard> {
    return this.getCardDetails(id);
  }
}
