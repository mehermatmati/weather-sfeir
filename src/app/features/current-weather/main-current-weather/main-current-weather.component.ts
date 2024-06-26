import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, Signal, ViewChild, signal } from '@angular/core';
import { catchError, combineLatest, distinctUntilChanged, forkJoin, Observable, of, Subject, switchMap, takeUntil, tap, throwError, timer} from 'rxjs';
import { CountryService } from '../../../core/services/contries.service';
import { LocalStorageService } from '../../../core/services/local-storage.service';
import { WeatherService } from '../../../core/services/weather.service';
import { Status } from '../../../shared/models/enums/status.enum';
import { Location } from '../../../shared/models/location.model';
import { AppConst } from '../../../shared/utils/app.const';
import { ZipcodeEntryComponent } from './zipcode-entry/zipcode-entry.component';

@Component({
  selector: 'app-main-current-weather',
  templateUrl: './main-current-weather.component.html',
  styleUrls: ['./main-current-weather.component.css']
})
export class MainCurrentWeatherComponent implements OnInit, OnDestroy, AfterViewInit{
  @ViewChild(ZipcodeEntryComponent) private _zipcondeEntryComponent : ZipcodeEntryComponent;
  locations : Location[] = [];
  message = signal<string | null>(null);
  countries : string[] = [];
  private _subject$ = new Subject<void>;
  private _observables$: Observable<Location>[] = [];
  constructor(private _weatherService: WeatherService, private _localStorageService: LocalStorageService, private _countryService: CountryService, private _cdr: ChangeDetectorRef){}

  ngOnInit(): void {
    this.initObservable();
    this.getWeathers();
  }

  ngAfterViewInit(): void {
    this.initCountries();
  }

  initObservable() {
    this._observables$ = [];
    let zips = this._localStorageService.getAll();
    for(let zip of zips){
     this._observables$.push(this._weatherService.getWeather(zip));
    }
  }

  getWeathers(){
    timer(1,AppConst.REFRESH_TIME)
    .pipe(
      takeUntil(this._subject$),
      switchMap(() => forkJoin(this._observables$)),
    ).subscribe(data => {this.locations = data});
  }

  receiveAddLocation($event : number) {
        if(this._localStorageService.getAll().includes($event)) {
          this.message.set("The location already exist");
        }
        else {
          this.addWeather($event)
        }
  }

  receiveRemoveWeather($event: number){
    this._localStorageService.removeOne($event);
    this.initObservable();
    this.locations = this.locations.filter(location => location.zip != $event)
  }

  getBtnStateObservable(): Observable<Status> {
    return this._weatherService.buttonState;
  }

  addWeather(zipcode: number){
    this._weatherService._buttonState.next(Status.Loading)
        let getWeather$ =this._weatherService.getWeather(zipcode).pipe(
          tap(data => {
            this.locations = [...this.locations, data];
            this._localStorageService.add(zipcode);
            this.message.set(null);
            this._observables$.push(this._weatherService.getWeather(zipcode));
            this._weatherService._buttonState.next(Status.Done);
        }),
        catchError(error=>  {
          if(error.status = 404){
            this.message.set("No location fouded with you zip");
          }
          this._weatherService._buttonState.next(Status.Initial);
          return throwError(error);
        }));

        let timer$ = timer(AppConst.BUTTON_LOADING_TIME);

        combineLatest([getWeather$, timer$]).pipe(
          takeUntil(this._subject$),
        )
        .subscribe(() => {
          this._weatherService._buttonState.next(Status.Initial);
        });
  }


  initCountries() {
    this._zipcondeEntryComponent.form.controls['country'].valueChanges.pipe(
      switchMap(
        needle =>
        !!needle && needle.length>0 ? this.getCountryObservable(needle) : of([])
       ),
      distinctUntilChanged(),
      takeUntil(this._subject$),
      catchError((error, caught) => caught)
    ).subscribe(data => this.countries = data);
  }

  getCountryObservable(needle : string) : Observable<string[]>{
    return this._countryService.getByName(needle).pipe(
      catchError(() => of([]))
    )
  }

  ngOnDestroy(): void {
    this._subject$.next();
    this._subject$.complete;
  }

}
