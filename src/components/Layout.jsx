import React from 'react';
import Header from './Header';
import Footer from './Footer';

export default function Layout({ children }) {
  return (
    <>
      <Header />
      <main className="main-container" style={{ minHeight: '80vh' }}>
        {children}
      </main>
      <Footer />
    </>
  );
}
