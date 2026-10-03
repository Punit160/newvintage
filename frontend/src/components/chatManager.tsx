// import { useEffect, useState, useRef } from "react";
// import {
//   MessageSquare,
//   Send,
//   ArrowLeft,
//   Loader2,
//   Search,
//   Trash2, // 🗑️ added
// } from "lucide-react";
// import { API_BASE } from "../constant/Constant";
// import { io } from "socket.io-client";

// function App() {
//   const [chats, setChats] = useState([]);
//   const [selected, setSelected] = useState(null);
//   const [reply, setReply] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [sending, setSending] = useState(false);
//   const [search, setSearch] = useState("");
//   const [unreadChats, setUnreadChats] = useState({});
//   const [editingIndex, setEditingIndex] = useState(null);
// const [editText, setEditText] = useState("");
// const [openMenuIndex, setOpenMenuIndex] = useState(null);


//   const [deleting, setDeleting] = useState(false); // 🗑️ added
//   const endRef = useRef(null);

//   const token = localStorage.getItem("token");
//   const [socket, setSocket] = useState(null);
// const SOCKET_URL = "https://vintagecms.cloud";
//   // Connect to socket
//   useEffect(() => {
//     const s = io(SOCKET_URL, {
//       transports: ["websocket"],
//       auth: { token },
//     });
//     setSocket(s);
//     return () => s.disconnect();
//   }, [token]);

//   // Register admin + listen for realtime messages
//   useEffect(() => {
//     if (!socket) return;
//     socket.emit("registerUser", "admin");

//     socket.on("receiveMessage", ({ chatId, message, senderId, timestamp }) => {
//       setChats((prev) => {
//         let updated = [...prev];
//         const index = updated.findIndex((c) => c._id === chatId);

//         if (index !== -1) {
//           updated[index] = {
//             ...updated[index],
//             messages: [
//               ...updated[index].messages,
//               { message, sender: senderId, timestamp },
//             ],
//           };
//           const movedChat = updated.splice(index, 1)[0];
//           updated.unshift(movedChat);
//         }

//         return updated;
//       });

//       if (selected?._id !== chatId) {
//         setUnreadChats((prev) => ({
//           ...prev,
//           [chatId]: true,
//         }));
//       } else {
//         // endRef.current?.scrollIntoView({ behavior: "smooth" });
//       }

//       if (selected?._id === chatId) {
//         setSelected((prev) => ({
//           ...prev,
//           messages: [...prev.messages, { message, sender: senderId, timestamp }],
//         }));
//       }
//     });

//     return () => socket.off("receiveMessage");
//   }, [socket]);
// useEffect(() => {
//   if (!selected) return;

//   const latest = chats.find((c) => c._id === selected._id);
//   if (latest) setSelected(latest);
// }, [chats]);

//   // Fetch chat list
//   useEffect(() => {
//     const fetchChats = async () => {
//       setLoading(true);
//       try {
//         const res = await fetch(`${API_BASE}/chat/admin/all`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         const data = await res.json();
//         if (data.success) {
//           const sorted = data.data.sort((a, b) => {
//             const t1 = new Date(
//               a.messages?.[a.messages.length - 1]?.timestamp || 0
//             ).getTime();
//             const t2 = new Date(
//               b.messages?.[b.messages.length - 1]?.timestamp || 0
//             ).getTime();
//             return t2 - t1;
//           });
//           setChats(sorted);
//         }
//       } catch (e) {
//         console.error(e);
//       }
//       setLoading(false);
//     };
//     fetchChats();
//   }, [token]);

//   // Send message
//   const send = async () => {
//     if (!reply.trim() || !selected) return;
//     setSending(true);

//     try {
//       const res = await fetch(`${API_BASE}/chat/admin/${selected._id}/reply`, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ message: reply }),
//       });

//       const data = await res.json();
//       if (data.success) {
//         const updatedChat = data.data;

//         setSelected((prev) => ({
//           ...updatedChat,
//           user: prev.user,
//         }));

//         setChats((prev) => {
//           let updated = prev.map((c) =>
//             c._id === updatedChat._id ? { ...updatedChat, user: c.user } : c
//           );
//           const index = updated.findIndex((c) => c._id === updatedChat._id);
//           if (index !== -1) {
//             const moved = updated.splice(index, 1)[0];
//             updated.unshift(moved);
//           }
//           return updated;
//         });

//         socket.emit("sendPrivateMessage", {
//           receiverId: selected.user._id,
//           chatId: selected._id,
//           message: reply,
//           senderId: "admin",
//         });

//         setReply("");
//       }
//     } catch (e) {
//       console.error(e);
//     }
//     setSending(false);
//   };
// const saveEdit = async (index) => {
//   if (!editText.trim() || !selected) return;

//   try {
//     const res = await fetch(
//       `${API_BASE}/chat/admin/${selected._id}/message/${index}`,
//       {
//         method: "PATCH",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ message: editText }),
//       }
//     );

//     const data = await res.json();

//     if (data.success) {
//       // ✅ FIX: preserve populated user
//       setChats((prev) =>
//         prev.map((c) =>
//           c._id === selected._id
//             ? { ...data.data, user: c.user }
//             : c
//         )
//       );

//       setSelected((prev) => ({
//         ...data.data,
//         user: prev.user,
//       }));

//       setEditingIndex(null);
//       setEditText("");
//     } else {
//       alert(data.message);
//     }
//   } catch (err) {
//     console.error(err);
//     alert("Error editing message");
//   }
// };


// const deleteMessage = async (index) => {
//   if (!selected) return;
//   if (!window.confirm("Delete this message?")) return;

//   try {
//     const res = await fetch(
//       `${API_BASE}/chat/admin/${selected._id}/message/${index}`,
//       {
//         method: "DELETE",
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );

//     const data = await res.json();

//     if (data.success) {
//       // preserve populated user
//       setChats((prev) =>
//         prev.map((c) =>
//           c._id === selected._id ? { ...data.data, user: c.user } : c
//         )
//       );

//       setSelected((prev) => ({
//         ...data.data,
//         user: prev.user,
//       }));

//       setOpenMenuIndex(null);
//     } else {
//       alert(data.message);
//     }
//   } catch (err) {
//     console.error(err);
//     alert("Error deleting message");
//   }
// };

//   // 🗑️ Delete Chat Function
//   const deleteChat = async (chatId) => {
//     if (!window.confirm("Are you sure you want to delete this chat?")) return;

//     setDeleting(true);
//     try {
//       const res = await fetch(`${API_BASE}/chat/admin/${chatId}`, {
//         method: "DELETE",
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       const data = await res.json();
//       if (data.success) {
//         setChats((prev) => prev.filter((c) => c._id !== chatId));
//         if (selected?._id === chatId) setSelected(null);
//         alert("Chat deleted successfully ✅");
//       } else {
//         alert(data.message || "Failed to delete chat ❌");
//       }
//     } catch (e) {
//       console.error(e);
//       alert("Server error deleting chat ❌");
//     }
//     setDeleting(false);
//   };

//   const filtered = chats.filter((c) =>
//     c.user?.name?.toLowerCase().includes(search.toLowerCase())
//   );

//   return (
//     <div className="h-[calc(100vh-8.5rem)] min-h-[520px] flex bg-white border border-line rounded-lg overflow-hidden">
//       {/* Sidebar */}
//       <aside
//         className={`${
//           selected ? "hidden" : "flex"
//         } md:flex w-full md:w-80 bg-white border-r flex-col`}
//       >
//         <div className="p-4 border-b">
          
//           <div className="flex items-center gap-2 mb-3">
//             <MessageSquare className="text-blue-600" size={24} />
//             <h1 className="text-lg font-semibold text-gray-800">Support Chat</h1>
//           </div>
//           <div className="relative">
//             <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
//             <input
//               type="text"
//               placeholder="Search conversations..."
//               className="w-full pl-10 pr-3 py-2 bg-gray-50 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//             />
//           </div>
//         </div>

//         <div
//           className="flex-1 overflow-y-auto max-h-[calc(100vh-150px)]"
//           style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
//         >
//           <style>
//             {`
//               div::-webkit-scrollbar {
//                 display: none;
//               }
//             `}
//           </style>

//           {loading ? (
//             <div className="flex items-center justify-center h-32">
//               <Loader2 className="animate-spin text-gray-400" />
//             </div>
//           ) : filtered.length === 0 ? (
//             <div className="text-center py-12 text-gray-400 text-sm">
//               No conversations
//             </div>
//           ) : (
//             filtered.map((c) => (
//               <div
//                 key={c._id}
//                 onClick={() => {
//                   setSelected(c);
//                   setUnreadChats((prev) => {
//                     const updated = { ...prev };
//                     delete updated[c._id];
//                     return updated;
//                   });
//                 }}
//                 className={`p-4 border-b cursor-pointer transition ${
//                   selected?._id === c._id
//                     ? "bg-blue-50"
//                     : unreadChats[c._id]
//                     ? "bg-red-100 hover:bg-red-200"
//                     : "hover:bg-gray-50"
//                 }`}
//               >
//                 <div className="flex items-center gap-3">
//                   <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-medium">
//                     {c.user?.name?.[0]?.toUpperCase() || "U"}
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <div className="flex justify-between items-baseline">
//                       <p className="font-medium text-sm truncate">
//                         {c.user?.name || "User"}
//                       </p>
//                       {unreadChats[c._id] && (
//                         <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
//                           NEW
//                         </span>
//                       )}
//                     </div>
//                     <p className="text-xs text-gray-500 truncate">
//                       {c.user?.email}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             ))
//           )}
//         </div>
//       </aside>

//       {/* Chat Area */}
//       {selected ? (
//         <main className="flex-1 flex flex-col">
//           <div className="bg-white border-b p-4 flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <button
//                 onClick={() => setSelected(null)}
//                 className="md:hidden p-1 hover:bg-gray-100 rounded"
//               >
//                 <ArrowLeft size={20} />
//               </button>
//               <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-medium">
//                 {selected.user?.name?.[0]?.toUpperCase() || "U"}
//               </div>
//               <div>
//                 <p className="font-medium text-sm">{selected.user?.name || "User"}</p>
//                 <p className="text-xs text-gray-500">
//                   {selected.user?.email || "user@gmail.com"}
//                 </p>
//               </div>
//             </div>

//             {/* 🗑️ Delete Button */}
//             <button
//               onClick={() => deleteChat(selected._id)}
//               disabled={deleting}
//               className="p-2 hover:bg-red-50 text-red-500 rounded transition"
//               title="Delete chat"
//             >
//               {deleting ? (
//                 <Loader2 size={18} className="animate-spin" />
//               ) : (
//                 <Trash2 size={18} />
//               )}
//             </button>
//           </div>

//           {/* Messages */}
//           {/* <div className="flex-1 overflow-y-auto p-4 space-y-4"> */}
//           <div
//   className="flex-1 overflow-y-auto p-4 space-y-4"
//   onClick={() => setOpenMenuIndex(null)}
// >

//             {selected.messages?.length === 0 ? (
//               <div className="text-center text-gray-400 mt-12 text-sm">
//                 Start the conversation
//               </div>
//             ) : (
//              selected.messages.map((m, i) => {
//   const isAdmin = m.sender === "admin";
//   const isEditing = editingIndex === i;


//   return (
//     <div key={i} className={`flex ${isAdmin ? "justify-end" : ""}`}>
//       <div
//         className={`relative group max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl ${
//           isAdmin
//             ? "bg-blue-600 text-white"
//             : "bg-white border"
//         }`}
//       >
//         {/* ✏️ EDIT MODE */}
//         {isEditing ? (
//           <>
//             <input
//               className="w-full text-sm px-2 py-1 rounded text-black focus:outline-none"
//               value={editText}
//               onChange={(e) => setEditText(e.target.value)}
            
//               autoFocus
//   onKeyDown={(e) => {
//     if (e.key === "Enter") {
//       e.preventDefault();
//       saveEdit(i);
//     }
//     if (e.key === "Escape") {
//       setEditingIndex(null);
//       setEditText("");
//       setOpenMenuIndex(null);
//     }
//   }}
//             />

//            <div className="flex gap-2 mt-2 justify-end">
//   {/* SAVE */}
//   <button
//     onClick={() => saveEdit(i)}
//     className="px-3 py-1 text-xs rounded-md bg-blue-600 text-white hover:bg-blue-700 transition disabled:bg-blue-300"
//   >
//     Save
//   </button>

//   {/* CANCEL */}
//   <button
//     onClick={() => {
//       setEditingIndex(null);
//       setEditText("");
//       setOpenMenuIndex(null);
//     }}
//     className="px-3 py-1 text-xs rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
//   >
//     Cancel
//   </button>
// </div>

//           </>
//         ) : (
//           <>
//             {/* 💬 MESSAGE TEXT */}
//             <p className="text-sm whitespace-pre-wrap break-words">
//               {m.message}
//             </p>

//             {/* 🕒 TIME */}
//          <p
//   className={`text-[10px] mt-1 text-right flex items-center justify-end gap-1 ${
//     isAdmin ? "text-blue-100" : "text-gray-400"
//   }`}
// >
//   {/* TIME */}
//   <span>
//     {new Date(m.timestamp).toLocaleTimeString([], {
//       hour: "2-digit",
//       minute: "2-digit",
//     })}
//   </span>

//   {/* EDITED LABEL */}
//   {m.editedAt  && (
//     <span className="italic opacity-80">(edited)</span>
//   )}
// </p>


//          {isAdmin && (
//   <div className="absolute top-2 right-2">
//     <button
//      onClick={(e) => {
//     e.stopPropagation(); // 🔥 IMPORTANT
//     setOpenMenuIndex(openMenuIndex === i ? null : i);
//   }}
//       className="text-white/80 hover:text-white px-1"
//     >
//       ⋮
//     </button>

//     {openMenuIndex === i && (
//       <div className="absolute right-0 mt-1 w-24 bg-white text-black shadow-md z-10"   onClick={(e) => e.stopPropagation()}>
//         <button
//           onClick={() => {
//             setEditingIndex(i);
//             setEditText(m.message);
//             setOpenMenuIndex(null);
//           }}
//           className="w-full text-left px-3 py-2 text-sm  hover:bg-gray-100"
//         >
//           Edit
//         </button>
//           <button
//           onClick={() => deleteMessage(i)}
//           className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
//         >
//           Delete
//         </button>
//       </div>
//     )}
//   </div>
// )}

//           </>
//         )}
        
//       </div>
//     </div>
//   );
// })

//             )}
//             <div ref={endRef} />
//           </div>

//           {/* Input */}
//           <div className="bg-white border-t p-4">
//             <div className="flex gap-2">
//               <input
//                 type="text"
//                 className="flex-1 px-4 py-2.5 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
//                 placeholder="Type a message..."
//                 value={reply}
//                 onChange={(e) => setReply(e.target.value)}
//                 onKeyDown={(e) =>
//                   e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())
//                 }
//               />
//               <button
//                 disabled={sending}
//                 onClick={send}
//                 className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-full transition"
//               >
//                 {sending ? (
//                   <Loader2 size={18} className="animate-spin" />
//                 ) : (
//                   <Send size={18} />
//                 )}
//               </button>
//             </div>
//           </div>
//         </main>
//       ) : (
//         <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50">
//           <div className="text-center">
//             <MessageSquare size={48} className="mx-auto text-gray-300 mb-3" />
//             <p className="text-gray-400">Select a conversation to start</p>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default App;



import { useEffect, useState, useRef } from "react";
import {
  MessageSquare,
  Send,
  ArrowLeft,
  Loader2,
  Search,
  Trash2, // 🗑️ added
} from "lucide-react";
import { API_BASE } from "../constant/Constant";
import { io } from "socket.io-client";

function App() {
  const [chats, setChats] = useState([]);
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const [unreadChats, setUnreadChats] = useState({});
  const [editingIndex, setEditingIndex] = useState(null);
const [editText, setEditText] = useState("");
const [openMenuIndex, setOpenMenuIndex] = useState(null);


  const [deleting, setDeleting] = useState(false); // 🗑️ added
  const endRef = useRef(null);

  const token = localStorage.getItem("token");
  const [socket, setSocket] = useState(null);
const SOCKET_URL = API_BASE.replace(/\/api\/?$/, "");
  // Connect to socket
  useEffect(() => {
    const s = io(SOCKET_URL, {
      transports: ["websocket"],
      auth: { token },
    });
    setSocket(s);
    return () => s.disconnect();
  }, [token]);

  // Register admin + listen for realtime messages
  useEffect(() => {
    if (!socket) return;
    socket.emit("registerUser", "admin");

    socket.on("receiveMessage", ({ chatId, message, senderId, timestamp }) => {
      setChats((prev) => {
        let updated = [...prev];
        const index = updated.findIndex((c) => c._id === chatId);

        if (index !== -1) {
          updated[index] = {
            ...updated[index],
            messages: [
              ...updated[index].messages,
              { message, sender: senderId, timestamp },
            ],
          };
          const movedChat = updated.splice(index, 1)[0];
          updated.unshift(movedChat);
        }

        return updated;
      });

      if (selected?._id !== chatId) {
        setUnreadChats((prev) => ({
          ...prev,
          [chatId]: true,
        }));
      } else {
        // endRef.current?.scrollIntoView({ behavior: "smooth" });
      }

      if (selected?._id === chatId) {
        setSelected((prev) => ({
          ...prev,
          messages: [...prev.messages, { message, sender: senderId, timestamp }],
        }));
      }
    });

 socket.on("messageDeleted", ({ chatId, index }) => {
  setChats(prev =>
    prev.map(chat => {
      if (chat._id !== chatId) return chat;
      if (!chat.messages[index]) return chat;

      const updated = [...chat.messages];
      updated[index] = {
        ...updated[index],
        isDeleted: true,
        message: "This message was deleted"
      };

      return { ...chat, messages: updated };
    })
  );

  setSelected(prev => {
    if (!prev || prev._id !== chatId) return prev;
    if (!prev.messages[index]) return prev;

    const updated = [...prev.messages];
    updated[index] = {
      ...updated[index],
      isDeleted: true,
      message: "This message was deleted"
    };

    return { ...prev, messages: updated };
  });
});

socket.on("messageEdited", ({ chatId, index, message, editedAt }) => {
  setChats(prev =>
    prev.map(chat => {
      if (chat._id !== chatId) return chat;
      if (!chat.messages[index]) return chat;

      const updated = [...chat.messages];
      updated[index] = {
        ...updated[index],
        message,
        edited: true,
        editedAt
      };

      return { ...chat, messages: updated };
    })
  );

  setSelected(prev => {
    if (!prev || prev._id !== chatId) return prev;
    if (!prev.messages[index]) return prev;

    const updated = [...prev.messages];
    updated[index] = {
      ...updated[index],
      message,
      edited: true,
      editedAt
    };

    return { ...prev, messages: updated };
  });
});

  return () => {
    socket.off("receiveMessage");
    socket.off("messageDeleted");
    socket.off("messageEdited");
  };

  }, [socket]);
useEffect(() => {
  if (!selected) return;

  const latest = chats.find((c) => c._id === selected._id);
  if (latest) setSelected(latest);
}, [chats]);

  // Fetch chat list
  useEffect(() => {
    const fetchChats = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/chat/admin/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          const sorted = data.data.sort((a, b) => {
            const t1 = new Date(
              a.messages?.[a.messages.length - 1]?.timestamp || 0
            ).getTime();
            const t2 = new Date(
              b.messages?.[b.messages.length - 1]?.timestamp || 0
            ).getTime();
            return t2 - t1;
          });
          setChats(sorted);
        }
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    fetchChats();
  }, [token]);

  // Send message
  const send = async () => {
    if (!reply.trim() || !selected) return;
    setSending(true);

    try {
      const res = await fetch(`${API_BASE}/chat/admin/${selected._id}/reply`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: reply }),
      });

      const data = await res.json();
      if (data.success) {
        const updatedChat = data.data;

        setSelected((prev) => ({
          ...updatedChat,
          user: prev.user,
        }));

        setChats((prev) => {
          let updated = prev.map((c) =>
            c._id === updatedChat._id ? { ...updatedChat, user: c.user } : c
          );
          const index = updated.findIndex((c) => c._id === updatedChat._id);
          if (index !== -1) {
            const moved = updated.splice(index, 1)[0];
            updated.unshift(moved);
          }
          return updated;
        });

        socket.emit("sendPrivateMessage", {
          receiverId: selected.user._id,
          chatId: selected._id,
          message: reply,
          senderId: "admin",
        });

        setReply("");
      }
    } catch (e) {
      console.error(e);
    }
    setSending(false);
  };
  const saveEdit = async (index) => {
  if (!editText.trim() || !selected) return;

  try {
    const res = await fetch(
      `${API_BASE}/chat/admin/${selected._id}/message/${index}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: editText }),
      }
    );

    const data = await res.json();
    if (!data.success) return;

    // ✅ MANUAL UPDATE (instant UI like your old code style)
    setChats((prev) =>
      prev.map((c) =>
        c._id === selected._id
          ? {
              ...c,
              messages: c.messages.map((m, i) =>
                i === index
                  ? {
                      ...m,
                      message: editText,
                      edited: true,
                      editedAt: new Date(),
                    }
                  : m
              ),
            }
          : c
      )
    );

    setSelected((prev) => ({
      ...prev,
      messages: prev.messages.map((m, i) =>
        i === index
          ? {
              ...m,
              message: editText,
              edited: true,
              editedAt: new Date(),
            }
          : m
      ),
    }));

    // ✅ EMIT (optional if backend already emits)
    socket.emit("messageEdited", {
      chatId: selected._id,
      index,
      message: editText,
      editedAt: new Date(),
    });

    setEditingIndex(null);
    setEditText("");

  } catch (err) {
    console.error(err);
  }
};
// const saveEdit = async (index) => {
//   if (!editText.trim() || !selected) return;

//   try {
//     const res = await fetch(
//       `${API_BASE}/chat/admin/${selected._id}/message/${index}`,
//       {
//         method: "PATCH",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ message: editText }),
//       }
//     );

//     const data = await res.json();

//     if (data.success) {
//       // ✅ FIX: preserve populated user
//       setChats((prev) =>
//         prev.map((c) =>
//           c._id === selected._id
//             ? { ...data.data, user: c.user }
//             : c
//         )
//       );

//       setSelected((prev) => ({
//         ...data.data,
//         user: prev.user,
//       }));

//       setEditingIndex(null);
//       setEditText("");
//     } else {
//       alert(data.message);
//     }
//   } catch (err) {
//     console.error(err);
//     alert("Error editing message");
//   }
// };

// const saveEdit = async (index) => {
//   if (!editText.trim() || !selected) return;

//   try {
//     await fetch(
//       `${API_BASE}/chat/admin/${selected._id}/message/${index}`,
//       {
//         method: "PATCH",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ message: editText }),
//       }
//     );

//     // ❌ DO NOT manually update state here
//     // Let socket handle update

//     setEditingIndex(null);
//     setEditText("");

//   } catch (err) {
//     console.error(err);
//     alert("Error editing message");
//   }
// };

const deleteMessage = async (index) => {
  if (!selected) return;
  if (!window.confirm("Delete this message?")) return;

  try {
    const res = await fetch(
      `${API_BASE}/chat/admin/${selected._id}/message/${index}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();
    if (!data.success) return;

    // ✅ MANUAL UPDATE
    setChats((prev) =>
      prev.map((c) =>
        c._id === selected._id
          ? {
              ...c,
              messages: c.messages.map((m, i) =>
                i === index
                  ? {
                      ...m,
                      isDeleted: true,
                      message: "This message was deleted",
                    }
                  : m
              ),
            }
          : c
      )
    );

    setSelected((prev) => ({
      ...prev,
      messages: prev.messages.map((m, i) =>
        i === index
          ? {
              ...m,
              isDeleted: true,
              message: "This message was deleted",
            }
          : m
      ),
    }));

    // ✅ EMIT
    socket.emit("messageDeleted", {
      chatId: selected._id,
      index,
    });

    setOpenMenuIndex(null);

  } catch (err) {
    console.error(err);
  }
};
// const deleteMessage = async (index) => {
//   if (!selected) return;
//   if (!window.confirm("Delete this message?")) return;

//   try {
//     await fetch(
//       `${API_BASE}/chat/admin/${selected._id}/message/${index}`,
//       {
//         method: "DELETE",
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );

//     // ❌ DO NOT update state here
//     // Socket listener will handle it

//     setOpenMenuIndex(null);

//   } catch (err) {
//     console.error(err);
//     alert("Error deleting message");
//   }
// };


  // 🗑️ Delete Chat Function
  const deleteChat = async (chatId) => {
    if (!window.confirm("Are you sure you want to delete this chat?")) return;

    setDeleting(true);
    try {
      const res = await fetch(`${API_BASE}/chat/admin/${chatId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (data.success) {
        setChats((prev) => prev.filter((c) => c._id !== chatId));
        if (selected?._id === chatId) setSelected(null);
        alert("Chat deleted successfully ✅");
      } else {
        alert(data.message || "Failed to delete chat ❌");
      }
    } catch (e) {
      console.error(e);
      alert("Server error deleting chat ❌");
    }
    setDeleting(false);
  };

  const filtered = chats.filter((c) =>
    c.user?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-8.5rem)] min-h-[520px] flex bg-white border border-line rounded-lg overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          selected ? "hidden" : "flex"
        } md:flex w-full md:w-80 bg-white border-r flex-col`}
      >
        <div className="p-4 border-b">
          
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="text-blue-600" size={24} />
            <h1 className="text-lg font-semibold text-gray-800">Support Chat</h1>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-10 pr-3 py-2 bg-gray-50 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div
          className="flex-1 overflow-y-auto max-h-[calc(100vh-150px)]"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <style>
            {`
              div::-webkit-scrollbar {
                display: none;
              }
            `}
          </style>

          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="animate-spin text-gray-400" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              No conversations
            </div>
          ) : (
            filtered.map((c) => (
              <div
                key={c._id}
                onClick={() => {
                  setSelected(c);
                  setUnreadChats((prev) => {
                    const updated = { ...prev };
                    delete updated[c._id];
                    return updated;
                  });
                }}
                className={`p-4 border-b cursor-pointer transition ${
                  selected?._id === c._id
                    ? "bg-blue-50"
                    : unreadChats[c._id]
                    ? "bg-red-100 hover:bg-red-200"
                    : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-medium">
                    {c.user?.name?.[0]?.toUpperCase() || "U"}
                    {/* <image /> */}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <p className="font-medium text-sm truncate">
                        {c.user?.name || "User"}
                      </p>
                      {unreadChats[c._id] && (
                        <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                          NEW
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      {c.user?.email}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Chat Area */}
      {selected ? (
        <main className="flex-1 flex flex-col">
          <div className="bg-white border-b p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelected(null)}
                className="md:hidden p-1 hover:bg-gray-100 rounded"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-medium">
                {selected.user?.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div>
                <p className="font-medium text-sm">{selected.user?.name || "User"}</p>
                <p className="text-xs text-gray-500">
                  {selected.user?.email || "user@gmail.com"}
                </p>
              </div>
            </div>

            {/* 🗑️ Delete Button */}
            <button
              onClick={() => deleteChat(selected._id)}
              disabled={deleting}
              className="p-2 hover:bg-red-50 text-red-500 rounded transition"
              title="Delete chat"
            >
              {deleting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Trash2 size={18} />
              )}
            </button>
          </div>

          {/* Messages */}
          {/* <div className="flex-1 overflow-y-auto p-4 space-y-4"> */}
          <div
  className="flex-1 overflow-y-auto p-4 space-y-4"
  onClick={() => setOpenMenuIndex(null)}
>

            {selected.messages?.length === 0 ? (
              <div className="text-center text-gray-400 mt-12 text-sm">
                Start the conversation
              </div>
            ) : (
             selected.messages.map((m, i) => {
  const isAdmin = m.sender === "admin";
  const isEditing = editingIndex === i;


  return (
    <div key={m._id || `${selected._id}-${i}`} className={`flex ${isAdmin ? "justify-end" : ""}`}>
      <div
        className={`relative group max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl ${
          isAdmin
            ? "bg-blue-600 text-white"
            : "bg-white border"
        }`}
      >
        {/* ✏️ EDIT MODE */}
        {isEditing ? (
          <>
            <input
              className="w-full text-sm px-2 py-1 rounded text-black focus:outline-none"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
            
              autoFocus
  onKeyDown={(e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveEdit(i);
    }
    if (e.key === "Escape") {
      setEditingIndex(null);
      setEditText("");
      setOpenMenuIndex(null);
    }
  }}
            />

           <div className="flex gap-2 mt-2 justify-end">
  {/* SAVE */}
  <button
    onClick={() => saveEdit(i)}
    className="px-3 py-1 text-xs rounded-md bg-blue-600 text-white hover:bg-blue-700 transition disabled:bg-blue-300"
  >
    Save
  </button>

  {/* CANCEL */}
  <button
    onClick={() => {
      setEditingIndex(null);
      setEditText("");
      setOpenMenuIndex(null);
    }}
    className="px-3 py-1 text-xs rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
  >
    Cancel
  </button>
</div>

          </>
        ) : (
          <>
            {/* 💬 MESSAGE TEXT */}
         <p
  className={`text-sm whitespace-pre-wrap break-words ${
    m.isDeleted ? "italic text-gray-400" : ""
  }`}
>
  {m.isDeleted ? "This message was deleted" : m.message}
</p>


            {/* 🕒 TIME */}
         <p
  className={`text-[10px] mt-1 text-right flex items-center justify-end gap-1 ${
    isAdmin ? "text-blue-100" : "text-gray-400"
  }`}
>
  {/* TIME */}
  <span>
    {new Date(m.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}
  </span>

  {/* EDITED LABEL */}
  {m.editedAt  && (
    <span className="italic opacity-80">(edited)</span>
  )}
</p>


         {/* {isAdmin && ( */}
          {isAdmin && !m.isDeleted && (

  <div className="absolute top-2 right-2">
    <button
     onClick={(e) => {
    e.stopPropagation(); // 🔥 IMPORTANT
    setOpenMenuIndex(openMenuIndex === i ? null : i);
  }}
      className="text-white/80 hover:text-white px-1"
    >
      ⋮
    </button>

    {openMenuIndex === i && (
      <div className="absolute right-0 mt-1 w-24 bg-white text-black shadow-md z-10"   onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => {
            setEditingIndex(i);
            setEditText(m.message);
            setOpenMenuIndex(null);
          }}
          className="w-full text-left px-3 py-2 text-sm  hover:bg-gray-100"
        >
          Edit
        </button>
          <button
          onClick={() => deleteMessage(i)}
          className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
        >
          Delete
        </button>
      </div>
    )}
  </div>
)}

          </>
        )}
        
      </div>
    </div>
  );
})

            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div className="bg-white border-t p-4">
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 px-4 py-2.5 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Type a message..."
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())
                }
              />
              <button
                disabled={sending}
                onClick={send}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-full transition"
              >
                {sending ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>
          </div>
        </main>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50">
          <div className="text-center">
            <MessageSquare size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-400">Select a conversation to start</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
