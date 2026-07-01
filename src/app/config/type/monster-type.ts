export type MonsterType = 'neutre' | 'fire';

export type MonsterDefintion<
    BaseAttack extends string = string,
    AttackSpe extends string = string,
> = {
    name: string;
    type: MonsterType;
    baseAttack: BaseAttack;
    attackSpeList: AttackSpe[];
};
