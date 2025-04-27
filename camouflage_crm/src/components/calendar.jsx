import React, { useState } from 'react';
import Calendar from 'react-calendar';
import '../assets/css/calendar.css';

const TourCalendar = () => {
  const [date, setDate] = useState(new Date());

  return (
    <div className="calendar-wrapper">
      <h3>Upcoming Tours</h3>
      <Calendar onChange={setDate} value={date} />
      <p>Selected Date: {date.toDateString()}</p>
    </div>
  );
};

export default TourCalendar;
