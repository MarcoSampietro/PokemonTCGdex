import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SearchService } from '../../services/search';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './navbar.html'
})
export class NavbarComponent {

  searchTerm = '';

  constructor(private searchService: SearchService) {}

  onSearchChange() {
    this.searchService.setSearchTerm(this.searchTerm);
  }
}
