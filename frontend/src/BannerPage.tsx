import React, { useState, useEffect } from 'react';
import axios from 'axios';

import { Plus, Save, X, Video, Upload } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { API_BASE } from './constant/Constant';

const BannerPage = () => {
  const [banners, setBanners] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    video: null,
    videoPreview: null
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const getBaseURL = () => API_BASE.replace(/\/api\/?$/, '').replace(/\/$/, '') || window.location.origin;

  const fetchBanners = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/banner`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data?.success && Array.isArray(response.data?.data)) {
        const baseURL = getBaseURL();
        const formatted = response.data.data.map((banner) => ({
          ...banner,
          videoUrl: !banner.videoPath
            ? ''
            : banner.videoPath.startsWith('http')
            ? banner.videoPath
            : `${baseURL}${banner.videoPath}`,
        }));
        setBanners(formatted);
      } else {
        setBanners([]);
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
      setBanners([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        toast.error('Only video files are allowed');
        return;
      }

    //   if (file.size > 100 * 1024 * 1024) {
    //     toast.error('Video size must be less than 100MB');
    //     return;
    //   }

      setFormData({
        ...formData,
        video: file,
        videoPreview: URL.createObjectURL(file)
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    if (!formData.video) {
      toast.error('Please select a video file');
      return;
    }

    const uploadData = new FormData();
    uploadData.append('title', formData.title);
    uploadData.append('video', formData.video);

    setIsLoading(true);
    setUploadProgress(0);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE}/banner/upload`, uploadData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      if (response.data.success) {
        toast.success('Video uploaded successfully!');
        setShowForm(false);
        setFormData({ title: '', video: null, videoPreview: null });
        setUploadProgress(0);
        fetchBanners();
      } else {
        toast.error(response.data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      if (error.response?.status === 409) {
        toast.error('This video already exists');
      } else {
        toast.error(error.response?.data?.message || 'Upload failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (banner) => {
    if (!banner || !banner._id) {
      toast.error('Cannot delete: Invalid banner data');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete "${banner.title}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_BASE}/banner/${banner._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success('Banner deleted successfully');
        fetchBanners();
      } else {
        toast.error(response.data.message || 'Delete failed');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete banner');
    }
  };

  const cancelForm = () => {
    setShowForm(false);
    setFormData({ title: '', video: null, videoPreview: null });
    setUploadProgress(0);
  };



  return (
    <div className="max-w-7xl mx-auto w-full">

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Banner Videos</h1>
          <p className="text-sm text-gray-600 mt-0.5 sm:mt-1">Manage banner videos for your application</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 active:bg-blue-800 transition text-sm sm:text-base"
        >
          <Plus size={18} />
          Add New Banner
        </button>
      </div>

      {/* Upload Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-60 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          {/* On mobile: sheet from bottom. On sm+: centered modal */}
          <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-xl w-full sm:max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center px-4 py-4 sm:px-6 sm:py-5 border-b sticky top-0 bg-white z-10">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">Upload New Banner</h2>
              <button onClick={cancelForm} className="text-gray-500 hover:text-gray-700 p-1">
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-4 py-4 sm:px-6 sm:py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Enter banner title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Video File *</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-5 sm:p-6 text-center hover:border-blue-500 transition">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="video-upload"
                  />
                  <label htmlFor="video-upload" className="cursor-pointer flex flex-col items-center">
                    <Upload size={36} className="text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">Tap to upload a video</span>
                    <span className="text-xs text-gray-500 mt-1">MP4, MOV, AVI (Max 100MB)</span>
                  </label>
                </div>

                {formData.videoPreview && (
                  <div className="mt-3">
                    <video
                      src={formData.videoPreview}
                      className="w-full rounded-lg max-h-44 object-cover"
                      controls
                    />
                  </div>
                )}
              </div>

              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 rounded-full h-2 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2 pb-1">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm font-medium"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Upload Banner
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={cancelForm}
                  className="px-4 py-2.5 border rounded-lg hover:bg-gray-50 active:bg-gray-100 transition text-sm font-medium text-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Banners List */}
      {isLoading && banners.length === 0 ? (
        <div className="flex justify-center items-center h-48 sm:h-64">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : banners.length === 0 ? (
        <div className="text-center py-12 sm:py-16">
          <Video size={52} className="mx-auto text-gray-300 mb-3" />
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1">No banners yet</h3>
          <p className="text-sm text-gray-500">Upload your first banner video to get started</p>
        </div>
      ) : (
        /* 
          Mobile:  1 column (full width)
          Tablet:  2 columns (sm: 640px+)
          Desktop: 3 columns (lg: 1024px+)
          Wide:    4 columns (xl: 1280px+)
        */
        <div className="bg-white border border-line rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Preview</th>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Added</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {banners.map((banner) => (
                <tr key={banner._id} className="border-t">
                  <td className="px-4 py-3">
                    {banner.videoUrl ? (
                      <video src={banner.videoUrl} className="h-12 w-20 object-cover rounded border border-line bg-black" muted playsInline />
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{banner.title || "—"}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {banner.createdAt ? new Date(banner.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button type="button" onClick={() => handleDelete(banner)} className="text-red-600 font-medium">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BannerPage;