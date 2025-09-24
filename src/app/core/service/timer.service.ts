import { Injectable, OnDestroy } from '@angular/core';

type ReqName = 'setTimeout' | 'clearTimeout' | 'setInterval' | 'clearInterval';
type TimerReq = { name: ReqName; fakeId: number; time?: number };
type TimerRes = { fakeId: number };

type Stored = {
    callback: Function;
    params: unknown[];
    isTimeout: boolean;
};

@Injectable({ providedIn: 'root' })
export class TimersService implements OnDestroy {
    private worker?: Worker;
    private callbacks = new Map<number, Stored>();
    private lastId = 0;
    private readonly MAX_ID = 0x7fffffff;

    constructor() {
        if (typeof Worker !== 'undefined') {
            this.worker = new Worker(
                new URL('../../workers/timer.worker', import.meta.url),
                { type: 'module' }
            );
            this.worker.onmessage = (event: MessageEvent<TimerRes>) => {
                const { fakeId } = event.data;
                const entry = this.callbacks.get(fakeId);
                if (!entry) return;
                const { callback, params, isTimeout } = entry;
                if (isTimeout) this.callbacks.delete(fakeId);
                try {
                    callback(...params);
                } catch (err) {
                    console.error('[TimersService] callback error', err);
                }
            };
            this.worker.onerror = (e) =>
                console.error('[TimersService] worker error', e);
            addEventListener('beforeunload', () => this.worker?.terminate());
        } else {
            console.warn(
                '[TimersService] Web Workers not supported; falling back to native timers.'
            );
        }
    }

    ngOnDestroy(): void {
        this.worker?.terminate();
    }

    setTimeout(
        fn: (...a: unknown[]) => void,
        ms = 0,
        ...params: unknown[]
    ): number {
        const id = this.nextId();
        this.callbacks.set(id, { callback: fn, params, isTimeout: true });
        if (this.worker) {
            this.worker.postMessage({
                name: 'setTimeout',
                fakeId: id,
                time: ms,
            });
        } else {
            const native = setTimeout(() => {
                this.callbacks.delete(id);
                fn(...params);
            }, ms);
            this.callbacks.set(id, {
                callback: () => clearTimeout(native),
                params: [],
                isTimeout: true,
            });
        }
        return id;
    }

    clearTimeout(id: number): void {
        if (!this.callbacks.has(id)) return;
        this.callbacks.delete(id);
        if (this.worker) {
            this.worker.postMessage({
                name: 'clearTimeout',
                fakeId: id,
            });
        }
    }

    setInterval(
        fn: (...a: unknown[]) => void,
        ms = 0,
        ...params: unknown[]
    ): number {
        const id = this.nextId();
        this.callbacks.set(id, { callback: fn, params, isTimeout: false });
        if (this.worker) {
            this.worker.postMessage({
                name: 'setInterval',
                fakeId: id,
                time: ms,
            });
        } else {
            const native = setInterval(() => fn(...params), ms);
            this.callbacks.set(id, {
                callback: () => clearInterval(native),
                params: [],
                isTimeout: false,
            });
        }
        return id;
    }

    clearInterval(id: number): void {
        if (!this.callbacks.has(id)) return;
        this.callbacks.delete(id);
        if (this.worker) {
            this.worker.postMessage({
                name: 'clearInterval',
                fakeId: id,
            });
        }
    }

    private nextId(): number {
        do this.lastId = this.lastId === this.MAX_ID ? 1 : this.lastId + 1;
        while (this.callbacks.has(this.lastId));
        return this.lastId;
    }
}
