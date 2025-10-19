import { Trait } from 'src/app/database/tamedMonster/tamed-monster.type';
import { TraitName } from '../enum/trait.enum';

export const traitList: Trait[] = [
    {
        name: TraitName.Multiskilled,
        description:
            'capable de faire tous les metiers mais sans jamais pouvoir depacer le tier confirmé',
    },
    {
        name: TraitName.Agile,
        description: "Il saute de deux case si c'est vide",
    },
    {
        name: TraitName.Renifleur,
        description: 'Bonus de +25% en pistage',
    },
    {
        name: TraitName.MainVerte,
        description: "ramasse tous le blé d'un coup",
    },
];
