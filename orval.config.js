module.exports = {
  flunks95: {
    input: "./swagger/api-spec.json",
    output: {
      mode: "tags-split",
      target: "src/generated/api",
      schemas: "src/generated/models",
      baseUrl:
        "https://flunks-backend-prod-dot-bionic-hallway-338400.uc.r.appspot.com/",
      client: "swr",
      mock: false,
      override: {
        swr: {
          useInfinite: true,
        },
      },
      hooks: {
        afterAllFilesWrite: "prettier --write",
      },
    },
  },
};
