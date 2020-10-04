const images = new Map<string, Promise<HTMLImageElement>>();

export async function loadImage(src: string) {
  if(images.has(src)) return images.get(src)!;

  const req = new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.src = src;
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
  });

  images.set(src, req);

  return req;
}

export async function loadJson(path: string) {
  const response = await fetch(path);
  if(!response.ok) throw new Error(`Failed to load ${path}: ${response.statusText}`);
  return await response.json();
}

export async function loadAudioAsync(url: string, audioContext: AudioContext) {
  const response = await fetch(url);
  if(response.status < 200 || response.status > 400) {
    const msg = `Error parsing ${url}`
    throw new Error(msg);
  }
  const audio = await parseAudio(audioContext, await response.arrayBuffer());
  return audio;
}

function parseAudio(ctx: AudioContext, buffer: ArrayBuffer) {
  return new Promise<AudioBuffer>((resolve, reject) => {
    ctx.decodeAudioData(buffer, resolve, reject);
  });
}
