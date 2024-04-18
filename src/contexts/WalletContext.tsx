import React, { useCallback, useContext, useEffect, useState } from "react";
// import { authenticate, unauthenticate, currentUser } from "@onflow/fcl";
import useUserStore from "store/useUserStore";

const UserContext = React.createContext(null);

export const UserProvider = ({ children }) => {
  // const { user, setUser } = useUserStore();
  const user = {};
  const [shouldSubscribe, setShouldSubscrible] = useState<boolean>(false);

  const walletAddress = user.addr || null;

  // const subscbribleToAuthenticate = useCallback(() => {
  //   currentUser().subscribe((user) => {
  //     setUser(user);
  //   });
  // }, []);

  // const shouldSubscribleAllower = () => {
  //   if (!shouldSubscribe) return setShouldSubscrible(true);
  // };

  // useEffect(() => {
  //   if (shouldSubscribe) {
  //     subscbribleToAuthenticate();
  //   }
  // }, [shouldSubscribe]);

  const _authenticate = () => {
    // authenticate();
    // shouldSubscribleAllower();
  };

  const _unauthenticate = () => {
    // unauthenticate();
    // shouldSubscribleAllower();
  };

  return (
    <UserContext.Provider
      value={{
        user: user || {},
        walletAddress,
        authenticate: _authenticate,
        unauthenticate: _unauthenticate,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const { user, walletAddress, authenticate, unauthenticate } =
    useContext(UserContext);

  return { user, walletAddress, authenticate, unauthenticate };
};
