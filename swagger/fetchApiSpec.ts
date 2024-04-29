const { writeFileSync } = require("fs");

const openApiUrl =
  "https://flunks-backend-prod-dot-bionic-hallway-338400.uc.r.appspot.com/api-json";

const fecthBySource = `ENV: production - ${openApiUrl}`;
console.log("Fetching OpenAPI spec", fecthBySource);

(async () => {
  const response = await fetch(openApiUrl).then((res) => res.json());

  writeFileSync(
    `${process.cwd()}/swagger/api-spec.json`,
    JSON.stringify(response)
  );
})();
