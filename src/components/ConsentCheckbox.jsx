export const CONSENT_ERROR = 'Необходимо согласие на обработку персональных данных';

export function ConsentCheckbox({ checked, onChange, error, register }) {
  const inputProps = register
    ? register('consent', { required: CONSENT_ERROR })
    : { checked, onChange };

  return (
    <label className="consent-field">
      <input type="checkbox" required {...inputProps} />
      <span>
        Я согласен на обработку персональных данных в соответствии с{' '}
        <a href="/privacy" target="_blank" rel="noreferrer">Политикой конфиденциальности</a>
      </span>
      {error && <small className="form-error consent-error">{error.message || error}</small>}
    </label>
  );
}
