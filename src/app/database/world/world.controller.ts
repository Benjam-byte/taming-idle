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
  geometricLootRatio: number;
} = {
  regionUnlocked: ['plaine'],
  region: 'plaine',
  skillTreeAvailable: false,
  offrandeAvailable: true,
  monsterAvailable: false,
  geometricLootRatio: 1.15,
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
