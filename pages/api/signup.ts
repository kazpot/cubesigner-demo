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
  const fileStorage = new JsonFileSessionStorage<cs.SignerSessionData>(
    sessionFilePath
  );

  const sessionManger = await cs.SignerSessionManager.loadFromStorage(
    fileStorage
  );

  const client = new cs.CubeSignerClient(sessionManger);
  const me = await client.aboutMe();
  console.log(me);

  const org = await client.orgGet();
  console.log(org);

  const secpKey = await client.createKey(cs.Secp256k1.Evm);
  console.log(secpKey.owner);

  // const userId = client.createOidcUser({ iss: "", sub: "" }, "email", {
  //   memberRole: "Alien",
  // });

  res.status(200).json({ message: "Hello from Next.js!" });
}
