import HomeFooter from '@/components/home/HomeFooter'
import DesktopHomeSearchBar from '@/components/home/DesktopHomeSearchBar'
import HomeHeroBanner from '@/components/home/HomeHeroBanner'
import MobileDestinationSearch from '@/components/home/MobileDestinationSearch'
import MyChecklistsSection from '@/components/home/MyChecklistsSection'
import CurationSection from '@/components/home/CurationSection'

function MobileHomePage() {
  return (
    <div
      className="flex-1"
      style={{
        backgroundImage: `
          radial-gradient(circle at 8% 8%, rgba(61, 180, 221, 0.18) 0%, transparent 32%),
          radial-gradient(circle at 88% 6%, rgba(248, 215, 116, 0.26) 0%, transparent 28%),
          radial-gradient(circle at 12% 72%, rgba(61, 180, 221, 0.10) 0%, transparent 24%),
          linear-gradient(160deg, #ecfffe 0%, #f4fff1 55%, #fffcf0 100%)
        `,
      }}
    >
      <div className="flex flex-col gap-5 px-4 pb-6 pt-5 lg:mx-auto lg:w-full lg:gap-7 lg:px-6 lg:py-10 xl:max-w-6xl xl:gap-8 xl:px-8 xl:py-14">
        <HomeHeroBanner />

        <section className="hidden lg:block">
          <DesktopHomeSearchBar />
        </section>

        <MobileDestinationSearch />

        <MyChecklistsSection />

        <CurationSection />
      </div>
      <HomeFooter />
    </div>
  )
}

export default function HomePage() {
  return <MobileHomePage />
}
