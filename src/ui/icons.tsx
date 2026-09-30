import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

const base = (size = 20): SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
})

export const PlusIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><path d="M12 5v14M5 12h14" /></svg>
)
export const MinusIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><path d="M5 12h14" /></svg>
)
export const ResetIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><path d="M4 12a8 8 0 1 0 2.4-5.7" /><path d="M4 4v4h4" /></svg>
)
export const ExpandIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></svg>
)
export const CollapseIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" /></svg>
)
export const CloseIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><path d="M6 6l12 12M18 6L6 18" /></svg>
)
export const SunIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
  </svg>
)
export const ShadeIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><circle cx="12" cy="12" r="4" strokeDasharray="2 2.2" /></svg>
)
export const DropIcon = ({ size, level = 0, ...p }: Omit<IconProps, 'fill'> & { level?: number }) => {
  const id = `drop-${Math.round(level * 100)}`
  const d = 'M12 3.2c3.2 4.1 5.6 7.3 5.6 10.4a5.6 5.6 0 0 1-11.2 0c0-3.1 2.4-6.3 5.6-10.4z'
  return (
    <svg {...base(size)} {...p}>
      <defs>
        <clipPath id={id}>
          <rect x="0" y={24 - 24 * level} width="24" height="24" />
        </clipPath>
      </defs>
      <path d={d} fill="currentColor" stroke="none" clipPath={`url(#${id})`} />
      <path d={d} />
    </svg>
  )
}
export const CatIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M5 20v-8.5L4 5l4.2 3.2h7.6L20 5l-1 6.5V20" />
    <path d="M9.5 13.5v.01M14.5 13.5v.01M11 16.5h2" />
  </svg>
)
export const DogIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M7 7.5C5 6 3.5 7 3.5 9.5c0 2 1.2 3 2.5 3M17 7.5c2-1.5 3.5-.5 3.5 2 0 2-1.2 3-2.5 3" />
    <path d="M7 7.5c1.4-1.3 3-2 5-2s3.6.7 5 2V15a5 5 0 0 1-10 0z" />
    <path d="M10 12v.01M14 12v.01M11 15.5h2" />
  </svg>
)
export const PersonIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><circle cx="12" cy="6.5" r="3" /><path d="M5.5 20.5c.6-4 3.1-6.5 6.5-6.5s5.9 2.5 6.5 6.5" /></svg>
)
export const CheckIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><path d="M5 12.5l4.2 4L19 7" /></svg>
)
export const WarnIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><path d="M12 4l9 16H3z" /><path d="M12 10v4M12 17v.01" /></svg>
)
export const LeafIcon = ({ size, filled, ...p }: IconProps & { filled?: boolean }) => (
  <svg {...base(size)} {...p}>
    <path d="M5 19C5 10 10 5 19 5c0 9-5 14-14 14z" fill={filled ? 'currentColor' : 'none'} />
    <path d="M5 19l8-8" stroke={filled ? 'var(--paper)' : 'currentColor'} />
  </svg>
)
export const PotIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><path d="M4 9h16M5.5 9l1.6 11h9.8L18.5 9M12 9V4M12 6c-2-2-4-2-5-1.5M12 5.5c1.6-1.8 3.6-2 4.8-1.2" /></svg>
)
