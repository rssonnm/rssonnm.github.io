// ─────────────────────────────────────────────────────────────────────────
//  Publications — Nguyen Manh Son
//  Entries are grouped by year, newest first. `authors` is a plain string;
//  the page bolds any author token matching one of the name variants below.
// ─────────────────────────────────────────────────────────────────────────

/** Tokens that should render as the author (bold in the byline). */
export const SELF_AUTHORS = [
  'MS Nguyen',
  'NM Son',
  'Nguyen Manh Son',
  'S Nguyen Manh',
  'MN Son',
  'MS NGUYEN',
  'NGUYEN MANH SON',
  'Nguyen Son',
];

export interface Publication {
  year: number;
  title: string;
  authors: string;
  venue: string;
  /** Optional external link (arXiv, DOI, …). */
  link?: string;
}

export const PUBLICATIONS: Publication[] = [
  // ── 2026 ──────────────────────────────────────────────────────────────
  {
    year: 2026,
    title:
      'Enhancing geographical origin classification of Vietnamese oranges via hybrid preprocessing and supervised learning of UV-Vis spectral data',
    authors: 'DT Nguyen, MS Nguyen, HV Pham, MH Nguyen, DP Nguyen, ...',
    venue: 'Talanta Open, 100625, 2026',
    link: 'https://doi.org/10.1016/j.talo.2026.100625',
  },
  {
    year: 2026,
    title:
      'Quantification of cinnamaldehyde, cinnamic acid and coumarin of cinnamon essential oil by HPLC-DAD method',
    authors: 'QT Ngo, BT Le, TL Vu, MS Nguyen, TKA Nguyen, TLP Bui',
    venue: 'Journal of Liquid Chromatography & Related Technologies, 1-9, 2026',
  },
  {
    year: 2026,
    title:
      'Rapid identification of orange juice adulteration using voltammetric profiling and machine learning',
    authors:
      'ND Thanh, NM Son, ND Phong, PH Vang, ND Ha, NT Van Anh, LTH Hao, ...',
    venue: 'ASEAN Journal of Scientific and Technological Reports 29 (2), e260129, 2026',
  },
  {
    year: 2026,
    title:
      'HPLC Profile-Based Chemometric Discrimination of Cinnamomum cassia by Geographic Origin',
    authors: 'BTL Phuong, HT Tung, DK Linh, NM Tuan, VH Phuc, NM Son, NTK Anh, ...',
    venue: 'Biomedical Chromatography 40 (1), e70272, 2026',
  },
  // ── 2025 ──────────────────────────────────────────────────────────────
  {
    year: 2025,
    title:
      'In silico study on the cytotoxicity against HeLa cancer cells of xanthones bioactive compounds from Garcinia cowa: QSAR based on Graph Deep Learning, Network Pharmacology, and molecular docking',
    authors: 'NM Son, PH Vang, NT Dung, NMHTT Thao, TTT Thuy, PM Giang',
    venue: 'arXiv preprint arXiv:2508.10117, 2025',
    link: 'https://arxiv.org/abs/2508.10117',
  },
  {
    year: 2025,
    title:
      'Investigation of the Anti-Obesity Potential of Caffeine, Caffeic Acid, and Chlorogenic Acid from Green Coffee Beans Using Network Pharmacology and Molecular Docking',
    authors: 'S Nguyen Manh, H Nguyen Duc, P Nguyen Duc, V Pham Huu, ...',
    venue: 'ChemRxiv 2025 (0822), 2025',
  },
  {
    year: 2025,
    title:
      'Improving the classification accuracy of orange varieties and origins based on chemical composition using machine learning algorithms and SMOTE data balancing',
    authors: 'MN Son, ...',
    venue: 'International Conference on Chemical and Microbiological Risk Assessment, 2025',
  },
  {
    year: 2025,
    title: 'Application of Explainable Artificial Intelligence in Personalized Nutrition',
    authors: 'NM Son, ...',
    venue: 'International Conference on Chemical and Microbiological Risk Assessment, 2025',
  },
  {
    year: 2025,
    title:
      'Analysis of Mineral Content in Natural and Canned Orange Juice in Vietnam Using Atomic Absorption Spectroscopy',
    authors: 'Manh Ha Nguyen, Thi Dung Nguyen, Thi Thao Ta, Nguyen Manh Son',
    venue: 'The 8th National Metrology Conference, 2025',
  },
  {
    year: 2025,
    title:
      'UHPLC-QTOF-MS based metabolomics, cytotoxicity against HT29 cells and molecular docking study for Peliosanthes micrantha rhizomes',
    authors: 'Nguyen Manh Son, Do Ngoc Thuy, Nguyen Thi Huong, Le Ngoc Hung, ...',
    venue: '5th International Conference on Applied Science and Engineering, 2025',
  },
  {
    year: 2025,
    title:
      'Rapid detection of orange juice adulteration based on voltammetric fingerprint combined with machine learning',
    authors: 'Nguyen Duc Thanh, Nguyen Manh Son, Nguyen Duc Phong, Hoang Tuan Phong, ...',
    venue: 'analytica Vietnam Conference, 2025',
  },
  {
    year: 2025,
    title:
      'Quality control of herbal medicine using IR fingerprint spectra combined with machine learning: A case study of Polyscias fruticosa (L.) Araliaceae',
    authors: 'Nguyen Duc Phong, Nguyen Manh Son, Tran Phuong Dung, Pham Huu Vang, ...',
    venue: 'analytica Vietnam Conference, 2025',
  },
  {
    year: 2025,
    title:
      'Rapid and simultaneous analysis of Guaifenesin, Terbutaline sulfate and Sodium benzoate in cough medicine using UV spectroscopy in combination with Machine Learning',
    authors: 'DP Nguyen, NM Son, ...',
    venue: 'The 8th National Metrology Conference, 2025',
  },
  {
    year: 2025,
    title:
      'Classification of Polyscias fruticosa Samples Based on UV-Vis Spectra Using Machine Learning Algorithms',
    authors: 'DP Nguyen, NM Son, ...',
    venue: 'The 8th National Metrology Conference, 2025',
  },
  {
    year: 2025,
    title:
      'Non-destructive analysis for predicting the sweetness of Vietnamese oranges using computer vision and deep learning',
    authors: 'Nguyen Manh Son, Nguyen Thi Nhung, Vu Hoang Long, Nguyen Duc Phong, ...',
    venue: 'International Conference on Agri-Food and Sustainable Development, 2025',
  },
  {
    year: 2025,
    title: 'Chemical constituents and cytotoxicity for Peliosanthes micrantha rhizomes',
    authors: 'DN Thuy, LN Hung, NT Huong, NM Son, TT Thao, DT Tu',
    venue: 'World News of Natural Sciences 63 (2), 356-368, 2025',
  },
  {
    year: 2025,
    title:
      'Simultaneous determination of Copper, Zinc and Nickel in Electroplating Waste water by UV-VIS Spectroscopy Combined with advanced Machine Learning and Deep Learning Models',
    authors: 'ANT Lan, HN Tran, HN Thu, BK Hoang, HK Manh, HP Thu, TN Chi, NM Son, ...',
    venue: 'International Journal of Advanced Engineering Research and Science 12 (4), 2025',
  },
  {
    year: 2025,
    title:
      'Geographical discriminant and classification of Cinnamomum cassia collected in Vietnam using ATR-FTIR coupled with machine learning algorithms',
    authors: 'T Bui, TB Hoang, V Nguyen, D Nguyen, MS Nguyen, ...',
    venue: 'CHEMCHEMTECH, 2025',
  },
  // ── 2024 ──────────────────────────────────────────────────────────────
  {
    year: 2024,
    title:
      'Applications of machine learning coupled with computer vision, electronic nose and untargeted analysis for food quality control',
    authors: 'NM Son, ND Phong, BX Thanh, TT Thao',
    venue: 'Vietnam Journal of Food Control 7 (3), 313, 2024',
  },
  {
    year: 2024,
    title:
      'Xác định đồng thời Tetracycline, Penicillin G và Cephalexin trong các dạng bào chế khác nhau bằng mô hình hồi quy đa biến dựa trên phổ UV toàn phần',
    authors: 'DP Nguyen, MS Nguyen, DL Nguyen, TML Nguyen, XT Bui, GB Pham, ...',
    venue: 'Tạp chí Phân tích Hóa, Lý và Sinh học 30 (2), 38, 2024',
  },
  {
    year: 2024,
    title:
      'Machine learning and deep learning models applied to identification and classification of mango',
    authors: 'Nguyen Duc Phong, Nguyen Manh Son, Nguyen Manh Ha, Bui Xuan Thanh, ...',
    venue: 'International Food Control Conference, 2024',
  },
  {
    year: 2024,
    title: 'Predicting Orange\u2019s Sweetness using Deep Learning Coupled with Computer Vision',
    authors: 'Nguyen Manh Son, Nguyen Duc Phong, Nguyen Quoc Hieu, Nguyen Van Dai, ...',
    venue: 'International Food Control Conference, 2024',
  },
];

/**
 * Render a byline with the author's own name tokens wrapped in <strong>.
 * Returns HTML — safe for set:html because the data is trusted and local.
 */
export function renderByline(authors: string): string {
  return authors
    .split(', ')
    .map((tok) => (SELF_AUTHORS.includes(tok.trim()) ? `<strong>${tok}</strong>` : tok))
    .join(', ');
}

/** Publications grouped by year, newest first. */
export function publicationsByYear(): Array<{ year: number; items: Publication[] }> {
  const map = new Map<number, Publication[]>();
  for (const p of PUBLICATIONS) {
    const list = map.get(p.year) ?? [];
    list.push(p);
    map.set(p.year, list);
  }
  return [...map.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([year, items]) => ({ year, items }));
}
