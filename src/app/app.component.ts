import { Component, HostListener } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@aspnet/signalr';
import { State } from '../app/Types/State';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'rpg-game';
  map: string;
  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent){
    console.log('Key pressed');
    this.keyPressed(event.key);
  }
  private _hubConnection: HubConnection;

  constructor() {
    this.createConnection();
    this.serverEvents();
    this.startConnection();
  }

  keyPressed(key: string) {
    this._hubConnection.invoke('KeyPressed', key);
  }

  private createConnection() {
    this._hubConnection = new HubConnectionBuilder()
      .withUrl('https://localhost:7222/game')
      .build()
  }

  private startConnection() {
    this._hubConnection
      .start()
      .then(() => {
        console.log('Connected');
      })
      .catch(() => {
        setTimeout(() => this.startConnection(), 5000)
      })
  }

  private serverEvents(){
    this._hubConnection.on('Update', (data: State) => {
      console.log(data);
      var canvas = <HTMLCanvasElement>document.getElementById("game-canvas");
      var ctx = canvas.getContext("2d");

      data.gameObjects.forEach(gameObject => {
        var image = new Image();
        image.onload = function() {
          ctx.drawImage(image, gameObject.x, gameObject.y);
        };
        image.src = 'data:image/png;base64,' + gameObject.sprite;
      });

      ctx.clearRect(0, 0, canvas.width, canvas.height);
    })
  }
}
