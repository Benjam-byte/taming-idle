import { isDevMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import {
  RouteReuseStrategy,
  provideRouter,
  withPreloading,
  PreloadAllModules,
} from '@angular/router';
import {
  IonicRouteStrategy,
  provideIonicAngular,
} from '@ionic/angular/standalone';
import { Drivers } from '@ionic/storage';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import {
  importProvidersFrom,
  inject,
  provideAppInitializer,
} from '@angular/core';
import { PixiAssetService } from './app/core/assets/PixiAssetService';
import { DatabaseBootstrapService } from './app/database/database-boostrap.service';
import { IonicStorageModule } from '@ionic/storage-angular';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideState } from '@ngrx/store';
import { lootFeature } from './app/store/loot/loot.reducer';
import { lootEffects } from './app/store/loot/loot.effects';
import { worldFeature } from './app/store/world/world.reducer';
import { worldEffects } from './app/store/world/world.effects';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    importProvidersFrom(
      IonicStorageModule.forRoot({
        name: '__myappdb',
        storeName: 'keyval',
        driverOrder: [
          Drivers.SecureStorage,
          Drivers.IndexedDB,
          Drivers.LocalStorage,
        ],
      }),
    ),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideStore(),
    provideState(lootFeature),
    provideState(worldFeature),
    provideEffects(lootEffects, worldEffects),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
    provideAppInitializer(() => {
      const databaseBootstrapService = inject(DatabaseBootstrapService);
      const pixiAssetService = inject(PixiAssetService);

      return databaseBootstrapService.ensureInitialized().then(() => {
        return pixiAssetService.init();
      });
    }),
  ],
});
