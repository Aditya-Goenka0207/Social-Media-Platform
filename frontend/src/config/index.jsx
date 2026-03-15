import axios from "axios";

export const BASE_URL = "http://localhost:9090";

//separate axios instance for user routes
export const userServer = axios.create({
  baseURL: `${BASE_URL}/api/users`,
  headers: {
    "Content-Type": "application/json",
  },
});

//separate axios instance for post routes
export const postServer = axios.create({
  baseURL: `${BASE_URL}/api/posts`,
  headers: {
    "Content-Type": "application/json",
  },
});

//shared interceptor function
const attachInterceptors = (instance) => {
  instance.interceptors.request.use(
    (config) => {
      let token = null;

      if (typeof window !== "undefined") {
        token = localStorage.getItem("token");
      }

      if (token) {
        config.headers.token = token;
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error?.response?.status === 401) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
      }

      return Promise.reject(error);
    }
  );
};

attachInterceptors(userServer);
attachInterceptors(postServer);