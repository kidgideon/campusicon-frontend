import Nav from "./components/Navbar";

const Home = () => {
  return (
    <>
      <div className="text-center py-7 md:py-16 bg-black ">
        <Nav />

        <div className="w-10/12 mx-auto flex flex-col lg:flex-row gap-8 text-left text-white mt-24">
          <div className="w-full lg:w-7/12">
            <p className="text-2xl sm:text-3xl md:text-5xl lg:text-7xl text-left font-semibold">
              Showcase your talent, earn rewards, and rise to the top!
            </p>
            <p className="mt-4 text-sm sm:text-lg lg:w-10/12 ">
              Join a thriving community of talent enthusiasts. Compete in
              exciting challenges, earn iCoins, and unlock amazing rewards as
              you level up. The more you participate, the more you win!
            </p>
          </div>
          <div className="w-full lg:w-5/12">
            <img
              className="shadow-lg mx-auto"
              src="images/undraw_people_ka7y-removebg-preview.png"
              alt=""
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap w-11/12 justify-between mx-auto gap-10 py-8 lg:py-0 px-4 lg:px-0">
        <div className="flex flex-col md:flex-row lg:w-10/12 mx-auto items-center text-gray-800 gap-3">
          <div className="order-2 md:order-1">
            <img
              className=""
              src="images/undraw_winners_fre4.png"
              alt="Transform Your Passion"
            />
            <div className="flex justify-center ">
              <button className="lg:hidden bg-[#277aa4] text-white py-3 px-6 rounded-lg text-xs mt-4">
                Get started
              </button>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <p className="text-lg lg:text-4xl font-semibold lg:mb-4">
              Get Rewarded
            </p>
            <p className="mt-4 text-xs lg:text-lg">
              The Campus Icon App lets you earn iCoins by competing in
              challenges, which you can cash out, plus enjoy daily tasks and
              exclusive levels.
            </p>
            <button className="mobile-off lg:block bg-[#277aa4] text-white py-3 px-6 rounded-lg text-xs mt-4">
              Get started
            </button>
          </div>
        </div>

        <div className="mx-auto w-10/12 text-center py-6 md:overflow-x-scroll">
          <p className="text-lg font-semibold text-gray-800 mb-8">
            Show Us Your Talent!
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-10">
            <div className="flex flex-col items-center w-40">
              <img
                className="w-32 h-32 rounded-full shadow-gray-400 shadow-lg mb-4"
                src="images/2933.jpg"
                alt="Singing Talent"
              />
              <p className="font-semibold">Have you got a singing talent?</p>
            </div>
            <div className="flex flex-col items-center w-40">
              <img
                className="w-32 h-32 rounded-full shadow-gray-400 shadow-lg mb-4"
                src="images/14166.jpg"
                alt="Dancing Talent"
              />
              <p className="font-semibold">Have you got a dancing talent?</p>
            </div>

            <div className="flex flex-col items-center w-40">
              <img
                className="w-32 h-32 rounded-full shadow-gray-400 shadow-lg mb-4"
                src="images/2933.jpg"
                alt="Singing Talent"
              />
              <p className="font-semibold">Have you got a singing talent?</p>
            </div>
            <div className="flex flex-col items-center w-40">
              <img
                className="w-32 h-32 rounded-full shadow-gray-400 shadow-lg mb-4"
                src="images/14166.jpg"
                alt="Dancing Talent"
              />
              <p className="font-semibold">Have you got a dancing talent?</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
