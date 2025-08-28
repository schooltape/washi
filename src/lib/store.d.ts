export type StoreData = {
  stateVersion: number;
  // theme: {
  //   sync: boolean;
  //   flavour: string;
  //   accent: string;
  // }
  auth: {
    jwt: string | null;
    url: string | null;
  };
  cache: Record<string, string>;
};
