// --- small, safe LS helpers --- //
export function safeGetNumber(key: string): number | null {
    try {
        const raw = localStorage.getItem(key);
        if (raw == null) return null;
        const n = Number(raw);
        return n;
    } catch {
        return null;
    }
}

export function safeSetNumber(key: string, value: number): void {
    try {
        localStorage.setItem(key, String(value));
    } catch {
        throw new Error('LocalStorage error');
    }
}
