import { useEffect } from "react";
import jwt from "jsonwebtoken";
import axios from "axios";

export default function LoginPage() {
  useEffect(() => {
    async function signup() {
      const fragmentHash = window.location.hash;
      const regex = /id_token=([^&]+)/;
      const match = fragmentHash.match(regex);

      if (match && match[1]) {
        const idToken = match[1];
        const decoded = jwt.decode(idToken, { complete: true });
        if (decoded != null) {
          const jwtPayload: jwt.JwtPayload = decoded.payload as jwt.JwtPayload;
          console.log("iss:", jwtPayload.iss);
          console.log("sub:", jwtPayload.sub);
          console.log("email:", jwtPayload.email);
          const iss = jwtPayload.iss;
          const sub = jwtPayload.sub;
          const email = jwtPayload.email;

          // Validate JWT
          const res = await axios.post("/api/signup", {
            iss,
            sub,
            email,
          });

          if (res.status === 200) {
            console.log(res.data.message);
            localStorage.setItem("cubeuser", `${idToken}:::${res.data.message}`);
          }
        }
      } else {
        console.log("id_token not found");
      }
    }
    signup();
  }, []);

  return <main>success</main>;
}
