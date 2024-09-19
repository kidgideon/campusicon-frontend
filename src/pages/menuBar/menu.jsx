  import { Navigate } from "react-router-dom"
  import Logo from '../../assets/logo.png'
import "./menu.css"
const Menu = () => {

    const goBack = () => {
        Navigate(-1);
    }

     return(
        <div className="menu-page-interface">
  <i className="fas fa-arrow-left back-icon" onClick={goBack}></i>
   <div className="menu-page-top-section">
 <div className="menu-page-user-profile">
    <div className="menu-page-user-profile-picture">
        <img src={Logo} alt="" />
    </div>
    <div className="meu-page-username">
        Dennis Mikheme
    </div>
 </div>
   </div>
   <div className="menu-page-menu-options">
    <div className="menu-page-option-list">
        <div className="menu-page-option">
  <div className="menu-page-option-icon">
  <i className="fa-solid fa-square-poll-vertical"></i></div>
  <div className="menu-page-option-text">Campus Rank</div>
        </div>
        <div className="menu-page-option">
  <div className="menu-page-option-icon">
  <i className="fa-solid fa-trophy"></i>
  </div>
  <div className="menu-page-option-text">Competitions</div>
        </div>
    </div>
    <div className="menu-page-option-list">
    <div className="menu-page-option">
  <div className="menu-page-option-icon">
  <i className="fa-solid fa-bullhorn"></i> 
  </div>
  <div className="menu-page-option-text">Create Ad</div>
        </div>
        <div className="menu-page-option">
  <div className="menu-page-option-icon">
  <i class="fa-solid fa-star"></i>
  </div>
  <div className="menu-page-option-text">Match of Day</div>
        </div>
    </div>
    <div className="menu-page-option-list">
    <div className="menu-page-option">
  <div className="menu-page-option-icon">
  <i class="fa-solid fa-user-group"></i>
  </div>
  <div className="menu-page-option-text">Friends</div>
        </div>
        <div className="menu-page-option">
  <div className="menu-page-option-icon">
  <i class="fa-solid fa-award"></i>
  </div>
  <div className="menu-page-option-text">Awards and Ranks</div>
        </div>
    </div>
  </div>
   <div className="menu-page-settings-privacy">
     <h3>settings and privacy</h3>
    <div className="settings-block-menu-page">
        <div className="settings-block-icon">
        <i class="fa-solid fa-gear"></i>
        </div>
        <div className="settings-block-text">Settings</div>
    </div>
      <h3>help and support</h3>
      <div className="settings-block-menu-page">
        <div className="settings-block-icon"><i class="fa-solid fa-circle-xmark"></i></div>
        <div className="settings-block-text">Report a Problem</div> 
    </div>

    <div className="settings-block-menu-page">
        <div className="settings-block-icon">
        <i class="fa-solid fa-file-contract"></i>
        </div>
        <div className="settings-block-text">Sponsorship and endorsement</div>
    </div>

    <div className="settings-block-menu-page">
        <div className="settings-block-icon">
        <i class="fa-solid fa-address-card"></i>
        </div>
        <div className="settings-block-text">About</div>
    </div>

    <div className="settings-block-menu-page">
        <div className="settings-block-icon">
        <i class="fa-solid fa-right-from-bracket"></i>
        </div>
        <div className="settings-block-text">Logout</div>
    </div>

   </div>
        </div>
     )
}

export default Menu;

// 