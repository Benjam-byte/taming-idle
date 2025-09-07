import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { WorldService } from './world.service';
import { availableMap, World } from './world.type';

const defaultWorld: {
  mapUnlocked: availableMap[];
  map: availableMap;
  skillTreeAvailable: boolean;
  offrandeAvailable: boolean;
  monsterAvailable: boolean;
} = {
  mapUnlocked: ['plaine'],
  map: 'plaine',
  skillTreeAvailable: false,
  offrandeAvailable: false,
  monsterAvailable: false,
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
}
