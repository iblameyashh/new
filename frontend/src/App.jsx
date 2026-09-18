import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import RequireRole, { PageLoader } from './components/RequireRole';

// Public pages
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Courses = lazy(() => import('./pages/Courses'));
const CourseDetails = lazy(() => import('./pages/CourseDetails'));
const Teachers = lazy(() => import('./pages/Teachers'));
const TeacherProfilePage = lazy(() => import('./pages/TeacherProfilePage'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Hidden owner bootstrap (not linked in any menu)
const AdminSetup = lazy(() => import('./pages/AdminSetup'));

// Student pages
const StudentDashboard = lazy(() => import('./pages/student/StudentDashboard'));
const StudentCourses = lazy(() => import('./pages/student/StudentCourses'));
const StudentTeachers = lazy(() => import('./pages/student/StudentTeachers'));
const StudentRequirements = lazy(() => import('./pages/student/StudentRequirements'));
const StudentRequirementCreate = lazy(() => import('./pages/student/StudentRequirementCreate'));
const CourseLearningPage = lazy(() => import('./pages/student/CourseLearningPage'));

// Teacher pages
const TeacherDashboard = lazy(() => import('./pages/teacher/TeacherDashboard'));
const TeacherStudentProfile = lazy(() => import('./pages/teacher/StudentProfile'));

// Messaging
const Messages = lazy(() => import('./pages/messaging/Messages'));

// Owner pages
const OwnerDashboard = lazy(() => import('./pages/owner/OwnerDashboard'));
const OwnerTeachers = lazy(() => import('./pages/owner/TeacherManagement'));
const TeacherForm = lazy(() => import('./pages/owner/TeacherForm'));
const OwnerCourses = lazy(() => import('./pages/owner/CourseManagement'));
const CourseForm = lazy(() => import('./pages/owner/CourseForm'));
const OwnerStudents = lazy(() => import('./pages/owner/StudentManagement'));
const OwnerEnrollments = lazy(() => import('./pages/owner/EnrollmentManagement'));
const OwnerReviews = lazy(() => import('./pages/owner/ReviewManagement'));
const OwnerRequirements = lazy(() => import('./pages/owner/OwnerRequirementManagement'));
const OwnerRequirementDetail = lazy(() => import('./pages/owner/OwnerRequirementDetail'));
const OwnerAnalytics = lazy(() => import('./pages/owner/Analytics'));
const OwnerSettings = lazy(() => import('./pages/owner/Settings'));

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="admin-setup" element={<AdminSetup />} />
              <Route path="courses" element={<Courses />} />
              <Route path="courses/:id" element={<CourseDetails />} />
              <Route path="teachers" element={<Teachers />} />
              <Route path="teacher/:id" element={<TeacherProfilePage />} />
              <Route path="about" element={<About />} />

              {/* Student routes (login required) */}
              <Route path="student/dashboard" element={<RequireRole role="STUDENT"><StudentDashboard /></RequireRole>} />
              <Route path="student/dashboard/courses" element={<RequireRole role="STUDENT"><StudentCourses /></RequireRole>} />
              <Route path="student/dashboard/teachers" element={<RequireRole role="STUDENT"><StudentTeachers /></RequireRole>} />
              <Route path="student/requirements" element={<RequireRole role="STUDENT"><StudentRequirements /></RequireRole>} />
              <Route path="student/requirements/new" element={<RequireRole role="STUDENT"><StudentRequirementCreate /></RequireRole>} />
              <Route path="student/course/:id/learn" element={<RequireRole role="STUDENT"><CourseLearningPage /></RequireRole>} />

              {/* Teacher routes (login required) */}
              <Route path="teacher/dashboard" element={<RequireRole role="TEACHER"><TeacherDashboard /></RequireRole>} />
              <Route path="teacher/student/:studentId" element={<RequireRole role="TEACHER"><TeacherStudentProfile /></RequireRole>} />

              {/* Owner / admin routes (dynamic admin check) */}
              <Route path="owner" element={<RequireRole role="ADMIN"><OwnerDashboard /></RequireRole>} />
              <Route path="owner/teachers" element={<RequireRole role="ADMIN"><OwnerTeachers /></RequireRole>} />
              <Route path="owner/teachers/add" element={<RequireRole role="ADMIN"><TeacherForm /></RequireRole>} />
              <Route path="owner/teachers/:id/edit" element={<RequireRole role="ADMIN"><TeacherForm /></RequireRole>} />
              <Route path="owner/courses" element={<RequireRole role="ADMIN"><OwnerCourses /></RequireRole>} />
              <Route path="owner/courses/add" element={<RequireRole role="ADMIN"><CourseForm /></RequireRole>} />
              <Route path="owner/courses/:id/edit" element={<RequireRole role="ADMIN"><CourseForm /></RequireRole>} />
              <Route path="owner/students" element={<RequireRole role="ADMIN"><OwnerStudents /></RequireRole>} />
              <Route path="owner/enrollments" element={<RequireRole role="ADMIN"><OwnerEnrollments /></RequireRole>} />
              <Route path="owner/enrollments/add" element={<RequireRole role="ADMIN"><OwnerEnrollments /></RequireRole>} />
              <Route path="owner/enrollments/:id/edit" element={<RequireRole role="ADMIN"><OwnerEnrollments /></RequireRole>} />
              <Route path="owner/reviews" element={<RequireRole role="ADMIN"><OwnerReviews /></RequireRole>} />
              <Route path="owner/requirements" element={<RequireRole role="ADMIN"><OwnerRequirements /></RequireRole>} />
              <Route path="owner/requirements/:id" element={<RequireRole role="ADMIN"><OwnerRequirementDetail /></RequireRole>} />
              <Route path="owner/analytics" element={<RequireRole role="ADMIN"><OwnerAnalytics /></RequireRole>} />
              <Route path="owner/settings" element={<RequireRole role="ADMIN"><OwnerSettings /></RequireRole>} />

              {/* Messaging: any logged-in user */}
              <Route path="messages" element={<RequireRole><Messages /></RequireRole>} />

              {/* Catch-all 404 */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
