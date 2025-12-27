/**
 * 미디어 업로드 관련 타입 정의
 */

/**
 * 파일 검증 결과
 */
export interface FileValidation {
  valid: boolean;
  error?: string;
}

/**
 * 업로드 상태 타입
 */
export type UploadStatus = "idle" | "uploading" | "success" | "error";

export interface UploadState {
  status: UploadStatus;
  progress: number; // 0-100
  error?: string;
}

/**
 * 업로드 옵션
 */
export interface UploadOptions {
  onProgress?: (progress: number) => void;
}
