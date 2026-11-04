import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-icon-chevron-right',
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
        d="M184.49,136.49l-80,80a12,12,0,0,1-17-17L159,128,87.51,56.49a12,12,0,0,1,17-17l80,80A12,12,0,0,1,184.49,136.49Z"
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
export class ChevronRightIcon {
  readonly size = input<number | string>(32);
  readonly strokeWidth = input(0);
}
