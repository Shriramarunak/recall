import BackLink from '../components/BackLink';
import PathCard from '../components/PathCard';
import { useCatalog, usePaths } from '../hooks/useCourse';
import { useAllStudied } from '../hooks/useProgress';
import { catalogMap } from '../lib/paths';

export default function PathsPage() {
  const catalog = useCatalog();
  const paths = usePaths();
  const { counts } = useAllStudied();
  const byId = catalogMap(catalog);

  return (
    <section className="shell page-pad">
      <BackLink to="/" label="Home" />
      <header className="catalog__head">
        <span className="mono section__kicker">{paths.length} guided paths</span>
        <h1 className="catalog__title">Learning paths</h1>
        <p className="catalog__lede">
          A path is an ordered run through several courses toward one goal. Follow it as a roadmap, and
          track your progress across the whole sequence.
        </p>
      </header>

      <div className="catalog__grid">
        {paths.map((path, i) => (
          <PathCard key={path.id} path={path} catalogById={byId} counts={counts} index={i} />
        ))}
      </div>
    </section>
  );
}
