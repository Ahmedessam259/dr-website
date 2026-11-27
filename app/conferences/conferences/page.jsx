import SiteShell from '@/components/site'
import { Conferences } from '@/components/sections'

export const metadata = { title: 'المؤتمرات القادمة' }

export default function ConferencesPage() {
  return (
    <SiteShell>
      <Conferences />
    </SiteShell>
  )
}
