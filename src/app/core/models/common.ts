export const ELEMENT_TYPE_LIST = ['neutre', 'feu'] as const
export type ElementType = typeof ELEMENT_TYPE_LIST[number]