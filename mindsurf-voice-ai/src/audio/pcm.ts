export const TARGET_SAMPLE_RATE = 16_000;
export const FRAME_DURATION_MS = 20;
export const SAMPLES_PER_FRAME = (TARGET_SAMPLE_RATE * FRAME_DURATION_MS) / 1_000;

export function float32ToPcm16(input: Float32Array): Int16Array {
  const output = new Int16Array(input.length);

  for (let index = 0; index < input.length; index += 1) {
    const sample = Math.max(-1, Math.min(1, input[index] ?? 0));
    output[index] =
      sample < 0 ? Math.round(sample * 0x8000) : Math.round(sample * 0x7fff);
  }

  return output;
}

export class PcmFrameAssembler {
  private pending = new Int16Array(0);

  constructor(readonly samplesPerFrame = SAMPLES_PER_FRAME) {
    if (!Number.isInteger(samplesPerFrame) || samplesPerFrame <= 0) {
      throw new RangeError("samplesPerFrame must be a positive integer");
    }
  }

  push(samples: Int16Array): Int16Array[] {
    const combined = new Int16Array(this.pending.length + samples.length);
    combined.set(this.pending);
    combined.set(samples, this.pending.length);

    const frames: Int16Array[] = [];
    let offset = 0;

    while (offset + this.samplesPerFrame <= combined.length) {
      frames.push(combined.slice(offset, offset + this.samplesPerFrame));
      offset += this.samplesPerFrame;
    }

    this.pending = combined.slice(offset);
    return frames;
  }

  reset() {
    this.pending = new Int16Array(0);
  }

  takePending() {
    const pending = this.pending;
    this.pending = new Int16Array(0);
    return pending;
  }

  get pendingSamples() {
    return this.pending.length;
  }
}

export function createPcm16Wav(
  chunks: readonly Int16Array[],
  sampleRate = TARGET_SAMPLE_RATE,
): Uint8Array {
  const sampleCount = chunks.reduce((total, chunk) => total + chunk.length, 0);
  const bytesPerSample = 2;
  const dataLength = sampleCount * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataLength);
  const view = new DataView(buffer);

  writeAscii(view, 0, "RIFF");
  view.setUint32(4, 36 + dataLength, true);
  writeAscii(view, 8, "WAVE");
  writeAscii(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * bytesPerSample, true);
  view.setUint16(32, bytesPerSample, true);
  view.setUint16(34, 16, true);
  writeAscii(view, 36, "data");
  view.setUint32(40, dataLength, true);

  let byteOffset = 44;
  for (const chunk of chunks) {
    for (const sample of chunk) {
      view.setInt16(byteOffset, sample, true);
      byteOffset += bytesPerSample;
    }
  }

  return new Uint8Array(buffer);
}

function writeAscii(view: DataView, offset: number, value: string) {
  for (let index = 0; index < value.length; index += 1) {
    view.setUint8(offset + index, value.charCodeAt(index));
  }
}
