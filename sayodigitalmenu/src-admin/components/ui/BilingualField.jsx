/** Renders two inputs side-by-side: English and Arabic. Use for bilingual content. */
export function BilingualInput({ label, nameEn, nameAr, errorEn, errorAr, placeholderEn, placeholderAr, register }) {
  return (
    <div className="space-y-3">
      {label && (
        <p className="text-sm font-medium text-sayo-creamMuted">{label}</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-sayo-creamMuted/80 mb-1">English</label>
          <input
            className={`input-field w-full ${errorEn ? 'border-red-500' : ''}`}
            placeholder={placeholderEn}
            {...(register ? register(nameEn) : {})}
          />
          {errorEn && <p className="mt-1 text-xs text-red-400">{errorEn}</p>}
        </div>
        <div>
          <label className="block text-xs text-sayo-creamMuted/80 mb-1">Arabic (العربية)</label>
          <input
            className={`input-field w-full text-right ${errorAr ? 'border-red-500' : ''}`}
            dir="rtl"
            placeholder={placeholderAr}
            {...(register ? register(nameAr) : {})}
          />
          {errorAr && <p className="mt-1 text-xs text-red-400">{errorAr}</p>}
        </div>
      </div>
    </div>
  );
}

export function BilingualTextarea({ label, nameEn, nameAr, errorEn, errorAr, placeholderEn, placeholderAr, register }) {
  return (
    <div className="space-y-3">
      {label && (
        <p className="text-sm font-medium text-sayo-creamMuted">{label}</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-sayo-creamMuted/80 mb-1">English</label>
          <textarea
            className={`input-field w-full min-h-[100px] resize-y ${errorEn ? 'border-red-500' : ''}`}
            placeholder={placeholderEn}
            {...(register ? register(nameEn) : {})}
          />
          {errorEn && <p className="mt-1 text-xs text-red-400">{errorEn}</p>}
        </div>
        <div>
          <label className="block text-xs text-sayo-creamMuted/80 mb-1">Arabic (العربية)</label>
          <textarea
            className={`input-field w-full min-h-[100px] resize-y text-right ${errorAr ? 'border-red-500' : ''}`}
            dir="rtl"
            placeholder={placeholderAr}
            {...(register ? register(nameAr) : {})}
          />
          {errorAr && <p className="mt-1 text-xs text-red-400">{errorAr}</p>}
        </div>
      </div>
    </div>
  );
}
