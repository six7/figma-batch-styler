import App from './PluginUI.svelte';

const app = new App({
	target: document.body,
});

export default app;

// Production-only, non-intrusive easter egg (Konami)
if (typeof __PROD__ !== 'undefined' && __PROD__) {
  (function(){
    var seq = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
    var idx = 0;
    function isTypingTarget(t){
      if (!t) return false;
      var tag = t.tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || t.isContentEditable === true;
    }
    function normalizeKey(k){
      if (k && k.length === 1) return k.toLowerCase();
      return k;
    }
    function onKey(e){
      if (e.repeat) return;
      if (!document.hasFocus()) return;
      var t = e.target;
      if (isTypingTarget(t)) return;
      var k = normalizeKey(e.key);
      var expect = seq[idx];
      if (k === expect || k === expect.toLowerCase()){
        idx++;
        if (idx === seq.length){
          idx = 0;
          openModal();
        }
      } else {
        idx = (k === seq[0] || k === (seq[0] && seq[0].toLowerCase())) ? 1 : 0;
      }
    }
    window.addEventListener('keydown', onKey, { passive: true });

    function openModal(){
      var overlay = document.createElement('div');
      overlay.className = 'bs-ee-overlay';
      overlay.setAttribute('role','dialog');
      overlay.setAttribute('aria-modal','true');
      overlay.setAttribute('aria-labelledby','bs-ee-title');
      overlay.tabIndex = -1;

      var dialog = document.createElement('div');
      dialog.className = 'bs-ee-dialog';
      dialog.addEventListener('click', function(ev){ ev.stopPropagation(); });

      var close = document.createElement('button');
      close.className = 'bs-ee-close';
      close.type = 'button';
      close.setAttribute('aria-label','Close');
      close.textContent = '\u00D7';

      var h = document.createElement('h2');
      h.id = 'bs-ee-title';
      h.textContent = 'Batch Styler';

      var p = document.createElement('p');
      p.textContent = 'Made with care by Jan Six';

      var sparkle = document.createElement('div');
      sparkle.className = 'bs-ee-sparkles';
      sparkle.setAttribute('aria-hidden','true');
      sparkle.innerHTML = '<span>✨</span><span>✨</span><span>✨</span>';

      var style = document.createElement('style');
      style.textContent = '' +
        '.bs-ee-overlay{position:fixed;inset:0;background:rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;z-index:2147483647}' +
        '.bs-ee-dialog{position:relative;max-width:320px;width:calc(100% - 32px);background:#fff;color:#111;border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,.2);padding:16px;font-family:var(--font-stack,Inter,system-ui,sans-serif)}' +
        '.bs-ee-close{position:absolute;top:6px;right:6px;border:0;background:transparent;cursor:pointer;font-size:20px;line-height:1;width:28px;height:28px;border-radius:4px}' +
        '.bs-ee-close:focus{outline:2px solid var(--blue,#18A0FB);outline-offset:2px}' +
        '.bs-ee-sparkles{margin-top:8px;text-align:center;font-size:20px}' +
        '.bs-ee-sparkles span{display:inline-block;animation:bs-pop 1.6s ease-in-out infinite}' +
        '.bs-ee-sparkles span:nth-child(2){animation-delay:.2s}.bs-ee-sparkles span:nth-child(3){animation-delay:.4s}' +
        '@keyframes bs-pop{0%,100%{transform:translateY(0) scale(1);opacity:.85}50%{transform:translateY(-6px) scale(1.2);opacity:1}}';

      dialog.appendChild(close);
      dialog.appendChild(h);
      dialog.appendChild(p);
      dialog.appendChild(sparkle);
      overlay.appendChild(dialog);
      overlay.appendChild(style);

      function doClose(){
        document.removeEventListener('keydown', onEscTrap, true);
        overlay.removeEventListener('click', onOutside);
        overlay.remove();
        if (previous && previous.focus) previous.focus();
      }
      function onOutside(){ doClose(); }
      close.addEventListener('click', doClose);
      overlay.addEventListener('click', onOutside);

      var previous = document.activeElement;
      function onEscTrap(ev){
        if (ev.key === 'Escape'){ ev.stopPropagation(); doClose(); return; }
        if (ev.key === 'Tab'){
          var focusables = dialog.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])');
          var list = Array.prototype.slice.call(focusables);
          if (list.length === 0){ ev.preventDefault(); close.focus(); return; }
          var first = list[0], last = list[list.length-1];
          if (ev.shiftKey){
            if (document.activeElement === first){ ev.preventDefault(); last.focus(); }
          } else {
            if (document.activeElement === last){ ev.preventDefault(); first.focus(); }
          }
        }
      }

      document.addEventListener('keydown', onEscTrap, true);
      document.body.appendChild(overlay);
      setTimeout(function(){ close.focus(); }, 0);
    }

    window.addEventListener('beforeunload', function(){ window.removeEventListener('keydown', onKey); });
  })();
}