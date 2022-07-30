import { Component, HostListener } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@aspnet/signalr';

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
    this._hubConnection.on('Update', (data: any) => {
      console.log(data);
      var canvas = <HTMLCanvasElement>document.getElementById("game-canvas");
      var ctx = canvas.getContext("2d");

      var image = new Image();
      image.onload = function() {
        ctx.drawImage(image, 0, 0);
      };
      image.src = 'data:image/png;base64,' + data.map.originalImage;

      var image2 = new Image();
      image2.onload = function() {
        ctx.drawImage(image2, data.hero.x - 8, data.hero.y);
      };
      image2.src = 'data:image/png;base64,' + data.hero.sprite;

      var image3 = new Image();
      image3.onload = function() {
        ctx.drawImage(image3, data.npc.x - 8, data.npc.y);
      };
      image3.src = 'data:image/png;base64,' + data.npc.sprite;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
    })
  }
}
