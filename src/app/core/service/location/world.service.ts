import { Injectable, signal } from '@angular/core';
import World from '../../value-object/world';

@Injectable({
  providedIn: 'root',
})
export class WorldService {
  world = signal<World>(new World());

  constructor() {}
}
