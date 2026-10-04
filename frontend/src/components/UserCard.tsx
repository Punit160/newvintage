import React, { useState, useEffect, useCallback } from "react";
import { FiPlus, FiSave, FiX } from "react-icons/fi";
import { API_BASE } from "../constant/Constant";
import { HEALTH_ICONS, categoryIconName } from "./healthIcons";

const CONFIG = {
  API_BASE: `${API_BASE}/categories`,
};

interface Subcategory {
  title: string;
  image: string | null;
  shortDescription: string;
  detailedContent: string[];
}

interface Category {
  _id?: string;
  title: string;
  icon: string;
  color: string;
  description: string;
  detailedContent: string;
  subcategories: Subcategory[];
}

const getAuthToken = () => localStorage.getItem("token");

class CategoryAPI {
  private static getHeaders() {
    const token = getAuthToken();
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  static async fetchAll(): Promise<Category[]> {
    const res = await fetch(CONFIG.API_BASE, { headers: this.getHeaders() });
    if (!res.ok) throw new Error("Failed to fetch categories");
    const data = await res.json();
    return data.data || [];
  }

  static async create(data: Category): Promise<Category> {
    const res = await fetch(CONFIG.API_BASE, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Failed to create category");
    return json.data;
  }

  static async update(id: string, data: Category): Promise<Category> {
    const res = await fetch(`${CONFIG.API_BASE}/${id}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Failed to update category");
    return json.data;
  }

  static async delete(id: string): Promise<void> {
    const res = await fetch(`${CONFIG.API_BASE}/${id}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.message || "Failed to delete category");
    }
  }
}

const createEmptySubcategory = (): Subcategory => ({
  title: "",
  image: null,
  shortDescription: "",
  detailedContent: [""],
});

const createEmptyCategory = (): Category => ({
  title: "",
  icon: HEALTH_ICONS[0].name,
  color: "#34d399",
  description: "",
  detailedContent: "",
  subcategories: [createEmptySubcategory()],
});

const Modal = ({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose} />
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
            <FiX size={24} />
          </button>
          {children}
        </div>
      </div>
    </div>
  );
};

export const IconPicker = ({
  selected,
  onChange,
  icons: iconList = HEALTH_ICONS,
}: {
  selected: string;
  onChange: (icon: string) => void;
  icons?: { name: string; label: string }[];
}) => {
  const [query, setQuery] = useState("");
  const current = categoryIconName(selected);
  const icons = iconList.filter((icon) =>
    `${icon.label} ${icon.name}`.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-2">
        <p className="text-xs text-slate-500">{iconList.length} health icons</p>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search icons"
          className="w-40 px-2 py-1 text-sm border border-gray-300 rounded-md"
        />
      </div>
      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 max-h-64 overflow-y-auto pr-1">
        {icons.map((icon) => (
          <button
            type="button"
            key={icon.name}
            title={icon.label}
            className={`h-11 rounded-lg flex items-center justify-center ${
              current === icon.name ? "border-2 border-blue-500 bg-blue-50" : "border border-gray-300 hover:border-blue-300"
            }`}
            onClick={() => onChange(icon.name)}
          >
            <span className={`mdi mdi-${icon.name} text-xl`} />
          </button>
        ))}
      </div>
      {icons.length === 0 && <p className="text-sm text-slate-500 mt-2">No icons match that search.</p>}
    </div>
  );
};

const SubcategoryForm = ({ subcategory, index, onChange, onRemove, canRemove }: {
  subcategory: Subcategory;
  index: number;
  onChange: (index: number, field: keyof Subcategory, value: any) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
}) => {
  const [imageError, setImageError] = useState("");
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const type = (file.type || "").toLowerCase();
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"].includes(type) || /\.(jpe?g|png|webp|gif)$/i.test(file.name);
    if (!allowed) {
      const reason = type.includes("heic") || /\.hei[cf]$/i.test(file.name)
        ? `${file.name} is an iPhone HEIC photo. Save it as a JPEG, then upload that file.`
        : `${file.name}${type ? ` (${type})` : ""} cannot be uploaded. Use a JPEG, PNG, WebP, or GIF.`;
      setImageError(reason);
      return;
    }
    if (file.size > 1 * 1024 * 1024) {
      setImageError(`${file.name} is ${(file.size / (1024 * 1024)).toFixed(1)} MB. Category images must be under 1 MB.`);
      return;
    }
    setImageError("");
    const reader = new FileReader();
    reader.onloadend = () => onChange(index, "image", reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="border border-gray-200 p-4 rounded-lg bg-gray-50 space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-sm font-semibold text-gray-700">Subcategory {index + 1}</span>
        {canRemove && (
          <button type="button" onClick={() => onRemove(index)} className="text-red-500 hover:text-red-700 p-1 rounded">
            <FiX size={18} />
          </button>
        )}
      </div>
      <input
        className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
        type="text"
        placeholder="Subcategory Title *"
        value={subcategory.title}
        onChange={(e) => onChange(index, "title", e.target.value)}
      />
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Image</label>
        <input className="w-full text-sm" type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleFileChange} />
        {imageError ? <p className="mt-1 text-sm text-red-600">{imageError}</p> : null}
      </div>
      {subcategory.image && (
        <div className="relative inline-block">
          <img src={subcategory.image} alt="Preview" className="w-24 h-24 object-cover rounded-lg" />
          <button type="button" onClick={() => onChange(index, "image", null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600">
            <FiX size={14} />
          </button>
        </div>
      )}
      <textarea
        className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm min-h-[70px]"
        placeholder="Short Description"
        value={subcategory.shortDescription}
        onChange={(e) => onChange(index, "shortDescription", e.target.value)}
      />
      <textarea
        className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm min-h-[70px]"
        placeholder="Detailed Content (comma separated)"
        value={subcategory.detailedContent.join(", ")}
        onChange={(e) => onChange(index, "detailedContent", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
      />
    </div>
  );
};

const CategoryCard = ({ category, expanded, onToggle, onEdit, onDelete }: {
  category: Category;
  expanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const iconName = categoryIconName(category.icon);

  return (
    <>
      <tr className="border-t">
        <td className="px-4 py-3 font-medium text-gray-900">
          <span className="inline-flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-line" style={{ color: category.color }}>
              <span className={`mdi mdi-${iconName} text-lg`} />
            </span>
            {category.title}
          </span>
        </td>
        <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{category.description || "—"}</td>
        <td className="px-4 py-3 text-gray-600">{category.subcategories.length}</td>
        <td className="px-4 py-3 text-right whitespace-nowrap">
          <button type="button" onClick={onToggle} className="text-slate-600 font-medium mr-3">
            {expanded ? "Hide" : "Details"}
          </button>
          <button type="button" onClick={onEdit} className="text-pine font-medium mr-3">Edit</button>
          <button type="button" onClick={onDelete} className="text-red-600 font-medium">Delete</button>
        </td>
      </tr>
      {expanded && (
        <tr className="border-t bg-gray-50">
          <td colSpan={4} className="px-4 py-3">
            <div className="space-y-3">
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Detailed Content</h4>
              <p className="text-sm text-gray-700 leading-relaxed">{category.detailedContent}</p>
            </div>
            {category.subcategories.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Subcategories ({category.subcategories.length})</h4>
                <div className="space-y-2">
                  {category.subcategories.map((sub, idx) => (
                    <div key={idx} className="bg-gray-50 p-3 rounded-lg flex gap-3">
                      {sub.image && <img src={sub.image} alt={sub.title} className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900 mb-1">{sub.title}</p>
                        {sub.shortDescription && <p className="text-xs text-gray-600 mb-1">{sub.shortDescription}</p>}
                        {sub.detailedContent.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {sub.detailedContent.slice(0, 3).map((item, i) => (
                              <span key={i} className="text-xs bg-white px-2 py-1 rounded text-gray-600">{item}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default function CategoryManager() {

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<Category>(createEmptyCategory());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await CategoryAPI.fetchAll();
      setCategories(data);
    } catch (err) {
      showMessage("error", err instanceof Error ? err.message : "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const showMessage = useCallback((type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  }, []);

  const resetForm = useCallback(() => {
    setFormData(createEmptyCategory());
    setEditingId(null);
    setIsModalOpen(false);
  }, []);

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      showMessage("error", "Title is required");
      return;
    }
    setSubmitting(true);
    try {
      if (editingId) {
        const updated = await CategoryAPI.update(editingId, formData);
        setCategories((prev) => prev.map((c) => (c._id === editingId ? updated : c)));
        showMessage("success", "Category updated successfully");
      } else {
        const created = await CategoryAPI.create(formData);
        setCategories((prev) => [...prev, created]);
        showMessage("success", "Category created successfully");
      }
      resetForm();
    } catch (err) {
      showMessage("error", err instanceof Error ? err.message : "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = useCallback((category: Category) => {
    setFormData({ ...category });
    setEditingId(category._id || null);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      await CategoryAPI.delete(id);
      setCategories((prev) => prev.filter((c) => c._id !== id));
      showMessage("success", "Category deleted successfully");
    } catch (err) {
      showMessage("error", err instanceof Error ? err.message : "Failed to delete");
    }
  }, []);

  const handleSubcategoryChange = useCallback((index: number, field: keyof Subcategory, value: any) => {
    setFormData((prev) => {
      const newSubs = [...prev.subcategories];
      newSubs[index] = { ...newSubs[index], [field]: value };
      return { ...prev, subcategories: newSubs };
    });
  }, []);

  const addSubcategory = useCallback(() => {
    setFormData((prev) => ({ ...prev, subcategories: [...prev.subcategories, createEmptySubcategory()] }));
  }, []);

  const removeSubcategory = useCallback((index: number) => {
    setFormData((prev) => ({ ...prev, subcategories: prev.subcategories.filter((_, i) => i !== index) }));
  }, []);

  return (
    <div className="w-full">
    {/* <div className="w-full mt-20 md:mt-0"> */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Category Manager</h1>
            <p className="text-sm sm:text-base text-gray-600">Manage your categories and subcategories</p>
          </div>
          <button onClick={() => { setFormData(createEmptyCategory()); setEditingId(null); setIsModalOpen(true); }} className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all">
            <FiPlus size={20} /> Add Category
          </button>
        </div>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${message.type === "success" ? "bg-green-50 border border-green-200 text-green-800" : "bg-red-50 border border-red-200 text-red-800"}`}>
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading categories...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <p className="text-gray-600 mb-4">No categories yet. Create your first one!</p>
          <button onClick={() => { setFormData(createEmptyCategory()); setEditingId(null); setIsModalOpen(true); }} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold">
            <FiPlus size={20} /> Create Category
          </button>
        </div>
      ) : (
          <div className="bg-white border border-line rounded-lg overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Description</th>
                  <th className="px-4 py-3 font-medium">Subcategories</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <CategoryCard key={cat._id} category={cat} expanded={expandedId === cat._id} onToggle={() => setExpandedId((prev) => (prev === cat._id ? null : cat._id))} onEdit={() => handleEdit(cat)} onDelete={() => handleDelete(cat._id!)} />
                ))}
              </tbody>
            </table>
          </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => !submitting && resetForm()}>
        <div className="p-6 sm:p-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-900 pr-8">{editingId ? "Edit Category" : "Create New Category"}</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Title <span className="text-red-500">*</span></label>
              <input className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500" type="text" placeholder="e.g., Mental Wellness" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Select Icon</label>
              <IconPicker selected={formData.icon} onChange={(icon) => setFormData({ ...formData, icon })} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Color</label>
              <div className="flex items-center gap-3">
                <input className="h-12 w-20 border border-gray-300 rounded-lg cursor-pointer" type="color" value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} />
                <span className="text-sm font-mono text-gray-600 bg-gray-100 px-3 py-2 rounded">{formData.color}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <input className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500" type="text" placeholder="Brief description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Detailed Content</label>
              <textarea className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[100px]" placeholder="Detailed information" value={formData.detailedContent} onChange={(e) => setFormData({ ...formData, detailedContent: e.target.value })} />
            </div>
            <div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                <label className="text-sm font-semibold text-gray-700">Subcategories</label>
                <button type="button" onClick={addSubcategory} className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                  <FiPlus size={16} /> Add Subcategory
                </button>
              </div>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {formData.subcategories.map((sub, idx) => (
                  <SubcategoryForm key={idx} subcategory={sub} index={idx} onChange={handleSubcategoryChange} onRemove={removeSubcategory} canRemove={formData.subcategories.length > 1} />
                ))}
              </div>
            </div>
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t">
              {editingId && (
                <button type="button" onClick={resetForm} disabled={submitting} className="flex items-center justify-center gap-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold">
                  <FiX /> Cancel
                </button>
              )}
              <button type="button" onClick={handleSubmit} disabled={submitting} className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold flex-1 sm:flex-initial">
                <FiSave /> {submitting ? "Saving..." : editingId ? "Update Category" : "Create Category"}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}