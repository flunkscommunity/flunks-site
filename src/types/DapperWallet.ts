export interface DapperWallet {
  addr: string | null;
  cid: string;
  expiresAt: string;
  f_type: string;
  f_vsn: string;
  loggedIn: boolean;
  services: string[];
}
