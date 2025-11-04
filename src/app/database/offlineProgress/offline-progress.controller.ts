import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { OfflineProgressService } from './offline-progress.service';
import { OfflineValueProgress } from './offline-progress.type';

const defaultOfflineProgress = {
    eggProgress: 0,
};

@Injectable({ providedIn: 'root' })
export class OfflineProgressController {
    service = inject(OfflineProgressService);

    init() {
        return this.service.create(defaultOfflineProgress);
    }

    create(
        loot: Omit<OfflineValueProgress, 'id'>
    ): Observable<OfflineValueProgress> {
        return this.service.create(loot);
    }

    get(): Observable<OfflineValueProgress> {
        return this.service.get();
    }

    update(
        id: string,
        loot: Partial<Omit<OfflineValueProgress, 'id'>>
    ): Observable<OfflineValueProgress> {
        return this.service.update(id, loot);
    }

    dropTable(): Observable<void> {
        return this.service.dropTable();
    }
}
