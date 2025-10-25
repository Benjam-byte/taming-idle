import { inject, Injectable } from '@angular/core';
import { ProfessionController } from 'src/app/database/profession/profession.controller';
import { BehaviorSubject, map, of, tap } from 'rxjs';
import { Profession } from 'src/app/database/profession/profession.type';

@Injectable({ providedIn: 'root' })
export class ProfessionManagerService {
    professionControllerService = inject(ProfessionController);

    private _professionlist$!: BehaviorSubject<Profession[]>;

    get professionList() {
        return this._professionlist$.value;
    }

    get professionList$() {
        if (!this._professionlist$) return of(null);
        return this._professionlist$
            .asObservable()
            .pipe(map((list) => [...list].sort((a, b) => a.index - b.index)));
    }

    init$() {
        return this.professionControllerService.getAll().pipe(
            tap(
                (professionList) =>
                    (this._professionlist$ = new BehaviorSubject(
                        professionList
                    ))
            ),
            map(() => void 0)
        );
    }

    getProfessionByName(name: string) {
        return this._professionlist$.value.find(
            (profession) => profession.name === name
        ) as Profession;
    }
}
