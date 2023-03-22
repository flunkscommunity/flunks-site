export const getBoringAvatarUrl = (address: string) => {
  return `https://source.boringavatars.com/pixel/60/${address}?colors=000000,276EF1,03703C,FFC043,E11900,FFFFFF`;
};

export const incrementRankByOne = (rank: number | string) => {
  return Number(rank) + 1;
};
