/**
 * Format a duration in milliseconds into a human readable string.
 * Examples:
 *  - 650ms -> "0s"
 *  - 5_000ms -> "5s"
 *  - 65_000ms -> "1m 5s"
 *  - 3_600_000ms -> "1h 0m"
 *  - 3_726_000ms -> "1h 2m 6s"
 */
export function formatElapsed(ms: number): string {
    if (ms < 0) return '0s';

    const totalSeconds = Math.floor(ms / 1000);
    const seconds = totalSeconds % 60;
    const minutes = Math.floor((totalSeconds / 60) % 60);
    const hours = Math.floor(totalSeconds / 3600);

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
    } else {
        return `${seconds}s`;
    }
}

export function formatDurationMs(ms: number): string {
    if (ms <= 0) return 'Disponible';

    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');

    return `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
}

/**
 * Transforme un timestamp en ms (différence de temps)
 * en texte lisible : hh:mm:ss
 * Exemple : 7540000 → "02:05:40"
 */
export function formatTimeFromMs(ms: number): string {
    if (ms < 0) ms = 0; // évite les valeurs négatives

    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (n: number) => String(n).padStart(2, '0');

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export function timeUntilAvailable(nextAvailableAt: number): string {
    const now = Date.now();
    const diff = nextAvailableAt - now;
    return formatDurationMs(diff);
}
