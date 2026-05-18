import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ConsentCheckbox } from '../components/ConsentCheckbox';
import { pages } from '../data/content';
import { Logo } from '../components/Logo';
import { HermesDiagram, MoneyFlowDiagram, OrbitalDiagram } from '../components/Diagrams';
import {
  Badge,
  Card,
  ChannelCard,
  Checklist,
  ContactBlock,
  MetricBox,
  MovieCard,
  PageShell,
  PartnerTile,
  ProcessNode,
  ProgressBar,
  Reveal,
  SlideHeader,
  StepCard,
  TagRow,
  TechItem
} from '../components/UI';
export { CompanyPathPage } from './CompanyPathPage';
export { PrivacyPage } from './PrivacyPage';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

const api = async (url, payload) => {
  const response = await fetch(`${API_BASE}${url}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.success === false) {
    throw new Error(data.error || data.message || 'Не удалось отправить форму');
  }
  return data;
};

function InlineForm({ type }) {
  const [status, setStatus] = useState('');
  const [serverError, setServerError] = useState('');
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const configs = {
    contact: {
      title: 'Свяжитесь с нами',
      endpoint: '/api/contact',
      fields: [
        { name: 'name', label: 'Имя', rules: { required: 'Укажите имя' } },
        { name: 'email', label: 'Email', type: 'email', rules: { required: 'Укажите email', pattern: { value: /.+@.+\..+/, message: 'Введите корректный email' } } },
        { name: 'message', label: 'Сообщение', textarea: true, rules: { required: 'Напишите сообщение', minLength: { value: 10, message: 'Минимум 10 символов' } } }
      ]
    },
    subscribe: {
      title: 'Подписка на новости',
      endpoint: '/api/subscribe',
      fields: [
        { name: 'email', label: 'Email', type: 'email', rules: { required: 'Укажите email', pattern: { value: /.+@.+\..+/, message: 'Введите корректный email' } } }
      ]
    },
    project: {
      title: 'Подать техническое задание',
      endpoint: '/api/submit-project',
      fields: [
        { name: 'companyName', label: 'Название компании', rules: { required: 'Укажите компанию' } },
        { name: 'contactName', label: 'Контактное лицо', rules: { required: 'Укажите контактное лицо' } },
        { name: 'email', label: 'Email', type: 'email', rules: { required: 'Укажите email', pattern: { value: /.+@.+\..+/, message: 'Введите корректный email' } } },
        { name: 'stack', label: 'Стек', rules: { required: 'Укажите стек' } },
        { name: 'budget', label: 'Бюджет', rules: { required: 'Укажите бюджет' } },
        { name: 'deadline', label: 'Дедлайн', type: 'date', rules: { required: 'Укажите дедлайн' } },
        { name: 'description', label: 'Описание проекта', textarea: true, rules: { required: 'Опишите проект', minLength: { value: 20, message: 'Минимум 20 символов' } } }
      ]
    }
  };

  const config = configs[type];

  const onSubmit = async (values) => {
    setStatus('');
    setServerError('');
    try {
      const result = await api(config.endpoint, values);
      setStatus(result.message || 'Готово. Заявка отправлена, мы свяжемся с вами.');
      reset();
    } catch (error) {
      setServerError(error.message || 'Не удалось отправить форму. Попробуйте ещё раз.');
    }
  };

  return (
    <Card accent={type === 'project' ? 'cyan' : 'purple'} className="form-card">
      <h2>{config.title}</h2>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {config.fields.map((field) => (
          <label key={field.name}>
            <span>{field.label}</span>
            {field.textarea ? (
              <textarea rows="4" {...register(field.name, field.rules)} />
            ) : (
              <input type={field.type || 'text'} {...register(field.name, field.rules)} />
            )}
            {errors[field.name] && <small className="form-error">{errors[field.name].message}</small>}
          </label>
        ))}
        <ConsentCheckbox register={register} error={errors.consent} />
        <button className="primary-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Отправляем...' : 'Отправить'}
        </button>
        {serverError && <p className="form-error form-message">{serverError}</p>}
        {status && <p className="form-success">{status}</p>}
      </form>
    </Card>
  );
}

export function HeroPage() {
  const page = pages.hero;
  return (
    <PageShell page={page} className="hero-page">
      <div className="hero-grid">
        <Reveal className="hero-copy">
          <Logo />
          <Badge>{page.tag}</Badge>
          <h1>{page.title[0]}<br /><span>{page.title[1]}</span><br /><em>{page.title[2]}</em></h1>
          <div className="hero-line" />
          <div className="metric-grid three">
            {page.metrics.map((metric) => <MetricBox key={metric.value} {...metric} />)}
          </div>
          <p>{page.subtitle}</p>
          <div className="audience-row">
            {page.audience.map((item) => <span key={item}>{item}</span>)}
          </div>
        </Reveal>
        <Reveal>
          <OrbitalDiagram labels={page.forWhom} />
        </Reveal>
      </div>
    </PageShell>
  );
}

export function ProblemPage() {
  const page = pages.problem;
  return (
    <PageShell page={page}>
      <SlideHeader page={page} />
      <div className="split problem-split">
        {page.columns.map((column) => (
          <Reveal key={column.title}>
            <Card accent={column.title.includes('Студенты') ? 'purple' : 'cyan'} className="pain-card">
              <div className="pain-head"><span>{column.icon}</span><div><h2>{column.title}</h2><strong>{column.lead}</strong></div></div>
              {column.items.map((item) => (
                <div className="pain-item" key={item.title}><span>{item.icon}</span><div><h3>{item.title}</h3><p>{item.text}</p></div></div>
              ))}
              <blockquote><small>{column.quoteLabel}</small>{column.quote}</blockquote>
            </Card>
          </Reveal>
        ))}
      </div>
      <Card accent="pink" className="insight">{page.insight}</Card>
    </PageShell>
  );
}

export function SolutionPage() {
  const page = pages.solution;
  return (
    <PageShell page={page}>
      <SlideHeader page={page} />
      <div className="three-col">
        <Reveal>
          <Card accent="green"><h2>{page.intro.title}</h2><p>{page.intro.text}</p></Card>
          <Card accent="purple"><h2>Как это работает</h2><p>{page.mechanics}</p><TagRow tags={page.badges} /></Card>
          <blockquote className="quote"><strong>{page.quoteTitle}</strong>{page.quote}</blockquote>
        </Reveal>
        <OrbitalDiagram labels={['IT-разработчики', 'AI-агенты', 'Ментор + ТЗ']} />
        <Reveal>
          {page.value.map((item) => <Card key={item.title} accent={item.title.includes('Компаниям') ? 'cyan' : 'purple'}><h2>{item.title}</h2><strong>{item.subtitle}</strong><Checklist items={item.points} /></Card>)}
        </Reveal>
      </div>
    </PageShell>
  );
}

export function HowItWorksPage() {
  const page = pages.howItWorks;
  return (
    <PageShell page={page}>
      <SlideHeader page={page} />
      <div className="step-grid">
        {page.steps.map((step, index) => <Reveal key={step.title}><StepCard step={step} index={index} /></Reveal>)}
      </div>
      <Card className="insight">{page.footer}<TagRow tags={['Agile', 'AI-powered', 'Fully tracked']} /></Card>
    </PageShell>
  );
}

export function PartnersPage() {
  const page = pages.partners;
  return (
    <PageShell page={page}>
      <SlideHeader page={page} />
      <div className="split">
        <Reveal><h2 className="section-label">{page.acceleratorsTitle}</h2>{page.accelerators.map((item) => <PartnerTile key={item.title} item={item} />)}</Reveal>
        <Reveal><h2 className="section-label">{page.corporatesTitle}</h2><div className="grid two">{page.corporates.map((item) => <PartnerTile key={item.title} item={item} />)}</div><Card accent="gold"><h2>💼 Стратегия входа в экосистему</h2><p>{page.strategy}</p><strong>{page.advantage}</strong></Card></Reveal>
      </div>
    </PageShell>
  );
}

export function AiArchitecturePage() {
  const page = pages.aiArchitecture;
  return (
    <PageShell page={page}>
      <SlideHeader page={page} />
      <div className="split wide-left">
        <Reveal><HermesDiagram page={page} /></Reveal>
        <Reveal>
          <h2 className="section-label">⚡ Эффект автоматизации — конкретные цифры</h2>
          <div className="metric-grid">{page.metrics.map((metric) => <MetricBox key={metric.value} {...metric} />)}</div>
          {page.agents.map((agent) => <Card key={agent.title} className="agent-card" accent="green"><span>{agent.icon}</span><div><h2>{agent.title}</h2><p>{agent.text}</p></div></Card>)}
        </Reveal>
      </div>
    </PageShell>
  );
}

export function TechStackPage() {
  const page = pages.techStack;
  return (
    <PageShell page={page}>
      <SlideHeader page={page} />
      <div className="grid two">{page.groups.map((item) => <Reveal key={item.title}><TechItem item={item} /></Reveal>)}</div>
      <Card accent="green" className="insight">🛡️ {page.shield}</Card>
    </PageShell>
  );
}

export function CommunicationsPage() {
  const page = pages.communications;
  return (
    <PageShell page={page}>
      <SlideHeader page={page} />
      <div className="split">
        {page.groups.map((group) => <Reveal key={group.title}><h2 className="section-label">{group.title}</h2>{group.channels.map((channel) => <ChannelCard key={channel.name} channel={channel} />)}</Reveal>)}
      </div>
      <Card accent="pink" className="insight">{page.demo}<TagRow tags={['Ежемесячно', 'Live', '+ Запись']} /></Card>
    </PageShell>
  );
}

export function StudentPathPage() {
  return <ProcessPage page={pages.studentPath} form={null} />;
}

function ProcessPage({ page, form }) {
  const leftSteps = form ? page.steps : page.steps.slice(0, 3);
  const rightSteps = form ? [] : page.steps.slice(3);
  return (
    <PageShell page={page}>
      <SlideHeader page={page} />
      <div className={form ? 'split wide-left' : 'grid two'}>
        <Reveal className="process-grid">{leftSteps.map((item, index) => <ProcessNode key={item.title} item={item} index={index} />)}</Reveal>
        {form ? <Reveal>{form}</Reveal> : <Reveal className="process-grid">{rightSteps.map((item, index) => <ProcessNode key={item.title} item={item} index={index + 3} />)}</Reveal>}
      </div>
      <Card className="insight"><strong>🛠 Стек:</strong><TagRow tags={page.stack} /></Card>
    </PageShell>
  );
}

export function MoneyFlowPage() {
  const page = pages.moneyFlow;
  return (
    <PageShell page={page}>
      <SlideHeader page={page} />
      <div className="split wide-left">
        <Reveal>
          <MoneyFlowDiagram flow={page.flow} />
          <div className="grid three">{page.paymentStages.map((item) => <Card key={item} accent="cyan"><p>{item}</p></Card>)}</div>
          <Card accent="gold"><h2>📲 Как студент видит деньги</h2><Checklist items={page.studentMoney} /></Card>
        </Reveal>
        <Reveal>
          {page.model.map((item) => <Card key={item.title}><h2>{item.title}</h2><p>{item.text}</p>{item.tags && <TagRow tags={item.tags} />}</Card>)}
          <Card accent="green"><h2>📊 Распределение бюджета проекта</h2>{page.split.map((item) => <ProgressBar key={item.label} item={{ label: item.label, value: `${item.value}%`, width: item.value }} />)}</Card>
        </Reveal>
      </div>
    </PageShell>
  );
}

export function IndustriesPage() {
  const page = pages.industries;
  return (
    <PageShell page={page}>
      <SlideHeader page={page} />
      <div className="center-title"><Badge accent="gold">{page.kicker}</Badge><p>{page.subtitle}</p></div>
      <div className="industry-grid">{page.items.map((item) => <Reveal key={item.title}><Card accent={item.accent} className="industry-card"><span className="industry-icon">{item.icon}</span><h2>{item.title}</h2><small>{item.meta}</small><Checklist items={item.points} /><TagRow tags={item.companies} /></Card></Reveal>)}</div>
      <Card className="insight">{page.cta}<TagRow tags={['Коммерческий опыт', 'Стратегические отрасли', 'Реальный оффер']} /></Card>
    </PageShell>
  );
}

export function MentorsPage() {
  const page = pages.mentors;
  return (
    <PageShell page={page}>
      <SlideHeader page={page} />
      <div className="split">
        <Reveal>
          {page.cards.map((card) => <Card key={card.title}><h2>{card.title}</h2><Checklist items={card.items} /></Card>)}
          <Card accent="purple" className="time-card"><h2>⏱ Время ментора в неделю</h2><div><strong>{page.time.before}</strong><span>→</span><strong>{page.time.after}</strong></div><p>{page.time.result}</p></Card>
        </Reveal>
        <Reveal>
          <h2 className="section-label">🤖 Как AI помогает ментору</h2>
          {page.agents.map((agent) => <Card key={agent.title} className="agent-card" accent="green"><span>{agent.icon}</span><div><h2>{agent.title}</h2><p>{agent.text}</p></div></Card>)}
          <blockquote className="quote">{page.quote}</blockquote>
        </Reveal>
      </div>
    </PageShell>
  );
}

export function TransformationPage() {
  const page = pages.transformation;
  return (
    <PageShell page={page}>
      <SlideHeader page={page} />
      <div className="grid four">{page.movies.map((movie) => <Reveal key={movie.title}><MovieCard movie={movie} /></Reveal>)}</div>
      <blockquote className="quote">{page.quote}</blockquote>
    </PageShell>
  );
}

export function GoalsPage() {
  const page = pages.goals;
  return (
    <PageShell page={page}>
      <SlideHeader page={page} />
      <div className="split">
        <Reveal><h2 className="section-label">🗓 Дорожная карта — 3 фазы</h2>{page.phases.map((phase, index) => <Card key={phase.title} accent={phase.accent}><h2>{index + 1}. {phase.title}</h2><strong>{phase.meta}</strong><Checklist items={phase.items} /></Card>)}</Reveal>
        <Reveal><h2 className="section-label">📊 Ключевые метрики успеха</h2><div className="metric-grid two">{page.metrics.map((metric) => <MetricBox key={metric.value} {...metric} />)}</div><Card>{page.progress.map((item) => <ProgressBar key={item.label} item={item} />)}</Card></Reveal>
      </div>
    </PageShell>
  );
}

export function ContactsPage() {
  const page = pages.contacts;
  return (
    <PageShell page={page} className="contacts-page">
      <div className="contacts-grid">
        <Reveal>
          <Logo />
          <Badge>{page.tag}</Badge>
          <h1>{page.title}</h1>
          <p>{page.subtitle}</p>
          <div className="grid two">{page.blocks.map((block) => <Card key={block.title}><h2>{block.title}</h2><Checklist items={block.items} /></Card>)}</div>
          <InlineForm type="subscribe" />
        </Reveal>
        <Reveal>
          <h2 className="section-label">Свяжитесь для запуска пилота</h2>
          {page.contacts.map((item) => <ContactBlock key={item.label} item={item} />)}
          <Card><h2>Коротко о нас</h2><div className="metric-grid two">{page.stats.map((stat) => <MetricBox key={stat.label} {...stat} />)}</div></Card>
          <InlineForm type="contact" />
        </Reveal>
      </div>
    </PageShell>
  );
}
