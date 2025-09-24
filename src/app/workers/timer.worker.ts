type ReqName = 'setTimeout' | 'clearTimeout' | 'setInterval' | 'clearInterval';
type TimerReq = { name: ReqName; fakeId: number; time?: number };
type TimerRes = { fakeId: number };

const fakeIdToId = new Map<number, number>();

addEventListener('message', (event: MessageEvent<TimerReq>) => {
    const { name, fakeId, time = 0 } = event.data;

    switch (name) {
        case 'setTimeout': {
            const id = setTimeout(() => {
                (postMessage as any)({ fakeId } satisfies TimerRes);
                fakeIdToId.delete(fakeId);
            }, time) as unknown as number;
            fakeIdToId.set(fakeId, id);
            break;
        }
        case 'clearTimeout': {
            const id = fakeIdToId.get(fakeId);
            if (id !== undefined) {
                clearTimeout(id);
                fakeIdToId.delete(fakeId);
            }
            break;
        }
        case 'setInterval': {
            const id = setInterval(() => {
                (postMessage as any)({ fakeId } satisfies TimerRes);
            }, time) as unknown as number;
            fakeIdToId.set(fakeId, id);
            break;
        }
        case 'clearInterval': {
            const id = fakeIdToId.get(fakeId);
            if (id !== undefined) {
                clearInterval(id);
                fakeIdToId.delete(fakeId);
            }
            break;
        }
    }
});
