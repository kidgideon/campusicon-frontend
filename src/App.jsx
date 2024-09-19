import { BrowserRouter as Router, Route, Routes, BrowserRouter } from 'react-router-dom';
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

function App() {
  return (
    <BrowserRouter basename="/campusicon-frontend">
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<CreateComp />} />
        <Route 
          path="/dashboard" 
          element={<ProtectedRoute element={<UserDashboard />} />} 
        />
        <Route path='/fake-users' element={<AddFakeUsers />} />
        <Route path="/profile/:username" element={<UserProfile />} />
        <Route path='/profile' element={<CurrentUserProfile/>} />
        <Route path='/edit profile' element={<EditProfile/>} />
        <Route path='competitions' element={<CompetitionsPage/>} />
        <Route path="/competition/:competitionId" element={<Competition />} />
        <Route path="/upload/:competitionId" element={<UploadVideoForm />} />
        <Route path="/video-performance/:competitionId" element={<Performance/>} />
        <Route path="/ranks/:competitionId" element={<CompetionRank/>} />
        <Route path="/watch-video/:competitionId" element={<VideoWatch/>} />
        <Route path="/discovery-page" element={<DiscoveryPage/>} />
        <Route path="/menu" element={<Menu/>} />
        <Route path="/" element={<Home/>} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
