import { motion } from 'framer-motion';

export function PageShell({ page, children, className = '' }) {
  return (
    <section className={`page page-${page.theme || 'dark'} ${className}`}>
      <div className="glow glow-a" />
      <div className="glow glow-b" />
      <div className="page-inner">{children}</div>
    </section>
  );
}

export function SlideHeader({ page }) {
  return (
    <div className="slide-header">
      <div>
        {page.act && <Badge accent={page.theme}>{page.act}</Badge>}
        <div className="title-bar" />
        <h1>{page.title}</h1>
        {page.subtitle && <p className="subtitle">{page.subtitle}</p>}
      </div>
      {page.number && <span className="slide-number">{page.number}</span>}
    </div>
  );
}

export function Card({ children, accent = 'purple', className = '' }) {
  return (
    <motion.article className={`card card-${accent} ${className}`} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      {children}
    </motion.article>
  );
}

export function Badge({ children, accent = 'purple' }) {
  return <span className={`badge badge-${accent}`}>{children}</span>;
}

export function MetricBox({ value, label, text, accent = 'purple' }) {
  return (
    <Card accent={accent} className="metric-box">
      <strong>{value}</strong>
      <span>{label}</span>
      {text && <small>{text}</small>}
    </Card>
  );
}

export function StepCard({ step, index }) {
  return (
    <Card accent={step.accent || ['purple', 'cyan', 'cyan', 'green', 'gold'][index % 5]} className="step-card">
      <div className="step-icon">{step.icon || index + 1}</div>
      <span className="step-phase">{step.phase}</span>
      <h2>{step.title}</h2>
      <Checklist items={step.items} />
      {step.tags && <TagRow tags={step.tags} />}
    </Card>
  );
}

export function ProcessNode({ item, index }) {
  return (
    <div className="process-node">
      <span className="process-num">{index + 1}</span>
      <div>
        <h2>{item.title}</h2>
        <p>{item.text}</p>
      </div>
    </div>
  );
}

export function TechItem({ item }) {
  return (
    <Card accent={item.accent || 'purple'} className="tech-item">
      <div className="tech-heading">
        <span>{item.icon}</span>
        <h2>{item.title}</h2>
        {item.replace && <em>{item.replace}</em>}
      </div>
      <TagRow tags={item.tools} />
    </Card>
  );
}

export function ChannelCard({ channel }) {
  return (
    <div className="channel-card">
      <span className="channel-icon">{channel.icon}</span>
      <div>
        <h2>{channel.name}</h2>
        <strong>{channel.handle}</strong>
        <p>{channel.text}</p>
      </div>
    </div>
  );
}

export function PartnerTile({ item }) {
  return (
    <Card accent={item.accent || 'cyan'} className="partner-tile">
      <h2>{item.title}</h2>
      <p>{item.text}</p>
      <TagRow tags={item.tags} />
    </Card>
  );
}

export function MovieCard({ movie }) {
  return (
    <Card accent="pink" className="movie-card">
      <div className="movie-emoji">{movie.emoji}</div>
      <h2>{movie.title}</h2>
      <strong>{movie.label}</strong>
      <p>{movie.text}</p>
      <Badge accent="pink">{movie.tag}</Badge>
    </Card>
  );
}

export function ProgressBar({ item }) {
  return (
    <div className="progress-row">
      <span>{item.label}</span>
      <div className="progress-track" aria-hidden="true">
        <span style={{ width: `${item.width}%` }} />
      </div>
      <strong>{item.value}</strong>
    </div>
  );
}

export function ContactBlock({ item }) {
  return (
    <div className="contact-block">
      <span>{item.icon}</span>
      <div>
        <small>{item.label}</small>
        <strong>{item.value}</strong>
      </div>
    </div>
  );
}

export function Checklist({ items = [] }) {
  return (
    <ul className="checklist">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export function TagRow({ tags = [] }) {
  return (
    <div className="tag-row">
      {tags.map((tag, index) => (
        <Badge key={`${tag}-${index}`} accent={['purple', 'cyan', 'green', 'pink', 'gold'][index % 5]}>
          {tag}
        </Badge>
      ))}
    </div>
  );
}

export function Reveal({ children, className = '' }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
