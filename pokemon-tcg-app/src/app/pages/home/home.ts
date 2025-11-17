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
  fallbackImage = 'https://www.estronshop.it/app/public/files/prodotto/immagine-non-disponibile.png';

  allCards: TcgCard[] = [];
  filteredCards: TcgCard[] = [];
  paginatedCards: TcgCard[] = [];

  searchTerm = '';
  selectedType = '';
  selectedRarity = '';
  selectedSet = '';

  types: string[] = [];
  rarities: string[] = [];
  sets: string[] = [];

  pageSize = 24;
  currentPage = 1;
  totalPages = 1;

  constructor(
    private cardService: CardService,
    private favoritesService: FavoritesService
  ) { }

  ngOnInit(): void {

    // 1️⃣ PROVA A CARICARE DALLA CACHE
    const cached = this.cardService.loadPersistentCache();
    if (cached) {
      this.allCards = cached;
      this.buildFilters();
      this.applyFilters();
      return;
    }

    // 2️⃣ ALTRIMENTI CARICO DALL'API
    this.fetchCards();
  }

  fetchCards(): void {
    this.loading = true;
    this.error = null;

    this.cardService.getCards().subscribe({
      next: baseCards => {
        this.allCards = baseCards;

        // Carica i dettagli completi in background
        baseCards.forEach(card => {
          this.cardService.getCardDetails(card.id).subscribe(full => {

            Object.assign(card, full);

            this.buildFilters();
            this.applyFilters();
          });
        });

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
    const setSet = new Set<string>();

    this.allCards.forEach(card => {
      card.types?.forEach(t => typeSet.add(t));
      if (card.rarity) raritySet.add(card.rarity);
      if (card.set?.name) setSet.add(card.set.name);
    });

    this.types = Array.from(typeSet).sort();
    this.rarities = Array.from(raritySet).sort();
    this.sets = Array.from(setSet).sort();
  }

  applyFilters(): void {
    this.filteredCards = this.allCards.filter(card => {
      const matchName   = card.name.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchType   = this.selectedType ? card.types?.includes(this.selectedType) : true;
      const matchRarity = this.selectedRarity ? card.rarity === this.selectedRarity : true;
      const matchSet    = this.selectedSet ? card.set?.name === this.selectedSet : true;

      return matchName && matchType && matchRarity && matchSet;
    });

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

  onFilterChange(): void { this.applyFilters(); }
  onSearchChange(): void { this.applyFilters(); }

  getImageUrl(card: TcgCard) {
    return card.image ? card.image + '/high.webp' : this.fallbackImage;
  }

  onImgError(event: any) {
    if (event.target.src === this.fallbackImage) return;
    event.target.src = this.fallbackImage;
  }

  isFavorite(card: TcgCard): boolean {
    return this.favoritesService.isFavorite(card.id);
  }

  toggleFavorite(card: TcgCard, event: MouseEvent): void {
    event.stopPropagation();
    this.favoritesService.toggleFavorite(card);
  }
}
