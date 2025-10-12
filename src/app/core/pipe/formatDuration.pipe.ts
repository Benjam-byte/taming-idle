import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'formatDuration' })
export class FormatDuration implements PipeTransform {
    private pad2(n: number) {
        return n.toString().padStart(2, '0');
    }

    transform(ms?: number | null): string {
        if (ms == null || !Number.isFinite(ms)) return '00:00';
        const totalSeconds = Math.max(0, Math.floor(ms / 1000));
        const hours = Math.floor(totalSeconds / 3600);

        if (hours >= 1) {
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            return `${this.pad2(hours)}h:${this.pad2(minutes)}`; // hh:mm
        } else {
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;
            return `${this.pad2(minutes)}m:${this.pad2(seconds)}`; // mm:ss
        }
    }
}
