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
import { IonicStorageModule } from '@ionic/storage-angular';
import {
    importProvidersFrom,
    inject,
    provideAppInitializer,
} from '@angular/core';
import { DatabaseBootstrapService } from './database-bootstrap';

bootstrapApplication(AppComponent, {
    providers: [
        { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
        provideIonicAngular(),
        provideAppInitializer(() => {
            const dbBootstrap = inject(DatabaseBootstrapService);
            return dbBootstrap.ensureInitialized();
        }),
        provideRouter(routes, withPreloading(PreloadAllModules)),
        importProvidersFrom(
            IonicStorageModule.forRoot({
                name: '__myappdb', // DB name
                storeName: 'keyval', // table/keyspace
                driverOrder: [
                    Drivers.SecureStorage,
                    Drivers.IndexedDB,
                    Drivers.LocalStorage,
                ],
            })
        ),
    ],
});
