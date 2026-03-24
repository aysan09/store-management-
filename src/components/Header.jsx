import React from 'react';

const Header = ({ title, subtitle, children }) => {
  return (
    <header className="header-section">
      <div className="title-area">
        <h1>{title}</h1>
        {subtitle && <p className="subtitle">{subtitle}</p>}
      </div>
      <div className="header-actions">
        {children}
      </div>
    </header>
  );
};

export default Header;