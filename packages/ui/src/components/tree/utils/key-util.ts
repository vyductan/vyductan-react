/* eslint-disable @typescript-eslint/no-explicit-any */
import type { BasicDataNode, Key, KeyEntities, SafeKey } from "../types";

export default function getEntity<T extends BasicDataNode = any>(
  keyEntities: KeyEntities<T>,
  key: Key,
) {
  return keyEntities[key as SafeKey];
}
