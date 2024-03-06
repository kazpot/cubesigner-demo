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
  const { oidcToken, from, to, gas, gasPrice } = req.body;

  const fileStorage = new JsonFileSessionStorage<cs.SignerSessionData>(
    sessionFilePath
  );

  const sessionManger = await cs.SignerSessionManager.loadFromStorage(
    fileStorage
  );

  const client = new cs.CubeSignerClient(sessionManger);

  // Create signing request
  const signReq = <cs.EvmSignRequest>{
    chain_id: 1, // Ethereum mainnet
    tx: <any>{
      // EIP-2718 typed transaction (in this case a legacy transaction)
      type: "0x00",
      gas: "0x61a80",
      gasPrice: "0x77359400",
      nonce: "0",
      from: "from",
      to: "to",
      value: "value",
    },
  };

  // Exchange OIDC token for signer session token and create session
  const signerSessionToken = await client.oidcAuth(oidcToken, ["sign:*"]);
  const session = new cs.SignerSession(signerSessionToken);
  // Sign the transaction
  const sig = (await session.signEvm(from, signReq)).data();
  // Return the signed transaction
  return sig.rlp_signed_tx;
}
