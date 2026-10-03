import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../constant/Constant";

const emptyForm = {
  color: "#10B981",
  title: "",
  subtitle: "",
  detail: "",
  image: "",
};

const photoHost = API_BASE.replace(/\/api\/?$/, "");

const photoSrc = (value) => {
  if (!value) return "";
  if (value.startsWith("http") || value.startsWith("blob:") || value.startsWith("data:")) return value;
  return `${photoHost}${value.startsWith("/") ? value : `/${value}`}`;
};

export default function WellnessManager() {
  const [wellnessList, setWellnessList] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [formError, setFormError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true); // Default true until data loads
  const [isModalOpen, setIsModalOpen] = useState(false);

  const BASE_URL = `${API_BASE}/wellness`;
  const authHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(BASE_URL);
      setWellnessList(res.data.data || []);
    } catch (err) {
      console.error("Error fetching wellness:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetImage = (nextPreview = "") => {
    setImagePreview((current) => {
      if (current.startsWith("blob:")) URL.revokeObjectURL(current);
      return nextPreview;
    });
    setImageFile(null);
  };

  const chooseImage = (file) => {
    if (!file) return;
    if (!/^image\/(jpeg|png|webp|gif)$/.test(file.type)) {
      setFormError("Image must be a JPEG, PNG, WebP, or GIF");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFormError("Image must be under 5 MB");
      return;
    }
    setFormError("");
    setImageFile(file);
    setImagePreview((current) => {
      if (current.startsWith("blob:")) URL.revokeObjectURL(current);
      return URL.createObjectURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile && !form.image) {
      setFormError("Choose an image");
      return;
    }
    setLoading(true);
    setFormError("");
    try {
      const body = new FormData();
      body.append("title", form.title);
      body.append("subtitle", form.subtitle);
      body.append("detail", form.detail);
      body.append("color", form.color);
      if (imageFile) body.append("image", imageFile);
      if (editingId) {
        await axios.put(`${BASE_URL}/${editingId}`, body, { headers: authHeaders() });
      } else {
        await axios.post(BASE_URL, body, { headers: authHeaders() });
      }
      setForm(emptyForm);
      resetImage();
      setEditingId(null);
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error("Error saving wellness:", err.message);
      setFormError(err?.response?.data?.message || "Could not save this thought");
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setForm({
      color: item.color || "#10B981",
      title: item.title || "",
      subtitle: item.subtitle || "",
      detail: item.detail || "",
      image: item.image || "",
    });
    resetImage(photoSrc(item.image));
    setFormError("");
    setEditingId(item._id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await axios.delete(`${BASE_URL}/${id}`, { headers: authHeaders() });
      fetchData();
    } catch (err) {
      console.error("Error deleting:", err.message);
    }
  };

  const presetColors = [
    "#10B981", "#3B82F6", "#F59E0B",
    "#EF4444", "#8B5CF6", "#EC4899", "#14B8A6",
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-center sm:text-left">
           Daily Thought
        </h2>

        <button
          onClick={() => {
            setEditingId(null);
            setForm(emptyForm);
            resetImage();
            setFormError("");
            setIsModalOpen(true);
          }}
          
          className="w-full sm:w-auto bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-green-700 active:scale-95 transition"
        >
          + Add thought
        </button>
      </div>

      {/* Loading Spinner */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading items...</p>
        </div>
      ) : wellnessList.length === 0 ? (
        <p className="text-gray-500 text-center py-10">No items found.</p>
      ) : (
        <div className="bg-white border border-line rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Image</th>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Subtitle</th>
                <th className="px-4 py-3 font-medium">Detail</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {wellnessList.map((item) => (
                <tr key={item._id} className="border-t">
                  <td className="px-4 py-3">
                    {item.image ? (
                      <img src={photoSrc(item.image)} alt="" className="h-10 w-14 object-cover rounded border border-line" />
                    ) : (
                      <span className="text-gray-400">{item.icon || "—"}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{item.title}</td>
                  <td className="px-4 py-3 text-gray-600">{item.subtitle}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{item.detail}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button type="button" onClick={() => handleEdit(item)} className="text-pine font-medium mr-3">Edit</button>
                    <button type="button" onClick={() => handleDelete(item._id)} className="text-red-600 font-medium">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative animate-fadeIn">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
            >
              ✖
            </button>

            <h3 className="text-xl font-semibold mb-4">
              {editingId ? "Edit Wellness" : "Add Wellness"}
            </h3>

            <form onSubmit={handleSubmit} className="grid gap-3">
              <div>
                <p className="text-sm font-medium mb-2">Image</p>
                {imagePreview ? (
                  <img src={imagePreview} alt="" className="mb-2 h-32 w-full object-cover rounded border" />
                ) : (
                  <div className="mb-2 h-32 w-full rounded border border-dashed border-gray-300 bg-gray-50" />
                )}
                <label className="inline-block px-3 py-2 border rounded cursor-pointer text-sm">
                  {imageFile ? "Change image" : "Upload image"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="sr-only"
                    onChange={(e) => {
                      chooseImage(e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />
                </label>
                <p className="mt-1 text-xs text-gray-500">JPEG, PNG, WebP, or GIF. Up to 5 MB.</p>
              </div>
              <input
                type="text"
                placeholder="Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="border rounded p-2"
                required
              />
              <input
                type="text"
                placeholder="Subtitle"
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                className="border rounded p-2"
                required
              />
              <textarea
                placeholder="Detail"
                value={form.detail}
                onChange={(e) => setForm({ ...form, detail: e.target.value })}
                className="border rounded p-2"
                required
              ></textarea>

              {/* Friendly Color Picker */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Choose a color
                </label>

                {/* Preset Colors */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {presetColors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 ${
                        form.color === c
                          ? "border-black scale-110"
                          : "border-gray-300"
                      } transition-transform`}
                      style={{ backgroundColor: c }}
                      onClick={() => setForm({ ...form, color: c })}
                    />
                  ))}
                </div>

                {/* Custom Color Picker */}
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.color}
                    onChange={(e) =>
                      setForm({ ...form, color: e.target.value })
                    }
                    className="w-12 h-12 rounded cursor-pointer border border-gray-300"
                  />
                  <span className="text-sm text-gray-700">
                    Selected:{" "}
                    <span
                      className="font-semibold"
                      style={{ color: form.color }}
                    >
                      {form.color.toUpperCase()}
                    </span>
                  </span>
                </div>
              </div>

              {formError ? <p className="text-sm text-red-600">{formError}</p> : null}
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 mt-3"
              >
                {editingId ? "Update" : "Add"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
