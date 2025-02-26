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

  logout: () => {
    localStorage.clear();
  }
};

export default Utils;
