import type { NextApiRequest, NextApiResponse } from "next";
import * as cs from "@cubist-labs/cubesigner-sdk";
import { JsonFileSessionStorage } from "@cubist-labs/cubesigner-sdk-fs-storage";

type ResponseData = {
  status: string | null;
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
        status: null,
        error: "Failed to verify identity: " + e.message,
      });
    }

    if (proof.user_info?.user_id) {
      const result = await client.deleteOidcUser({
        iss: proof.identity.iss,
        sub: proof.identity.sub,
      });

      console.log("delete user: " + result.status);

      res.status(200).json({ status: result.status, error: "" });
    }
  } catch (e: any) {
    res.status(500).json({
      status: null,
      error: "Failed to sign up: " + e.message,
    });
  }
}
