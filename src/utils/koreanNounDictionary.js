/**
 * 어린이·초등 국어 빈출 명사 사전 (동물·식물·과일·사물·장소)
 */
import { ELEMENTARY_LEXICON } from '../data/koreanElementaryLexicon.js'
import {
  expandNounCandidates,
  tokenizeKoreanNounCandidates,
  normalizeKoreanToken,
} from './koreanMorphology.js'

const BASE_LEXICON = [
  // ── 동물 · 곤충 · 해양 ──
  { type: 'baby_fish', label: '아기 물고기', category: 'animal', keywords: ['아기물고기', '아기 물고기', '새끼물고기'] },
  { type: 'fish', label: '물고기', category: 'animal', keywords: ['금붕어', '물고기', '열대어'] },
  { type: 'shark', label: '상어', category: 'animal', keywords: ['상어'] },
  { type: 'whale', label: '고래', category: 'animal', keywords: ['돌고래', '고래'] },
  { type: 'octopus', label: '문어', category: 'animal', keywords: ['문어', '오징어', '낙지'] },
  { type: 'crab', label: '게', category: 'animal', keywords: ['꽃게', '대게'] },
  { type: 'jellyfish', label: '해파리', category: 'animal', keywords: ['해파리'] },
  { type: 'starfish', label: '불가사리', category: 'animal', keywords: ['불가사리'] },
  { type: 'seahorse', label: '해마', category: 'animal', keywords: ['해마'] },
  { type: 'shrimp', label: '새우', category: 'animal', keywords: ['새우'] },
  { type: 'turtle', label: '거북이', category: 'animal', keywords: ['바다거북', '육지거북', '거북이', '거북'] },
  { type: 'ant', label: '개미', category: 'animal', keywords: ['아기개미', '개미'] },
  { type: 'bee', label: '벌', category: 'animal', keywords: ['꿀벌', '벌'] },
  { type: 'butterfly', label: '나비', category: 'animal', keywords: ['나비'] },
  { type: 'dragonfly', label: '잠자리', category: 'animal', keywords: ['잠자리'] },
  { type: 'ladybug', label: '무당벌레', category: 'animal', keywords: ['무당벌레'] },
  { type: 'spider', label: '거미', category: 'animal', keywords: ['거미줄', '거미'] },
  { type: 'caterpillar', label: '애벌레', category: 'animal', keywords: ['애벌레'] },
  { type: 'snail', label: '달팽이', category: 'animal', keywords: ['달팽이'] },
  { type: 'worm', label: '벌레', category: 'animal', keywords: ['지렁이', '벌레'] },
  { type: 'beetle', label: '딱정벌레', category: 'animal', keywords: ['딱정벌레'] },
  { type: 'grasshopper', label: '메뚜기', category: 'animal', keywords: ['메뚜기'] },
  { type: 'mosquito', label: '모기', category: 'animal', keywords: ['모기'] },
  { type: 'bat', label: '박쥐', category: 'animal', keywords: ['박쥐'] },
  { type: 'cat', label: '고양이', category: 'animal', keywords: ['고양이', '냥이', '야옹'] },
  { type: 'dog', label: '강아지', category: 'animal', keywords: ['강아지', '멍멍', '댕댕이', '개'] },
  { type: 'rabbit', label: '토끼', category: 'animal', keywords: ['토끼'] },
  { type: 'mouse', label: '쥐', category: 'animal', keywords: ['쥐', '생쥐'] },
  { type: 'hamster', label: '햄스터', category: 'animal', keywords: ['햄스터'] },
  { type: 'squirrel', label: '다람쥐', category: 'animal', keywords: ['다람쥐'] },
  { type: 'bear', label: '곰', category: 'animal', keywords: ['곰돌이', '곰'] },
  { type: 'fox', label: '여우', category: 'animal', keywords: ['여우'] },
  { type: 'wolf', label: '늑대', category: 'animal', keywords: ['늑대'] },
  { type: 'raccoon', label: '너구리', category: 'animal', keywords: ['너구리'] },
  { type: 'tiger', label: '호랑이', category: 'animal', keywords: ['호랑이', '범'] },
  { type: 'lion', label: '사자', category: 'animal', keywords: ['사자'] },
  { type: 'leopard', label: '표범', category: 'animal', keywords: ['표범'] },
  { type: 'elephant', label: '코끼리', category: 'animal', keywords: ['코끼리'] },
  { type: 'giraffe', label: '기린', category: 'animal', keywords: ['기린'] },
  { type: 'zebra', label: '얼룩말', category: 'animal', keywords: ['얼룩말'] },
  { type: 'hippo', label: '하마', category: 'animal', keywords: ['하마'] },
  { type: 'monkey', label: '원숭이', category: 'animal', keywords: ['원숭이'] },
  { type: 'koala', label: '코알라', category: 'animal', keywords: ['코알라'] },
  { type: 'kangaroo', label: '캥거루', category: 'animal', keywords: ['캥거루'] },
  { type: 'camel', label: '낙타', category: 'animal', keywords: ['낙타'] },
  { type: 'deer', label: '사슴', category: 'animal', keywords: ['사슴', '멧돌사슴'] },
  { type: 'horse', label: '말', category: 'animal', keywords: ['조랑말', '말'] },
  { type: 'donkey', label: '당나귀', category: 'animal', keywords: ['당나귀'] },
  { type: 'cow', label: '소', category: 'animal', keywords: ['화소', '소'] },
  { type: 'pig', label: '돼지', category: 'animal', keywords: ['멧돼지', '돼지'] },
  { type: 'sheep', label: '양', category: 'animal', keywords: ['양'] },
  { type: 'goat', label: '염소', category: 'animal', keywords: ['염소'] },
  { type: 'chicken', label: '닭', category: 'animal', keywords: ['병아리', '닭'] },
  { type: 'duck', label: '오리', category: 'animal', keywords: ['오리'] },
  { type: 'goose', label: '거위', category: 'animal', keywords: ['거위'] },
  { type: 'turkey', label: '칠면조', category: 'animal', keywords: ['칠면조'] },
  { type: 'bird', label: '새', category: 'animal', keywords: ['까치', '참새', '비둘기', '앵무새', '새'] },
  { type: 'owl', label: '부엉이', category: 'animal', keywords: ['부엉이'] },
  { type: 'eagle', label: '독수리', category: 'animal', keywords: ['독수리'] },
  { type: 'swan', label: '백조', category: 'animal', keywords: ['백조'] },
  { type: 'penguin', label: '펭귄', category: 'animal', keywords: ['펭귄'] },
  { type: 'flamingo', label: '플라밍고', category: 'animal', keywords: ['플라밍고'] },
  { type: 'seal', label: '물개', category: 'animal', keywords: ['물개'] },
  { type: 'frog', label: '개구리', category: 'animal', keywords: ['개구리'] },
  { type: 'snake', label: '뱀', category: 'animal', keywords: ['뱀'] },
  { type: 'lizard', label: '도마뱀', category: 'animal', keywords: ['도마뱀'] },
  { type: 'crocodile', label: '악어', category: 'animal', keywords: ['악어'] },
  { type: 'dinosaur', label: '공룡', category: 'animal', keywords: ['티라노', '공룡'] },
  { type: 'dragon', label: '용', category: 'animal', keywords: ['드래곤', '용'] },

  // ── 식물 ──
  { type: 'flower', label: '꽃', category: 'plant', keywords: ['벚꽃', '해바라기', '튤립', '장미', '꽃'] },
  { type: 'tree', label: '나무', category: 'plant', keywords: ['벚나무', '소나무', '나무'] },
  { type: 'grass', label: '풀', category: 'plant', keywords: ['잔디', '풀'] },
  { type: 'leaf', label: '나뭇잎', category: 'plant', keywords: ['나뭇잎', '잎'] },
  { type: 'mushroom', label: '버섯', category: 'plant', keywords: ['버섯'] },
  { type: 'cactus', label: '선인장', category: 'plant', keywords: ['선인장'] },
  { type: 'bamboo', label: '대나무', category: 'plant', keywords: ['대나무'] },
  { type: 'sunflower', label: '해바라기', category: 'plant', keywords: ['해바라기'] },
  { type: 'rose', label: '장미', category: 'plant', keywords: ['장미'] },
  { type: 'tulip', label: '튤립', category: 'plant', keywords: ['튤립'] },
  { type: 'seed', label: '씨앗', category: 'plant', keywords: ['씨앗'] },

  // ── 과일 ──
  { type: 'apple', label: '사과', category: 'fruit', keywords: ['사과'] },
  { type: 'banana', label: '바나나', category: 'fruit', keywords: ['바나나'] },
  { type: 'orange', label: '오렌지', category: 'fruit', keywords: ['오렌지'] },
  { type: 'grape', label: '포도', category: 'fruit', keywords: ['포도'] },
  { type: 'strawberry', label: '딸기', category: 'fruit', keywords: ['딸기'] },
  { type: 'peach', label: '복숭아', category: 'fruit', keywords: ['복숭아'] },
  { type: 'cherry', label: '체리', category: 'fruit', keywords: ['체리'] },
  { type: 'pear', label: '배', category: 'fruit', keywords: ['배'] },
  { type: 'pineapple', label: '파인애플', category: 'fruit', keywords: ['파인애플'] },
  { type: 'watermelon', label: '수박', category: 'fruit', keywords: ['수박'] },
  { type: 'melon', label: '멜론', category: 'fruit', keywords: ['멜론', '참외'] },
  { type: 'tangerine', label: '귤', category: 'fruit', keywords: ['귤', '한라봉'] },
  { type: 'lemon', label: '레몬', category: 'fruit', keywords: ['레몬'] },
  { type: 'blueberry', label: '블루베리', category: 'fruit', keywords: ['블루베리'] },
  { type: 'chestnut', label: '밤', category: 'fruit', keywords: ['밤'] },

  // ── 채소 · 음식 ──
  { type: 'carrot', label: '당근', category: 'vegetable', keywords: ['당근'] },
  { type: 'tomato', label: '토마토', category: 'vegetable', keywords: ['토마토'] },
  { type: 'corn', label: '옥수수', category: 'vegetable', keywords: ['옥수수'] },
  { type: 'pumpkin', label: '호박', category: 'vegetable', keywords: ['호박'] },
  { type: 'potato', label: '감자', category: 'vegetable', keywords: ['감자'] },
  { type: 'cabbage', label: '양배추', category: 'vegetable', keywords: ['양배추'] },
  { type: 'cucumber', label: '오이', category: 'vegetable', keywords: ['오이'] },
  { type: 'broccoli', label: '브로콜리', category: 'vegetable', keywords: ['브로콜리'] },
  { type: 'onion', label: '양파', category: 'vegetable', keywords: ['양파'] },
  { type: 'cake', label: '케이크', category: 'food', keywords: ['케이크'] },
  { type: 'cookie', label: '과자', category: 'food', keywords: ['과자', '쿠키'] },
  { type: 'bread', label: '빵', category: 'food', keywords: ['빵', '식빵', '바게트'] },
  { type: 'candy', label: '사탕', category: 'food', keywords: ['사탕'] },
  { type: 'chocolate', label: '초콜릿', category: 'food', keywords: ['초콜릿', '초콜렛'] },
  { type: 'ice_cream', label: '아이스크림', category: 'food', keywords: ['아이스크림'] },
  { type: 'cotton_candy', label: '솜사탕', category: 'food', keywords: ['솜사탕'] },
  { type: 'pizza', label: '피자', category: 'food', keywords: ['피자'] },
  { type: 'hamburger', label: '햄버거', category: 'food', keywords: ['햄버거'] },
  { type: 'ramen', label: '라면', category: 'food', keywords: ['라면'] },
  { type: 'rice', label: '밥', category: 'food', keywords: ['밥', '쌀'] },
  { type: 'soup', label: '국', category: 'food', keywords: ['국', '수프'] },
  { type: 'milk', label: '우유', category: 'food', keywords: ['우유'] },
  { type: 'juice', label: '주스', category: 'food', keywords: ['주스'] },

  // ── 자연 · 하늘 ──
  { type: 'cloud', label: '구름', category: 'nature', keywords: ['뭉게구름', '흰구름', '먹구름', '구름'] },
  { type: 'rainbow', label: '무지개', category: 'nature', keywords: ['무지개'] },
  { type: 'sun', label: '해', category: 'nature', keywords: ['햇님', '태양', '해'] },
  { type: 'moon', label: '달', category: 'nature', keywords: ['보름달', '초승달', '달'] },
  { type: 'star', label: '별', category: 'nature', keywords: ['별'] },
  { type: 'mountain', label: '산', category: 'nature', keywords: ['산꼭대기', '산'] },
  { type: 'river', label: '강', category: 'nature', keywords: ['시냇물', '개울', '강'] },
  { type: 'rock', label: '돌', category: 'nature', keywords: ['돌', '바위'] },
  { type: 'snowman', label: '눈사람', category: 'nature', keywords: ['눈사람'] },

  // ── 사람 ──
  { type: 'child', label: '아이', category: 'person', keywords: ['어린이', '아기', '친구', '아이'] },
  { type: 'family', label: '가족', category: 'person', keywords: ['할아버지', '할머니', '아빠', '엄마', '가족'] },
  { type: 'princess', label: '공주', category: 'person', keywords: ['왕자', '공주'] },

  // ── 탈것 ──
  { type: 'car', label: '자동차', category: 'vehicle', keywords: ['자동차', '승용차'] },
  { type: 'bus', label: '버스', category: 'vehicle', keywords: ['버스'] },
  { type: 'train', label: '기차', category: 'vehicle', keywords: ['기차', 'KTX', '전철'] },
  { type: 'airplane', label: '비행기', category: 'vehicle', keywords: ['비행기', '여객기'] },
  { type: 'bicycle', label: '자전거', category: 'vehicle', keywords: ['자전거'] },
  { type: 'boat', label: '배', category: 'vehicle', keywords: ['나무배', '유람선', '보트'] },
  { type: 'rocket', label: '로켓', category: 'vehicle', keywords: ['로켓', '우주선'] },

  // ── 사물 · 생활용품 ──
  { type: 'ball', label: '공', category: 'object', keywords: ['공'] },
  { type: 'kite', label: '연', category: 'object', keywords: ['연'] },
  { type: 'book', label: '책', category: 'object', keywords: ['동화책', '책'] },
  { type: 'umbrella', label: '우산', category: 'object', keywords: ['우산'] },
  { type: 'bag', label: '가방', category: 'object', keywords: ['가방', '책가방', '백팩'] },
  { type: 'pencil', label: '연필', category: 'object', keywords: ['연필', '색연필'] },
  { type: 'crayon', label: '크레파스', category: 'object', keywords: ['크레파스'] },
  { type: 'eraser', label: '지우개', category: 'object', keywords: ['지우개'] },
  { type: 'scissors', label: '가위', category: 'object', keywords: ['가위'] },
  { type: 'cup', label: '컵', category: 'object', keywords: ['컵', '머그컵'] },
  { type: 'bowl', label: '그릇', category: 'object', keywords: ['그릇', '접시'] },
  { type: 'spoon', label: '숟가락', category: 'object', keywords: ['숟가락', '젓가락'] },
  { type: 'chair', label: '의자', category: 'object', keywords: ['의자'] },
  { type: 'table', label: '탁자', category: 'object', keywords: ['탁자', '책상'] },
  { type: 'bed', label: '침대', category: 'object', keywords: ['침대'] },
  { type: 'clock', label: '시계', category: 'object', keywords: ['벽시계', '알람'] },
  { type: 'phone', label: '휴대폰', category: 'object', keywords: ['휴대폰', '핸드폰'] },
  { type: 'camera', label: '카메라', category: 'object', keywords: ['카메라'] },
  { type: 'gift', label: '선물', category: 'object', keywords: ['선물', '선물상자'] },
  { type: 'box', label: '상자', category: 'object', keywords: ['상자', '종이상자'] },
  { type: 'key', label: '열쇠', category: 'object', keywords: ['열쇠'] },
  { type: 'lamp', label: '램프', category: 'object', keywords: ['램프', '전등'] },
  { type: 'slide', label: '미끄럼틀', category: 'object', keywords: ['미끄럼틀', '미끄럼'] },
  { type: 'swing', label: '그네', category: 'object', keywords: ['그네'] },
  { type: 'robot', label: '로봇', category: 'object', keywords: ['로봇'] },
  { type: 'toothbrush', label: '칫솔', category: 'object', keywords: ['칫솔', '칫솔질'] },
  { type: 'toothpaste', label: '치약', category: 'object', keywords: ['치약', '치약통', '치약튜브'] },
  { type: 'soap', label: '비누', category: 'object', keywords: ['비누'] },

  // ── 악기 ──
  { type: 'piano', label: '피아노', category: 'instrument', keywords: ['피아노', '건반'] },
  { type: 'guitar', label: '기타', category: 'instrument', keywords: ['기타', '일렉기타'] },
  { type: 'violin', label: '바이올린', category: 'instrument', keywords: ['바이올린'] },
  { type: 'cello', label: '첼로', category: 'instrument', keywords: ['첼로'] },
  { type: 'drum', label: '드럼', category: 'instrument', keywords: ['드럼', '북', '소고'] },
  { type: 'flute', label: '플루트', category: 'instrument', keywords: ['플루트', '피리', '단소', '리코더'] },
  { type: 'trumpet', label: '트럼펫', category: 'instrument', keywords: ['트럼펫', '나팔'] },
  { type: 'harp', label: '하프', category: 'instrument', keywords: ['하프'] },
  { type: 'xylophone', label: '실로폰', category: 'instrument', keywords: ['실로폰', '쟁'] },
  { type: 'harmonica', label: '하모니카', category: 'instrument', keywords: ['하모니카'] },
  { type: 'accordion', label: '아코디언', category: 'instrument', keywords: ['아코디언'] },
  { type: 'ukulele', label: '우쿨렐레', category: 'instrument', keywords: ['우쿨렐레'] },
  { type: 'microphone', label: '마이크', category: 'instrument', keywords: ['마이크', '마이크로폰'] },
  { type: 'instrument', label: '악기', category: 'instrument', keywords: ['악기'] },

  // ── 악세서리 ──
  { type: 'necklace', label: '목걸이', category: 'accessory', keywords: ['목걸이', '펜던트'] },
  { type: 'ring', label: '반지', category: 'accessory', keywords: ['반지'] },
  { type: 'bracelet', label: '팔찌', category: 'accessory', keywords: ['팔찌', '팔목'] },
  { type: 'watch', label: '시계', category: 'accessory', keywords: ['손목시계', '워치'] },
  { type: 'glasses', label: '안경', category: 'accessory', keywords: ['안경', '선글라스'] },
  { type: 'hairpin', label: '머리핀', category: 'accessory', keywords: ['머리핀', '리본', '헤어밴드'] },
  { type: 'crown', label: '왕관', category: 'accessory', keywords: ['왕관', '티아라'] },
  { type: 'belt', label: '벨트', category: 'accessory', keywords: ['벨트', '허리띠'] },
  { type: 'wallet', label: '지갑', category: 'accessory', keywords: ['지갑'] },
  { type: 'accessory', label: '악세서리', category: 'accessory', keywords: ['악세서리', '액세서리', '장신구'] },

  // ── 옷 · 신발 ──
  { type: 'clothes', label: '옷', category: 'clothing', keywords: ['옷'] },
  { type: 'dress', label: '원피스', category: 'clothing', keywords: ['원피스', '드레스'] },
  { type: 'shirt', label: '셔츠', category: 'clothing', keywords: ['셔츠', '티셔츠'] },
  { type: 'pants', label: '바지', category: 'clothing', keywords: ['바지', '청바지', '반바지'] },
  { type: 'skirt', label: '치마', category: 'clothing', keywords: ['치마'] },
  { type: 'coat', label: '코트', category: 'clothing', keywords: ['코트', '외투', '재킷', '점퍼'] },
  { type: 'socks', label: '양말', category: 'clothing', keywords: ['양말'] },
  { type: 'gloves', label: '장갑', category: 'clothing', keywords: ['장갑'] },
  { type: 'scarf', label: '목도리', category: 'clothing', keywords: ['목도리', '스카프', '머플러'] },
  { type: 'pajamas', label: '잠옷', category: 'clothing', keywords: ['잠옷', '파자마'] },
  { type: 'uniform', label: '교복', category: 'clothing', keywords: ['교복', '유니폼'] },
  { type: 'apron', label: '앞치마', category: 'clothing', keywords: ['앞치마'] },
  { type: 'hat', label: '모자', category: 'clothing', keywords: ['모자', '캡', '야구모자', '비니'] },
  { type: 'shoe', label: '신발', category: 'clothing', keywords: ['신발', '운동화', '구두', '슬리퍼', '샌들', '부츠', '실내화'] },
  { type: 'rain_boots', label: '장화', category: 'clothing', keywords: ['장화', '레인부츠'] },

  // ── 장난감 · 인형 ──
  { type: 'toy', label: '장난감', category: 'toy', keywords: ['장난감'] },
  { type: 'doll', label: '인형', category: 'toy', keywords: ['인형', '곰인형', '봉제인형', '아기인형', '인형옷'] },
  { type: 'teddy_bear', label: '곰인형', category: 'toy', keywords: ['테디베어', '곰돌이인형'] },
  { type: 'action_figure', label: '피규어', category: 'toy', keywords: ['피규어', '액션피규어'] },
  { type: 'block', label: '블록', category: 'toy', keywords: ['블록', '레고', '블록놀이'] },
  { type: 'puzzle', label: '퍼즐', category: 'toy', keywords: ['퍼즐', '직소퍼즐'] },
  { type: 'yo_yo', label: '요요', category: 'toy', keywords: ['요요'] },
  { type: 'spinning_top', label: '팽이', category: 'toy', keywords: ['팽이'] },
  { type: 'toy_car', label: '장난감 자동차', category: 'toy', keywords: ['장난감자동차', '장난감 자동차', '미니카'] },
  { type: 'toy_train', label: '장난감 기차', category: 'toy', keywords: ['장난감기차', '장난감 기차'] },
  { type: 'stuffed_animal', label: '봉제 인형', category: 'toy', keywords: ['봉제인형'] },
  { type: 'balloon', label: '풍선', category: 'toy', keywords: ['풍선'] },
  { type: 'sandbox_toy', label: '모래삽', category: 'toy', keywords: ['모래삽', '모래놀이'] },
]

function mergeLexicons(base, extended) {
  const byType = new Map()
  for (const entry of base) {
    byType.set(entry.type, { ...entry, keywords: [...entry.keywords] })
  }
  for (const entry of extended) {
    if (byType.has(entry.type)) {
      const existing = byType.get(entry.type)
      const merged = new Set([...existing.keywords, ...entry.keywords, entry.label])
      existing.keywords = [...merged]
      if (!existing.label) existing.label = entry.label
    } else {
      byType.set(entry.type, {
        ...entry,
        keywords: [...new Set([...entry.keywords, entry.label])],
      })
    }
  }
  return [...byType.values()]
}

const LEXICON = mergeLexicons(BASE_LEXICON, ELEMENTARY_LEXICON)

/** 키워드 → 타입 빠른 조회 (조사 제거 후 매칭용) */
const KEYWORD_LOOKUP = new Map()

/** 긴 키워드 우선 전체 스캔용 (모듈 로드 시 1회 생성) */
const SORTED_SCAN_KEYWORDS = []

for (const entry of LEXICON) {
  const keywords = new Set([...entry.keywords, entry.label])
  for (const keyword of keywords) {
    const kw = keyword.replace(/\s+/g, '')
    if (!kw) continue
    // 한글 1글자 명사(빵, 별, 공 등)도 사전에 등록된 키워드면 허용
    if (kw.length === 1 && !/^[\uAC00-\uD7A3]$/.test(kw)) continue
    if (!KEYWORD_LOOKUP.has(kw)) KEYWORD_LOOKUP.set(kw, entry.type)
    SORTED_SCAN_KEYWORDS.push({ kw, type: entry.type, length: kw.length })
  }
}
SORTED_SCAN_KEYWORDS.sort((a, b) => b.length - a.length || a.kw.localeCompare(b.kw))

export const LEXICON_SIZE = LEXICON.length
export const KEYWORD_COUNT = KEYWORD_LOOKUP.size

export const KOREAN_NOUN_LEXICON = LEXICON.map(({ type, keywords }) => ({ type, keywords }))

export const KOREAN_NOUN_LABELS = Object.fromEntries(LEXICON.map((e) => [e.type, e.label]))

export const NOUN_CATEGORIES = Object.fromEntries(LEXICON.map((e) => [e.type, e.category]))

export const NOUN_SCENE_HINTS = Object.fromEntries(
  LEXICON.map((e) => [
    e.type,
    `a clear ${e.label} (${e.type.replace(/_/g, ' ')}) visible in the scene, child-friendly`,
  ])
)

const SEA_TYPES = new Set([
  'fish', 'baby_fish', 'shark', 'whale', 'octopus', 'crab', 'jellyfish',
  'starfish', 'seahorse', 'shrimp', 'turtle', 'seal', 'dolphin', 'walrus',
  'orca', 'ray', 'eel', 'pufferfish', 'hermit_crab', 'clam', 'mussel',
  'lobster', 'squid', 'clownfish', 'goldfish', 'tuna', 'salmon',
])

const SKY_TYPES = new Set([
  'bird', 'butterfly', 'bee', 'dragonfly', 'cloud', 'rainbow', 'sun', 'moon', 'star',
  'airplane', 'kite', 'bat', 'owl', 'eagle',
])

const PLAYGROUND_TYPES = new Set(['slide', 'swing', 'sandbox_toy'])

export function isPlaygroundObject(type) {
  return PLAYGROUND_TYPES.has(type)
}

export function getPlaygroundObject(types = []) {
  return types.find((t) => PLAYGROUND_TYPES.has(t))
}

export function isFoodEntity(type) {
  const cat = NOUN_CATEGORIES[type]
  return cat === 'fruit' || cat === 'vegetable' || cat === 'food'
}

export function isAnimalEntity(type) {
  return NOUN_CATEGORIES[type] === 'animal'
}

export function isPersonEntity(type) {
  return NOUN_CATEGORIES[type] === 'person'
}

export function buildLexiconTypeMap() {
  const map = {}
  for (const entry of LEXICON) {
    map[entry.type] = entry.type
    for (const keyword of entry.keywords) {
      map[keyword.replace(/\s+/g, '')] = entry.type
    }
  }
  return map
}

export function isSeaEntity(type) {
  return SEA_TYPES.has(type)
}

export function isSkyEntity(type) {
  return SKY_TYPES.has(type)
}

export function isLandEntity(type) {
  const cat = NOUN_CATEGORIES[type]
  return [
    'animal', 'plant', 'fruit', 'vegetable', 'food', 'object', 'person', 'vehicle',
    'instrument', 'accessory', 'clothing', 'toy', 'place',
  ].includes(cat)
}

export function isPlaceEntity(type) {
  return NOUN_CATEGORIES[type] === 'place'
}

export function lookupNounType(word) {
  const normalized = normalizeKoreanToken(word)
  if (!normalized) return null
  return KEYWORD_LOOKUP.get(normalized) ?? null
}

function normalize(text) {
  return text.replace(/\s+/g, '')
}

function isKeywordAllowed(normalized, kw, idx) {
  if (kw === '벌' && idx > 0 && normalized[idx - 1] === '애') return false
  if (kw === '개') {
    const next = normalized[idx + 1]
    if (['미', '발', '선', '요', '인', '울'].includes(next)) return false
  }
  if (kw === '말') {
    const next = normalized[idx + 1]
    const prev = normalized[idx - 1]
    if (['하', '했', '해', '함', '투'].includes(next)) return false
    if (prev === '할' || prev === '음') return false
  }
  if (kw === '소') {
    const next = normalized[idx + 1]
    if (['풍', '리', '속', '통', '개', '홀', '나'].includes(next)) return false
  }
  if (kw === '새') {
    if (normalized.slice(idx, idx + 2) === '새로') return false
    if (normalized.slice(idx, idx + 3) === '새롭') return false
    if (idx > 0 && normalized[idx - 1] === '냄') return false
  }
  if (kw === '범' && idx > 0 && normalized[idx - 1] === '범') return false
  if (kw === '게') {
    const next = normalized[idx + 1]
    if (['임', '속', '하', '장'].includes(next)) return false
  }
  if (kw === '해') {
    const next = normalized[idx + 1]
    if (['어', '염', '결', '당', '체', '품'].includes(next)) return false
  }
  if (kw === '양' && normalized.slice(idx, idx + 2) === '양말') return false
  if (kw === '산' && normalized.slice(idx, idx + 2) === '산책') return false
  if (kw === '사과') {
    const next = normalized[idx + 2]
    if (next === '해' || normalized.slice(idx + 2, idx + 4) === '해') return false
  }
  if (kw === '배') {
    const next = normalized[idx + 1]
    if (['경', '경치', '경'].includes(next)) return false
    if (next === '탔' || next === '타') return false
  }
  if (kw === '밤') {
    const next = normalized[idx + 1]
    if (['이', '에', '은', '을', '하'].includes(next)) return false
  }
  if (kw === '연') {
    if (normalized.slice(idx, idx + 2) === '연속') return false
    if (normalized.slice(idx, idx + 2) === '연습') return false
    if (normalized.slice(idx, idx + 2) === '연필') return false
  }
  if (kw === '잎') {
    if (normalized.slice(idx, idx + 2) === '잎사') return false
    if (idx > 0 && normalized[idx - 1] === '뭇') return false
  }
  if (kw === '공') {
    if (['원', '부', '책', '기', '간', '평', '포', '룡', '유', '통', '연'].includes(normalized[idx + 1])) return false
  }
  if (kw === '무') {
    if (['엇', '슨', '리', '서'].includes(normalized[idx + 1])) return false
  }
  if (kw === '빵') {
    if (normalized.slice(idx, idx + 2) === '빵집') return false
  }
  if (kw === '밥') {
    if (normalized.slice(idx, idx + 2) === '밥상') return false
  }
  if (kw === '옷') {
    const next = normalized[idx + 1]
    if (next === '장') return false
  }
  if (kw === '핀') {
    if (normalized.slice(idx, idx + 2) === '핀터') return false
  }
  if (kw === '북') {
    const prev = normalized[idx - 1]
    if (prev === '책') return false
  }
  if (kw === '티') {
    const next = normalized[idx + 1]
    if (['켓', '빨', '슈'].includes(next)) return false
    if (normalized.slice(idx, idx + 2) === '티셔') return false
  }
  if (kw === '배' && normalized.slice(idx, idx + 2) === '배경') return false
  if (kw === '문') {
    const next = normalized[idx + 1]
    if (['학', '제', '장', '법', '접', '서', '구'].includes(next)) return false
  }
  if (kw === '등' && normalized.slice(idx, idx + 2) === '등록') return false
  if (kw === '등' && normalized.slice(idx, idx + 2) === '등등') return false
  if (kw === '차') {
    const next = normalized[idx + 1]
    if (['례', '이', '이', '량', '별'].includes(next)) return false
  }
  if (kw === '감') {
    const next = normalized[idx + 1]
    if (['동', '사', '히', '각'].includes(next)) return false
  }
  if (kw === '종') {
    const next = normalized[idx + 1]
    if (['류', '목', '교'].includes(next)) return false
  }
  if (kw === '불' && normalized.slice(idx, idx + 2) === '불가') return false
  if (kw === '파') {
    const next = normalized[idx + 1]
    if (['도', '란', '티', '워', '괴'].includes(next)) return false
  }
  if (kw === '솔' && normalized.slice(idx, idx + 2) === '솔루') return false
  if (kw === '대') {
    const next = normalized[idx + 1]
    if (['학', '통', '표', '담', '회', '한'].includes(next)) return false
  }
  if (kw === '밭' && normalized.slice(idx, idx + 2) === '밭일') return false
  if (kw === '호' && normalized.slice(idx, idx + 2) === '호수') return false
  if (kw === '장' && normalized.slice(idx, idx + 2) === '장난') return false
  if (kw === '상' && normalized.slice(idx, idx + 2) === '상자') return false
  if (kw === '치' && normalized.slice(idx, idx + 2) === '치약') return false
  if (kw === '약' && idx > 0 && normalized[idx - 1] === '치') return false
  return true
}

function addMatch(matches, type, keyword, index, length) {
  matches.push({ type, keyword, index, length })
}

function scanKeywordsInText(normalized, matches) {
  for (const { kw, type } of SORTED_SCAN_KEYWORDS) {
    let start = 0
    while (start < normalized.length) {
      const idx = normalized.indexOf(kw, start)
      if (idx === -1) break
      if (isKeywordAllowed(normalized, kw, idx)) {
        addMatch(matches, type, kw, idx, kw.length)
        start = idx + kw.length
      } else {
        start = idx + 1
      }
    }
  }
}

function scanTokensInText(text, normalized, matches) {
  const tokens = tokenizeKoreanNounCandidates(text)
  for (const token of tokens) {
    const candidates = expandNounCandidates(token)
    for (const candidate of candidates) {
      const type = KEYWORD_LOOKUP.get(candidate)
      if (!type) continue
      const idx = normalized.indexOf(normalizeKoreanToken(token))
      if (idx === -1) continue
      if (!isKeywordAllowed(normalized, candidate, idx)) continue
      addMatch(matches, type, candidate, idx, normalizeKoreanToken(token).length)
    }
  }
}

export function findNounMatchesInText(text) {
  const normalized = normalize(text)
  const matches = []

  scanKeywordsInText(normalized, matches)
  scanTokensInText(text, normalized, matches)

  matches.sort((a, b) => b.length - a.length || a.index - b.index)

  const used = []
  const selected = []
  for (const m of matches) {
    const overlap = used.some((u) => !(m.index + m.length <= u.start || m.index >= u.end))
    if (overlap) continue
    used.push({ start: m.index, end: m.index + m.length })
    selected.push(m)
  }

  selected.sort((a, b) => a.index - b.index)
  const types = []
  for (const m of selected) {
    if (!types.includes(m.type)) types.push(m.type)
  }
  return { types, matches: selected }
}

export function hasUnrecognizedNouns(text, recognizedTypes = []) {
  const { types } = findNounMatchesInText(text)
  if (types.length === 0) return false
  const recognized = new Set(recognizedTypes)
  return types.some((t) => !recognized.has(t))
}

export function buildCaptionFromNouns(types, action, setting) {
  const settingKo = {
    sea: '바다', picnic: '소풍', park: '공원', forest: '숲', house: '집',
    school: '학교', sky: '하늘', mountain: '산', farm: '농장', savanna: '사바나',
    city: '도시', hospital: '병원', zoo: '동물원', library: '도서관',
  }
  const actionKo = ACTION_LABELS_KO
  const parts = []
  if (setting && settingKo[setting]) parts.push(settingKo[setting])
  types.slice(0, 4).forEach((t) => {
    if (KOREAN_NOUN_LABELS[t]) parts.push(KOREAN_NOUN_LABELS[t])
  })
  if (action && action !== 'standing' && actionKo[action]) parts.push(actionKo[action])
  return parts.join(' · ')
}

export function buildSceneHintFromTypes(types) {
  return types
    .slice(0, 4)
    .map((t) => NOUN_SCENE_HINTS[t])
    .filter(Boolean)
    .join('. ')
}

/** 행동·표정 한국어 라벨 */
export const ACTION_LABELS_KO = {
  smiling: '웃는 중',
  laughing: '크게 웃는 중',
  crying: '우는 중',
  angry: '화난 표정',
  surprised: '놀란 표정',
  scared: '무서워하는 중',
  singing: '노래하는 중',
  talking: '말하는 중',
  hugging: '안아주는 중',
  waving: '손 흔드는 중',
  eating: '먹는 중',
  chasing: '쫓는 중',
  swimming: '헤엄치는 중',
  playing: '노는 중',
  dancing: '춤추는 중',
  walking: '걷는 중',
  running: '달리는 중',
  jumping: '점프하는 중',
  sleeping: '자는 중',
  flying: '날아가는 중',
  reading: '책 읽는 중',
  drawing: '그림 그리는 중',
  sitting: '앉아 있는 중',
  standing: '서 있는 중',
  hiding: '숨는 중',
  waiting: '기다리는 중',
  fighting: '싸우는 중',
}

/** AI·장면 설명용 영어 행동 힌트 */
export const ACTION_SCENE_HINTS = {
  smiling: 'with big happy smiles and cheerful expressions',
  laughing: 'laughing joyfully with open happy mouths',
  crying: 'with teary eyes and sad expressions, gentle and not scary',
  angry: 'with mildly upset expressions, child-friendly not scary',
  surprised: 'with surprised wide eyes and open mouths, cute and funny',
  scared: 'looking a little scared but safe and gentle',
  singing: 'singing happily with open mouths',
  talking: 'talking to each other friendly',
  hugging: 'hugging each other warmly',
  waving: 'waving hello with raised hands',
  eating: 'eating happily',
  chasing: 'chasing playfully',
  swimming: 'swimming peacefully',
  playing: 'playing happily',
  dancing: 'dancing cheerfully',
  walking: 'walking together',
  running: 'running energetically',
  jumping: 'jumping with joy',
  sleeping: 'sleeping peacefully',
  flying: 'flying gently',
  reading: 'reading a book',
  drawing: 'drawing a picture',
  sitting: 'sitting calmly',
  standing: 'standing calmly',
  hiding: 'playing hide and seek',
  waiting: 'waiting patiently',
  fighting: 'facing each other playfully, no violence',
}

export function getActionLabelKo(action) {
  return ACTION_LABELS_KO[action] ?? null
}

export function getActionSceneHint(action) {
  return ACTION_SCENE_HINTS[action] ?? null
}
