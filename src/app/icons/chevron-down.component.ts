import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-icon-chevron-down',
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      [attr.width]="size()"
      [attr.height]="size()"
      fill="currentColor"
      stroke="currentColor"
      [attr.stroke-width]="strokeWidth()"
      stroke-linejoin="round"
      viewBox="0 0 256 256"
    >
      <path
        d="M216.49,104.49l-80,80a12,12,0,0,1-17,0l-80-80a12,12,0,0,1,17-17L128,159l71.51-71.52a12,12,0,0,1,17,17Z"
      ></path>
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChevronDownIcon {
  readonly size = input<number | string>(32);
  readonly strokeWidth = input(0);
}
