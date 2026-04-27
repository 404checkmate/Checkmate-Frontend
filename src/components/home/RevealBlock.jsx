import { REVEAL_EASE } from './constants'

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
