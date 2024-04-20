import { useUser } from "contexts/WalletContext";
import { useEffect, useState } from "react";
import { isWalletCollectionInitialized } from "web3/script-check-collection-init";
import { initAllCollections } from "web3/tx-initialize-account";

const useInitCollection = (walletAddress: string) => {
  const [isInitialized, setIsInitialized] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [control, setControl] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const initializeCollection = async () => {
    if (!walletAddress) return;

    setIsLoading(true);

    await initAllCollections()
      .then((data) => {
        console.log(data);
        setControl((prev) => prev + 1);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (!walletAddress) return;

    isWalletCollectionInitialized(walletAddress).then((data) => {
      console.log(data);
      setIsInitialized(data);
    });
  }, [walletAddress, control]);

  return {
    isInitialized,
    isLoading,
    initializeCollection,
    error,
    setError,
  };
};

export default useInitCollection;
