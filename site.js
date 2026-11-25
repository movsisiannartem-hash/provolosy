const menu = document.getElementById('mobile-menu');
const notice = document.getElementById('section-notice');
const toggle = document.querySelector('.menu-toggle');
const hasNativeNotice = typeof notice.showPopover === 'function';
let noticeTrigger;

function openNotice(trigger) {
  if (hasNativeNotice) {
    notice.showPopover();
    return;
  }

  noticeTrigger = trigger;
  notice.setAttribute('data-visible', '');
  notice.focus({ preventScroll: true });
}

if (!hasNativeNotice) {
  function dismissNotice() {
    notice.removeAttribute('data-visible');
    noticeTrigger?.focus({ preventScroll: true });
  }

  document.addEventListener('click', event => {
    const control = event.target.closest('[popovertarget="section-notice"]');
    if (!control) return;

    event.preventDefault();
    if (control.getAttribute('popovertargetaction') === 'hide') {
      dismissNotice();
    } else if (!menu.open) {
      openNotice(control);
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && notice.hasAttribute('data-visible')) dismissNotice();
  });
}

if (typeof menu.showModal === 'function') {
  const navigation = document.getElementById('site-nav');
  const panel = menu.querySelector('.menu-panel');
  const menuClose = menu.querySelector('.menu-close');
  const menuLinks = menu.querySelector('.menu-links');
  const desktopBooking = document.querySelector('.header-booking');
  const compactLayout = matchMedia('(max-width: 49.99rem), (max-width: 60rem) and (orientation: portrait)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let openingFrame;
  let closingMenu;

  function finishClose() {
    cancelAnimationFrame(openingFrame);
    menu.classList.remove('is-visible');
    menu.close();
    toggle.setAttribute('aria-expanded', 'false');
  }

  function closeMenu(showNotice = false) {
    if (!menu.open || closingMenu) return;

    cancelAnimationFrame(openingFrame);
    menu.classList.remove('is-visible');
    menuClose.setAttribute('aria-label', 'Открыть меню');

    const closure = { showNotice };
    closingMenu = closure;
    const motion = [panel, menuClose].flatMap(element =>
      element.getAnimations({ subtree: true }).map(animation => animation.finished)
    );

    Promise.allSettled(motion).then(() => {
      if (closingMenu !== closure) return;

      closingMenu = undefined;
      finishClose();
      toggle.focus({ preventScroll: true });
      if (showNotice) openNotice(toggle);
    });
  }

  function updateNavigation() {
    const focused = document.activeElement;
    if (compactLayout.matches) {
      menuLinks.append(navigation);
      toggle.classList.add('is-enabled');
      if (navigation.contains(focused) || focused === desktopBooking) {
        toggle.focus({ preventScroll: true });
      }
      return;
    }

    const showNotice = closingMenu?.showNotice;
    if (menu.open) {
      closingMenu = undefined;
      finishClose();
    }
    desktopBooking.before(navigation);
    toggle.classList.remove('is-enabled');
    const navButton = navigation.querySelector('button');
    if (menu.contains(focused) || navigation.contains(focused) || focused === toggle) {
      const target = navigation.contains(focused) ? focused : navButton;
      target.focus({ preventScroll: true });
    }
    if (showNotice) openNotice(navButton);
  }

  function showMenu(event) {
    menu.toggleAttribute('data-keyboard', event.detail === 0);
    menuClose.setAttribute('aria-label', 'Закрыть меню');

    if (menu.open) {
      closingMenu = undefined;
      menu.classList.add('is-visible');
      return;
    }

    menu.showModal();
    toggle.setAttribute('aria-expanded', 'true');
    if (reducedMotion.matches) {
      menu.classList.add('is-visible');
      return;
    }

    // Give the newly opened dialog a rendered frame before moving its panel.
    openingFrame = requestAnimationFrame(() => {
      openingFrame = requestAnimationFrame(() => menu.classList.add('is-visible'));
    });
  }

  toggle.addEventListener('click', showMenu);
  menuClose.addEventListener('click', event => {
    if (closingMenu) {
      showMenu(event);
    } else {
      closeMenu();
    }
  });
  menu.addEventListener('cancel', event => {
    event.preventDefault();
    closeMenu();
  });
  navigation.addEventListener('click', event => {
    if (menu.open && event.target.closest('[popovertarget]')) {
      event.preventDefault();
      closeMenu(true);
    }
  });
  compactLayout.addEventListener('change', updateNavigation);
  updateNavigation();
}
