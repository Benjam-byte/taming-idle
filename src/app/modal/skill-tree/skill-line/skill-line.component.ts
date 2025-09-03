import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { SkillNode } from './skill-node.type';
import { CommonModule } from '@angular/common';
import { Profession } from 'src/app/database/profession/profession.type';

@Component({
  selector: 'app-skill-line',
  imports: [CommonModule],
  templateUrl: './skill-line.component.html',
  styleUrl: './skill-line.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkillLineComponent {
  color = input<string>();
  profession = input<Profession>();

  nodes = computed<SkillNode[]>(() => {
    const profession = this.profession();
    if (!profession) return [];

    const level = profession.level;

    return Array.from({ length: 10 }, (_, i) => {
      let text: string;
      if (i % 2 === 0) {
        text = profession.bonusA;
      } else {
        text = profession.bonusB;
      }

      return {
        id: i,
        text,
        active: i < level,
      };
    });
  });
}
