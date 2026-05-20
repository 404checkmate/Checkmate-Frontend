const SPRING = 'cubic-bezier(0.34,1.36,0.64,1)'

/**
 * dynamicOverflow: true일 때 visible 상태에서 overflow-visible 적용
 * (드롭다운처럼 자식이 섹션 밖으로 튀어나와야 하는 경우)
 */
export default function RevealSection({ visible, innerRef, className, dynamicOverflow, children }) {
  const timing = visible ? SPRING : 'ease-in'
  const overflowClass = dynamicOverflow ? (visible ? 'overflow-visible' : 'overflow-hidden') : 'overflow-hidden'
  return (
    <div
      ref={innerRef}
      className={`grid transition-all duration-500 ${
        visible ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
      } ${className ?? ''}`}
      style={{ transitionTimingFunction: timing }}
    >
      <div className={overflowClass}>
        <div
          className={`mb-5 transition-transform duration-500 ${visible ? 'translate-y-0' : 'translate-y-4'}`}
          style={{ transitionTimingFunction: timing }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
