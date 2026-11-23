'use strict';

document.documentElement.classList.add('js');

const menuButton = document.querySelector('.menu-toggle');
const navLinks = document.getElementById('nav-links');
if (menuButton && navLinks) {
  menuButton.hidden = false;
  const closeMenu = () => {
    menuButton.setAttribute('aria-expanded', 'false');
    navLinks.classList.remove('is-open');
  };
  menuButton.addEventListener('click', () => {
    const expanded = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(expanded));
    navLinks.classList.toggle('is-open', expanded);
  });
  navLinks.addEventListener('click', event => {
    if (event.target.closest('a')) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      menuButton.focus();
    }
  });
  window.matchMedia('(min-width: 761px)').addEventListener('change', closeMenu);
}

const tabList = document.querySelector('[role="tablist"]');
if (tabList) {
  const tabs = [...tabList.querySelectorAll('[role="tab"]')];
  const selectTab = selected => {
    tabs.forEach(tab => {
      const active = tab === selected;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      document.getElementById(tab.getAttribute('aria-controls')).hidden = !active;
    });
  };
  tabs.forEach(tab => {
    const panel = document.getElementById(tab.getAttribute('aria-controls'));
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tab.id);
    panel.tabIndex = 0;
    panel.querySelector('h3').hidden = true;
    tab.addEventListener('click', () => selectTab(tab));
  });
  tabList.addEventListener('keydown', event => {
    const current = tabs.indexOf(document.activeElement);
    if (current === -1) return;
    let next;
    if (event.key === 'ArrowRight') next = (current + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (current - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next !== undefined) {
      event.preventDefault();
      selectTab(tabs[next]);
      tabs[next].focus();
    }
  });
  selectTab(tabs[0]);
  tabList.hidden = false;
}

const dialog = document.getElementById('project-modal');
if (dialog && typeof dialog.showModal === 'function') {
  const content = document.getElementById('modal-content');
  let opener;
  document.querySelectorAll('[data-project]').forEach(button => {
    const template = document.getElementById(`preview-${button.dataset.project}`);
    if (!template) return;
    button.hidden = false;
    button.addEventListener('click', () => {
      opener = button;
      content.replaceChildren(template.content.cloneNode(true));
      dialog.setAttribute('aria-labelledby', `preview-title-${button.dataset.project}`);
      dialog.showModal();
      document.body.classList.add('modal-open');
    });
  });
  dialog.querySelector('.close-dialog').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const bounds = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) {
      dialog.close();
    }
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('modal-open');
    opener?.focus();
  });
}

document.querySelectorAll('[data-year]').forEach(node => {
  node.textContent = String(new Date().getFullYear());
});
