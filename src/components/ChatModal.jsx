import { useState, useEffect, useRef } from "react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import {
  HiOutlineX,
  HiOutlinePaperAirplane,
  HiOutlineChatAlt2,
  HiOutlineAcademicCap,
  HiOutlineUser,
} from "react-icons/hi";

export default function ChatModal({
  isOpen,
  onClose,
  courseId,
  courseTitle,
  otherUserId,
  otherUserName,
  otherUserRole = "instructor",
}) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && courseId && otherUserId) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 4000); // Polling every 4 seconds
      return () => clearInterval(interval);
    }
  }, [isOpen, courseId, otherUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    try {
      const res = await api.get(`/messages/${courseId}/${otherUserId}`);
      setMessages(res.data.messages || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;

    const textToSend = inputText.trim();
    setInputText("");
    setSending(true);

    try {
      const res = await api.post(`/messages/${courseId}/${otherUserId}`, {
        message: textToSend,
      });
      setMessages((prev) => [...prev, res.data.message]);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
      setInputText(textToSend); // Restore text on failure
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg h-[580px] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-indigo-600 text-white p-4 flex items-center justify-between shadow">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {otherUserName?.charAt(0).toUpperCase() || "?"}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base truncate">{otherUserName}</h3>
                <span className="text-[10px] bg-indigo-500/80 px-2 py-0.5 rounded-full capitalize font-semibold">
                  {otherUserRole}
                </span>
              </div>
              <p className="text-xs text-indigo-100 truncate flex items-center gap-1">
                <HiOutlineAcademicCap className="h-3.5 w-3.5 flex-shrink-0" />
                {courseTitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition"
          >
            <HiOutlineX className="h-6 w-6" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {loading ? (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm animate-pulse">
              Loading chat history...
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12 px-4">
              <HiOutlineChatAlt2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-gray-700">No messages yet</p>
              <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                Send a message to start direct communication regarding your course lessons and questions.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine =
                (msg.sender?._id || msg.sender) === (user?.id || user?._id);

              return (
                <div
                  key={msg._id}
                  className={`flex flex-col ${
                    isMine ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                      isMine
                        ? "bg-indigo-600 text-white rounded-br-none"
                        : "bg-white text-gray-800 border border-gray-100 rounded-bl-none"
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {msg.message}
                    </p>
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 px-1">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <form
          onSubmit={handleSendMessage}
          className="p-3 bg-white border-t border-gray-100 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Message ${otherUserName}...`}
            className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || sending}
            className="bg-indigo-600 text-white p-2.5 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow"
          >
            <HiOutlinePaperAirplane className="h-5 w-5 transform rotate-90" />
          </button>
        </form>
      </div>
    </div>
  );
}
