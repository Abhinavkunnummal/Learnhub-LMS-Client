import { useState, useRef, useEffect } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";
import {
  HiOutlineSparkles,
  HiOutlineX,
  HiOutlinePaperAirplane,
  HiOutlineRefresh,
  HiOutlineClipboardCopy,
  HiOutlineCheck,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
} from "react-icons/hi";

export default function CourseAiAssistant({
  courseId,
  courseTitle,
  lessonId = null,
  lessonTitle = null,
  embedded = false,
}) {
  const [isOpen, setIsOpen] = useState(embedded);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hello! I'm your AI Course Assistant for **${courseTitle || "this course"}**. 🎓\n\nHave questions or doubts about lessons, code examples, concepts, or quizzes? Ask me anything!`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (questionText = null) => {
    const query = (questionText || input).trim();
    if (!query || loading) return;

    const newMessages = [...messages, { role: "user", content: query }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post("/ai/ask", {
        courseId,
        lessonId,
        question: query,
        chatHistory: newMessages.slice(-6),
      });

      const aiReply = res.data.answer || "I received your question, but could not generate a response. Please try again.";
      setMessages((prev) => [...prev, { role: "assistant", content: aiReply }]);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to get AI response");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "⚠️ I ran into an issue answering your question. Please check your network connection and try asking again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleClear = () => {
    setMessages([
      {
        role: "assistant",
        content: `Chat cleared. Ready for your questions about **${courseTitle || "this course"}**! 💡`,
      },
    ]);
  };

  // Helper to render markdown-like formatting simply
  const renderMessageContent = (content) => {
    const paragraphs = content.split("\n\n");
    return paragraphs.map((para, pIdx) => {
      // Code block
      if (para.startsWith("```") && para.endsWith("```")) {
        const lines = para.split("\n");
        const lang = lines[0].replace("```", "").trim();
        const code = lines.slice(1, -1).join("\n");
        return (
          <div key={pIdx} className="my-2 rounded-lg bg-zinc-900 text-zinc-100 p-3 font-mono text-xs overflow-x-auto border border-zinc-800">
            {lang && <div className="text-[10px] text-zinc-400 uppercase mb-1 font-sans">{lang}</div>}
            <pre className="whitespace-pre">{code}</pre>
          </div>
        );
      }

      // Headings
      if (para.startsWith("### ")) {
        return (
          <h4 key={pIdx} className="font-bold text-sm text-gray-900 dark:text-white mt-2 mb-1">
            {para.replace("### ", "")}
          </h4>
        );
      }

      // Bullet lists
      const lines = para.split("\n");
      const isList = lines.every((l) => l.startsWith("• ") || l.startsWith("- ") || /^\d+\.\s/.test(l));
      if (isList) {
        return (
          <ul key={pIdx} className="space-y-1 my-1 pl-4 list-disc text-xs sm:text-sm">
            {lines.map((item, iIdx) => (
              <li key={iIdx} className="leading-relaxed">
                {item.replace(/^[•\-\d+\.]\s*/, "")}
              </li>
            ))}
          </ul>
        );
      }

      return (
        <p key={pIdx} className="my-1 leading-relaxed text-xs sm:text-sm whitespace-pre-wrap">
          {para}
        </p>
      );
    });
  };

  const promptSuggestions = [
    lessonTitle ? `Explain "${lessonTitle}" in simple terms` : "Explain the main goals of this course",
    "Give me a practical code example",
    "What are common mistakes to avoid?",
    "Summarize key takeaways for a quiz",
  ];

  if (!embedded && !isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white p-3.5 sm:px-5 sm:py-3.5 rounded-full shadow-2xl flex items-center gap-2.5 transition-transform hover:scale-105 group border-2 border-white/20"
        title="Ask AI Doubt Assistant"
      >
        <HiOutlineSparkles className="h-6 w-6 animate-spin-slow" />
        <span className="font-bold text-sm hidden sm:inline tracking-wide">
          Ask Course AI
        </span>
        <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-ping absolute -top-1 -right-1" />
      </button>
    );
  }

  return (
    <div
      className={
        embedded
          ? "bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col h-[520px]"
          : "fixed bottom-6 right-4 sm:right-6 z-50 w-[92vw] sm:w-[420px] h-[560px] max-h-[85vh] bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-5 duration-200"
      }
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-zinc-900 dark:to-zinc-800 dark:border-b dark:border-zinc-800 text-white p-3.5 sm:p-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
            <HiOutlineSparkles className="h-5 w-5 text-yellow-300" />
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-sm text-white truncate flex items-center gap-1.5">
              AI Course Doubt Assistant
              <span className="inline-block w-2 h-2 rounded-full bg-green-400" />
            </h4>
            <p className="text-[11px] text-indigo-100 dark:text-zinc-400 truncate">
              {lessonTitle ? `Focus: ${lessonTitle}` : courseTitle || "LearnHub AI"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            type="button"
            onClick={handleClear}
            className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition"
            title="Clear Chat"
          >
            <HiOutlineRefresh className="h-4 w-4" />
          </button>
          {!embedded && (
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition"
              title="Close Assistant"
            >
              <HiOutlineX className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50 dark:bg-zinc-950/40">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[88%] rounded-2xl p-3 sm:p-3.5 shadow-xs relative group ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white rounded-br-xs"
                  : "bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 rounded-bl-xs border border-gray-200 dark:border-zinc-700"
              }`}
            >
              {renderMessageContent(msg.content)}

              {msg.role === "assistant" && (
                <button
                  type="button"
                  onClick={() => handleCopy(msg.content, i)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-400 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200 text-xs"
                  title="Copy response"
                >
                  {copiedIndex === i ? (
                    <HiOutlineCheck className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <HiOutlineClipboardCopy className="h-3.5 w-3.5" />
                  )}
                </button>
              )}
            </div>
            <span className="text-[10px] text-gray-400 dark:text-zinc-500 px-1 mt-0.5">
              {msg.role === "user" ? "You" : "AI Assistant"}
            </span>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-zinc-400 py-2">
            <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center">
              <HiOutlineSparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 animate-spin" />
            </div>
            <span className="animate-pulse font-medium">Thinking and analyzing course material...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Doubt Pills */}
      {messages.length <= 3 && (
        <div className="p-2 border-t border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-x-auto flex gap-1.5 flex-nowrap scrollbar-none">
          {promptSuggestions.map((prompt, pIdx) => (
            <button
              key={pIdx}
              type="button"
              onClick={() => handleSend(prompt)}
              className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-zinc-800 hover:bg-indigo-100 dark:hover:bg-zinc-700 text-indigo-700 dark:text-indigo-300 font-medium transition border border-indigo-100 dark:border-zinc-700"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center gap-2 flex-shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={lessonTitle ? `Ask about "${lessonTitle}"...` : "Ask any course doubt..."}
          disabled={loading}
          className="flex-1 px-3.5 py-2 border border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 outline-none placeholder-gray-400 dark:placeholder-zinc-500"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl disabled:opacity-40 transition flex-shrink-0 shadow-sm"
          title="Send Question"
        >
          <HiOutlinePaperAirplane className="h-4 w-4 rotate-90" />
        </button>
      </form>
    </div>
  );
}
