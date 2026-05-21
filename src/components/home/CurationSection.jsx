import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

const CURATION_COUNTRIES = [
  { id: 'vietnam',  name: '베트남',  sub: '가성비 최고의 선택',    image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80' },
  { id: 'japan',    name: '일본',    sub: '가장 인기 있는 여행지',  image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80' },
  { id: 'usa',      name: '미국',    sub: '자유여행의 클래식',      image: 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=800&q=80' },
  { id: 'thailand', name: '태국',    sub: '힐링이 필요할 때',       image: 'https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?w=800&q=80' },
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
          <p className="mt-0.5 text-[10px] leading-snug text-gray-400">{country.sub}</p>
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
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {CURATION_COUNTRIES.map((country, index) => (
          <CurationCard key={country.id} country={country} index={index} />
        ))}
      </div>
    </section>
  )
}
