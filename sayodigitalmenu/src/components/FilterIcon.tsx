import './FilterIcon.css'

/** Filter funnel icon matching ThemeIcon and ViewIcon style (stroke, currentColor). */
export function FilterIcon() {
  return (
    <svg
      className="filter-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22 3H2l8 9.5V19l4 2v-8.5L22 3z" />
    </svg>
  )
}
