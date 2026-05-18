export const CONSENT_ERROR = 'Необходимо согласие на обработку персональных данных';

export function ConsentCheckbox({ checked = false, onChange, error, register }) {
  const inputProps = typeof register === 'function'
    ? register('consent', { required: CONSENT_ERROR })
    : { checked, onChange: onChange || (() => {}) };

  return (
    <label className="consent-field">
      <input
        type="checkbox"
        required
        aria-invalid={Boolean(error)}
        aria-describedby={error ? 'consent-error' : undefined}
        {...inputProps}
      />
      <span>
        Я согласен на обработку персональных данных в соответствии с{' '}
        <a href="/privacy" target="_blank" rel="noreferrer">Политикой конфиденциальности</a>
      </span>
      {error && <small id="consent-error" className="form-error consent-error">{error.message || error}</small>}
    </label>
  );
}
