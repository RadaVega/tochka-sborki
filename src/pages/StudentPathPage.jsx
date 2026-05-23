import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, PageShell, ProcessNode, Reveal, TagRow } from '../components/UI';
import { Logo } from '../components/Logo';
import { ConsentCheckbox } from '../components/ConsentCheckbox';
import { useAnalytics } from '../hooks/useAnalytics';
import { pages } from '../data/content';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

const api = async (url, payload) => {
  const response = await fetch(`${API_BASE}${url}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.success === false) {
    throw new Error(data.error || data.message || 'Не удалось отправить заявку');
  }
  return data;
};

export function StudentPathPage() {
  return <ProcessPage page={pages.studentPath} form={<StudentForm />} />;
}

/* ─── Student Application Form ──────────────────── */
function StudentForm() {
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');
  const [formState, setFormState] = useState({ consent: false });
  const [consentError, setConsentError] = useState('');
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();
  const { goal } = useAnalytics();

  const onSubmit = async (values) => {
    setServerError('');
    setSuccess('');
    setConsentError('');

    if (formState.consent !== true) {
      setConsentError('Необходимо согласие на обработку персональных данных');
      return;
    }

    try {
      const payload = {
        ...values,
        phone: values.phone || '',
        experience: values.experience || '',
        consent: formState.consent
      };
      const result = await api('/api/student-apply', payload);
      setSuccess(result.message || '✅ Заявка отправлена! Мы свяжемся с вами в течение 2–4 часов.');
      goal('STUDENT_FORM_SUCCESS', { stack: values.stack });
      reset();
      setFormState({ consent: false });
    } catch (error) {
      setServerError(error.message || 'Не удалось отправить заявку. Попробуйте позже или напишите нам: tochka.sborki21@vk.com');
    }
  };

  return (
    <Card accent="purple" className="student-form-card">
      <div className="ct-form-header">
        <div className="ct-form-icon">🎓</div>
        <div>
          <h2>Подать заявку студента</h2>
          <p>Заполните профиль — AI-скоринг подберёт первый проект за 48 часов</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="ct-form">
        <div className="form-row-2">
          <label>
            <span>Имя <b className="req">*</b></span>
            <input
              placeholder="Иван Петров"
              {...register('name', { required: 'Укажите имя', minLength: { value: 2, message: 'Минимум 2 символа' } })}
            />
            {errors.name && <small className="form-error">{errors.name.message}</small>}
          </label>
          <label>
            <span>Email <b className="req">*</b></span>
            <input
              type="email"
              placeholder="ivan@student.ru"
              {...register('email', {
                required: 'Укажите email',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Введите корректный email' },
              })}
            />
            {errors.email && <small className="form-error">{errors.email.message}</small>}
          </label>
        </div>

        <div className="form-row-2">
          <label>
            <span>Telegram / MAX</span>
            <input
              placeholder="@username"
              {...register('telegram', { maxLength: { value: 80, message: 'Слишком длинный ник' } })}
            />
            {errors.telegram && <small className="form-error">{errors.telegram.message}</small>}
          </label>
          <label>
            <span>Телефон</span>
            <input
              type="tel"
              placeholder="+7 (999) 000-00-00"
              {...register('phone', { maxLength: { value: 80, message: 'Телефон слишком длинный' } })}
            />
            {errors.phone && <small className="form-error">{errors.phone.message}</small>}
          </label>
        </div>

        <label>
          <span>Технологический стек <b className="req">*</b></span>
          <input
            placeholder="Python, Go, React, C/C++ — через запятую"
            {...register('stack', { required: 'Укажите ваш стек' })}
          />
          {errors.stack && <small className="form-error">{errors.stack.message}</small>}
        </label>

        <label>
          <span>Опыт программирования</span>
          <select {...register('experience')} defaultValue="">
            <option value="" disabled>Выберите уровень</option>
            <option value="beginner">Начинающий (до 6 месяцев)</option>
            <option value="intermediate">Средний (6–18 месяцев)</option>
            <option value="advanced">Продвинутый (18+ месяцев)</option>
          </select>
        </label>

        <label>
          <span>Ссылка на портфолио (GitFlic / GitHub)</span>
          <input
            type="url"
            placeholder="https://gitflic.ru/project/..."
            {...register('portfolio', { pattern: { value: /^https?:\/\/.+/i, message: 'Введите ссылку с http:// или https://' } })}
          />
          {errors.portfolio && <small className="form-error">{errors.portfolio.message}</small>}
        </label>

        <label>
          <span>О себе <b className="req">*</b></span>
          <textarea
            rows={4}
            placeholder="Расскажите о себе: чем интересуетесь, какие проекты делали, почему хотите в Точку Сборки..."
            {...register('about', { required: 'Расскажите о себе', minLength: { value: 20, message: 'Минимум 20 символов' } })}
          />
          {errors.about && <small className="form-error">{errors.about.message}</small>}
        </label>

        <ConsentCheckbox
          checked={formState.consent}
          onChange={(event) => {
            const consent = event.target.checked;
            setFormState({ consent });
            if (consent) setConsentError('');
          }}
          error={consentError}
        />

        <button
          className="primary-button"
          type="submit"
          disabled={isSubmitting || formState.consent !== true}
          style={{ width: '100%' }}
        >
          {isSubmitting ? '⏳ Отправляем...' : '🚀 Подать заявку'}
        </button>

        {serverError && <p className="form-error form-message">{serverError}</p>}
        {success && <p className="form-success">{success}</p>}
      </form>
    </Card>
  );
}

function ProcessPage({ page, form }) {
  const leftSteps = form ? page.steps : page.steps.slice(0, 3);
  const rightSteps = form ? [] : page.steps.slice(3);
  return (
    <PageShell page={page}>
      <div className="slide-header">
        <span className="slide-number">{page.number}</span>
        <h1>{page.title}</h1>
        <p>{page.subtitle}</p>
      </div>
      <div className={form ? 'split wide-left' : 'grid two'}>
        <Reveal className="process-grid">{leftSteps.map((item, index) => <ProcessNode key={item.title} item={item} index={index} />)}</Reveal>
        {form ? <Reveal>{form}</Reveal> : <Reveal className="process-grid">{rightSteps.map((item, index) => <ProcessNode key={item.title} item={item} index={index + 3} />)}</Reveal>}
      </div>
      <Card className="insight"><strong>🛠 Стек:</strong><TagRow tags={page.stack} /></Card>
    </PageShell>
  );
}