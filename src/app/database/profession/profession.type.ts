import { ProfessionName } from 'src/app/core/enum/profession-name.enum';
import { Function } from 'src/app/core/models/functionType';

export type Profession = {
    id: string;
    index: number;
    name: ProfessionName;
    description: string;
    value: { stat: string; value: number; description: string };
    image: { 10: string; 20: string; 30: string };
    function: Function;
};
