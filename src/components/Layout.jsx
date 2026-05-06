import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Logo } from './Logo';
import { navItems } from '../data/content';

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
    </>
  );
}
