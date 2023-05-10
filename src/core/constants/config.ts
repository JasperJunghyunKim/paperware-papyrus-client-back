enum COMMON {
  /**
   * 노드 환경 정보
   */
  NODE_ENV = 'NODE_ENV',
  /**
   * 포트
   */
  PORT = 'PORT',
  /**
   * jwt 시크릿키
   */
  JWT_SECRET = 'JWT_SECRET',
  /**
   * jwt 유효시간
   */
  JWT_EXPIRES_IN = 'JWT_EXPIRES_IN',
}

enum DATABASE {
  /**
   * 호스트
   */
  DB_HOST = 'DB_HOST',
  /**
   * 사용자
   */
  DB_USER = 'DB_USER',
  /**
   * 데이터베이스
   */
  DB_DATABASE = 'DB_DATABASE',
  /**
   * 비밀번호
   */
  DB_PASSWORD = 'DB_PASSWORD',
  /**
   * 포트
   */
  DB_PORT = 'DB_PORT',
}

enum OAUTH {
  /**
   * 구글 클라리언트 아이디
   */
  GOOGLE_CLIENT_ID = 'GOOGLE_CLIENT_ID',
  /**
   * 구글 시크릿 키
   */
  GOOGLE_SECERT_KEY = 'GOOGLE_SECERT_KEY',
  /**
   * 구글 리다이렉트 url
   */
  GOOGLE_REDIRECT_URL = 'GOOGLE_REDIRECT_URL',
  /**
   * JWT 시크릿 키
   */
  JWT_SECRET_KEY = 'JWT_SECRET_KEY',
  /**
   * JWT 유효시간
   */
  JWT_EXPIRATION_TIME = 'JWT_EXPIRATION_TIME',
}

enum AWS {
  /**
   * aws 엑세스 키
   */
  AWS_ACCESS_KEY_ID = 'AWS_ACCESS_KEY_ID',
  /**
   * aws 시크릿 키
   */
  AWS_SECRET_ACCESS_KEY = 'AWS_SECRET_ACCESS_KEY',
}

export const CONFIG_KEY = {
  COMMON,
  DATABASE,
  OAUTH,
  AWS,
};
