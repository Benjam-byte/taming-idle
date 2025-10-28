import { Injectable, signal } from '@angular/core';
/**
 * Options pour configurer l'effet de flash d'écran.
 *  Durée totale de l'animation en ms
 *  Couleur du flash (rgba conseillé)
 *  Opacité max atteinte au pic du flash [0..1]
 */
export type FlashOptions = {
    duration: number;
    color: string;
    peakOpacity: number;
};

const DEFAULTS: FlashOptions = {
    duration: 380,
    color: 'rgba(255,0,0,0)',
    peakOpacity: 0.35,
};

@Injectable({ providedIn: 'root' })
export class FlashOverlayService {
    private _tick = signal(0);
    private _options = signal<FlashOptions>(DEFAULTS);

    tick = this._tick.asReadonly();
    options = this._options.asReadonly();

    flash(opts?: Partial<FlashOptions>) {
        const merged = { ...DEFAULTS, ...opts };
        this._options.set(merged);
        this._tick.update((n) => (n === Number.MAX_SAFE_INTEGER ? 0 : n + 1));
    }
}
