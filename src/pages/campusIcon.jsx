import "./campusIcon.css"
import {  useNavigate } from 'react-router-dom';
import normalStarAwards from '../assets/starCup.png';
import superCupAwards from '../assets/superCup.png';
import iconAwards from '../assets/iconCup.png';
const logo = "https://firebasestorage.googleapis.com/v0/b/campus-icon.appspot.com/o/logo.png?alt=media&token=97374df9-684d-44bf-ba79-54f5cb7d48b7";

const CampusIconMainPage = () => {
   const navigate = useNavigate();

   const goBack = () => {
     navigate(-1);
   }

  return (
    <div className='profile-structure'>
   <div className="top-top-sideliners">
        <i className="fas fa-arrow-left " onClick={goBack}></i>
        <h2>Profile</h2>
      </div>
    <div className="profile-top">
      <div className="profile-pic-name">
        <div className="profile-pic">
          <img src={logo} alt="" />
        </div>
        <div className="fullname">
          <p>Campus Icon</p>
        </div>
      </div>
      <div className="points-status">
        <div className="campus-points">
          <p className='points'>10000</p>
          <p className='p-text'>campus points</p>
        </div>
        <div className="campus-status">
          <p>Campus Icon</p>
        </div>
      </div>
    </div>

    <div className="user-bio">
      <p>welcome to the icon's profile</p>
    </div>


    <div className="trophies">
      <div className="normal-star-award">
        <img className='award-img-profle' src={normalStarAwards} alt="Normal Star Award" />
        <p className='normal-star-count'>100</p>
      </div>
      <div className='super-star-award'>
        <img className='award-img-profle' src={superCupAwards} alt="Super Star Award" />
        <p className='super-star-count'>100</p>
      </div>
      <div className='icon-award'>
        <img className='award-img-profle' src={iconAwards} alt="Icon Award" />
        <p className='icon-awards-count'>100</p>
      </div>
    </div>


     <h3>posts</h3>

  </div>
  );
};

export default CampusIconMainPage;
