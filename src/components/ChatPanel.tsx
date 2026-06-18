import type { RefObject } from "react";
import { ArrowRight, MessageSquare } from "lucide-react";
import type { ChatMessage } from "../types";

interface ChatPanelProps {
  chatInput: string;
  chatMessages: ChatMessage[];
  chatScrollRef: RefObject<HTMLDivElement | null>;
  loading: boolean;
  onChatInputChange: (value: string) => void;
  onSendMessage: () => void;
}

export default function ChatPanel({
  chatInput,
  chatMessages,
  chatScrollRef,
  loading,
  onChatInputChange,
  onSendMessage,
}: ChatPanelProps) {
  return (
    <div className="lg:col-span-12 max-w-4xl mx-auto w-full animate-fadeIn">
      <div className="bg-white/80 rounded-2xl border border-[#2C2C2B]/10 shadow-xs flex flex-col h-[520px] overflow-hidden">
        <div className="bg-[#F9F8F3] px-6 py-4 border-b border-[#2C2C2B]/10 flex items-center justify-between">
          <div>
            <h3 className="font-serif text-sm font-medium flex items-center gap-2 text-[#2C2C2B]">
              <MessageSquare className="w-4 h-4 text-[#8C927F]" />
              鏂囧瀹＄編瀛︽湳瀵硅皥
            </h3>
            <p className="font-sans text-[9px] text-[#2C2C2B]/40 uppercase mt-0.5 tracking-wider">
              Dialogue on Russian Formalism & Textual Criticism
            </p>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-[#8C927F] animate-pulse" />
        </div>

        <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#FDFCF8]/40">
          {chatMessages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed tracking-wide ${
                  msg.sender === "user"
                    ? "bg-[#2C2C2B] text-[#FDFCF8] font-serif rounded-tr-xs"
                    : "bg-white text-[#2C2C2B] font-sans font-light border border-[#2C2C2B]/10 rounded-tl-xs shadow-xs"
                }`}
                style={{ whiteSpace: "pre-line" }}
              >
                {msg.content}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-[#F9F8F3] border-t border-[#2C2C2B]/10 flex gap-3">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => onChatInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSendMessage();
            }}
            placeholder="杈撳叆鎴栧悜鎴戞彁闂紝渚嬪锛氣€滀粈涔堟槸鍐欎綔鐨勯浂搴︼紵鈥濄€佲€滄捣鏄庡▉鐨勫啺灞辩悊璁哄拰寮犵埍鐜茬殑绻佸鐨勫尯鍒槸浠€涔堬紵鈥?.."
            className="flex-1 bg-white border border-[#2C2C2B]/15 rounded-xl px-4 py-2.5 text-xs font-serif tracking-wide focus:outline-hidden focus:ring-1 focus:ring-[#8C927F]/45 text-[#2C2C2B]"
          />
          <button
            onClick={onSendMessage}
            disabled={loading || !chatInput.trim()}
            className="bg-[#2C2C2B] hover:bg-[#4d483e] text-[#FDFCF8] text-xs font-serif px-5 py-2.5 rounded-xl tracking-widest transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-30 cursor-pointer"
          >
            绾搁附閫佸憟
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
