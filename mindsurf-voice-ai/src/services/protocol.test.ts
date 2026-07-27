import { describe, expect, it } from "vitest";

import {
  AUDIO_HEADER_LENGTH,
  ProtocolValidationError,
  createControlEnvelope,
  decodeAudioFrameHeader,
  decodeOutputAudioFrame,
  encodeInputAudioFrame,
  parseControlEnvelope,
  validateAssistantTextDelta,
  validateAssistantTextDone,
} from "./protocol";

describe("control messages", () => {
  it("creates and parses a valid version 1 envelope", () => {
    const message = createControlEnvelope("session.pong", null, {
      nonce: "test",
    });
    const parsed = parseControlEnvelope(JSON.stringify(message));

    expect(parsed.v).toBe(1);
    expect(parsed.type).toBe("session.pong");
    expect(parsed.request_id).toBeNull();
  });

  it("rejects malformed JSON", () => {
    expect(() => parseControlEnvelope("{")).toThrow(ProtocolValidationError);
  });
});

describe("assistant text stream", () => {
  it("accepts strictly ordered deltas and a matching done payload", () => {
    expect(validateAssistantTextDelta({ sequence: 0, delta: "你好" }, 0)).toEqual({
      sequence: 0,
      delta: "你好",
    });
    expect(
      validateAssistantTextDone(
        {
          text: "你好",
          last_sequence: 0,
          finish_reason: "stop",
          usage: { input_tokens: 3, output_tokens: 2 },
        },
        0,
      ),
    ).toMatchObject({ text: "你好", last_sequence: 0 });
  });

  it("rejects skipped deltas and mismatched completion", () => {
    expect(() => validateAssistantTextDelta({ sequence: 2, delta: "跳号" }, 1)).toThrow(
      ProtocolValidationError,
    );
    expect(() =>
      validateAssistantTextDone(
        {
          text: "不完整",
          last_sequence: 2,
          finish_reason: "stop",
          usage: null,
        },
        1,
      ),
    ).toThrow(ProtocolValidationError);
  });
});

describe("binary input audio frames", () => {
  it("writes the 48-byte big-endian header and little-endian PCM payload", () => {
    const requestId = "019c8db8-0fff-781f-8329-cc2f48c65013";
    const payload = Int16Array.from([-32768, -1, 0, 32767]);
    const frame = encodeInputAudioFrame(requestId, 7, 140_000, payload);
    const header = decodeAudioFrameHeader(frame);
    const view = new DataView(frame);

    expect(frame.byteLength).toBe(AUDIO_HEADER_LENGTH + 8);
    expect(header).toEqual({
      kind: 1,
      sequence: 7,
      timestampUs: 140_000,
      payloadLength: 8,
      requestId,
    });
    expect(view.getInt16(AUDIO_HEADER_LENGTH, true)).toBe(-32768);
    expect(view.getInt16(AUDIO_HEADER_LENGTH + 6, true)).toBe(32767);
  });
});

describe("binary output audio frames", () => {
  it("decodes OUTPUT_PCM samples from the shared binary envelope", () => {
    const requestId = "019c8db8-0fff-781f-8329-cc2f48c65013";
    const frame = encodeInputAudioFrame(
      requestId,
      3,
      240_000,
      Int16Array.from([-1234, 0, 1234]),
    );
    new DataView(frame).setUint8(5, 2);

    expect(decodeOutputAudioFrame(frame)).toEqual({
      requestId,
      sequence: 3,
      timestampUs: 240_000,
      samples: Int16Array.from([-1234, 0, 1234]),
    });
  });

  it("rejects input PCM as output audio", () => {
    const frame = encodeInputAudioFrame(
      "019c8db8-0fff-781f-8329-cc2f48c65013",
      0,
      0,
      Int16Array.from([1]),
    );
    expect(() => decodeOutputAudioFrame(frame)).toThrow(ProtocolValidationError);
  });
});
