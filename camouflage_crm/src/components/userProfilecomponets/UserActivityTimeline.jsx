

import React, { useEffect, useState } from 'react';
import '../../assets/css/userprofile/useractivitytimeline.css';

const UserActivityTimeline = ({activities}) => {

  // return  
  console.log(activities);


  return (
    <ul className="usr-activity-timeline">
      {activities.map((item, index) => (
        <li className="timeline-entry" key={index}>
          <div className="u-timeline-line">
            <span className="line-marker" />
          </div>
          <div className="timeline-content">
            <span className="activity-date">{item.date}</span>
            <p className="activity-desc">{item.activity}</p>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default UserActivityTimeline;
