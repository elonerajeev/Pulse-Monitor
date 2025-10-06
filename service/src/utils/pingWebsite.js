import axios from "axios";

export const pingWebsite = async (url) => {
  const start = Date.now();
  try {
    const response = await axios.get(url, { timeout: 5000 });
    const duration = Date.now() - start;
    return { url, status: response.status, responseTime: duration, isUp: true };
  } catch (err) {
    return {
      url,
      status: err.response?.status || "DOWN",
      responseTime: null,
      isUp: false,
    };
  }
};
