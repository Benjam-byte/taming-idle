import { Function } from '../../models/functionType';
import { ExponentialCurve } from './expo';
import { LinearCurve } from './linear';
import { Polynomial2Curve } from './polynomial2';

export function calculateMathFunction(mathFunc: Function, n: number) {
    switch (mathFunc.name) {
        case 'linear':
            return LinearCurve(n, mathFunc.parameter);
        case 'exp':
            return ExponentialCurve(n, mathFunc.parameter);
        case 'poly2':
            return Polynomial2Curve(n, mathFunc.parameter);
        default:
            throw new Error('unable to find the function');
    }
}
