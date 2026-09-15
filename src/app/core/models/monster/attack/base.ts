import { ElementType } from "../../common";
import { AttackAnimation } from "./common";

export type BaseAttackName = 'frappe' | 'baffe';

export type BaseAttack = {
  name: BaseAttackName;
  effiency: number;
  type: ElementType;
  description: string;
  animation: AttackAnimation;
};