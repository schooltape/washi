export type StoreData = {
  stateVersion: number;
  // theme: {
  //   sync: boolean;
  //   flavour: string;
  //   accent: string;
  // }
  auth: {
    jwt: string;
    url: string;
  } | null;
  cache: Record<string, any>;
};
