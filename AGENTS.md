# 홈페이지 섹션 스크롤 스냅 + 등장 애니메이션 구현 리포트

## 개요

홈페이지(`/`)에서 스크롤 또는 스와이프 시 섹션이 한 장씩 딱 멈추는 효과와,
각 섹션이 뷰포트에 들어올 때 아래에서 위로 페이드인되는 효과를 구현한 방법입니다.

외부 라이브러리 없이 **CSS Scroll Snap + IntersectionObserver + Tailwind CSS** 만으로 구현했습니다.

---

## 1. 스크롤 스냅 (한 섹션씩 멈추는 효과)

### 핵심 아이디어

- 스냅은 **홈 페이지에서만** 동작해야 합니다. 다른 페이지로 이동하면 꺼져야 합니다.
- `<html>` 태그에 클래스를 동적으로 붙였다 뗐다 하는 방식으로 범위를 제한합니다.

### CSS (src/index.css)

```css
@media (prefers-reduced-motion: no-preference) {
  html.home-page-scroll-snap {
    scroll-snap-type: y mandatory;
    scroll-padding-top: 3.5rem;
  }

  @media (max-width: 767px) {
    html.home-page-scroll-snap {
      scroll-padding-bottom: 4.5rem;
    }
  }
}
```

- `scroll-snap-type: y mandatory` — 세로 방향으로 스냅, 중간에 멈추지 않고 반드시 스냅 포인트로 이동
- `scroll-padding-top` — 고정 헤더(네비게이션) 높이만큼 여백 확보
- `@media (prefers-reduced-motion: no-preference)` — 모션 감소 설정을 켠 사용자에게는 스냅 미적용 (접근성)

### React (HomePage.jsx)

```jsx
const HOME_SCROLL_SNAP_HTML_CLASS = 'home-page-scroll-snap'

useEffect(() => {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
  if (mq.matches) return undefined

  document.documentElement.classList.add(HOME_SCROLL_SNAP_HTML_CLASS)

  return () => {
    document.documentElement.classList.remove(HOME_SCROLL_SNAP_HTML_CLASS)
  }
}, [])
```

- 컴포넌트가 마운트될 때 `<html>`에 클래스 추가
- 컴포넌트가 언마운트될 때(페이지 이동) 클래스 제거 → cleanup 함수 반환
- `prefers-reduced-motion` 감지 후 해당 사용자는 건너뜀

### 각 섹션에 스냅 포인트 지정 (src/components/home/constants.js)

```js
export const SNAP_SLIDE =
  'snap-start snap-always min-h-[100dvh] flex flex-col justify-center'
```

- `snap-start` — 해당 요소의 시작점이 스냅 포인트
- `snap-always` — 빠르게 스크롤해도 반드시 이 지점에서 멈춤 (`scroll-snap-stop: always`)
- `min-h-[100dvh]` — 각 섹션이 뷰포트 전체 높이를 차지

```jsx
// HomeHeroSection.jsx
<section className={`relative isolate overflow-hidden bg-transparent ${SNAP_SLIDE}`}>
```

모든 섹션에 `SNAP_SLIDE` 상수를 className으로 넣기만 하면 됩니다.

### 마지막 섹션 묶음 처리 (캐치프레이즈 + 푸터)

캐치프레이즈와 푸터는 별도로 스냅하지 않고 하나의 그룹으로 묶어서 같이 스크롤되도록 했습니다.

```js
// constants.js
export const SNAP_TAIL_GROUP = 'snap-start snap-always flex w-full flex-col'
```

```jsx
// HomePage.jsx
<div className={SNAP_TAIL_GROUP}>
  <HomeCatchphraseSection ... />
  <HomeFooter ... />
</div>
```

두 컴포넌트를 `div` 하나로 감싸고 그 `div`에만 스냅을 적용하면, 캐치프레이즈와 푸터 사이에서는 스냅 없이 자연스럽게 스크롤됩니다.

---

## 2. 섹션 등장 애니메이션 (스크롤 시 아래→위 페이드인)

### 핵심 아이디어

- 각 섹션이 뷰포트에 처음 진입하는 순간 `opacity: 0 + translateY(40px)` → `opacity: 1 + translateY(0)` 로 전환
- **한 번만** 실행 (스크롤을 다시 내려도 반복 안 됨)
- `IntersectionObserver`로 뷰포트 진입 감지

### 커스텀 훅 (src/hooks/useRevealOnScrollOnce.js)

```js
export function useRevealOnScrollOnce({
  threshold = 0.18,
  rootMargin = '0px 0px -8% 0px',
} = {}) {
  const ref = useRef(null)
  const [isRevealed, setIsRevealed] = useState(() => {
    // 모션 감소 설정 사용자는 처음부터 보임 상태로 시작
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const el = ref.current
    if (!el) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= threshold) {
            setIsRevealed(true)
            observer.unobserve(el) // 한 번 실행 후 감시 중단
            return
          }
        }
      },
      { threshold: [0, threshold, 0.35, 0.55], rootMargin },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, rootMargin])

  return [ref, isRevealed] // [붙일 ref, 보임 여부 boolean]
}
```

- `observer.unobserve(el)` — 한 번 진입 감지 후 즉시 감시 해제 (메모리 효율)
- `rootMargin: '0px 0px -8% 0px'` — 뷰포트 하단에서 8% 위로 올라와야 트리거 (너무 일찍 실행 방지)
- `threshold` — 요소가 해당 비율만큼 보여야 트리거 (0.18 = 18%)

### 사용법 (HomePage.jsx)

```jsx
const [featuresRef, featuresRevealed] = useRevealOnScrollOnce({
  threshold: 0.2,
  rootMargin: '0px 0px -12% 0px',
})

// JSX
<HomeFeatureSection featuresRef={featuresRef} featuresRevealed={featuresRevealed} />
```

### 애니메이션 적용 컴포넌트 (src/components/home/RevealBlock.jsx)

```jsx
// constants.js
export const REVEAL_EASE =
  'transition-[opacity,transform] duration-[1180ms] ease-[cubic-bezier(0.25,0.46,0.45,0.99)] motion-reduce:duration-0 motion-reduce:opacity-100 motion-reduce:translate-y-0'

// RevealBlock.jsx
export default function RevealBlock({ show, delayClass = '', className = '', children }) {
  return (
    <div
      className={`${REVEAL_EASE} ${delayClass} ${
        show ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      } ${className}`}
    >
      {children}
    </div>
  )
}
```

- `show`가 `false`면 `opacity-0 translate-y-10` (숨김 + 40px 아래)
- `show`가 `true`로 바뀌는 순간 CSS transition이 실행되어 자연스럽게 등장
- `delayClass`로 여러 요소를 순차적으로 등장시킬 수 있음

```jsx
// 사용 예: 제목 → 설명 → 버튼 순서로 160ms 간격 등장
<RevealBlock show={heroRevealed}>
  <h1>제목</h1>
</RevealBlock>

<RevealBlock show={heroRevealed} delayClass="delay-[160ms]">
  <p>설명 문구</p>
</RevealBlock>

<RevealBlock show={heroRevealed} delayClass="delay-[320ms]">
  <button>시작 버튼</button>
</RevealBlock>
```

### 카드 순차 등장 (constants.js)

```js
export const FEATURE_CARD_REVEAL_DELAY_CLASS = ['delay-[420ms]', 'delay-[980ms]', 'delay-[1540ms]']
```

```jsx
// 카드 3장이 560ms 간격으로 등장
{cards.map((card, i) => (
  <RevealBlock key={i} show={revealed} delayClass={FEATURE_CARD_REVEAL_DELAY_CLASS[i]}>
    <FeatureCard {...card} />
  </RevealBlock>
))}
```

### 첫 번째 섹션(Hero)의 특별 처리

Hero 섹션은 페이지 진입 즉시 보여야 하므로 IntersectionObserver 대신 `requestAnimationFrame`으로 처리했습니다.

```jsx
const [heroRevealed, setHeroRevealed] = useState(() => {
  // 모션 감소 사용자는 처음부터 보임
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
})

useEffect(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
  let raf2 = 0
  const raf1 = requestAnimationFrame(() => {
    raf2 = requestAnimationFrame(() => setHeroRevealed(true))
  })
  return () => {
    cancelAnimationFrame(raf1)
    if (raf2) cancelAnimationFrame(raf2)
  }
}, [])
```

- `requestAnimationFrame` 두 번 중첩 — 첫 번째 rAF는 브라우저가 레이아웃을 계산하기 전,
  두 번째 rAF는 첫 프레임이 실제로 그려진 직후. 이렇게 해야 transition이 `opacity: 0`에서 시작해서 애니메이션이 보입니다.
  (바로 `setHeroRevealed(true)`를 호출하면 초기 렌더부터 `opacity: 1`이라 애니메이션이 안 보임)

---

## 전체 흐름 요약

```
페이지 진입
  → useEffect: <html>에 home-page-scroll-snap 클래스 추가
  → CSS: scroll-snap-type: y mandatory 활성화
  → 각 <section>에 snap-start snap-always 클래스 → 스냅 포인트 지정

사용자가 스크롤
  → 브라우저가 다음 snap-start 위치로 자동 이동
  → IntersectionObserver가 섹션 진입 감지
  → isRevealed: false → true 전환
  → RevealBlock: opacity-0 translate-y-10 → opacity-100 translate-y-0 (CSS transition)

페이지 이탈 (다른 페이지로 이동)
  → useEffect cleanup: <html>에서 home-page-scroll-snap 클래스 제거
  → 다른 페이지에서는 스냅 미적용
```

---

## 관련 파일 목록

| 파일 | 역할 |
|------|------|
| `src/index.css` | 스크롤 스냅 CSS |
| `src/components/home/constants.js` | SNAP_SLIDE, SNAP_TAIL_GROUP, REVEAL_EASE 상수 |
| `src/hooks/useRevealOnScrollOnce.js` | IntersectionObserver 기반 등장 감지 훅 |
| `src/components/home/RevealBlock.jsx` | 등장 애니메이션 래퍼 컴포넌트 |
| `src/pages/HomePage.jsx` | 스냅 클래스 동적 주입, 각 섹션에 ref/revealed 전달 |
| `src/components/home/HomeHeroSection.jsx` | SNAP_SLIDE 사용 예시, RevealBlock 사용 예시 |
