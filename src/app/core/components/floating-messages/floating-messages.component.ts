import { Component } from '@angular/core';

interface FloatingMessage {
  id: number;
  text: string;
  x: number;
  y: number;
}

@Component({
  selector: 'app-floating-messages',
  imports: [],
  templateUrl: './floating-messages.component.html',
  styleUrl: './floating-messages.component.scss',
})
export class FloatingMessagesComponent {
  messages: FloatingMessage[] = [];
  private idCounter = 0;

  showMessage(text: string, x: number, y: number) {
    const id = this.idCounter++;
    const message: FloatingMessage = { id, text, x, y };
    this.messages.push(message);

    setTimeout(() => {
      this.messages = this.messages.filter((msg) => msg.id !== id);
    }, 1000);
  }
}
