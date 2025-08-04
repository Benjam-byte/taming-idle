import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { SkillNode } from './skill-node.type';
import { CommonModule } from '@angular/common';
import Profession from 'src/app/core/value-object/profession';

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
    return Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      text: i % 2 === 0 ? profession.bonusA : profession.bonusB,
      active: i < profession.level,
    }));
  });
}
