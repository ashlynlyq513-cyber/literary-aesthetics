import { AnimatePresence, motion } from "motion/react";
import { BookOpen, Bookmark, Trash2 } from "lucide-react";
import type { MouseEvent } from "react";
import type { BookmarkItem } from "../app-types";

interface ArchiveDrawerProps {
  archiveOpen: boolean;
  bookmarks: BookmarkItem[];
  onClose: () => void;
  onRestore: (item: BookmarkItem) => void;
  onDelete: (id: string, e: MouseEvent<HTMLButtonElement>) => void;
}

export default function ArchiveDrawer({
  archiveOpen,
  bookmarks,
  onClose,
  onRestore,
  onDelete,
}: ArchiveDrawerProps) {
  return (
    <AnimatePresence>
      {archiveOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.35 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-50 cursor-pointer"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 180 }}
            className="fixed top-0 right-0 h-full w-[360px] sm:w-[420px] bg-[#FDFCF8] text-[#2C2C2B] shadow-2xl z-50 flex flex-col border-l border-[#2C2C2B]/15"
            style={{ fontFamily: "'Georgia', 'Helvetica Neue', Arial, sans-serif" }}
          >
            <div className="p-6 border-b border-[#2C2C2B]/10 flex justify-between items-center bg-[#F9F8F3]">
              <div>
                <h3 className="font-serif text-base font-semibold text-[#2C2C2B] flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-[#8C927F]" />
                  鎴戠殑涔﹀嵎妗ｆ棣?
                </h3>
                <p className="font-mono text-[9px] text-[#2C2C2B]/40 uppercase tracking-wider mt-0.5">
                  Nine-dimensional Archives Drawer
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1 px-2.5 rounded-md hover:bg-[#2C2C2B]/5 text-xs font-serif text-[#2C2C2B]/50 hover:text-[#2C2C2B] transition-colors cursor-pointer"
              >
                鍏抽棴
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {bookmarks.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center text-xs text-[#2C2C2B]/40 font-serif leading-relaxed">
                  <BookOpen className="w-8 h-8 stroke-[1.2] opacity-30 mb-3 text-[#8C927F]" />
                  <span>闃佷腑鐩墠绌烘棤涓€鍗枫€?/span>
                  <p className="text-[10px] text-[#2C2C2B]/35 mt-2 max-w-[240px] mx-auto">
                    鎮ㄥ彲鍦ㄣ€屽搧閴村垎鏋愩€嶆垨銆屽姣斿搧閴淬€嶄腑鐐瑰嚮銆屾敹褰曚功鍗枫€嶆垨銆屾敹褰曞悓妗嗗鐓ф湰銆嶅皢鍏舵案涔呬繚瀛樿嚦姝ゅ銆?
                  </p>
                </div>
              ) : (
                bookmarks.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => onRestore(b)}
                    className="group p-4 bg-white/70 hover:bg-[#8C927F]/5 rounded-xl border border-[#2C2C2B]/10 hover:border-[#8C927F]/45 transition-all cursor-pointer relative shadow-2xs space-y-2 flex flex-col"
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-serif text-xs font-semibold tracking-wide text-[#2C2C2B]/85 group-hover:text-[#2C2C2B] leading-snug line-clamp-1 pr-6">
                        {b.title}
                      </span>
                      <button
                        onClick={(e) => onDelete(b.id, e)}
                        className="text-[#2C2C2B]/35 hover:text-red-700 p-1 rounded-md transition-colors absolute top-3 right-3 cursor-pointer"
                        title="绉诲嚭姝ゅ嵎"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="font-sans text-[10px] font-light text-[#2C2C2B]/60 leading-relaxed line-clamp-2">
                      {b.text}
                    </p>

                    <div className="flex justify-between items-center text-[9px] font-serif text-[#2C2C2B]/40 pt-1 border-t border-[#2C2C2B]/5">
                      <span className="not-italic bg-[#8C927F]/10 text-[#8C927F] font-sans px-1.5 py-0.5 rounded-sm">
                        {b.mode === "A" ? "鍗曞嵎鍝佽椈" : b.mode === "B" ? "瀵圭収鏂囨" : "椋庢牸璇婃柇"}
                      </span>
                      <span>{b.timestamp}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-6 bg-[#F9F8F3] border-t border-[#2C2C2B]/10 text-center">
              <p className="font-sans text-[9px] font-light text-[#2C2C2B]/50">
                妗ｆ棣嗛噰鐢ㄦ湰鍦版矙鐩掞紙LocalStorage锛夎繘琛岃瘝绔犲瘑浠剁骇瀛樺偍銆?
                <br />
                娓呴櫎娴忚鍣ㄥ巻鍙茬紦瀛樻垨鏇存崲璁惧浼氬鑷存敹钘忔枃鍗锋竻绌恒€?
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
