import React from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children, title, description }) => {
  return (
    <>
      <Helmet>
        <title>{title ? `${title} - Marketplace` : 'Marketplace'}</title>
        <meta name="description" content={description || 'Buy and sell items locally'} />
      </Helmet>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Layout; 