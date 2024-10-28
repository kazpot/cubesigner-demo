import type { NextApiRequest, NextApiResponse } from "next";
import * as cs from "@cubist-labs/cubesigner-sdk";
import axios from "axios";

type ResponseData = {
  userId: string | null;
  keyId: string | null;
  address: string | null;
  error: string;
};

const managementToken = process.env.NEXT_PUBLIC_MANAGEMENT_TOKEN || "";
const orgId = process.env.NEXT_PUBLIC_CUBE_ORG_ID || "";
const encodedOrgId = encodeURIComponent(orgId);

const axiosInstance = axios.create({
  baseURL: "https://gamma.signer.cubist.dev",
  // proxy: {
  //   host: "proxy.example.com",
  //   port: 8080,
  // },
  headers: {
    accept: "*/*",
    "Content-Type": "application/json",
    Authorization: managementToken,
  },
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  try {
    const proof = req.body.proof;

    try {
      const response = await axiosInstance.post(
        `/v0/org/${encodedOrgId}/identity/verify`,
        proof
      );
      console.log("identity verification response:", response.data);
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
      let response = await axiosInstance.post(`/v0/org/${encodedOrgId}/users`, {
        identity: { iss, sub },
        role: "Alien",
        email,
        mfaPolicy: {
          num_auth_factors: 1,
          allowed_mfa_types: ["Fido"],
        },
      });
      console.log("create user response:", response.data);

      const userId = response.data.user_id;
      console.log("user created: " + userId);

      response = await axiosInstance.post(`/v0/org/${encodedOrgId}/keys`, {
        count: 1,
        key_type: cs.Secp256k1.Evm,
        owner: userId,
      });

      console.log(response.data);
      const key = response.data.keys[0];

      res.status(200).json({
        userId,
        keyId: key.key_id,
        address: key.material_id,
        error: "",
      });
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
