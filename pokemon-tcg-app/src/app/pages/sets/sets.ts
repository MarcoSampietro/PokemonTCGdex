import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CardService, TcgSet, TcgCardBrief } from '../../services/card';

@Component({
  selector: 'app-sets',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './sets.html'
})
export class SetsComponent implements OnInit {
  sets: TcgSet[] = [];
  selectedSet: TcgSet | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private cardService: CardService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadSet(id);
      } else {
        this.loadSets();
      }
    });
  }

  loadSets(): void {
    this.loading = true;
    this.error = null;
    this.selectedSet = null;

    this.cardService.getSets().subscribe({
      next: sets => {
        this.sets = sets;
        this.loading = false;
      },
      error: () => {
        this.error = 'Errore nel caricamento dei set.';
        this.loading = false;
      }
    });
  }

  loadSet(id: string): void {
    this.loading = true;
    this.error = null;

    this.cardService.getSetById(id).subscribe({
      next: set => {
        this.selectedSet = set;
        this.loading = false;
      },
      error: () => {
        this.error = 'Errore nel caricamento del set.';
        this.loading = false;
      }
    });
  }

  get cards(): TcgCardBrief[] {
    return this.selectedSet?.cards ?? [];
  }
}
