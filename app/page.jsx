import SiteShell from '@/components/site'
import Marquee from '@/components/Marquee'
import { Hero, Statement } from '@/components/home'

export default function Page() {
  return (
    <SiteShell>
      <Hero />
      <Marquee />
      <Statement />
    </SiteShell>
  )
}
