import React, { useState, useEffect } from 'react';
import { baseURL } from '../utils/config';

import '../assets/css/about.css';
import '../assets/css/teamsection.css';

const TeamSection = () => {
  const [topManagement, setTopManagement] = useState([]);
  const [otherStaff, setOtherStaff] = useState([]);
//   const baseURL = process.env.REACT_APP_BASE_URL;

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        const res = await fetch(`${baseURL}/api/team/management`);
        const data = await res.json();
        setTopManagement(data);

        const staffRes = await fetch(`${baseURL}/api/team/staff`);
        const staffData = await staffRes.json();
        setOtherStaff(staffData);
      } catch (err) {
        console.error('Failed to fetch team data:', err);
      }
    };

    fetchTeamData();
  }, []);

  return (
    <section className="about-team">
      <h2>Meet The Team</h2>

      {/* Top Management Section */}
      <div className="team-grid">
        {topManagement.map((member, index) => (
          <div key={index} className="team-card">
            <img 
              src={`${baseURL}${member.avatar}`} 
              alt={`${member.name} - ${member.title}`} 
            />
            <div className="member-info">
              <h4>{member.name}</h4>
              <p>{member.title}</p>
              <p>{member.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <hr style={{ margin: '2rem 0', borderColor: 'var(--accent-yellow)' }} />

      {/* Other Staff Avatars */}
      <div className="other-staff-avatars">
        <h3>Support Team</h3>
        <div className="avatar-cluster">
          {otherStaff.map((staffMember, idx) => (
            <img
              key={idx}
              src={`${baseURL}${staffMember.avatar}`}
              alt={`${staffMember.name} - ${staffMember.title}`}
              className="avatar-img"
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
