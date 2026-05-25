import { ImageResponse } from 'next/og';
import { dartboardArt } from '@/game/lib/iconArt';

export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(dartboardArt(512), { ...size });
}
