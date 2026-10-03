import { useEffect, useState, type FormEvent } from "react";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";
import { API_BASE } from "../constant/Constant";

type PortalUser = {
  _id: string;
  name?: string;
  email?: string;
  isActive?: boolean;
  createdAt?: string;
  phone?: string;
  avatar?: string;
  subscription?: { name?: string } | string | null;
};

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
  avatar: "",
  isActive: true,
};

const photoHost = API_BASE.replace(/\/api\/?$/, "");

const photoSrc = (value?: string) => {
  if (!value) return "";
  if (value.startsWith("http") || value.startsWith("blob:") || value.startsWith("data:")) return value;
  return `${photoHost}${value.startsWith("/") ? value : `/${value}`}`;
};

const planName = (subscription: PortalUser["subscription"]) => {
  if (!subscription) return "No plan";
  if (typeof subscription === "string") return subscription;
  return subscription.name || "No plan";
};

export default function UsersManager() {
  const [users, setUsers] = useState<PortalUser[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");

  const loadUsers = async (query: string) => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/admin/users`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        params: { search: query, limit: 50 },
      });
      setUsers(res.data?.data?.users || []);
    } catch (err: any) {
      setUsers([]);
      setError(err?.response?.data?.message || "Unable to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers(search);
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  const resetPhoto = (nextPreview = "") => {
    setPhotoPreview((current) => {
      if (current.startsWith("blob:")) URL.revokeObjectURL(current);
      return nextPreview;
    });
    setPhotoFile(null);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setShowPassword(false);
    setFormError("");
    resetPhoto();
  };

  const openCreate = () => {
    if (showForm && !editingId) {
      closeForm();
      return;
    }
    setEditingId(null);
    setForm(emptyForm);
    setShowPassword(false);
    setFormError("");
    resetPhoto();
    setShowForm(true);
  };

  const openEdit = (user: PortalUser) => {
    setEditingId(user._id);
    setForm({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      password: "",
      avatar: user.avatar || "",
      isActive: user.isActive !== false,
    });
    setShowPassword(false);
    setFormError("");
    resetPhoto(photoSrc(user.avatar));
    setShowForm(true);
  };

  const choosePhoto = (file: File | undefined) => {
    if (!file) return;
    if (!/^image\/(jpeg|png|webp|gif)$/.test(file.type)) {
      setFormError("Profile photo must be a JPEG, PNG, WebP, or GIF");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFormError("Profile photo must be under 5 MB");
      return;
    }
    setFormError("");
    setPhotoFile(file);
    setPhotoPreview((current) => {
      if (current.startsWith("blob:")) URL.revokeObjectURL(current);
      return URL.createObjectURL(file);
    });
  };

  const saveUser = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
      let avatar = form.avatar.trim();
      if (photoFile) {
        const body = new FormData();
        body.append("avatar", photoFile);
        const uploaded = await axios.post(`${API_BASE}/admin/users/photo`, body, { headers });
        avatar = uploaded.data?.data?.avatar || "";
      }
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone.trim(),
        isActive: form.isActive,
        ...(avatar ? { avatar } : {}),
        ...(form.password ? { password: form.password } : {}),
      };
      if (editingId) {
        await axios.put(`${API_BASE}/admin/users/${editingId}`, payload, { headers });
      } else {
        await axios.post(`${API_BASE}/auth/register`, {
          ...payload,
          password: form.password,
        });
      }
      closeForm();
      await loadUsers(search);
    } catch (err: any) {
      const first = err?.response?.data?.errors?.[0]?.msg;
      setFormError(first || err?.response?.data?.message || "Could not save this patient");
    } finally {
      setSaving(false);
    }
  };

  const removeUser = async (user: PortalUser) => {
    const label = user.name || user.email || "this patient";
    if (!window.confirm(`Remove ${label}? This deletes the account.`)) return;
    setError("");
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE}/admin/users/${user._id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (editingId === user._id) closeForm();
      await loadUsers(search);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Could not remove this patient");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-ink">Patient directory</h2>
          <p className="text-sm text-slate-500">Accounts registered in the app</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or email"
            className="w-full sm:w-72 px-3 py-2 border border-line rounded-md text-sm bg-white"
          />
          <button
            onClick={openCreate}
            className="px-4 py-2 rounded-md bg-ink text-white text-sm"
          >
            {showForm && !editingId ? "Close" : "Add patient"}
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={saveUser} className="bg-white border border-line rounded-lg p-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <p className="sm:col-span-2 lg:col-span-3 text-sm font-medium text-ink">
            {editingId ? "Edit patient" : "New patient"}
          </p>
          <label className="text-sm text-slate-600">
            Name
            <input
              required
              minLength={2}
              maxLength={50}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 w-full px-3 py-2 border border-line rounded-md"
            />
          </label>
          <label className="text-sm text-slate-600">
            Email
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1 w-full px-3 py-2 border border-line rounded-md"
            />
          </label>
          <label className="text-sm text-slate-600">
            Phone
            <input
              inputMode="numeric"
              maxLength={10}
              pattern="[0-9]{10}"
              title="10 digit phone number"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
              placeholder="10 digits"
              className="mt-1 w-full px-3 py-2 border border-line rounded-md"
            />
          </label>
          <label className="text-sm text-slate-600">
            Password
            <div className="relative mt-1">
              <input
                required={!editingId}
                minLength={form.password ? 6 : undefined}
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder={editingId ? "Leave blank to keep the current password" : ""}
                className="w-full px-3 py-2 pr-10 border border-line rounded-md"
              />
              <button
                type="button"
                onClick={() => setShowPassword((open) => !open)}
                className="absolute right-2 top-2 text-slate-500"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>
          <div className="text-sm text-slate-600">
            Profile photo
            <div className="mt-1 flex items-center gap-3">
              {photoPreview ? (
                <img src={photoPreview} alt="" className="h-12 w-12 rounded-full object-cover border border-line" />
              ) : (
                <span className="h-12 w-12 rounded-full border border-dashed border-line bg-canvas" />
              )}
              <label className="px-3 py-2 border border-line rounded-md bg-white cursor-pointer">
                {photoFile ? "Change photo" : "Upload photo"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="sr-only"
                  onChange={(e) => {
                    choosePhoto(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
            <p className="mt-1 text-xs text-slate-400">JPEG, PNG, WebP, or GIF. Up to 5 MB.</p>
          </div>
          <label className="text-sm text-slate-600">
            Status
            <select
              value={form.isActive ? "active" : "inactive"}
              onChange={(e) => setForm({ ...form, isActive: e.target.value === "active" })}
              className="mt-1 w-full px-3 py-2 border border-line rounded-md bg-white"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
          <div className="sm:col-span-2 lg:col-span-3 flex items-center justify-between gap-3">
            {formError ? <p className="text-sm text-red-600">{formError}</p> : <span />}
            <div className="flex gap-2">
              <button type="button" onClick={closeForm} className="px-4 h-10 rounded-md border border-line text-sm">
                Cancel
              </button>
              <button disabled={saving} className="px-4 h-10 rounded-md bg-pine text-white text-sm disabled:opacity-60">
                {saving ? "Saving…" : editingId ? "Update patient" : "Save patient"}
              </button>
            </div>
          </div>
        </form>
      )}

      {loading && <p className="text-gray-500">Loading users...</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}

      {!loading && !error && users.length === 0 && (
        <p className="text-gray-500">No users found.</p>
      )}

      {!loading && users.length > 0 && (
        <div className="bg-white border border-line rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Plan</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-t">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    <span className="inline-flex items-center gap-2">
                      {photoSrc(user.avatar) ? (
                        <img src={photoSrc(user.avatar)} alt="" className="h-8 w-8 rounded-full object-cover border border-line" />
                      ) : null}
                      {user.name || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{user.email || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{user.phone || "—"}</td>
                  <td className="px-4 py-3">{planName(user.subscription)}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        user.isActive === false
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {user.isActive === false ? "Inactive" : "Active"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button type="button" onClick={() => openEdit(user)} className="text-pine font-medium mr-3">
                      Edit
                    </button>
                    <button type="button" onClick={() => removeUser(user)} className="text-red-600 font-medium">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
