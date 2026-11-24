import { Navigate, Route, Routes } from 'react-router-dom';
import TopNav from './components/TopNav';
import Footer from './components/Footer';
import CommandPalette from './components/CommandPalette';
import HomePage from './pages/HomePage';
import PathsPage from './pages/PathsPage';
import PathPage from './pages/PathPage';
import CoursesPage from './pages/CoursesPage';
import CoursePage from './pages/CoursePage';
import TopicPage from './pages/TopicPage';
import FlashcardsPage from './pages/FlashcardsPage';
import InterviewPage from './pages/InterviewPage';
import QuizPage from './pages/QuizPage';
import DashboardPage from './pages/DashboardPage';
import NewsPage from './pages/NewsPage';
import VideosPage from './pages/VideosPage';
import { DEFAULT_COURSE_ID } from './api/client';

export default function App() {
  return (
    <div className="app">
      <TopNav />
      <main className="app__main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/paths" element={<PathsPage />} />
          <Route path="/path/:pathId" element={<PathPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/videos" element={<VideosPage />} />
          <Route path="/course/:courseId" element={<CoursePage />} />
          <Route path="/course/:courseId/topic/:topicId" element={<TopicPage />} />
          <Route path="/course/:courseId/flashcards" element={<FlashcardsPage />} />
          <Route path="/course/:courseId/quiz" element={<QuizPage />} />
          <Route path="/course/:courseId/interview" element={<InterviewPage />} />
          <Route path="/course/:courseId/dashboard" element={<DashboardPage />} />
          <Route path="/course" element={<Navigate to={'/course/' + DEFAULT_COURSE_ID} replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      <CommandPalette />
    </div>
  );
}
