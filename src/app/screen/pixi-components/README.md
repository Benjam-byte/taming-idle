# Architecture Pixi

Ce dossier contient le code de rendu Pixi utilise par les ecrans Angular.
Le but est de garder des classes courtes, nommees selon leur responsabilite.

## Nommage

- `*-renderer.ts`: dessine avec Pixi. Un renderer peut appeler `clear`, `fill`, `stroke`, `addChild`, `removeChild` ou `destroy`.
- `*-layout.ts`: calcule les tailles et les positions. Il ne dessine pas.
- `*-source.ts`: lit ou parcourt des donnees du domaine pour les exposer au rendu. Il ne dessine pas.
- `*-resolver.ts` ou `*-state-resolver.ts`: transforme des objets du domaine en etat exploitable pour l'affichage.
- `*-runner.ts`: orchestre une execution dans le temps, par exemple une animation basee sur le ticker Pixi.
- `*.types.ts`: types et config partages par un module Pixi.
- `easing.ts`: fonctions utilitaires pures pour les animations.

## Facades

Les classes principales comme `MapSceneRenderer` ou `MinimapRenderer` sont des facades.
Elles sont consommees par Angular, creent les containers Pixi et deleguent le vrai travail a des classes plus petites.

## Flow

```txt
Angular screen/component
  -> Pixi facade renderer
  -> Layout / Source / Resolver
  -> Specialized renderers
  -> Animation runners and utilities
```

## Regle Simple

Si une classe dessine des pixels, elle s'appelle `Renderer`.
Si elle calcule de la geometrie, elle s'appelle `Layout`.
Si elle lit ou parcourt des donnees, elle s'appelle `Source`.
Si elle derive un etat d'affichage, elle s'appelle `Resolver`.
Si elle pilote une execution dans le temps, elle s'appelle `Runner`.
