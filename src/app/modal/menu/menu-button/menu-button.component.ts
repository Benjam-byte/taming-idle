import {
    ChangeDetectionStrategy,
    Component,
    computed,
    input,
    output,
} from '@angular/core';

@Component({
    selector: 'app-menu-button',
    imports: [],
    templateUrl: './menu-button.component.html',
    styleUrl: './menu-button.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuButtonComponent {
    name = input.required<string>();
    path = input.required<string>();
    isActive = input<boolean>(true);
    isClicked = output<void>();

    imagePath = computed(() =>
        this.isActive() ? this.path() : 'assets/icon/question.png'
    );

    click() {
        if (this.isActive()) this.isClicked.emit();
    }
}
