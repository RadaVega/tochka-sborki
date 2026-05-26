import { useState } from 'react';
import { useAnalytics, GOALS } from '../hooks/useAnalytics';

export function CompanyPathPage() {
  const { goal, track } = useAnalytics();
  const [values, setValues] = useState({ budget: '', stack: '' });
  const [status, setStatus] = useState('idle');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Track form start
    goal(GOALS.COMPANY_FORM_START, { 
      budget: values.budget,
      stack: values.stack 
    });
    
    track('company_form_submit', {
      budget: values.budget,
      stack: values.stack
    });

    try {
      setStatus('submitting');
      
      // Your form submission logic here
      const response = await fetch('/api/company-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });

      if (response.ok) {
        setStatus('success');
        
        // ✅ ИСПРАВЛЕНО: используем GOALS вместо хардкода
        goal(GOALS.COMPANY_FORM_SUCCESS, { 
          budget: values.budget, 
          stack: values.stack 
        });
        
        track('company_form_success', {
          budget: values.budget
        });
      } else {
        throw new Error('Submit failed');
      }
    } catch (error) {
      setStatus('error');
      goal(GOALS.COMPANY_FORM_ERROR, { 
        error: error.message,
        budget: values.budget 
      });
    }
  };

  const handleFieldFocus = (fieldName) => {
    track('form_field_focus', { 
      form: 'company_path', 
      field: fieldName 
    });
  };

  return (
    <div className="company-path-page">
      <h1>Путь компании</h1>
      
      <form 
        onSubmit={handleSubmit}
        data-ym-goal={GOALS.COMPANY_FORM_SUBMIT}
      >
        <div>
          <label>Бюджет</label>
          <input
            type="text"
            name="budget"
            value={values.budget}
            onChange={(e) => setValues({...values, budget: e.target.value})}
            onFocus={() => handleFieldFocus('budget')}
            required
          />
        </div>

        <div>
          <label>Стек</label>
          <input
            type="text"
            name="stack"
            value={values.stack}
            onChange={(e) => setValues({...values, stack: e.target.value})}
            onFocus={() => handleFieldFocus('stack')}
            required
          />
        </div>

        <button 
          type="submit"
          disabled={status === 'submitting'}
          data-analytics="cta"
        >
          {status === 'submitting' ? 'Отправка...' : 'Отправить заявку'}
        </button>

        {status === 'success' && (
          <p className="success">Заявка отправлена!</p>
        )}
        {status === 'error' && (
          <p className="error">Ошибка отправки</p>
        )}
      </form>
    </div>
  );
}