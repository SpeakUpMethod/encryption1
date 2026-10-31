/*!
 * <ylc-lang-picker> — drop-in language menu (Wikipedia-style)
 * Young's Language Consulting · single file, no dependencies
 *
 * USAGE
 *   <script src="ylc-lang-picker.js" defer></script>
 *   <ylc-lang-picker suggested="hi,es,zh,fr,de,tl" href="/{code}/"></ylc-lang-picker>
 *
 * ATTRIBUTES (all optional)
 *   suggested        Comma list of codes for the "Suggested" row.
 *                    Omit to auto-suggest from the visitor's browser languages.
 *   only             Comma list of codes — restrict the built-in list to these.
 *   src              URL of a JSON array to use instead of the built-in list.
 *   current          Code of the active language (highlighted, aria-current).
 *   href             Link template. {code} is replaced, e.g. "/{code}/lesson.php"
 *                    or "?lang={code}". Omit to get buttons + events only.
 *   label            Trigger text. {count} and {current} are replaced.
 *                    Default: "{count} languages"
 *   placeholder      Search box text. Default: "Search languages"
 *   heading-suggested / heading-all   Section titles.
 *   align            "right" (default) or "left" — which edge the panel lines up with.
 *   show-english     Show the English name under each native name.
 *   sort             "native" (default, like Wikipedia) or "english".
 *   inline           No button — render the panel open, in the page flow.
 *
 * JAVASCRIPT
 *   picker.languages = [{ code:'es', name:'Español', english:'Spanish', dir:'ltr', href:'/es/' }, ...]
 *   picker.open() / picker.close() / picker.toggle()
 *   picker.addEventListener('language-change', e => {
 *     e.detail  // { code, name, english }
 *     e.preventDefault();  // cancels the link navigation, if href is set
 *   });
 *
 * THEMING (set on the element or any ancestor)
 *   --lp-accent, --lp-bg, --lp-text, --lp-muted, --lp-border, --lp-hover,
 *   --lp-font, --lp-radius, --lp-panel-width, --lp-panel-height
 */
(() => {
  if (customElements.get('ylc-lang-picker')) return;
  // [code, native name, English name]
  const DEFAULT_LANGUAGES = [
    ['af','Afrikaans','Afrikaans'],['ak','Twi','Akan'],['sq','Shqip','Albanian'],['am','አማርኛ','Amharic'],
    ['ar','العربية','Arabic'],['hy','Հայերեն','Armenian'],['as','অসমীয়া','Assamese'],
    ['ast','Asturianu','Asturian'],['ay','Aymar aru','Aymara'],['az','Azərbaycanca','Azerbaijani'],
    ['eu','Euskara','Basque'],['be','Беларуская','Belarusian'],['bn','বাংলা','Bengali'],
    ['bs','Bosanski','Bosnian'],['br','Brezhoneg','Breton'],['bg','Български','Bulgarian'],
    ['my','မြန်မာဘာသာ','Burmese'],['yue','粵語','Cantonese'],['ca','Català','Catalan'],
    ['ceb','Cebuano','Cebuano'],['ckb','کوردی','Central Kurdish'],['ny','Chichewa','Chichewa'],
    ['zh','中文','Chinese'],['co','Corsu','Corsican'],['hr','Hrvatski','Croatian'],
    ['cs','Čeština','Czech'],['da','Dansk','Danish'],['dv','ދިވެހި','Dhivehi'],
    ['nl','Nederlands','Dutch'],['en','English','English'],['eo','Esperanto','Esperanto'],
    ['et','Eesti','Estonian'],['ee','Eʋegbe','Ewe'],['fo','Føroyskt','Faroese'],['fon','fɔ̀ngbè','Fon'],['fi','Suomi','Finnish'],
    ['fr','Français','French'],['gl','Galego','Galician'],['ka','ქართული','Georgian'],
    ['de','Deutsch','German'],['el','Ελληνικά','Greek'],['kl','Kalaallisut','Greenlandic'],
    ['gn','Avañeʼẽ','Guarani'],['gu','ગુજરાતી','Gujarati'],['ht','Kreyòl ayisyen','Haitian Creole'],
    ['ha','Hausa','Hausa'],['haw','ʻŌlelo Hawaiʻi','Hawaiian'],['he','עברית','Hebrew'],
    ['hi','हिन्दी','Hindi'],['hu','Magyar','Hungarian'],['is','Íslenska','Icelandic'],
    ['ig','Igbo','Igbo'],['id','Bahasa Indonesia','Indonesian'],['ga','Gaeilge','Irish'],
    ['it','Italiano','Italian'],['ja','日本語','Japanese'],['jv','Basa Jawa','Javanese'],
    ['kn','ಕನ್ನಡ','Kannada'],['kk','Қазақша','Kazakh'],['km','ភាសាខ្មែរ','Khmer'],
    ['rw','Kinyarwanda','Kinyarwanda'],['ko','한국어','Korean'],['ku','Kurdî','Kurdish (Kurmanji)'],
    ['ky','Кыргызча','Kyrgyz'],['lo','ລາວ','Lao'],['la','Latina','Latin'],
    ['lv','Latviešu','Latvian'],['ln','Lingála','Lingala'],['lt','Lietuvių','Lithuanian'],
    ['lb','Lëtzebuergesch','Luxembourgish'],['mk','Македонски','Macedonian'],['mg','Malagasy','Malagasy'],
    ['ms','Bahasa Melayu','Malay'],['ml','മലയാളം','Malayalam'],['mt','Malti','Maltese'],
    ['mi','Māori','Māori'],['mr','मराठी','Marathi'],['mn','Монгол','Mongolian'],
    ['nv','Diné bizaad','Navajo'],['ne','नेपाली','Nepali'],['no','Norsk','Norwegian'],
    ['oc','Occitan','Occitan'],['or','ଓଡ଼ିଆ','Odia'],['om','Oromoo','Oromo'],
    ['ps','پښتو','Pashto'],['fa','فارسی','Persian'],['pl','Polski','Polish'],
    ['pt','Português','Portuguese'],['pa','ਪੰਜਾਬੀ','Punjabi'],['qu','Runa Simi','Quechua'],
    ['ro','Română','Romanian'],['rm','Rumantsch','Romansh'],['ru','Русский','Russian'],
    ['sm','Gagana Sāmoa','Samoan'],['gd','Gàidhlig','Scottish Gaelic'],['sr','Српски','Serbian'],
    ['st','Sesotho','Sesotho'],['tn','Setswana','Setswana'],['sn','chiShona','Shona'],
    ['sd','سنڌي','Sindhi'],['si','සිංහල','Sinhala'],['sk','Slovenčina','Slovak'],
    ['sl','Slovenščina','Slovenian'],['so','Soomaali','Somali'],['es','Español','Spanish'],
    ['su','Basa Sunda','Sundanese'],['sw','Kiswahili','Swahili'],['sv','Svenska','Swedish'],
    ['tl','Tagalog','Tagalog'],['tg','Тоҷикӣ','Tajik'],['ta','தமிழ்','Tamil'],
    ['tt','Татарча','Tatar'],['te','తెలుగు','Telugu'],['th','ไทย','Thai'],
    ['bo','བོད་ཡིག','Tibetan'],['ti','ትግርኛ','Tigrinya'],['tr','Türkçe','Turkish'],
    ['tk','Türkmençe','Turkmen'],['uk','Українська','Ukrainian'],['ur','اردو','Urdu'],
    ['ug','ئۇيغۇرچە','Uyghur'],['uz','Oʻzbekcha','Uzbek'],['vi','Tiếng Việt','Vietnamese'],
    ['cy','Cymraeg','Welsh'],['fy','Frysk','West Frisian'],['wo','Wolof','Wolof'],
    ['xh','isiXhosa','Xhosa'],['yi','ייִדיש','Yiddish'],['yo','Yorùbá','Yoruba'],
    ['zu','isiZulu','Zulu'],
  ];
  const RTL = new Set(['ar','arc','ckb','dv','fa','he','ks','ps','sd','ug','ur','yi']);
  const norm = s => String(s || '').normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const list = s => (s || '').split(',').map(x => x.trim().toLowerCase()).filter(Boolean);
  const ICON_LANG = '<svg viewBox="0 0 20 20" aria-hidden="true"><path fill="currentColor" d="M20 18h-1.44a.6.6 0 0 1-.4-.12.8.8 0 0 1-.23-.31L17 15h-5l-1 2.54a.8.8 0 0 1-.22.3.6.6 0 0 1-.4.14H9l4.55-11.47h1.89zm-3.53-4.31L14.89 9.5a12 12 0 0 1-.39-1.24q-.09.37-.19.69l-.19.56-1.58 4.19zm-6.3-1.58a13.4 13.4 0 0 1-2.91-1.41 11.46 11.46 0 0 0 2.81-5.37H12V4H7.31a4 4 0 0 0-.2-.56C6.87 2.79 6.6 2 6.6 2l-1.47.5s.4.89.6 1.5H0v1.33h2.15A11.23 11.23 0 0 0 5 10.7a17.2 17.2 0 0 1-5 2.1q.56.82.87 1.38a23.3 23.3 0 0 0 5.22-2.51 15.6 15.6 0 0 0 3.56 1.77zM3.63 5.33h4.91a8.1 8.1 0 0 1-2.45 4.45 9.1 9.1 0 0 1-2.46-4.45"/></svg>';
  const ICON_CHEV = '<svg viewBox="0 0 20 20" aria-hidden="true"><path fill="currentColor" d="m17.5 4.75-7.5 7.5-7.5-7.5L1 6.25l9 9 9-9z"/></svg>';
  const ICON_SEARCH = '<svg viewBox="0 0 20 20" aria-hidden="true"><path fill="currentColor" d="M12.2 13.6a7 7 0 1 1 1.4-1.4l5.4 5.4-1.4 1.4zM3 8a5 5 0 1 0 10 0A5 5 0 0 0 3 8"/></svg>';
  const tpl = document.createElement('template');
  tpl.innerHTML = `
<style>
  :host {
    --_accent: var(--lp-accent, #3366cc);
    --_bg: var(--lp-bg, #ffffff);
    --_text: var(--lp-text, #202122);
    --_muted: var(--lp-muted, #54595d);
    --_border: var(--lp-border, #a2a9b1);
    --_hover: var(--lp-hover, #eaf3ff);
    --_radius: var(--lp-radius, 2px);
    display: inline-block;
    position: relative;
    font-family: var(--lp-font, inherit);
    font-size: 14px;
    line-height: 1.4;
  }
  @media (prefers-color-scheme: dark) {
    :host {
      --_accent: var(--lp-accent, #88a3e8);
      --_bg: var(--lp-bg, #1f2023);
      --_text: var(--lp-text, #eaecf0);
      --_muted: var(--lp-muted, #a2a9b1);
      --_border: var(--lp-border, #54595d);
      --_hover: var(--lp-hover, #2a3a5c);
    }
  }
  :host([inline]) { display: block; }
  *, *::before, *::after { box-sizing: border-box; }
  svg { width: 20px; height: 20px; flex: none; }
  .trigger {
    all: unset;
    display: inline-flex; align-items: center; gap: 6px;
    padding: 5px 8px; border-radius: var(--_radius);
    color: var(--_accent); font-weight: 700; cursor: pointer;
  }
  .trigger:hover { background: var(--_hover); }
  .trigger:focus-visible { outline: 2px solid var(--_accent); outline-offset: 1px; }
  .trigger .chev { display: inline-flex; transition: transform .15s; }
  .trigger .chev svg { width: 12px; height: 12px; }
  .trigger[aria-expanded="true"] .chev { transform: rotate(180deg); }
  :host([inline]) .trigger { display: none; }
  .panel {
    position: fixed; z-index: 2147483000;
    width: min(var(--lp-panel-width, 560px), calc(100vw - 32px));
    background: var(--_bg); color: var(--_text);
    border: 1px solid var(--_border); border-radius: var(--_radius);
    box-shadow: 0 2px 8px rgba(0,0,0,.2);
    display: flex; flex-direction: column;
  }
  .panel[hidden] { display: none; }
  :host([inline]) .panel {
    position: static; width: 100%; box-shadow: none;
  }
  .search {
    display: flex; align-items: center; gap: 8px;
    margin: 8px; padding: 0 10px;
    border: 2px solid var(--_accent); border-radius: var(--_radius);
    color: var(--_muted);
  }
  .search input {
    all: unset; flex: 1; min-width: 0; padding: 8px 0;
    color: var(--_text); font: inherit; font-size: 16px;
  }
  .search input::placeholder { color: var(--_muted); }
  .body {
    overflow-y: auto; overscroll-behavior: contain;
    padding: 4px 16px 12px 36px;
    max-height: var(--_max-h, var(--lp-panel-height, 320px));
  }
  :host([inline]) .body { max-height: var(--lp-panel-height, 420px); }
  h3 {
    margin: 10px 0 6px; font-size: 14px; font-weight: 700; color: var(--_muted);
  }
  ul.grid {
    list-style: none; margin: 0 0 6px; padding: 0;
    display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    column-gap: 16px;
  }
  li[hidden], section[hidden], .empty[hidden] { display: none; }
  .item {
    all: unset; display: block; width: 100%; box-sizing: border-box;
    padding: 6px 4px; margin-left: -4px;
    color: var(--_accent); cursor: pointer; border-radius: var(--_radius);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .item:hover { text-decoration: underline; }
  .item:focus-visible { outline: 2px solid var(--_accent); outline-offset: -2px; background: var(--_hover); }
  .item[aria-current="true"] { color: var(--_text); font-weight: 700; }
  .item small { display: block; color: var(--_muted); font-size: 12px; text-align: start; }
  .empty { color: var(--_muted); margin: 12px 0; }
  @media (max-width: 480px) {
    .body { padding-left: 16px; }
    ul.grid { grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); }
  }
</style>
<button class="trigger" part="button" type="button" aria-haspopup="dialog" aria-expanded="false">
  ${ICON_LANG}<span class="label"></span><span class="chev">${ICON_CHEV}</span>
</button>
<div class="panel" part="panel" role="dialog" aria-label="Choose a language" hidden>
  <label class="search">${ICON_SEARCH}<input type="search" autocomplete="off" spellcheck="false" aria-label="Search languages"></label>
  <div class="body">
    <section class="sug"><h3></h3><ul class="grid"></ul></section>
    <section class="all"><h3></h3><ul class="grid"></ul></section>
    <p class="empty" hidden role="status"></p>
  </div>
</div>`;
  class YlcLangPicker extends HTMLElement {
    static get observedAttributes() {
      return ['suggested','only','src','current','href','label','placeholder',
              'heading-suggested','heading-all','show-english','sort','inline','align'];
    }
    constructor() {
      super();
      const root = this.attachShadow({ mode: 'open' });
      root.appendChild(tpl.content.cloneNode(true));
      this.$ = sel => root.querySelector(sel);
      this._btn = this.$('.trigger');
      this._panel = this.$('.panel');
      this._input = this.$('input');
      this._body = this.$('.body');
      this._custom = null;
      this._langs = [];
      this._btn.addEventListener('click', () => this.toggle());
      this._input.addEventListener('input', () => this._filter());
      this._input.addEventListener('keydown', e => this._onSearchKey(e));
      this._body.addEventListener('keydown', e => this._onGridKey(e));
      this._body.addEventListener('click', e => this._onPick(e));
      this._panel.addEventListener('keydown', e => {
        if (e.key === 'Escape' && !this.hasAttribute('inline')) { e.stopPropagation(); this.close(true); }
      });
      this._outside = e => { if (!e.composedPath().includes(this)) this.close(); };
      this._reposition = () => this._place();
    }
    connectedCallback() { this._load(); }
    disconnectedCallback() { this._unbind(); }
    attributeChangedCallback(name, oldV, newV) {
      if (oldV === newV || !this.isConnected) return;
      if (name === 'src') return this._load();
      if (name === 'inline') { this._unbind(); this._syncInline(); }
      this._render();
    }
    /* ---------- public API ---------- */
    get languages() { return this._langs.slice(); }
    set languages(arr) { this._custom = Array.isArray(arr) ? arr : null; this._build(); }
    get isOpen() { return !this._panel.hidden; }
    open() {
      if (this.hasAttribute('inline') || this.isOpen) return;
      this._panel.hidden = false;
      this._btn.setAttribute('aria-expanded', 'true');
      this._place();
      document.addEventListener('pointerdown', this._outside, true);
      window.addEventListener('resize', this._reposition);
      window.addEventListener('scroll', this._reposition, true);
      this._input.focus({ preventScroll: true });
    }
    close(returnFocus) {
      if (this.hasAttribute('inline') || !this.isOpen) return;
      this._panel.hidden = true;
      this._btn.setAttribute('aria-expanded', 'false');
      this._unbind();
      if (this._input.value) { this._input.value = ''; this._filter(); }
      if (returnFocus) this._btn.focus();
    }
    toggle() { this.isOpen ? this.close() : this.open(); }
    /* ---------- data ---------- */
    async _load() {
      this._syncInline();
      const src = this.getAttribute('src');
      if (src) {
        try {
          const r = await fetch(src);
          this._custom = await r.json();
        } catch (err) {
          console.warn('[ylc-lang-picker] could not load', src, err);
        }
      }
      this._build();
    }
    _build() {
      const raw = this._custom
        ? this._custom.map(o => ({ ...o }))
        : DEFAULT_LANGUAGES.map(([code, name, english]) => ({ code, name, english }));
      this._langs = raw.filter(l => l && l.code).map(l => ({
        code: String(l.code),
        name: l.name || l.english || l.code,
        english: l.english || '',
        dir: l.dir || (RTL.has(String(l.code).split('-')[0].toLowerCase()) ? 'rtl' : 'ltr'),
        href: l.href || '',
      }));
      this._render();
    }
    _visibleLangs() {
      const only = list(this.getAttribute('only'));
      let langs = only.length ? this._langs.filter(l => only.includes(l.code.toLowerCase())) : this._langs.slice();
      const byEnglish = this.getAttribute('sort') === 'english';
      const coll = new Intl.Collator('en', { sensitivity: 'base' });
      langs.sort((a, b) => coll.compare(byEnglish ? (a.english || a.name) : a.name, byEnglish ? (b.english || b.name) : b.name));
      if (!byEnglish) {
        // Latin-script names first (Wikipedia-style), other scripts after
        const latin = l => /\p{Script=Latin}/u.test(l.name);
        langs = [...langs.filter(latin), ...langs.filter(l => !latin(l))];
      }
      return langs;
    }
    _suggestedCodes(available) {
      const attr = this.getAttribute('suggested');
      if (attr !== null) return list(attr);
      const have = new Set(available.map(l => l.code.toLowerCase()));
      const out = [];
      for (const tag of navigator.languages || [navigator.language]) {
        const t = String(tag).toLowerCase();
        const pick = have.has(t) ? t : t.split('-')[0];
        if (have.has(pick) && !out.includes(pick)) out.push(pick);
      }
      return out.slice(0, 6);
    }
    /* ---------- rendering ---------- */
    _render() {
      const langs = this._visibleLangs();
      const current = (this.getAttribute('current') || '').toLowerCase();
      const byCode = new Map(langs.map(l => [l.code.toLowerCase(), l]));
      const sug = this._suggestedCodes(langs).map(c => byCode.get(c)).filter(Boolean);
      const curLang = byCode.get(current);
      const label = (this.getAttribute('label') || '{count} languages')
        .replace('{count}', langs.length)
        .replace('{current}', curLang ? curLang.name : '');
      this.$('.label').textContent = label;
      this._btn.setAttribute('aria-label', label + (curLang ? ` (current: ${curLang.english || curLang.name})` : ''));
      const ph = this.getAttribute('placeholder') || 'Search languages';
      this._input.placeholder = ph;
      this._input.setAttribute('aria-label', ph);
      this.$('.sug h3').textContent = this.getAttribute('heading-suggested') || 'Suggested languages';
      this.$('.all h3').textContent = this.getAttribute('heading-all') || 'All languages';
      this.$('.empty').textContent = this.getAttribute('empty-text') || 'No languages match your search.';
      const tplHref = this.getAttribute('href');
      const showEn = this.hasAttribute('show-english');
      const item = l => {
        const url = l.href || (tplHref ? tplHref.replace(/\{code\}/g, encodeURIComponent(l.code)) : '');
        const cur = l.code.toLowerCase() === current;
        const attrs = `class="item" part="item" data-code="${esc(l.code)}" lang="${esc(l.code)}"`
          + ` title="${esc(l.english && l.english !== l.name ? l.english : l.name)}"`
          + (cur ? ' aria-current="true"' : '');
        const inner = `<span dir="${l.dir}">${esc(l.name)}</span>` + (showEn && l.english && l.english !== l.name ? `<small lang="en" dir="ltr">${esc(l.english)}</small>` : '');
        const key = esc(norm(`${l.name} ${l.english} ${l.code}`));
        return `<li data-key="${key}">` + (url
          ? `<a ${attrs} href="${esc(url)}" hreflang="${esc(l.code)}">${inner}</a>`
          : `<button type="button" ${attrs}>${inner}</button>`) + '</li>';
      };
      this.$('.sug ul').innerHTML = sug.map(item).join('');
      this.$('.all ul').innerHTML = langs.map(item).join('');
      this._filter();
    }
    _filter() {
      const q = norm(this._input.value.trim());
      const sugSec = this.$('.sug'), allSec = this.$('.all');
      let shown = 0;
      for (const li of allSec.querySelectorAll('li')) {
        const hit = !q || li.dataset.key.split(' ').some(w => w.startsWith(q)) || li.dataset.key.includes(q);
        li.hidden = !hit;
        if (hit) shown++;
      }
      sugSec.hidden = !!q || !sugSec.querySelector('li');
      allSec.querySelector('h3').hidden = !!q;
      this.$('.empty').hidden = shown > 0;
    }
    /* ---------- positioning (popup mode) ---------- */
    _place() {
      if (this.hasAttribute('inline') || this._panel.hidden) return;
      const r = this._btn.getBoundingClientRect();
      const vw = document.documentElement.clientWidth, vh = window.innerHeight;
      const w = this._panel.offsetWidth;
      const alignLeft = this.getAttribute('align') === 'left';
      let left = alignLeft ? r.left : r.right - w;
      left = Math.max(16, Math.min(left, vw - 16 - w));
      const below = vh - r.bottom - 16, above = r.top - 16;
      const chrome = 70; // search box + borders
      const flip = below < 260 && above > below;
      const room = (flip ? above : below) - chrome - 6;
      this._panel.style.setProperty('--_max-h', Math.max(120, Math.min(room, 320)) + 'px');
      this._panel.style.left = left + 'px';
      if (flip) { this._panel.style.top = ''; this._panel.style.bottom = (vh - r.top + 6) + 'px'; }
      else { this._panel.style.bottom = ''; this._panel.style.top = (r.bottom + 6) + 'px'; }
    }
    _syncInline() {
      const inline = this.hasAttribute('inline');
      this._panel.hidden = !inline;
      this._panel.setAttribute('role', inline ? 'region' : 'dialog');
      this._btn.setAttribute('aria-expanded', 'false');
    }
    _unbind() {
      document.removeEventListener('pointerdown', this._outside, true);
      window.removeEventListener('resize', this._reposition);
      window.removeEventListener('scroll', this._reposition, true);
    }
    /* ---------- selection ---------- */
    _onPick(e) {
      const el = e.target.closest('.item');
      if (!el) return;
      const l = this._langs.find(x => x.code === el.dataset.code);
      const ev = new CustomEvent('language-change', {
        detail: { code: l.code, name: l.name, english: l.english },
        bubbles: true, composed: true, cancelable: true,
      });
      const ok = this.dispatchEvent(ev);
      if (!ok) e.preventDefault();
      // Modifier-clicks (new tab) shouldn't change state here
      if (el.tagName === 'A' && (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1)) return;
      this.setAttribute('current', l.code);
      this.close(true);
    }
    /* ---------- keyboard ---------- */
    _items() {
      return [...this._body.querySelectorAll('section:not([hidden]) li:not([hidden]) .item')];
    }
    _onSearchKey(e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); this._items()[0]?.focus(); }
      else if (e.key === 'Enter') { e.preventDefault(); this._items()[0]?.click(); }
    }
    _onGridKey(e) {
      const items = this._items();
      const i = items.indexOf(this.shadowRoot.activeElement);
      if (i < 0) return;
      const rtl = getComputedStyle(this).direction === 'rtl';
      const cols = getComputedStyle(items[i].closest('ul')).gridTemplateColumns.split(' ').length || 1;
      let j = null;
      switch (e.key) {
        case 'ArrowRight': j = i + (rtl ? -1 : 1); break;
        case 'ArrowLeft':  j = i + (rtl ? 1 : -1); break;
        case 'ArrowDown':  j = Math.min(i + cols, items.length - 1); break;
        case 'ArrowUp':    j = i - cols; if (j < 0) { e.preventDefault(); return this._input.focus(); } break;
        case 'Home':       j = 0; break;
        case 'End':        j = items.length - 1; break;
        default:
          // Typing jumps back to search
          if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) this._input.focus();
          return;
      }
      e.preventDefault();
      if (j >= 0 && j < items.length) {
        items[j].focus();
        items[j].scrollIntoView({ block: 'nearest' });
      }
    }
  }
  customElements.define('ylc-lang-picker', YlcLangPicker);
})();