import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import step3DesktopMascotUrl from '@/assets/step3-desktop-mascot.png'
import onboardingFinishMascotUrl from '@/assets/onboarding-finish-mascot.png'
import BrandLogo from '@/components/common/BrandLogo'
import OnboardingBirthCalendar from '@/components/onboarding/OnboardingBirthCalendar'
import OnboardingCustomSelect from '@/components/onboarding/OnboardingCustomSelect'

/** 국적 / 여권 발급국 공통 목록 (ISO 코드) */
const COUNTRY_OPTIONS = [
  { value: 'KR', label: '대한민국' },
  { value: 'US', label: '미국' },
  { value: 'JP', label: '일본' },
  { value: 'CN', label: '중국' },
  { value: 'TW', label: '대만' },
  { value: 'VN', label: '베트남' },
  { value: 'TH', label: '태국' },
  { value: 'GB', label: '영국' },
  { value: 'DE', label: '독일' },
  { value: 'FR', label: '프랑스' },
  { value: 'OTHER', label: '기타' },
]

/** 여권 VIZ 영문: 글자 구간 사이에 공백·하이픈·어포스트로피 반복 허용 (MRZ와는 별개) */
const LATIN_NAME_RE = /^[A-Za-z]+(?:[\s'-][A-Za-z]+)*$/

/** 프로필 한글 이름: 완성형 한글만, 공백으로 성·이름 구분 가능 */
const HANGUL_NAME_RE = /^[가-힣]+(?: [가-힣]+)*$/

/** 온보딩 섹션「다음」— 서비스 주요 CTA와 동일한 amber 톤 */
const ONBOARDING_NEXT_BTN_CLASS =
  'mt-4 w-full rounded-xl bg-amber-400 py-3.5 text-sm font-bold text-gray-900 shadow-sm shadow-amber-900/10 transition hover:bg-amber-500 hover:shadow-md disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none'

/** 온보딩 마지막「체크메이트 시작하기」 */
const ONBOARDING_FINISH_BTN_CLASS =
  'mt-8 w-full rounded-xl bg-amber-400 py-4 text-base font-bold text-gray-900 shadow-lg shadow-amber-900/15 transition hover:bg-amber-500 hover:shadow-md disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none'

function parseIsoDate(iso) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d, 12, 0, 0, 0)
}

function isoToLabel(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${y}년 ${parseInt(m, 10)}월 ${parseInt(d, 10)}일`
}

/** 텍스트 입력: Enter 시 폼 제출 방지 + 조건 충족 시 `다음`과 동일 동작 */
function handleEnterToAdvanceInput(e, canProceed, advance) {
  if (e.key !== 'Enter' || e.repeat) return
  if (e.nativeEvent?.isComposing) return
  e.preventDefault()
  if (!canProceed) return
  advance()
}

/**
 * 국적·발급국 등(선택 + 다음): 열린 listbox 내부·`data-onboarding-next` 버튼은 그대로 둠
 */
function handleEnterToAdvanceSection(e, canProceed, advance) {
  if (e.key !== 'Enter' || e.repeat) return
  if (e.nativeEvent?.isComposing) return
  const el = e.target
  if (typeof el?.closest === 'function') {
    if (el.closest('[data-onboarding-next]')) return
    if (el.closest('[role="listbox"]')) return
  }
  if (!canProceed) return
  e.preventDefault()
  advance()
}

/** 섹션 입력이 조건을 만족할 때 표시하는 완료 피드백 */
function SectionInputConfirmed({ show, align = 'start' }) {
  if (!show) return null
  const justify = align === 'center' ? 'justify-center' : 'justify-start'
  return (
    <p className={`mt-3 flex items-center gap-1.5 text-sm font-medium text-cyan-600 ${justify}`} role="status">
      <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M9 12.5l2.5 2.5L15 10"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      </svg>
      입력이 확인되었어요
    </p>
  )
}

/**
 * 소셜 로그인 직후 1회 프로필 수집 — **기본 정보**(성함·성별·생년월일·이메일) → **여권 정보**(영문명·번호·국적·발급국·만료·발급일).
 * 섹션은 순차적으로만 펼쳐지며(@formkit/auto-animate), 이전 단계는 살짝 흐리게.
 */
export default function OnboardingProfilePage() {
  const navigate = useNavigate()
  const [listRef] = useAutoAnimate({ duration: 320, easing: 'ease-out' })

  const [passportFirstName, setPassportFirstName] = useState('')
  const [passportLastName, setPassportLastName] = useState('')
  const [passportNumber, setPassportNumber] = useState('')
  const [nationality, setNationality] = useState('')
  const [gender, setGender] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [passportExpiryDate, setPassportExpiryDate] = useState('')
  const [passportIssuingCountry, setPassportIssuingCountry] = useState('')
  const [passportIssueDate, setPassportIssueDate] = useState('')
  const [profileNameKo, setProfileNameKo] = useState('')
  const [contactEmail, setContactEmail] = useState('')

  /** 순차 단계 인덱스 (만료 선택 후 발급일까지 약 10) */
  const [revealed, setRevealed] = useState(1)
  const [finishModalOpen, setFinishModalOpen] = useState(false)

  const bottomAnchorRef = useRef(null)
  const firstNameId = useId()
  const lastNameId = useId()
  const passportNoId = useId()
  const profileNameKoId = useId()
  const contactEmailId = useId()

  const normalizedPassportNumber = passportNumber.replace(/\s+/g, '').toUpperCase()

  const firstNameOk = LATIN_NAME_RE.test(passportFirstName.trim())
  const lastNameOk = LATIN_NAME_RE.test(passportLastName.trim())
  const passportNoOk = /^[A-Z0-9]{6,14}$/.test(normalizedPassportNumber)
  const nationalityOk = nationality !== ''
  const genderOk = gender !== ''
  const birthOk = birthDate !== ''
  const profileNameKoTrim = profileNameKo.trim()
  const profileNameKoOk =
    profileNameKoTrim.length >= 2 && profileNameKoTrim.length <= 40 && HANGUL_NAME_RE.test(profileNameKoTrim)
  const contactEmailTrim = contactEmail.trim()
  const contactEmailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(contactEmailTrim)
  const expiryOk = passportExpiryDate !== ''
  const issuingOk = passportIssuingCountry !== ''
  const issueOk = passportIssueDate !== ''

  const todayEnd = useMemo(() => {
    const t = new Date()
    t.setHours(23, 59, 59, 999)
    return t
  }, [])

  const expiryMinDate = useMemo(() => parseIsoDate(birthDate) ?? new Date(1900, 0, 1), [birthDate])
  const expiryMaxDate = useMemo(() => new Date(2100, 11, 31), [])

  const issueMinDate = useMemo(() => parseIsoDate(birthDate) ?? new Date(1900, 0, 1), [birthDate])

  const issueMaxDate = useMemo(() => {
    const expiry = parseIsoDate(passportExpiryDate)
    if (!expiry) return todayEnd
    return expiry.getTime() < todayEnd.getTime() ? expiry : todayEnd
  }, [passportExpiryDate, todayEnd])

  const birth = parseIsoDate(birthDate)
  const issue = parseIsoDate(passportIssueDate)
  const expiry = parseIsoDate(passportExpiryDate)

  const datesConsistent =
    birth &&
    issue &&
    expiry &&
    birth.getTime() <= issue.getTime() &&
    issue.getTime() <= expiry.getTime() &&
    issue.getTime() <= todayEnd.getTime()

  const canFinish =
    firstNameOk &&
    lastNameOk &&
    passportNoOk &&
    nationalityOk &&
    genderOk &&
    birthOk &&
    profileNameKoOk &&
    contactEmailOk &&
    expiryOk &&
    issuingOk &&
    issueOk &&
    datesConsistent

  const scrollToBottom = useCallback(() => {
    window.setTimeout(() => {
      bottomAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }, 80)
  }, [])

  const goProfileNameKoNext = useCallback(() => {
    if (!profileNameKoOk) return
    setRevealed((r) => Math.max(r, 2))
    scrollToBottom()
  }, [profileNameKoOk, scrollToBottom])

  const goEmailNext = useCallback(() => {
    if (!contactEmailOk) return
    setRevealed((r) => Math.max(r, 5))
    scrollToBottom()
  }, [contactEmailOk, scrollToBottom])

  const goNamesNext = useCallback(() => {
    if (!firstNameOk || !lastNameOk) return
    setRevealed((r) => Math.max(r, 6))
    scrollToBottom()
  }, [firstNameOk, lastNameOk, scrollToBottom])

  const goPassportNext = useCallback(() => {
    if (!passportNoOk) return
    setRevealed((r) => Math.max(r, 7))
    scrollToBottom()
  }, [passportNoOk, scrollToBottom])

  const goNationalityNext = useCallback(() => {
    if (!nationalityOk) return
    setRevealed((r) => Math.max(r, 8))
    scrollToBottom()
  }, [nationalityOk, scrollToBottom])

  const goIssuingNext = useCallback(() => {
    if (!issuingOk) return
    setRevealed((r) => Math.max(r, 9))
    scrollToBottom()
  }, [issuingOk, scrollToBottom])

  const completeOnboarding = useCallback(() => {
    if (!canFinish) return
    // TODO: API `PATCH /users/me/passport` 또는 Supabase 등
    const passportPayload = {
      profileNameKo: profileNameKoTrim,
      contactEmail: contactEmailTrim.toLowerCase(),
      passportFirstName: passportFirstName.trim().toUpperCase(),
      passportLastName: passportLastName.trim().toUpperCase(),
      passportNumber: normalizedPassportNumber,
      nationality,
      gender,
      dateOfBirth: birthDate,
      passportExpiryDate,
      passportIssuingCountry,
      passportIssueDate,
    }
    void passportPayload
    setFinishModalOpen(false)
    navigate('/', { replace: true })
  }, [
    birthDate,
    canFinish,
    contactEmailTrim,
    gender,
    nationality,
    navigate,
    normalizedPassportNumber,
    passportExpiryDate,
    passportFirstName,
    passportIssueDate,
    passportIssuingCountry,
    passportLastName,
    profileNameKoTrim,
  ])

  const handleFormSubmit = (e) => {
    e.preventDefault()
  }

  useEffect(() => {
    if (!finishModalOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') setFinishModalOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [finishModalOpen])

  useEffect(() => {
    if (!finishModalOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [finishModalOpen])

  const sectionShell = (isDimmed) =>
    `rounded-2xl border transition-colors ${
      isDimmed
        ? 'border-gray-100 bg-gray-50/60 opacity-[0.72]'
        : 'border-cyan-100/80 bg-white shadow-sm shadow-cyan-900/5'
    }`

  return (
    <div className="relative flex min-h-0 w-full flex-1 flex-col overflow-x-hidden bg-white">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, #ecfeff 0%, #ffffff 28%, #f8fafc 100%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-1 flex-col px-4 py-8 pb-12 md:px-6 md:py-10">
        <header className="flex flex-col items-center text-center">
          <img
            src={step3DesktopMascotUrl}
            alt=""
            role="presentation"
            decoding="async"
            className="mx-auto w-full max-w-56 object-contain select-none"
          />
          <h1
            className="mt-8 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xl font-bold tracking-tight text-gray-900 md:text-2xl"
            aria-label="CHECKMATE에 오신 것을 환영합니다!"
          >
            <BrandLogo className="h-8 w-auto max-w-[min(100%,14rem)] shrink-0 object-contain md:h-9" alt="" />
            <span>에 오신 것을 환영합니다!</span>
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            기본 정보와 여권 정보를 순서대로 입력하면 나중에 서비스에 안전하게 저장할 수 있어요.
          </p>
        </header>

        <form onSubmit={handleFormSubmit} className="mt-10 flex flex-col">
          <div ref={listRef} className="flex flex-col gap-6">
            <div>
              <h2 className="mb-3 text-left text-base font-bold tracking-tight text-gray-900">기본 정보</h2>
              <p className="text-xs text-gray-500">
                성함·성별·생년월일·이메일 등 서비스에 필요한 기본 프로필이에요.
              </p>
            </div>

            {/* 1 성함(한글) */}
            <section className={sectionShell(revealed >= 2 && profileNameKoOk)}>
              <div className="p-5">
                <label htmlFor={profileNameKoId} className="mb-1 block text-sm font-semibold text-gray-800">
                  성함(한글)
                </label>
                <p className="mb-3 text-xs text-gray-500">주민등록증·여권에 적힌 이름과 같이 적어 주세요.</p>
                <input
                  id={profileNameKoId}
                  name="profileNameKo"
                  type="text"
                  autoComplete="name"
                  value={profileNameKo}
                  onChange={(e) => setProfileNameKo(e.target.value)}
                  onKeyDown={(e) => handleEnterToAdvanceInput(e, profileNameKoOk, goProfileNameKoNext)}
                  placeholder="홍길동"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-base text-gray-900 placeholder:text-gray-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                />
                {profileNameKoTrim.length > 0 && !profileNameKoOk && (
                  <p className="mt-2 text-xs text-red-600" role="alert">
                    완성형 한글 2자 이상으로 입력해 주세요.
                  </p>
                )}
                <SectionInputConfirmed show={profileNameKoOk} />
                <button
                  type="button"
                  data-onboarding-next
                  disabled={!profileNameKoOk}
                  onClick={(e) => {
                    e.preventDefault()
                    goProfileNameKoNext()
                  }}
                  className={ONBOARDING_NEXT_BTN_CLASS}
                >
                  다음
                </button>
              </div>
            </section>

            {/* 2 성별 */}
            {revealed >= 2 && profileNameKoOk && (
              <section className={sectionShell(revealed >= 3 && genderOk)}>
                <div className="p-5">
                  <p className="mb-1 text-sm font-semibold text-gray-800">성별 (Gender)</p>
                  <p className="mb-3 text-xs text-gray-500">여권·신분 정보와 동일하게 선택해 주세요.</p>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    {[
                      { v: 'female', label: '여성' },
                      { v: 'male', label: '남성' },
                    ].map(({ v, label }) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => {
                          setGender(v)
                          setRevealed((r) => Math.max(r, 3))
                          scrollToBottom()
                        }}
                        className={`rounded-xl border-2 py-3 text-sm font-bold transition ${
                          gender === v
                            ? 'border-cyan-500 bg-cyan-50 text-cyan-800'
                            : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-cyan-200'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <SectionInputConfirmed show={genderOk} />
                </div>
              </section>
            )}

            {/* 3 생년월일 */}
            {revealed >= 3 && genderOk && (
              <section className={sectionShell(revealed >= 4 && birthOk)}>
                <div className="p-5">
                  <p className="mb-2 text-sm font-semibold text-gray-800">생년월일 (Date of Birth)</p>
                  <p className="mb-3 text-xs text-gray-500">연·월을 고른 뒤 날짜를 눌러 주세요.</p>
                  <OnboardingBirthCalendar
                    key="onboarding-dob"
                    value={birthDate}
                    initialEmptyYear={2000}
                    onChange={(iso) => {
                      setBirthDate(iso)
                      if (iso) {
                        setRevealed((r) => Math.max(r, 4))
                        scrollToBottom()
                      }
                    }}
                  />
                  {birthDate ? (
                    <p className="mt-3 text-center text-sm font-medium text-cyan-800">선택: {isoToLabel(birthDate)}</p>
                  ) : null}
                  <SectionInputConfirmed show={birthOk} align="center" />
                </div>
              </section>
            )}

            {/* 4 이메일 */}
            {revealed >= 4 && birthOk && (
              <section className={sectionShell(revealed >= 5 && contactEmailOk)}>
                <div className="p-5">
                  <label htmlFor={contactEmailId} className="mb-1 block text-sm font-semibold text-gray-800">
                    이메일
                  </label>
                  <p className="mb-3 text-xs text-gray-500">예약·알림을 받을 주소예요.</p>
                  <input
                    id={contactEmailId}
                    name="contactEmail"
                    type="email"
                    autoComplete="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    onKeyDown={(e) => handleEnterToAdvanceInput(e, contactEmailOk, goEmailNext)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-base text-gray-900 placeholder:text-gray-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                  />
                  {contactEmailTrim.length > 0 && !contactEmailOk && (
                    <p className="mt-2 text-xs text-red-600" role="alert">
                      올바른 이메일 형식인지 확인해 주세요.
                    </p>
                  )}
                  <SectionInputConfirmed show={contactEmailOk} />
                  <button
                    type="button"
                    data-onboarding-next
                    disabled={!contactEmailOk}
                    onClick={(e) => {
                      e.preventDefault()
                      goEmailNext()
                    }}
                    className={ONBOARDING_NEXT_BTN_CLASS}
                  >
                    다음
                  </button>
                </div>
              </section>
            )}

            {revealed >= 5 && contactEmailOk && (
              <div className="pt-2">
                <h2 className="mb-3 text-left text-base font-bold tracking-tight text-gray-900">여권 정보</h2>
                <p className="text-xs text-gray-500">여권 원본과 동일하게 적어 주세요.</p>
              </div>
            )}

            {/* 5 여권 영문 이름 */}
            {revealed >= 5 && contactEmailOk && (
              <section className={sectionShell(revealed >= 6 && firstNameOk && lastNameOk)}>
              <div className="p-5">
                <p className="mb-2 text-sm font-semibold text-gray-800">여권 영문 이름</p>
                <p className="mb-4 text-left text-xs leading-relaxed text-gray-500">
                  여권 사진면에 인쇄된 영문 이름과 동일하게 적되,
                  <br />
                  공백·하이픈(-)·작은따옴표(')가 있으면 그대로 입력해 주세요.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-left">
                    <span className="mb-1.5 block text-xs font-medium text-gray-600">First name(성)</span>
                    <input
                      id={firstNameId}
                      name="passportFirstName"
                      type="text"
                      autoComplete="given-name"
                      value={passportFirstName}
                      onChange={(e) => setPassportFirstName(e.target.value.toUpperCase())}
                      onKeyDown={(e) => handleEnterToAdvanceInput(e, firstNameOk && lastNameOk, goNamesNext)}
                      placeholder="HONG"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-base text-gray-900 placeholder:text-gray-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                    />
                  </label>
                  <label className="block text-left">
                    <span className="mb-1.5 block text-xs font-medium text-gray-600">Last name(이름)</span>
                    <input
                      id={lastNameId}
                      name="passportLastName"
                      type="text"
                      autoComplete="family-name"
                      value={passportLastName}
                      onChange={(e) => setPassportLastName(e.target.value.toUpperCase())}
                      onKeyDown={(e) => handleEnterToAdvanceInput(e, firstNameOk && lastNameOk, goNamesNext)}
                      placeholder="GILDONG"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-base text-gray-900 placeholder:text-gray-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                    />
                  </label>
                </div>
                {((passportFirstName.length > 0 && !firstNameOk) ||
                  (passportLastName.length > 0 && !lastNameOk)) && (
                  <p
                    className="mt-2 text-left text-xs whitespace-nowrap text-red-600 overflow-x-auto [-webkit-overflow-scrolling:touch] [scrollbar-width:thin]"
                    role="alert"
                  >
                    {`영문·공백·하이픈(-)·작은따옴표(')만 사용할 수 있어요.`}
                  </p>
                )}
                <SectionInputConfirmed show={firstNameOk && lastNameOk} />
                <button
                  type="button"
                  data-onboarding-next
                  disabled={!firstNameOk || !lastNameOk}
                  onClick={(e) => {
                    e.preventDefault()
                    goNamesNext()
                  }}
                  className={ONBOARDING_NEXT_BTN_CLASS}
                >
                  다음
                </button>
              </div>
            </section>
            )}

            {/* 6 여권 번호 */}
            {revealed >= 6 && (
              <section className={sectionShell(revealed >= 7 && passportNoOk)}>
                <div className="p-5">
                  <label htmlFor={passportNoId} className="mb-2 block text-sm font-semibold text-gray-800">
                    여권 번호 (Passport Number)
                  </label>
                  <p className="mb-3 text-xs text-gray-500">공백 없이 영문·숫자만 입력해 주세요.</p>
                  <input
                    id={passportNoId}
                    name="passportNumber"
                    type="text"
                    autoCapitalize="characters"
                    autoCorrect="off"
                    spellCheck={false}
                    value={passportNumber}
                    onChange={(e) => setPassportNumber(e.target.value.toUpperCase())}
                    onKeyDown={(e) => handleEnterToAdvanceInput(e, passportNoOk, goPassportNext)}
                    placeholder="M12345678"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 font-mono text-base tracking-wide text-gray-900 placeholder:text-gray-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                  />
                  {passportNumber.length > 0 && !passportNoOk && (
                    <p className="mt-2 text-xs text-red-600" role="alert">
                      6~14자의 영문 대문자와 숫자만 사용할 수 있어요.
                    </p>
                  )}
                  <SectionInputConfirmed show={passportNoOk} />
                  <button
                    type="button"
                    data-onboarding-next
                    disabled={!passportNoOk}
                    onClick={(e) => {
                      e.preventDefault()
                      goPassportNext()
                    }}
                    className={ONBOARDING_NEXT_BTN_CLASS}
                  >
                    다음
                  </button>
                </div>
              </section>
            )}

            {/* 7 국적 */}
            {revealed >= 7 && (
              <section className={sectionShell(revealed >= 8 && nationalityOk)}>
                <div
                  className="p-5"
                  onKeyDown={(e) => handleEnterToAdvanceSection(e, nationalityOk, goNationalityNext)}
                >
                  <label htmlFor="onboarding-nationality" className="mb-2 block text-sm font-semibold text-gray-800">
                    국적 (Nationality)
                  </label>
                  <p className="mb-3 text-xs text-gray-500">여권에 적힌 국적을 선택해 주세요.</p>
                  <OnboardingCustomSelect
                    id="onboarding-nationality"
                    value={nationality}
                    onValueChange={setNationality}
                    placeholder="국가를 선택해 주세요"
                    options={COUNTRY_OPTIONS}
                  />
                  <SectionInputConfirmed show={nationalityOk} />
                  <button
                    type="button"
                    data-onboarding-next
                    disabled={!nationalityOk}
                    onClick={(e) => {
                      e.preventDefault()
                      goNationalityNext()
                    }}
                    className={ONBOARDING_NEXT_BTN_CLASS}
                  >
                    다음
                  </button>
                </div>
              </section>
            )}

            {/* 8 발급 국가 */}
            {revealed >= 8 && nationalityOk && (
              <section className={sectionShell(revealed >= 9 && issuingOk)}>
                <div
                  className="p-5"
                  onKeyDown={(e) => handleEnterToAdvanceSection(e, issuingOk, goIssuingNext)}
                >
                  <label htmlFor="onboarding-issuing-country" className="mb-2 block text-sm font-semibold text-gray-800">
                    발급 국가 (Issuing Country)
                  </label>
                  <p className="mb-3 text-xs text-gray-500">여권을 발급한 국가를 선택해 주세요.</p>
                  <OnboardingCustomSelect
                    id="onboarding-issuing-country"
                    value={passportIssuingCountry}
                    onValueChange={setPassportIssuingCountry}
                    placeholder="국가를 선택해 주세요"
                    options={COUNTRY_OPTIONS}
                  />
                  <SectionInputConfirmed show={issuingOk} />
                  <button
                    type="button"
                    data-onboarding-next
                    disabled={!issuingOk}
                    onClick={(e) => {
                      e.preventDefault()
                      goIssuingNext()
                    }}
                    className={ONBOARDING_NEXT_BTN_CLASS}
                  >
                    다음
                  </button>
                </div>
              </section>
            )}

            {/* 9 만료일 */}
            {revealed >= 9 && issuingOk && (
              <section className={sectionShell(revealed >= 10 && expiryOk)}>
                <div className="p-5">
                  <p className="mb-2 text-sm font-semibold text-gray-800">만료일 (Expiry Date)</p>
                  <p className="mb-3 text-xs text-gray-500">여권 만료일을 선택해 주세요.</p>
                  <OnboardingBirthCalendar
                    key="onboarding-expiry"
                    value={passportExpiryDate}
                    initialEmptyYear={2030}
                    onChange={(iso) => {
                      setPassportExpiryDate(iso)
                      if (iso) {
                        setRevealed((r) => Math.max(r, 10))
                        scrollToBottom()
                      }
                    }}
                    minDate={expiryMinDate}
                    maxDate={expiryMaxDate}
                  />
                  {passportExpiryDate ? (
                    <p className="mt-3 text-center text-sm font-medium text-cyan-800">
                      선택: {isoToLabel(passportExpiryDate)}
                    </p>
                  ) : null}
                  <SectionInputConfirmed show={expiryOk} align="center" />
                </div>
              </section>
            )}

            {/* 10 발급일 */}
            {revealed >= 10 && expiryOk && (
              <section className={sectionShell(false)}>
                <div className="p-5">
                  <p className="mb-2 text-sm font-semibold text-gray-800">발급일 (Issue Date)</p>
                  <p className="mb-3 text-xs text-gray-500">
                    발급일은 생년월일 이후, 오늘 이전이어야 하고 만료일 이전이어야 해요.
                  </p>
                  <OnboardingBirthCalendar
                    key="onboarding-issue"
                    value={passportIssueDate}
                    initialEmptyYear={2015}
                    onChange={setPassportIssueDate}
                    minDate={issueMinDate}
                    maxDate={issueMaxDate}
                  />
                  {passportIssueDate ? (
                    <p className="mt-3 text-center text-sm font-medium text-cyan-800">
                      선택: {isoToLabel(passportIssueDate)}
                    </p>
                  ) : null}
                  <SectionInputConfirmed show={issueOk && datesConsistent} align="center" />
                  {!datesConsistent && issueOk && birthOk && expiryOk && (
                    <p className="mt-3 text-center text-xs text-red-600" role="alert">
                      날짜 순서를 확인해 주세요. (생년월일 ≤ 발급일 ≤ 만료일, 발급일은 오늘까지)
                    </p>
                  )}
                </div>
              </section>
            )}
          </div>

          <div ref={bottomAnchorRef} className="h-px w-full shrink-0" aria-hidden="true" />

          {revealed >= 10 && (
            <button
              type="button"
              disabled={!canFinish}
              onClick={() => canFinish && setFinishModalOpen(true)}
              className={ONBOARDING_FINISH_BTN_CLASS}
            >
              체크메이트 시작하기
            </button>
          )}
        </form>
      </div>

      {finishModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-teal-950/40 p-4 backdrop-blur-[2px]"
          role="presentation"
          onClick={() => setFinishModalOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="onboarding-finish-modal-title"
            className="relative w-full max-w-md rounded-2xl border border-teal-100/90 bg-white p-4 shadow-2xl shadow-teal-900/15 ring-1 ring-teal-50 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={onboardingFinishMascotUrl}
              alt=""
              role="presentation"
              decoding="async"
              className="mx-auto mb-4 block h-auto w-full max-w-[min(7.5rem,58vw)] -translate-x-2 object-contain object-center select-none sm:mb-5 sm:max-w-44 sm:-translate-x-3 md:-translate-x-5"
            />
            <h2
              id="onboarding-finish-modal-title"
              className="text-center text-xs font-extrabold leading-relaxed text-gray-900 sm:text-sm md:text-base md:leading-snug"
            >
              모든 준비가 완료되셨군요!
              <br />
              이제 저희와 함께 여행을 준비하러 가볼까요?
            </h2>
            <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row">
              <button
                type="button"
                onClick={completeOnboarding}
                className="min-h-12 flex-1 rounded-2xl border-2 border-amber-300 bg-amber-50 py-3 text-sm font-bold text-amber-950 shadow-sm transition-colors hover:border-amber-400 hover:bg-amber-100"
              >
                확인
              </button>
              <button
                type="button"
                onClick={() => setFinishModalOpen(false)}
                className="min-h-12 flex-1 rounded-2xl border-2 border-teal-600 bg-white py-3 text-sm font-bold text-teal-800 shadow-sm transition-colors hover:bg-teal-50"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
