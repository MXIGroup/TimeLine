import { ImageResponse } from 'next/og';
import { dartboardArt } from '@/game/lib/iconArt';

export const dynamic = 'force-static';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Bullhitters Darts Bonanza';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: 'flex',
          alignItems: 'center',
          background: '#0a0c0a',
          padding: 64,
        }}
      >
        {dartboardArt(420)}
        <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 48 }}>
          <div style={{ display: 'flex', fontSize: 86, fontWeight: 800, color: '#22e36b', lineHeight: 1 }}>
            BULLHITTERS
          </div>
          <div style={{ display: 'flex', fontSize: 86, fontWeight: 800, color: '#ff2d4b', lineHeight: 1 }}>
            DARTS BONANZA
          </div>
          <div style={{ display: 'flex', fontSize: 34, color: '#7c8a82', marginTop: 28 }}>
            Swipe. Throw. Cause chaos.
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
