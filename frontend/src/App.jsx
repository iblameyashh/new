import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';

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

function PageLoader() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
    </div>
  );
}

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
              <Route path="courses" element={<Courses />} />
              <Route path="courses/:id" element={<CourseDetails />} />
              <Route path="teachers" element={<Teachers />} />
              <Route path="teacher/:id" element={<TeacherProfilePage />} />
              <Route path="about" element={<About />} />

              {/* Protected Routes */}
              <Route path="student/dashboard" element={<StudentDashboard />} />
              <Route path="student/dashboard/courses" element={<StudentCourses />} />
              <Route path="student/dashboard/teachers" element={<StudentTeachers />} />
              <Route path="student/requirements" element={<StudentRequirements />} />
              <Route path="student/requirements/new" element={<StudentRequirementCreate />} />
              <Route path="student/course/:id/learn" element={<CourseLearningPage />} />
              <Route path="teacher/dashboard" element={<TeacherDashboard />} />
              <Route path="teacher/student/:studentId" element={<TeacherStudentProfile />} />
              <Route path="owner" element={<OwnerDashboard />} />
              <Route path="owner/teachers" element={<OwnerTeachers />} />
              <Route path="owner/teachers/add" element={<TeacherForm />} />
              <Route path="owner/teachers/:id/edit" element={<TeacherForm />} />
              <Route path="owner/courses" element={<OwnerCourses />} />
              <Route path="owner/courses/add" element={<CourseForm />} />
              <Route path="owner/courses/:id/edit" element={<CourseForm />} />
              <Route path="owner/students" element={<OwnerStudents />} />
              <Route path="owner/enrollments" element={<OwnerEnrollments />} />
              <Route path="owner/enrollments/add" element={<OwnerEnrollments />} />
              <Route path="owner/enrollments/:id/edit" element={<OwnerEnrollments />} />
              <Route path="owner/reviews" element={<OwnerReviews />} />
              <Route path="owner/requirements" element={<OwnerRequirements />} />
              <Route path="owner/requirements/:id" element={<OwnerRequirementDetail />} />
              <Route path="owner/analytics" element={<OwnerAnalytics />} />
              <Route path="owner/settings" element={<OwnerSettings />} />
              <Route path="messages" element={<Messages />} />

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
