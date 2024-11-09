import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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
import AdsPage from './pages/AdSPage/ads';
import Settings from './pages/settingsPage/settings';
import CampusIconMainPage from './pages/campusIcon';
import ImageViewer from './pages/imageViewer';

const queryClient = new QueryClient();

function App() {
  useEffect(() => {
    // Register the service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<CreateComp />} />
          <Route path="/post" element={<AdminFeedPostInterface />} />
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
          <Route path="/ads" element={<AdsPage />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/icons page" element={<CampusIconMainPage />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/view-image" element={<ImageViewer />} />
        </Routes>

        <Toaster
          toastOptions={{
            success: {
              style: {
                background: 'white',
                color: 'black',
              },
              iconTheme: {
                primary: '#4caf50',
                secondary: '#fff',
              },
            },
            error: {
              style: {
                background: 'white',
                color: 'black',
              },
              iconTheme: {
                primary: '#ff5252',
                secondary: '#fff',
              },
            },
            style: {
              background: 'white',
              color: 'black',
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
