// 백엔드에서 반환되는 ISO 8601 datetime을 HTML date input용 "YYYY-MM-DD"로 변환
// substring(0,10) 대신 로컬 시간 메서드를 사용해 KST 서버의 UTC 직렬화 오프셋을 보정한다
export function isoToDateInputValue(isoString: string | null): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
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
