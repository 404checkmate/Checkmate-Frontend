import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import vietnamData from '@/data/curation/vietnam.js'
import japanData from '@/data/curation/japan.js'
import chinaData from '@/data/curation/china.js'
import usaData from '@/data/curation/usa.js'
import thailandData from '@/data/curation/thailand.js'

const CURATION_COUNTRIES = [
  { id: 'vietnam',  name: '베트남',  sub: '가성비 최고의 선택',    image: vietnamData.photos.hero },
  { id: 'japan',    name: '일본',    sub: '가장 인기 있는 여행지',  image: japanData.photos.hero },
  { id: 'china',    name: '중국',    sub: '가깝고 다채로운 대도시',  image: chinaData.photos.hero },
  { id: 'usa',      name: '미국',    sub: '자유여행의 클래식',      image: usaData.photos.hero },
  { id: 'thailand', name: '태국',    sub: '힐링이 필요할 때',       image: thailandData.photos.hero },
]

function CurationCard({ country, index }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.15 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        opacity: visible ? 1 : 0,
        transition: `transform 0.65s cubic-bezier(0.22,1,0.36,1) ${index * 0.1}s,
                     opacity 0.55s ease ${index * 0.1}s`,
      }}
    >
      <Link
        to={`/curation/${country.id}`}
        className="block w-full bg-white rounded-2xl p-2 pb-3 shadow-lg shadow-gray-300/50 border border-gray-100 transition-transform active:scale-[0.97]"
      >
        <div className="overflow-hidden rounded-xl aspect-[4/3]">
          <img
            src={country.image}
            alt={country.name}
            className="h-full w-full object-cover"
            style={{
              transform: visible ? 'scale(1)' : 'scale(1.08)',
              transition: `transform 0.75s cubic-bezier(0.22,1,0.36,1) ${index * 0.1}s`,
            }}
            loading="lazy"
            draggable={false}
            onError={(e) => {
              e.currentTarget.style.visibility = 'hidden'
              e.currentTarget.parentElement.style.background = 'linear-gradient(135deg, #e2e8f0, #cbd5e1)'
            }}
          />
        </div>
        <div
          className="px-1 pt-2 text-left"
          style={{
            transform: visible ? 'translateY(0)' : 'translateY(8px)',
            opacity: visible ? 1 : 0,
            transition: `transform 0.6s cubic-bezier(0.22,1,0.36,1) ${index * 0.1 + 0.08}s,
                         opacity 0.5s ease ${index * 0.1 + 0.08}s`,
          }}
        >
          <p className="text-sm font-extrabold leading-tight text-[#04384a]">{country.name}</p>
          <p className="mt-0.5 text-xs leading-snug text-gray-400">{country.sub}</p>
        </div>
      </Link>
    </div>
  )
}

export default function CurationSection() {
  return (
    <section>
      <div className="mb-4">
        <h2 className="text-[1.1rem] font-extrabold leading-snug text-[#04384a] lg:text-xl">
          지금 떠나기 좋은 <span className="text-[#3db4dd]">인기여행지</span>
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-gray-500">
          여행 정보 탐색부터 체크리스트 저장까지, 큐레이션 하나로
        </p>
      </div>
      {/* 모바일: 가로 스크롤(스와이프, 옆 카드 peek) / 데스크톱: 5개 한 줄 그리드 */}
      <div className="flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:grid lg:grid-cols-5 lg:overflow-visible">
        {CURATION_COUNTRIES.map((country, index) => (
          <div key={country.id} className="snap-start shrink-0 w-[42%] sm:w-[30%] lg:w-auto">
            <CurationCard country={country} index={index} />
          </div>
        ))}
      </div>
    </section>
  )
}
