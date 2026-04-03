/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
const { window: maybeWindow, document: maybeDocument } = globalThis as Partial<
  typeof globalThis
>;

export const CAN_USE_DOM: boolean =
  maybeWindow !== undefined &&
  maybeDocument !== undefined &&
  typeof maybeDocument.createElement === "function";
