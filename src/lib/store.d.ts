export type Settings = {
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
};

export type Cache = {
  dashboard?: SchoolboxDashboard;
  timetable?: SchoolboxEvent[];
  // key represents the numeric id of the homepage
  homepages?: Record<string, SchoolboxHomepage>;
};
