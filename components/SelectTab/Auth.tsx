import { Dispatch, SetStateAction } from "react";
import styles from "./Auth.module.css";
import { generators } from "openid-client";
import axios from "axios";

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
    const token = localStorage.getItem("token");
    // token does not exist or expired
    if (token === undefined || token === null) {
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
      return;
    }

    const address = localStorage.getItem("address");
    if (address !== undefined && address !== null) {
      setCurrentAccount(address);
      return;
    }
  };

  const signTransaction = async () => {
    console.log("sign transaction");
    const oidcToken = localStorage.getItem("token");
    const from = localStorage.getItem("address");
    const to = "0x6e84845fdd0C6F431543cA4Fdf0097d476775B9d";
    const gas = "0x61a80";
    const gasPrice = "0x77359400";

    const res = await axios.post("/api/signtx", {
      oidcToken,
      from,
      to,
      gas,
      gasPrice,
    });

    if (res.status === 200) {
      alert(res.data.signedTx);
    }
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
          <div className={styles.btn} onClick={signTransaction}>
            Sign Transaction
          </div>
        )}
      </div>
    </div>
  );
}
