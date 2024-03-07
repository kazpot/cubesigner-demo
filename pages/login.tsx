import { useEffect } from "react";
import jwt from "jsonwebtoken";
import axios from "axios";
import { useRouter } from "next/router";

export default function LoginPage() {
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
    <main>
      <h1>Success!!!</h1>
      <button onClick={handleGoBack}>Go Back</button>
    </main>
  );
}
