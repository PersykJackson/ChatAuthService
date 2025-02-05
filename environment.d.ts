declare namespace NodeJS {
  interface ProcessEnv {
    APP_PORT: string;
    APP_AUTH_SECRET_KEY: string;
    APP_REFRESH_SECRET_KEY: string;
    DB_HOST: string;
    DB_PORT: string;
    DB_USER: string;
    DB_PASSWORD: string;
    DB_NAME: string;
    DB_TYPE: 'postgres';
    USER_SERVICE_URI: string;
  }
}
