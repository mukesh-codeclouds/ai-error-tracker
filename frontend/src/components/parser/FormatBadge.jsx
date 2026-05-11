const FORMAT_META = {
  php:     { label: 'PHP',     class: 'badge-php',     icon: '🐘' },
  nodejs:  { label: 'Node.js', class: 'badge-nodejs',  icon: '⬢' },
  python:  { label: 'Python',  class: 'badge-python',  icon: '🐍' },
  unknown: { label: 'Unknown', class: 'badge-unknown', icon: '?' },
}

export default function FormatBadge({ format }) {
  const meta = FORMAT_META[format] || FORMAT_META.unknown
  return (
    <span id={`format-badge-${format}`} className={meta.class}>
      <span>{meta.icon}</span>
      {meta.label}
    </span>
  )
}
