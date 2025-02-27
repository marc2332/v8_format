import {
  decode32 as varintDecode,
  encode as varintEncode,
} from "https://deno.land/x/varint@v2.0.0/varint.ts";

const MIN_INT_VALUE = -1_073_741_824;
const MAX_INT_VALUE = 1_073_741_823;

/**
 * @param { number } value - Integer To Serialize
 * @returns { Uint8Array } Serialized JS Integer without magic bytes
 */
export function serializeJsInteger(value: number): Uint8Array {
  if (!Number.isInteger(value)) {
    throw new Error("Not a integer");
  }

  if (value < MIN_INT_VALUE || value > MAX_INT_VALUE) {
    throw new Error("Outside of the integer range");
  }

  // ZigZag Encode
  const v = (value >> 31) ^ (value << 1);

  // Varint Encode
  const [varintBytes, length] = varintEncode(v);

  const buffer = new Uint8Array(length + 1);
  buffer[0] = 0x49;
  buffer.set(varintBytes, 1);

  return buffer;
}

/**
 * This function assumes that there is no magic bytes and the first element is the type indicator
 * @param { Uint8Array } data - Serialized integer data
 * @returns { number } Deserialized integer
 */
export function deserializeV8Integer(data: Uint8Array): number {
  if (data[0] !== 0x49) throw new Error("Not a v8 integer");
  //   Varint Decode
  const rawValue = varintDecode(data.subarray(1))[0];

  //   ZigZag Decode
  return (rawValue >> 1) ^ -(rawValue & 1);
}
