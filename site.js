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
  notice.querySelector('.notice-booking').focus({ preventScroll: true });
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
  const menuLinks = menu.querySelector('.menu-links');
  const desktopBooking = document.querySelector('.header-booking');
  const compactLayout = matchMedia('(max-width: 49.99rem), (max-width: 60rem) and (orientation: portrait)');
  let closingMenu;

  function finishClose() {
    panel.classList.remove('is-visible');
    menu.close();
    toggle.setAttribute('aria-expanded', 'false');
  }

  function closeMenu(showNotice = false) {
    if (!menu.open || closingMenu) return;

    panel.classList.remove('is-visible');
    const closure = { showNotice };
    closingMenu = closure;
    const motion = panel.getAnimations().map(animation => animation.finished);

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

  toggle.addEventListener('click', () => {
    menu.showModal();
    toggle.setAttribute('aria-expanded', 'true');
    // Commit the offscreen position before starting the transition.
    panel.getBoundingClientRect();
    panel.classList.add('is-visible');
  });

  menu.querySelector('.menu-close').addEventListener('click', () => closeMenu());
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
