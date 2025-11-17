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
  templateUrl: './home.html'
})
export class HomeComponent implements OnInit {
  loading = false;
  error: string | null = null;

  allCards: TcgCard[] = [];      // tutte le carte
  filteredCards: TcgCard[] = []; // filtrate
  paginatedCards: TcgCard[] = []; // carte da mostrare nella pagina corrente

  searchTerm = '';
  selectedType = '';
  selectedRarity = '';

  types: string[] = [];
  rarities: string[] = [];

  // 👉 PAGINAZIONE
  pageSize = 24;      // 6 carte per pagina
  currentPage = 1;   // pagina corrente
  totalPages = 1;    // calcolato dinamicamente

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

    this.cardService.getCards().subscribe({
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
      const matchType = this.selectedType ? card.types?.includes(this.selectedType) : true;
      const matchRarity = this.selectedRarity ? card.rarity === this.selectedRarity : true;

      return matchName && matchType && matchRarity;
    });

    // 🔁 Reset pagina quando cambia filtro
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredCards.length / this.pageSize);

    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;

    this.paginatedCards = this.filteredCards.slice(start, end);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  onSearchChange(): void { this.applyFilters(); }
  onFilterChange(): void { this.applyFilters(); }

  isFavorite(card: TcgCard): boolean {
    return this.favoritesService.isFavorite(card.id);
  }

  toggleFavorite(card: TcgCard, event: MouseEvent): void {
    event.stopPropagation();
    this.favoritesService.toggleFavorite(card);
  }
}
