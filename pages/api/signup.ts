import type { NextApiRequest, NextApiResponse } from "next";
import * as cs from "@cubist-labs/cubesigner-sdk";
import { JsonFileSessionStorage } from "@cubist-labs/cubesigner-sdk-fs-storage";

type ResponseData = {
  message: string;
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

    // const { iss, sub, email } = req.body;
    // const userId = await client.createOidcUser({ iss, sub }, email, {
    //   memberRole: "Alien",
    // });

    const userId = "User#71ee6a75-e0d8-4e2b-9253-b899372c9cd4";

    console.log("userId: " + userId);

    const key = await client.createKey(cs.Secp256k1.Evm, userId);
    const evmAddress = key.materialId;

    res.status(200).json({ message: evmAddress });
  } catch (e: any) {
    res.status(200).json({ message: "Failed to sign up: " + e.message });
  }
}
