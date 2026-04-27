import BrandLogo from '@/components/common/BrandLogo'
import { HOME_CATCHPHRASE_DISPLAY } from '@/mocks/homeData'
import RevealBlock from './RevealBlock'

export default function HomeCatchphraseSection({ catchphraseRef, catchphraseRevealed }) {
  return (
    <section className="snap-none relative isolate flex min-h-[100dvh] flex-col justify-center overflow-hidden bg-transparent py-14 md:py-20">
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-44 w-44 -translate-x-full -translate-y-1/2 rounded-full bg-teal-300/38 blur-3xl md:ml-[-30rem]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 top-1/4 h-60 w-60 rounded-full bg-cyan-300/45 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-4 left-1/4 h-44 w-44 -translate-x-1/2 rounded-full bg-emerald-200/55 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-8 right-8 h-36 w-36 rounded-full bg-amber-200/60 blur-2xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.2]"
        style={{
          backgroundImage: `radial-gradient(circle at 18% 22%, rgba(45, 212, 191, 0.14) 0%, transparent 45%),
            radial-gradient(circle at 88% 72%, rgba(6, 182, 212, 0.12) 0%, transparent 42%),
            radial-gradient(circle at 48% 100%, rgba(251, 191, 36, 0.1) 0%, transparent 38%)`,
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[length:22px_22px] opacity-[0.08]"
        style={{
          backgroundImage:
            'radial-gradient(circle at center, rgba(13, 148, 136, 0.12) 1.5px, transparent 1.6px)',
        }}
        aria-hidden
      />

      <div
        ref={catchphraseRef}
        className="relative z-10 mx-auto w-full max-w-3xl px-5 md:max-w-4xl md:px-6"
        style={{ fontFamily: "'SeoulNotice', system-ui, sans-serif" }}
      >
        <RevealBlock show={catchphraseRevealed}>
          <p className="text-center text-xl font-extrabold leading-snug text-teal-900 md:text-2xl md:leading-snug lg:text-[1.7rem]">
            <span className="block">{HOME_CATCHPHRASE_DISPLAY.line1}</span>
            <span className="mt-2 inline-flex max-w-full flex-wrap items-center justify-center gap-x-2 md:mt-2.5 md:gap-x-2.5">
              <BrandLogo
                className="h-7 w-auto shrink-0 object-contain md:h-8 lg:h-9"
                alt="CHECKMATE"
              />
              <span>{HOME_CATCHPHRASE_DISPLAY.afterLogo}</span>
            </span>
          </p>
        </RevealBlock>
      </div>
    </section>
  )
}
