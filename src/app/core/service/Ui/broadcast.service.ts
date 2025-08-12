import { Injectable } from '@angular/core';

type broadcastMessage = {
  message: string;
};

@Injectable({ providedIn: 'root' })
export class BroadcastService {
  displayMessage(broadcastMessage: broadcastMessage) {
    const message = document.createElement('div');
    message.className = 'broadcast-message';
    message.textContent = broadcastMessage.message;
    document.body.appendChild(message);
    setTimeout(() => {
      message.remove();
    }, 1500);
  }
}
