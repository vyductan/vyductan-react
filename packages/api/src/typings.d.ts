/* eslint-disable @typescript-eslint/consistent-type-imports */
// import type { Agent, IncomingMessage, OutgoingHttpHeaders } from "http";

declare module "httpx" {
  export interface Options {
    method?: string;
    readTimeout?: number;
    connectTimeout?: number;
    timeout?: number;
    agent?: import("http").Agent;
    headers?: import("http").OutgoingHttpHeaders;
    rejectUnauthorized?: boolean;
    compression?: boolean;
    "beforeRequest"?(options: Options): void;
    data?: string | Buffer | import("stream").Readable | undefined;
    key?: string;
    cert?: string;
    ca?: string;
  }

  export function request(
    url: string,
    options: Options,
  ): Promise<import("http").IncomingMessage>;

  export function request(
    url: string,
    options: Options,
  ): Promise<IncomingMessage>;

  export function read(
    response: IncomingMessage,
    encoding: string,
  ): Promise<string | Buffer>;

  export interface Event {
    data?: string;
    id?: string;
    event?: string;
    retry?: number;
  }

  export function readAsSSE(
    response: IncomingMessage,
  ): AsyncGenerator<Event, void, unknown>;
}
