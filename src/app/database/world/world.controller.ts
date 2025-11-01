import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { WorldService } from './world.service';
import { availableRegion, World } from './world.type';

const defaultWorld: {
    regionUnlocked: availableRegion[];
    region: availableRegion;
    skillTreeAvailable: boolean;
    offrandeAvailable: boolean;
    monsterAvailable: boolean;
    metaGodAvailable: boolean;
    firstRelicDroppped: boolean;
    worldMapAvailable: boolean;
    bestiaryAvailable: boolean;
    regionAvailable: boolean;
    relicAvailable: boolean;
    incubateurAvailable: boolean;
    monsterLevel: number;
    tutoPassed: boolean;
} = {
    regionUnlocked: ['plaine'],
    region: 'plaine',
    skillTreeAvailable: false,
    offrandeAvailable: false,
    monsterAvailable: false,
    metaGodAvailable: false,
    firstRelicDroppped: false,
    worldMapAvailable: false,
    bestiaryAvailable: false,
    regionAvailable: false,
    relicAvailable: false,
    incubateurAvailable: false,
    monsterLevel: 1,
    tutoPassed: false,
};

@Injectable({ providedIn: 'root' })
export class WorldController {
    service = inject(WorldService);

    init() {
        return this.service.create(defaultWorld);
    }

    create(world: Omit<World, 'id'>): Observable<World> {
        return this.service.create(world);
    }

    get(): Observable<World> {
        return this.service.get();
    }

    update(id: string, world: Partial<Omit<World, 'id'>>): Observable<World> {
        return this.service.update(id, world);
    }

    dropTable(): Observable<void> {
        return this.service.dropTable();
    }
}
