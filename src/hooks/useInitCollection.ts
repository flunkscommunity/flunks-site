import { useUser } from "contexts/WalletContext";
import { useEffect, useState } from "react";
// import { fetchCollectionExists } from "web3/script-check-collection-init";
// import { initializeFlunksCollection } from "web3/tx-initialize-account";

const useInitCollection = () => {
  // const { walletAddress } = useUser();
  const walletAddress = "123";
  const [isInitialized, setIsInitialized] = useState<boolean | null>(null);
  const [control, setControl] = useState<number>(1);

  const initializeCollection = async () => {
    if (!walletAddress) return;
    // await initializeFlunksCollection()().then((data) => {
    //   setControl(control + 1);
    // });
  };

  useEffect(() => {
    if (!walletAddress) return;
    // fetchCollectionExists({ address: walletAddress }).then((data) => {
    //   setIsInitialized(data);
    // });
  }, [control, walletAddress]);

  return {
    isInitialized,
    initializeCollection,
  };
};

export default useInitCollection;
