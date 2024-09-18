import React from 'react';
import superStarImage from '../../../assets/superCup.png'
import normalStarImage from '../../../assets/starCup.png'
import iconCupImage from '../../../assets/iconCup.png'
const ActiveCompetitions = ({ activeCompetitions }) => {
  return (
    <div className="active-competitions">
      <h2>Active Competitions</h2>
      <ul className='competion-list'>
        {activeCompetitions.map(comp => (
          <div key={comp.id} className='competion'>
            <div className='competion-image'>
              <img 
                src={comp.imageUrl} 
                alt={comp.name} 
              />
            </div>
            <div className='competion-name'>{comp.name}</div>
        <div className="participation"> {comp.videos.length} participations</div>
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
