import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axiosConfig';

export default function CourseForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    duration: '',
    schedule: '',
    image: null,
    teacherId: '',
    subjectId: '',
    classLevelId: '',
    syllabus: '',
    faqs: [],
    features: [],
    status: true
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classLevels, setClassLevels] = useState([]);

  const loadCourseData = useCallback(async () => {
    try {
      const res = await api.get(`/owner/courses/${id}/`);
      setFormData({
        title: res.data.title || '',
        description: res.data.description || '',
        price: res.data.price || 0,
        duration: res.data.duration || '',
        schedule: res.data.schedule || '',
        image: res.data.image,
        teacherId: res.data.teacher?.id || '',
        subjectId: res.data.subject?.id || '',
        classLevelId: res.data.class_level?.id || '',
        syllabus: res.data.syllabus || '',
        faqs: Array.isArray(res.data.faqs) ? res.data.faqs : [],
        features: Array.isArray(res.data.features) ? res.data.features : [],
        status: res.data.is_active !== undefined ? res.data.is_active : true
      });
    } catch (err) {
      console.error(err);
      alert('Error loading course data');
      navigate('/owner/courses');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      navigate('/');
      return;
    }

    const loadInitialData = async () => {
      try {
        // Load teachers, subjects, and class levels for dropdowns
        const [teachersRes, subjectsRes, classLevelsRes] = await Promise.all([
          api.get('/teachers/'),
          api.get('/subjects/'),
          api.get('/class_levels/')
        ]);
        setTeachers(teachersRes.data);
        setSubjects(subjectsRes.data);
        setClassLevels(classLevelsRes.data);
      } catch (err) {
        console.error('Error loading reference data:', err);
      }

      if (isEditMode) {
        loadCourseData();
      } else {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [user, isEditMode, loadCourseData, navigate]);

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setFormData({ ...formData, image: e.target.files[0] });
    }
  };

  const handleAddFAQ = () => {
    setFormData({ ...formData, faqs: [...formData.faqs, { question: '', answer: '' }] });
  };

  const handleRemoveFAQ = (index) => {
    const newFaqs = [...formData.faqs];
    newFaqs.splice(index, 1);
    setFormData({ ...formData, faqs: newFaqs });
  };

  const handleUpdateFAQ = (index, field, value) => {
    const newFaqs = [...formData.faqs];
    if (newFaqs[index]) {
      newFaqs[index][field] = value;
      setFormData({ ...formData, faqs: newFaqs });
    }
  };

  const handleAddFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ''] });
  };

  const handleRemoveFeature = (index) => {
    const newFeatures = [...formData.features];
    newFeatures.splice(index, 1);
    setFormData({ ...formData, features: newFeatures });
  };

  const handleUpdateFeature = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Basic validation
    if (!formData.title.trim()) {
      setErrors({ title: 'Title is required' });
      return;
    }
    if (!formData.description.trim()) {
      setErrors({ description: 'Description is required' });
      return;
    }
    if (!formData.teacherId) {
      setErrors({ teacherId: 'Teacher is required' });
      return;
    }
    if (!formData.subjectId) {
      setErrors({ subjectId: 'Subject is required' });
      return;
    }
    if (!formData.classLevelId) {
      setErrors({ classLevelId: 'Class level is required' });
      return;
    }
    if (formData.price < 0) {
      setErrors({ price: 'Price cannot be negative' });
      return;
    }

    try {
      const formDataObj = new FormData();
      formDataObj.append('title', formData.title);
      formDataObj.append('description', formData.description);
      formDataObj.append('price', formData.price);
      formDataObj.append('duration', formData.duration);
      formDataObj.append('schedule', formData.schedule);
      if (formData.image) {
        formDataObj.append('image', formData.image);
      }
      formDataObj.append('teacher', formData.teacherId);
      formDataObj.append('subject', formData.subjectId);
      formDataObj.append('class_level', formData.classLevelId);
      formDataObj.append('syllabus', formData.syllabus);
      formDataObj.append('faqs', JSON.stringify(formData.faqs));
      formDataObj.append('features', JSON.stringify(formData.features));
      formDataObj.append('is_active', formData.status);

      if (isEditMode) {
        // Update existing course
        await api.patch(`/owner/courses/${id}/`, formDataObj, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        // Create new course
        await api.post(`/owner/courses/`, formDataObj, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      setSuccessMessage('Course saved successfully!');
      setTimeout(() => {
        navigate('/owner/courses');
      }, 1500);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data) {
        setErrors(err.response.data);
      } else {
        setErrors({ submit: 'An error occurred while saving the course' });
      }
    }
  };

  if (loading) {
    return <div className="min-h-[85vh] flex items-center justify-center text-gray-500">Loading...</div>;
  }

  if (!user || user.role !== 'ADMIN') {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-[85vh] bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {isEditMode ? 'Edit Course' : 'Add New Course'}
          </h1>
          {isEditMode && (
            <p className="text-gray-600 dark:text-gray-400">
              Editing course information. Changes will be saved immediately.
            </p>
          )}
          <div className="flex items-center space-x-3 mt-2">
            <button
              onClick={() => navigate('/owner/courses')}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-medium"
            >
              Back to Courses List
            </button>
          </div>
        </div>

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-green-800 dark:text-green-200 font-medium">{successMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
          <div className="px-8 py-6">
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-5">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Basic Information
                </h3>
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Course Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2"
                    placeholder="Enter course title"
                  />
                  {errors.title && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.title}</p>
                  )}
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2"
                    rows="4"
                    placeholder="Describe the course content, learning objectives, etc."
                  />
                  {errors.description && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.description}</p>
                  )}
                </div>
              </div>

              {/* Pricing & Scheduling */}
              <div className="space-y-5">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Pricing & Scheduling
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Price ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2"
                    />
                    {errors.price && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.price}</p>
                    )}
                  </div>
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Duration
                    </label>
                    <input
                      type="text"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2"
                      placeholder="e.g., 3 Months, 6 Weeks"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Schedule
                    </label>
                    <input
                      type="text"
                      value={formData.schedule}
                      onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2"
                      placeholder="e.g., Mon/Wed/Fri 5 PM"
                    />
                  </div>
                </div>
              </div>

              {/* Instructor & Classification */}
              <div className="space-y-5">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Instructor & Classification
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Instructor
                    </label>
                    <select
                      value={formData.teacherId}
                      onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2"
                    >
                      <option value="">Select a teacher</option>
                      {teachers.map(teacher => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.user.full_name || teacher.user.username}
                        </option>
                      ))}
                    </select>
                    {errors.teacherId && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.teacherId}</p>
                    )}
                  </div>
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Subject
                    </label>
                    <select
                      value={formData.subjectId}
                      onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2"
                    >
                      <option value="">Select a subject</option>
                      {subjects.map(subject => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name}
                        </option>
                      ))}
                    </select>
                    {errors.subjectId && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.subjectId}</p>
                    )}
                  </div>
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Class Level
                    </label>
                    <select
                      value={formData.classLevelId}
                      onChange={(e) => setFormData({ ...formData, classLevelId: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2"
                    >
                      <option value="">Select a class level</option>
                      {classLevels.map(cl => (
                        <option key={cl.id} value={cl.id}>
                          {cl.name}
                        </option>
                      ))}
                    </select>
                    {errors.classLevelId && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.classLevelId}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Course Image */}
              <div className="space-y-5">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Course Image
                </h3>
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Upload Course Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark"
                  />
                  {formData.image && (
                    <div className="mt-2 flex items-center space-x-3">
                      <img
                        src={URL.createObjectURL(formData.image)}
                        alt="Course preview"
                        className="w-20 h-20 object-cover rounded border-2 border-primary"
                      />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formData.image.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Syllabus */}
              <div className="space-y-5">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Syllabus
                </h3>
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Course Syllabus
                  </label>
                  <textarea
                    value={formData.syllabus}
                    onChange={(e) => setFormData({ ...formData, syllabus: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2"
                    rows="6"
                    placeholder="Outline the course structure, topics covered week by week, etc."
                  />
                </div>
              </div>

              {/* FAQs */}
              <div className="space-y-5">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Frequently Asked Questions
                </h3>
                <div className="space-y-4">
                  {formData.faqs.map((faq, index) => (
                    <div key={index} className="space-y-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-700">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">FAQ #{index + 1}</h4>
                        <button
                          type="button"
                          onClick={() => handleRemoveFAQ(index)}
                          className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 text-xs"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Question
                        </label>
                        <input
                          type="text"
                          value={faq.question || ''}
                          onChange={(e) => handleUpdateFAQ(index, 'question', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2"
                          placeholder="Enter frequently asked question"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Answer
                        </label>
                        <textarea
                          value={faq.answer || ''}
                          onChange={(e) => handleUpdateFAQ(index, 'answer', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2"
                          rows="3"
                          placeholder="Provide a clear answer to the question"
                        />
                      </div>
                    </div>
                  ))}
                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={handleAddFAQ}
                      className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover font-semibold transition-colors"
                    >
                      Add FAQ
                    </button>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-5">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Course Features
                </h3>
                <div className="space-y-4">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="space-y-2 p-3 border rounded-lg bg-gray-50 dark:bg-gray-700">
                      <div className="flex justify-between items-center">
                        <input
                          type="text"
                          value={feature || ''}
                          onChange={(e) => handleUpdateFeature(index, e.target.value)}
                          className="flex-1 mr-3 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2"
                          placeholder="Enter course feature"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveFeature(index)}
                          className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={handleAddFeature}
                      className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover font-semibold transition-colors"
                    >
                      Add Feature
                    </button>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="space-y-5">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Course Status
                </h3>
                <div className="space-y-4">
                  <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
                      className="mr-2 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    Active Course
                  </label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                    Toggle to activate or deactivate this course for enrollment
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="px-8 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
            <button
              type="submit"
              className="w-full px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-hover font-semibold transition-colors disabled:opacity-50"
              disabled={Object.keys(errors).length > 0}
            >
              {isEditMode ? 'Update Course' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}