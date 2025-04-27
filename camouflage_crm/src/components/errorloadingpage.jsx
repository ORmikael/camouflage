import { useEffect, useState } from "react";
import "../assets/css/errorloadingpage.css"; // make sure this file is created

const LoadingMessage = () => {
  const messages = [
    "Loading...",
    "If state persists, possible downtime",
    "Server error... trying again"
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 6000); // 3s loop
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="loading-page">
      <div className="pulsing-blob">
        {messages[index]}
      </div>
    </div>
  );
};

export default LoadingMessage;
