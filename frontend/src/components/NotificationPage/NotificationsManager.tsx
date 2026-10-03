
// import React, { useEffect, useState, useRef, useCallback } from "react";
// import AgoraRTC from "agora-rtc-sdk-ng";
// import { API_BASE } from "../../constant/Constant";

// const NotificationsManager = () => {
//   const [meetings, setMeetings] = useState([]);
//   const [activeMeeting, setActiveMeeting] = useState(null);
//   const[loading,setLoading]=useState(false);
//   const [joined, setJoined] = useState(false);
//   const [callDuration, setCallDuration] = useState(0);
//   const [audioEnabled, setAudioEnabled] = useState(true);
//   const [videoEnabled, setVideoEnabled] = useState(true);
//   const [selectedIds, setSelectedIds] = useState([]);

// const [showAll, setShowAll] = useState(false);

//   const clientRef = useRef(null);
//   const localVideoRef = useRef(null);
//   const remoteVideoRef = useRef(null);
//   const localTracksRef = useRef({ audio: null, video: null });
//   const timerRef = useRef(null);
//   const startTimeRef = useRef(null);
// const fetchMeetings = useCallback(async () => {
//   try {
//     const res = await fetch(`${API_BASE}/meetings`);
//     const data = await res.json();

//     if (!data?.meetings) return;

//     const sorted = [...data.meetings].sort(
//       (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
//     );

//     setMeetings((prev) => {
//       // 🔥 Prevent re-render if nothing changed
//       if (prev.length === sorted.length) {
//         const same = prev.every(
//           (m, i) =>
//             m._id === sorted[i]._id &&
//             m.status === sorted[i].status
//         );
//         if (same) return prev;
//       }
//       return sorted;
//     });
//   } catch (err) {
//     console.error("Error fetching meetings:", err);
//   }
// }, []);

//   // useEffect(() => {
//   //   fetchMeetings();
//   //   const interval = setInterval(fetchMeetings, 10000);
//   //   return () => {
//   //     clearInterval(interval);
//   //     if (timerRef.current) clearInterval(timerRef.current);
//   //   };
//   // }, []);
//   useEffect(() => {
//   setLoading(true);
//   fetchMeetings().finally(() => setLoading(false));

//   const interval = setInterval(fetchMeetings, 10000);

//   return () => {
//     clearInterval(interval);
//     if (timerRef.current) clearInterval(timerRef.current);
//   };
// }, [fetchMeetings]);


// // const fetchMeetings = async () => {
// //   setLoading(true)
// //   try {
// //     const res = await fetch(`${API_BASE}/meetings`);
// //     const data = await res.json();

// //     if (data?.meetings) {
// //       // 🔥 Sort by latest first
// //       const sorted = data.meetings.sort(
// //         (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
// //       );
// //       setMeetings(sorted);
// //       setLoading(false)
// //     }
// //   } catch (err) {
// //     console.error("Error fetching meetings:", err);
// //   }
// // };
// const handleDeleteOne = async (id) => {
//   if (!window.confirm("Delete this meeting permanently?")) return;

//   await fetch(`${API_BASE}/meetings`, {
//     method: "DELETE",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ id }),
//   });

//   setMeetings((prev) => prev.filter((m) => m._id !== id));
// };


// const handleDeleteSelected = async () => {
//   if (selectedIds.length === 0) return;

//   // 🔹 Get selected meetings details
//   const selectedMeetings = meetings.filter((m) =>
//     selectedIds.includes(m._id)
//   );

//   // 🔹 Build readable confirmation text
//   const details = selectedMeetings
//     .map(
//       (m, i) =>
//         `${i + 1}. ${m.userId?.name || "Unknown"} (${m.userId?.email || "No email"})`
//     )
//     .join("\n");

//   const confirmMessage = `Delete selected meetings permanently?\n\n${details}`;

//   if (!window.confirm(confirmMessage)) return;

//   await fetch(`${API_BASE}/meetings`, {
//     method: "DELETE",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ ids: selectedIds }),
//   });

//   setMeetings((prev) =>
//     prev.filter((m) => !selectedIds.includes(m._id))
//   );
//   setSelectedIds([]);
// };


// const handleDeleteAll = async () => {
//   if (!window.confirm("⚠️ Delete ALL meetings permanently?")) return;

//   await fetch(`${API_BASE}/meetings`, {
//     method: "DELETE",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ all: true }),
//   });

//   setMeetings([]);
//   setSelectedIds([]);
// };

//   const handleAccept = async (meetingId) => {
//     try {
//       const res = await fetch(`${API_BASE}/meetings/${meetingId}/accept`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//       });
//       const data = await res.json();
//       if (data?.success) {
//         setMeetings((prev) =>
//           prev.map((m) => (m._id === meetingId ? { ...m, status: "accepted" } : m))
//         );
//       }
//     } catch (err) {
//       console.error("Error accepting meeting:", err);
//     }
//   };

//   const handleDecline = async (meetingId) => {
//     try {
//       await fetch(`${API_BASE}/meetings/${meetingId}/decline`, { 
//         method: "PUT",
//         headers: { "Content-Type": "application/json" }
//       });
//       setMeetings((prev) =>
//         prev.map((m) => (m._id === meetingId ? { ...m, status: "declined" } : m))
//       );
//     } catch (err) {
//       console.error("Error declining meeting:", err);
//     }
//   };
// const handleJoin = async (meeting) => {
//   try {
//     const res = await fetch(
//       `${API_BASE}/meetings/join/${meeting._id}`
//     );
//     const data = await res.json();

//     if (!data.success) {
//       alert(data.message || "Unable to join meeting");
//       return;
//     }

//     const enrichedMeeting = {
//       ...meeting,
//       token: data.token,
//       appId: data.appId,
//       channelName: data.channelName,
//     };

//     setActiveMeeting(enrichedMeeting);
//     startAgoraCall(enrichedMeeting);

//   } catch (err) {
//     console.error("Join failed:", err);
//   }
// };

//   const handleJoin2 = (meeting) => {
//     setActiveMeeting(meeting);
//     startTimeRef.current = new Date();
//     setCallDuration(0);
//     startAgoraCall(meeting);
//   };

 

//     const startCallTimer = useCallback(() => {
//     timerRef.current = setInterval(() => {
//       const elapsed = Math.floor(
//         (new Date() - startTimeRef.current) / 1000
//       );
//       setCallDuration(elapsed);
//     }, 1000);
//   }, []);
//   const startAgoraCall2 = async (meeting) => {
//     if (!meeting.appId || !meeting.token || !meeting.channelName) return;

//     const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
//     clientRef.current = client;

//     try {
//       await client.join(meeting.appId, meeting.channelName, meeting.token, null);

//       const localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
//       const localVideoTrack = await AgoraRTC.createCameraVideoTrack();
//       localTracksRef.current = { audio: localAudioTrack, video: localVideoTrack };

//       localVideoTrack.play(localVideoRef.current);
//       await client.publish([localAudioTrack, localVideoTrack]);

//       client.on("user-published", async (user, mediaType) => {
//         await client.subscribe(user, mediaType);
//         if (mediaType === "video") user.videoTrack.play(remoteVideoRef.current);
//         if (mediaType === "audio") user.audioTrack.play();
//       });

//       client.on("user-left", () => console.log("Remote user left"));

//       setJoined(true);
//       startCallTimer();
//     } catch (err) {
//       console.error("Agora connection error:", err);
//     }
//   };
//    const startAgoraCall = async (meeting) => {
//     const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
//     clientRef.current = client;

//     try {
//       await client.join(
//         meeting.appId,
//         meeting.channelName,
//         meeting.token,
//         null
//       );

//       startTimeRef.current = new Date();
//       setCallDuration(0);

//       const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
//       const videoTrack = await AgoraRTC.createCameraVideoTrack();
//       localTracksRef.current = { audio: audioTrack, video: videoTrack };

//       videoTrack.play(localVideoRef.current);
//       await client.publish([audioTrack, videoTrack]);

//       client.on("user-published", async (user, mediaType) => {
//         await client.subscribe(user, mediaType);
//         if (mediaType === "video") user.videoTrack.play(remoteVideoRef.current);
//         if (mediaType === "audio") user.audioTrack.play();
//       });

//       // 🔴 TOKEN EXPIRED → END CALL (NO AUTO RENEW)
//       client.on("connection-state-change", (_, __, reason) => {
//         if (reason === "TOKEN_EXPIRED") {
//           alert("Consultation ended");
//           leaveAgora();
//         }
//       });

//       setJoined(true);
//       startCallTimer();
//     } catch (err) {
//       console.error("Agora error:", err);
//     }
//   };

//   const leaveAgora = async () => {
//     if (timerRef.current) clearInterval(timerRef.current);
    
//     if (!clientRef.current) return;

//     const { audio, video } = localTracksRef.current;
//     if (audio) audio.close();
//     if (video) video.close();
//     await clientRef.current.leave();
//     setJoined(false);

//     if (activeMeeting) {
//       try {
//         await fetch(`${API_BASE}/meetings/${activeMeeting._id}/end`, {
//           method: "PUT",
//           headers: { "Content-Type": "application/json" },
//         });
//         setMeetings((prev) =>
//           prev.map((m) => (m._id === activeMeeting._id ? { ...m, status: "ended" } : m))
//         );
//       } catch (err) {
//         console.error("Error ending meeting:", err);
//       }
//     }
    
//     setActiveMeeting(null);
//     setCallDuration(0);
//     startTimeRef.current = null;
//   };

//   const toggleAudio = async () => {
//     const audioTrack = localTracksRef.current.audio;
//     if (!audioTrack) return;
//     await audioTrack.setEnabled(!audioEnabled);
//     setAudioEnabled(!audioEnabled);
//   };

//   const toggleVideo = async () => {
//     const videoTrack = localTracksRef.current.video;
//     if (!videoTrack) return;
//     await videoTrack.setEnabled(!videoEnabled);
//     setVideoEnabled(!videoEnabled);
//   };

//   const formatDuration = (seconds) => {
//     const h = Math.floor(seconds / 3600);
//     const m = Math.floor((seconds % 3600) / 60);
//     const s = seconds % 60;
//     return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
//   };

//   const formatTime = (date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

//   const styles = {
//     container: {
//       padding: '16px',
//       fontFamily: 'system-ui, -apple-system, sans-serif',
//       maxWidth: '1200px',
//       margin: '0 auto',
//       minHeight: 'auto',
//       //backgroundColor: '#f5f5f5'
//     },
//     header: {
//       fontSize: 'clamp(20px, 4vw, 28px)',
//       marginBottom: '20px',
//       color: '#333'
//     },
//     meetingCard: {
//       border: '1px solid #ddd',
//       borderRadius: '12px',
//       padding: '16px',
//       marginBottom: '12px',
//       backgroundColor: '#fff',
//       boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
//       transition: 'transform 0.2s'
//     },
//     meetingTitle: {
//       fontSize: 'clamp(14px, 2.5vw, 18px)',
//       fontWeight: 'bold',
//       marginBottom: '8px',
//       color: '#222'
//     },
//     status: {
//       fontSize: 'clamp(12px, 2vw, 14px)',
//       color: '#666',
//       marginBottom: '12px'
//     },
//     buttonGroup: {
//       display: 'flex',
//       gap: '8px',
//       flexWrap: 'wrap'
//     },
//     button: {
//       padding: '10px 16px',
//       border: 'none',
//       borderRadius: '8px',
//       fontSize: 'clamp(12px, 2vw, 14px)',
//       cursor: 'pointer',
//       fontWeight: '500',
//       transition: 'all 0.2s',
//       flex: '1',
//       minWidth: '100px'
//     },
//     acceptBtn: {
//       backgroundColor: '#10b981',
//       color: '#fff'
//     },
//     declineBtn: {
//       backgroundColor: '#ef4444',
//       color: '#fff'
//     },
//     joinBtn: {
//       backgroundColor: '#3b82f6',
//       color: '#fff'
//     },
//     callContainer: {
//       backgroundColor: '#fff',
//       borderRadius: '12px',
//       padding: '20px',
//       boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
//     },
//     callHeader: {
//       marginBottom: '16px'
//     },
//     callTitle: {
//       fontSize: 'clamp(18px, 3vw, 24px)',
//       marginBottom: '8px',
//       color: '#222'
//     },
//     timeInfo: {
//       fontSize: 'clamp(12px, 2vw, 14px)',
//       color: '#666',
//       display: 'flex',
//       flexDirection: 'column',
//       gap: '4px'
//     },
//     videoGrid: {
//       display: 'grid',
//       gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
//       gap: '12px',
//       marginTop: '16px',
//       marginBottom: '16px'
//     },
//     videoBox: {
//       width: '100%',
//       aspectRatio: '4/3',
//       backgroundColor: '#000',
//       borderRadius: '12px',
//       overflow: 'hidden',
//       position: 'relative'
//     },
//     videoLabel: {
//       position: 'absolute',
//       bottom: '8px',
//       left: '8px',
//       backgroundColor: 'rgba(0,0,0,0.7)',
//       color: '#fff',
//       padding: '4px 8px',
//       borderRadius: '4px',
//       fontSize: '12px',
//       zIndex: 1
//     },
//     controls: {
//       display: 'flex',
//       gap: '8px',
//       flexWrap: 'wrap',
//       marginTop: '16px'
//     },
//     controlBtn: {
//       padding: '12px 20px',
//       border: 'none',
//       borderRadius: '8px',
//       fontSize: 'clamp(12px, 2vw, 14px)',
//       cursor: 'pointer',
//       fontWeight: '500',
//       transition: 'all 0.2s',
//       flex: '1',
//       minWidth: '120px'
//     },
//     muteBtn: {
//       backgroundColor: audioEnabled ? '#6b7280' : '#ef4444',
//       color: '#fff'
//     },
//     videoBtn: {
//       backgroundColor: videoEnabled ? '#6b7280' : '#ef4444',
//       color: '#fff'
//     },
//     leaveBtn: {
//       backgroundColor: '#dc2626',
//       color: '#fff'
//     },
//     emptyState: {
//       textAlign: 'center',
//       padding: '40px 20px',
//       color: '#666',
//       fontSize: 'clamp(14px, 2.5vw, 16px)'
//     },
//     connecting: {
//       textAlign: 'center',
//       padding: '20px',
//       color: '#666',
//       fontSize: '14px'
//     },
//     badge: {
//       display: 'inline-block',
//       padding: '4px 12px',
//       borderRadius: '12px',
//       fontSize: '12px',
//       fontWeight: '600',
//       textTransform: 'capitalize'
//     },
//     startTimeInfo: {
//       fontSize: 'clamp(12px, 2vw, 14px)', 
//       color: '#059669',
//       marginBottom: '8px',
//       fontWeight: '500'
//     },
//   };

//   const getStatusBadge = (status) => {
//     const colors = {
//       pending: { bg: '#fef3c7', color: '#92400e' },
//       accepted: { bg: '#d1fae5', color: '#065f46' },
//       declined: { bg: '#fee2e2', color: '#991b1b' },
//       ended: { bg: '#e5e7eb', color: '#374151' }
//     };
//     const c = colors[status] || colors.pending;
//     return (
//       <span style={{ ...styles.badge, backgroundColor: c.bg, color: c.color }}>
//         {status}
//       </span>
//     );
//   };

//   return (
//     <div style={styles.container}>
//       <h2 style={styles.header}>Video Meeting Manager</h2>
//   {!activeMeeting && meetings.length > 0 && (
//       <div style={{ marginBottom: "8px" }}>
//         <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
//        <button
//   onClick={handleDeleteSelected}
//   disabled={selectedIds.length === 0}
//   title={selectedIds.length === 0 ? "Select a meeting to delete" : ""}
//   style={{
//     ...styles.button,
//     backgroundColor: selectedIds.length === 0 ? "#9CA3AF" : "#EF4444",
//     color: "#FFFFFF",
//     cursor: selectedIds.length === 0 ? "not-allowed" : "pointer",
//     opacity: selectedIds.length === 0 ? 0.7 : 1,
//   }}
// >
//   🗑 Delete Selected
// </button>


//           {/* <button
//             onClick={handleDeleteAll}
//             style={{ ...styles.button, backgroundColor: "#ff5050", color: "#fff" }}
//           >
//             🚨 Delete All
//           </button> */}
//         </div>
//       </div>
//     )}
//  {!activeMeeting && meetings.length > 0 && (
//   <div>
//     {(showAll ? meetings : meetings.slice(0, 5)).map((m) => (
//       <div key={m._id} style={styles.meetingCard}>
//         <input
//   type="checkbox"
//   checked={selectedIds.includes(m._id)}
//   onChange={(e) => {
//     setSelectedIds((prev) =>
//       e.target.checked
//         ? [...prev, m._id]
//         : prev.filter((id) => id !== m._id)
//     );
//   }}
//   style={{ marginRight: "8px" }}
// />

//         <div style={styles.meetingTitle}>{m.topic}</div>

//         {/* ✅ USER DETAILS */}
//         {m.userId && (
//           <div style={{ fontSize: "14px", marginBottom: "6px", color: "#333" }}>
//             Requested by: <strong>{m.userId.name}</strong>
//             <br />
//             {m.userId.email}
//             <br />
//           </div>
//         )}

//         <div style={styles.status}>
//           Status: {getStatusBadge(m.status)}
//         </div>

//         {m.status === "pending" && (
//           <div style={styles.buttonGroup}>
//             <button
//               onClick={() => handleAccept(m._id)}
//               style={{ ...styles.button, ...styles.acceptBtn }}
//             >
//               ✓ Accept
//             </button>
//             <button
//               onClick={() => handleDecline(m._id)}
//               style={{ ...styles.button, ...styles.declineBtn }}
//             >
//               ✕ Decline
//             </button>
//             <button
//   onClick={() => handleDeleteOne(m._id)}
//   style={{
//     ...styles.button,
//     backgroundColor: "#6b7280",
//     color: "#fff",
//     marginTop: "8px",
//   }}
// >
//   🗑 Delete
// </button>

//           </div>
//         )}

//         {m.status === "accepted" && (
//           <>
//             {m.startTime && (
//               <div style={styles.startTimeInfo}>
//                 🕒 Meeting Started: {new Date(m.startTime).toLocaleString('en-IN', { 
//                   hour: '2-digit', 
//                   minute: '2-digit',
//                   second: '2-digit',
//                   hour12: true,
//                   day: '2-digit',
//                   month: 'short',
//                   year: 'numeric'
//                 })}
//               </div>
//             )}
//             <button
//               onClick={() => handleJoin(m)}
//               style={{ ...styles.button, ...styles.joinBtn }}
//             >
//               Join Meeting →
//             </button>
//           </>
//         )}
//       </div>
//     ))}

//     {/* ✅ Show More / Show Less Button */}
// {meetings.length > 5 && (
//   <button
//     onClick={() => setShowAll(!showAll)}
//     style={{
//       marginTop: "16px",
//       padding: "12px 20px",
//       backgroundColor: "#ffffff",
//       color: "#111",
//       border: "1px solid #ccc",
//       borderRadius: "50px",
//       cursor: "pointer",
//       fontSize: "16px",
//       width: "fit-content",
//       minWidth: "140px",
//       alignSelf: "center",
//       display: "block",
//       marginLeft: "auto",
//       marginRight: "auto",
//       boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
//       transition: "all 0.25s ease",
//       touchAction: "manipulation"
//     }}
//     onMouseDown={(e) => {
//       e.target.style.transform = "scale(0.96)";
//       e.target.style.backgroundColor = "#f7f7f7";
//     }}
//     onMouseUp={(e) => {
//       e.target.style.transform = "scale(1)";
//       e.target.style.backgroundColor = "#ffffff";
//     }}
//   >
//     {showAll ? "Show Less" : "Show More"}
//   </button>
// )}



//   </div>
// )}



//       {activeMeeting && (
//         <div style={styles.callContainer}>
//           <div style={styles.callHeader}>
//             <h3 style={styles.callTitle}>{activeMeeting.topic}</h3>
//             <div style={styles.timeInfo}>
//               {startTimeRef.current && (
//                 <>
//                   <div>Started: {formatTime(startTimeRef.current)}</div>
//                   <div>Duration: {formatDuration(callDuration)}</div>
//                 </>
//               )}
//             </div>
//           </div>

//           <div style={styles.videoGrid}>
//             <div style={styles.videoBox}>
//               <div ref={localVideoRef} style={{ width: '100%', height: '100%' }} />
//               <div style={styles.videoLabel}>You</div>
//             </div>
//             <div style={styles.videoBox}>
//               <div ref={remoteVideoRef} style={{ width: '100%', height: '100%' }} />
//               <div style={styles.videoLabel}>{activeMeeting.userId.name}</div>
//             </div>
//           </div>

//           {!joined && <div style={styles.connecting}>Connecting...</div>}

//           <div style={styles.controls}>
//             <button
//               onClick={toggleAudio}
//               style={{ ...styles.controlBtn, ...styles.muteBtn }}
//             >
//               {audioEnabled ? "🔊 Mute" : "🔇 Unmute"}
//             </button>
//             <button
//               onClick={toggleVideo}
//               style={{ ...styles.controlBtn, ...styles.videoBtn }}
//             >
//               {videoEnabled ? "📹 Stop Video" : "📹 Start Video"}
//             </button>
//             <button
//               onClick={leaveAgora}
//               style={{ ...styles.controlBtn, ...styles.leaveBtn }}
//             >
//               📞 Leave Call
//             </button>
//           </div>
//         </div>
//       )}

//       {loading && (
//          <div className="flex flex-col items-center justify-center py-20">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
//           <p className="text-gray-600">Loading meeting ...</p>
//         </div>
        
//       )}
//       {!loading && !activeMeeting && meetings.length === 0 && (
//   <div style={styles.emptyState}>
//     <h3 style={{ marginBottom: "8px" }}>📭 No Meetings Yet</h3>
//     <p>New consultation requests will appear here.</p>
//   </div>
// )}

//     </div>
//   );
// };

// export default NotificationsManager;



import React, { useEffect, useState, useRef, useCallback } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import { API_BASE } from "../../constant/Constant";

const NotificationsManager = () => {
  const [meetings, setMeetings] = useState([]);
  const [activeMeeting, setActiveMeeting] = useState(null);
  const[loading,setLoading]=useState(false);
  const [joined, setJoined] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
const [showForm, setShowForm] = useState(false);
const [users, setUsers] = useState([]);
const [userSearch, setUserSearch] = useState("");
const [editingMeeting, setEditingMeeting] = useState(null);
const [form, setForm] = useState({
  topic: "",
  userId: "",
  date: "",
  time: "",
});
const [showAll, setShowAll] = useState(false);

  const clientRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localTracksRef = useRef({ audio: null, video: null });
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
const fetchMeetings = useCallback(async () => {
  try {
    const res = await fetch(`${API_BASE}/meetings`);
    const data = await res.json();

    if (!data?.meetings) return;

    const sorted = [...data.meetings].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    setMeetings((prev) => {
      // 🔥 Prevent re-render if nothing changed
      if (prev.length === sorted.length) {
        const same = prev.every(
          (m, i) =>
            m._id === sorted[i]._id &&
            m.status === sorted[i].status
        );
        if (same) return prev;
      }
      return sorted;
    });
  } catch (err) {
    console.error("Error fetching meetings:", err);
  }
}, []);

const fetchUsers = async (search = "") => {
  try {
    const token = localStorage.getItem("token");

    const url = search
      ? `${API_BASE}/admin/users?search=${search}&limit=20`
      : `${API_BASE}/admin/users?limit=20`;

    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (data?.success) {
      setUsers(data.data.users);
    }
  } catch (err) {
    console.error("User fetch error:", err);
  }
};

  useEffect(() => {
  setLoading(true);
  fetchMeetings().finally(() => setLoading(false));

  const interval = setInterval(fetchMeetings, 10000);

  return () => {
    clearInterval(interval);
    if (timerRef.current) clearInterval(timerRef.current);
  };
}, [fetchMeetings]);
useEffect(() => {
  if (showForm && !editingMeeting) {
    fetchUsers(); // ✅ initial users
  }
}, [showForm, editingMeeting]);


const handleDeleteOne = async (id) => {
  if (!window.confirm("Delete this meeting permanently?")) return;

  await fetch(`${API_BASE}/meetings`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });

  setMeetings((prev) => prev.filter((m) => m._id !== id));
};


const handleDeleteSelected = async () => {
  if (selectedIds.length === 0) return;

  // 🔹 Get selected meetings details
  const selectedMeetings = meetings.filter((m) =>
    selectedIds.includes(m._id)
  );

  // 🔹 Build readable confirmation text
  const details = selectedMeetings
    .map(
      (m, i) =>
        `${i + 1}. ${m.userId?.name || "Unknown"} (${m.userId?.email || "No email"})`
    )
    .join("\n");

  const confirmMessage = `Delete selected meetings permanently?\n\n${details}`;

  if (!window.confirm(confirmMessage)) return;

  await fetch(`${API_BASE}/meetings`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids: selectedIds }),
  });

  setMeetings((prev) =>
    prev.filter((m) => !selectedIds.includes(m._id))
  );
  setSelectedIds([]);
};

// ✅ IST → UTC
// const convertToUTCISOString = (date, time) => {
//   const [year, month, day] = date.split("-");
//   const [hour, minute] = time.split(":");

//   const local = new Date(year, month - 1, day, hour, minute);
//   return new Date(local.getTime() - 5.5 * 60 * 60 * 1000).toISOString();
// };
const convertToUTCISOString = (date, time) => {
  return new Date(`${date}T${time}:00`).toISOString();
};


// ✅ UTC → IST (for edit form)
const toIST = (utcDate) => {
  const d = new Date(utcDate);
  return new Date(d.getTime() + 5.5 * 60 * 60 * 1000);
};
const handleSubmit = async () => {
  if (!form.topic || !form.userId || !form.date || !form.time) {
    alert("All fields required");
    return;
  }

  const startTime = convertToUTCISOString(form.date, form.time);

  const expire = new Date(new Date(startTime).getTime() + 30 * 60000);

  const payload = {
    topic: form.topic.trim(),
    userId: form.userId.trim(),
    startTime,
    expireAt: expire.toISOString(),
    status: "accepted",
  };

  try {
    let res;

    if (editingMeeting) {
      res = await fetch(`${API_BASE}/meetings/${editingMeeting._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      res = await fetch(`${API_BASE}/meetings/admin-create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    const data = await res.json();

    if (data.success) {
      alert(editingMeeting ? "Updated!" : "Created!");
      setShowForm(false);
      setEditingMeeting(null);
      setForm({ topic: "", userId: "", date: "", time: "" }); // ✅ reset
      fetchMeetings();
    }
  } catch (err) {
    console.error(err);
  }
};
const handleDeleteAll = async () => {
  if (!window.confirm("⚠️ Delete ALL meetings permanently?")) return;

  await fetch(`${API_BASE}/meetings`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ all: true }),
  });

  setMeetings([]);
  setSelectedIds([]);
};

  const handleAccept = async (meetingId) => {
    try {
      const res = await fetch(`${API_BASE}/meetings/${meetingId}/accept`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data?.success) {
        setMeetings((prev) =>
          prev.map((m) => (m._id === meetingId ? { ...m, status: "accepted" } : m))
        );
      }
    } catch (err) {
      console.error("Error accepting meeting:", err);
    }
  };

  const handleDecline = async (meetingId) => {
    try {
      await fetch(`${API_BASE}/meetings/${meetingId}/decline`, { 
        method: "PUT",
        headers: { "Content-Type": "application/json" }
      });
      setMeetings((prev) =>
        prev.map((m) => (m._id === meetingId ? { ...m, status: "declined" } : m))
      );
    } catch (err) {
      console.error("Error declining meeting:", err);
    }
  };
const handleJoin = async (meeting) => {
  try {
    const res = await fetch(
      `${API_BASE}/meetings/join/${meeting._id}`
    );
    const data = await res.json();

    if (!data.success) {
      alert(data.message || "Unable to join meeting");
      return;
    }

    const enrichedMeeting = {
      ...meeting,
      token: data.token,
      appId: data.appId,
      channelName: data.channelName,
    };

    setActiveMeeting(enrichedMeeting);
    startAgoraCall(enrichedMeeting);

  } catch (err) {
    console.error("Join failed:", err);
  }
};

  const handleJoin2 = (meeting) => {
    setActiveMeeting(meeting);
    startTimeRef.current = new Date();
    setCallDuration(0);
    startAgoraCall(meeting);
  };

 

    const startCallTimer = useCallback(() => {
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor(
        (new Date() - startTimeRef.current) / 1000
      );
      setCallDuration(elapsed);
    }, 1000);
  }, []);
  const startAgoraCall2 = async (meeting) => {
    if (!meeting.appId || !meeting.token || !meeting.channelName) return;

    const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    clientRef.current = client;

    try {
      await client.join(meeting.appId, meeting.channelName, meeting.token, null);

      const localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      const localVideoTrack = await AgoraRTC.createCameraVideoTrack();
      localTracksRef.current = { audio: localAudioTrack, video: localVideoTrack };

      localVideoTrack.play(localVideoRef.current);
      await client.publish([localAudioTrack, localVideoTrack]);

      client.on("user-published", async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        if (mediaType === "video") user.videoTrack.play(remoteVideoRef.current);
        if (mediaType === "audio") user.audioTrack.play();
      });

      client.on("user-left", () => console.log("Remote user left"));

      setJoined(true);
      startCallTimer();
    } catch (err) {
      console.error("Agora connection error:", err);
    }
  };
   const startAgoraCall = async (meeting) => {
    const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    clientRef.current = client;

    try {
      await client.join(
        meeting.appId,
        meeting.channelName,
        meeting.token,
        null
      );

      startTimeRef.current = new Date();
      setCallDuration(0);

      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      const videoTrack = await AgoraRTC.createCameraVideoTrack();
      localTracksRef.current = { audio: audioTrack, video: videoTrack };

      videoTrack.play(localVideoRef.current);
      await client.publish([audioTrack, videoTrack]);

      client.on("user-published", async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        if (mediaType === "video") user.videoTrack.play(remoteVideoRef.current);
        if (mediaType === "audio") user.audioTrack.play();
      });

      // 🔴 TOKEN EXPIRED → END CALL (NO AUTO RENEW)
      client.on("connection-state-change", (_, __, reason) => {
        if (reason === "TOKEN_EXPIRED") {
          alert("Consultation ended");
          leaveAgora();
        }
      });

      setJoined(true);
      startCallTimer();
    } catch (err) {
      console.error("Agora error:", err);
    }
  };

  const leaveAgora = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    if (!clientRef.current) return;

    const { audio, video } = localTracksRef.current;
    if (audio) audio.close();
    if (video) video.close();
    await clientRef.current.leave();
    setJoined(false);

    if (activeMeeting) {
      try {
        await fetch(`${API_BASE}/meetings/${activeMeeting._id}/end`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
        });
        setMeetings((prev) =>
          prev.map((m) => (m._id === activeMeeting._id ? { ...m, status: "ended" } : m))
        );
      } catch (err) {
        console.error("Error ending meeting:", err);
      }
    }
    
    setActiveMeeting(null);
    setCallDuration(0);
    startTimeRef.current = null;
  };

  const toggleAudio = async () => {
    const audioTrack = localTracksRef.current.audio;
    if (!audioTrack) return;
    await audioTrack.setEnabled(!audioEnabled);
    setAudioEnabled(!audioEnabled);
  };

  const toggleVideo = async () => {
    const videoTrack = localTracksRef.current.video;
    if (!videoTrack) return;
    await videoTrack.setEnabled(!videoEnabled);
    setVideoEnabled(!videoEnabled);
  };

  const formatDuration = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatTime = (date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });


  const styles = {
    container: {
      padding: '16px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      maxWidth: '1200px',
      margin: '0 auto',
      minHeight: 'auto',
      //backgroundColor: '#f5f5f5'
    },
    header: {
      fontSize: 'clamp(20px, 4vw, 28px)',
      marginBottom: '20px',
      color: '#333'
    },
    meetingCard: {
      border: '1px solid #ddd',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '12px',
      backgroundColor: '#fff',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      transition: 'transform 0.2s'
    },
    meetingTitle: {
      fontSize: 'clamp(14px, 2.5vw, 18px)',
      fontWeight: 'bold',
      marginBottom: '8px',
      color: '#222'
    },
    status: {
      fontSize: 'clamp(12px, 2vw, 14px)',
      color: '#666',
      marginBottom: '12px'
    },
    buttonGroup: {
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap'
    },
    button: {
      padding: '10px 16px',
      border: 'none',
      borderRadius: '8px',
      fontSize: 'clamp(12px, 2vw, 14px)',
      cursor: 'pointer',
      fontWeight: '500',
      transition: 'all 0.2s',
      flex: '1',
      minWidth: '100px',  marginRight: '8px' 
    },
    acceptBtn: {
      backgroundColor: '#10b981',
      color: '#fff'
    },
    declineBtn: {
      backgroundColor: '#ef4444',
      color: '#fff'
    },
    joinBtn: {
      backgroundColor: '#3b82f6',
      color: '#fff'
    },
   editbutton: {
  backgroundColor: '#c4c4c4', // light grey (cleaner)
  color: '#374151'
},
    callContainer: {
      backgroundColor: '#fff',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
    callHeader: {
      marginBottom: '16px'
    },
    callTitle: {
      fontSize: 'clamp(18px, 3vw, 24px)',
      marginBottom: '8px',
      color: '#222'
    },
    timeInfo: {
      fontSize: 'clamp(12px, 2vw, 14px)',
      color: '#666',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
    },
    videoGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '12px',
      marginTop: '16px',
      marginBottom: '16px'
    },
    videoBox: {
      width: '100%',
      aspectRatio: '4/3',
      backgroundColor: '#000',
      borderRadius: '12px',
      overflow: 'hidden',
      position: 'relative'
    },
    videoLabel: {
      position: 'absolute',
      bottom: '8px',
      left: '8px',
      backgroundColor: 'rgba(0,0,0,0.7)',
      color: '#fff',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      zIndex: 1
    },
    controls: {
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap',
      marginTop: '16px'
    },
    controlBtn: {
      padding: '12px 20px',
      border: 'none',
      borderRadius: '8px',
      fontSize: 'clamp(12px, 2vw, 14px)',
      cursor: 'pointer',
      fontWeight: '500',
      transition: 'all 0.2s',
      flex: '1',
      minWidth: '120px'
    },
    muteBtn: {
      backgroundColor: audioEnabled ? '#6b7280' : '#ef4444',
      color: '#fff'
    },
    videoBtn: {
      backgroundColor: videoEnabled ? '#6b7280' : '#ef4444',
      color: '#fff'
    },
    leaveBtn: {
      backgroundColor: '#dc2626',
      color: '#fff'
    },
    emptyState: {
      textAlign: 'center',
      padding: '40px 20px',
      color: '#666',
      fontSize: 'clamp(14px, 2.5vw, 16px)'
    },
    connecting: {
      textAlign: 'center',
      padding: '20px',
      color: '#666',
      fontSize: '14px'
    },
    badge: {
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '600',
      textTransform: 'capitalize'
    },
    startTimeInfo: {
      fontSize: 'clamp(12px, 2vw, 14px)', 
      color: '#059669',
      marginBottom: '8px',
      fontWeight: '500'
    },
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: "bg-amber-100 text-amber-800",
      accepted: "bg-green-100 text-green-700",
      declined: "bg-red-100 text-red-700",
      ended: "bg-gray-100 text-gray-600",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs capitalize ${colors[status] || colors.pending}`}>
        {status}
      </span>
    );
  };
const modalOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 999,
  padding: "10px",
};

const modalBox = {
  width: "100%",
  maxWidth: "500px",
  maxHeight: "90vh",
  background: "#fff",
  borderRadius: "16px",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  animation: "scaleIn 0.25s ease",
};

const modalHeader = {
  padding: "16px 20px",
  borderBottom: "1px solid #eee",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const modalBody = {
  padding: "20px",
  overflowY: "auto",
};

const modalFooter = {
  padding: "16px 20px",
  borderTop: "1px solid #eee",
  display: "flex",
  gap: "10px",
};

const closeBtn = {
  border: "none",
  background: "#f3f4f6",
  borderRadius: "8px",
  padding: "6px 10px",
  cursor: "pointer",
};

// Modal form styles
const modernInput = {
  width: '100%',
  padding: '12px 16px',
  marginBottom: '16px',
  border: '1px solid #e5e7eb',
  borderRadius: '12px',
  fontSize: '14px',
  outline: 'none',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box',
};

const readOnlyBox = {
  padding: '12px 16px',
  backgroundColor: '#f9fafb',
  borderRadius: '12px',
  marginBottom: '16px',
  border: '1px solid #e5e7eb',
};

const createBtn = {
  flex: 1,
  padding: '12px',
  backgroundColor: '#3b82f6',
  color: '#fff',
  border: 'none',
  borderRadius: '12px',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'background 0.2s',
};

const cancelBtn2 = {
  flex: 1,
  padding: '12px',
  backgroundColor: '#f3f4f6',
  color: '#111',
  border: 'none',
  borderRadius: '12px',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'background 0.2s',
};
const fieldLabel = {
  display: "block",
  fontSize: 12,
  color: "#6b7280",
  marginBottom: 6,
};

const chipBox = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "10px 14px",
  background: "#f3f4f6",
  borderRadius: "12px",
  border: "1px solid #e5e7eb",
  fontSize: 14,
};

const chipClose = {
  border: "none",
  background: "none",
  cursor: "pointer",
  color: "#9ca3af",
  fontSize: 15,
  padding: "0 2px",
  lineHeight: 1,
};

const dropdownBox = {
  position: "absolute" as const,
  top: "calc(100% + 4px)",
  left: 0,
  right: 0,
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: "12px",
  zIndex: 200,
  maxHeight: 180,
  overflowY: "auto" as const,
  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
};

const dropdownItem = {
  padding: "10px 14px",
  cursor: "pointer",
  borderBottom: "1px solid #f3f4f6",
};
  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Meetings</h2>
      <p style={{ marginTop: "-12px", marginBottom: "16px", color: "#64748b", fontSize: "14px" }}>
        Schedule a call, then join it from the list. Delete is only for meetings you have selected.
      </p>

      <div style={{ marginBottom: "8px" }}>
        <div style={{ display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
       <button
 onClick={() => {
  setEditingMeeting(null);
  setForm({ topic: "", userId: "", date: "", time: "" });
  setUserSearch("");
  setUsers([]);
  setShowForm(true);
}}
  style={{ ...styles.button, backgroundColor: "#122033", color: "#fff" }}
>
  Add meeting
</button>
       <button
  onClick={handleDeleteSelected}
  disabled={selectedIds.length === 0}
  title={selectedIds.length === 0 ? "Select a meeting to delete" : ""}
  style={{
    ...styles.button,
    backgroundColor: selectedIds.length === 0 ? "#9CA3AF" : "#EF4444",
    color: "#FFFFFF",
    cursor: selectedIds.length === 0 ? "not-allowed" : "pointer",
    opacity: selectedIds.length === 0 ? 0.7 : 1,
  }}
>
  Delete selected
</button>
          {/* <button
            onClick={handleDeleteAll}
            style={{ ...styles.button, backgroundColor: "#ff5050", color: "#fff" }}
          >
            🚨 Delete All
          </button> */}
        </div>
      </div>
   
  

{showForm && (
  <div style={modalOverlay} onClick={() => setShowForm(false)}>
    <div style={modalBox} onClick={(e) => e.stopPropagation()}>

      {/* ❌ CLOSE BUTTON */}
      <div style={modalHeader}>
        <h3 style={{ margin: 0 }}>
          {editingMeeting ? "✏️ Edit Meeting" : "➕ Create Meeting"}
        </h3>
        <button onClick={() => setShowForm(false)} style={closeBtn}>✕</button>
      </div>

      <div style={modalBody}>

        {/* 🔹 TOPIC */}
        <label style={fieldLabel}>Topic</label>
        <input
          placeholder="Meeting Topic"
          value={form.topic}
          onChange={(e) => setForm({ ...form, topic: e.target.value })}
          style={modernInput}
        />

        {/* 🔍 USER SELECT */}
        {!editingMeeting && (
          <div style={{ position: "relative", marginBottom: 16 }}>
            <label style={fieldLabel}>Select User</label>

            {form.userId ? (
              <div style={chipBox}>
                <div>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{userSearch.split("(")[0].trim()}</span>
                  <span style={{ color: "#9ca3af", fontSize: 12, marginLeft: 8 }}>
                    {userSearch.match(/\(([^)]+)\)/)?.[1] ?? ""}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setForm({ ...form, userId: "" });
                    setUserSearch("");
                    setUsers([]);
                  }}
                  style={chipClose}
                >
                  ✕
                </button>
              </div>
            ) : (
              <>
                <input
                  placeholder="Search user..."
                  value={userSearch}
                  onChange={(e) => {
                    const value = e.target.value;
                    setUserSearch(value);
                    fetchUsers(value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                  style={modernInput}
                />

                {showDropdown && users.length > 0 && (
                  <div style={dropdownBox}>
                    {users.map((u) => (
                      <div
                        key={u._id}
                        onMouseDown={() => {
                          setForm({ ...form, userId: u._id });
                          setUserSearch(`${u.name} (${u.email})`);
                          setShowDropdown(false);
                        }}
                        style={dropdownItem}
                      >
                        <div style={{ fontWeight: 600 }}>{u.name}</div>
                        <div style={{ fontSize: 12, color: "#6b7280" }}>{u.email}</div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* 👤 EDIT MODE */}
        {editingMeeting && (
          <div style={readOnlyBox}>
            <strong>{editingMeeting.userId?.name}</strong>
            <div style={{ fontSize: 12, color: "#6b7280" }}>
              {editingMeeting.userId?.email}
            </div>
          </div>
        )}

        {/* 📅 DATE + TIME */}
        <label style={fieldLabel}>Pick Date and Time</label>
        <div style={{ display: "flex", gap: 10 }}>
          <input
  type="date"
  onClick={(e) => e.target.showPicker()}
  min={new Date().toISOString().split("T")[0]}
  value={form.date}
  onChange={(e) => setForm({ ...form, date: e.target.value })}
  style={{ ...modernInput, flex: 1 }}
/>

<input
  type="time"
  onClick={(e) => e.target.showPicker()}
  value={form.time}
  onChange={(e) => setForm({ ...form, time: e.target.value })}
  style={{ ...modernInput, flex: 1 }}
/>

        </div>

      </div>

      {/* 🔘 FOOTER */}
      <div style={modalFooter}>
        <button style={createBtn} onClick={handleSubmit}>
          {editingMeeting ? "Update" : "Create"}
        </button>
        <button style={cancelBtn2} onClick={() => setShowForm(false)}>
          Cancel
        </button>
      </div>

    </div>
  </div>
)}


 {!activeMeeting && meetings.length > 0 && (
  <div>
    <div className="bg-white border border-line rounded-lg overflow-x-auto">
    <table className="w-full text-sm">
      <thead className="bg-gray-50 text-left text-gray-500">
        <tr>
          <th className="px-4 py-3 font-medium w-10"></th>
          <th className="px-4 py-3 font-medium">Topic</th>
          <th className="px-4 py-3 font-medium">Patient</th>
          <th className="px-4 py-3 font-medium">Email</th>
          <th className="px-4 py-3 font-medium">When</th>
          <th className="px-4 py-3 font-medium">Status</th>
          <th className="px-4 py-3 font-medium text-right">Actions</th>
        </tr>
      </thead>
      <tbody>
    {(showAll ? meetings : meetings.slice(0, 5)).map((m) => (
      <tr key={m._id} className="border-t">
        <td className="px-4 py-3">
        <input
  type="checkbox"
  checked={selectedIds.includes(m._id)}
  onChange={(e) => {
    setSelectedIds((prev) =>
      e.target.checked
        ? [...prev, m._id]
        : prev.filter((id) => id !== m._id)
    );
  }}
/>
        </td>
        <td className="px-4 py-3 font-medium text-gray-900">{m.topic}</td>
        <td className="px-4 py-3 text-gray-600">{m.userId?.name || "—"}</td>
        <td className="px-4 py-3 text-gray-600">{m.userId?.email || "—"}</td>
        <td className="px-4 py-3 text-gray-500">
          {m.startTime
            ? new Date(m.startTime).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true })
            : "—"}
        </td>
        <td className="px-4 py-3">{getStatusBadge(m.status)}</td>
        <td className="px-4 py-3 text-right whitespace-nowrap">
        {m.status === "pending" && (
          <>
            <button type="button" onClick={() => handleAccept(m._id)} className="text-pine font-medium mr-3">Accept</button>
            <button type="button" onClick={() => handleDecline(m._id)} className="text-red-600 font-medium mr-3">Decline</button>
            <button type="button" onClick={() => handleDeleteOne(m._id)} className="text-red-600 font-medium">Delete</button>
          </>
        )}
        {m.status === "accepted" && (
          <>
            <button
              type="button"
              className="text-pine font-medium mr-3"
              onClick={() => {
                const istDate = toIST(m.startTime);
                setEditingMeeting(m);
                setForm({
                  topic: m.topic,
                  userId: m.userId?._id || "",
                  date: istDate.toISOString().split("T")[0],
                  time: istDate.toTimeString().slice(0, 5),
                });
                setShowForm(true);
              }}
            >
              Edit
            </button>
            <button type="button" onClick={() => handleJoin(m)} className="text-pine font-medium">Join</button>
          </>
        )}
        {m.status !== "pending" && m.status !== "accepted" && (
          <button type="button" onClick={() => handleDeleteOne(m._id)} className="text-red-600 font-medium">Delete</button>
        )}
        </td>
      </tr>
    ))}
      </tbody>
    </table>
    </div>

    {/* ✅ Show More / Show Less Button */}
{meetings.length > 5 && (
  <button
    onClick={() => setShowAll(!showAll)}
    style={{
      marginTop: "16px",
      padding: "12px 20px",
      backgroundColor: "#ffffff",
      color: "#111",
      border: "1px solid #ccc",
      borderRadius: "50px",
      cursor: "pointer",
      fontSize: "16px",
      width: "fit-content",
      minWidth: "140px",
      alignSelf: "center",
      display: "block",
      marginLeft: "auto",
      marginRight: "auto",
      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
      transition: "all 0.25s ease",
      touchAction: "manipulation"
    }}
    onMouseDown={(e) => {
      e.target.style.transform = "scale(0.96)";
      e.target.style.backgroundColor = "#f7f7f7";
    }}
    onMouseUp={(e) => {
      e.target.style.transform = "scale(1)";
      e.target.style.backgroundColor = "#ffffff";
    }}
  >
    {showAll ? "Show Less" : "Show More"}
  </button>
)}



  </div>
)}



      {activeMeeting && (
        <div style={styles.callContainer}>
          <div style={styles.callHeader}>
            <h3 style={styles.callTitle}>{activeMeeting.topic}</h3>
            <div style={styles.timeInfo}>
              {startTimeRef.current && (
                <>
                  <div>Started: {formatTime(startTimeRef.current)}</div>
                  <div>Duration: {formatDuration(callDuration)}</div>
                </>
              )}
            </div>
          </div>

          <div style={styles.videoGrid}>
            <div style={styles.videoBox}>
              <div ref={localVideoRef} style={{ width: '100%', height: '100%' }} />
              <div style={styles.videoLabel}>You</div>
            </div>
            <div style={styles.videoBox}>
              <div ref={remoteVideoRef} style={{ width: '100%', height: '100%' }} />
              <div style={styles.videoLabel}>{activeMeeting.userId.name}</div>
            </div>
          </div>

          {!joined && <div style={styles.connecting}>Connecting...</div>}

          <div style={styles.controls}>
            <button
              onClick={toggleAudio}
              style={{ ...styles.controlBtn, ...styles.muteBtn }}
            >
              {audioEnabled ? "🔊 Mute" : "🔇 Unmute"}
            </button>
            <button
              onClick={toggleVideo}
              style={{ ...styles.controlBtn, ...styles.videoBtn }}
            >
              {videoEnabled ? "📹 Stop Video" : "📹 Start Video"}
            </button>
            <button
              onClick={leaveAgora}
              style={{ ...styles.controlBtn, ...styles.leaveBtn }}
            >
              📞 Leave Call
            </button>
          </div>
        </div>
      )}

      {loading && (
         <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading meeting ...</p>
        </div>
        
      )}
      {!loading && !activeMeeting && meetings.length === 0 && (
  <div style={styles.emptyState}>
    <h3 style={{ marginBottom: "8px" }}>📭 No Meetings Yet</h3>
    <p>New consultation requests will appear here.</p>
  </div>
)}

    </div>
  );
};

export default NotificationsManager;