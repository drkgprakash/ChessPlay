import React, { useState } from 'react';
import { Navbar, PageId } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { FeaturesPage } from './pages/FeaturesPage';
import { WhyUsPage } from './pages/WhyUsPage';
import { PricingPage } from './pages/PricingPage';
import { BlogPage } from './pages/BlogPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageId>('home');

  return (
    <div className="min-h-screen bg-[#0e0d0b] text-zinc-100 flex flex-col font-sans">
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />

      <main className="flex-1">
        {currentPage === 'home' && <HomePage setCurrentPage={setCurrentPage} />}
        {currentPage === 'features' && <FeaturesPage setCurrentPage={setCurrentPage} />}
        {currentPage === 'why-us' && <WhyUsPage setCurrentPage={setCurrentPage} />}
        {currentPage === 'pricing' && <PricingPage setCurrentPage={setCurrentPage} />}
        {currentPage === 'blog' && <BlogPage setCurrentPage={setCurrentPage} />}
        {currentPage === 'about' && <AboutPage setCurrentPage={setCurrentPage} />}
        {currentPage === 'contact' && <ContactPage />}
      </main>

      <Footer setCurrentPage={setCurrentPage} />
    </div>
  );
};

export default App;
