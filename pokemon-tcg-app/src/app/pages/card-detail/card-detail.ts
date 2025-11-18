import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CardService, TcgCard } from '../../services/card';
import { FavoritesService } from '../../services/favorites';

@Component({
  selector: 'app-card-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl:'./card-detail.html'
})
export class CardDetailComponent implements OnInit {
  card: TcgCard | null = null;
  loading = false;
  error: string | null = null;
  isFav = false;
  fallbackImage = 'https://www.estronshop.it/app/public/files/prodotto/immagine-non-disponibile.png';

  getImageUrl(card: TcgCard) {
    // Se l’API non ha la base image → fallback
    if (!card.image) {
      return this.fallbackImage;
    }

    // Costruisce URL alta qualità
    return card.image + '/high.webp';
  }

  onImgError(event: any) {
    // Impedisce loop infinito
    if (event.target.src === this.fallbackImage) return;

    event.target.src = this.fallbackImage;
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cardService: CardService,
    private favoritesService: FavoritesService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'Carta non trovata.';
      return;
    }
    this.fetchCard(id);
  }

  fetchCard(id: string): void {
    this.loading = true;
    this.cardService.getCardById(id).subscribe({
    next: (card: TcgCard) => {
        this.card = card;
        this.isFav = this.favoritesService.isFavorite(card.id);
        this.loading = false;
      },
      error: () => {
        this.error = 'Errore nel caricamento della carta.';
        this.loading = false;
      }
    });
  }

  toggleFavorite(): void {
    if (!this.card) return;
    this.isFav = this.favoritesService.toggleFavorite(this.card);
  }

  goBack(): void {
    this.router.navigateByUrl('/');
  }

  get cardmarketUrl(): string | null {
    if (!this.card) return null;
    const query = encodeURIComponent(
      `${this.card.name} ${this.card.set?.name ?? ''}`.trim()
    );
    return `https://www.cardmarket.com/en/Pokemon/Products/Search?searchString=${query}`;
  }
}
