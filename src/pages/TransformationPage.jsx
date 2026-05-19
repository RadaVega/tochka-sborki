import { MovieCard, PageShell, Reveal } from '../components/UI';
import { pages } from '../data/content';

export function TransformationPage() {
  const page = pages.transformation;
  return (
    <PageShell page={page}>
      <div className="slide-header">
        <span className="slide-number">{page.number}</span>
        <h1>{page.title}</h1>
        <p>{page.subtitle}</p>
      </div>
      <div className="grid four">{page.movies.map((movie) => <Reveal key={movie.title}><MovieCard movie={movie} /></Reveal>)}</div>
      <blockquote className="quote">{page.quote}</blockquote>
    </PageShell>
  );
}
