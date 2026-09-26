import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Fellow AI CRM',
    short_name: 'Fellow AI',
    description: 'AI-Powered CRM and Lead Management',
    start_url: '/login',
    display: 'standalone',
    background_color: '#f8fafc',
    theme_color: '#0f172a',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  }
}
