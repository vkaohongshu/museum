import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { LifeProvider } from "./context/LifeContext";
import { AdminLayout } from "./layouts/AdminLayout";
import { PublicLayout } from "./layouts/PublicLayout";
import { CapsulesPage } from "./pages/CapsulesPage";
import { LifeMapPage } from "./pages/LifeMapPage";
import { LoginPage } from "./pages/LoginPage";
import { MonthlyDigestPage } from "./pages/MonthlyDigestPage";
import { NotesPage } from "./pages/NotesPage";
import { TaxonomyPage } from "./pages/TaxonomyPage";
import { YearReviewPage } from "./pages/YearReviewPage";
import { AdminBackupsPage } from "./pages/admin/AdminBackupsPage";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { AdminSettingsPage } from "./pages/admin/AdminSettingsPage";
import { StudioArticleEditorPage } from "./pages/admin/StudioArticleEditorPage";
import { StudioArticlesPage } from "./pages/admin/StudioArticlesPage";
import { StudioGalleryAlbumPage } from "./pages/admin/StudioGalleryAlbumPage";
import { StudioGalleryPage } from "./pages/admin/StudioGalleryPage";
import { StudioInspirationsPage } from "./pages/admin/StudioInspirationsPage";
import { StudioMomentsPage } from "./pages/admin/StudioMomentsPage";
import { StudioMoodCalendarPage } from "./pages/admin/StudioMoodCalendarPage";
import { PublicAboutPage } from "./pages/public/PublicAboutPage";
import { PublicArticleDetailPage } from "./pages/public/PublicArticleDetailPage";
import { PublicArticlesPage } from "./pages/public/PublicArticlesPage";
import { PublicGalleryDetailPage } from "./pages/public/PublicGalleryDetailPage";
import { PublicGalleryPage } from "./pages/public/PublicGalleryPage";
import { PublicHomePage } from "./pages/public/PublicHomePage";
import { PublicMomentsPage } from "./pages/public/PublicMomentsPage";
import { PublicTimelinePage } from "./pages/public/PublicTimelinePage";

export default function App() {
  return (
    <AuthProvider>
      <LifeProvider>
        <Routes>
          <Route path="login" element={<LoginPage />} />
          <Route element={<PublicLayout />}>
            <Route index element={<PublicHomePage />} />
            <Route path="articles" element={<PublicArticlesPage />} />
            <Route path="articles/:id" element={<PublicArticleDetailPage />} />
            <Route path="moments" element={<PublicMomentsPage />} />
            <Route path="thoughts" element={<Navigate to="/moments" replace />} />
            <Route path="gallery" element={<PublicGalleryPage />} />
            <Route path="gallery/:id" element={<PublicGalleryDetailPage />} />
            <Route path="timeline" element={<PublicTimelinePage />} />
            <Route path="monthly-digest" element={<MonthlyDigestPage />} />
            <Route path="year-review" element={<YearReviewPage />} />
            <Route path="about" element={<PublicAboutPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="articles" element={<StudioArticlesPage />} />
              <Route path="articles/new" element={<StudioArticleEditorPage />} />
              <Route path="articles/:id" element={<StudioArticleEditorPage />} />
              <Route path="articles/:id/edit" element={<StudioArticleEditorPage />} />
              <Route path="moments" element={<StudioMomentsPage />} />
              <Route path="gallery" element={<StudioGalleryPage />} />
              <Route path="gallery/:id" element={<StudioGalleryAlbumPage />} />
              <Route path="inspirations" element={<StudioInspirationsPage />} />
              <Route path="mood-calendar" element={<StudioMoodCalendarPage />} />
              <Route path="taxonomy" element={<TaxonomyPage />} />
              <Route path="categories" element={<Navigate to="/admin/taxonomy" replace />} />
              <Route path="tags" element={<Navigate to="/admin/taxonomy" replace />} />
              <Route path="notes" element={<NotesPage />} />
              <Route path="capsules" element={<CapsulesPage />} />
              <Route path="locations" element={<LifeMapPage />} />
              <Route path="backups" element={<AdminBackupsPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </LifeProvider>
    </AuthProvider>
  );
}
