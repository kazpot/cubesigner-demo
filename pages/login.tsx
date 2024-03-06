import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import jwt from "jsonwebtoken";

export default function LoginPage() {
  const params = useParams();
  const [idToken, setIdToken] = useState("");

  useEffect(() => {
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
      }
      setIdToken(JSON.stringify(decoded?.payload));
    } else {
      console.log("id_token not found");
    }
  }, [params]);

  return <main>{idToken}</main>;
}
