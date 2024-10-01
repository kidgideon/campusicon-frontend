import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Register from './pages/register_components/register';
import Login from './pages/login_components/login';
import UserDashboard from './pages/User_dashboard/userDashboard'; // Ensure starts with an uppercase letter
import ProtectedRoute from '../src/utils/protectedRoute'; // Adjust import path if needed
import AddFakeUsers from './fakeusers';
import CreateComp from '../src/pages/competition/adminCompetitionInterface';
import UserProfile from './pages/userProfile/userProfile'; // Ensure this import is correct
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
function App() {
  return (
    <BrowserRouter basename="/campusicon-frontend">
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/friends" element={<Friends/>} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<CreateComp />} />
        <Route path="/admin/post" element={<AdminFeedPostInterface />} />
        <Route path="/awards-ranks" element={<AwardsandRank />} />
        <Route 
          path="/" 
          element={<ProtectedRoute element={<UserDashboard />} />} 
        />
         <Route path="/campus-rank" element={<CampusRank/>} />
        <Route path='/fake-users' element={<AddFakeUsers />} />
        <Route path="/profile/:username" element={<UserProfile />} />
        <Route path='/profile' element={<CurrentUserProfile/>} />
        <Route path='/edit-profile' element={<EditProfile/>} />
        <Route path='competitions' element={<CompetitionsPage/>} />
        <Route path="/competition/:competitionId" element={<Competition />} />
        <Route path="/upload/:competitionId" element={<UploadVideoForm />} />
        <Route path="/video-performance/:competitionId" element={<Performance/>} />
        <Route path="/ranks/:competitionId" element={<CompetionRank/>} />
        <Route path="/watch-video/:competitionId" element={<VideoWatch/>} />
        <Route path="/discovery-page" element={<DiscoveryPage/>} />
        <Route path="/menu" element={<Menu/>} />
        <Route path="/home" element={<Home/>} />
        <Route path="/notifications" element={<Notifications/>} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
