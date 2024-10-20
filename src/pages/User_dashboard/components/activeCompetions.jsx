import React from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Import useNavigate
import superStarImage from '../../../assets/superCup.png';
import normalStarImage from '../../../assets/starCup.png';
import iconCupImage from '../../../assets/iconCup.png';


const ActiveCompetitions = ({ activeCompetitions }) => {
  const navigate = useNavigate(); // Get the navigate function

  const handleClick = (id) => {
    // Navigate to the dynamic competition route
    navigate(`/competition/${id}`);
  };

  return (
    <div className="active-competitions">
      <ul className='competion-list'>
        {activeCompetitions.map(comp => (
          <div key={comp.id} className='competion'>
            <div className='competion-image' onClick={() => handleClick(comp.id)}>
              <img 
                src={comp.imageUrl} 
                alt={comp.name} 
                style={{ cursor: 'pointer' }} // Add cursor style to indicate clickability
              />
            </div>
            <div className='competion-name'>{comp.name}</div>
            <div className="participation">{comp.videos.length} participations</div>
            <div className='competion-award'>
              {comp.type === 'Normal Star Award' && (
                <img 
                  src={normalStarImage} 
                  alt="Normal Star Award" 
                />
              )}
              {comp.type === 'Super Star Award' && (
                <img 
                  src={superStarImage} 
                  alt="Super Star Award" 
                />
              )}
              {comp.type === 'Icon Award' && (
                <img 
                  src={iconCupImage} 
                  alt="Icon Award" 
                />
              )}
            </div>
          </div>
        ))}
      </ul>
    </div>
  );
};

export default ActiveCompetitions;
