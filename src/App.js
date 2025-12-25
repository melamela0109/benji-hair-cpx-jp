// 성별 추가
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronRight, ChevronLeft, Check, User, Scissors, Sparkles, Plus, Trash2, 
  Star, Activity, Calendar, Droplet, CheckCircle2, LayoutDashboard, 
  AlertTriangle, History, Phone, Clock, LogOut, SkipForward, Play, CheckSquare, Heart, ChevronDown, Lock, Globe,
  XCircle, AlertCircle, Pill, PanelLeft, Search, FileText, Coffee, BarChart3, PieChart // BarChart3, PieChart 포함됨
} from 'lucide-react';

// --- Firebase Imports ---
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, addDoc, query, orderBy, onSnapshot, 
  serverTimestamp, limit, doc, updateDoc, deleteDoc, where, getDocs 
} from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';

// ==================================================================
// 🔑 [설정] Firebase 설정
// ==================================================================
const firebaseConfig = {
  apiKey: "AIzaSyB0qWlZqE91mOxC6eL4l5MbDsvu11RsXtI",
  authDomain: "benji-hair-shop.firebaseapp.com",
  projectId: "benji-hair-shop",
  storageBucket: "benji-hair-shop.firebasestorage.app",
  messagingSenderId: "955809879686",
  appId: "1:955809879686:web:2e4041cd2fb2b9d8dce307",
  measurementId: "G-KDWG8W9YZX"
};

// Initialize Firebase
let app, auth, db;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.error("Firebase Initialization Failed!", error);
}

// ==================================================================
// 🌐 TRANSLATION DICTIONARY
// ==================================================================
const TRANSLATIONS = {
  ja: {
    // General
    loading: "読み込み中...",
    back: "戻る",
    next: "次へ",
    skip: "スキップ",
    submit: "送信する",
    submitting: "送信中...",
    delete: "削除",
    delete_confirm: "本当にこの顧客情報を削除しますか？\nこの操作は取り消せません。",
    delete_confirm_msg: "本当に削除しますか？",
    delete_yes: "はい、削除",
    delete_no: "キャンセル",
    delete_success: "削除しました。",
    error_save: "処理に失敗しました。権限を確認してください。",
    search_placeholder: "電話番号検索 (下4桁)",
    no_results: "検索結果がありません",
    // Visit Status
    visit_new: "新規",
    visit_regular: "リピーター",
    visit_count_suffix: "回目",
    visit_history_label: "来店履歴",
    // Landing
    landing_title: "BENJI",
    landing_subtitle: "PREMIUM HAIR CONSULTING",
    start_counseling: "カウンセリングを始める",
    landing_desc: "より良いサービスのため\nカウンセリングシートにご記入ください",
    admin_mode: "スタイリストモード",
    // Admin Login
    admin_login_title: "管理者ログイン",
    password_placeholder: "パスワード",
    login_btn: "ログイン",
    cancel_btn: "キャンセル",
    wrong_password: "パスワードが違います",
    // Step 0
    step0_title: "お客様情報の入力",
    step0_desc: "スムーズなカウンセリングのため、基本情報を入力してください。",
    name_label: "お名前",
    name_placeholder: "山田 太郎",
    phone_label: "電話番号",
    phone_placeholder: "09012345678",
    privacy_agree: "【必須】個人情報の収集および利用への同意",
    privacy_desc: "ご入力いただいた情報は、カウンセリングおよび施術の目的でのみ使用されます。",
    phone_error: "数字のみ入力してください。",
    q_gender: "性別", // Moved to Step 0
    opt_gender: ["女性", "男性", "その他"], // Moved to Step 0
    // Step 1
    step1_title: "髪の状態チェック",
    step1_desc: "現在の髪の状態を把握するための基本的な項目です。",
    q_hair_length: "髪の長さ",
    opt_length: ["ショート", "ミディアム", "ロング", "その他"],
    q_scalp: "頭皮の状態",
    opt_scalp: ["乾燥", "脂性", "普通", "その他"],
    q_concern: "お悩み（複数選択可）",
    opt_concern: ["抜け毛", "ダメージ", "乾燥", "切れ毛・枝毛", "フケ", "かゆみ", "特になし"],
    q_history: "最近の施術経験（パーマ、カラー、ブリーチなど）",
    opt_yes: "あり",
    opt_no: "なし",
    q_history_type: "施術の種類（複数選択可）",
    opt_history_type: ["パーマ", "カラー", "ブリーチ"],
    q_last_time: "最後の施術時期",
    opt_time: ["選択してください", "1ヶ月以内", "3ヶ月以内", "6ヶ月以上"],
    // Step 2
    step2_title: "詳細カウンセリング",
    step2_desc: "より快適なサービスのため、任意で入力してください。\n全ての項目に答える必要はありません。",
    q_massage: "シャンプー＆マッサージの力加減",
    massage_desc_1: "ご希望に合わせて",
    massage_desc_2: "より快適なシャンプー・頭皮ケアを提供いたします。",
    opt_massage: [{v:'soft', l:'弱め'}, {v:'normal', l:'普通'}, {v:'strong', l:'強め'}],
    q_visit_freq: "美容室に行く頻度",
    opt_visit: ["選択しない", "毎週", "2~4週間", "2~3ヶ月", "6ヶ月以上"],
    q_shampoo_freq: "シャンプーの頻度",
    opt_shampoo: ["選択しない", "毎日", "2日に1回", "週2回以下"],
    q_products: "使用中の製品 (例: シャンプー、リンス等)",
    ph_prod_type: "製品の種類 (例: シャンプー)",
    ph_prod_name: "製品名",
    add_item: "項目を追加",
    // Step 2 New Items
    q_styling_pref: "仕上げスタイリングの好み",
    opt_styling: ["ナチュラル", "ボリューム重視", "しっかり固定", "軽め"],
    // 🆕 Service Mood
    q_service_mood: "ご希望の過ごし方",
    opt_service_mood: ["なるべく静かに過ごしたい", "髪の悩みやケア方法を知りたい", "楽しく話したい"],
    q_med_check: "現在、施術に影響する可能性のあるお薬を服用中ですか？",
    q_med_check_yes: "はい（要相談）",
    q_med_check_no: "いいえ",
    q_med_detail: "該当する項目を選択してください（複数選択可）",
    opt_med_detail: ["肌・頭皮が敏感になる薬", "カラー/パーマに影響する薬", "その他"],
    ph_med_other: "詳細をご記入ください",
    q_requests: "その他ご要望",
    // Step 3 (Confirm)
    step3_title: "入力内容の確認",
    section_basic: "基本情報",
    section_status: "状態まとめ",
    section_care: "ケアの好み・習慣",
    section_pref: "仕上げ・安全確認",
    section_items: "使用製品",
    section_req: "ご要望",
    // Submitted Screen
    submitted_title: "受付が完了しました！",
    submitted_desc: "担当スタイリストが確認後、\nご案内いたします。",
    submitted_wait: "少々お待ちください。",
    back_to_top: "トップへ戻る",
    // Admin
    admin_dashboard: "BENJI HAIR DASHBOARD",
    waiting_list: "待機リスト",
    status_waiting: "カウンセリング待ち",
    status_progress: "施術中",
    status_completed: "施術完了",
    critical_alert: "施術前の注意事項 (Critical)",
    select_customer: "お客様を選択してください",
    med_alert_label: "服薬/健康状態",
    designer_memo: "デザイナーメモ",
    memo_placeholder: "施術内容や特記事項を入力...",
    save_memo: "保存",
    memo_saved: "保存完了",
    // Stats
    tab_queue: "受付リスト",
    tab_stats: "統計",
    stats_total_visits: "総来店数",
    stats_retention_rate: "リピート率",
    stats_new_ratio: "新規比率",
    stats_concerns_rank: "悩みランキング (TOP 5)",
    stats_scalp_dist: "頭皮タイプ分布",
    stats_mood_pref: "希望する雰囲気",
    stats_massage_pref: "マッサージ強度",
    stats_count: "件"
  },
  ko: {
    loading: "로딩 중...",
    back: "이전",
    next: "다음",
    skip: "건너뛰기",
    submit: "제출하기",
    submitting: "전송 중...",
    delete: "삭제",
    delete_confirm: "정말 이 고객 정보를 삭제하시겠습니까?\n삭제 후에는 복구할 수 없습니다.",
    delete_confirm_msg: "정말 삭제하시겠습니까?",
    delete_yes: "네, 삭제",
    delete_no: "취소",
    delete_success: "삭제되었습니다.",
    error_save: "저장/삭제 중 오류가 발생했습니다.",
    search_placeholder: "전화번호 검색 (뒷번호)",
    no_results: "검색 결과가 없습니다",
    // Visit Status
    visit_new: "신규",
    visit_regular: "단골",
    visit_count_suffix: "회차",
    visit_history_label: "방문 이력",
    landing_title: "BENJI",
    landing_subtitle: "PREMIUM HAIR CONSULTING",
    start_counseling: "상담 시작하기",
    landing_desc: "더 나은 서비스를 위해\n상담지를 작성해주세요",
    admin_mode: "디자이너 모드",
    admin_login_title: "관리자 로그인",
    password_placeholder: "비밀번호",
    login_btn: "로그인",
    cancel_btn: "취소",
    wrong_password: "비밀번호가 틀렸습니다",
    step0_title: "고객 정보 입력",
    step0_desc: "원활한 상담을 위해 기본 정보를 입력해 주세요.",
    name_label: "이름",
    name_placeholder: "홍길동",
    phone_label: "전화번호",
    phone_placeholder: "01012345678",
    privacy_agree: "【필수】 개인정보 수집 및 이용 동의",
    privacy_desc: "입력해주신 정보는 상담 및 시술 목적으로만 사용됩니다.",
    phone_error: "숫자만 입력해 주세요.",
    q_gender: "성별", // Moved to Step 0
    opt_gender: ["여성", "남성", "기타"], // Moved to Step 0
    step1_title: "모발 상태 체크",
    step1_desc: "현재 모발 상태를 파악하기 위한 기본 항목입니다.",
    q_hair_length: "1. 머리 길이",
    opt_length: ["짧음", "중간", "긴머리", "기타"],
    q_scalp: "2. 두피 상태",
    opt_scalp: ["건성", "지성", "보통", "기타"],
    q_concern: "3. 고민 사항 (중복 가능)",
    opt_concern: ["탈모", "손상", "건조", "끊어짐/갈라짐", "비듬", "가려움", "없음"],
    q_history: "4. 최근 시술 경험 (ex. 펌, 염색, 탈색)",
    opt_yes: "있음",
    opt_no: "없음",
    q_history_type: "시술 종류 (중복 가능)",
    opt_history_type: ["펌", "염색", "탈색"],
    q_last_time: "마지막 시술 시기",
    opt_time: ["선택해주세요", "1개월 이내", "3개월 이내", "6개월 이상"],
    step2_title: "상세 상담",
    step2_desc: "더 편안한 서비스를 위해 선택적으로 입력해 주세요.\n모든 항목에 답하지 않으셔도 괜찮습니다.",
    q_massage: "샴푸 & 두피 마사지 강도",
    massage_desc_1: "말씀해주신 선호도에 맞춰",
    massage_desc_2: "보다 편안한 샴푸 및 두피 케어를 제공해드립니다.",
    opt_massage: [{v:'soft', l:'약하게'}, {v:'normal', l:'보통'}, {v:'strong', l:'강하게'}],
    q_visit_freq: "미용실 방문 주기",
    opt_visit: ["선택 안 함", "매주", "2~4주", "2~3개월", "6개월 이상"],
    q_shampoo_freq: "샴푸 빈도",
    opt_shampoo: ["선택 안 함", "매일", "2일에 1회", "주 2회 이하"],
    q_products: "사용 중인 제품 (ex. 샴푸, 컨디셔너 등 헤어관련제품)",
    ph_prod_type: "제품 종류 (ex. 샴푸)",
    ph_prod_name: "제품명",
    add_item: "항목 추가",
    q_styling_pref: "마무리 스타일링 선호",
    opt_styling: ["자연스럽게", "볼륨 강조", "고정력 있게", "가볍게"],
    // 🆕 Service Mood
    q_service_mood: "희망하는 시술 분위기",
    opt_service_mood: ["조용히 쉬고 싶어요", "시술/관리 설명이 필요해요", "즐겁게 대화하고 싶어요"],
    q_med_check: "현재 미용 시술에 영향을 줄 수 있는 약물을 복용 중이신가요?",
    q_med_check_yes: "있음 (시술 전 상담 필요)",
    q_med_check_no: "없음",
    q_med_detail: "해당되는 항목이 있다면 선택해주세요 (복수 선택)",
    opt_med_detail: ["피부·두피가 예민해질 수 있는 약", "염색/펌에 영향이 있을 수 있는 약", "기타"],
    ph_med_other: "상세 내용을 적어주세요",
    q_requests: "기타 요청사항",
    step3_title: "작성 내용 확인",
    section_basic: "기본 정보",
    section_status: "상태 요약",
    section_care: "케어 선호도",
    section_pref: "스타일링/안전",
    section_items: "사용 제품",
    section_req: "요청사항",
    submitted_title: "접수가 완료되었습니다!",
    submitted_desc: "담당 디자이너가 곧 확인 후\n안내해 드리겠습니다.",
    submitted_wait: "잠시만 대기해 주세요.",
    back_to_top: "처음으로",
    admin_dashboard: "BENJI HAIR DASHBOARD",
    waiting_list: "대기 리스트",
    status_waiting: "상담 대기중",
    status_progress: "시술 중",
    status_completed: "시술 완료",
    critical_alert: "시술 전 주의사항 (Critical)",
    select_customer: "고객을 선택해주세요",
    med_alert_label: "약물/안전 체크",
    designer_memo: "디자이너 메모",
    memo_placeholder: "시술 내용이나 특이사항을 입력하세요...",
    save_memo: "저장",
    memo_saved: "저장 완료",
    // Stats
    tab_queue: "대기 리스트",
    tab_stats: "통계",
    stats_total_visits: "총 방문 수",
    stats_retention_rate: "재방문율",
    stats_new_ratio: "신규 비율",
    stats_concerns_rank: "고민 랭킹 (TOP 5)",
    stats_scalp_dist: "두피 타입 분포",
    stats_mood_pref: "선호하는 분위기",
    stats_massage_pref: "마사지 강도 선호",
    stats_count: "건"
  },
  en: {
    loading: "Loading...",
    back: "Back",
    next: "Next",
    skip: "Skip",
    submit: "Submit",
    submitting: "Submitting...",
    delete: "Delete",
    delete_confirm: "Are you sure you want to delete this customer?\nThis cannot be undone.",
    delete_confirm_msg: "Are you sure?",
    delete_yes: "Yes",
    delete_no: "No",
    delete_success: "Deleted successfully.",
    error_save: "Error saving/deleting data.",
    search_placeholder: "Search Phone (Last 4)",
    no_results: "No results found",
    // Visit Status
    visit_new: "New",
    visit_regular: "Regular",
    visit_count_suffix: " visit",
    visit_history_label: "Visit History",
    landing_title: "BENJI",
    landing_subtitle: "PREMIUM HAIR CONSULTING",
    start_counseling: "Start Counseling",
    landing_desc: "Please fill out the form\nfor better service",
    admin_mode: "Stylist Mode",
    admin_login_title: "Admin Login",
    password_placeholder: "Password",
    login_btn: "Login",
    cancel_btn: "Cancel",
    wrong_password: "Wrong Password",
    step0_title: "Guest Information",
    step0_desc: "Please enter basic info for smooth counseling.",
    name_label: "Name",
    name_placeholder: "Your Name",
    phone_label: "Phone Number",
    phone_placeholder: "09012345678",
    privacy_agree: "[Required] Privacy Policy Agreement",
    privacy_desc: "Information is used only for counseling and service purposes.",
    phone_error: "Numbers only.",
    q_gender: "Gender", // Moved to Step 0
    opt_gender: ["Female", "Male", "Other"], // Moved to Step 0
    step1_title: "Hair Condition",
    step1_desc: "Basic check for your current hair condition.",
    q_hair_length: "Hair Length",
    opt_length: ["Short", "Medium", "Long", "Other"],
    q_scalp: "Scalp Type",
    opt_scalp: ["Dry", "Oily", "Normal", "Other"],
    q_concern: "Concerns",
    opt_concern: ["Hair Loss", "Damage", "Dryness", "Split Ends", "Dandruff", "Itchiness", "None"],
    q_history: "Recent History",
    opt_yes: "Yes",
    opt_no: "No",
    q_history_type: "Treatment Type",
    opt_history_type: ["Perm", "Color", "Bleach"],
    q_last_time: "Last Treatment",
    opt_time: ["Select", "Within 1 mo", "Within 3 mo", "Over 6 mo"],
    step2_title: "Detailed Counseling",
    step2_desc: "Optional. You may skip this section.",
    q_massage: "Massage Intensity",
    massage_desc_1: "We provide comfortable care",
    massage_desc_2: "based on your preference.",
    opt_massage: [{v:'soft', l:'Soft'}, {v:'normal', l:'Normal'}, {v:'strong', l:'Strong'}],
    q_visit_freq: "Visit Frequency",
    opt_visit: ["None", "Weekly", "2-4 Weeks", "2-3 Months", "6+ Months"],
    q_shampoo_freq: "Shampoo Frequency",
    opt_shampoo: ["None", "Daily", "Every 2 days", "Twice a week"],
    q_products: "Products Used",
    ph_prod_type: "Product Type",
    ph_prod_name: "Product Name",
    add_item: "Add Item",
    q_styling_pref: "Styling Preference",
    opt_styling: ["Natural", "Volume", "Strong Hold", "Light"],
    // 🆕 Service Mood - Removed Magazine/Tablet
    q_service_mood: "Service Preference",
    opt_service_mood: ["Quietly", "Explain treatment", "Chatting"],
    q_med_check: "Are you taking medication that affects treatment?",
    q_med_check_yes: "Yes (Need consult)",
    q_med_check_no: "No",
    q_med_detail: "Select applicable items",
    opt_med_detail: ["Sensitive Skin/Scalp", "Affects Color/Perm", "Other"],
    ph_med_other: "Please provide details",
    q_requests: "Other Requests",
    step3_title: "Confirmation",
    section_basic: "Basic Info",
    section_status: "Hair Status",
    section_care: "Preferences",
    section_pref: "Styling/Safety",
    section_items: "Products",
    section_req: "Requests",
    submitted_title: "Submission Complete!",
    submitted_desc: "Your stylist will check and\nguide you shortly.",
    submitted_wait: "Please wait a moment.",
    back_to_top: "Back to Top",
    admin_dashboard: "BENJI HAIR DASHBOARD",
    waiting_list: "Waiting List",
    status_waiting: "Waiting",
    status_progress: "In Progress",
    status_completed: "Completed",
    critical_alert: "Critical Issues",
    select_customer: "Select a customer",
    med_alert_label: "Health Check",
    designer_memo: "Designer Memo",
    memo_placeholder: "Enter details...",
    save_memo: "Save",
    memo_saved: "Saved",
    tab_queue: "Queue",
    tab_stats: "Stats",
    stats_total_visits: "Total Visits",
    stats_retention_rate: "Retention",
    stats_new_ratio: "New Ratio",
    stats_concerns_rank: "Top Concerns",
    stats_scalp_dist: "Scalp Type",
    stats_mood_pref: "Service Mood",
    stats_massage_pref: "Massage Pref",
    stats_count: ""
  }
};

// --- Main Application Component ---
const BenjiHairApp = () => {
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState('landing'); 
  const [configError, setConfigError] = useState(false);
  const [lang, setLang] = useState('ja'); // Default Language: Japanese

  // Helper for Translation
  const t = (key) => TRANSLATIONS[lang][key] || key;

  useEffect(() => {
    const initAuth = async () => {
      try { await signInAnonymously(auth); } 
      catch (error) { console.error("Auth Error:", error); }
    };
    initAuth();
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, setUser);
      return () => unsubscribe();
    }
  }, []);

  if (configError) return <div className="min-h-screen flex items-center justify-center p-8 text-red-800 bg-red-50">{t('error_config')}</div>;
  if (!user) return <div className="flex items-center justify-center min-h-screen bg-[#f9f9f9] text-[#f5ae71]">{t('loading')}</div>;

  // Language Switcher
  const LanguageSwitcher = () => (
    <div className="absolute top-6 left-6 z-50 flex gap-2">
      {['ja', 'ko', 'en'].map(l => (
        <button 
          key={l}
          onClick={() => setLang(l)}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${lang === l ? 'bg-[#f5ae71] text-white' : 'bg-white/50 text-slate-500 hover:bg-white'}`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );

  // 🎨 [랜딩 페이지]
  if (mode === 'landing') {
    return (
      <div className="min-h-screen bg-[#c4d6c5] flex flex-col relative overflow-hidden">
        <LanguageSwitcher />
        <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-white/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-[#f5ae71]/30 rounded-full blur-3xl"></div>

        <div className="absolute top-6 right-6 z-50">
          <button 
            onClick={() => setMode('adminLogin')} 
            className="text-white hover:text-[#f5ae71] flex items-center gap-2 text-sm transition-colors bg-white/10 hover:bg-white px-4 py-2 rounded-full border border-white/20 backdrop-blur-sm shadow-sm cursor-pointer"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="hidden sm:inline font-medium">{t('admin_mode')}</span>
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10">
          <div className="mb-12 animate-fade-in">
            <h1 className="text-6xl font-bold text-white mb-4 tracking-tighter drop-shadow-sm">{t('landing_title')}</h1>
            <p className="text-white/90 text-lg font-light tracking-widest">{t('landing_subtitle')}</p>
          </div>
          
          <button 
            onClick={() => setMode('client')}
            className="group w-full max-w-sm p-10 rounded-[2.5rem] bg-white hover:bg-[#fffbf7] transition-all duration-500 flex flex-col items-center gap-6 shadow-2xl shadow-[#8da38e]/30 animate-slide-up transform hover:-translate-y-2 hover:scale-105 cursor-pointer"
          >
            <div className="w-24 h-24 rounded-full bg-[#fdf5ed] group-hover:bg-[#f5ae71] text-[#f5ae71] group-hover:text-white flex items-center justify-center transition-all duration-300 shadow-inner">
              <User className="w-10 h-10" />
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-slate-800 mb-2 group-hover:text-[#f5ae71] transition-colors">{t('start_counseling')}</h3>
              <p className="text-slate-400 font-light whitespace-pre-line">{t('landing_desc')}</p>
            </div>
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'adminLogin') {
    return <AdminLogin onLogin={() => setMode('admin')} onBack={() => setMode('landing')} t={t} />;
  }

  return (
    <>
      {mode === 'client' && <ClientView onBack={() => setMode('landing')} user={user} t={t} />}
      {mode === 'admin' && <AdminDashboard onBack={() => setMode('landing')} user={user} />}
    </>
  );
};

// 🛠️ [AdminLogin]
const AdminLogin = ({ onLogin, onBack, t }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === '1234') { 
      onLogin();
    } else {
      setError(true);
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-[#c4d6c5] flex flex-col items-center justify-center p-6">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-xs animate-slide-up">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-[#f5ae71]/10 text-[#f5ae71] rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">{t('admin_login_title')}</h2>
          <p className="text-slate-400 text-sm mt-1">{t('password_placeholder')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input 
              type="password" 
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
              placeholder="Password" 
              className={`w-full px-5 py-3 border-2 rounded-xl text-center text-lg tracking-widest focus:outline-none transition-all ${error ? 'border-red-300 bg-red-50 focus:border-red-500' : 'border-slate-200 focus:border-[#f5ae71]'}`}
              autoFocus
            />
            {error && <p className="text-red-500 text-xs text-center mt-2 flex items-center justify-center gap-1"><AlertTriangle className="w-3 h-3"/> {t('wrong_password')}</p>}
          </div>
          <button type="submit" className="w-full py-3 bg-[#f5ae71] text-white rounded-xl font-bold shadow-lg shadow-[#f5ae71]/30 hover:bg-[#e09e60] transition-all active:scale-[0.98]">{t('login_btn')}</button>
        </form>
        <button onClick={onBack} className="w-full mt-4 text-slate-400 text-sm hover:text-slate-600 transition-colors">{t('cancel_btn')}</button>
      </div>
    </div>
  );
};

// ==========================================
// SHARED UI COMPONENTS
// ==========================================
const SectionTitle = ({ icon: Icon, title, subTitle }) => (
  <div className="mb-6">
    <div className="flex items-center gap-2 mb-2">
      {Icon && <Icon className="w-6 h-6 text-[#f5ae71]" />}
      <h2 className="text-xl font-bold text-slate-800">{title}</h2>
    </div>
    {subTitle && <p className="text-sm text-slate-500 whitespace-pre-line leading-relaxed border-l-4 border-[#c4d6c5] pl-3 py-1 bg-[#f9fcf9] rounded-r-lg">{subTitle}</p>}
  </div>
);

const RadioCard = ({ selected, value, label, onClick, subLabel }) => (
  <div onClick={() => onClick(value)} className={`cursor-pointer rounded-2xl border p-4 transition-all duration-300 flex flex-col justify-center items-center text-center gap-1 shadow-sm ${selected === value ? 'border-[#f5ae71] bg-[#fff8f2] text-[#e08e50] ring-1 ring-[#f5ae71] shadow-md transform scale-[1.02]' : 'border-slate-100 hover:border-[#c4d6c5] bg-white text-slate-500 hover:bg-[#f9fcf9]'}`}>
    <span className="font-bold text-sm">{label}</span>
    {subLabel && <span className="text-xs opacity-75">{subLabel}</span>}
  </div>
);

const CheckboxCard = ({ checked, label, onClick }) => (
  <div onClick={onClick} className={`cursor-pointer rounded-2xl border p-4 flex items-center gap-3 transition-all duration-300 shadow-sm ${checked ? 'border-[#f5ae71] bg-[#fff8f2] text-[#e08e50] shadow-md' : 'border-slate-100 hover:border-[#c4d6c5] bg-white text-slate-500 hover:bg-[#f9fcf9]'}`}>
    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${checked ? 'bg-[#f5ae71] border-[#f5ae71]' : 'border-slate-300 bg-white'}`}>{checked && <Check className="w-3 h-3 text-white" />}</div>
    <span className="font-bold text-sm">{label}</span>
  </div>
);

const DynamicInputs = ({ items, type, placeholder1, placeholder2, onAdd, onRemove, onUpdate, btnText }) => (
  <div className="space-y-3">
    {items.map((item) => (
      <div key={item.id} className="flex gap-2 items-start animate-fade-in">
        <div className="grid grid-cols-2 gap-2 flex-1">
          <input type="text" placeholder={placeholder1} value={item.category} onChange={(e) => onUpdate(type, item.id, 'category', e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-[#f5ae71] focus:ring-2 focus:ring-[#f5ae71]/20 text-sm bg-white" />
          <input type="text" placeholder={placeholder2} value={item.productName} onChange={(e) => onUpdate(type, item.id, 'productName', e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-[#f5ae71] focus:ring-2 focus:ring-[#f5ae71]/20 text-sm bg-white" />
        </div>
        <button onClick={() => onRemove(type, item.id)} className="p-3 text-slate-400 hover:text-red-400 transition-colors hover:bg-red-50 rounded-xl"><Trash2 className="w-5 h-5" /></button>
      </div>
    ))}
    <button onClick={() => onAdd(type)} className="w-full py-3 border border-dashed border-[#c4d6c5] rounded-xl text-[#8da38e] flex items-center justify-center gap-2 hover:bg-[#f9fcf9] hover:border-[#8da38e] transition-colors text-sm font-medium"><Plus className="w-4 h-4" /> {btnText}</button>
  </div>
);

// --- STEPS ---
// 💡 [Modified] Step 0 includes Gender Selection
const Step0_PersonalInfo = ({ formData, updateField, phoneError, t }) => (
  <div className="animate-slide-up">
    <SectionTitle icon={User} title={t('step0_title')} subTitle={t('step0_desc')} />
    <div className="space-y-6">
      <div><label className="block text-sm font-bold text-slate-700 mb-2 pl-1">{t('name_label')}</label><input type="text" value={formData.name} onChange={(e) => updateField('name', e.target.value)} placeholder={t('name_placeholder')} className="w-full px-5 py-4 border border-slate-200 rounded-2xl focus:outline-none focus:border-[#f5ae71] focus:ring-4 focus:ring-[#f5ae71]/10 transition-all bg-white" /></div>
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2 pl-1">{t('phone_label')}</label>
        <input type="tel" value={formData.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder={t('phone_placeholder')} className={`w-full px-5 py-4 border rounded-2xl focus:outline-none focus:ring-4 transition-all bg-white ${phoneError ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:border-[#f5ae71] focus:ring-[#f5ae71]/10'}`} />
        {phoneError && <p className="text-red-500 text-xs mt-2 ml-1 flex items-center gap-1 animate-fade-in"><AlertTriangle className="w-3 h-3" /> {t('phone_error')}</p>}
      </div>

      {/* 💡 [Moved] Gender Selection Here */}
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2 pl-1">{t('q_gender')}</label>
        <div className="grid grid-cols-3 gap-2">
            {t('opt_gender').map((opt) => (
                <RadioCard key={opt} label={opt} value={opt} selected={formData.gender} onClick={(v) => updateField('gender', v)} />
            ))}
        </div>
      </div>

      <div className="pt-6 border-t border-slate-100">
        <label className="flex items-start gap-3 cursor-pointer p-4 rounded-2xl hover:bg-[#f9fcf9] transition-colors border border-transparent hover:border-[#c4d6c5]/30">
          <div className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors ${formData.privacyAgreed ? 'bg-[#c4d6c5]' : 'bg-slate-200'}`}><Check className="w-3 h-3 text-white" /></div>
          <input type="checkbox" className="hidden" checked={formData.privacyAgreed} onChange={(e) => updateField('privacyAgreed', e.target.checked)} />
          <div className="text-sm text-slate-500 leading-relaxed"><span className="font-bold text-slate-700">{t('privacy_agree')}</span><br/>{t('privacy_desc')}</div>
        </label>
      </div>
    </div>
  </div>
);

// 💡 [Modified] Step 1 (Removed Gender)
const Step1_Basic = ({ formData, updateField, toggleCondition, toggleChemicalType, t }) => (
  <div className="animate-slide-up space-y-8">
    <div><SectionTitle icon={Scissors} title={t('step1_title')} /><div className="bg-[#f9fcf9] p-5 rounded-2xl border border-[#c4d6c5]/30 mb-6 text-sm text-slate-600 leading-relaxed">{t('step1_desc')}</div></div>
    
    <section><h3 className="text-sm font-bold text-slate-800 mb-3 pl-1">{t('q_hair_length')}</h3><div className="grid grid-cols-4 gap-2">{t('opt_length').map((opt) => (<RadioCard key={opt} label={opt} value={opt} selected={formData.hairLength} onClick={(v) => updateField('hairLength', v)} />))}</div></section>
    <section><h3 className="text-sm font-bold text-slate-800 mb-3 pl-1">{t('q_scalp')}</h3><div className="grid grid-cols-4 gap-2">{t('opt_scalp').map((opt) => (<RadioCard key={opt} label={opt} value={opt} selected={formData.scalpType} onClick={(v) => updateField('scalpType', v)} />))}</div></section>
    <section><h3 className="text-sm font-bold text-slate-800 mb-3 pl-1">{t('q_concern')}</h3><div className="grid grid-cols-2 gap-2">{t('opt_concern').map((opt) => (<CheckboxCard key={opt} label={opt} checked={formData.hairConditions.includes(opt)} onClick={() => toggleCondition(opt)} />))}</div></section>
    <section>
      <h3 className="text-sm font-bold text-slate-800 mb-3 pl-1">{t('q_history')}</h3>
      <div className="flex gap-2 mb-3">
        <RadioCard label={t('opt_yes')} value="yes" selected={formData.chemicalHistory} onClick={(v) => updateField('chemicalHistory', v)} />
        <RadioCard label={t('opt_no')} value="no" selected={formData.chemicalHistory} onClick={(v) => updateField('chemicalHistory', v)} />
      </div>
      {formData.chemicalHistory === 'yes' && (
        <div className="bg-[#fff8f2] p-5 rounded-2xl border border-[#f5ae71]/30 animate-fade-in space-y-5">
          <div>
            <label className="block text-xs font-bold text-[#e08e50] mb-2 pl-1">{t('q_history_type')}</label>
            <div className="grid grid-cols-3 gap-2">{t('opt_history_type').map((type) => (<CheckboxCard key={type} label={type} checked={formData.chemicalHistoryTypes.includes(type)} onClick={() => toggleChemicalType(type)} />))}</div>
          </div>
          <div>
            <label className="block text-xs font-bold text-[#e08e50] mb-2 pl-1">{t('q_last_time')}</label>
            <select className="w-full px-4 py-3 rounded-xl border border-[#f5ae71]/30 bg-white focus:outline-none focus:ring-2 focus:ring-[#f5ae71]/20" value={formData.chemicalHistoryTime} onChange={(e) => updateField('chemicalHistoryTime', e.target.value)}>
              {t('opt_time').map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </div>
      )}
    </section>
  </div>
);

const Step2_Detailed = ({ formData, updateField, addDynamicField, removeDynamicField, updateDynamicField, toggleStylingPref, toggleMedDetail, toggleServiceMood, t }) => {
  const isMedOtherSelected = formData.medicationTypes.includes(t('opt_med_detail')[2]);

  return (
    <div className="animate-slide-up space-y-10">
      <SectionTitle icon={Sparkles} title={t('step2_title')} subTitle={t('step2_desc')} />
      
      {/* 1. Massage */}
      <section className="bg-gradient-to-br from-[#c4d6c5]/20 to-[#f5ae71]/10 p-6 rounded-3xl border border-white shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2"><Star className="w-4 h-4 text-[#f5ae71] fill-current" />{t('q_massage')}</h3>
        <div className="grid grid-cols-3 gap-2">{t('opt_massage').map((opt) => (<RadioCard key={opt.v} label={opt.l} value={opt.v} selected={formData.massageIntensity} onClick={(v) => updateField('massageIntensity', v)} />))}</div>
      </section>

      {/* 🆕 Service Mood (접객 선호) */}
      <section className="bg-[#fffbf7] p-5 rounded-2xl border border-[#f5ae71]/20">
        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2"><Coffee className="w-4 h-4 text-[#f5ae71]" /> {t('q_service_mood')}</h3>
        <div className="grid grid-cols-1 gap-2">
            {t('opt_service_mood').map((opt) => (
                <CheckboxCard key={opt} label={opt} checked={formData.serviceMood.includes(opt)} onClick={() => toggleServiceMood(opt)} />
            ))}
        </div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <section>
          <h3 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2 pl-1"><Calendar className="w-4 h-4 text-[#c4d6c5]" /> {t('q_visit_freq')}</h3>
          <select className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-[#c4d6c5] focus:ring-2 focus:ring-[#c4d6c5]/20 outline-none" value={formData.visitFrequency} onChange={(e) => updateField('visitFrequency', e.target.value)}>{t('opt_visit').map(o=><option key={o} value={o}>{o}</option>)}</select>
        </section>
        <section>
          <h3 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2 pl-1"><Droplet className="w-4 h-4 text-[#c4d6c5]" /> {t('q_shampoo_freq')}</h3>
          <select className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-[#c4d6c5] focus:ring-2 focus:ring-[#c4d6c5]/20 outline-none" value={formData.shampooFrequency} onChange={(e) => updateField('shampooFrequency', e.target.value)}>{t('opt_shampoo').map(o=><option key={o} value={o}>{o}</option>)}</select>
        </section>
      </div>

      {/* 2. Products */}
      <div className="space-y-6 border-t border-slate-100 pt-6">
        <section><h3 className="text-sm font-bold text-slate-800 mb-2 pl-1">{t('q_products')}</h3><DynamicInputs type="products" items={formData.products} placeholder1={t('ph_prod_type')} placeholder2={t('ph_prod_name')} onAdd={addDynamicField} onRemove={removeDynamicField} onUpdate={updateDynamicField} btnText={t('add_item')} /></section>
        
        {/* 3. Styling Preferences */}
        <section>
          <h3 className="text-sm font-bold text-slate-800 mb-3 pl-1">{t('q_styling_pref')}</h3>
          <div className="grid grid-cols-2 gap-2">
            {t('opt_styling').map((opt) => (
              <CheckboxCard key={opt} label={opt} checked={formData.stylingPreference.includes(opt)} onClick={() => toggleStylingPref(opt)} />
            ))}
          </div>
        </section>

        {/* 4. Safety Check (Medications) */}
        <section className="bg-[#fffbf7] p-5 rounded-2xl border border-[#f5ae71]/20">
          <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#f5ae71]" />
            {t('q_med_check')}
          </h3>
          <div className="flex gap-2 mb-4">
             <RadioCard label={t('q_med_check_yes')} value="yes" selected={formData.medicationCheck} onClick={(v) => updateField('medicationCheck', v)} />
             <RadioCard label={t('q_med_check_no')} value="no" selected={formData.medicationCheck} onClick={(v) => updateField('medicationCheck', v)} />
          </div>
          
          {formData.medicationCheck === 'yes' && (
            <div className="animate-fade-in pl-1">
               <p className="text-xs text-slate-500 mb-2 font-bold">{t('q_med_detail')}</p>
               <div className="space-y-2">
                 {t('opt_med_detail').map((opt) => (
                   <CheckboxCard key={opt} label={opt} checked={formData.medicationTypes.includes(opt)} onClick={() => toggleMedDetail(opt)} />
                 ))}
               </div>
               {isMedOtherSelected && (
                 <div className="mt-3 animate-slide-up">
                   <textarea 
                     placeholder={t('ph_med_other')} 
                     className="w-full px-4 py-3 border border-[#f5ae71]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f5ae71]/20 text-sm"
                     value={formData.medicationOther}
                     onChange={(e) => updateField('medicationOther', e.target.value)}
                   />
                 </div>
               )}
            </div>
          )}
        </section>
      </div>

      <section><h3 className="text-sm font-bold text-slate-800 mb-2 pl-1">{t('q_requests')}</h3><textarea className="w-full h-28 px-5 py-4 border border-slate-200 rounded-2xl resize-none focus:border-[#f5ae71] focus:ring-2 focus:ring-[#f5ae71]/20 outline-none" value={formData.requests} onChange={(e) => updateField('requests', e.target.value)} /></section>
    </div>
  );
};

const Step3_Confirmation = ({ formData, t }) => {
  const getChemicalSummary = () => {
    if (formData.chemicalHistory !== 'yes') return t('opt_no');
    const types = formData.chemicalHistoryTypes.length > 0 ? `(${formData.chemicalHistoryTypes.join(', ')})` : '';
    return `${formData.chemicalHistoryTime} ${types}`;
  };
  const getMassageLabel = (val) => {
    const opt = t('opt_massage').find(o => o.v === val);
    return opt ? opt.l : '-';
  };
  const getSafetySummary = () => {
    if (formData.medicationCheck !== 'yes') return t('q_med_check_no');
    let summary = `${t('q_med_check_yes')}`;
    if (formData.medicationTypes.length > 0) summary += `\n(${formData.medicationTypes.join(', ')})`;
    if (formData.medicationOther) summary += `\n- ${formData.medicationOther}`;
    return summary;
  };

  // 💡 [Modified] Filter out empty products for display
  const validProducts = formData.products.filter(p => p.category.trim() !== '' || p.productName.trim() !== '');

  return (
    <div className="animate-slide-up pb-20">
      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-[#c4d6c5]/20 text-[#8da38e] rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-in"><CheckCircle2 className="w-10 h-10" /></div>
        <h2 className="text-2xl font-bold text-slate-800">{t('step3_title')}</h2>
      </div>
      <SummaryCard title={t('section_basic')}><SummaryItem label={t('name_label')} value={formData.name} /><SummaryItem label={t('phone_label')} value={formData.phone} /></SummaryCard>
      <SummaryCard title={t('section_status')}>
        <SummaryItem label={t('q_gender')} value={formData.gender} />
        <SummaryItem label={t('q_hair_length')} value={formData.hairLength} />
        <SummaryItem label={t('q_scalp')} value={formData.scalpType} />
        <SummaryItem label={t('q_concern')} value={formData.hairConditions} />
        <SummaryItem label={t('q_history')} value={getChemicalSummary()} />
      </SummaryCard>
      <SummaryCard title={t('section_care')}>
        <SummaryItem label={t('q_massage')} value={getMassageLabel(formData.massageIntensity)} />
        <SummaryItem label={t('q_service_mood')} value={formData.serviceMood} />
        <SummaryItem label={t('q_visit_freq')} value={formData.visitFrequency} />
        <SummaryItem label={t('q_shampoo_freq')} value={formData.shampooFrequency} />
      </SummaryCard>
      <SummaryCard title={t('section_pref')}>
         <SummaryItem label={t('q_styling_pref')} value={formData.stylingPreference} />
         <div className="mt-2 pt-2 border-t border-slate-50">
           <div className="flex justify-between items-start">
             <span className="text-slate-400 font-medium">{t('med_alert_label')}</span>
             <span className="font-bold text-slate-700 text-right max-w-[60%] break-keep whitespace-pre-line">{getSafetySummary()}</span>
           </div>
         </div>
      </SummaryCard>

      {(validProducts.length > 0) && (
        <SummaryCard title={t('section_items')}>
          <div className="mb-2"><span className="text-slate-400 block text-xs mb-1">{t('q_products')}</span>{validProducts.map(p => <div key={p.id} className="pl-2 border-l-2 border-[#c4d6c5] mb-1">[{p.category}] {p.productName}</div>)}</div>
        </SummaryCard>
      )}
      {formData.requests && <SummaryCard title={t('section_req')}><p className="whitespace-pre-wrap">{formData.requests}</p></SummaryCard>}
    </div>
  );
};

const SubmittedScreen = ({ onBack, t }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6 animate-fade-in">
    <div className="w-24 h-24 bg-[#f5ae71] text-white rounded-full flex items-center justify-center mb-8 shadow-xl shadow-[#f5ae71]/30 animate-pulse-slow"><Sparkles className="w-12 h-12" /></div>
    <h2 className="text-3xl font-bold text-slate-800 mb-3">{t('submitted_title')}</h2>
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 max-w-sm w-full mb-8">
      <p className="text-slate-600 leading-relaxed font-medium whitespace-pre-line">{t('submitted_desc')}</p>
      <p className="text-xs text-slate-400 mt-4">{t('submitted_wait')}</p>
    </div>
    <button onClick={onBack} className="px-8 py-4 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors w-full max-w-xs">{t('back_to_top')}</button>
  </div>
);

// ==========================================
// CLIENT VIEW
// ==========================================
const ClientView = ({ onBack, user, t }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [phoneError, setPhoneError] = useState(false);

  const [formData, setFormData] = useState({
    name: '', phone: '', privacyAgreed: false, 
    gender: '', // New
    hairLength: '', scalpType: '', hairConditions: [],
    chemicalHistory: '', chemicalHistoryTime: '', chemicalHistoryTypes: [], 
    massageIntensity: '', visitFrequency: '', shampooFrequency: '', products: [], 
    requests: '',
    stylingPreference: [], 
    medicationCheck: '', medicationTypes: [], medicationOther: '',
    serviceMood: [] // 🆕 Service Mood Added
  });

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'phone') setPhoneError(false);
  };
  const toggleCondition = (cond) => setFormData(prev => ({ ...prev, hairConditions: prev.hairConditions.includes(cond) ? prev.hairConditions.filter(c => c !== cond) : [...prev.hairConditions, cond] }));
  const toggleChemicalType = (type) => setFormData(prev => ({ ...prev, chemicalHistoryTypes: prev.chemicalHistoryTypes.includes(type) ? prev.chemicalHistoryTypes.filter(t => t !== type) : [...prev.chemicalHistoryTypes, type] }));
  const addDynamicField = (type) => setFormData(prev => ({ ...prev, [type]: [...prev[type], { id: Date.now(), category: '', productName: '' }] }));
  const removeDynamicField = (type, id) => setFormData(prev => ({ ...prev, [type]: prev[type].filter(item => item.id !== id) }));
  const updateDynamicField = (type, id, field, value) => setFormData(prev => ({ ...prev, [type]: prev[type].map(item => item.id === id ? { ...item, [field]: value } : item) }));
  
  const toggleStylingPref = (opt) => setFormData(prev => ({ ...prev, stylingPreference: prev.stylingPreference.includes(opt) ? prev.stylingPreference.filter(o => o !== opt) : [...prev.stylingPreference, opt] }));
  const toggleMedDetail = (opt) => setFormData(prev => ({ ...prev, medicationTypes: prev.medicationTypes.includes(opt) ? prev.medicationTypes.filter(o => o !== opt) : [...prev.medicationTypes, opt] }));
  
  // 🆕 Service Mood Toggle
  const toggleServiceMood = (opt) => setFormData(prev => ({ ...prev, serviceMood: prev.serviceMood.includes(opt) ? prev.serviceMood.filter(o => o !== opt) : [...prev.serviceMood, opt] }));

  const validatePhone = (phone) => /^[0-9]*$/.test(phone) && phone.length >= 9;
  const nextStep = () => {
    if (currentStep === 0 && (!validatePhone(formData.phone) || !formData.name || !formData.privacyAgreed)) {
      if (!validatePhone(formData.phone)) setPhoneError(true);
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));
  const handleHeaderBack = () => { if (currentStep > 0) prevStep(); else onBack(); };

  // 💡 [Modified] Filter empty products before submit
  const handleSubmit = async () => {
    if (!user) return;
    setIsSaving(true);
    
    // Filter empty products
    const validProducts = formData.products.filter(p => p.category.trim() !== '' || p.productName.trim() !== '');
    const cleanFormData = { ...formData, products: validProducts };

    try {
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 10000));
      await Promise.race([
        addDoc(collection(db, 'consultations'), {
          ...cleanFormData,
          createdAt: serverTimestamp(),
          status: 'waiting',
          userId: user.uid
        }),
        timeoutPromise
      ]);
      setIsSubmitted(true);
    } catch (error) { console.error("Error:", error); alert(t('error_save')); } finally { setIsSaving(false); }
  };

  if (isSubmitted) return <SubmittedScreen onBack={onBack} t={t} />;

  return (
    <div className="min-h-screen bg-[#f0f4f0] font-sans text-slate-800 flex justify-center py-6 sm:py-10">
      <div className="w-full max-w-lg bg-white sm:rounded-[2rem] shadow-xl shadow-slate-200/50 flex flex-col relative overflow-hidden h-[95vh] sm:h-auto sm:min-h-[800px]">
        <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-slate-100 px-6 py-5 flex items-center justify-between">
          <button onClick={handleHeaderBack} className="p-2 -ml-2 rounded-full hover:bg-slate-50 transition-colors"><ChevronLeft className="w-6 h-6 text-slate-400"/></button>
          <div className="text-xs font-bold text-[#f5ae71] bg-[#fff8f2] px-3 py-1 rounded-full tracking-wider">STEP {currentStep + 1} / 4</div>
        </header>
        <div className="w-full h-1.5 bg-slate-100"><div className="h-full bg-[#f5ae71] transition-all duration-500 ease-out rounded-r-full" style={{ width: `${((currentStep + 1) / 4) * 100}%` }} /></div>
        <main className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          {currentStep === 0 && <Step0_PersonalInfo formData={formData} updateField={updateField} phoneError={phoneError} t={t} />}
          {currentStep === 1 && <Step1_Basic formData={formData} updateField={updateField} toggleCondition={toggleCondition} toggleChemicalType={toggleChemicalType} t={t} />}
          {currentStep === 2 && <Step2_Detailed formData={formData} updateField={updateField} addDynamicField={addDynamicField} removeDynamicField={removeDynamicField} updateDynamicField={updateDynamicField} toggleStylingPref={toggleStylingPref} toggleMedDetail={toggleMedDetail} toggleServiceMood={toggleServiceMood} t={t} />}
          {currentStep === 3 && <Step3_Confirmation formData={formData} t={t} />}
        </main>
        <footer className="p-6 border-t border-slate-100 bg-white sticky bottom-0 z-10 flex gap-3">
          {currentStep > 0 && <button onClick={prevStep} className="flex-1 py-4 border-2 border-slate-100 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-colors">{t('back')}</button>}
          {/* Skip button removed, only Next button */}
          {currentStep < 3 ? <button onClick={nextStep} className="flex-[2] py-4 bg-[#f5ae71] text-white rounded-2xl font-bold shadow-lg shadow-[#f5ae71]/30 hover:bg-[#e09e60] transition-all active:scale-[0.98]">{t('next')}</button> : <button onClick={handleSubmit} disabled={isSaving} className="flex-[2] py-4 bg-[#c4d6c5] text-white rounded-2xl font-bold shadow-lg shadow-[#c4d6c5]/30 hover:bg-[#b0c4b1] transition-all active:scale-[0.98]">{isSaving ? t('submitting') : t('submit')}</button>}
        </footer>
      </div>
    </div>
  );
};

// ==========================================
// ADMIN DASHBOARD
// ==========================================
// 💡 [New] Statistics Dashboard Component
const StatsView = ({ customers, tAdmin, getJapaneseValue }) => {
  const stats = useMemo(() => {
    const totalVisits = customers.length;
    const concerns = {};
    const scalpTypes = {};
    const moods = {};

    customers.forEach(c => {
      // Concerns
      if (c.hairConditions) {
        c.hairConditions.forEach(cond => {
          const jaCond = getJapaneseValue('opt_concern', cond);
          concerns[jaCond] = (concerns[jaCond] || 0) + 1;
        });
      }
      // Scalp
      if (c.scalpType) {
        const jaScalp = getJapaneseValue('opt_scalp', c.scalpType);
        scalpTypes[jaScalp] = (scalpTypes[jaScalp] || 0) + 1;
      }
      // Mood
      if (c.serviceMood) {
        c.serviceMood.forEach(m => {
          const jaMood = getJapaneseValue('opt_service_mood', m);
          moods[jaMood] = (moods[jaMood] || 0) + 1;
        });
      }
    });

    return { totalVisits, concerns, scalpTypes, moods };
  }, [customers]);

  const renderBar = (label, count, total) => (
    <div key={label} className="mb-3">
      <div className="flex justify-between text-xs mb-1">
        <span className="font-bold text-slate-700">{label}</span>
        <span className="text-slate-500">{count}{tAdmin('stats_count')}</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2">
        <div className="bg-[#f5ae71] h-2 rounded-full transition-all duration-500" style={{ width: `${(count / total) * 100}%` }}></div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase">{tAdmin('stats_total_visits')}</p>
            <h3 className="text-4xl font-bold text-slate-800 mt-1">{stats.totalVisits}</h3>
          </div>
          <div className="w-12 h-12 bg-[#f5ae71]/10 text-[#f5ae71] rounded-full flex items-center justify-center">
            <User className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Concerns */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-[#f5ae71]" /> {tAdmin('stats_concerns_rank')}</h3>
          {Object.entries(stats.concerns).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k, v]) => renderBar(k, v, stats.totalVisits))}
        </div>

        {/* Scalp Types */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2"><PieChart className="w-4 h-4 text-[#8da38e]" /> {tAdmin('stats_scalp_dist')}</h3>
          {Object.entries(stats.scalpTypes).sort((a, b) => b[1] - a[1]).map(([k, v]) => renderBar(k, v, stats.totalVisits))}
        </div>

        {/* Service Mood */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 md:col-span-2">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2"><Coffee className="w-4 h-4 text-[#c4d6c5]" /> {tAdmin('stats_mood_pref')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {Object.entries(stats.moods).sort((a, b) => b[1] - a[1]).map(([k, v]) => renderBar(k, v, stats.totalVisits))}
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = ({ onBack, user }) => {
  const [customers, setCustomers] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [visitCount, setVisitCount] = useState(1);
  const [memoText, setMemoText] = useState("");
  const [isMemoSaved, setIsMemoSaved] = useState(false);
  const [currentView, setCurrentView] = useState('queue'); // 'queue' or 'stats'

  // 🌍 FORCE JAPANESE FOR ADMIN
  const tAdmin = (key) => TRANSLATIONS['ja'][key] || key;

  // 🪄 AUTO-TRANSLATION MAGIC FUNCTION (Applied to all fields)
  const getJapaneseValue = (key, value) => {
    if (!value) return '';
    if (Array.isArray(value)) return value.map(v => getJapaneseValue(key, v)).join(', ');

    // Check YES/NO
    if (['yes', '있음', 'あり', 'Yes'].includes(value)) return TRANSLATIONS['ja']['opt_yes'] || 'あり';
    if (['no', '없음', 'なし', 'No'].includes(value)) return TRANSLATIONS['ja']['opt_no'] || 'なし';

    // Check All Option Arrays (Translate value to Japanese index)
    for (const lang of ['ja', 'ko', 'en']) {
      const options = TRANSLATIONS[lang][key];
      if (Array.isArray(options)) {
        const idx = options.indexOf(value);
        if (idx !== -1) return TRANSLATIONS['ja'][key][idx];
      }
    }
    return value; // Fallback to original value if no match
  };

  useEffect(() => {
    if (!user) return;
    
    let q;
    if (searchTerm.length >= 4) {
       q = query(collection(db, 'consultations'), where('phone', '>=', searchTerm), where('phone', '<=', searchTerm + '\uf8ff'), orderBy('phone'), orderBy('createdAt', 'desc'), limit(50));
    } else {
       q = query(collection(db, 'consultations'), orderBy('createdAt', 'desc'), limit(50));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCustomers(data);
      if (!selectedId && data.length > 0) setSelectedId(data[0].id);
    });
    return () => unsubscribe();
  }, [user, selectedId, searchTerm]);

  // 💡 [Modified] Load Memo when selectedCustomer changes
  const selectedCustomer = customers.find(c => c.id === selectedId);

  useEffect(() => {
    const fetchVisitCount = async () => {
        if (!selectedId || !selectedCustomer) return;
        try {
            const q = query(
                collection(db, 'consultations'),
                where('phone', '==', selectedCustomer.phone),
                where('name', '==', selectedCustomer.name)
            );
            const snapshot = await getDocs(q);
            setVisitCount(snapshot.size); 
        } catch (error) {
            console.error("Error fetching visit count:", error);
            setVisitCount(1);
        }
    };
    
    if (selectedCustomer) {
        fetchVisitCount();
        setMemoText(selectedCustomer.designerMemo || ""); // Load Memo
    }
    setShowDeleteConfirm(false); 
  }, [selectedId, customers]);


  const updateStatus = async (newStatus) => {
    if (!selectedId) return;
    try {
      const docRef = doc(db, 'consultations', selectedId);
      await updateDoc(docRef, { status: newStatus });
    } catch (error) { console.error(error); alert("Failed"); }
  };

  // 📝 Save Memo Function
  const handleSaveMemo = async () => {
    if (!selectedId) return;
    try {
        const docRef = doc(db, 'consultations', selectedId);
        await updateDoc(docRef, { designerMemo: memoText });
        setIsMemoSaved(true);
        setTimeout(() => setIsMemoSaved(false), 2000);
    } catch (e) {
        console.error(e);
        alert(tAdmin('error_save'));
    }
  };

  // 🛠️ FIXED DELETE FUNCTION (No window.confirm)
  const performDelete = async () => {
    if (!selectedId) return;
    try {
      await deleteDoc(doc(db, 'consultations', selectedId));
      setShowDeleteConfirm(false);
      setSelectedId(null); 
    } catch (error) {
      console.error("Delete failed", error);
      alert(tAdmin('error_save') + "\n" + error.message);
    }
  };

  const formatTime = (ts) => ts ? (ts.toDate ? ts.toDate() : new Date(ts)).toLocaleDateString('ja-JP', {month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'}) : '';

  // 🧠 [Modified] Smart Critical Issues Logic
  const getCriticalIssues = (customer) => {
    const issues = [];
    const scalp = getJapaneseValue('opt_scalp', customer.scalpType);
    
    if (scalp === '乾燥') {
      issues.push({
        type: 'scalp_dry',
        label: '🟡 乾燥頭皮',
        message: '頭皮が乾燥しているため、摩擦やシャンプーの強さに注意してください。',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        textColor: 'text-yellow-700',
        icon: Droplet
      });
    } else if (scalp === '脂性') {
      issues.push({
        type: 'scalp_oily',
        label: '🟡 脂性頭皮',
        message: '皮脂分泌が多いため、製品選びと洗浄バランスに注意してください。',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        textColor: 'text-yellow-700',
        icon: Droplet
      });
    }

    const conditions = customer.hairConditions || [];
    const hasCritical = conditions.some(c => {
      const jaVal = getJapaneseValue('opt_concern', c);
      return ['抜け毛', 'ダメージ'].includes(jaVal);
    });
    
    if (hasCritical) {
      issues.push({
        type: 'critical',
        label: '🔴 Critical',
        message: '脱毛・損傷の履歴があるため、刺激および施術強度の調整が必要です。',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-700',
        icon: AlertTriangle
      });
    }

    if (customer.medicationCheck === 'yes') {
      issues.push({
        type: 'med',
        label: '🔵 Med / Safety',
        message: '服薬中のため、施術可能範囲の確認が必要です。',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-700',
        icon: Pill
      });
    }
    return issues;
  };

  const getMassageLabel = (val) => { 
    const opt = TRANSLATIONS['ja']['opt_massage'].find(o => o.v === val); 
    return opt ? opt.l : '-'; 
  };

  return (
    // 💡 [Modified] Forced minimum width to simulate Desktop View on Mobile
    <div className="min-h-screen bg-[#f5f7f5] flex flex-col h-screen overflow-hidden min-w-[1200px] overflow-x-auto">
      <header className="bg-[#c4d6c5] border-b border-[#b0c4b1] h-16 flex items-center justify-between px-6 shrink-0 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          
          {/* 👇 [Toggle Button] Show only when sidebar is CLOSED (Correct Order: Button -> Admin Badge -> Title) */}
          {!isSidebarOpen && currentView === 'queue' && (
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-1 rounded-full hover:bg-white/20 transition-colors text-white"
              title="Open Sidebar"
            >
              <PanelLeft className="w-6 h-6" />
            </button>
          )}

          <div className="bg-white text-[#8da38e] px-2 py-1 text-xs font-bold rounded shadow-sm">ADMIN</div>
          <h1 className="text-lg font-bold text-white tracking-tight drop-shadow-sm">{tAdmin('admin_dashboard')}</h1>
          
          {/* 💡 [New] View Switcher Tabs */}
          <div className="flex bg-[#8da38e] rounded-lg p-1 ml-4">
             <button 
               onClick={() => setCurrentView('queue')}
               className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${currentView === 'queue' ? 'bg-white text-[#8da38e] shadow-sm' : 'text-white/70 hover:text-white'}`}
             >
               {tAdmin('tab_queue')}
             </button>
             <button 
               onClick={() => setCurrentView('stats')}
               className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${currentView === 'stats' ? 'bg-white text-[#8da38e] shadow-sm' : 'text-white/70 hover:text-white'}`}
             >
               {tAdmin('tab_stats')}
             </button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-white/80 font-medium">{new Date().toLocaleDateString('ja-JP')}</div>
          <button onClick={onBack} className="flex items-center gap-2 text-sm font-medium text-white/70 hover:text-white transition-colors bg-white/10 px-3 py-1.5 rounded-full"><LogOut className="w-4 h-4" /> {tAdmin('back')}</button>
        </div>
      </header>
      
      {/* VIEW SWITCHER LOGIC */}
      {currentView === 'stats' ? (
        <div className="flex-1 overflow-y-auto bg-[#f5f7f5]">
            <StatsView customers={customers} tAdmin={tAdmin} getJapaneseValue={getJapaneseValue} />
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
        
        {/* 👇 Sidebar (Restored to Left Side) */}
        <aside className={`${isSidebarOpen ? 'w-80 border-r' : 'w-0 border-none'} bg-white border-[#c4d6c5]/30 flex flex-col z-10 transition-all duration-300 ease-in-out overflow-hidden`}>
          
          {/* 👇 Sidebar Header with Close Button & Search */}
          <div className="p-4 border-b border-slate-100 flex flex-col gap-3 bg-[#f9fcf9] shrink-0">
             <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                  title="Close Sidebar"
                >
                  <PanelLeft className="w-5 h-5" />
                </button>
                <span className="text-xs font-bold text-[#8da38e] uppercase tracking-wider">{tAdmin('waiting_list')} ({customers.length})</span>
             </div>
             {/* 💡 Search Input */}
             <div className="relative">
                <input 
                  type="text" 
                  placeholder={tAdmin('search_placeholder')} 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#f5ae71] focus:ring-2 focus:ring-[#f5ae71]/10"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
             </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
            {customers.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">{tAdmin('no_results')}</div>
            ) : (
                customers.map(c => (
                <div key={c.id} onClick={() => setSelectedId(c.id)} className={`p-4 rounded-2xl cursor-pointer border transition-all duration-200 ${selectedId === c.id ? 'bg-[#f5ae71] text-white border-[#f5ae71] shadow-lg shadow-[#f5ae71]/30 transform scale-[1.02]' : 'bg-white text-slate-700 border-slate-100 hover:border-[#c4d6c5] hover:bg-[#f9fcf9]'}`}>
                    <div className="flex justify-between items-start mb-2"><span className="font-bold text-lg">{c.name}</span><div className="flex flex-col items-end gap-1"><span className={`text-xs px-2 py-1 rounded-full ${selectedId === c.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>{formatTime(c.createdAt)}</span><div className="scale-75 origin-right">{c.status === 'in_progress' && <span className={`w-2 h-2 rounded-full inline-block ${selectedId === c.id ? 'bg-white animate-pulse' : 'bg-[#f5ae71]'}`}></span>}{c.status === 'completed' && <Check className="w-3 h-3 inline-block" />}</div></div></div>
                    <div className={`text-xs flex items-center gap-1 ${selectedId === c.id ? 'text-white/80' : 'text-slate-400'}`}><Phone className="w-3 h-3" /> {c.phone}</div>
                </div>
                ))
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 bg-[#f5f7f5] p-6 overflow-y-auto transition-all duration-300">
          {selectedCustomer ? (
            <div className="max-w-5xl mx-auto space-y-6">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-end">
                  <div>
                    <div className="flex items-center gap-3">
                        <h2 className="text-3xl font-bold text-slate-800">{selectedCustomer.name}</h2>
                        {/* 💡 Visit Count Badge */}
                        <div className={`px-3 py-1 rounded-full text-xs font-bold border ${visitCount === 1 ? 'bg-green-50 text-green-600 border-green-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                            {visitCount === 1 ? tAdmin('visit_new') : tAdmin('visit_regular')} ({visitCount}{tAdmin('visit_count_suffix')})
                        </div>
                    </div>
                    <p className="text-slate-500 text-sm mt-1">{selectedCustomer.phone}</p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <div className="relative">
                      <select value={selectedCustomer.status || 'waiting'} onChange={(e) => updateStatus(e.target.value)} className="appearance-none bg-white border-2 border-[#c4d6c5] text-slate-600 py-2.5 pl-4 pr-10 rounded-xl font-bold text-sm focus:outline-none focus:border-[#f5ae71] focus:ring-2 focus:ring-[#f5ae71]/20 shadow-sm cursor-pointer hover:bg-[#f9fcf9] transition-colors">
                        <option value="waiting">{tAdmin('status_waiting')}</option><option value="in_progress">{tAdmin('status_progress')}</option><option value="completed">{tAdmin('status_completed')}</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-[#8da38e] absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                    </div>
                    {/* 👇 [UI-Based Delete Confirmation] No window.confirm used */}
                    {showDeleteConfirm ? (
                      <div className="mt-2 flex flex-col items-end gap-1 animate-fade-in">
                        <p className="text-[10px] text-red-500 font-bold mb-1">{tAdmin('delete_confirm_msg')}</p>
                        <div className="flex gap-2">
                          <button onClick={performDelete} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-bold transition-colors">{tAdmin('delete_yes')}</button>
                          <button onClick={() => setShowDeleteConfirm(false)} className="bg-slate-200 hover:bg-slate-300 text-slate-600 px-3 py-1 rounded text-xs font-bold transition-colors">{tAdmin('delete_no')}</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setShowDeleteConfirm(true)} className="mt-2 text-xs text-red-400 hover:text-red-600 flex items-center gap-1 hover:bg-red-50 px-2 py-1 rounded transition-colors cursor-pointer"><Trash2 className="w-3 h-3" /> {tAdmin('delete')}</button>
                    )}
                  </div>
                </div>
                
                {/* 🚨 Smart Coaching Alerts Area */}
                {(() => {
                  const issues = getCriticalIssues(selectedCustomer);
                  if (issues.length === 0) return null;
                  return (
                    <div className="grid grid-cols-1 gap-3 animate-fade-in">
                      {issues.map((issue, idx) => (
                        <div key={idx} className={`${issue.bgColor} border ${issue.borderColor} p-4 rounded-2xl flex items-start gap-3 shadow-sm`}>
                          <issue.icon className={`w-5 h-5 ${issue.textColor} mt-0.5`} />
                          <div>
                            <h3 className={`font-bold ${issue.textColor} text-sm mb-1`}>{issue.label}</h3>
                            <p className={`text-xs ${issue.textColor} opacity-90 font-medium`}>{issue.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <DashboardCard title={tAdmin('section_status')} icon={Scissors} className="border-t-4 border-t-[#8da38e]">
                  <DashboardRow label={tAdmin('q_gender')} value={getJapaneseValue('opt_gender', selectedCustomer.gender)} />
                  <DashboardRow label={tAdmin('q_hair_length')} value={getJapaneseValue('opt_length', selectedCustomer.hairLength)} />
                  <DashboardRow label={tAdmin('q_scalp')} value={getJapaneseValue('opt_scalp', selectedCustomer.scalpType)} />
                  <div className="mt-4 pt-4 border-t border-slate-50"><span className="text-xs font-bold text-[#f5ae71] block mb-1">{tAdmin('q_history')}</span>{selectedCustomer.chemicalHistory === 'yes' ? (<div className="bg-[#fff8f2] p-3 rounded-xl border border-[#f5ae71]/20"><div className="text-[#e08e50] font-bold text-sm mb-1">{getJapaneseValue('opt_time', selectedCustomer.chemicalHistoryTime)}</div><div className="flex gap-1 flex-wrap">{selectedCustomer.chemicalHistoryTypes?.map(t => <span key={t} className="text-[10px] bg-white text-[#e08e50] px-2 py-0.5 rounded border border-[#f5ae71]/20">{getJapaneseValue('opt_history_type', t)}</span>)}</div></div>) : <span className="text-slate-400 text-sm">{tAdmin('opt_no')}</span>}</div>
                </DashboardCard>
                <DashboardCard title={tAdmin('section_care')} icon={Star} className="border-t-4 border-t-[#f5ae71]">
                  <div className="bg-[#fff8f2] p-3 rounded-xl mb-3 text-center border border-[#f5ae71]/10"><span className="text-xs text-[#e08e50] block mb-1">{tAdmin('q_massage')}</span><span className="text-xl font-bold text-slate-800">{getMassageLabel(selectedCustomer.massageIntensity)}</span></div>
                  {/* [FIXED] Updated Custom Render for Service Mood (Line break) */}
                  <div className="flex justify-between items-start py-3 border-b border-slate-50 last:border-0">
                    <span className="text-sm text-slate-500 shrink-0 w-24">{tAdmin('q_service_mood')}</span>
                    <div className="font-medium text-slate-800 text-right flex-1 ml-2">
                        {selectedCustomer.serviceMood && selectedCustomer.serviceMood.length > 0 ? (
                        <div className="flex flex-col items-end gap-2">
                            {selectedCustomer.serviceMood.map((mood, idx) => (
                            <span key={idx} className="bg-[#fff8f2] text-[#e08e50] border border-[#f5ae71]/20 px-2 py-1.5 rounded-lg text-xs font-bold leading-normal text-right shadow-sm">
                                {getJapaneseValue('opt_service_mood', mood)}
                            </span>
                            ))}
                        </div>
                        ) : '-'}
                    </div>
                  </div>
                  <DashboardRow label={tAdmin('q_visit_freq')} value={getJapaneseValue('opt_visit', selectedCustomer.visitFrequency)} />
                  <DashboardRow label={tAdmin('q_shampoo_freq')} value={getJapaneseValue('opt_shampoo', selectedCustomer.shampooFrequency)} />
                </DashboardCard>
                <DashboardCard title={tAdmin('section_pref')} icon={CheckSquare} className="border-t-4 border-t-[#c4d6c5]">
                   <div className="mb-4">
                     <span className="text-xs text-slate-400 block mb-1 font-bold">{tAdmin('q_styling_pref')}</span>
                     <div className="flex flex-wrap gap-1">{selectedCustomer.stylingPreference?.length > 0 ? selectedCustomer.stylingPreference.map(s => <span key={s} className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs">{getJapaneseValue('opt_styling', s)}</span>) : '-'}</div>
                   </div>
                   <div>
                     <span className="text-xs text-slate-400 block mb-1 font-bold">{tAdmin('med_alert_label')}</span>
                     <div className={`p-2 rounded ${selectedCustomer.medicationCheck === 'yes' ? 'bg-red-50 text-red-600 font-bold' : 'text-slate-600'}`}>
                        {selectedCustomer.medicationCheck === 'yes' ? `⚠ ${tAdmin('q_med_check_yes')}` : tAdmin('q_med_check_no')}
                     </div>
                     {selectedCustomer.medicationTypes?.length > 0 && <div className="mt-1 text-xs text-slate-500 pl-2 border-l-2 border-red-200">{getJapaneseValue('opt_med_detail', selectedCustomer.medicationTypes)}</div>}
                     {selectedCustomer.medicationOther && <div className="mt-1 text-xs text-slate-500 pl-2 border-l-2 border-red-200">- {selectedCustomer.medicationOther}</div>}
                   </div>
                </DashboardCard>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <DashboardCard title={tAdmin('section_items')} icon={Droplet}>
                    {/* 💡 [Modified] Handle Empty Products with '-' */}
                    {selectedCustomer.products?.length > 0 ? (
                        <div className="space-y-1 text-sm">
                            {selectedCustomer.products.map((p, i) => (
                                <div key={i} className="mb-1 text-slate-700 bg-slate-50 px-2 py-1 rounded">[{p.category}] {p.productName}</div>
                            ))}
                        </div>
                    ) : <div className="text-slate-400 text-sm">-</div>}
                 </DashboardCard>
                 <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm"><div className="flex items-center gap-2 mb-2"><History className="w-4 h-4 text-slate-400" /><span className="font-bold text-slate-700 text-sm">{tAdmin('section_req')}</span></div><p className="text-slate-600 text-sm leading-relaxed bg-slate-50 p-4 rounded-xl">{selectedCustomer.requests || "-"}</p></div>
              </div>
              
              {/* 💡 [New] Designer Memo Section */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mt-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-slate-400" />
                        <h3 className="font-bold text-slate-700">{tAdmin('designer_memo')}</h3>
                    </div>
                    {isMemoSaved && <span className="text-xs text-green-500 font-bold animate-fade-in">{tAdmin('memo_saved')}</span>}
                </div>
                <textarea
                    className="w-full h-24 p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#f5ae71] focus:ring-2 focus:ring-[#f5ae71]/20 resize-none"
                    placeholder={tAdmin('memo_placeholder')}
                    value={memoText}
                    onChange={(e) => setMemoText(e.target.value)}
                />
                <div className="text-right mt-2">
                    <button
                        onClick={handleSaveMemo}
                        className="px-4 py-2 bg-[#8da38e] text-white text-sm font-bold rounded-lg hover:bg-[#7a8f7b] transition-colors"
                    >
                        {tAdmin('save_memo')}
                    </button>
                </div>
              </div>

            </div>
          ) : <div className="h-full flex flex-col items-center justify-center text-slate-400"><User className="w-16 h-16 mb-4 opacity-10" /><p>{tAdmin('select_customer')}</p></div>}
        </main>
        </div>
      )}
    </div>
  );
};

// Helpers
const SummaryCard = ({ title, children }) => (<div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm mb-4 hover:shadow-md transition-shadow"><h3 className="text-xs font-bold text-[#8da38e] uppercase mb-4 pb-2 border-b border-slate-50">{title}</h3><div className="space-y-3 text-sm">{children}</div></div>);
const SummaryItem = ({ label, value }) => value && value.length > 0 ? (<div className="flex justify-between items-start"><span className="text-slate-400 font-medium">{label}</span><span className="font-bold text-slate-700 text-right max-w-[60%] break-keep">{Array.isArray(value) ? value.join(', ') : value}</span></div>) : null;
const DashboardCard = ({ title, icon: Icon, children, className = '' }) => (<div className={`bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col ${className}`}><div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-50"><Icon className="w-5 h-5 text-slate-400"/><h3 className="font-bold text-slate-700">{title}</h3></div><div className="flex-1">{children}</div></div>);
const DashboardRow = ({ label, value }) => (
  <div className="flex justify-between items-start py-3 border-b border-slate-50 last:border-0">
    <span className="text-sm text-slate-500 shrink-0 w-24">{label}</span>
    <div className="font-medium text-slate-800 text-right flex-1 ml-2 break-words">
      {value || '-'}
    </div>
  </div>
);

export default BenjiHairApp;