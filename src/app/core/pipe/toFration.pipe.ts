import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'toFraction' })
export class ToFractionPipe implements PipeTransform {
    transform(value: number): string {
        if (!value || value === 0) return '0';

        const reciprocal = 1 / value;
        const rounded = Math.round(reciprocal);
        const approx = 1 / rounded;
        const error = Math.abs(approx - value);

        if (error < 1e-8) {
            return `1/${rounded}`;
        }
        return this.approxFraction(value);
    }

    /** Trouve une fraction approchée a/b quand ce n’est pas 1/x */
    private approxFraction(value: number, maxDenominator = 1_000_000): string {
        let bestNumerator = 1;
        let bestDenominator = 1;
        let bestError = Math.abs(value - bestNumerator / bestDenominator);

        for (let d = 1; d <= maxDenominator; d *= 10) {
            const n = Math.round(value * d);
            const err = Math.abs(value - n / d);
            if (err < bestError) {
                bestNumerator = n;
                bestDenominator = d;
                bestError = err;
            }
        }
        return `${bestNumerator}/${bestDenominator}`;
    }
}
