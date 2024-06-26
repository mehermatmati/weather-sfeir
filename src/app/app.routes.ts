import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainCurrentWeatherComponent } from './features/current-weather/main-current-weather/main-current-weather.component';
import { MainForecastsComponent } from './features/forecasts/main-forecasts/main-forecasts.component';

export const routes: Routes = [
  {
    path: '', redirectTo: '/today', pathMatch: 'full'
  },
  {
    path: 'today', loadChildren: () => import('./features/current-weather/current-weather.module').then(m => m.CurrentWeatherModule)
  },
  {
    path: 'forecast', loadChildren: () => import('./features/forecasts/forecasts.module').then(m => m.ForecastsModule)
  },
  { path: '**', redirectTo: '/today', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
