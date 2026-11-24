import BackLink from '../components/BackLink';
import CourseCard from '../components/CourseCard';
import { useCatalog } from '../hooks/useCourse';

export default function CoursesPage() {
  const courses = useCatalog();

  const totals = courses.reduce(
    (acc, c) => ({ lessons: acc.lessons + c.topicCount, minutes: acc.minutes + c.minutes }),
    { lessons: 0, minutes: 0 },
  );

  return (
    <section className="shell page-pad">
      <BackLink to="/" label="Home" />
      <header className="catalog__head">
        <span className="mono section__kicker">
          {courses.length} courses · {totals.lessons} lessons
        </span>
        <h1 className="catalog__title">Courses</h1>
        <p className="catalog__lede">
          Each course is self-contained: read the lessons, drill the flashcards, take a quiz, and run a
          mock round. Progress is tracked per course in this browser.
        </p>
      </header>

      <div className="catalog__grid">
        {courses.map((course, i) => (
          <CourseCard key={course.id} course={course} index={i} />
        ))}
      </div>
    </section>
  );
}
