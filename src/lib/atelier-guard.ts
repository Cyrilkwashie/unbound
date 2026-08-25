import type { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import type { NextApiRequest, NextApiResponse } from "next";
import { isAtelierSession } from "@/lib/atelier";

export const ATELIER_LOGIN = "/atelier";
export const ATELIER_DESK = "/atelier/desk";

export const denyAtelier = (
  req: GetServerSidePropsContext["req"]
): GetServerSidePropsResult<Record<string, never>> | null => {
  if (isAtelierSession(req)) return null;
  return { redirect: { destination: ATELIER_LOGIN, permanent: false } };
};

export const requireAtelier = async (
  context: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<Record<string, never>>> => {
  return denyAtelier(context.req) ?? { props: {} };
};

export const requireAtelierApi = (req: NextApiRequest, res: NextApiResponse) => {
  if (isAtelierSession(req)) return true;
  res.status(401).json({ error: "closed" });
  return false;
};
