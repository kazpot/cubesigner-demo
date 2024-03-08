import type { NextApiRequest, NextApiResponse } from "next";
import * as cs from "@cubist-labs/cubesigner-sdk";
import { JsonFileSessionStorage } from "@cubist-labs/cubesigner-sdk-fs-storage";

type ResponseData = {
  userId: string | null;
  keyId: string | null;
  address: string | null;
  error: string;
};

const sessionFilePath = process.env.NEXT_PUBLIC_CUBE_SESSION_FILE_PATH || "";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  try {
    const fileStorage = new JsonFileSessionStorage<cs.SignerSessionData>(
      sessionFilePath
    );

    const sessionManger = await cs.SignerSessionManager.loadFromStorage(
      fileStorage
    );

    const client = new cs.CubeSignerClient(sessionManger);

    const proof = req.body.proof;
    const org = new cs.Org(client);

    try {
      await org.verifyIdentity(proof);
      console.log("verified");
    } catch (e: any) {
      res.status(403).json({
        userId: null,
        keyId: null,
        address: null,
        error: "Failed to verify identity: " + e.message,
      });
    }

    const iss = proof.identity.iss;
    const sub = proof.identity.sub;
    const email = proof.email;

    if (!proof.user_info?.user_id) {
      const userId = await client.createOidcUser({ iss, sub }, email, {
        memberRole: "Alien",
        mfaPolicy: {
          num_auth_factors: 1,
          allowed_mfa_types: ["Fido"],
        },
      });

      console.log("user created: " + userId);

      const key = await org.createKey(cs.Secp256k1.Evm, userId);

      res
        .status(200)
        .json({ userId, keyId: key.id, address: key.materialId, error: "" });
    }
  } catch (e: any) {
    res.status(500).json({
      userId: null,
      keyId: null,
      address: null,
      error: "Failed to sign up: " + e.message,
    });
  }
}
