export const manifest = {
  bundles: [
    {
      name: 'world-core',
      assets: [
        { alias: 'plaine1', src: '/assets/map/plaine/Plaine_1.webp' },
        { alias: 'plaine2', src: '/assets/map/plaine/Plaine_2.webp' },
        { alias: 'plaine3', src: '/assets/map/plaine/Plaine_3.webp' },
        { alias: 'plaine4', src: '/assets/map/plaine/Plaine_4.webp' },
        { alias: 'plaine5', src: '/assets/map/plaine/Plaine_5.webp' },
        { alias: 'plaine6', src: '/assets/map/plaine/Plaine_6.webp' },
        { alias: 'wheat', src: '/assets/object/Wheat.webp' },
        { alias: 'Soul', src: 'assets/object/Soul.webp' },
        { alias: 'Glitched_stone', src: 'assets/object/Glitched_Stone.webp' },
      ],
    },
    {
      name: 'spritesheet',
      assets: [
        {
          alias: 'slime',
          src: '/assets/monster/sprite/slime/SpriteSheet_Slime_Base.webp',
        },
      ],
    },
  ],
};
