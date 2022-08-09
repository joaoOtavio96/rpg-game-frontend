import { AfterViewInit, Component, HostListener } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@aspnet/signalr';
import { State } from '../app/Types/State';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  title = 'rpg-game';
  map: string;
  state: State;
  gameCanvas :HTMLCanvasElement;
  gameCanvasCtx: CanvasRenderingContext2D | null;
  debugCanvas :HTMLCanvasElement;
  debugCanvasCtx: CanvasRenderingContext2D | null;
  longPress: boolean;
  longPressDelay = 200;
  startEvent: KeyboardEvent;
  timer: any;

  @HostListener('document:keyup', ['$event'])
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent){

    if(this.longPress){
      this.keyPressed(event.key);
    }

    if (this.startEvent == null ||
      this.startEvent.type != event.type ||
      this.startEvent.key != event.key) {

      if (this.timer != null) {
        clearTimeout(this.timer);
      }

      this.startEvent = event;

      if(event.type == 'keydown') {
        this.keyPressed(event.key);
        this.timer = setTimeout(() => {
          this.longPress = true;
        }, this.longPressDelay);
      }
    }

    if(event.type == 'keyup' && this.longPress){
      this.longPress = false;
      this.KeyReleased();
    }
  }

  keyPressed(key: string) {
    this._hubConnection.invoke('KeyPressed', key);
  }

  KeyReleased() {
    this._hubConnection.invoke('KeyReleased');
  }

  private _hubConnection: HubConnection;
  constructor() {
    this.createConnection();
    this.serverEvents();
    this.startConnection();
  }

  ngAfterViewInit(): void {
    this.gameCanvas = <HTMLCanvasElement>document.getElementById("game-canvas");
    this.gameCanvasCtx = this.gameCanvas.getContext("2d");
    this.debugCanvas = <HTMLCanvasElement>document.getElementById("game-canvas-debug");
    this.debugCanvasCtx = this.debugCanvas.getContext("2d");

    window.requestAnimationFrame(() => this.drawGame(this.state));
    window.requestAnimationFrame(() => this.drawDebug(this.state));
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
      this.state = data;
    })
  }

  private drawGame(state: State){
    this.gameCanvasCtx.clearRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);

    if(!state){
      window.requestAnimationFrame(() => this.drawGame(this.state));
      return;
    }

    state.gameObjects.forEach(gameObject => {
      var image = new Image();
      image.src = 'data:image/png;base64,' + gameObject.sprite;
      this.gameCanvasCtx.drawImage(image, gameObject.x, gameObject.y);
    });

    window.requestAnimationFrame(() => this.drawGame(this.state));
  }

  private drawDebug(state: State){
    this.debugCanvasCtx.clearRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
    if(!state){
      window.requestAnimationFrame(() => this.drawDebug(this.state));
      return;
    }

    var textY = 20;
    var textX = 2;

    state.gameObjects.forEach(gameObject => {
      this.debugCanvasCtx.fillStyle = '#fff';
      this.debugCanvasCtx.font = '20px Arial';
      this.debugCanvasCtx.fillText(`${gameObject.name} (X: ${gameObject.x}, Y: ${gameObject.y})`, textX, textY);

      textY += 24;
    });

    textY = 20;

    window.requestAnimationFrame(() => this.drawDebug(this.state));
  }
}
