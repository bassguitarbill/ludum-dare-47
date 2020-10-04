import { GameMap } from "./GameMap.js";
import { MessageBar } from "./MessageBar.js";
import { Minimap } from "./Minimap.js";

export class HUD {
  readonly minimap: Minimap;
  readonly messageBar: MessageBar;
  readonly fpsCounter: FPSCounter;
  readonly hudElementList: Array<HUDElement> = [];
  constructor(map: GameMap) {
    this.minimap = new Minimap(map);
    this.messageBar = new MessageBar();
    this.fpsCounter = new FPSCounter();
    this.addHUDElement(this.minimap);
    this.addHUDElement(this.messageBar);
    this.addHUDElement(this.fpsCounter);
  }

  addHUDElement(el: HUDElement) {
    this.hudElementList.push(el);
    return el;
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.hudElementList.forEach(el => el.draw(ctx));
  }

  tick(dt: number) {
    this.hudElementList.forEach(el => el.tick(dt));
  }
}

export interface HUDElement {
  draw(ctx: CanvasRenderingContext2D): void;
  tick(timestamp: number): void;
}

class FPSCounter implements HUDElement{
  fps = '';
  tick(dt: number) {
    this.fps = String((1000 / dt).toFixed(0))
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "black";
    ctx.textAlign = 'left';
    ctx.font = '12px sans-serif';
    ctx.fillText(this.fps, 0, 10);
  }
}