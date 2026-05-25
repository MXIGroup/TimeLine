/**
 * Shared dartboard mark rendered by next/og ImageResponse for the favicon,
 * the iOS home-screen icon and the PWA manifest. Built from nested circles so
 * it needs no image asset and scales to any size.
 */
export function dartboardArt(size: number) {
  const board = size * 0.84;
  const ring = size * 0.45;
  const bull = size * 0.18;
  const inner = size * 0.08;
  return (
    <div
      style={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0c0a',
      }}
    >
      <div
        style={{
          width: board,
          height: board,
          borderRadius: '50%',
          background: '#0e1311',
          border: `${size * 0.024}px solid #22e36b`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: ring,
            height: ring,
            borderRadius: '50%',
            border: `${size * 0.032}px solid #ff2d4b`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: bull,
              height: bull,
              borderRadius: '50%',
              background: '#22e36b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ width: inner, height: inner, borderRadius: '50%', background: '#ff2d4b' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
