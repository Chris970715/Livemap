/**
 * 미디어 파일 검증 로직
 * 클라이언트와 서버에서 공통으로 사용
 * Zod 스키마 기반으로 일관된 검증 제공
 */

import { z } from "zod";

import {
  ACCEPTED_VIDEO_MIME_TYPES,
  ACCEPTED_VIDEO_EXTENSIONS,
  MAX_VIDEO_FILE_SIZE,
  ACCEPTED_IMAGE_MIME_TYPES,
  ACCEPTED_IMAGE_EXTENSIONS,
  MAX_IMAGE_FILE_SIZE,
} from "@/lib/constants";
import type { FileValidation } from "@/lib/types/media";

/**
 * 파일 확장자 추출
 */
function getFileExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? `.${parts[parts.length - 1].toLowerCase()}` : "";
}

/**
 * MIME 타입 또는 확장자로 비디오 파일인지 확인
 */
function isValidVideoFile(type: string, filename: string): boolean {
  // MIME 타입 검증
  if (ACCEPTED_VIDEO_MIME_TYPES.includes(type as (typeof ACCEPTED_VIDEO_MIME_TYPES)[number])) {
    return true;
  }

  // MIME 타입이 없거나 매칭되지 않는 경우 확장자로 검증 (fallback)
  const extension = getFileExtension(filename);
  return ACCEPTED_VIDEO_EXTENSIONS.includes(
    extension as (typeof ACCEPTED_VIDEO_EXTENSIONS)[number]
  );
}

/**
 * 동영상 파일 Zod 스키마
 * 파일 타입과 크기를 검증합니다
 */
export const videoFileSchema = z
  .object({
    type: z.string(),
    size: z.number().max(MAX_VIDEO_FILE_SIZE, "파일 크기는 300MB를 초과할 수 없습니다."),
    filename: z.string(),
  })
  .refine((data) => isValidVideoFile(data.type, data.filename), {
    message: "지원하지 않는 파일 형식입니다. (MP4, WebM, MOV, AVI, MKV, M4V만 가능)",
    path: ["type"],
  });

/**
 * 동영상 파일 유효성 검사
 * Zod 스키마를 사용하여 파일 타입과 크기를 검증합니다
 *
 * @param file - 검사할 File 객체
 * @returns FileValidation - 검증 결과
 */
export function validateVideoFile(file: File): FileValidation {
  const result = videoFileSchema.safeParse({
    type: file.type,
    size: file.size,
    filename: file.name,
  });

  if (!result.success) {
    return {
      valid: false,
      error: result.error.issues[0]?.message ?? "파일 검증에 실패했습니다.",
    };
  }

  return { valid: true };
}

/**
 * MIME 타입 또는 확장자로 이미지 파일인지 확인
 */
function isValidImageFile(type: string, filename: string): boolean {
  if (ACCEPTED_IMAGE_MIME_TYPES.includes(type as (typeof ACCEPTED_IMAGE_MIME_TYPES)[number])) {
    return true;
  }

  const extension = getFileExtension(filename);
  return ACCEPTED_IMAGE_EXTENSIONS.includes(
    extension as (typeof ACCEPTED_IMAGE_EXTENSIONS)[number]
  );
}

/**
 * 이미지 파일 Zod 스키마
 */
export const imageFileSchema = z
  .object({
    type: z.string(),
    size: z.number().max(MAX_IMAGE_FILE_SIZE, "파일 크기는 10MB를 초과할 수 없습니다."),
    filename: z.string(),
  })
  .refine((data) => isValidImageFile(data.type, data.filename), {
    message: "지원하지 않는 파일 형식입니다. (JPG, PNG, GIF, WebP만 가능)",
    path: ["type"],
  });

/**
 * 이미지 파일 유효성 검사
 */
export function validateImageFile(file: File): FileValidation {
  const result = imageFileSchema.safeParse({
    type: file.type,
    size: file.size,
    filename: file.name,
  });

  if (!result.success) {
    return {
      valid: false,
      error: result.error.issues[0]?.message ?? "파일 검증에 실패했습니다.",
    };
  }

  return { valid: true };
}
