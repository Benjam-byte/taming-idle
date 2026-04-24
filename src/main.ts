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

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    importProvidersFrom(
      IonicStorageModule.forRoot({
        name: '__myappdb', // DB name
        storeName: 'keyval', // table/keyspace
        driverOrder: [
          Drivers.SecureStorage,
          Drivers.IndexedDB,
          Drivers.LocalStorage,
        ],
      }),
    ),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideAppInitializer(() => {
      const databaseBootstrapService = inject(DatabaseBootstrapService);
      const pixiAssetService = inject(PixiAssetService);

      return databaseBootstrapService.ensureInitialized().then(() => {
        return pixiAssetService.init();
      });
    }),
  ],
});
