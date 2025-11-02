import { inject, Injectable } from '@angular/core';
import { concatMap, from, Observable } from 'rxjs';
import { MetaGodService } from './meta-god.service';
import { MetaGodPower } from 'src/app/core/config/metaGodPower';
import { MetaGodOption } from './meta-god.type';

@Injectable({ providedIn: 'root' })
export class MetaGodController {
    service = inject(MetaGodService);

    init() {
        return from(MetaGodPower).pipe(
            concatMap((powerList) => this.create(powerList))
        );
    }

    create(MetaGod: Omit<MetaGodOption, 'id'>): Observable<MetaGodOption[]> {
        return this.service.create(MetaGod);
    }

    getAll(): Observable<MetaGodOption[]> {
        return this.service.get();
    }

    update(
        id: string,
        MetaGod: Partial<Omit<MetaGodOption, 'id'>>
    ): Observable<MetaGodOption[]> {
        return this.service.update(id, MetaGod);
    }

    dropTable(): Observable<void> {
        return this.service.dropTable();
    }
}
