export class Audio {
  static readonly audioContext = new AudioContext();
  static soundLibrary: {[key in string]: AudioBuffer} = {};
  static async load(path: string, name: string) {
    (window as any).ac = Audio.audioContext;
    this.soundLibrary[name] = await loadAudioAsync(path, Audio.audioContext);
  }

  static play(trackName: string, loopStart = -1, loopEnd = 0) {
    const bufferSource = Audio.audioContext.createBufferSource();
    bufferSource.buffer = Audio.soundLibrary[trackName];
    bufferSource.connect(Audio.audioContext.destination);
    bufferSource.loop = loopStart !== -1;
    console.log(loopStart, bufferSource.loop)
    if (bufferSource.loop) {
      console.log('yes')
      bufferSource.loopStart = loopStart;
      bufferSource.loopEnd = loopEnd || bufferSource.buffer.duration;
    }
    bufferSource.start(0);
    console.log('playing ' + trackName)
  }
}

async function loadAudioAsync(url: string, audioContext: AudioContext) {
  const response = await fetch(url);
  console.log(`Parsing ${url}`);
  if(response.status < 200 || response.status > 400) {
    const msg = `Error parsing ${url}`
    console.log(msg);
    throw new Error(msg);
  }
  try {
    const audio = await parseAudio(audioContext, await response.arrayBuffer());
    console.log('finished parsing ' + url);
    return audio;
  } catch (e) {
    console.log(e.message);
    throw e;
  }
}

function parseAudio(ctx: AudioContext, buffer: ArrayBuffer) {
  return new Promise<AudioBuffer>((resolve, reject) => {
    ctx.decodeAudioData(buffer, resolve, reject);
  });
}