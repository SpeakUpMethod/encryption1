<header class="topbar">
  <a class="brand" href="/index.html">
    <img src="/img/ec1-logo-med.png" alt="">
    <span>EC-1</span>
  </a>
<?php include($_SERVER['DOCUMENT_ROOT'] . '/scripts/languagepicker.txt') ?>

  <nav class="topnav" aria-label="Main">
    <a href="/<?= $isoCode ?>/ec1.php" title="">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
      <span><?= ui('encrypt') ?></span>
    </a>
    <a href="/<?= $isoCode ?>/tools.php" title="">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
      <span><?= ui('tools') ?></span>
    </a>
    <a href="/<?= $isoCode ?>/blog/" title="">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16M4 10h16M4 15h10M4 20h7"/></svg>
      <span><?= ui('blog') ?></span>
    </a>
    <a href="/<?= $isoCode ?>/faq.html" title="">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17.5v.01"/></svg>
      <span><?= ui('help') ?></span>
    </a>

  </nav>
</header>