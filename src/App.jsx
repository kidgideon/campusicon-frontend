import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useState, useEffect } from 'react'; // Import necessary hooks
import Register from './pages/register_components/register';
import Login from './pages/login_components/login';
import UserDashboard from './pages/User_dashboard/userDashboard';
import ProtectedRoute from '../src/utils/protectedRoute';
import AddFakeUsers from './fakeusers';
import CreateComp from '../src/pages/competition/adminCompetitionInterface';
import UserProfile from './pages/userProfile/userProfile';
import CurrentUserProfile from './pages/userProfile/currentUserProfile';
import EditProfile from './pages/userProfile/editProfile';
import CompetitionsPage from './pages/competition/competionPage';
import Competition from './pages/competition/competion';
import UploadVideoForm from './pages/competition/uploadVideo';
import Performance from './pages/competition/performancePage';
import CompetionRank from './pages/competition/rankPage';
import VideoWatch from './pages/competition/videoWatch';
import DiscoveryPage from './pages/discoveryPage/discoveryPage';
import Menu from './pages/menuBar/menu';
import Home from './pages/HomePage/home';
import AdminFeedPostInterface from './pages/ADMIN-SECTION/postFeed';
import CampusRank from './pages/campusRank/CampusRank';
import AwardsandRank from './pages/Awards-and-Rank/awards-and-rank';
import Friends from './pages/Friends/friends';
import Notifications from './pages/Notification/notification';
import NotFound from './pages/404/NotFound';
import SplashScreen from './pages/SplashScreen';
import AdsPage from './pages/AdSPage/ads';
import Settings from './pages/settingsPage/settings';

function App() {
  const [showSplash, setShowSplash] = useState(true); // State to track splash screen visibility

  useEffect(() => {
    // Hide the splash screen after 3 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 6000); // Adjust the duration as needed

    // Cleanup timer if component unmounts before timeout is completed
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {showSplash ? (
        // Show the splash screen while `showSplash` is true
        <SplashScreen />
      ) : (
        // Render the app once the splash screen is hidden
        <BrowserRouter>
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/friends" element={<Friends />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<CreateComp />} />
            <Route path="/admin/post" element={<AdminFeedPostInterface />} />
            <Route path="/awards-ranks" element={<AwardsandRank />} />
            <Route path="" element={<ProtectedRoute element={<UserDashboard />} />} />
            <Route path="/campus-rank" element={<CampusRank />} />
            <Route path='/fake-users' element={<AddFakeUsers />} />
            <Route path="/profile/:username" element={<UserProfile />} />
            <Route path='/profile' element={<CurrentUserProfile />} />
            <Route path='/edit-profile' element={<EditProfile />} />
            <Route path='competitions' element={<CompetitionsPage />} />
            <Route path="/competition/:competitionId" element={<Competition />} />
            <Route path="/upload/:competitionId" element={<UploadVideoForm />} />
            <Route path="/video-performance/:competitionId" element={<Performance />} />
            <Route path="/ranks/:competitionId" element={<CompetionRank />} />
            <Route path="/watch-video/:competitionId" element={<VideoWatch />} />
            <Route path="/discovery-page" element={<DiscoveryPage />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/home" element={<Home />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/ads" element={<AdsPage/>} />
            <Route path="/settings" element={<Settings/>} />
            {/* Catch-all route for 404 Not Found */}
            <Route path="*" element={<NotFound />} />
          </Routes>

          {/* Toaster with Dark Theme */}
          <Toaster
            toastOptions={{
              success: {
                style: {
                  background: '#333', // Dark background
                  color: '#4caf50',    // Success green color
                },
                iconTheme: {
                  primary: '#4caf50',
                  secondary: '#fff',
                },
              },
              error: {
                style: {
                  background: '#333', // Dark background
                  color: '#ff5252',   // Error red color
                },
                iconTheme: {
                  primary: '#ff5252',
                  secondary: '#fff',
                },
              },
              style: {
                background: '#333',  // Default dark background for all toasts
                color: '#fff',        // Default text color
              },
            }}
          />
        </BrowserRouter>
      )}
    </>
  );
}

export default App;
