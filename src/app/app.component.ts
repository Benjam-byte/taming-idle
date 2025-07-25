import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor() {}

  spawnClickEffect(event: MouseEvent) {
    const circle = document.createElement('div');
    circle.className = 'click-circle';
    circle.style.left = `${event.clientX}px`;
    circle.style.top = `${event.clientY}px`;

    document.body.appendChild(circle);

    setTimeout(() => {
      circle.remove();
    }, 600);
  }
}
