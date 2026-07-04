export default function InstallGuide({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content install-guide" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="닫기">
          ✕
        </button>

        <h2>📱 태블릿에 앱 설치하기</h2>
        <p className="guide-intro">
          한 번 설치하면 앱처럼 바로 열 수 있고, <strong>인터넷 없이도</strong> 이야기와 그림을
          만들 수 있어요.
        </p>

        <section className="guide-section guide-privacy">
          <h3>🔒 개인정보 · 데이터 보호</h3>
          <ul>
            <li>
              <strong>외부 전송 없음</strong> — 이야기·사진·그림은 다른 회사 서버(AI, 음성
              인식 등)로 보내지 않습니다.
            </li>
            <li>
              <strong>이 기기에만 저장</strong> — 보관함 데이터는 태블릿 브라우저 저장소(IndexedDB)에
             만 남습니다.
            </li>
            <li>
              <strong>키보드 입력</strong> — 마이크·음성 인식 기능은 사용하지 않습니다. 키보드로
              직접 써 주세요.
            </li>
            <li>
              <strong>그림 방식</strong> — 사실적 AI 사진 대신, 이 기기 안에서 그리는 일러스트
              그림을 사용합니다.
            </li>
            <li>
              브라우저 「인터넷 사용 기록 삭제」를 하면 저장된 이야기가 지워질 수 있어요.
            </li>
          </ul>
        </section>

        <section className="guide-section">
          <h3>🤖 안드로이드 태블릿 (Chrome)</h3>
          <ol>
            <li>Chrome 브라우저로 이 앱 주소를 엽니다.</li>
            <li>오른쪽 위 <strong>⋮</strong> 메뉴를 누릅니다.</li>
            <li>
              <strong>「홈 화면에 추가」</strong> 또는 <strong>「앱 설치」</strong>를 선택합니다.
            </li>
            <li>이름을 확인하고 <strong>「추가」</strong>를 누릅니다.</li>
            <li>홈 화면의 <strong>「이야기 그림전환」</strong> 아이콘으로 실행합니다.</li>
          </ol>
        </section>

        <section className="guide-section">
          <h3>🍎 iPad (Safari)</h3>
          <ol>
            <li>Safari로 이 앱 주소를 엽니다.</li>
            <li>아래쪽 <strong>공유 버튼 (□↑)</strong>을 누릅니다.</li>
            <li><strong>「홈 화면에 추가」</strong>를 선택합니다.</li>
            <li><strong>「추가」</strong>를 누르면 홈 화면에 앱 아이콘이 생깁니다.</li>
          </ol>
        </section>

        <section className="guide-section">
          <h3>💻 Windows 태블릿 (Chrome / Edge)</h3>
          <ol>
            <li>Chrome 또는 Edge로 이 앱 주소를 엽니다.</li>
            <li>
              주소창 오른쪽 <strong>「앱 설치」</strong> 아이콘(⊕)을 클릭합니다.
            </li>
            <li><strong>「설치」</strong>를 누르면 시작 메뉴에 추가됩니다.</li>
          </ol>
        </section>

        <section className="guide-section guide-tips">
          <h3>💡 꼭 알아두세요</h3>
          <ul>
            <li>
              <strong>데이터 저장</strong> — 이야기·사진·그림은 이 태블릿에만 저장됩니다.
            </li>
            <li>
              <strong>그림 내보내기</strong> — 「내보내기」로 태블릿 사진 앨범·파일에 저장할 수
              있어요.
            </li>
            <li>
              <strong>오프라인</strong> — Wi-Fi 없이도 그림 그리기·보관함 열람이 가능합니다.
            </li>
          </ul>
        </section>

        <button className="btn-guide-close" onClick={onClose}>
          알겠어요!
        </button>
      </div>
    </div>
  )
}
