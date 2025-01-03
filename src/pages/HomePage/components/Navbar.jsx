import { useState } from "react";
import { Link } from "react-router-dom";

const Nav = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  return (
    <nav className="flex justify-between items-center p-4 mb-8 mx-auto w-11/12 bg-white rounded-lg">
      <div className="text-sm font-bold text-[#277aa4]">CampusIcon</div>
      <div className="mobile-off md:flex space-x-6 ">
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

      <div className="mobile-off md:!flex space-x-4 text-white ">
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

      <div className="md:hidden relative ">
        <button
          id="menu-btn"
          onClick={toggleSidebar}
          className="text-white focus:outline-none flex items-center bh-"
          aria-expanded="false"
        >
          <i className="fa-solid fa-bars"></i>
        </button>



        <div
          className={`${sidebarOpen ? 'block' : 'mobile-off'} absolute -right-4 mt-2 bg-white shadow-lg rounded-lg p-3 px-14 space-y-4`}
        >
          <a
            href="#"
            className="block text-gray-800 hover:text-[#277aa4] transition"
          >
            Home
          </a>
          <a
            href="#"
            className="block text-gray-800 hover:text-[#277aa4] transition"
          >
            About Us
          </a>
          <a
            href="#"
            className="block text-gray-800 hover:text-[#277aa4] transition"
          >
            How It Works
          </a>
          <a
            href="#"
            className="block text-gray-800 hover:text-[#277aa4] transition"
          >
            Testimonials
          </a>
          <a
            href="#"
            className="block text-gray-800 hover:text-[#277aa4] transition"
          >
            Contact
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Nav;
