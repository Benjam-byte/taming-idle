import { Pipe, PipeTransform } from '@angular/core';
import { roundTo } from '../helpers/rounding-function';

@Pipe({ name: 'roundTo', pure: true })
export class RoundToPipe implements PipeTransform {
    transform(value: number | null | undefined, factor: number): number | null {
        if (
            value == null ||
            !Number.isFinite(value) ||
            !Number.isFinite(factor) ||
            factor === 0
        ) {
            return value ?? null;
        }
        return roundTo(value, factor);
    }
}
