// 운영상 예측 가능한 에러를 표현하는 커스텀 에러 클래스
class AppError extends Error {
  /**
   * @param {string} message - 사용자에게 전달할 에러 메시지
   * @param {number} status  - HTTP 상태 코드
   * @param {string} code    - 프로그래매틱 에러 코드 (errorCodes.js 참조)
   */
  constructor(message, status, code) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.isOperational = true;

    // V8 엔진에서 스택 트레이스를 올바르게 캡처
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
