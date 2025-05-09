import React from "react";

const useIsMounted = () => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return { isMounted: mounted };
};

export default useIsMounted;
