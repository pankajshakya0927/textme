const Utils = {
  setItemToLocalStorage: (key, value) => {
    localStorage.setItem(key, value);
  },

  getItemFromLocalStorage: (key) => {
    return localStorage.getItem(key);
  },

  getDefaultToastrOptions: () => {
    const options = {
      show: false,
      variant: "",
      title: "",
      message: "",
    };
    return options;
  },

  getSuccessToastrOptions: (message) => {
    const options = {
      show: true,
      variant: "Success",
      title: "Success",
      message: message,
    };
    return options;
  },

  getErrorToastrOptions: (title, message) => {
    const options = {
      show: true,
      variant: "Danger",
      title: title,
      message: message,
    };
    return options;
  },

  // Function to format the date as "X time ago"
  timeAgo: (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(date)) / 1000);

    const minutes = Math.floor(diffInSeconds / 60);
    const hours = Math.floor(diffInSeconds / 3600);
    const days = Math.floor(diffInSeconds / 86400);
    const weeks = Math.floor(diffInSeconds / 604800); // 7 * 24 * 3600 = 604800 seconds in a week
    const months = Math.floor(diffInSeconds / 2628000); // 30 * 24 * 3600 = 2628000 seconds in a month
    const years = Math.floor(diffInSeconds / 31536000); // 365 * 24 * 3600 = 31536000 seconds in a year

    if (years > 1) return `${years} years ago`;
    if (years === 1) return `1 year ago`;

    if (months > 1) return `${months} months ago`;
    if (months === 1) return `1 month ago`;

    if (weeks > 1) return `${weeks} weeks ago`;
    if (weeks === 1) return `1 week ago`;

    if (days > 1) return `${days} days ago`;
    if (days === 1) return `1 day ago`;

    if (hours > 1) return `${hours} hours ago`;
    if (hours === 1) return `1 hour ago`;

    if (minutes > 1) return `${minutes} minutes ago`;
    if (minutes === 1) return `1 minute ago`;

    return `Just now`;
  },

  logout: () => {
    localStorage.clear();
  }
};

export default Utils;
