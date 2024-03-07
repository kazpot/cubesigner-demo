import type { NextApiRequest, NextApiResponse } from "next";
import * as cs from "@cubist-labs/cubesigner-sdk";
import { JsonFileSessionStorage } from "@cubist-labs/cubesigner-sdk-fs-storage";
import { ethers } from "ethers";

type ResponseData = {
  signedTx: string | null;
  error: string;
};

const sessionFilePath = process.env.NEXT_PUBLIC_CUBE_SESSION_FILE_PATH || "";
const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || "";
const chainId = process.env.NEXT_PUBLIC_CHAIN_ID || "";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  try {
    const { oidcToken, from, to, gas, gasPrice } = req.body;

    const fileStorage = new JsonFileSessionStorage<cs.SignerSessionData>(
      sessionFilePath
    );

    const sessionManger = await cs.SignerSessionManager.loadFromStorage(
      fileStorage
    );

    const client = new cs.CubeSignerClient(sessionManger);

    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const nonce = await provider.getTransactionCount(from);
    const nonceHex = nonce.toString(16);
    console.log("nonce: " + nonceHex);

    const signReq = <cs.EvmSignRequest>{
      chain_id: parseInt(chainId), // Avalanche LT0 Subnet
      tx: <any>{
        type: "0x00",
        gas,
        gasPrice,
        nonce: nonceHex,
        from,
        to,
        value: "0x1",
      },
    };

    const signerSessionToken = await client.oidcAuth(oidcToken, ["sign:*"]);
    const session = new cs.SignerSession(signerSessionToken);
    const sig = (await session.signEvm(from, signReq)).data();

    res.status(200).json({ signedTx: sig.rlp_signed_tx, error: "" });
  } catch (e: any) {
    res
      .status(500)
      .json({ signedTx: null, error: "Failed to sign tx: " + e.message });
  }
}
