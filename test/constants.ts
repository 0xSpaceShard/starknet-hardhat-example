import { ensureEnvVar } from "./util";

/** 15 min */
export const TIMEOUT = 900_000;

export const OZ_ACCOUNT_ADDRESS = ensureEnvVar("OZ_ACCOUNT_ADDRESS");
export const OZ_ACCOUNT_PRIVATE_KEY = ensureEnvVar("OZ_ACCOUNT_PRIVATE_KEY");

export const ARGENT_ACCOUNT_ADDRESS = ensureEnvVar("ARGENT_ACCOUNT_ADDRESS");
export const ARGENT_ACCOUNT_PRIVATE_KEY = ensureEnvVar("ARGENT_ACCOUNT_PRIVATE_KEY");
