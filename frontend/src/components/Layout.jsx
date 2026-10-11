// Wraps every page with the Navbar + footer. Used by routes in App.jsx.

import Navbar from './Navbar';

export default function Layout({ children }) {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="app-main">{children}</main>
      <footer className="app-footer">
        <p>© {new Date().getFullYear()} ShopEase — Full Stack Internship Project</p>
      </footer>
    </div>
  );
}