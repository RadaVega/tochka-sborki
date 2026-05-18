export const CONSENT_ERROR = 'Необходимо согласие на обработку ПДн';

export function ConsentCheckbox({ register, error }) {
  return (
    <label className="consent-field">
      <input type="checkbox" {...register('consent', { required: CONSENT_ERROR })} />
      <span>
        Я согласен с{' '}
        <a href="/privacy" target="_blank" rel="noreferrer">Политикой конфиденциальности</a>{' '}
        и даю согласие на обработку моих персональных данных (ФИО, email, контактная информация) в целях: коммуникации по проекту, подбора команды, отправки уведомлений. Согласие действует до момента его отзыва. Я осведомлён о своих правах по 152-ФЗ.
      </span>
      {error && <small className="form-error consent-error">{error.message}</small>}
    </label>
  );
}
