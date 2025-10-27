import { Component, effect, ElementRef, inject } from '@angular/core';
import { FlashOverlayService } from '../../service/Ui/flash-overlay';

@Component({
    selector: 'app-flash-overlay',
    templateUrl: './flash-overlay.component.html',
    styleUrls: ['./flash-overlay.component.scss'],
})
export class FlashOverlayComponent {
    host = inject(ElementRef<HTMLElement>);
    svc = inject(FlashOverlayService);

    constructor() {
        effect(() => {
            const { duration, color, peakOpacity } = this.svc.options();

            const el = this.host.nativeElement.querySelector(
                '.overlay'
            ) as HTMLDivElement;
            if (!el) return;

            (el as any).getAnimations?.().forEach((a: any) => a.cancel());

            el.animate(
                [
                    { backgroundColor: color, opacity: 0 },
                    {
                        backgroundColor: color,
                        opacity: peakOpacity,
                        offset: 0.25,
                    },
                    { backgroundColor: color, opacity: 0 },
                ],
                {
                    duration,
                    easing: 'ease-out',
                    iterations: 1,
                    fill: 'both',
                }
            );
        });
    }
}
