import { Component } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';
import { CountryService } from './core/services/contries.service';
import { LocalStorageService } from './core/services/local-storage.service';
import { WeatherService } from './core/services/weather.service';
import { FeaturesModule } from './features/features.module';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FeaturesModule],
  providers: [LocalStorageService, WeatherService, CountryService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'weatherSfeir';
}
