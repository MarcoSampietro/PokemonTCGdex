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

  cards: TcgCard[] = [];

  // FILTRI
  searchTerm = '';
  selectedType = '';
  selectedRarity = '';
  selectedSet = '';

  types: string[] = [];
  rarities: string[] = [];
  sets: { id: string, name: string }[] = [];

  // PAGINAZIONE
  pageSize = 24;
  currentPage = 1;

  fallbackImage =
    'https://www.estronshop.it/app/public/files/prodotto/immagine-non-disponibile.png';

  constructor(
    private cardService: CardService,
    private favoritesService: FavoritesService
  ) {}

  ngOnInit(): void {
    this.loadFilters();
    this.loadPage(1);
  }

  // -------------------------
  // POPOLAMENTO FILTRI
  // -------------------------
  loadFilters(): void {
    this.cardService.getAllTypes().subscribe(t => this.types = t.sort());
    this.cardService.getAllRarities().subscribe(r => this.rarities = r.sort());

    this.cardService.getAllSets().subscribe(s => {
      this.sets = s
        .map((set: any) => ({ id: set.id, name: set.name }))
        .sort((a: any, b: any) => a.name.localeCompare(b.name));
    });
  }

  // -------------------------
  // LOAD PAGE
  // -------------------------
  loadPage(page: number): void {
    this.loading = true;
    this.error = null;

    // --------- CASO 1: FILTRO PER SET ---------
    if (this.selectedSet) {

      this.cardService.getCardsBySetId(this.selectedSet).subscribe({
        next: (allCards: TcgCard[]) => {

          let filtered = allCards;

          if (this.searchTerm) {
            const term = this.searchTerm.toLowerCase();
            filtered = filtered.filter(c => c.name.toLowerCase().includes(term));
          }

          if (this.selectedType) {
            filtered = filtered.filter(c => c.types?.includes(this.selectedType));
          }

          if (this.selectedRarity) {
            filtered = filtered.filter(c => c.rarity === this.selectedRarity);
          }

          // PAGINAZIONE CLIENT
          const start = (page - 1) * this.pageSize;
          const end = start + this.pageSize;

          this.cards = filtered.slice(start, end);
          this.currentPage = page;

          // DETTAGLI PROGRESSIVI
          this.cards.forEach(card => {
            this.cardService.getCardById(card.id).subscribe(full => {
              Object.assign(card, full);
            });
          });

          this.loading = false;
        },
        error: () => {
          this.error = 'Errore nel caricamento delle carte del set.';
          this.loading = false;
        }
      });

      return;
    }

    // --------- CASO 2: RICERCA GLOBALE /cards ---------
    const filters = {
      name: this.searchTerm || undefined,
      type: this.selectedType || undefined,
      rarity: this.selectedRarity || undefined
    };

    this.cardService.getCardsPage(page, this.pageSize, filters).subscribe({
      next: (baseCards: TcgCard[]) => {
        this.cards = baseCards;
        this.currentPage = page;

        baseCards.forEach(card => {
          this.cardService.getCardById(card.id).subscribe(full => {
            Object.assign(card, full);
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

  // -------------------------
  // EVENTI FILTRI
  // -------------------------
  onSearchChange() { this.loadPage(1); }
  onFilterChange() { this.loadPage(1); }

  // -------------------------
  // PAGINAZIONE
  // -------------------------
  nextPage() { this.loadPage(this.currentPage + 1); }
  prevPage() { if (this.currentPage > 1) this.loadPage(this.currentPage - 1); }

  // -------------------------
  // IMMAGINI
  // -------------------------
  getImageUrl(card: TcgCard) {
    return card.image ? card.image + '/high.webp' : this.fallbackImage;
  }

  onImgError(e: any) {
    e.target.src = this.fallbackImage;
  }

  // -------------------------
  // PREFERITI
  // -------------------------
  isFavorite(card: TcgCard) {
    return this.favoritesService.isFavorite(card.id);
  }

  toggleFavorite(card: TcgCard, e: MouseEvent) {
    e.stopPropagation();
    this.favoritesService.toggleFavorite(card);
  }
}
