export type Env = {
  Bindings: {
    DB: D1Database;
  };
  Variables: {
    user: Record<string, any>;
  };
};
