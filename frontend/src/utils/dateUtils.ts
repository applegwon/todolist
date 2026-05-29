// 백엔드에서 반환되는 ISO 8601 datetime을 HTML date input용 "YYYY-MM-DD"로 변환
export function isoToDateInputValue(isoString: string | null): string {
  if (!isoString) return '';
  return isoString.substring(0, 10);
}

// "YYYY-MM-DD" 형식의 날짜를 사용자 표시용 문자열로 변환
export function formatDateDisplay(dateString: string | null): string {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}
