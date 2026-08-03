import type React from "react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@acme/ui/components/button";
import { Input } from "@acme/ui/components/input";
import { SeekableVideo } from "@acme/ui/components/video";

const DEFAULT_SOURCE = "https://mdn.github.io/shared-assets/videos/flower.mp4";
const SEEK_TARGET = 3;

type Landing = { direct?: number; buffered?: number };
type Schemes = { direct?: string; buffered?: string };

const App: React.FC = () => {
  const [source, setSource] = useState(DEFAULT_SOURCE);
  const [draft, setDraft] = useState(DEFAULT_SOURCE);
  const [probe, setProbe] = useState<{ url: string; text: string }>();
  const [landing, setLanding] = useState<Landing>({});
  const [schemes, setSchemes] = useState<Schemes>({});

  const directReference = useRef<HTMLVideoElement>(null);
  const bufferedReference = useRef<HTMLVideoElement>(null);

  // Ask the origin for one byte: a 206 means it honours Range and can seek on
  // its own; a 200 means the browser has to download everything before it can.
  useEffect(() => {
    let cancelled = false;
    fetch(source, { headers: { Range: "bytes=0-1" } })
      .then((response) => {
        if (cancelled) return;
        const acceptRanges = response.headers.get("accept-ranges") ?? "absent";
        setProbe({
          url: source,
          text:
            response.status === 206
              ? `206 Partial Content — origin supports Range, seeking works natively`
              : `${response.status}, accept-ranges: ${acceptRanges} — no Range support, seeking will snap back`,
        });
      })
      .catch(() => {
        if (!cancelled) {
          setProbe({ url: source, text: "probe blocked (CORS or offline)" });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [source]);

  const seekBoth = async () => {
    setLanding({});
    for (const reference of [directReference, bufferedReference]) {
      if (reference.current) reference.current.currentTime = SEEK_TARGET;
    }
    // Give each element time to either land on the seek or bounce back to 0.
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setLanding({
      direct: directReference.current?.currentTime,
      buffered: bufferedReference.current?.currentTime,
    });
  };

  const noteScheme =
    (key: keyof Schemes) => (event: React.SyntheticEvent<HTMLVideoElement>) => {
      const scheme = event.currentTarget.currentSrc.split(":")[0];
      setSchemes((previous) => ({ ...previous, [key]: scheme }));
    };

  const format = (value?: number) =>
    value === undefined ? "—" : `${value.toFixed(2)}s`;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Video URL"
        />
        <Button type="primary" onClick={() => setSource(draft)}>
          Load
        </Button>
      </div>

      <p className="text-muted-foreground text-sm">
        Origin: {probe?.url === source ? probe.text : "probing…"}
      </p>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">seekable={"{false}"}</span>
          <SeekableVideo
            key={`direct-${source}`}
            ref={directReference}
            src={source}
            seekable={false}
            controls
            muted
            playsInline
            onLoadedMetadata={noteScheme("direct")}
            className="w-full rounded-lg"
          />
          <span className="text-muted-foreground text-xs">
            src: {schemes.direct ?? "…"} · landed at {format(landing.direct)}
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">seekable (default)</span>
          <SeekableVideo
            key={`buffered-${source}`}
            ref={bufferedReference}
            src={source}
            controls
            muted
            playsInline
            onLoadedMetadata={noteScheme("buffered")}
            className="w-full rounded-lg"
          />
          <span className="text-muted-foreground text-xs">
            src: {schemes.buffered ?? "…"} · landed at{" "}
            {format(landing.buffered)}
          </span>
        </div>
      </div>

      <Button className="self-start" onClick={() => void seekBoth()}>
        Seek both to {SEEK_TARGET}s
      </Button>

      <p className="text-muted-foreground text-sm">
        On an origin without Range support the left video reports{" "}
        <code>0.00s</code> after the seek while the right one lands on{" "}
        {SEEK_TARGET}
        .00s. On an origin that does support it, both land — the blob download
        is wasted work, so leave <code>seekable</code> off there.
      </p>
    </div>
  );
};

export default App;
