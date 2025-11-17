import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FavoritesService } from '../../services/favorites';
import { TcgCard } from '../../services/card';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './favorites.html'
})
export class FavoritesComponent implements OnInit {
  favorites: TcgCard[] = [];

  constructor(private favoritesService: FavoritesService) {}

  ngOnInit(): void {
    this.loadFavorites();
  }

  loadFavorites(): void {
    this.favorites = this.favoritesService.getFavorites();
  }

  remove(card: TcgCard): void {
    this.favoritesService.removeFavorite(card.id);
    this.loadFavorites();
  }
}
