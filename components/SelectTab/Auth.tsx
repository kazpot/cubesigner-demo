import { Dispatch, SetStateAction } from "react";
import styles from "./Auth.module.css";
import { generators } from "openid-client";

type Props = {
  currentAccount: string | undefined;
  connectWallet: any;
  setCurrentAccount: Dispatch<SetStateAction<string | undefined>>;
};

export default function Auth({
  currentAccount,
  connectWallet,
  setCurrentAccount,
}: Props) {
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID || "";
  const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI || "";
  const oauth2Endpoint = process.env.NEXT_PUBLIC_OAUTH2_ENDPOINT || "";

  const handleSubmit = () => {
    const cubeUser = localStorage.getItem("cubeuser");
    if (cubeUser !== undefined && cubeUser !== null) {
      const cubeArray = cubeUser?.split(":::");
      setCurrentAccount(cubeArray[1]);
      return;
    }

    const nonce = generators.nonce();
    const params = {
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "id_token token",
      scope: "openid email",
      include_granted_scopes: "true",
      state: "pass-through value",
      nonce,
    };

    const url = new URL(oauth2Endpoint);
    url.search = new URLSearchParams(params).toString();
    window.open(url.toString(), "_self");
  };

  return (
    <div className={styles.authBody}>
      {currentAccount === undefined ? (
        <div className={styles.bottomDiv}>
          <div className={styles.btn} onClick={handleSubmit}>
            Google
          </div>
        </div>
      ) : (
        ""
      )}
      {currentAccount === undefined ? (
        <div style={{ color: "white", textAlign: "center" }}>or</div>
      ) : (
        ""
      )}
      <div className={styles.bottomDiv}>
        {currentAccount === undefined ? (
          <div className={styles.btn} onClick={connectWallet}>
            Connect to wallet
          </div>
        ) : (
          <div className={styles.btn}>Connected</div>
        )}
      </div>
    </div>
  );
}
