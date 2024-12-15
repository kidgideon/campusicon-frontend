import React from 'react';
import { Helmet } from 'react-helmet';
import './SplashScreen.css';

const logo = "https://firebasestorage.googleapis.com/v0/b/campus-icon.appspot.com/o/logo.png?alt=media&token=97374df9-684d-44bf-ba79-54f5cb7d48b7";

const SplashScreen = () => {
  return (
    <div className="splash-screen">
      {/* Helmet for SEO and structured data */}
      <Helmet>
        {/* Basic Meta Tags */}
        <title>Campus Icon - Compete, Rise, and Shine</title>
        <meta
          name="description"
          content="Campus Icon is a platform where students can join exciting competitions, rise to the top, and win rewards. Compete, gain popularity, and win big prizes!"
        />
        <meta
          name="keywords"
          content="Campus Icon, university competitions, campus, rewards, students, icoins, rise and shine, Nigerian campus software, student competitions"
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.campusicon.ng" />

        {/* Open Graph Meta Tags (Facebook, LinkedIn, etc.) */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Campus Icon - Compete, Rise, and Shine" />
        <meta
          property="og:description"
          content="Join exciting campus competitions, rise to the top, and win amazing rewards with Campus Icon!"
        />
        <meta
          property="og:image"
          content={logo}
        />
        <meta property="og:url" content="https://www.campusicon.ng" />

        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Campus Icon - Compete, Rise, and Shine" />
        <meta
          name="twitter:description"
          content="Join exciting campus competitions, rise to the top, and win amazing rewards with Campus Icon!"
        />
        <meta
          name="twitter:image"
          content={logo}
        />
        <meta name="twitter:url" content="https://www.campusicon.ng" />

        {/* Structured Data (JSON-LD) */}
        <script type="application/ld+json">
          {`
            {
              "@context": "http://schema.org",
              "@type": "Organization",
              "name": "Campus Icon",
              "url": "https://www.campusicon.ng",
              "logo": "${logo}",
              "sameAs": [
                "https://www.facebook.com/campusicon",
                "https://www.instagram.com/campusicon",
                "https://twitter.com/campusicon"
              ],
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+234-123-456-789",
                "contactType": "customer service"
              },
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Your Street Address",
                "addressLocality": "City",
                "addressRegion": "State",
                "postalCode": "Postal Code",
                "addressCountry": "NG"
              },
              "description": "Campus Icon is a platform where students can join exciting competitions, rise to the top, and win rewards."
            }
          `}
        </script>
      </Helmet>

      <img src={logo} className="company-logo-splash" alt="Company Logo" />
      <h1>Campus Icon</h1>
    </div>
  );
};

export default SplashScreen;
