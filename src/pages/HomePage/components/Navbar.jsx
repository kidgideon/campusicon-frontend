import { use, useEffect } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";

const Nav = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden"; // Disable scrolling when the sidebar is open
    } else {
      document.body.style.overflow = ""; // Re-enable scrolling
    }

    return () => {
      document.body.style.overflow = ""; // Cleanup to prevent side effects
    };
  }, [sidebarOpen]);
  return (
    <nav className="flex fixed shadow-md top-0 justify-between items-center p-4 mb-8 w-full bg-white lg:px-24 z-50">
      <div className="lg:text-2xl font-bold text-[#277aa4]">CampusIcon</div>
      <div className="mobile-off lg:flex space-x-6 ">
        <a href="#" className="text-gray-800 hover:text-[#277aa4] transition">
          Home
        </a>
        <a href="#" className="text-gray-800 hover:text-[#277aa4] transition">
          About Us
        </a>
        <a href="#" className="text-gray-800 hover:text-[#277aa4] transition">
          How It Works
        </a>
        <a href="#" className="text-gray-800 hover:text-[#277aa4] transition">
          Testimonials
        </a>
        <a href="#" className="text-gray-800 hover:text-[#277aa4] transition">
          Contact
        </a>
      </div>

      <div className="mobile-off lg:flex space-x-4 text-white ">
        <Link
          to="/"
          className="px-4 py-2 bg-black border border-white rounded-md hover:bg-[#277aa4] transition"
        >
          Log In
        </Link>
        <Link
          to="/"
          className="px-4 py-2 bg-black rounded-md hover:bg-[#277aa4] transition"
        >
          Sign Up
        </Link>
      </div>

      {!sidebarOpen && (
        <button
          id="menu-btn"
          onClick={toggleSidebar}
          className="text-white focus:outline-none flex items-center lg:hidden"
          aria-expanded="false"
        >
          <i className="fa-solid fa-bars"></i>
        </button>
      )}

      <div className={`${sidebarOpen ? "block" : "mobile-off"} lg:hidden `}>
        {sidebarOpen && (
          <button
            id="menu-btn"
            onClick={toggleSidebar}
            className="text-white focus:outline-none flex items-center bh-"
            aria-expanded="false"
          >
            <i className="fa-solid fa-close"></i>
          </button>
        )}

        <div
          className={`h-screen absolute -right-4 mt-2 bg-white shadow-lg rounded-lg w-2/3 space-y-8 text-sm`}
        >
          <Link
            to="#"
            className="block text-gray-800 hover:text-[#277aa4] transition"
          >
            Home
          </Link>
          <Link
            to="#"
            className="block text-gray-800 hover:text-[#277aa4] transition"
          >
            About Us
          </Link>
          <Link
            to="#"
            className="block  text-gray-800 hover:text-[#277aa4] transition"
          >
            How It Works
          </Link>
          <Link
            to="#"
            className="block text-gray-800 hover:text-[#277aa4] transition"
          >
            Testimonials
          </Link>
          <Link
            to="#"
            className="block text-gray-800 hover:text-[#277aa4] transition"
          >
            Contact
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Nav;
