import { useContext } from "react";
import { encryptAesKey } from "../utils/crypto.util";
import { AuthUserContext } from "../utils/contexts/authUserContext";

export const useEncryption = () => {
  const context = useContext(AuthUserContext);

  if (!context)
    throw new Error("useEncryption must be used within a ContextProvider");

  const { publicKey } = context;

  const encryptAesKeyWithPublicKey = (
    aesKey: Record<string, unknown>
  ): string => {
    if (!publicKey)
      throw new Error(
        "Please reconnect to the network and try again. If you still need help, contact support."
      );

    return encryptAesKey(JSON.stringify(aesKey), publicKey);
  };

  return {
    encryptAesKey: encryptAesKeyWithPublicKey,
    isPublicKeyReady: !!publicKey,
  };
};
