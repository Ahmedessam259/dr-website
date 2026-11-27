import SiteShell from '@/components/site'
import { Gallery } from '@/components/sections'

export const metadata = { title: 'صور المؤتمرات' }

export default function GalleryPage() {
  return (
    <SiteShell>
      <Gallery />
    </SiteShell>
  )
}
