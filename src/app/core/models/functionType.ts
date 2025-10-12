import { ExponentialCurve } from '../helpers/function/expo';
import { LinearCurve } from '../helpers/function/linear';
import { Polynomial2Curve } from '../helpers/function/polynomial2';

export type Function = Linear | Expo | Poly2 | Treshold;

export type Linear = {
    name: 'linear';
    parameter: LinearCurve;
};

export type Expo = {
    name: 'exp';
    parameter: ExponentialCurve;
};

export type Poly2 = {
    name: 'poly2';
    parameter: Polynomial2Curve;
};

export type Treshold = {
    name: 'treshold';
    tresholdList: number[];
};
