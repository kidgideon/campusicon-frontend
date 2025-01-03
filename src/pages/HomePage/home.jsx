import Nav from "./components/Navbar";

const Home = () => {

  return (
    <>
      <div className="text-center pb-9 pt-6 bg-black ">
       <Nav />

        <div className="w-10/12 mx-auto flex flex-wrap items-center gap-8 text-white">
          <div className="w-full md:w-6/12">
            <p className="text-2xl sm:text-3xl md:text-3xl lg:text-[35px] font-semibold">
              Showcase your talent, earn rewards, and rise to the top!
            </p>
            <p className="mt-4 text-sm sm:text-l">
              Join a thriving community of talent enthusiasts. Compete in
              exciting challenges, earn iCoins, and unlock amazing rewards as
              you level up. The more you participate, the more you win!
            </p>
          </div>
          <div className="w-full md:w-5/12">
            <img
              className="w-8/12 sm:w-7/12 md:w- lg:w-8/12 rounded-full shadow-lg mx-auto"
              src="images/undraw_people_ka7y-removebg-preview.png"
              alt=""
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap w-11/12 justify-between mx-auto gap-10 py-8 lg:py-0 px-4 lg:px-0">
        <div className="flex lg:w-10/12 mx-auto items-center text-gray-800 gap-3">
          <div>
            <p className="text-lg lg:text-4xl font-semibold lg:mb-4">
              Get Rewarded
            </p>
            <p className="mt-1 text-xs lg:text-sm">
              The Campus Icon App lets you earn iCoins by competing in
              challenges, which you can cash out, plus enjoy daily tasks and
              exclusive levels.
            </p>
            <button className="bg-[#277aa4] text-white py-3 px-5 rounded-lg text-xs mt-2">
              Get started
            </button>
          </div>
          <div>
            <img
              className="w-[40em] lg:w-[30em]"
              src="images/undraw_winners_fre4.png"
              alt="Transform Your Passion"
            />
          </div>
        </div>

        <div className="mx-auto w-10/12 text-center py-6">
          <p className="text-lg font-semibold text-gray-800 mb-8">
            Show Us Your Talent!
          </p>
          <div className="flex flex-wrap justify-center gap-10">
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
