/* eslint-disable @typescript-eslint/no-non-null-assertion */
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import type { SerializedDocument } from "@lexical/file";

async function* generateReader<T>(reader: ReadableStreamDefaultReader<T>) {
  let done = false;
  while (!done) {
    const res = await reader.read();
    const { value } = res;
    if (value !== undefined) {
      yield value;
    }
    done = res.done;
  }
}

async function readBytestoString(
  reader: ReadableStreamDefaultReader<Uint8Array>,
): Promise<string> {
  const output = [];
  const chunkSize = 0x80_00;
  for await (const value of generateReader(reader)) {
    for (let i = 0; i < value.length; i += chunkSize) {
      output.push(String.fromCodePoint(...value.subarray(i, i + chunkSize)));
    }
  }
  return output.join("");
}

export async function docToHash(doc: SerializedDocument): Promise<string> {
  const cs = new CompressionStream("gzip");
  const writer = cs.writable.getWriter();
  const [, output] = await Promise.all([
    writer
      .write(new TextEncoder().encode(JSON.stringify(doc)))
      .then(() => writer.close()),
    readBytestoString(cs.readable.getReader()),
  ]);
  return `#doc=${btoa(output)
    .replaceAll("/", "_")
    .replaceAll("+", "-")
    .replace(/=+$/, "")}`;
}

export async function docFromHash(
  hash: string,
): Promise<SerializedDocument | null> {
  const m = /^#doc=(.*)$/.exec(hash);
  if (!m) {
    return null;
  }
  const ds = new DecompressionStream("gzip");
  const writer = ds.writable.getWriter();
  const b64 = atob(m[1]!.replaceAll("_", "/").replaceAll("-", "+"));
  const array = new Uint8Array(b64.length);
  for (let i = 0; i < b64.length; i++) {
    array[i] = b64.codePointAt(i)!;
  }
  const closed = writer.write(array).then(() => writer.close());
  const output = [];
  for await (const chunk of generateReader(
    ds.readable.pipeThrough(new TextDecoderStream()).getReader(),
  )) {
    output.push(chunk);
  }
  await closed;
  return JSON.parse(output.join("")) as SerializedDocument;
}
