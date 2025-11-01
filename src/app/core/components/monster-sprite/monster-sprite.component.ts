import { CommonModule } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    ElementRef,
    inject,
    input,
    signal,
    ViewChild,
} from '@angular/core';

@Component({
    selector: 'app-monster-sprite',
    imports: [CommonModule],
    templateUrl: './monster-sprite.component.html',
    styleUrl: './monster-sprite.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MonsterSpriteComponent implements AfterViewInit {
    @ViewChild('canvas', { static: true })
    canvasRef!: ElementRef<HTMLCanvasElement>;

    spritePath = input.required<string>();
    frameIndex = 0;
    frameCount = 10;
    frameWidth = 1024;
    frameHeight = 1024;
    frameDuration = 100;
    lastUpdate = performance.now();

    displaySize = signal(0); // ← taille dynamique du canvas en px
    sprite = new Image();

    destroyRef = inject(DestroyRef);

    ngAfterViewInit(): void {
        this.sprite.src = this.spritePath();
        this.sprite.onload = () => {
            this.observeCanvasSize();
            this.animate();
        };
    }

    observeCanvasSize(): void {
        const canvasEl = this.canvasRef.nativeElement;
        const ctx = canvasEl.getContext('2d')!;
        const ro = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const cssW = Math.floor(entry.contentRect.width);
                if (cssW <= 0) return; // parent pas encore visible → on attend

                // Taille bitmap = CSS * DPR (HiDPI)
                const dpr = Math.max(1, window.devicePixelRatio || 1);
                canvasEl.width = Math.max(1, Math.floor(cssW * dpr));
                canvasEl.height = Math.max(1, Math.floor(cssW * dpr));

                // Dessiner en coordonnées CSS
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

                this.displaySize.set(cssW);
                // Dessine tout de suite une frame visible
                if (this.sprite.complete) {
                    this.drawFrame(ctx, cssW);
                }
            }
        });
        ro.observe(canvasEl);
        this.destroyRef.onDestroy(() => ro.disconnect());
    }

    animate(): void {
        const ctx = this.canvasRef.nativeElement.getContext('2d')!;
        const step = (time: number) => {
            const size = this.displaySize();
            if (size > 0 && this.sprite.complete) {
                if (time - this.lastUpdate >= this.frameDuration) {
                    this.frameIndex = (this.frameIndex + 1) % this.frameCount;
                    this.lastUpdate = time;
                    this.drawFrame(ctx, size);
                }
            }
            requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }

    drawFrame(ctx: CanvasRenderingContext2D, size: number): void {
        ctx.clearRect(0, 0, size, size);
        ctx.drawImage(
            this.sprite,
            0,
            this.frameIndex * this.frameHeight,
            this.frameWidth,
            this.frameHeight,
            0,
            0,
            size,
            size
        );
    }
}
