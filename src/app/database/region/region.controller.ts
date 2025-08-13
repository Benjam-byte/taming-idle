import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RegionService } from './region.service';
import { Region } from './region.type';

@Injectable({ providedIn: 'root' })
export class RegionController {
  service = inject(RegionService);

  create(region: Omit<Region, 'id'>): Observable<Region> {
    return this.service.create(region);
  }

  get(regionName: string): Observable<Region | undefined> {
    return this.service.findByName(regionName);
  }

  getAll(): Observable<Region[]> {
    return this.service.list();
  }

  updateOne(id: string, region: Region): Observable<Region> {
    return this.service.update(id, region);
  }

  delete(id: string): Observable<boolean> {
    return this.service.remove(id);
  }
}
