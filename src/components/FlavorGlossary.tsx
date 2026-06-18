import { Compass } from "lucide-react";

const GLOSSARY_ITEMS = [
  {
    title: "鈶?娓╁害 路 Emotion Temp",
    description:
      "鏂囧瓧鑷甫鐨勬儏鎰熶綋娓╋紝瀹冨喅瀹氫簡璇昏€呬笌鏂囨湰涔嬮棿鐨勫績鐞嗛樆闅斿睆闅溿€備粠宸寸壒闆跺害鍒扮偨鐑堢孩鑾茬殑婕暱鍏夎氨銆?",
    quote: "\"璇诲畬瑙夊緱閲嶏紝浣嗘壘涓嶅埌涓€鍙ユ俯鍚炵殑鎯呰瘽銆?",
  },
  {
    title: "鈶?瀵嗗害 路 Info Density",
    description:
      "鍗曚綅绡囧箙鍐呯殑淇℃伅閲忎笌鎰忔劅鍙犲姞銆傛帓瀛楀甫鏈夌暀鐧藉杩樻槸鎰忚薄绐掓伅銆傚喅瀹氫簡璇昏€呯殑璁ょ煡娑堝寲鍑忛€熸瘮銆?",
    quote: "\"鍓嶆櫙鍖栧眰鍙犮€傚悓涓€鍙ヨ瘽锛屼綘闇€瑕佽绗簩閬嶃€?",
  },
  {
    title: "鈶?閫忔槑搴?路 Significance clarity",
    description:
      "鏂囧瓧鐨勮В鐮佸眰娣便€備粠涓€鐩緞鏄庣洿杈句汉蹇冿紝鍒拌薄寰佸眰鍙犵殑鐕曞崪鑽竷鍨嬬編瀛﹀惈娣枫€?",
    quote: "\"浣犵‘淇″畠璇翠簡浠€涔堬紝浣嗕笉淇濊瘉瀹冨彧璇翠簡杩欎欢銆?",
  },
  {
    title: "鈶?浣欓煹 路 Sensational Echo",
    description:
      "闃呮瘯鍚堝嵎鍚庯紝娈嬬暀鍦ㄤ綋鍐呯殑鎰熺煡鍜屽鸡銆傝繖鏄枃瀛楁渶闅捐妯′豢鍜屽亣閫犵殑璐ㄥ湴銆?",
    quote: "\"璇绘椂椤哄枆锛屽捊鍚庡崐鏃ヤ粛鍦ㄥ彛榻跨暀鏈夎嫤杈涖€?",
  },
  {
    title: "鈶?寮犲姏 路 Dynamic Tension",
    description:
      "鏂囨湰鐨勫唴鍦ㄦ媺鎷斻€傚彊璇翠笌娣辨矇娌夐粯鐨勬姉琛°€佸崟澹伴亾闅忎緧涓庤澹板拰寮﹀反璧噾澶嶈皟鐨勮鍔涖€?",
    quote: "\"缁撳熬澶勪粬涓€瑷€涓嶅彂锛屼絾浣犲惉鍒颁簡涓囬┈濂旇吘銆?",
  },
  {
    title: "鈶?鎰忚薄鍩?路 Metaphor Domain",
    description:
      "鍦ㄤ綍绉嶈川鍦扮殑鐗╄川鍩熶腑锛屾瀯寤哄苟鎶樺皠鎰熺煡浣撶郴銆備粈鍏嬫礇澶柉鍩虹殑闄岀敓鍖栨墦鐮磋瑷€鑷姩鍖栥€?",
    quote: "\"鐢ㄧ熆鐗╂垨鍙よ€佹按澹扮殑缃曡瀵逛綅寤虹珛璧锋劅鐭ユ柊澶ч檰銆?",
  },
  {
    title: "鈶?鏃堕棿鎰?路 Time Perception",
    description:
      "鏂囨湰澶勭悊鏃堕棿娴侀€熺殑鍙屽悜缂╂斁銆傛槸鍘嬬缉娴侀€濓紙濡傗€樼櫨骞村鐙€欒埇鐨勯暱鍗风缉楠級锛岃繕鏄富瑙傚欢缂撹繘绋嬶紙鏅瞾鏂壒寮忕殑鎰忚瘑绮炬礂锛夈€?",
    quote: "\"鍦ㄤ竴涓极闀跨殑涓嬪崍锛屼粬鎶婁竴鐢熺殑鎮旀仺鍐欒繘閭ｈ鍙敤浜嗕笁绉掑畬鎴愮殑绛惧悕銆?",
  },
  {
    title: "鈶?璇氬疄搴?路 Sincerity Ethos",
    description:
      "闅愬惈浣滆€呯殑蹇冪悊瀹夊叏闃插濮挎€併€傛槸瀹夎琛ㄦ紨鎬х殑鑷亱淇緸锛岃繕鏄洖褰掕瘹鎸氱洿闈釜浜哄唴蹇冩渶鑹伴毦銆佹渶鍘熺敓鎬佺殑鑴嗗急浣撻獙銆?",
    quote: "\"涓嶄负浜嗗彨濂借€屽璁捐椈楗帮紝鍝€曟渶鍚庢崸鍑虹殑鏄甫琛€鐨勭矖閯欐湰鐪熴€?",
  },
  {
    title: "鈶?鏂囧寲灞?路 Intertextual Depth",
    description:
      "鏂囨湰涓暣钘忕殑鍏告晠鍖呮祮銆佹枃鏈簰娑夊帤搴︿笌闆嗕綋鏃犳剰璇嗗洖闊崇殑灞傛繁搴︺€傚彜鍏告枃鑴夊拰璇嶈氨鎯€х殑娼滈殣缁ф壙搴︺€?",
    quote: "\"姣忔媯鎷竴鍦堣瘝绔狅紝鎬讳細鍙戝嚭杩滃彜閾滈暅鎴栨枒椹崇绠€鐨勫共娑╁洖澹般€?",
  },
];

export default function FlavorGlossary() {
  return (
    <>
      <hr className="border-[#2C2C2B]/10 my-16 max-w-4xl mx-auto" />

      <section className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h3 className="font-serif text-lg font-light tracking-[0.15em] text-[#2C2C2B] flex items-center justify-center gap-2">
            <Compass className="w-4 h-4 text-[#8C927F]" />
            鏂囧瓧瀹＄編妯″瀷涔濇瀬缁村害璇?
          </h3>
          <p className="font-mono text-[9px] text-[#2C2C2B]/40 tracking-wider uppercase mt-1">
            Aesthetics Spectrum & Recognition Signals
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {GLOSSARY_ITEMS.map((item) => (
            <div
              key={item.title}
              className="p-5 bg-white/70 rounded-xl border border-[#2C2C2B]/10 shadow-xs space-y-2"
            >
              <h4 className="font-serif text-xs font-semibold text-[#2C2C2B]/80 tracking-wide border-b border-[#2C2C2B]/10 pb-1.5">
                {item.title}
              </h4>
              <p className="font-sans text-[10px] font-light leading-relaxed text-[#2C2C2B]/60">
                {item.description}
              </p>
              <div className="text-[9px] font-serif text-[#8C927F] italic pt-1">{item.quote}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
