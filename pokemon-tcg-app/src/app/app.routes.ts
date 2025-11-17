import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { CardDetailComponent } from './pages/card-detail/card-detail';
import { FavoritesComponent } from './pages/favorites/favorites';
import { SetsComponent } from './pages/sets/sets';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'card/:id', component: CardDetailComponent },
  { path: 'favorites', component: FavoritesComponent },
  { path: 'sets', component: SetsComponent },
  { path: 'sets/:id', component: SetsComponent },
  { path: '**', redirectTo: '' }
];
