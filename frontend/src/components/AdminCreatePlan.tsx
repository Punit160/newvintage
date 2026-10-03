import React, { useEffect, useState } from "react";
import axios from "axios";
import { Toaster as HotToaster, toast } from "react-hot-toast";
import { API_BASE } from "../constant/Constant";
import { HEALTH_ICONS } from "./healthIcons";
import { IconPicker } from "./UserCard";

const PLAN_ICON_ALIASES: Record<string, string> = {
  shield: "shield-plus",
  star: "star",
  badge: "medal",
  crown: "crown",
  diamond: "diamond-stone",
  "military-tech": "medal",
  premium: "star",
  pro: "certificate",
  elite: "crown",
};

const PLAN_ICONS = [
  { name: "star", label: "Star" },
  { name: "crown", label: "Crown" },
  { name: "medal", label: "Medal" },
  { name: "diamond-stone", label: "Diamond" },
  { name: "certificate", label: "Certificate" },
  ...HEALTH_ICONS,
];

interface Plan {
  _id?: string;
  id: string;
  name: string;
  price?: number;
  yearlyPrice?: number;
  extraAmount?: number;
  extraAmountT?:string
  description: string;
  period: string;
  savings: string;
  popular: boolean;
  features: string[];
  extraBenefits?: string[];
  color: string;
  icon: string;
  paymentUrl: string;
}

interface PlanForm {
  id: string;
  name: string;
  price: string;
  extraAmount: string;
  extraAmountT: string;
  yearlyPrice: string;
  description: string;
  period: string;
  savings: string;
  popular: boolean;
  chatFrequency: string;
  videoMeetings: string;
  symptomTracking: boolean;
  prioritySupport: boolean;
  features: string;
  extraBenefits: string;
  color: string;
  icon: string;
  paymentUrl: string;
}

const PLAN_NAMES = [
  { id: "basic", name: "Basic", color: "#6B7280", icon: "shield" },
  { id: "premium", name: "Premium", color: "#F59E0B", icon: "star" },
  { id: "pro", name: "Pro", color: "#10B981", icon: "badge" },
  { id: "elite", name: "Elite", color: "#6366F1", icon: "crown" },
];

const getDefaultForm = (): PlanForm => ({
  id: "basic",
  name: "Basic",
  price: "",
  yearlyPrice: "",
  description: "",
  period: "/month",
  savings: "",
  popular: false,
  chatFrequency: "weekly",
  videoMeetings: "",
  symptomTracking: true,
  prioritySupport: false,
  features: "Access to informational content",
  extraBenefits: "",
  color: "#6B7280",
  icon: "shield",
  paymentUrl: "",
  extraAmount:'',
  extraAmountT:""
});

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [form, setForm] = useState<PlanForm>(getDefaultForm());

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const headers = getAuthHeaders();
      const res = await axios.get(`${API_BASE}/admin/subscriptions`, { headers });
      const data = res.data?.data ?? res.data?.plans ?? res.data;
      setPlans(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error(err);
      // toast.error(err.response?.data?.message || "Failed to fetch plans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const parsePlanToForm = (plan: Plan | null): PlanForm => {
    if (!plan) return getDefaultForm();
    let chatFrequency = "weekly";
    let videoMeetings = "";
    let symptomTracking = false;
    let prioritySupport = false;
    const extraFeatures: string[] = [];

    (plan.features || []).forEach((f) => {
      if (typeof f !== "string") return;
      if (f.match(/^Chat frequency:\s*(.*)$/i)) chatFrequency = f.split(":")[1].trim();
      else if (f.match(/^Video meetings:\s*(.*)$/i)) videoMeetings = f.split(":")[1].trim();
      else if (/Symptom tracking included/i.test(f)) symptomTracking = true;
      else if (/Priority support included/i.test(f)) prioritySupport = true;
      else extraFeatures.push(f);
    });

    return {
      id: plan.id || "basic",
      name: plan.name || "Basic",
      price: plan.price?.toString() || "",
      yearlyPrice: plan.yearlyPrice?.toString() || "",
      extraAmount: plan.extraAmount?.toString() || "",
      extraAmountT: plan.extraAmountT?.toString() || "",
      description: plan.description || "",
      period: plan.period || "/month",
      savings: plan.savings || "",
      popular: !!plan.popular,
      chatFrequency,
      videoMeetings,
      symptomTracking,
      prioritySupport,
      features: extraFeatures.length ? extraFeatures.join("\n") : "Access to informational content",
      extraBenefits: Array.isArray(plan.extraBenefits) && plan.extraBenefits.length ? plan.extraBenefits.join("\n") : "",
      color: plan.color || PLAN_NAMES.find((x) => x.id === plan.id)?.color || "#6B7280",
      icon: plan.icon || PLAN_NAMES.find((x) => x.id === plan.id)?.icon || "shield",
      paymentUrl: plan.paymentUrl || "",
    };
  };

  const openModal = (plan: Plan | null = null) => {
    setEditingPlan(plan);
    setForm(parsePlanToForm(plan));
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPlan(null);
    setForm(getDefaultForm());
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const headers = getAuthHeaders();
      const derivedFeatures = [
        `Chat frequency: ${form.chatFrequency}`,
        form.videoMeetings ? `Video meetings: ${form.videoMeetings}` : "",
        form.symptomTracking ? "Symptom tracking included" : "",
        form.prioritySupport ? "Priority support included" : "",
      ].filter(Boolean);

      const featuresArray = form.features
        .split("\n")
        .map((f) => f.trim())
        .filter(Boolean);

      const extraBenefitsArray = form.extraBenefits
        .split("\n")
        .map((b) => b.trim())
        .filter(Boolean);

      const payload = {
        ...form,
        price: form.price ? Number(form.price) : undefined,
        yearlyPrice: form.yearlyPrice ? Number(form.yearlyPrice) : undefined,
        extraAmount: form.extraAmount ? Number(form.extraAmount) : undefined,
        features: [...featuresArray, ...derivedFeatures],
        extraBenefits: extraBenefitsArray,
      };

      if (editingPlan?._id) {
        await axios.put(`${API_BASE}/admin/subscriptions/${editingPlan._id}`, payload, { headers });
        toast.success("Plan updated successfully");
      } else {
        await axios.post(`${API_BASE}/subscriptions/admin/create`, payload, { headers });
        toast.success("Plan created successfully");
      }

      fetchPlans();
      closeModal();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error saving plan");
    }
  };

  const handleDelete = async (planId: string) => {
    if (!window.confirm("Delete this plan?")) return;
    try {
      const headers = getAuthHeaders();
      await axios.delete(`${API_BASE}/admin/subscriptions/${planId}`, { headers });
      toast.success("Plan deleted successfully");
      fetchPlans();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete plan");
    }
  };

  return (
    <div>
    {/* <div className="min-h-screen  p-4 md:p-6 lg:p-8 pt-20 md:pt-6"> card below space/gap */}
      <HotToaster position="top-center" />

      <div className="max-w-7xl mx-auto">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Subscription Plans</h1>
  
  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
    <button
      onClick={() => openModal()}
      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
    >
      + Add New Plan
    </button>
    <button
      onClick={fetchPlans}
      className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
    >
      Refresh
    </button>
  </div>
</div>


        {loading ? (

          
           <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading plans ...</p>
        </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-12 text-gray-600">No plans found.</div>
        ) : (
          <div className="bg-white border border-line rounded-lg overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Description</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Period</th>
                  <th className="px-4 py-3 font-medium">Popular</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((p) => (
                  <tr key={p._id} className="border-t">
                    <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{p.description || "—"}</td>
                    <td className="px-4 py-3">{p.price !== undefined ? `$${p.price}` : "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{p.period || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${p.popular ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                        {p.popular ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button type="button" onClick={() => openModal(p)} className="text-pine font-medium mr-3">Edit</button>
                      <button type="button" onClick={() => handleDelete(p._id!)} className="text-red-600 font-medium">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto my-8">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 flex justify-between items-center">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
                {editingPlan ? "Edit Plan" : "Create Subscription Plan"}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-3xl leading-none font-light"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block font-medium mb-2 text-sm text-gray-700">Plan Type</label>
                <select
                  value={form.id}
                  onChange={(e) => {
                    const sel = PLAN_NAMES.find((p) => p.id === e.target.value)!;
                    setForm((prev) => ({
                      ...prev,
                      id: sel.id,
                      name: sel.name,
                      color: sel.color,
                      icon: sel.icon,
                    }));
                  }}
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {PLAN_NAMES.map((pn) => (
                    <option key={pn.id} value={pn.id}>
                      {pn.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-2 text-sm text-gray-700">Display Name</label>
                  <input
                    placeholder="Display Name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-2 text-sm text-gray-700">Price ($)</label>
                  <input
                    placeholder="Price"
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                 <div>
                  <label className="block font-medium mb-2 text-sm text-gray-700">Enter Extra Amount ($)</label>
                  <input
                    placeholder="Price"
                    type="number"
                    name="extraAmount"
                    value={form.extraAmount}
                    onChange={handleChange}
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
                 <div>
                <label className="block font-medium mb-2 text-sm text-gray-700">Extra Amount Text</label>
                <input
                  placeholder="Extra Why Amount"
                  name="extraAmountT"
                  value={form.extraAmountT}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-medium mb-2 text-sm text-gray-700">Yearly Price ($)</label>
                  <input
                    placeholder="Yearly Price"
                    type="number"
                    name="yearlyPrice"
                    value={form.yearlyPrice}
                    onChange={handleChange}
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-2 text-sm text-gray-700">Period Label</label>
                  <input
                    placeholder="/month"
                    name="period"
                    value={form.period}
                    onChange={handleChange}
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-2 text-sm text-gray-700">Savings Text</label>
                  <input
                    placeholder="Save 20%"
                    name="savings"
                    value={form.savings}
                    onChange={handleChange}
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium mb-2 text-sm text-gray-700">Description</label>
                <input
                  placeholder="Plan description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-semibold mb-3 text-gray-900">Plan Features</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="popular"
                      checked={form.popular}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Popular Plan</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="symptomTracking"
                      checked={form.symptomTracking}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Symptom Tracking</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="prioritySupport"
                      checked={form.prioritySupport}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Priority Support</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium mb-2 text-sm text-gray-700">Chat Frequency</label>
                    <select
                      name="chatFrequency"
                      value={form.chatFrequency}
                      onChange={handleChange}
                      className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium mb-2 text-sm text-gray-700">Video Meetings</label>
                    <input
                      placeholder="e.g., 2/month"
                      type="text"
                      name="videoMeetings"
                      value={form.videoMeetings}
                      onChange={handleChange}
                      className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-4">
                <div>
                  <label className="block font-medium mb-2 text-sm text-gray-700">
                    Features
                    <span className="text-gray-500 text-xs ml-2">(One per line)</span>
                  </label>
                  <textarea
                    name="features"
                    value={form.features}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Enter features, one per line&#10;e.g., Access to informational content&#10;Feature 2&#10;Feature 3"
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-2 text-sm text-gray-700">
                    Extra Benefits
                    <span className="text-gray-500 text-xs ml-2">(One per line)</span>
                  </label>
                  <textarea
                    name="extraBenefits"
                    value={form.extraBenefits}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Enter extra benefits, one per line&#10;e.g., Free consultation&#10;Priority email support"
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                  />
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-semibold mb-3 text-gray-900">Styling & Payment</h3>
                <div className="mb-4">
                  <label className="block font-medium mb-2 text-sm text-gray-700">Icon</label>
                  <IconPicker
                    selected={PLAN_ICON_ALIASES[form.icon] || form.icon}
                    icons={PLAN_ICONS}
                    onChange={(icon) => setForm({ ...form, icon })}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium mb-2 text-sm text-gray-700">Color (Hex)</label>
                    <input
                      placeholder="#6B7280"
                      name="color"
                      value={form.color}
                      onChange={handleChange}
                      className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-2 text-sm text-gray-700">Payment URL</label>
                    <input
                      placeholder="https://..."
                      name="paymentUrl"
                      value={form.paymentUrl}
                      onChange={handleChange}
                      className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 flex-col-reverse sm:flex-row">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  {editingPlan ? "Update Plan" : "Create Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
