import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CardService, TcgCard } from '../../services/card';
import { FavoritesService } from '../../services/favorites';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl:'./home.html'
})
export class HomeComponent implements OnInit {
  loading = false;
  error: string | null = null;

  allCards: TcgCard[] = [];
  filteredCards: TcgCard[] = [];

  searchTerm = '';
  selectedType = '';
  selectedRarity = '';

  types: string[] = [];
  rarities: string[] = [];

  constructor(
    private cardService: CardService,
    private favoritesService: FavoritesService
  ) {}

  ngOnInit(): void {
    this.fetchCards();
  }

  fetchCards(): void {
    this.loading = true;
    this.error = null;

    this.cardService.getCards(60).subscribe({
      next: cards => {
        this.allCards = cards;
        this.buildFilters();
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.error = 'Errore nel caricamento delle carte.';
        this.loading = false;
      }
    });
  }

  buildFilters(): void {
    const typeSet = new Set<string>();
    const raritySet = new Set<string>();

    this.allCards.forEach(card => {
      card.types?.forEach(t => typeSet.add(t));
      if (card.rarity) raritySet.add(card.rarity);
    });

    this.types = Array.from(typeSet).sort();
    this.rarities = Array.from(raritySet).sort();
  }

  applyFilters(): void {
    this.filteredCards = this.allCards.filter(card => {
      const matchName = card.name.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchType = this.selectedType
        ? card.types?.includes(this.selectedType)
        : true;
      const matchRarity = this.selectedRarity
        ? card.rarity === this.selectedRarity
        : true;

      return matchName && matchType && matchRarity;
    });
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  isFavorite(card: TcgCard): boolean {
    return this.favoritesService.isFavorite(card.id);
  }

  toggleFavorite(card: TcgCard, event: MouseEvent): void {
    event.stopPropagation(); // per non triggherare il click sulla card
    this.favoritesService.toggleFavorite(card);
  }
}
