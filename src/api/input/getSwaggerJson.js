const axios = require("axios");
const { writeFileSync } = require("fs");

// production
let openApiUrl = "https://flunks-backend-prod-dot-bionic-hallway-338400.uc.r.appspot.com/api-json";

(async () => {
  const response = await axios.get(openApiUrl);
  // writeFileSync(
  //   `${process.cwd()}/src/api/input/swagger.json`,
  //   JSON.stringify(response.data)
  // );
})();
