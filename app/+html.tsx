import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en-ZA">
      <head>
        <meta charSet="utf-8" />
        <meta content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" name="viewport" />
        <meta content="#ffffff" name="theme-color" />
        <meta content="PRASA passenger information, schedules, tickets, stations and parcels." name="description" />
        <title>PRASA App</title>
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: `
          html, body, #root { width: 100%; height: 100%; height: 100dvh; }
          body { margin: 0; overflow: hidden; background: #e8eef2; }
          * { box-sizing: border-box; }
          @media (max-width: 428px), (max-height: 926px) {
            body { background: #ffffff; }
          }
        ` }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
