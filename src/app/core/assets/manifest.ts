function asset(path: string): string {
  const baseHref = document.querySelector('base')?.getAttribute('href') ?? '/';
  return new URL(path, window.location.origin + baseHref).toString();
}

export const manifest = {
  bundles: [
    {
      name: 'world-core',
      assets: [
        { alias: 'plaine1', src: asset('assets/map/plaine/Plaine_1.webp') },
        { alias: 'plaine2', src: asset('assets/map/plaine/Plaine_2.webp') },
        { alias: 'plaine3', src: asset('assets/map/plaine/Plaine_3.webp') },
        { alias: 'plaine4', src: asset('assets/map/plaine/Plaine_4.webp') },
        { alias: 'plaine5', src: asset('assets/map/plaine/Plaine_5.webp') },
        { alias: 'plaine6', src: asset('assets/map/plaine/Plaine_6.webp') },
        { alias: 'wheat', src: asset('assets/object/Wheat.webp') },
        { alias: 'Soul', src: asset('assets/object/Soul.webp') },
        {
          alias: 'Glitched_stone',
          src: asset('assets/object/Glitched_Stone.webp'),
        },
      ],
    },
    {
      name: 'spritesheet',
      assets: [
        {
          alias: 'slime_0',
          src: asset('assets/monster/sprite/slime_base/output_0.png'),
        },
        {
          alias: 'slime_1',
          src: asset('assets/monster/sprite/slime_base/output_1.png'),
        },
        {
          alias: 'slime_2',
          src: asset('assets/monster/sprite/slime_base/output_2.png'),
        },
        {
          alias: 'slime_3',
          src: asset('assets/monster/sprite/slime_base/output_3.png'),
        },
        {
          alias: 'slime_4',
          src: asset('assets/monster/sprite/slime_base/output_4.png'),
        },
        {
          alias: 'slime_5',
          src: asset('assets/monster/sprite/slime_base/output_5.png'),
        },
        {
          alias: 'slime_6',
          src: asset('assets/monster/sprite/slime_base/output_6.png'),
        },
        {
          alias: 'slime_7',
          src: asset('assets/monster/sprite/slime_base/output_7.png'),
        },
        {
          alias: 'slime_8',
          src: asset('assets/monster/sprite/slime_base/output_8.png'),
        },
        {
          alias: 'slime_9',
          src: asset('assets/monster/sprite/slime_base/output_9.png'),
        },
      ],
    },
  ],
};
