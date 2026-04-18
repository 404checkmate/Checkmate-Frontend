import { STEP4_ICON_PATHS } from '@/mocks/tripNewStep4Data'

export default function Step4SvgIcon({ name, className = 'w-4 h-4' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d={STEP4_ICON_PATHS[name]} />
    </svg>
  )
}
