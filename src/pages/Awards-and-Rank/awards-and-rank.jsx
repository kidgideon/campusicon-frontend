import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import normalStarAwards from "../../assets/starCup.png";
import superCup from '../../assets/superCup.png';
import iconCup from '../../assets/iconCup.png';
import './AwardsandRank.css';

const campusStatusTiers = [
  { status: 'Lad', minPoints: 0, maxPoints: 499 },
  { status: 'Rising Star', minPoints: 500, maxPoints: 1499 },
  { status: 'Pace Setter', minPoints: 1500, maxPoints: 2499 },
  { status: 'Influencer', minPoints: 2500, maxPoints: 3499 },
  { status: 'Social Maven', minPoints: 3500, maxPoints: 4499 },
  { status: 'Iconic Figure', minPoints: 4500, maxPoints: 5499 },
  { status: 'Trailblazer', minPoints: 5500, maxPoints: 6499 },
  { status: 'Legend', minPoints: 6500, maxPoints: 7499 },
  { status: 'Campus Legend', minPoints: 7500, maxPoints: 8499 },
  { status: 'Campus Icon', minPoints: 8500, maxPoints: 10000 }
];

const AwardsandRank = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const sections = document.querySelectorAll('.fade-in');
    const options = { threshold: 0.1, rootMargin: '0px 0px -100px 0px' };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('appear');
          observer.unobserve(entry.target);
        }
      });
    }, options);

    sections.forEach((section) => observer.observe(section));
  }, []);

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="awards-rank-interface">
      <i className="fas fa-arrow-left back-icon" onClick={goBack}></i>
      <h1 className="awards-rank-interface-header fade-in">Awards and Ranks in Campus Icon</h1>
      
      <section className="awards-rank-interface-section fade-in">
        <h2>How to Earn Campus Streaks</h2>
        <p>
          Campus Streaks are earned by participating in competitions, receiving votes from other users, and winning competitions. The more votes you get, the more points you’ll accumulate.
        </p>
        <p>
          Additionally, if you're selected for the "Match of the Day" and win against your opponent, you earn extra Campus Streaks!
        </p>
      </section>

      <section className="awards-rank-interface-section fade-in">
        <h2>Earn Streaks by Inviting Friends</h2>
        <p>
          Invite your friends to join Campus Icon, and for each person that registers with your username as the referral code, you will earn additional Campus Streaks. Keep sharing and watch your rank rise!
        </p>
      </section>

      <section className="awards-rank-interface-section fade-in">
        <h2>Cup Types and Points</h2>
        <div className="awards-rank-cups">
          <div className="awards-rank-cup-item">
            <img src={normalStarAwards} alt="Normal Cup" />
            <h3>Normal Cup</h3>
            <p>Points: 100</p>
          </div>
          <div className="awards-rank-cup-item">
            <img src={superCup} alt="Super Cup" />
            <h3>Super Cup</h3>
            <p>Points: 250</p>
          </div>
          <div className="awards-rank-cup-item">
            <img src={iconCup} alt="Icon Cup" />
            <h3>Icon Cup</h3>
            <p>Points: 500</p>
          </div>
        </div>
        <p>
          Compete in Campus Icon competitions and aim to win a Normal Cup, Super Cup, or the prestigious Icon Cup!
        </p>
      </section>

      <section className="awards-rank-interface-section fade-in">
        <h2>Campus Status Levels</h2>
        <p>Your progression in Campus Icon is marked by your Campus Streaks. Here's how you can level up:</p>
        <ul className="awards-rank-levels">
          {campusStatusTiers.map((tier, index) => (
            <li key={index} className="awards-rank-level-item">
              <strong>{tier.status}</strong>: {tier.minPoints} - {tier.maxPoints} points
            </li>
          ))}
        </ul>
        <p>Reach the ultimate status and become a Campus Icon!</p>
      </section>
    </div>
  );
};

export default AwardsandRank;
