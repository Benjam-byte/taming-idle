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
