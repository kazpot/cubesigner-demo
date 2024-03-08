import { useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import * as cs from "@cubist-labs/cubesigner-sdk";

export default function OidcCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    async function createUser() {
      const fragmentHash = window.location.hash;
      const regex = /id_token=([^&]+)/;
      const match = fragmentHash.match(regex);
      const orgId = process.env.NEXT_PUBLIC_CUBE_ORG_ID || "";

      if (match && match[1]) {
        const oidcToken = match[1];
        localStorage.setItem("token", oidcToken);

        const oidcClient = new cs.OidcClient(cs.envs.gamma, orgId, oidcToken);
        const proof = await oidcClient.identityProve();
        console.log("proof: " + JSON.stringify(proof));

        if (!proof.user_info) {
          let res = await axios.post("/api/create-user", {
            proof,
          });

          if (res.status === 200) {
            localStorage.setItem("userId", res.data.userId);
            localStorage.setItem("keyId", res.data.keyId);
            localStorage.setItem("address", res.data.address);
          }
        }

        if ((proof.user_info?.configured_mfa ?? []).length == 0) {
          const loginResp = await oidcClient.sessionCreate(["manage:mfa"]);
          const mfaSessionInfo = loginResp.requiresMfa()
            ? loginResp.mfaSessionInfo()
            : loginResp.data();
          const sessionManager =
            await cs.SignerSessionManager.createFromSessionInfo(
              cs.envs.gamma,
              orgId,
              mfaSessionInfo!
            );
          const cubesigner = new cs.CubeSignerClient(sessionManager);
          const addFidoResp = await cubesigner.addFidoStart("My Fido Key");
          const challenge = addFidoResp.data();

          // === only needed when testing locally ===
          delete challenge.options.rp.id;
          // ========================================
          await challenge.createCredentialAndAnswer();
          console.log("FIDO added!");
        }
      } else {
        console.log("oidc token not found");
      }
    }
    createUser();
  }, []);

  const handleGoBack = () => {
    router.push("/");
  };

  const deleteUser = async () => {
    const orgId = process.env.NEXT_PUBLIC_CUBE_ORG_ID || "";
    const oidcToken = localStorage.getItem("token") || "";

    const oidcClient = new cs.OidcClient(cs.envs.gamma, orgId, oidcToken);
    const proof = await oidcClient.identityProve();
    console.log("proof: " + JSON.stringify(proof));

    if (proof.user_info) {
      let res = await axios.post("/api/delete-user", {
        proof,
      });

      if (res.status === 200) {
        localStorage.setItem("userId", "");
        localStorage.setItem("keyId", "");
        localStorage.setItem("address", "");
      }
      alert(res.data.status);
    } else {
      alert("oidc user doex not exit");
    }
  };

  return (
    <main
      style={{
        backgroundColor: "black",
        color: "white",
        textAlign: "center",
        padding: "50px",
      }}
    >
      <h1 style={{ fontSize: "24px", marginBottom: "20px" }}>Success!!!</h1>
      <button
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          backgroundColor: "white",
          color: "black",
          border: "none",
          cursor: "pointer",
          borderRadius: "5px",
          transition: "background-color 0.3s ease",
        }}
        onClick={handleGoBack}
      >
        Go Back
      </button>
      <br />
      <button
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          backgroundColor: "white",
          color: "black",
          border: "none",
          cursor: "pointer",
          borderRadius: "5px",
          transition: "background-color 0.3s ease",
          marginTop: "50px",
        }}
        onClick={deleteUser}
      >
        Delete User
      </button>
    </main>
  );
}
