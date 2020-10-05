import {GameObject, SerializedObject} from './GameObject.js';
import {Point, distanceSquared} from './math.js';
import {DeliveryZone} from './DeliveryZone.js';
import { Job } from './Job.js';

export class Package extends GameObject {
  screenX!: number;
  screenY!: number;

  bob = Math.random() * 1000;
  readonly bobSpeed = .006;
  readonly bobAmplitude = 3;

  job?: Job;

  spriteIndex: number;
  static IMAGES: Array<HTMLImageElement>;

  readonly deliveryZone: DeliveryZone;

  static async load() {
    Package.IMAGES = await Promise.all([
      'images/items/package.png',
      'images/items/box1.png',
      'images/items/box2.png',
    ].map(waitForImageToLoad));
  }

  tick(dt: number) {
    this.bob += dt;
    if(!this.deliveryZone) {
      console.error(`Package had no delivery zone! Picking closest one.`);
      (this as any).deliveryZone = game.map.expensivelyFindNearestOfType(DeliveryZone, this);
      if(!this.deliveryZone) throw new Error(`No delivery zone found`);
    }
  }

  dragTowards({x, y}: Point) {
    this.bob = 0;
    const dx = x - this.x;
    const dy = y - this.y;
    const dist = Math.sqrt(Math.pow(dy, 2) + Math.pow(dx, 2)) - 0.5;
    if(dist < 0) return;
    const direction = Math.atan2(dy, dx);
    // const speed = Math.min(dist, TERRAIN_SPEED.road * dt);
    this.x += Math.cos(direction) * dist;
    this.y += Math.sin(direction) * dist;
    game.map.objectMoved(this);
  }

  deliver() {
    game.map.remove(this);
    this.job?.deliverPackage(this);
  }

  static async deserialize(data: SerializedObject&{deliveryZone: DeliveryZone}) {
    await this.load();
    return new Package(data);
  }

  constructor({deliveryZone, ...serialized}: SerializedObject&{deliveryZone: DeliveryZone}) {
    super(serialized);
    this.spriteIndex = Math.floor(1 + Math.random() * 2);
    this.deliveryZone = deliveryZone;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const dest = this.deliveryZone;
    const direction = Math.atan2(dest.center.y - this.y, dest.center.x - this.x);
    ctx.save();
    ctx.translate(this.screenX, this.screenY);
    ctx.scale(1, 0.5);
    ctx.rotate(direction + Math.PI / 4);
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 8;
    ctx.beginPath();
    const angle = Math.max(Math.PI / 8, Math.atan(1 / Math.sqrt(distanceSquared(this, dest))));
    ctx.arc(0, 0, 32, - angle, angle, false)
    ctx.stroke();
    ctx.restore();

    const sprite = this.chooseSprite(this.spriteIndex);
    const bobOffset = Math.sin(this.bob * this.bobSpeed) * this.bobAmplitude;
    ctx.drawImage(sprite, this.screenX - sprite.width / 2, bobOffset + this.screenY - sprite.height / 2);
    ctx.fillText(this.id?.toString() ?? 'PACKAGE WITH NO ID', this.screenX + 30, this.screenY + 30);

    dest.draw(ctx, 0.5);

  }

  chooseSprite(index: number) {
    return Package.IMAGES[index];
  }
}

async function waitForImageToLoad(path: string) {
  const img = new Image();
  img.src = path;
  await new Promise((resolve, reject) => {
    img.addEventListener('load', resolve);
    img.addEventListener('error', reject);
  });
  return img;
}
