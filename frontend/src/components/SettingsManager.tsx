import { useEffect, useState, type FormEvent } from "react";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";
import { API_BASE } from "../constant/Constant";

type Account = {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  role?: string;
  isActive?: boolean;
};

const emptyMember = {
  name: "",
  email: "",
  phone: "",
  password: "",
  avatar: "",
  isActive: true,
};

const photoHost = API_BASE.replace(/\/api\/?$/, "").replace(/\/$/, "") || (typeof window !== "undefined" ? window.location.origin : "");

const photoSrc = (value?: string) => {
  if (!value) return "";
  if (value.startsWith("http") || value.startsWith("blob:") || value.startsWith("data:")) return value;
  return `${photoHost}${value.startsWith("/") ? value : `/${value}`}`;
};

const authHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : undefined;
};

export default function SettingsManager({ onProfileSaved }: { onProfileSaved?: (profile: Account) => void }) {
  const [profile, setProfile] = useState<Account | null>(null);
  const [members, setMembers] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profileForm, setProfileForm] = useState(emptyMember);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState("");
  const [showProfilePassword, setShowProfilePassword] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [memberForm, setMemberForm] = useState(emptyMember);
  const [memberPhoto, setMemberPhoto] = useState<File | null>(null);
  const [memberPreview, setMemberPreview] = useState("");
  const [showMemberPassword, setShowMemberPassword] = useState(false);
  const [savingMember, setSavingMember] = useState(false);
  const [memberError, setMemberError] = useState("");

  const applyProfile = (account: Account) => {
    setProfile(account);
    setProfileForm({
      name: account.name || "",
      email: account.email || "",
      phone: account.phone || "",
      password: "",
      avatar: account.avatar || "",
      isActive: account.isActive !== false,
    });
    setProfilePreview((current) => {
      if (current.startsWith("blob:")) URL.revokeObjectURL(current);
      return photoSrc(account.avatar);
    });
    setProfilePhoto(null);
  };

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_BASE}/admin/settings`, { headers: authHeaders() });
      applyProfile(res.data?.data?.profile || {});
      setMembers(res.data?.data?.members || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Unable to load settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const choosePhoto = (file: File | undefined, setErrorMessage: (value: string) => void, setFile: (file: File) => void, setPreview: (value: string) => void) => {
    if (!file) return;
    if (!/^image\/(jpeg|png|webp|gif)$/.test(file.type)) {
      setErrorMessage("Photo must be a JPEG, PNG, WebP, or GIF");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Photo must be under 5 MB");
      return;
    }
    setErrorMessage("");
    setFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const uploadPhoto = async (file: File) => {
    const body = new FormData();
    body.append("avatar", file);
    const uploaded = await axios.post(`${API_BASE}/admin/users/photo`, body, { headers: authHeaders() });
    return uploaded.data?.data?.avatar || "";
  };

  const saveProfile = async (event: FormEvent) => {
    event.preventDefault();
    setSavingProfile(true);
    setProfileError("");
    try {
      let avatar = profileForm.avatar.trim();
      if (profilePhoto) avatar = await uploadPhoto(profilePhoto);
      const res = await axios.put(
        `${API_BASE}/admin/settings`,
        {
          name: profileForm.name,
          email: profileForm.email,
          phone: profileForm.phone.trim(),
          ...(avatar ? { avatar } : {}),
          ...(profileForm.password ? { password: profileForm.password } : {}),
        },
        { headers: authHeaders() }
      );
      const saved = res.data?.data;
      if (saved) {
        applyProfile(saved);
        onProfileSaved?.(saved);
      }
      setShowProfilePassword(false);
    } catch (err: any) {
      const first = err?.response?.data?.errors?.[0]?.msg;
      setProfileError(first || err?.response?.data?.message || "Could not update the account");
    } finally {
      setSavingProfile(false);
    }
  };

  const openMember = (member?: Account) => {
    setEditingId(member?._id || null);
    setMemberForm(member ? {
      name: member.name || "",
      email: member.email || "",
      phone: member.phone || "",
      password: "",
      avatar: member.avatar || "",
      isActive: member.isActive !== false,
    } : emptyMember);
    setMemberPreview(photoSrc(member?.avatar));
    setMemberPhoto(null);
    setMemberError("");
    setShowMemberPassword(false);
    setShowMemberForm(true);
  };

  const saveMember = async (event: FormEvent) => {
    event.preventDefault();
    setSavingMember(true);
    setMemberError("");
    try {
      let avatar = memberForm.avatar.trim();
      if (memberPhoto) avatar = await uploadPhoto(memberPhoto);
      const payload = {
        name: memberForm.name,
        email: memberForm.email,
        phone: memberForm.phone.trim(),
        isActive: memberForm.isActive,
        ...(avatar ? { avatar } : {}),
        ...(memberForm.password ? { password: memberForm.password } : {}),
      };
      if (editingId) {
        await axios.put(`${API_BASE}/admin/team/${editingId}`, payload, { headers: authHeaders() });
      } else {
        await axios.post(`${API_BASE}/admin/team`, { ...payload, password: memberForm.password }, { headers: authHeaders() });
      }
      setShowMemberForm(false);
      await load();
    } catch (err: any) {
      const first = err?.response?.data?.errors?.[0]?.msg;
      setMemberError(first || err?.response?.data?.message || "Could not save this team member");
    } finally {
      setSavingMember(false);
    }
  };

  const removeMember = async (member: Account) => {
    if (!window.confirm(`Remove ${member.name || "this team member"}?`)) return;
    try {
      await axios.delete(`${API_BASE}/admin/team/${member._id}`, { headers: authHeaders() });
      if (editingId === member._id) setShowMemberForm(false);
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Could not remove this team member");
    }
  };

  if (loading) return <p className="text-gray-500">Loading settings...</p>;
  if (error && !profile) return <p className="text-red-600 text-sm">{error}</p>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-ink">Your account</h2>
        <p className="text-sm text-slate-500">Administrator details for this portal</p>
      </div>

      <form id="account-form" onSubmit={saveProfile} className="bg-white border border-line rounded-lg p-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="text-sm text-slate-600">
          Profile photo
          <div className="mt-1 flex items-center gap-3">
            {profilePreview ? (
              <img src={profilePreview} alt="" className="h-12 w-12 rounded-full object-cover border border-line" />
            ) : (
              <span className="h-12 w-12 rounded-full border border-dashed border-line bg-canvas" />
            )}
            <label className="px-3 py-2 border border-line rounded-md bg-white cursor-pointer">
              Upload photo
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="sr-only"
                onChange={(e) => {
                  choosePhoto(e.target.files?.[0], setProfileError, setProfilePhoto, (value) => {
                    setProfilePreview((current) => {
                      if (current.startsWith("blob:")) URL.revokeObjectURL(current);
                      return value;
                    });
                  });
                  e.target.value = "";
                }}
              />
            </label>
          </div>
        </div>
        <label className="text-sm text-slate-600">
          Name
          <input required minLength={2} maxLength={50} value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} className="mt-1 w-full px-3 py-2 border border-line rounded-md" />
        </label>
        <label className="text-sm text-slate-600">
          Email
          <input required type="email" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} className="mt-1 w-full px-3 py-2 border border-line rounded-md" />
        </label>
        <label className="text-sm text-slate-600">
          Phone
          <input inputMode="numeric" maxLength={10} value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })} placeholder="10 digits" className="mt-1 w-full px-3 py-2 border border-line rounded-md" />
        </label>
        <label className="text-sm text-slate-600">
          Password
          <div className="relative mt-1">
            <input minLength={profileForm.password ? 6 : undefined} type={showProfilePassword ? "text" : "password"} value={profileForm.password} onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })} placeholder="Leave blank to keep the current password" className="w-full px-3 py-2 pr-10 border border-line rounded-md" />
            <button type="button" onClick={() => setShowProfilePassword((open) => !open)} className="absolute right-2 top-2 text-slate-500" aria-label={showProfilePassword ? "Hide password" : "Show password"}>
              {showProfilePassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </label>
        <label className="text-sm text-slate-600">
          Role
          <input value="Administrator" readOnly className="mt-1 w-full px-3 py-2 border border-line rounded-md bg-canvas text-slate-500" />
        </label>
        <div className="sm:col-span-2 lg:col-span-3 flex items-center justify-between gap-3">
          {profileError ? <p className="text-sm text-red-600">{profileError}</p> : <span />}
          <button disabled={savingProfile} className="px-4 h-10 rounded-md bg-pine text-white text-sm disabled:opacity-60">
            {savingProfile ? "Saving…" : "Save account"}
          </button>
        </div>
      </form>

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-ink">Team</h2>
          <p className="text-sm text-slate-500">Team members can use every section except Settings</p>
        </div>
        <button type="button" onClick={() => (showMemberForm && !editingId ? setShowMemberForm(false) : openMember())} className="px-4 py-2 rounded-md bg-ink text-white text-sm">
          {showMemberForm && !editingId ? "Close" : "Add team member"}
        </button>
      </div>

      {showMemberForm && (
        <form onSubmit={saveMember} className="bg-white border border-line rounded-lg p-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <p className="sm:col-span-2 lg:col-span-3 text-sm font-medium text-ink">{editingId ? "Edit team member" : "New team member"}</p>
          <label className="text-sm text-slate-600">
            Name
            <input required minLength={2} maxLength={50} value={memberForm.name} onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })} className="mt-1 w-full px-3 py-2 border border-line rounded-md" />
          </label>
          <label className="text-sm text-slate-600">
            Email
            <input required type="email" value={memberForm.email} onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })} className="mt-1 w-full px-3 py-2 border border-line rounded-md" />
          </label>
          <label className="text-sm text-slate-600">
            Phone
            <input inputMode="numeric" maxLength={10} value={memberForm.phone} onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })} placeholder="10 digits" className="mt-1 w-full px-3 py-2 border border-line rounded-md" />
          </label>
          <label className="text-sm text-slate-600">
            Password
            <div className="relative mt-1">
              <input required={!editingId} minLength={memberForm.password ? 6 : undefined} type={showMemberPassword ? "text" : "password"} value={memberForm.password} onChange={(e) => setMemberForm({ ...memberForm, password: e.target.value })} placeholder={editingId ? "Leave blank to keep the current password" : ""} className="w-full px-3 py-2 pr-10 border border-line rounded-md" />
              <button type="button" onClick={() => setShowMemberPassword((open) => !open)} className="absolute right-2 top-2 text-slate-500" aria-label={showMemberPassword ? "Hide password" : "Show password"}>
                {showMemberPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>
          <div className="text-sm text-slate-600">
            Profile photo
            <div className="mt-1 flex items-center gap-3">
              {memberPreview ? (
                <img src={memberPreview} alt="" className="h-12 w-12 rounded-full object-cover border border-line" />
              ) : (
                <span className="h-12 w-12 rounded-full border border-dashed border-line bg-canvas" />
              )}
              <label className="px-3 py-2 border border-line rounded-md bg-white cursor-pointer">
                Upload photo
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="sr-only"
                  onChange={(e) => {
                    choosePhoto(e.target.files?.[0], setMemberError, setMemberPhoto, (value) => {
                      setMemberPreview((current) => {
                        if (current.startsWith("blob:")) URL.revokeObjectURL(current);
                        return value;
                      });
                    });
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
          </div>
          <label className="text-sm text-slate-600">
            Status
            <select value={memberForm.isActive ? "active" : "inactive"} onChange={(e) => setMemberForm({ ...memberForm, isActive: e.target.value === "active" })} className="mt-1 w-full px-3 py-2 border border-line rounded-md bg-white">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
          <div className="sm:col-span-2 lg:col-span-3 flex items-center justify-between gap-3">
            {memberError ? <p className="text-sm text-red-600">{memberError}</p> : <span />}
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowMemberForm(false)} className="px-4 h-10 rounded-md border border-line text-sm">Cancel</button>
              <button disabled={savingMember} className="px-4 h-10 rounded-md bg-pine text-white text-sm disabled:opacity-60">
                {savingMember ? "Saving…" : editingId ? "Update member" : "Save member"}
              </button>
            </div>
          </div>
        </form>
      )}

      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div className="bg-white border border-line rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Access</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {profile && (
              <tr className="border-t">
                <td className="px-4 py-3 font-medium text-gray-900">
                  <span className="inline-flex items-center gap-2">
                    {photoSrc(profile.avatar) ? <img src={photoSrc(profile.avatar)} alt="" className="h-8 w-8 rounded-full object-cover border border-line" /> : null}
                    {profile.name || "—"}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{profile.email || "—"}</td>
                <td className="px-4 py-3 text-gray-600">{profile.phone || "—"}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">Admin</span>
                </td>
                <td className="px-4 py-3 text-gray-600">Settings and all sections</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">Active</span>
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => document.getElementById("account-form")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                    className="text-pine font-medium"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            )}
            {members.map((member) => (
              <tr key={member._id} className="border-t">
                <td className="px-4 py-3 font-medium text-gray-900">
                  <span className="inline-flex items-center gap-2">
                    {photoSrc(member.avatar) ? <img src={photoSrc(member.avatar)} alt="" className="h-8 w-8 rounded-full object-cover border border-line" /> : null}
                    {member.name || "—"}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{member.email || "—"}</td>
                <td className="px-4 py-3 text-gray-600">{member.phone || "—"}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">Team</span>
                </td>
                <td className="px-4 py-3 text-gray-600">All sections except Settings</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${member.isActive === false ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                    {member.isActive === false ? "Inactive" : "Active"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <button type="button" onClick={() => openMember(member)} className="text-pine font-medium mr-3">Edit</button>
                  <button type="button" onClick={() => removeMember(member)} className="text-red-600 font-medium">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
