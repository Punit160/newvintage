// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { API_BASE } from "../constant/Constant";

// export default function BlockedDatesManager() {
//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");
//   const [blockedList, setBlockedList] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const fetchBlocked = async () => {
//     try {
//       const res = await axios.get(`${API_BASE}/blocked-dates`);
//       setBlockedList(res.data.data || []);
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   useEffect(() => {
//     fetchBlocked();
//   }, []);

//   const handleAdd = async () => {
//     if (!fromDate || !toDate) {
//       alert("Select both dates");
//       return;
//     }

//     setLoading(true);
//     try {
//       await axios.post(`${API_BASE}/blocked-dates`, {
//         fromDate,
//         toDate,
//       });

//       setFromDate("");
//       setToDate("");
//       fetchBlocked();
//     } catch (err) {
//       alert("Failed to add");
//     }
//     setLoading(false);
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm("Delete this block?")) return;

//     try {
//       await axios.delete(`${API_BASE}/blocked-dates/${id}`);
//       fetchBlocked();
//     } catch (err) {
//       alert("Delete failed");
//     }
//   };

//   return (
//     <div className="max-w-4xl mx-auto">
//       <h2 className="text-xl font-bold mb-4 mt-4">Block Booking Dates</h2>

//       {/* FORM */}
//       {/* <div className="bg-white p-4 rounded-xl shadow mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
//         <input
//           type="date"
//           value={fromDate}
//           onChange={(e) => setFromDate(e.target.value)}
//           className="border p-2 rounded"
//         />

//         <input
//           type="date"
//           value={toDate}
//           onChange={(e) => setToDate(e.target.value)}
//           className="border p-2 rounded"
//         />

//         <button
//           onClick={handleAdd}
//           disabled={loading}
//           className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700"
//         >
//           {loading ? "Adding..." : "Add Block"}
//         </button>
//       </div> */}
//       <form
//   onSubmit={(e) => {
//     e.preventDefault();
//     handleAdd();
//   }}
//   className="bg-white p-4 rounded-xl shadow mb-6 grid grid-cols-1 md:grid-cols-3 gap-4"
// >
//   {/* From Date */}
//   <div className="flex flex-col">
//     <label className="text-sm font-medium mb-1">From Date</label>
//     <input
//       type="date"
//       value={fromDate}
//       onChange={(e) => setFromDate(e.target.value)}
//       className="border p-2 rounded"
//       required
//     />
//   </div>

//   {/* To Date */}
//   <div className="flex flex-col">
//     <label className="text-sm font-medium mb-1">To Date</label>
//     <input
//       type="date"
//       value={toDate}
//       onChange={(e) => setToDate(e.target.value)}
//       className="border p-2 rounded"
//       required
//     />
//   </div>

//   {/* Button */}
//   <div className="flex items-end">
//     <button
//       type="submit"
//       disabled={loading}
//       className="w-full bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 disabled:opacity-50"
//     >
//       {loading ? "Adding..." : "Add Block"}
//     </button>
//   </div>
// </form>

//       {/* LIST */}
//       <div className="bg-white rounded-xl shadow p-4">
//         <h3 className="font-semibold mb-3">Blocked Dates</h3>

//         {blockedList.length === 0 && (
//           <p className="text-gray-500">No blocked dates</p>
//         )}

//         <div className="space-y-3">
//           {blockedList.map((item) => (
//             <div
//               key={item._id}
//               className="flex justify-between items-center border p-3 rounded"
//             >
//               <div>
//                 <p className="font-medium">
//                   {new Date(item.fromDate).toDateString()} →{" "}
//                   {new Date(item.toDate).toDateString()}
//                 </p>
//               </div>

//               <button
//                 onClick={() => handleDelete(item._id)}
//                 className="text-red-500 hover:underline"
//               >
//                 Delete
//               </button>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { API_BASE } from "../constant/Constant";

// const weekdays = [
//   { label: "Sun", value: 0 },
//   { label: "Mon", value: 1 },
//   { label: "Tue", value: 2 },
//   { label: "Wed", value: 3 },
//   { label: "Thu", value: 4 },
//   { label: "Fri", value: 5 },
//   { label: "Sat", value: 6 },
// ];

// export default function BlockedDatesManager() {
//   const [type, setType] = useState("range");

//   const [date, setDate] = useState("");
//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");
//   const [selectedDays, setSelectedDays] = useState([]);

//   const [blockedList, setBlockedList] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const fetchBlocked = async () => {
//     try {
//       const res = await axios.get(`${API_BASE}/blocked-dates`);
//       setBlockedList(res.data.data || []);
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   useEffect(() => {
//     fetchBlocked();
//   }, []);

//   const toggleDay = (day) => {
//     setSelectedDays((prev) =>
//       prev.includes(day)
//         ? prev.filter((d) => d !== day)
//         : [...prev, day]
//     );
//   };

//   const handleAdd = async () => {
//     setLoading(true);
//     try {
//       let payload = { type };

//       if (type === "single") {
//         if (!date) return alert("Select date");
//         payload.date = date;
//       }

//       if (type === "range") {
//         if (!fromDate || !toDate) return alert("Select both dates");
//         payload.fromDate = fromDate;
//         payload.toDate = toDate;
//       }

//       if (type === "weekday") {
//         if (!selectedDays.length) return alert("Select weekdays");
//         payload.daysOfWeek = selectedDays;
//       }

//       await axios.post(`${API_BASE}/blocked-dates`, payload);

//       // reset
//       setDate("");
//       setFromDate("");
//       setToDate("");
//       setSelectedDays([]);

//       fetchBlocked();
//     } catch (err) {
//       alert(err?.response?.data?.message || "Failed");
//     }
//     setLoading(false);
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm("Delete this block?")) return;

//     try {
//       await axios.delete(`${API_BASE}/blocked-dates/${id}`);
//       fetchBlocked();
//     } catch {
//       alert("Delete failed");
//     }
//   };

//   return (
//     <div className="max-w-4xl mx-auto">
//       <h2 className="text-xl font-bold mb-4 mt-4">
//         Block Booking Dates
//       </h2>

//       {/* TYPE SELECT */}
//       <div className="mb-4 flex gap-3">
//         {["single", "range", "weekday"].map((t) => (
//           <button
//             key={t}
//             onClick={() => setType(t)}
//             className={`px-3 py-1 rounded ${
//               type === t ? "bg-blue-600 text-white" : "bg-gray-200"
//             }`}
//           >
//             {t}
//           </button>
//         ))}
//       </div>

//       {/* FORM */}
//       <div className="bg-white p-4 rounded-xl shadow mb-6">

//         {/* SINGLE DATE */}
//         {type === "single" && (
//           <input
//             type="date"
//             value={date}
//             onChange={(e) => setDate(e.target.value)}
//             className="border p-2 rounded w-full"
//           />
//         )}

//         {/* RANGE */}
//         {type === "range" && (
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <input
//               type="date"
//               value={fromDate}
//               onChange={(e) => setFromDate(e.target.value)}
//               className="border p-2 rounded"
//             />
//             <input
//               type="date"
//               value={toDate}
//               onChange={(e) => setToDate(e.target.value)}
//               className="border p-2 rounded"
//             />
//           </div>
//         )}

//         {/* WEEKDAY */}
//         {type === "weekday" && (
//           <div className="flex flex-wrap gap-2">
//             {weekdays.map((d) => (
//               <button
//                 key={d.value}
//                 onClick={() => toggleDay(d.value)}
//                 className={`px-3 py-1 rounded border ${
//                   selectedDays.includes(d.value)
//                     ? "bg-blue-600 text-white"
//                     : "bg-gray-100"
//                 }`}
//               >
//                 {d.label}
//               </button>
//             ))}
//           </div>
//         )}

//         <button
//           onClick={handleAdd}
//           disabled={loading}
//           className="mt-4 bg-blue-600 text-white px-4 py-2 rounded w-full"
//         >
//           {loading ? "Adding..." : "Add Block"}
//         </button>
//       </div>

//       {/* LIST */}
//       <div className="bg-white rounded-xl shadow p-4">
//         <h3 className="font-semibold mb-3">Blocked Data</h3>

//         {blockedList.length === 0 && (
//           <p className="text-gray-500">No blocked data</p>
//         )}

//         <div className="space-y-3">
//           {blockedList.map((item) => (
//             <div
//               key={item._id}
//               className="flex justify-between items-center border p-3 rounded"
//             >
//               <div className="text-sm">
//                 {/* SINGLE */}
//                 {item.type === "single" && (
//                   <p>
//                     📅 {new Date(item.date).toDateString()}
//                   </p>
//                 )}

//                 {/* RANGE */}
//                 {item.type === "range" && (
//                   <p>
//                     📆 {new Date(item.fromDate).toDateString()} →{" "}
//                     {new Date(item.toDate).toDateString()}
//                   </p>
//                 )}

//                 {/* WEEKDAY */}
//                 {item.type === "weekday" && (
//                   <p>
//                     🔁{" "}
//                     {item.daysOfWeek
//                       ?.map(
//                         (d) =>
//                           weekdays.find((w) => w.value === d)?.label
//                       )
//                       .join(", ")}
//                   </p>
//                 )}
//               </div>

//               <button
//                 onClick={() => handleDelete(item._id)}
//                 className="text-red-500 hover:underline"
//               >
//                 Delete
//               </button>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE } from "../constant/Constant";
import { AlertCircle, CheckCircle, Plus, X, ChevronLeft, ChevronRight, Search, Filter, Clock } from "lucide-react";

const weekdays = [
  { label: "Sun", value: 0, short: "S" },
  { label: "Mon", value: 1, short: "M" },
  { label: "Tue", value: 2, short: "T" },
  { label: "Wed", value: 3, short: "W" },
  { label: "Thu", value: 4, short: "T" },
  { label: "Fri", value: 5, short: "F" },
  { label: "Sat", value: 6, short: "S" },
];

// Helper function to convert 24-hour format to 12-hour format with AM/PM
const formatTime12Hour = (time24h) => {
  if (!time24h) return "";
  const [hours24, minutes] = time24h.split(':');
  let hours = parseInt(hours24, 10);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
};

export default function BlockedDatesManager() {
  const [type, setType] = useState("range");
  const [date, setDate] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedDays, setSelectedDays] = useState([]);
  const [startTime, setStartTime] = useState(""); // Store in 24-hour format
  const [endTime, setEndTime] = useState(""); // Store in 24-hour format
  const [blockedList, setBlockedList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: "", message: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const itemsPerPage = 5;

  const fetchBlocked = async () => {
    try {
      const res = await axios.get(`${API_BASE}/blocked-dates`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
      });
      const rows = Array.isArray(res.data?.data) ? res.data.data : [];
      setBlockedList(rows);
    } catch (err) {
      showNotification("error", "Failed to fetch blocked dates");
    }
  };

  useEffect(() => {
    fetchBlocked();
  }, []);

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification({ show: false, type: "", message: "" }), 3000);
  };

  const toggleDay = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const validateInputs = () => {
    // Date validation
    if (type === "single" && !date) {
      showNotification("error", "Please select a date");
      return false;
    }
    if (type === "range" && (!fromDate || !toDate)) {
      showNotification("error", "Please select both start and end dates");
      return false;
    }
    if (type === "range" && new Date(fromDate) > new Date(toDate)) {
      showNotification("error", "Start date cannot be after end date");
      return false;
    }
    if (type === "weekday" && !selectedDays.length) {
      showNotification("error", "Please select at least one weekday");
      return false;
    }
    
    // Time validation
    if ((startTime && !endTime) || (!startTime && endTime)) {
      showNotification("error", "Select both start and end time");
      return false;
    }
    
    if (startTime && endTime && startTime >= endTime) {
      showNotification("error", "Start time must be before end time");
      return false;
    }
    
    return true;
  };

  const handleAdd = async () => {
    if (!validateInputs()) return;
    
    setLoading(true);
    try {
      let payload = { type };
      
      if (type === "single") payload.date = date;
      if (type === "range") {
        payload.fromDate = fromDate;
        payload.toDate = toDate;
      }
      if (type === "weekday") payload.daysOfWeek = selectedDays;
      
      // Add time range if both are provided (already in 24-hour format)
      if (startTime && endTime) {
        payload.startTime = startTime;
        payload.endTime = endTime;
      }

      await axios.post(`${API_BASE}/blocked-dates`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      
      // Reset all fields
      setDate("");
      setFromDate("");
      setToDate("");
      setSelectedDays([]);
      setStartTime("");
      setEndTime("");
      
      fetchBlocked();
      showNotification("success", "Block added successfully");
    } catch (err) {
      showNotification("error", err?.response?.data?.message || "Failed to add block");
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this block? This action cannot be undone.")) return;

    try {
      await axios.delete(`${API_BASE}/blocked-dates/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchBlocked();
      showNotification("success", "Block deleted successfully");
    } catch {
      showNotification("error", "Failed to delete block");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "Asia/Kolkata"
    });
  };

  const getBlockDisplay = (item) => {
    const timeText = item.startTime && item.endTime
      ? ` (${formatTime12Hour(item.startTime)} - ${formatTime12Hour(item.endTime)})`
      : "";
    
    switch (item.type) {
      case "single":
        return {
          icon: "📅",
          title: "Single Date",
          description: formatDate(item.date) + timeText,
          color: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
        };
      case "range":
        return {
          icon: "📆",
          title: "Date Range",
          description: `${formatDate(item.fromDate)} → ${formatDate(item.toDate)}${timeText}`,
          color: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800"
        };
      case "weekday":
        return {
          icon: "🔄",
          title: "Recurring Weekdays",
          description: item.daysOfWeek?.map(d => weekdays.find(w => w.value === d)?.label).join(", ") + timeText,
          color: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
        };
      default:
        return { icon: "📌", title: "Blocked", description: "", color: "bg-gray-50 dark:bg-gray-800/50" };
    }
  };

  // Handle time change from HTML5 time input
  const handleStartTimeChange = (e) => {
    const time24h = e.target.value;
    setStartTime(time24h);
  };

  const handleEndTimeChange = (e) => {
    const time24h = e.target.value;
    setEndTime(time24h);
  };

  // Filter and paginate
  const filteredBlocks = blockedList.filter(item => {
    const display = getBlockDisplay(item);
    return display.description?.toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  const totalPages = Math.ceil(filteredBlocks.length / itemsPerPage);
  const paginatedBlocks = filteredBlocks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div>
      
      {/* Notification Toast */}
      {notification.show && (
        <div className="fixed top-4 right-4 left-4 sm:left-auto z-50 animate-slide-in">
          <div className={`rounded-lg shadow-lg p-3 sm:p-4 flex items-center gap-3 max-w-md mx-auto sm:mx-0 ${
            notification.type === "success" 
              ? "bg-green-50 dark:bg-green-900/90 border border-green-200 dark:border-green-700" 
              : "bg-red-50 dark:bg-red-900/90 border border-red-200 dark:border-red-700"
          }`}>
            {notification.type === "success" ? (
              <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0" />
            )}
            <p className={`text-sm flex-1 ${notification.type === "success" ? "text-green-800 dark:text-green-200" : "text-red-800 dark:text-red-200"}`}>
              {notification.message}
            </p>
            <button 
              onClick={() => setNotification({ show: false, type: "", message: "" })}
              className="flex-shrink-0"
            >
              <X className="w-4 h-4 opacity-50 hover:opacity-100" />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 rounded-2xl bg-ink text-white px-5 py-5 sm:px-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-white/50">Bookings · IST</p>
            <h1 className="text-2xl font-semibold mt-1">Availability</h1>
            <p className="text-sm text-white/70 mt-1 max-w-xl">
              Block a single day, a date range, or weekdays. Leave the time empty to close the whole day.
            </p>
          </div>
          <p className="text-sm bg-white/10 rounded-full px-3 py-1 w-fit">{blockedList.length} blocks</p>
        </div>

        {/* Mobile Type Selector Toggle */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 flex items-center justify-between"
          >
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {type === "single" && "Single Date"}
              {type === "range" && "Date Range"}
              {type === "weekday" && "Weekdays"}
            </span>
            <Filter className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Add Block Form */}
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Add New Block</h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Choose the type of block you want to add</p>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
                  Block Type
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                  {["single", "range", "weekday"].map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        setType(t);
                        setMobileMenuOpen(false);
                      }}
                      className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        type === t
                          ? "bg-blue-600 text-white shadow-md ring-2 ring-blue-600 ring-offset-2 dark:ring-offset-gray-800"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      {t === "single" && "Single Date"}
                      {t === "range" && "Date Range"}
                      {t === "weekday" && "Weekdays"}
                    </button>
                  ))}
                  
                  {/* Mobile Type Selector Modal */}
                  {mobileMenuOpen && (
                    <div className="lg:hidden fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center">
                      <div className="bg-white dark:bg-gray-800 rounded-t-xl sm:rounded-xl w-full sm:max-w-md animate-slide-up">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                          <h3 className="font-semibold text-gray-900 dark:text-white">Select Block Type</h3>
                          <button onClick={() => setMobileMenuOpen(false)}>
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        <div className="p-4 space-y-2">
                          {["single", "range", "weekday"].map((t) => (
                            <button
                              key={t}
                              onClick={() => {
                                setType(t);
                                setMobileMenuOpen(false);
                              }}
                              className={`w-full text-left px-4 py-3 rounded-lg transition ${
                                type === t
                                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                                  : "hover:bg-gray-50 dark:hover:bg-gray-700"
                              }`}
                            >
                              {t === "single" && "📅 Single Date"}
                              {t === "range" && "📆 Date Range"}
                              {t === "weekday" && "🔄 Weekdays"}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Form Fields */}
              {type === "single" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              )}

              {type === "range" && (
                <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
                      min={fromDate || new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
              )}

              {type === "weekday" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Select Weekdays
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                    {weekdays.map((d) => (
                      <button
                        key={d.value}
                        onClick={() => toggleDay(d.value)}
                        className={`py-2 px-1 sm:px-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                          selectedDays.includes(d.value)
                            ? "bg-blue-600 text-white shadow-md"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        }`}
                      >
                        <span className="hidden sm:inline">{d.label}</span>
                        <span className="sm:hidden">{d.short}</span>
                      </button>
                    ))}
                  </div>
                  {selectedDays.length > 0 && (
                    <div className="mt-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      Selected: {selectedDays.map(d => weekdays.find(w => w.value === d)?.label).join(", ")}
                    </div>
                  )}
                </div>
              )}

              {/* TIME BLOCK (Optional) - Fixed with proper working time picker */}
              {/* <div>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Time Range (Optional - IST)
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="time"
                      value={startTime}
                      onChange={handleStartTimeChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      step="60" // Optional: set to "300" for 5-minute intervals
                    />
                    {startTime && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        {formatTime12Hour(startTime)}
                      </p>
                    )}
                  </div>
                  <div>
                    <input
                      type="time"
                      value={endTime}
                      onChange={handleEndTimeChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      step="60"
                    />
                    {endTime && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        {formatTime12Hour(endTime)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Use 24-hour format (e.g., 14:30 = 2:30 PM)
                  </p>
                  {(startTime || endTime) && (
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      Time will be shown in 12-hour format
                    </p>
                  )}
                </div>
              </div> */}
              {/* TIME BLOCK - ONLY FOR SINGLE */}
{(type === "single" || type === "range")  && (
  <div>
    <div className="flex items-center gap-2 mb-2">
      <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {/* Time Range (Optional - IST) */}
        Booking Time Window (Optional - IST)
      </label>
    </div>

    <div className="grid grid-cols-2 gap-3">
      <div>
        <input
          type="time"
          value={startTime}
          onChange={handleStartTimeChange}
          className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700"
        />
      </div>
      <div>
        <input
          type="time"
          value={endTime}
          onChange={handleEndTimeChange}
          className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700"
        />
      </div>
    </div>

    <p className="text-xs text-gray-500 mt-2">
      {/* Leave empty to block full day */}
      Leave (Booking Time Window) empty to block full day.  
Add time to allow booking only in that time range.
    </p>
    <p className="text-xs text-blue-500 mt-2">
  Example: 10:00AM – 6:00PM → Users can book only between 10 AM to 6 PM
</p>
  </div>
)}

              {/* Submit Button */}
              <button
                onClick={handleAdd}
                disabled={loading}
                className="w-full bg-ink text-white py-2.5 sm:py-3 rounded-lg font-medium hover:bg-ink/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                    Add Block
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Blocked List */}
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 mb-3">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  Blocked Dates
                </h2>
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full w-fit">
                  {blockedList.length} total
                </span>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search blocks..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-3 sm:pl-10 sm:pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              {paginatedBlocks.length === 0 ? (
                <p className="px-4 py-8 text-sm text-gray-500">
                  {searchTerm ? "No matching blocks found" : "No blocked dates yet"}
                </p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left text-gray-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium">When</th>
                      <th className="px-4 py-3 font-medium">Created</th>
                      <th className="px-4 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedBlocks.map((item) => {
                      const display = getBlockDisplay(item);
                      return (
                        <tr key={item._id} className="border-t">
                          <td className="px-4 py-3 font-medium text-gray-900">{display.title}</td>
                          <td className="px-4 py-3 text-gray-600">{display.description || "—"}</td>
                          <td className="px-4 py-3 text-gray-500">
                            {item.createdAt
                              ? new Date(item.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                              : "—"}
                          </td>
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <button type="button" onClick={() => handleDelete(item._id)} className="text-red-600 font-medium">
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex flex-col sm:flex-row justify-between items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center gap-1 text-sm w-full sm:w-auto justify-center"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="sm:hidden">Previous</span>
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center gap-1 text-sm w-full sm:w-auto justify-center"
                >
                  <span className="sm:hidden">Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .overflow-y-auto::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 3px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
        
        @media (prefers-color-scheme: dark) {
          .overflow-y-auto::-webkit-scrollbar-track {
            background: #2d3748;
          }
          .overflow-y-auto::-webkit-scrollbar-thumb {
            background: #4a5568;
          }
        }
      `}</style>
    </div>
  );
}