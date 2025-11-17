import { Injectable } from '@angular/core';
import { TcgCard } from './card';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private readonly storageKey = 'pokemon-favorite-cards';

  private readStorage(): TcgCard[] {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as TcgCard[];
    } catch {
      return [];
    }
  }

  private writeStorage(cards: TcgCard[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(cards));
  }

  getFavorites(): TcgCard[] {
    return this.readStorage();
  }

  isFavorite(id: string): boolean {
    return this.readStorage().some(c => c.id === id);
  }

  addFavorite(card: TcgCard): void {
    const cards = this.readStorage();
    if (!cards.some(c => c.id === card.id)) {
      cards.push(card);
      this.writeStorage(cards);
    }
  }

  removeFavorite(id: string): void {
    const cards = this.readStorage().filter(c => c.id !== id);
    this.writeStorage(cards);
  }

  toggleFavorite(card: TcgCard): boolean {
    if (this.isFavorite(card.id)) {
      this.removeFavorite(card.id);
      return false;
    } else {
      this.addFavorite(card);
      return true;
    }
  }
}
