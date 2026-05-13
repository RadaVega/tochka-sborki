import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Logo } from './Logo';
import { navItems } from '../data/content';

const communityLinks = [
  { label: 'ВКонтакте', href: 'https://vk.com/tochkasborki21', icon: 'VK' },
  { label: 'Telegram', href: 'https://t.me/tochka_sborki', icon: 'TG' }
];

export function Layout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      <header className="site-header">
        <nav className="nav-shell" aria-label="Основная навигация">
          <NavLink to="/" className="brand-link" onClick={() => setOpen(false)}>
            <Logo compact />
          </NavLink>
          <button className="menu-button" type="button" aria-expanded={open} aria-controls="main-menu" onClick={() => setOpen((value) => !value)}>
            <span />
            <span />
            <span />
            <span className="sr-only">Открыть меню</span>
          </button>
          <div id="main-menu" className={`nav-links ${open ? 'is-open' : ''}`}>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>
      </header>
      <main key={location.pathname}>
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="footer-shell">
          <Logo compact />
          <div className="community-block" aria-label="Каналы сообщества">
            <strong>Присоединяйтесь к нам</strong>
            <div className="community-links">
              {communityLinks.map((link) => (
                <a key={link.href} href={link.href} target="_blank" rel="noreferrer" aria-label={link.label}>
                  <span>{link.icon}</span>
                  {link.label}
                </a>
              ))}
            </div>
            <p>MAX Messenger: канал ⚡ Точка Сборки | Сигнал. Пригласительная ссылка будет размещена здесь.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
