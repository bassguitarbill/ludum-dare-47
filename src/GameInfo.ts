import { GameObject } from "./GameObject.js";
import { Job, JobManifest } from "./Job.js";
import { MessageBar } from "./MessageBar.js";
import { Package } from "./Package.js";
import { PackageSpawn } from "./PackageSpawn.js";
import { removeFromArray, distanceSquared } from './math.js';
import { Car } from './Car.js';
import { GhostCar } from './RespawnPoint.js';
import { DeliveryZone } from './DeliveryZone.js';
import { runTutorialEvents } from "./TutorialEvents.js";
import { Audio } from './Audio.js';

export abstract class GameInfo {
  currentlyHeldPackages = 0;
  score = 0;
  messageBar?: MessageBar;

  abstract timeRemaining: number;

  incrementPackages(num = 1) {
    this.currentlyHeldPackages += num;
    // game.hud.messageBar.setNewMessage(`You have collected ${this.currentlyHeldPackages} so far!`);
  }

  fallInWater() {
    if (this.currentlyHeldPackages > 0) {
      this.currentlyHeldPackages = 0;
    };
  }

  deliverPackage(pkg: GameObject) {
    if (pkg instanceof Package) {
      game.hud.messageBar.setNewMessage(`You delivered package number ${pkg.id}!`)
      pkg.deliver();
      this.currentlyHeldPackages--;
      this.checkForJobComplete();
    } else {
      console.error('Tried to deliver something that wasn\'t a package', pkg)
    }
  }

  checkForJobComplete() {
    if (!game.map.objects.find(o => o instanceof Package)) {
      game.hud.messageBar.setNewMessage('Job complete!')
    }
  }

  abstract tick(dt: number): void;
}

export class StaticGameInfo extends GameInfo {
  timeRemaining = Infinity;

  constructor(delay: number) {
    super();
    setTimeout(() => Audio.playMusic('intro', 13.640, 25.633), 1000);
    runTutorialEvents(delay);
  }

  tick() {
    // do nothing because this uses setTimeout. It probably shouldn't, but w/e.
  }
}

export class DynamicGameInfo extends GameInfo {
  private readonly jobs: Job[] = [];

  timeUntilNextJob = 60_000;
  minTimeBetweenJobs = 5_000;
  maxTimeBetweenJobs = 30_000

  minDeliveriesPerJob = 1;
  maxDeliveriesPerJob = 3;

  // When crating jobs, pick the n closest spawn points.
  numClosestSpawnersToChooseFrom = 3;

  timeRemaining = 60_000;

  constructor() {
    super();
    Audio.playMusic('truckin', 2.097);
  }

  tick(dt: number) {
    if(!this.jobs.length) this.createNewJob();

    this.timeUntilNextJob -= dt;

    if(this.timeUntilNextJob < 0) this.createNewJob();

    this.timeRemaining -= dt;
    if(this.timeRemaining <= 0) game.over = true;
  }

  private createNewJob() {
    this.timeUntilNextJob = randomBetween(this.minTimeBetweenJobs, this.maxTimeBetweenJobs);


    const source = this.chooseSource();
    const destinations = this.chooseDestinations();

    const deliveries = Array.from(this.createDeliveries(source, destinations));

    const score = deliveries
      .map(d => distanceSquared(d.destination, d.spawner))
      .reduce((l, r) => l + r);

    const manifest: JobManifest = {
      deliveries: deliveries.map(d => ({
        spawnerId: d.spawner.id!,
        destinationId: d.destination.id!,
      })),
      description: 'do a job',
      timeAdd: 30_000,
      score: Math.floor(score * 100)/100,
    };

    const job = Job.fromManifest(manifest, () => {
      removeFromArray(job, this.jobs);
      console.log(`it's done now`);
    });

    this.jobs.push(job);
  }

  private *createDeliveries(source: PackageSpawn, destinations: DeliveryZone[]) {
    const numDeliveries = randomBetween(this.minDeliveriesPerJob, this.maxDeliveriesPerJob);
    for(let i = 0; i < numDeliveries; i++) {
      const delivery = {
        spawner: source,
        destination: destinations[randomBetween(0, destinations.length)],
      }
      yield delivery;
    }
  }

  private chooseSource() {
    let sources = game.map.expensivelyFindObjectsOfType(PackageSpawn);
    if(!sources.length) throw new Error(`No package sources, can't start a new job!`);

    const car = game.map.expensivelyFindObjectsOfType(Car)[0] ?? game.map.expensivelyFindObjectsOfType(GhostCar)[0];
    if(car) {
      sources.sort((l, r) => distanceSquared(l, car) - distanceSquared(r, car));
      sources = sources.slice(0, 3);
    }

    return sources[randomBetween(0, sources.length)];
  }

  private chooseDestinations() {
    // TODO: pick them less arbitrarily?
    return game.map.expensivelyFindObjectsOfType(DeliveryZone);
  }
}

function randomBetween(min: number, max: number) {
  return min + Math.floor(Math.random() * (max - min));
}
