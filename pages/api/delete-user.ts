import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

type ResponseData = {
  status: string | null;
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
    console.log("proof:", proof);

    try {
      const response = await axiosInstance.post(
        `/v0/org/${encodedOrgId}/identity/verify`,
        proof
      );
      console.log("identity verification response:", response.data);
    } catch (e: any) {
      res.status(403).json({
        status: null,
        error: "Failed to verify identity: " + e.message,
      });
    }

    if (proof.user_info?.user_id) {
      const response = await axiosInstance.delete(
        `/v0/org/${encodedOrgId}/users/oidc`,
        { data: { iss: proof.identity.iss, sub: proof.identity.sub } }
      );

      console.log("delete user response:", response.data);

      res.status(200).json({ status: response.data.status, error: "" });
    }
  } catch (e: any) {
    res.status(500).json({
      status: null,
      error: "Failed to delete user: " + e.message,
    });
  }
}
