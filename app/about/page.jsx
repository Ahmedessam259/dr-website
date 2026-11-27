import SiteShell from '@/components/site'
import { About } from '@/components/sections'

export const metadata = { title: 'عنّي' }

export default function AboutPage() {
  return (
    <SiteShell>
      <About />
    </SiteShell>
  )
}
