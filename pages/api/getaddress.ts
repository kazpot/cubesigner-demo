import type { NextApiRequest, NextApiResponse } from "next";
import * as cs from "@cubist-labs/cubesigner-sdk";
import { JsonFileSessionStorage } from "@cubist-labs/cubesigner-sdk-fs-storage";

type ResponseData = {
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

    const { userId } = req.body;
    console.log("userId: " + userId);

    const key = await client.createKey(cs.Secp256k1.Evm, userId);

    res.status(200).json({ keyId: key.id, address: key.materialId, error: "" });
  } catch (e: any) {
    res.status(500).json({
      keyId: null,
      address: null,
      error: "Failed to sign up: " + e.message,
    });
  }
}
