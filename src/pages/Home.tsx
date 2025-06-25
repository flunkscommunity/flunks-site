import React, { useState } from "react";
import BootScreen from "components/BootScreen";
import DesktopMain from "components/DesktopMain";

const Home: React.FC = () => {
  const [booted, setBooted] = useState(false);

  return booted ? (
    <DesktopMain />
  ) : (
    <BootScreen onComplete={() => setBooted(true)} />
  );
};

export default Home;
