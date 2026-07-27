export class StreamingLinearResampler {
  private readonly step: number;
  private buffer = new Float32Array(0);
  private position = 0;

  constructor(
    readonly sourceSampleRate: number,
    readonly targetSampleRate: number,
  ) {
    if (sourceSampleRate <= 0 || targetSampleRate <= 0) {
      throw new RangeError("sample rates must be positive");
    }

    this.step = sourceSampleRate / targetSampleRate;
  }

  process(input: Float32Array): Float32Array {
    if (input.length === 0) {
      return new Float32Array(0);
    }

    const combined = new Float32Array(this.buffer.length + input.length);
    combined.set(this.buffer);
    combined.set(input, this.buffer.length);
    this.buffer = combined;

    const output: number[] = [];

    while (this.position + 1 < this.buffer.length) {
      const index = Math.floor(this.position);
      const fraction = this.position - index;
      const current = this.buffer[index] ?? 0;
      const next = this.buffer[index + 1] ?? current;

      output.push(current + (next - current) * fraction);
      this.position += this.step;
    }

    this.compactBuffer();
    return Float32Array.from(output);
  }

  flush(): Float32Array {
    const output: number[] = [];

    while (this.position < this.buffer.length) {
      const index = Math.floor(this.position);
      const fraction = this.position - index;
      const current = this.buffer[index] ?? 0;
      const next = this.buffer[Math.min(index + 1, this.buffer.length - 1)] ?? current;

      output.push(current + (next - current) * fraction);
      this.position += this.step;
    }

    this.reset();
    return Float32Array.from(output);
  }

  reset() {
    this.buffer = new Float32Array(0);
    this.position = 0;
  }

  private compactBuffer() {
    if (this.buffer.length <= 1) {
      return;
    }

    const discardCount = Math.min(Math.floor(this.position), this.buffer.length - 1);

    if (discardCount > 0) {
      this.buffer = this.buffer.slice(discardCount);
      this.position -= discardCount;
    }
  }
}
