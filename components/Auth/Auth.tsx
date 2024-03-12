import { Dispatch, SetStateAction, useState } from "react";
import styles from "./Auth.module.css";
import { generators } from "openid-client";
import * as cs from "@cubist-labs/cubesigner-sdk";
import { ethers } from "ethers";
import jwt, { JwtPayload } from "jsonwebtoken";

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

  const [oidcSession, setOidcSession] = useState<cs.SignerSession>();

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");

    // check token expiration
    let tokenExpired = true;
    if (token !== undefined && token !== null) {
      const decodedToken = jwt.decode(token!) as JwtPayload;
      const expirationTime = decodedToken?.exp;
      if (expirationTime) {
        const currentTime = Math.floor(Date.now() / 1000);
        if (expirationTime > currentTime) {
          tokenExpired = false;
        }
      }
    }

    // check token existense
    if (token === undefined || token === null || tokenExpired) {
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

    const sessionManager = await oidcLogin(token, ["sign:*"]);
    const oidcSession = new cs.SignerSession(sessionManager);
    const key = (await oidcSession.keys())[0];
    setOidcSession(oidcSession);
    setCurrentAccount(key.material_id);
  };

  const oidcLogin = async (oidcToken: string, scopes: string[]) => {
    console.log("logging into with oidc");
    const orgId = process.env.NEXT_PUBLIC_CUBE_ORG_ID || "";
    const oidcClient = new cs.OidcClient(cs.envs.gamma, orgId, oidcToken);
    let res = await oidcClient.sessionCreate(scopes);
    if (res.requiresMfa()) {
      const mfaSession = res.mfaSessionInfo();
      const mfaSessionManager =
        await cs.SignerSessionManager.createFromSessionInfo(
          cs.envs.gamma,
          orgId,
          mfaSession!
        );
      const signerSession = new cs.SignerSession(mfaSessionManager);
      const mfaId = res.mfaId();
      const challenge = await signerSession.fidoApproveStart(mfaId);

      // === only needed when testing locally ===
      delete challenge.options.rpId;
      // ========================================

      const mfaInfo = await challenge.createCredentialAndAnswer();

      if (!mfaInfo.receipt) {
        throw new Error("MFA not approved yet");
      }

      res = await res.signWithMfaApproval({
        mfaId,
        mfaOrgId: orgId,
        mfaConf: mfaInfo.receipt.confirmation,
      });
    }

    if (res.requiresMfa()) {
      throw new Error("MFA should not be required after approval");
    }

    const seesionInfo = res.data();
    return await cs.SignerSessionManager.createFromSessionInfo(
      cs.envs.gamma,
      orgId,
      seesionInfo
    );
  };

  const signTransaction = async () => {
    console.log("sign transaction");
    if (oidcSession != null) {
      const chainId = process.env.NEXT_PUBLIC_CHAIN_ID || "";
      const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || "";

      const key = (await oidcSession.keys())[0];

      const from = key.material_id;
      const to = "0x6e84845fdd0C6F431543cA4Fdf0097d476775B9d";
      const gas = "0x61a80";
      const gasPrice = "0x77359400";

      const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
      const nonce = await provider.getTransactionCount(key.materialId);
      const nonceHex = nonce.toString(16);
      console.log("nonce: " + nonceHex);

      const signReq = {
        chain_id: parseInt(chainId), // Avalanche LT0 Subnet
        tx: {
          type: "0x00",
          gas,
          gasPrice,
          nonce: nonceHex,
          from,
          to,
          value: "0x1",
        } as any,
      };

      const sig = await oidcSession.signEvm(key.material_id, signReq);
      alert(`signed tx: ${sig.data().rlp_signed_tx}`);
    } else {
      alert("no oidc session found!");
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
