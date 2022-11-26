import axios from "axios";

const commonHeaders = {
  "Content-Type": "application/json",
  Accept: "*/*",
};

const instance = axios.create({
  baseURL:
    "https://flunks-backend-prod-dot-bionic-hallway-338400.uc.r.appspot.com",
  headers: commonHeaders,
  timeout: 10000,
});

export default instance;
