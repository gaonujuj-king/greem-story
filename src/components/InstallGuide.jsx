export default function InstallGuide({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content install-guide" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="닫기">
          ✕
        </button>

        <h2>📱 태블릿에 앱 설치하기</h2>
        <p className="guide-intro">
          한 번 설치하면 앱처럼 바로 열 수 있고, 인터넷 없이도 사용할 수 있어요.
        </p>

        <section className="guide-section">
          <h3>🤖 안드로이드 태블릿 (Chrome)</h3>
          <ol>
            <li>Chrome 브라우저로 이 앱 주소를 엽니다.</li>
            <li>오른쪽 위 <strong>⋮</strong> 메뉴를 누릅니다.</li>
            <li>
              <strong>「홈 화면에 추가」</strong> 또는 <strong>「앱 설치」</strong>를
              선택합니다.
            </li>
            <li>이름을 확인하고 <strong>「추가」</strong>를 누릅니다.</li>
            <li>홈 화면에 생긴 <strong>「이야기 그림전환」</strong> 아이콘으로 실행합니다.</li>
          </ol>
        </section>

        <section className="guide-section">
          <h3>🍎 iPad (Safari)</h3>
          <ol>
            <li>Safari로 이 앱 주소를 엽니다.</li>
            <li>아래쪽 <strong>공유 버튼 (□↑)</strong>을 누릅니다.</li>
            <li>
              <strong>「홈 화면에 추가」</strong>를 선택합니다.
            </li>
            <li>
              <strong>「추가」</strong>를 누르면 홈 화면에 앱 아이콘이 생깁니다.
            </li>
          </ol>
        </section>

        <section className="guide-section">
          <h3>💻 Windows 태블릿 (Chrome / Edge)</h3>
          <ol>
            <li>Chrome 또는 Edge로 이 앱 주소를 엽니다.</li>
            <li>
              주소창 오른쪽의 <strong>「앱 설치」</strong> 아이콘(⊕ 또는 컴퓨터 모양)을
              클릭합니다.
            </li>
            <li>
              <strong>「설치」</strong>를 누르면 시작 메뉴에 앱이 추가됩니다.
            </li>
          </ol>
        </section>

        <section className="guide-section guide-tips">
          <h3>💡 꼭 알아두세요</h3>
          <ul>
            <li>
              <strong>마이크 권한</strong> — 처음 실행 시 「허용」을 눌러 주세요.
            </li>
            <li>
              <strong>한국어 음성 패키지</strong> — Chrome 설정 → 언어 → 한국어 →
              「음성 입력」을 기기에 다운로드하면 음성이 태블릿 안에서만 처리됩니다.
            </li>
            <li>
              <strong>데이터 저장</strong> — 이야기·사진·그림은 이 태블릿에만 저장됩니다.
              브라우저 「인터넷 사용 기록 삭제」를 하면 함께 지워질 수 있어요.
            </li>
            <li>
              <strong>그림 내보내기</strong> — 보관함 또는 그림 화면에서 「내보내기」로
              태블릿 사진 앨범·파일에 저장할 수 있어요.
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
