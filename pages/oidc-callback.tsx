import { useEffect } from "react";
import jwt from "jsonwebtoken";
import axios from "axios";
import { useRouter } from "next/router";

const styles = {
  container: {
    backgroundColor: "black",
    color: "white",
    textAlign: "center" as const,
    padding: "50px",
  },
  heading: {
    fontSize: "24px",
    marginBottom: "20px",
  },
  button: {
    padding: "10px 20px",
    fontSize: "16px",
    backgroundColor: "white",
    color: "black",
    border: "none",
    cursor: "pointer",
    borderRadius: "5px",
    transition: "background-color 0.3s ease",
  },
};

export default function OidcCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    async function signup() {
      const fragmentHash = window.location.hash;
      const regex = /id_token=([^&]+)/;
      const match = fragmentHash.match(regex);

      if (match && match[1]) {
        const idToken = match[1];
        localStorage.setItem("token", idToken);

        const decoded = jwt.decode(idToken, { complete: true });
        if (decoded != null) {
          const jwtPayload: jwt.JwtPayload = decoded.payload as jwt.JwtPayload;
          const iss = jwtPayload.iss;
          const sub = jwtPayload.sub;
          const email = jwtPayload.email;

          // Need to validate JWT properly here

          let res = await axios.post("/api/signup", {
            iss,
            sub,
            email,
          });

          if (res.status === 200) {
            const userId = res.data.userId;
            console.log(res.data.message);
            localStorage.setItem("userId", userId);

            res = await axios.post("/api/getaddress", {
              userId,
            });

            if (res.status === 200) {
              const keyId = res.data.keyId;
              const address = res.data.address;
              localStorage.setItem("keyId", keyId);
              localStorage.setItem("address", address);
            }
          }
        }
      } else {
        console.log("id_token not found");
      }
    }
    signup();
  }, []);

  const handleGoBack = () => {
    router.push("/");
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
    </main>
  );
}
