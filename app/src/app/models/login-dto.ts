export interface LoginDto {
  data: {
    token: string;
    user: {
      id: number;
      name: string;
      email: string;
    };
  };
}
