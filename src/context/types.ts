export interface QuestionSet {
  id: number;
  name: string;
  office: string;
  rank: string;
  type: string;
  created: string;
  status: string;
  shared: string;
  history: any[];
}

export interface Office {
  id: number;
  name: string;
  code: string;
  location: string;
  status: string;
}

export interface Client {
  id: number;
  name: string;
  users: number;
  status: string;
  plan: string;
  joined: string;
}

export interface Settings {
  marks: {
    [key: string]: { easy: number; intermediate: number; difficult: number; timeLimit: number };
  };
  percentages: {
    [key: string]: number;
  };
}
