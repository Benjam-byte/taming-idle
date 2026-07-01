import { createFeature, createReducer, on } from '@ngrx/store';
import { DEFAULT_LOOT } from 'src/app/database/default-value/loot';
import { Loot } from 'src/app/database/type/loot';
import { LootActions } from './loot.actions';

const initialState: Loot = { ...DEFAULT_LOOT };

export const lootFeature = createFeature({
  name: 'loot',
  reducer: createReducer(
    initialState,
    on(LootActions.hydrate, (_, { loot }) => ({ ...DEFAULT_LOOT, ...loot })),
    on(LootActions.increment, (state, { key, amount }) => ({
      ...state,
      [key]: state[key] + amount,
    })),
    on(LootActions.update, (state, { patch }) => ({ ...state, ...patch })),
    on(LootActions.reset, () => ({ ...DEFAULT_LOOT })),
  ),
});

export const {
  name: lootFeatureName,
  reducer: lootReducer,
  selectLootState,
  selectWheat,
  selectEnchantedwheat,
  selectSoul,
  selectEnchantedSoul,
  selectOpenedChest,
  selectGlitchedStone,
} = lootFeature;
