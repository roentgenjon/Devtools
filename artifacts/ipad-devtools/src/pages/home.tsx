import { useState } from "react";
import BOOKMARKLET_SOURCE from "@/bookmarklet.min.js?raw";

function makeLoaderUrl(origin: string): string {
  const src = `(function(){var s=document.createElement('script');s.src='${origin}/api/bookmarklet.js?v=3';document.head.appendChild(s)})()`;
  return "javascript:" + encodeURIComponent(src);
}

const LOADER_ENCODED = makeLoaderUrl(window.location.origin);

const FEATURES = [
  { icon: "🖥️", title: "Console", desc: "JavaScript ausführen, Logs sehen, Fehler fangen, History mit ↑↓" },
  { icon: "🎯", title: "Element Picker", desc: "Touch-optimiert für iPad – tippe auf jedes Element, sieh alle Attribute" },
  { icon: "✏️", title: "DOM Editor", desc: "Bearbeite das HTML jedes Elements oder der ganzen Seite live" },
  { icon: "🎨", title: "Style Editor", desc: "Computed Styles lesen & Inline-Styles direkt auf Elemente anwenden" },
  { icon: "🗄️", title: "Storage", desc: "localStorage, sessionStorage & Cookies anzeigen, bearbeiten, löschen" },
  { icon: "📡", title: "Network", desc: "fetch() und XHR-Requests abfangen – URL, Methode, Status-Code" },
  { icon: "⌨️", title: "Commands", desc: "25+ eingebaute Commands mit Suchfunktion und Schnellstart-Button" },
  { icon: "⚙️", title: "Settings", desc: "Schriftgröße, Transparenz, Akzentfarbe, Verhalten – alles konfigurierbar" },
];

const STEPS = [
  {
    n: 1,
    title: "Code kopieren",
    body: (
      <>
        Tippe auf <strong>„Code kopieren"</strong> weiter unten – der gesamte Code liegt jetzt in der Zwischenablage.
      </>
    ),
  },
  {
    n: 2,
    title: "Irgendeine Seite als Lesezeichen speichern",
    body: (
      <>
        Öffne z.&thinsp;B. <strong>google.com</strong> in Chrome. Tippe oben auf die <strong>Adressleiste → ☆ Stern-Symbol</strong> (oder Teilen → „Lesezeichen hinzufügen"). Nenne es <strong>„DevTools"</strong> und speichere.{" "}
        <em className="text-[#888]">Wichtig: Es muss eine normale https://-Seite sein – nicht diese Seite.</em>
      </>
    ),
  },
  {
    n: 3,
    title: "Lesezeichen-URL ersetzen",
    body: (
      <>
        Öffne <strong>Chrome → ⋮ Menü → Lesezeichen</strong>. Tippe das soeben gespeicherte <strong>„DevTools"</strong>-Lesezeichen <em>lang an</em> → <strong>„Lesezeichen bearbeiten"</strong>. Tippe in das <strong>URL-Feld</strong>, wähle <strong>alles aus</strong> (doppeltippen → „Alles auswählen") und füge den kopierten Code ein. Speichern.
      </>
    ),
  },
  {
    n: 4,
    title: "Auf jeder Seite benutzen",
    body: (
      <>
        Navigiere zu einer beliebigen Seite → tippe auf <strong>☆ Lesezeichen</strong> → wähle <strong>DevTools</strong>. Das Panel öffnet sich sofort. Nochmal tippen = schließen.
      </>
    ),
  },
];

export default function Home() {
  const [copied, setCopied] = useState(false);
  const [tested, setTested] = useState(false);
  const [showModal, setShowModal] = useState(false);

  function markCopied() {
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  function copyCode() {
    // Tier 1: modern Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(LOADER_ENCODED)
        .then(() => markCopied())
        .catch(() => tryLegacyCopy());
      return;
    }
    tryLegacyCopy();
  }

  function tryLegacyCopy() {
    // Tier 2: execCommand (legacy, may be blocked in iframes)
    const ta = document.createElement("textarea");
    ta.value = LOADER_ENCODED;
    ta.style.cssText = "position:fixed;left:-9999px;top:0;opacity:0;";
    ta.setAttribute("readonly", "");
    document.body.appendChild(ta);
    ta.focus();
    ta.setSelectionRange(0, ta.value.length);
    let ok = false;
    try { ok = document.execCommand("copy"); } catch (_) { ok = false; }
    document.body.removeChild(ta);
    if (ok) {
      markCopied();
    } else {
      // Tier 3: show modal so user can manually select+copy
      setShowModal(true);
    }
  }

  function runTest() {
    try {
      // eslint-disable-next-line no-eval
      (0, eval)(BOOKMARKLET_SOURCE);
      setTested(true);
      setTimeout(() => setTested(false), 3000);
    } catch (e) {
      alert("Fehler: " + String(e));
    }
  }

  return (
    <div className="min-h-screen bg-[#0d0d12] text-[#e2e2f0] font-sans relative overflow-x-hidden">
      <div
        className="fixed inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(#2a2a3a 1px, transparent 1px), linear-gradient(90deg, #2a2a3a 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative max-w-2xl mx-auto px-4 py-12 pb-20">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00cc88] to-[#007acc] text-black text-[10px] font-bold tracking-[1.5px] uppercase px-3 py-1 rounded-full mb-5">
          🛠️ iPad DevTools v3
        </div>

        {/* Heading */}
        <h1
          className="text-4xl sm:text-5xl font-bold leading-tight mb-3"
          style={{
            background: "linear-gradient(135deg, #fff 30%, #00cc88 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          DevTools für<br />Chrome auf dem iPad
        </h1>
        <p className="text-[#666] text-base leading-relaxed mb-8 font-light">
          Ein vollwertiges Developer-Tools-Panel – direkt in jede Webseite injiziert via Lesezeichen.
        </p>

        {/* TEST BUTTON – prominent at the top */}
        <div className="bg-[#0f1f17] border border-[#00cc8844] rounded-xl p-5 mb-8 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1">
            <div className="text-[13px] font-semibold text-white mb-1">🧪 Direkt hier ausprobieren</div>
            <div className="text-[12px] text-[#666] leading-relaxed">
              Kein Lesezeichen nötig – das Panel öffnet sich sofort auf dieser Seite zum Testen.
            </div>
          </div>
          <button
            onClick={runTest}
            className="flex-shrink-0 px-6 py-3 rounded-xl font-bold text-[14px] transition-all active:scale-95"
            style={{
              background: tested
                ? "linear-gradient(135deg,#00cc88,#00aa66)"
                : "linear-gradient(135deg,#00cc88,#007acc)",
              color: "#000",
              boxShadow: "0 4px 20px rgba(0,204,136,.35)",
            }}
          >
            {tested ? "✓ Panel geöffnet!" : "▶ Jetzt testen"}
          </button>
        </div>

        {/* Warning */}
        <div className="bg-[#1a0f00] border border-[#4a2800] rounded-xl px-4 py-3 mb-8 text-[13px] text-[#dcdcaa] leading-relaxed">
          <strong className="text-[#f48771]">⚠️ Hinweis:</strong> Chrome auf iOS unterstützt{" "}
          <strong>keine Extensions</strong> (Apple-Beschränkung). Dieses Bookmarklet gibt dir alle wichtigen DevTools-Funktionen direkt auf jeder Seite.
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 gap-3 mb-10">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-[#14141c] border border-[#2a2a3a] rounded-xl p-4">
              <div className="text-lg mb-2">{f.icon}</div>
              <div className="text-[13px] font-semibold mb-1 text-white">{f.title}</div>
              <div className="text-[11px] text-[#666] leading-relaxed">{f.desc}</div>
            </div>
          ))}
        </div>

        {/* Installation Steps */}
        <h2 className="text-base font-bold text-white mb-4">📲 Installation auf dem iPad</h2>
        <div className="flex flex-col gap-4 mb-8">
          {STEPS.map((s) => (
            <div key={s.n} className="bg-[#14141c] border border-[#2a2a3a] rounded-xl p-5 flex gap-4 items-start">
              <div className="bg-[#00cc88] text-black font-bold text-[13px] w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                {s.n}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white mb-1">{s.title}</h3>
                <p className="text-[13px] text-[#999] leading-relaxed">{s.body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Code Box */}
        <div className="bg-[#14141c] border border-[#2a2a3a] rounded-xl overflow-hidden mb-4">
          <div className="flex justify-between items-center px-4 py-2.5 bg-[#1c1c28] border-b border-[#2a2a3a]">
            <div>
              <span className="text-[12px] text-[#666] font-mono">bookmarklet-code.js</span>
              <span className="ml-2 text-[10px] text-[#444]">({Math.round(LOADER_ENCODED.length / 1024 * 10) / 10} KB – Loader)</span>
            </div>
            <button
              onClick={copyCode}
              className={`px-5 py-1.5 rounded-md text-[13px] font-bold transition-colors ${
                copied
                  ? "bg-[#00cc88] text-black"
                  : "bg-[#007acc] text-white"
              }`}
            >
              {copied ? "✓ Kopiert!" : "📋 Code kopieren"}
            </button>
          </div>
          <div className="p-4 max-h-36 overflow-y-auto">
            <pre className="font-mono text-[10.5px] text-[#ce9178] whitespace-pre-wrap break-all leading-relaxed select-all">
              {LOADER_ENCODED}
            </pre>
          </div>
        </div>

        {/* javascript: explanation */}
        <div className="bg-[#0d0d12] border border-[#1e1e2a] rounded-xl px-4 py-3 mb-10 text-[12px] text-[#555] leading-relaxed">
          <strong className="text-[#666]">ℹ️ Was ist <code className="text-[#9cdcfe]">javascript:</code>?</strong>{" "}
          Das ist das URL-Schema für Bookmarklets – genau wie <code className="text-[#9cdcfe]">https://</code> für normale Webseiten.
          Der Browser führt damit den JavaScript-Code aus statt zu navigieren. Dieses Präfix muss in der Lesezeichen-URL erhalten bleiben.
        </div>

        {/* How to use */}
        <h2 className="text-base font-bold text-white mb-4">🚀 So rufst du die DevTools auf</h2>
        <div className="bg-[#14141c] border border-[#2a2a3a] rounded-xl overflow-hidden mb-8">
          {[
            {
              icon: "🌐",
              title: "Zu einer beliebigen Seite navigieren",
              desc: "Öffne z. B. google.com, deine App oder irgendeine andere Webseite in Chrome.",
            },
            {
              icon: "☆",
              title: "Adressleiste antippen",
              desc: (
                <>
                  Tippe oben auf die <strong className="text-white">Adressleiste</strong>. Darunter erscheint eine Reihe mit deinen Lesezeichen. Falls nicht: tippe auf das <strong className="text-white">Lesezeichen-Symbol</strong> (Buch-Icon, ⋮ Menü → Lesezeichen).
                </>
              ),
            },
            {
              icon: "🛠️",
              title: "\u201EDevTools\u201C antippen",
              desc: "Tippe auf dein gespeichertes DevTools-Lesezeichen. Das Panel erscheint sofort am Bildschirmrand.",
            },
            {
              icon: "✕",
              title: "Panel schließen",
              desc: (
                <>
                  Tippe oben rechts im Panel auf <strong className="text-white">✕</strong> – oder ruf das Lesezeichen nochmal auf. Das Panel verschwindet vollständig, ohne die Seite neu zu laden.
                </>
              ),
            },
          ].map((item, i, arr) => (
            <div
              key={item.title}
              className={`flex gap-4 px-5 py-4 items-start ${i < arr.length - 1 ? "border-b border-[#1e1e2e]" : ""}`}
            >
              <div className="text-xl w-8 flex-shrink-0 mt-0.5">{item.icon}</div>
              <div>
                <div className="text-[13px] font-semibold text-white mb-1">{item.title}</div>
                <div className="text-[12px] text-[#888] leading-relaxed">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tip box */}
        <div className="bg-[#0d1520] border border-[#1e3a5a] rounded-xl px-4 py-3 mb-10 text-[12px] text-[#6ab0e0] leading-relaxed">
          <strong className="text-[#7ec8f8]">💡 Tipp:</strong> Du kannst die DevTools auf <em>jeder</em> Seite öffnen – auch auf Seiten die du entwickelst, App-Stores, Social Media oder Nachrichten-Seiten. Das Panel läuft komplett lokal und sendet keine Daten.
        </div>

        {/* Preview mockup */}
        <div className="bg-[#1c1c28] border border-[#2a2a3a] rounded-xl overflow-hidden mb-8 font-mono text-[11.5px]">
          <div className="bg-[#222229] border-b border-[#333] px-3 py-2 flex gap-4 overflow-x-auto">
            {["Console", "Elements", "Editor", "Styles", "Storage", "Network", "Commands", "Settings"].map((t, i) => (
              <span key={t} className={`text-[11px] whitespace-nowrap ${i === 0 ? "text-white border-b-2 border-[#00cc88] pb-0.5" : "text-[#777]"}`}>{t}</span>
            ))}
          </div>
          <div className="p-3 flex flex-col gap-0.5">
            <div className="px-2 py-0.5 text-[#9cdcfe]"><span className="text-[#444] text-[10px] mr-2">12:00:01</span>iPad DevTools v3 geladen!</div>
            <div className="px-2 py-0.5 text-[#d4d4d4]"><span className="text-[#444] text-[10px] mr-2">12:00:01</span>Seite: https://example.com</div>
            <div className="px-2 py-0.5 text-[#569cd6]"><span className="text-[#444] text-[10px] mr-2">12:00:05</span>› document.title</div>
            <div className="px-2 py-0.5 text-[#00cc88]"><span className="text-[#444] text-[10px] mr-2">12:00:05</span>← "Example Domain"</div>
            <div className="px-2 py-0.5 text-[#dcdcaa]"><span className="text-[#444] text-[10px] mr-2">12:00:08</span>⚠ Mixed content warning</div>
          </div>
        </div>

        <footer className="text-center text-[#444] text-[11px]">
          Code wird vom Server geladen – Panel läuft 100% lokal im Browser
        </footer>
      </div>

      {/* Copy-Fallback Modal – shown when clipboard is blocked (e.g. in iframes) */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.85)" }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-[#14141c] border border-[#2a2a3a] rounded-2xl p-6 w-full max-w-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-white font-bold text-[15px]">📋 Code manuell kopieren</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-[#666] hover:text-white text-xl leading-none px-2"
              >
                ✕
              </button>
            </div>
            <p className="text-[#888] text-[12px] mb-3 leading-relaxed">
              Automatisches Kopieren wurde blockiert. Tippe auf das Textfeld → <strong className="text-white">„Alles auswählen"</strong> → <strong className="text-white">„Kopieren"</strong>.
            </p>
            <textarea
              readOnly
              value={LOADER_ENCODED}
              onClick={(e) => (e.target as HTMLTextAreaElement).select()}
              onFocus={(e) => e.target.select()}
              className="w-full h-32 bg-[#0d0d12] border border-[#2a2a3a] rounded-lg p-3 font-mono text-[10px] text-[#ce9178] resize-none outline-none focus:border-[#007acc]"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  const ta = document.querySelector("textarea[readonly]") as HTMLTextAreaElement;
                  if (ta) { ta.focus(); ta.select(); }
                }}
                className="flex-1 py-2.5 rounded-lg bg-[#007acc] text-white text-[13px] font-bold"
              >
                Alles auswählen
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 rounded-lg bg-[#1c1c28] text-[#888] text-[13px]"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
