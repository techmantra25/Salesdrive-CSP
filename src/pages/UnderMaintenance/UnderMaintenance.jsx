import { FaTools } from "react-icons/fa";
import { useState, useEffect } from "react";

export const UnderMaintenance = ({ finishTime }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  const calculateTimeLeft = () => {
    if (!finishTime) return 0;

    const now = new Date();
    const kolkataTime = new Date(
      now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );

    // Parse the finish time (format: "0240PM" or "1430" for 24hr)
    const timeStr = finishTime.toString().toUpperCase();
    let hours, minutes;

    if (timeStr.includes("AM") || timeStr.includes("PM")) {
      // 12-hour format
      const isPM = timeStr.includes("PM");
      const timeNum = timeStr.replace(/[AP]M/, "");
      hours = Math.floor(timeNum / 100);
      minutes = timeNum % 100;

      if (isPM && hours !== 12) hours += 12;
      if (!isPM && hours === 12) hours = 0;
    } else {
      // 24-hour format
      hours = Math.floor(timeStr / 100);
      minutes = timeStr % 100;
    }

    const finishDate = new Date(kolkataTime);
    finishDate.setHours(hours, minutes, 0, 0);

    // If finish time is before current time, assume it's tomorrow
    if (finishDate <= kolkataTime) {
      finishDate.setDate(finishDate.getDate() + 1);
    }

    const diffMs = finishDate - kolkataTime;
    return Math.max(0, Math.floor(diffMs / 1000));
  };

  useEffect(() => {
    if (!finishTime) return;

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      if (newTimeLeft <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finishTime]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${mins
        .toString()
        .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Icon */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-32 h-32 bg-orange-100 dark:bg-orange-900/20 rounded-full mb-6">
            <FaTools className="w-16 h-16 text-orange-600 dark:text-orange-400 animate-bounce" />
          </div>
        </div>

        {/* Main Content */}
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
            Under Maintenance
          </h1>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-6">
            We're making things better!
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-4 max-w-lg mx-auto">
            Our system is currently undergoing scheduled maintenance to improve
            your experience. We'll be back online shortly.
          </p>

          {/* Countdown Timer - Only show if finishTime is provided */}
          {finishTime &&
            (timeLeft > 0 ? (
              <div className="mb-4">
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                  {formatTime(timeLeft)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Estimated time remaining (IST)
                </p>
              </div>
            ) : (
              <p className="text-lg font-semibold text-green-600 dark:text-green-400 mb-4">
                Maintenance completed! Please refresh the page.
              </p>
            ))}
        </div>
      </div>
    </div>
  );
};
