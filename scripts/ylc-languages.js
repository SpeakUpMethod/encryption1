  customElements.whenDefined('ylc-lang-picker').then(() => {
    // Only pages whose picker has id="langs" use this list; on any other page, do nothing (no console error).
    const picker = document.getElementById('langs');
    if (!picker) return;
    picker.languages = [
      { code: 'cs', name: 'Čeština',  english: 'Czech', href: '/cs/index.php' },
      { code: 'de', name: 'Deutsch',  english: 'German', href: '/de/index.php' },
      { code: 'en', name: 'English',  english: 'Englsh', href: '/en/index.php' },
	  { code: 'es', name: 'Español',  english: 'Spanish', href: '/es/index.php' },
      { code: 'fr', name: 'Français',  english: 'French', href: '/fr/index.php' },
      { code: 'it', name: 'Italiano',  english: 'Italian', href: '/it/index.php' },
      { code: 'pl', name: 'Polski',  english: 'Polish', href: '/pl/index.php' },
      { code: 'pt_BR', name: 'Português (Brasil)',  english: 'Portuguese (Brazil)', href: '/pt_BR/index.php' },
      { code: 'pt', name: 'Português',  english: 'Portuguese', href: '/pt/index.php' },
      { code: 'vi', name: 'Tiếng Việt',  english: 'Vietnamese', href: '/vi/index.php' },
      { code: 'hi', name: 'हिन्दी',  english: 'Hindi', href: '/hi/index.php' },
      { code: 'ru', name: 'Русский',  english: 'Russian', href: '/ru/index.php' },
      { code: 'ar', name: 'العربية',  english: 'Arabic', href: '/ar/index.php' },
      { code: 'my', name: 'မြန်မာဘာသာစကား',  english: 'Burmese', href: '/my/index.php' },
      { code: 'jp', name: '日本語',  english: 'Japanese', href: '/jp/index.php' },
      { code: 'zh_hans', name: '简体中文',  english: 'Chinese (Simplified)', href: '/zh_hans/index.php' },
      { code: 'zh_hant', name: '繁體中文',  english: 'Chinese (Traditional)', href: '/zh_hant/index.php' },
	  { code: 'ko', name: '한국어',  english: 'Korean', href: '/ko/index.php' },
    ];
  });