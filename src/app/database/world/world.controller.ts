import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { WorldService } from './world.service';
import { World } from './world.type';

@Injectable({ providedIn: 'root' })
export class WorldController {
  service = inject(WorldService);

  create(world: Omit<World, 'id'>): Observable<World> {
    return this.service.create(world);
  }

  get(): Observable<World | undefined> {
    return this.service.get();
  }

  update(id: string, world: World): Observable<World> {
    return this.service.update(id, world);
  }
}
