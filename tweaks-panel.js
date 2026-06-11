/* ============================================================
   TWEAKS PANEL  — plain JS, loads before tokens.
   Owns the persisted theme preference (Auto / Light / Dark) and a
   small namespace the React root reads. The visible panel UI is
   rendered by app.jsx; this file is the persistence + apply layer
   so theme is correct even pre-auth and before React mounts.
   ============================================================ */
(function () {
  var KEY = 'naturis.tweaks.v1';
  var defaults = { theme: 'light', density: 'comfortable', motion: 'on' };

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return Object.assign({}, defaults);
      return Object.assign({}, defaults, JSON.parse(raw));
    } catch (e) { return Object.assign({}, defaults); }
  }
  function save(state) {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }

  // resolve "auto" against OS preference
  function resolveTheme(theme) {
    if (theme === 'auto') {
      var dark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      return dark ? 'dark' : 'light';
    }
    return theme;
  }

  function applyTheme(theme) {
    var resolved = resolveTheme(theme);
    document.documentElement.classList.toggle('naturis-dark', resolved === 'dark');
    document.body && document.body.classList.toggle('naturis-dark', resolved === 'dark');
  }

  var state = load();

  window.NaturisTweaks = {
    get: function () { return Object.assign({}, state); },
    set: function (patch) {
      state = Object.assign({}, state, patch);
      save(state);
      applyTheme(state.theme);
      if (typeof window.__naturisTweaksChanged === 'function') window.__naturisTweaksChanged(state);
      return state;
    },
    resolveTheme: resolveTheme,
    applyTheme: applyTheme
  };

  // apply ASAP (before React mounts) to avoid flash
  if (document.body) applyTheme(state.theme);
  else document.addEventListener('DOMContentLoaded', function () { applyTheme(state.theme); });
})();
