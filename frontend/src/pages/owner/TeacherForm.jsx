import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axiosConfig';

export default function TeacherForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: isEditMode ? '' : '', // Only required for create
    qualification: '',
    experience: 0,
    bio: '',
    profileImage: null,
    isActive: true
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [userId, setUserId] = useState(null);

  const loadTeacherData = useCallback(async () => {
    try {
      const res = await api.get(`/owner/teachers/${id}/`);
      setUserId(res.data.user?.id || null);
      setFormData({
        firstName: res.data.user.first_name || '',
        lastName: res.data.user.last_name || '',
        email: res.data.user.email || '',
        password: '', // Don't pre-fill password for security
        qualification: res.data.qualification || '',
        experience: res.data.experience || 0,
        bio: res.data.bio || '',
        profileImage: res.data.profile_image,
        isActive: res.data.user.is_active
      });
    } catch (err) {
      console.error(err);
      alert('Error loading teacher data');
      navigate('/owner/teachers');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      navigate('/');
      return;
    }

    if (isEditMode) {
      loadTeacherData();
    } else {
      setLoading(false);
    }
  }, [user, isEditMode, loadTeacherData, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Basic validation
    if (!formData.firstName.trim()) {
      setErrors({ firstName: 'First name is required' });
      return;
    }
    if (!formData.lastName.trim()) {
      setErrors({ lastName: 'Last name is required' });
      return;
    }
    if (!formData.email.trim()) {
      setErrors({ email: 'Email is required' });
      return;
    }
    if (!isEditMode && !formData.password) {
      setErrors({ password: 'Password is required for new teachers' });
      return;
    }
    if (formData.password && formData.password.length < 8) {
      setErrors({ password: 'Password must be at least 8 characters' });
      return;
    }

    try {
      if (isEditMode) {
        // Update existing teacher
        await api.patch(`/owner/teachers/${id}/`, {
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          qualification: formData.qualification,
          experience: formData.experience,
          bio: formData.bio,
          is_active: formData.isActive
        });

        // Handle password change if provided
        if (formData.password && userId) {
          await api.post(`/auth/password-change/`, {
            user_id: userId,
            password: formData.password
          });
        }
      } else {
        // Create new teacher
        await api.post(`/owner/teachers/`, {
          email: formData.email,
          password: formData.password,
          first_name: formData.firstName,
          last_name: formData.lastName,
          qualification: formData.qualification,
          experience: formData.experience,
          bio: formData.bio,
          is_active: formData.isActive
        });
      }

      setSuccessMessage('Teacher saved successfully!');
      setTimeout(() => {
        navigate('/owner/teachers');
      }, 1500);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data) {
        setErrors(err.response.data);
      } else {
        setErrors({ submit: 'An error occurred while saving the teacher' });
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
            {isEditMode ? 'Edit Teacher' : 'Add New Teacher'}
          </h1>
          {isEditMode && (
            <p className="text-gray-600 dark:text-gray-400">
              Editing teacher information. Changes will be saved immediately.
            </p>
          )}
          <div className="flex items-center space-x-3 mt-2">
            <button
              onClick={() => navigate('/owner/teachers')}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-medium"
            >
              Back to Teachers List
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-5">
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2"
                    placeholder="Enter first name"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.firstName}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2"
                    placeholder="Enter last name"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.lastName}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2"
                    placeholder="Enter email address"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.email}</p>
                  )}
                </div>

                {!isEditMode && (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Password
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2"
                      placeholder="Create password (min 8 characters)"
                    />
                    {errors.password && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.password}</p>
                    )}
                  </div>
                )}

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Qualification
                  </label>
                  <input
                    type="text"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2"
                    placeholder="e.g., Ph.D. Physics, M.A. English"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) || 0 })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2"
                  />
                </div>
              </div>

              {/* Bio and Profile Image */}
              <div className="space-y-5">
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Biography
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2"
                    rows="4"
                    placeholder="Tell us about the teacher's background, teaching philosophy, etc."
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Profile Image
                  </label>
                  <div className="flex flex-col items-start space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files[0]) {
                          setFormData({ ...formData, profileImage: e.target.files[0] });
                        }
                      }}
                      className="mb-2"
                    />
                    {formData.profileImage && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Selected: {formData.profileImage.name}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="mr-2 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <span>Active Status</span>
                  </label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                    Toggle to activate or deactivate this teacher's account
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
              {isEditMode ? 'Update Teacher' : 'Create Teacher Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}