import SiteShell from '@/components/site'
import { Research } from '@/components/sections'

export const metadata = { title: 'الأبحاث المنشورة' }

export default function ResearchPage() {
  return (
    <SiteShell>
      <Research />
    </SiteShell>
  )
}
