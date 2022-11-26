import { CollectionApi, Configuration } from "./generated";

const commonHeaders = {
  "Content-Type": "application/json",
  Accept: "*/*",
};

const config = new Configuration({
  basePath:
    "https://flunks-backend-prod-dot-bionic-hallway-338400.uc.r.appspot.com",
  baseOptions: {
    baseUrl:
      "https://flunks-backend-prod-dot-bionic-hallway-338400.uc.r.appspot.com",
    headers: commonHeaders,
  },
});

export const CollectionApiInstance = new CollectionApi(config);
