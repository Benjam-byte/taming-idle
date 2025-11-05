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
        offlineProgress: Omit<OfflineValueProgress, 'id'>
    ): Observable<OfflineValueProgress> {
        return this.service.create(offlineProgress);
    }

    get(): Observable<OfflineValueProgress> {
        return this.service.get();
    }

    update(
        id: string,
        offlineProgress: Partial<Omit<OfflineValueProgress, 'id'>>
    ): Observable<OfflineValueProgress> {
        return this.service.update(id, offlineProgress);
    }

    dropTable(): Observable<void> {
        return this.service.dropTable();
    }
}
