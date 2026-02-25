import React from 'react';
import logo from './vascom-logo.png';
import laptopImg from './fi-removebg-preview.png';

export default function HeroPage({ onLoginClick }) {
  return (
    <div className="page">
      <header className="topbar">
        <img className="logo" alt="Vascom logo" src={logo} />
        <button className="login" onClick={onLoginClick}>Login</button>
      </header>

      <main className="hero">
        <div className="hero-left">
          <h1 className="title">Vascom Store<br/>Management<br/>System</h1>
          <button className="cta" onClick={onLoginClick}>Request an Item</button>
        </div>
        <div className="hero-right">
          <img className="laptop" src={laptopImg} alt="Laptop mock" />
        </div>
      </main>
    </div>
  );
}