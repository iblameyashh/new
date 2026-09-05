import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosConfig';
import { ArrowLeft, Send } from 'lucide-react';

export default function StudentRequirementCreate() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [classLevels, setClassLevels] = useState([]);
  const [formData, setFormData] = useState({
    subject_id: '',
    class_level_id: '',
    requirement_text: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadReferenceData = useCallback(async () => {
    try {
      const [subjectsRes, classLevelsRes] = await Promise.all([
        api.get('/subjects/'),
        api.get('/class_levels/'),
      ]);
      setSubjects(subjectsRes.data);
      setClassLevels(classLevelsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user || user.role !== 'STUDENT') {
      navigate('/');
      return;
    }
    loadReferenceData();
  }, [user, navigate, loadReferenceData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.subject_id) newErrors.subject_id = 'Subject is required';
    if (!formData.class_level_id) newErrors.class_level_id = 'Class level is required';
    if (!formData.requirement_text.trim()) newErrors.requirement_text = 'Requirement description is required';
    else if (formData.requirement_text.trim().length < 10) newErrors.requirement_text = 'Please provide more details (at least 10 characters)';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      await api.post('/requirements/', {
        subject_id: parseInt(formData.subject_id),
        class_level_id: parseInt(formData.class_level_id),
        requirement_text: formData.requirement_text.trim(),
      });
      alert('Requirement submitted successfully!');
      navigate('/student/requirements');
    } catch (err) {
      console.error(err);
      if (err.response?.data) {
        setErrors(err.response.data);
      } else {
        setErrors({ submit: 'Failed to submit requirement. Please try again.' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-[85vh] flex items-center justify-center text-gray-500">Loading...</div>;
  }

  if (!user || user.role !== 'STUDENT') {
    return <div className="min-h-[85vh] flex items-center justify-center">Please log in as a student</div>;
  }

  return (
    <div className="min-h-[85vh] bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-8">
          <button
            onClick={() => navigate('/student/requirements')}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Requirements</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">New Learning Requirement</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Describe what you need help with. An admin will review and match you with a suitable teacher.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subject <span className="text-red-500">*</span>
            </label>
            <select
              name="subject_id"
              value={formData.subject_id}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Select a subject</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>{subject.name}</option>
              ))}
            </select>
            {errors.subject_id && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.subject_id}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Class Level <span className="text-red-500">*</span>
            </label>
            <select
              name="class_level_id"
              value={formData.class_level_id}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Select class level</option>
              {classLevels.map((level) => (
                <option key={level.id} value={level.id}>{level.name}</option>
              ))}
            </select>
            {errors.class_level_id && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.class_level_id}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Requirement Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="requirement_text"
              value={formData.requirement_text}
              onChange={handleChange}
              rows={6}
              placeholder="Describe your learning goals, specific topics you need help with, exam preparation needs, etc."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            {errors.requirement_text && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.requirement_text}</p>}
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Be specific: e.g., "Need help with Calculus for JEE Advanced preparation" or "Want to improve Physics problem-solving for Class 12 boards"
            </p>
          </div>

          {errors.submit && (
            <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-200">{errors.submit}</p>
            </div>
          )}

          <div className="flex space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => navigate('/student/requirements')}
              className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover font-semibold transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  <span>Submit Requirement</span>
                  <Send className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}