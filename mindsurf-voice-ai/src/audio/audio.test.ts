import { describe, expect, it } from "vitest";

import { PcmFrameAssembler, createPcm16Wav, float32ToPcm16 } from "./pcm";
import { StreamingLinearResampler } from "./resampler";

describe("StreamingLinearResampler", () => {
  it("resamples ten seconds from 48 kHz to 16 kHz within one percent", () => {
    const sourceRate = 48_000;
    const targetRate = 16_000;
    const input = Float32Array.from({ length: sourceRate * 10 }, (_, index) =>
      Math.sin((2 * Math.PI * 440 * index) / sourceRate),
    );
    const resampler = new StreamingLinearResampler(sourceRate, targetRate);
    const chunks: Float32Array[] = [];

    for (let offset = 0; offset < input.length; offset += 128) {
      chunks.push(resampler.process(input.subarray(offset, offset + 128)));
    }
    chunks.push(resampler.flush());

    const outputLength = chunks.reduce((total, chunk) => total + chunk.length, 0);
    const expectedLength = targetRate * 10;
    const relativeError = Math.abs(outputLength - expectedLength) / expectedLength;

    expect(relativeError).toBeLessThan(0.01);
  });
});

describe("PCM utilities", () => {
  it("clips and converts float samples to signed PCM16", () => {
    const result = float32ToPcm16(Float32Array.from([-2, -1, -0.5, 0, 0.5, 1, 2]));

    expect(Array.from(result)).toEqual([
      -32768, -32768, -16384, 0, 16384, 32767, 32767,
    ]);
  });

  it("assembles 320-sample frames without losing the remainder", () => {
    const assembler = new PcmFrameAssembler(320);
    const frames = assembler.push(new Int16Array(1_000));

    expect(frames).toHaveLength(3);
    expect(frames.every((frame) => frame.length === 320)).toBe(true);
    expect(assembler.pendingSamples).toBe(40);
    expect(assembler.takePending()).toHaveLength(40);
    expect(assembler.pendingSamples).toBe(0);
  });

  it("writes a valid mono PCM16 WAV header", () => {
    const wav = createPcm16Wav([new Int16Array(16_000)], 16_000);
    const view = new DataView(wav.buffer);
    const ascii = (offset: number, length: number) =>
      String.fromCharCode(...wav.slice(offset, offset + length));

    expect(ascii(0, 4)).toBe("RIFF");
    expect(ascii(8, 4)).toBe("WAVE");
    expect(view.getUint16(22, true)).toBe(1);
    expect(view.getUint32(24, true)).toBe(16_000);
    expect(view.getUint16(34, true)).toBe(16);
    expect(view.getUint32(40, true)).toBe(32_000);
  });
});
