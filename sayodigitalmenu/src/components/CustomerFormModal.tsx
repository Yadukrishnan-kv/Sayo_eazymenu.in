import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { API_BASE } from '../api/config'
import './CustomerFormModal.css'

interface CustomerFormModalProps {
  open: boolean
  onClose: () => void
}

export function CustomerFormModal({ open, onClose }: CustomerFormModalProps) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [dob, setDob] = useState('')
  const [anniversary, setAnniversary] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const reset = () => {
    setName('')
    setPhone('')
    setEmail('')
    setDob('')
    setAnniversary('')
    setNotes('')
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!name.trim() || !phone.trim()) {
      setError('Name and contact number are required.')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch(`${API_BASE}/api/public/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          dateOfBirth: dob || undefined,
          anniversary: anniversary || undefined,
          notes: notes.trim() || undefined,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || 'Failed to submit details')
      }
      setSuccess(true)
      reset()
    } catch (err: any) {
      setError(err?.message || 'Failed to submit details')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    if (submitting) return
    reset()
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="customer-modal__backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
          />
          <motion.dialog
            open
            className="customer-modal"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            aria-modal="true"
            aria-labelledby="customer-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="customer-modal__close"
              onClick={handleClose}
              aria-label="Close"
            >
              ×
            </button>
            <h2 id="customer-modal-title" className="customer-modal__title">
              {/* Simple text; can be translated via i18n later */}
              Join our guest list
            </h2>
            {!success && (
              <p className="customer-modal__subtitle">
                Share your details so we can personalise your experience.
              </p>
            )}
            {success ? (
              <div className="customer-modal__success-only">
                <p className="customer-modal__success">
                  Thank you! Your details have been submitted.
                </p>
                <div className="customer-modal__actions">
                  <button
                    type="button"
                    className="customer-modal__btn customer-modal__btn--primary"
                    onClick={handleClose}
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="customer-modal__form">
                <label className="customer-modal__field">
                  <span>Name *</span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </label>
                <label className="customer-modal__field">
                  <span>Contact number *</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </label>
                <label className="customer-modal__field">
                  <span>Email</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </label>
                <div className="customer-modal__field-row">
                  <label className="customer-modal__field">
                    <span>Date of birth</span>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                    />
                  </label>
                  <label className="customer-modal__field">
                    <span>Anniversary</span>
                    <input
                      type="date"
                      value={anniversary}
                      onChange={(e) => setAnniversary(e.target.value)}
                    />
                  </label>
                </div>
                <label className="customer-modal__field">
                  <span>Notes</span>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </label>
                {error && <p className="customer-modal__error">{error}</p>}
                <div className="customer-modal__actions">
                  <button
                    type="button"
                    className="customer-modal__btn customer-modal__btn--secondary"
                    onClick={handleClose}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="customer-modal__btn customer-modal__btn--primary"
                    disabled={submitting}
                  >
                    {submitting ? 'Submitting…' : 'Submit'}
                  </button>
                </div>
              </form>
            )}
          </motion.dialog>
        </>
      )}
    </AnimatePresence>
  )
}

