import type { NextApiRequest, NextApiResponse } from "next";
import * as cs from "@cubist-labs/cubesigner-sdk";
import { JsonFileSessionStorage } from "@cubist-labs/cubesigner-sdk-fs-storage";

type ResponseData = {
  userId: string | null;
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

    const { iss, sub, email } = req.body;
    const userId = await client.createOidcUser({ iss, sub }, email, {
      memberRole: "Alien",
    });

    res.status(200).json({ userId, error: "" });
  } catch (e: any) {
    res
      .status(500)
      .json({ userId: null, error: "Failed to sign up: " + e.message });
  }
}
