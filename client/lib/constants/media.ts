/**
 * 미디어 업로드 관련 상수
 * 모든 미디어 관련 파일에서 이 상수들을 import하여 사용
 */

/**
 * 지원하는 동영상 파일 확장자
 * react-dropzone의 accept 옵션에 사용
 */
export const ACCEPTED_VIDEO_EXTENSIONS = [".mp4", ".webm", ".mov", ".avi", ".mkv", ".m4v"] as const;

/**
 * 지원하는 동영상 MIME 타입
 * 파일 검증에 사용
 */
export const ACCEPTED_VIDEO_MIME_TYPES = [
  "video/mp4",
  "video/mpeg", // 일부 MP4 파일이 이 MIME 타입 사용
  "video/x-m4v", // M4V 파일
  "video/webm",
  "video/quicktime", // MOV 파일 (가장 일반적)
  "video/x-quicktime", // MOV 파일 변형
  "video/x-msvideo", // AVI 파일
  "video/x-matroska", // MKV 파일
  "video/avi", // 일부 AVI 파일
  "video/msvideo", // 일부 AVI 파일
] as const;

/**
 * 최대 동영상 파일 크기 (300MB)
 * 바이트 단위: 300 * 1024 * 1024 = 314,572,800 bytes
 */
export const MAX_VIDEO_FILE_SIZE = 300 * 1024 * 1024;

/**
 * 지원하는 이미지 파일 확장자
 */
export const ACCEPTED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp"] as const;

/**
 * 지원하는 이미지 MIME 타입
 */
export const ACCEPTED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;

/**
 * 최대 이미지 파일 크기 (10MB)
 */
export const MAX_IMAGE_FILE_SIZE = 10 * 1024 * 1024;
