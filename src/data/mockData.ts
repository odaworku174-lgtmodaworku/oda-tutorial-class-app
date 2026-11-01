import { Subject, Chapter, Topic, LearningPart, Lesson, PaymentSubmission, StudentProfile, UserNotification } from '../types';

export const APP_LOGO_IMAGE = '/oda_logo.png';
export const HERO_BANNER_IMAGE = '/src/assets/images/hero_edu_platform_1792292368274.jpg';
export const STEM_PHYSICS_IMAGE = '/src/assets/images/subject_stem_physics_1792292369002.jpg';
export const BIO_CHEMISTRY_IMAGE = '/src/assets/images/subject_bio_chemistry_1792292369997.jpg';
export const PAYMENT_RECEIPT_IMAGE = '/src/assets/images/payment_receipt_proof_1792292370005.jpg';

export const GRADE_9_LANDSCAPE = '/src/assets/images/clean_grade_9_landscape_1792297311023.jpg';
export const GRADE_10_LANDSCAPE = '/src/assets/images/clean_grade_10_landscape_1792297311744.jpg';
export const GRADE_11_LANDSCAPE = '/src/assets/images/clean_grade_11_landscape_1792297313295.jpg';
export const GRADE_12_LANDSCAPE = '/src/assets/images/clean_grade_12_landscape_1792297313829.jpg';
export const FRESHMAN_LANDSCAPE = '/src/assets/images/clean_freshman_landscape_1792297313088.jpg';

export const STREAM_NATURAL_SCIENCE = '/src/assets/images/stream_natural_science_1792298960946.jpg';
export const STREAM_SOCIAL_SCIENCE = '/src/assets/images/stream_social_science_1792298962328.jpg';

export const SUBJECT_HISTORY_IMAGE = '/src/assets/images/subject_history_visual_1792298962730.jpg';
export const SUBJECT_GEOGRAPHY_IMAGE = '/src/assets/images/subject_geography_visual_1792298963063.jpg';
export const SUBJECT_ECONOMICS_IMAGE = '/src/assets/images/subject_economics_visual_1792298962927.jpg';
export const SUBJECT_ENGLISH_IMAGE = '/src/assets/images/subject_english_visual_1792298978928.jpg';
export const SUBJECT_MATH_IMAGE = '/src/assets/images/subject_math_visual_1792299129949.jpg';
export const SUBJECT_PHYSICS_IMAGE = '/src/assets/images/subject_stem_physics_1792292369002.jpg';
export const SUBJECT_BIOLOGY_IMAGE = '/src/assets/images/subject_biology_visual_1792299131455.jpg';
export const SUBJECT_CHEMISTRY_IMAGE = '/src/assets/images/subject_chemistry_visual_1792299130882.jpg';
export const SUBJECT_PSYCHOLOGY_IMAGE = '/src/assets/images/subject_psychology_visual_1792903712738.jpg';
export const SUBJECT_LOGIC_IMAGE = '/src/assets/images/subject_logic_visual_1792903725508.jpg';

export const CHAPTER_BANNER_1 = '/src/assets/images/chapter_banner_1_1792299146256.jpg';
export const CHAPTER_BANNER_2 = '/src/assets/images/chapter_banner_2_1792299146726.jpg';
export const CHAPTER_BANNER_3 = '/src/assets/images/chapter_banner_3_1792299146476.jpg';
export const CHAPTER_BANNER_4 = '/src/assets/images/chapter_banner_4_1792905148880.jpg';
export const CHAPTER_BANNER_5 = '/src/assets/images/chapter_banner_5_1792905164083.jpg';
export const CHAPTER_BANNER_6 = '/src/assets/images/chapter_banner_6_1792905177946.jpg';

export const GRADE_9_MATH_VIDEO_URL = '/videos/grade9_math_ch1_part1.mp4';
export const GRADE_9_MATH_VIDEO_POSTER = '/videos/grade9_math_ch1_video_poster.jpg';
export const GRADE_9_MATH_VIDEO_URL_PART2 = '/videos/grade9_math_ch1_part2.mp4';

export const INITIAL_SUBJECTS: Subject[] = [
  // ===================== GRADE 9 (Mathematics, Chemistry, Physics, Biology, History, Geography) =====================
  {
    id: 'sub-g9-math',
    title: 'Mathematics',
    grade: 'Grade 9',
    stream: 'General',
    code: 'MATH-09',
    description: 'Further on sets, set-builder notation, number systems, polynomials, linear equations, coordinate geometry, and geometric theorems.',
    coverImage: SUBJECT_MATH_IMAGE,
    priceETB: 600,
    priceUSD: 11,
    isActive: true,
    instructorName: 'Mr. Oda Worku',
    instructorTitle: 'Senior Mathematics Specialist & Platform Lead',
  },
  {
    id: 'sub-g9-chem',
    title: 'Chemistry',
    grade: 'Grade 9',
    stream: 'General',
    code: 'CHEM-09',
    description: 'Structure of the atom, periodic classification of elements, chemical bonding, and introductory reactions.',
    coverImage: SUBJECT_CHEMISTRY_IMAGE,
    priceETB: 600,
    priceUSD: 11,
    isActive: true,
    instructorName: 'Selamawit Desta',
    instructorTitle: 'National Curriculum Specialist',
  },
  {
    id: 'sub-g9-phys',
    title: 'Physics',
    grade: 'Grade 9',
    stream: 'General',
    code: 'PHYS-09',
    description: 'Physical quantities and measurement, motion in one dimension, force and Newton\'s laws, work, energy, and power.',
    coverImage: SUBJECT_PHYSICS_IMAGE,
    priceETB: 600,
    priceUSD: 11,
    isActive: true,
    instructorName: 'Hana Girma',
    instructorTitle: 'STEM Education Coordinator',
  },
  {
    id: 'sub-g9-bio',
    title: 'Biology',
    grade: 'Grade 9',
    stream: 'General',
    code: 'BIOL-09',
    description: 'Cell biology, cell structure and microscopy, human biology and organ systems, heredity, and ecology.',
    coverImage: SUBJECT_BIOLOGY_IMAGE,
    priceETB: 600,
    priceUSD: 11,
    isActive: true,
    instructorName: 'Dr. Yonas Haile',
    instructorTitle: 'Biochemistry Research Fellow',
  },
  {
    id: 'sub-g9-hist',
    title: 'History',
    grade: 'Grade 9',
    stream: 'General',
    code: 'HIST-09',
    description: 'Early humans, civilization development, ancient kingdoms of the Horn of Africa, medieval Ethiopian history.',
    coverImage: SUBJECT_HISTORY_IMAGE,
    priceETB: 500,
    priceUSD: 10,
    isActive: true,
    instructorName: 'Tadelle Gebre',
    instructorTitle: 'History Department Chair',
  },
  {
    id: 'sub-g9-geog',
    title: 'Geography',
    grade: 'Grade 9',
    stream: 'General',
    code: 'GEOG-09',
    description: 'Map reading skills, planetary earth and solar system, atmosphere and climate patterns, population and resources.',
    coverImage: SUBJECT_GEOGRAPHY_IMAGE,
    priceETB: 500,
    priceUSD: 10,
    isActive: true,
    instructorName: 'Aster Mengistu',
    instructorTitle: 'Environmental Geographer',
  },

  // ===================== GRADE 10 (Mathematics, Chemistry, Physics, Biology, History, Geography) =====================
  {
    id: 'sub-g10-math',
    title: 'Mathematics',
    grade: 'Grade 10',
    stream: 'General',
    code: 'MATH-10',
    description: 'Quadratic equations, functions and relations, trigonometric ratios, circle theorems, and statistics.',
    coverImage: SUBJECT_MATH_IMAGE,
    priceETB: 650,
    priceUSD: 12,
    isActive: true,
    instructorName: 'Dawit Solomon',
    instructorTitle: 'Senior Secondary Educator',
  },
  {
    id: 'sub-g10-chem',
    title: 'Chemistry',
    grade: 'Grade 10',
    stream: 'General',
    code: 'CHEM-10',
    description: 'Chemical stoichiometry, gas laws, solutions, acids, bases and salts, and intro to carbon chemistry.',
    coverImage: SUBJECT_CHEMISTRY_IMAGE,
    priceETB: 650,
    priceUSD: 12,
    isActive: true,
    instructorName: 'Selamawit Desta',
    instructorTitle: 'National Curriculum Specialist',
  },
  {
    id: 'sub-g10-phys',
    title: 'Physics',
    grade: 'Grade 10',
    stream: 'General',
    code: 'PHYS-10',
    description: 'Uniform circular motion, conservation of energy, thermal physics, electrostatics, and simple DC circuits.',
    coverImage: SUBJECT_PHYSICS_IMAGE,
    priceETB: 650,
    priceUSD: 12,
    isActive: true,
    instructorName: 'Eng. Frehiwot Alemu',
    instructorTitle: 'Physics Curriculum Specialist',
  },
  {
    id: 'sub-g10-bio',
    title: 'Biology',
    grade: 'Grade 10',
    stream: 'General',
    code: 'BIOL-10',
    description: 'Biotechnology applications, cellular respiration, photosynthesis, human reproductive system, and conservation.',
    coverImage: SUBJECT_BIOLOGY_IMAGE,
    priceETB: 650,
    priceUSD: 12,
    isActive: true,
    instructorName: 'Dr. Yonas Haile',
    instructorTitle: 'Biochemistry Research Fellow',
  },
  {
    id: 'sub-g10-hist',
    title: 'History',
    grade: 'Grade 10',
    stream: 'General',
    code: 'HIST-10',
    description: '19th century state building in Ethiopia, Battle of Adwa, colonial resistance, and World War I & II impacts.',
    coverImage: SUBJECT_HISTORY_IMAGE,
    priceETB: 550,
    priceUSD: 10,
    isActive: true,
    instructorName: 'Tadelle Gebre',
    instructorTitle: 'History Department Chair',
  },
  {
    id: 'sub-g10-geog',
    title: 'Geography',
    grade: 'Grade 10',
    stream: 'General',
    code: 'GEOG-10',
    description: 'Physical geography of Africa, economic activities, urbanization trends, and GIS mapping technologies.',
    coverImage: SUBJECT_GEOGRAPHY_IMAGE,
    priceETB: 550,
    priceUSD: 10,
    isActive: true,
    instructorName: 'Aster Mengistu',
    instructorTitle: 'Environmental Geographer',
  },

  // ===================== GRADE 11 NATURAL SCIENCE (Mathematics, Chemistry, Physics, Biology) =====================
  {
    id: 'sub-g11-nat-math',
    title: 'Mathematics',
    grade: 'Grade 11',
    stream: 'Natural Science',
    code: 'MATH-11-NAT',
    description: 'Vectors in 2D & 3D, complex numbers, sequences and series, limits and rate of change, and coordinate geometry.',
    coverImage: SUBJECT_MATH_IMAGE,
    priceETB: 750,
    priceUSD: 14,
    isActive: true,
    instructorName: 'Dr. Tsegaye Bekele',
    instructorTitle: 'Senior Mathematics Lecturer',
  },
  {
    id: 'sub-g11-nat-chem',
    title: 'Chemistry',
    grade: 'Grade 11',
    stream: 'Natural Science',
    code: 'CHEM-11-NAT',
    description: 'Chemical equilibrium, Le Chatelier’s principle, reaction kinetics, chemical thermodynamics, and electrochemistry.',
    coverImage: SUBJECT_CHEMISTRY_IMAGE,
    priceETB: 750,
    priceUSD: 14,
    isActive: true,
    instructorName: 'Selamawit Desta',
    instructorTitle: 'National Curriculum Specialist',
  },
  {
    id: 'sub-g11-nat-phys',
    title: 'Physics',
    grade: 'Grade 11',
    stream: 'Natural Science',
    code: 'PHYS-11-NAT',
    description: 'Two-dimensional projectile kinematics, rotational dynamics, universal gravitation, and fluid mechanics.',
    coverImage: SUBJECT_PHYSICS_IMAGE,
    priceETB: 750,
    priceUSD: 14,
    isActive: true,
    instructorName: 'Eng. Frehiwot Alemu',
    instructorTitle: 'Head of Physics Department',
  },
  {
    id: 'sub-g11-nat-bio',
    title: 'Biology',
    grade: 'Grade 11',
    stream: 'Natural Science',
    code: 'BIOL-11-NAT',
    description: 'Molecular genetics, DNA replication, transcription & translation, enzymes, biochemical pathways, and cell division.',
    coverImage: SUBJECT_BIOLOGY_IMAGE,
    priceETB: 750,
    priceUSD: 14,
    isActive: true,
    instructorName: 'Dr. Yonas Haile',
    instructorTitle: 'Biochemistry Research Fellow',
  },

  // ===================== GRADE 11 SOCIAL SCIENCE (Mathematics, History, Geography) =====================
  {
    id: 'sub-g11-soc-math',
    title: 'Mathematics',
    grade: 'Grade 11',
    stream: 'Social Science',
    code: 'MATH-11-SOC',
    description: 'Financial mathematics, linear programming, probability and combinations, matrices, and applied statistics.',
    coverImage: SUBJECT_MATH_IMAGE,
    priceETB: 700,
    priceUSD: 13,
    isActive: true,
    instructorName: 'Dawit Solomon',
    instructorTitle: 'Senior Secondary Educator',
  },
  {
    id: 'sub-g11-soc-hist',
    title: 'History',
    grade: 'Grade 11',
    stream: 'Social Science',
    code: 'HIST-11-SOC',
    description: 'Enlightenment and revolutions, modern African independence movements, Ethiopian political transformations.',
    coverImage: SUBJECT_HISTORY_IMAGE,
    priceETB: 700,
    priceUSD: 13,
    isActive: true,
    instructorName: 'Tadelle Gebre',
    instructorTitle: 'History Department Chair',
  },
  {
    id: 'sub-g11-soc-geog',
    title: 'Geography',
    grade: 'Grade 11',
    stream: 'Social Science',
    code: 'GEOG-11-SOC',
    description: 'Geomorphology, climate change adaptation, economic geography of developing nations, and spatial analysis.',
    coverImage: SUBJECT_GEOGRAPHY_IMAGE,
    priceETB: 700,
    priceUSD: 13,
    isActive: true,
    instructorName: 'Aster Mengistu',
    instructorTitle: 'Environmental Geographer',
  },

  // ===================== GRADE 12 NATURAL SCIENCE (Mathematics, Chemistry, Physics, Biology) =====================
  {
    id: 'sub-g12-nat-math',
    title: 'Mathematics',
    grade: 'Grade 12',
    stream: 'Natural Science',
    code: 'MATH-12-NAT',
    description: 'Limits and continuity, differential calculus, integration by parts, applications of derivatives, and national mock exams.',
    coverImage: SUBJECT_MATH_IMAGE,
    priceETB: 850,
    priceUSD: 16,
    isActive: true,
    instructorName: 'Dr. Tsegaye Bekele',
    instructorTitle: 'Senior Mathematics Lecturer, AAU',
  },
  {
    id: 'sub-g12-nat-chem',
    title: 'Chemistry',
    grade: 'Grade 12',
    stream: 'Natural Science',
    code: 'CHEM-12-NAT',
    description: 'Organic chemistry, hydrocarbons, functional groups, reaction mechanisms, polymers, and entrance exam practice.',
    coverImage: SUBJECT_CHEMISTRY_IMAGE,
    priceETB: 850,
    priceUSD: 16,
    isActive: true,
    instructorName: 'Selamawit Desta',
    instructorTitle: 'National Curriculum Specialist',
  },
  {
    id: 'sub-g12-nat-phys',
    title: 'Physics',
    grade: 'Grade 12',
    stream: 'Natural Science',
    code: 'PHYS-12-NAT',
    description: 'Electromagnetic induction, alternating currents, atomic and nuclear physics, photoelectric effect, and optics.',
    coverImage: SUBJECT_PHYSICS_IMAGE,
    priceETB: 850,
    priceUSD: 16,
    isActive: true,
    instructorName: 'Eng. Frehiwot Alemu',
    instructorTitle: 'Head of Physics Department',
  },
  {
    id: 'sub-g12-nat-bio',
    title: 'Biology',
    grade: 'Grade 12',
    stream: 'Natural Science',
    code: 'BIOL-12-NAT',
    description: 'Human physiology, nervous & endocrine regulation, immunology, evolutionary biology, and national entrance question sets.',
    coverImage: SUBJECT_BIOLOGY_IMAGE,
    priceETB: 850,
    priceUSD: 16,
    isActive: true,
    instructorName: 'Dr. Yonas Haile',
    instructorTitle: 'Biochemistry Research Fellow',
  },

  // ===================== GRADE 12 SOCIAL SCIENCE (Mathematics, History, Geography) =====================
  {
    id: 'sub-g12-soc-math',
    title: 'Mathematics',
    grade: 'Grade 12',
    stream: 'Social Science',
    code: 'MATH-12-SOC',
    description: 'Commercial calculus, business optimization, linear algebra, probability models, and national examination mock sets.',
    coverImage: SUBJECT_MATH_IMAGE,
    priceETB: 800,
    priceUSD: 15,
    isActive: true,
    instructorName: 'Dawit Solomon',
    instructorTitle: 'Senior Secondary Educator',
  },
  {
    id: 'sub-g12-soc-hist',
    title: 'History',
    grade: 'Grade 12',
    stream: 'Social Science',
    code: 'HIST-12-SOC',
    description: '20th century global conflicts, post-Cold War politics, contemporary Ethiopian constitutional history, and past exam reviews.',
    coverImage: SUBJECT_HISTORY_IMAGE,
    priceETB: 800,
    priceUSD: 15,
    isActive: true,
    instructorName: 'Tadelle Gebre',
    instructorTitle: 'History Department Chair',
  },
  {
    id: 'sub-g12-soc-geog',
    title: 'Geography',
    grade: 'Grade 12',
    stream: 'Social Science',
    code: 'GEOG-12-SOC',
    description: 'Geography of Ethiopia and the Horn, natural resources, regional integration, and map interpretation for national exam.',
    coverImage: SUBJECT_GEOGRAPHY_IMAGE,
    priceETB: 800,
    priceUSD: 15,
    isActive: true,
    instructorName: 'Aster Mengistu',
    instructorTitle: 'Environmental Geographer',
  },

  // ===================== FRESHMAN NATURAL SCIENCE (Mathematics, Physics, Psychology, Logic, Geography, English) =====================
  {
    id: 'sub-fresh-nat-math',
    title: 'Mathematics',
    grade: 'Freshman Program',
    stream: 'Natural Science',
    code: 'MATH-1011',
    description: 'University freshman calculus: Limits, continuity, techniques of integration, matrices, eigenvalues, and vectors.',
    coverImage: SUBJECT_MATH_IMAGE,
    priceETB: 1100,
    priceUSD: 20,
    isActive: true,
    instructorName: 'Prof. Markos Kebede',
    instructorTitle: 'Professor of Applied Mathematics',
  },
  {
    id: 'sub-fresh-nat-phys',
    title: 'Physics',
    grade: 'Freshman Program',
    stream: 'Natural Science',
    code: 'PHYS-1011',
    description: 'University general physics: Vectors, kinematics, rotational dynamics, harmonic oscillations, and wave optics.',
    coverImage: SUBJECT_PHYSICS_IMAGE,
    priceETB: 1000,
    priceUSD: 18,
    isActive: true,
    instructorName: 'Eng. Frehiwot Alemu',
    instructorTitle: 'Head of Physics Department',
  },
  {
    id: 'sub-fresh-nat-psych',
    title: 'Psychology',
    grade: 'Freshman Program',
    stream: 'Natural Science',
    code: 'PSYC-1011',
    description: 'Cognitive science, human perception, memory systems, learning theories, emotional intelligence, and behavioral neuroscience.',
    coverImage: SUBJECT_PSYCHOLOGY_IMAGE,
    priceETB: 950,
    priceUSD: 17,
    isActive: true,
    instructorName: 'Dr. Almaz Worku',
    instructorTitle: 'Associate Professor of Behavioral Psychology',
  },
  {
    id: 'sub-fresh-nat-logic',
    title: 'Logic',
    grade: 'Freshman Program',
    stream: 'Natural Science',
    code: 'PHIL-1011',
    description: 'Deductive and inductive arguments, informal fallacies, categorical propositions, and symbolic propositional calculus.',
    coverImage: SUBJECT_LOGIC_IMAGE,
    priceETB: 950,
    priceUSD: 17,
    isActive: true,
    instructorName: 'Dr. Bekele Tolosa',
    instructorTitle: 'Professor of Philosophy & Logic',
  },
  {
    id: 'sub-fresh-nat-geog',
    title: 'Geography',
    grade: 'Freshman Program',
    stream: 'Natural Science',
    code: 'GEOG-1011',
    description: 'Topography, drainage basins, climate dynamics, spatial resources, demographic patterns, and sustainable development.',
    coverImage: SUBJECT_GEOGRAPHY_IMAGE,
    priceETB: 900,
    priceUSD: 16,
    isActive: true,
    instructorName: 'Aster Mengistu',
    instructorTitle: 'Senior Environmental Geographer',
  },
  {
    id: 'sub-fresh-nat-eng',
    title: 'English',
    grade: 'Freshman Program',
    stream: 'Natural Science',
    code: 'FLEn-1011',
    description: 'University communicative competence, academic writing style, oral presentations, analytical reading, and research citations.',
    coverImage: SUBJECT_ENGLISH_IMAGE,
    priceETB: 850,
    priceUSD: 15,
    isActive: true,
    instructorName: 'Amanuel Teshome',
    instructorTitle: 'Language & Academic Writing Specialist',
  },

  // ===================== FRESHMAN SOCIAL SCIENCE (Mathematics, Psychology, Logic, Geography, Economics, English) =====================
  {
    id: 'sub-fresh-soc-math',
    title: 'Mathematics',
    grade: 'Freshman Program',
    stream: 'Social Science',
    code: 'MATH-1012',
    description: 'Functions and models in business, matrices and systems of linear equations, mathematics of finance, and introductory calculus.',
    coverImage: SUBJECT_MATH_IMAGE,
    priceETB: 1000,
    priceUSD: 18,
    isActive: true,
    instructorName: 'Dawit Solomon',
    instructorTitle: 'Senior Mathematics Lecturer',
  },
  {
    id: 'sub-fresh-soc-psych',
    title: 'Psychology',
    grade: 'Freshman Program',
    stream: 'Social Science',
    code: 'PSYC-1012',
    description: 'Psychological foundations, personality development, social cognition, human motivation, and developmental psychology.',
    coverImage: SUBJECT_PSYCHOLOGY_IMAGE,
    priceETB: 950,
    priceUSD: 17,
    isActive: true,
    instructorName: 'Dr. Almaz Worku',
    instructorTitle: 'Associate Professor of Behavioral Psychology',
  },
  {
    id: 'sub-fresh-soc-logic',
    title: 'Logic',
    grade: 'Freshman Program',
    stream: 'Social Science',
    code: 'PHIL-1012',
    description: 'Forms of reasoning, detecting fallacies in political and social discourse, formal logic, and cognitive bias mitigation.',
    coverImage: SUBJECT_LOGIC_IMAGE,
    priceETB: 950,
    priceUSD: 17,
    isActive: true,
    instructorName: 'Dr. Bekele Tolosa',
    instructorTitle: 'Professor of Philosophy & Logic',
  },
  {
    id: 'sub-fresh-soc-geog',
    title: 'Geography',
    grade: 'Freshman Program',
    stream: 'Social Science',
    code: 'GEOG-1012',
    description: 'Regional geographic analysis, economic corridors, agro-ecological zones, and resource geopolitics in Eastern Africa.',
    coverImage: SUBJECT_GEOGRAPHY_IMAGE,
    priceETB: 900,
    priceUSD: 16,
    isActive: true,
    instructorName: 'Aster Mengistu',
    instructorTitle: 'Senior Environmental Geographer',
  },
  {
    id: 'sub-fresh-soc-econ',
    title: 'Economics',
    grade: 'Freshman Program',
    stream: 'Social Science',
    code: 'ECON-1011',
    description: 'Foundations of micro and macroeconomics: Supply, demand, elasticity, fiscal policies, GDP, inflation, and global trade.',
    coverImage: SUBJECT_ECONOMICS_IMAGE,
    priceETB: 950,
    priceUSD: 17,
    isActive: true,
    instructorName: 'Kidus Girma',
    instructorTitle: 'Economics Analyst & Lecturer',
  },
  {
    id: 'sub-fresh-soc-eng',
    title: 'English',
    grade: 'Freshman Program',
    stream: 'Social Science',
    code: 'FLEn-1012',
    description: 'Academic discourse for social sciences, research synthesis, critical reading, and argumentative essay drafting.',
    coverImage: SUBJECT_ENGLISH_IMAGE,
    priceETB: 850,
    priceUSD: 15,
    isActive: true,
    instructorName: 'Amanuel Teshome',
    instructorTitle: 'Language & Academic Writing Specialist',
  },
];

const CHAPTER_IMAGE_PALETTE = [
  CHAPTER_BANNER_1,
  CHAPTER_BANNER_2,
  CHAPTER_BANNER_3,
  CHAPTER_BANNER_4,
  CHAPTER_BANNER_5,
  CHAPTER_BANNER_6,
  SUBJECT_MATH_IMAGE,
  SUBJECT_PHYSICS_IMAGE,
  SUBJECT_CHEMISTRY_IMAGE,
  SUBJECT_BIOLOGY_IMAGE,
  SUBJECT_HISTORY_IMAGE,
  SUBJECT_GEOGRAPHY_IMAGE,
  SUBJECT_ECONOMICS_IMAGE,
  SUBJECT_ENGLISH_IMAGE,
  SUBJECT_PSYCHOLOGY_IMAGE,
  SUBJECT_LOGIC_IMAGE,
];

// Helper to generate chapters 1 to 6 and beyond with Topics and Parts
const createStandardChaptersForSubject = (
  subjectId: string,
  grade: any,
  subjectPrefix: string,
  chapterTitles: string[]
): Chapter[] => {
  return chapterTitles.map((title, chIdx) => {
    const chapterNumber = chIdx + 1;
    const isFreeChapter = chapterNumber === 1; // Chapter 1 free, rest premium
    const isPremiumChapter = chapterNumber > 1;
    const seed = subjectId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const chapterCover = CHAPTER_IMAGE_PALETTE[(chIdx * 3 + seed) % CHAPTER_IMAGE_PALETTE.length];
    const topic1Cover = CHAPTER_IMAGE_PALETTE[(chIdx * 3 + 1 + seed) % CHAPTER_IMAGE_PALETTE.length];
    const topic2Cover = CHAPTER_IMAGE_PALETTE[(chIdx * 3 + 2 + seed) % CHAPTER_IMAGE_PALETTE.length];

    const isGrade9MathCh1 = subjectId === 'sub-g9-math' && chapterNumber === 1;

    const part1: LearningPart = isGrade9MathCh1
      ? {
          id: `les-${subjectId}-${chapterNumber}-t1-p1`,
          topicId: `topic-${subjectId}-${chapterNumber}-1`,
          chapterId: `chap-${subjectId}-${chapterNumber}`,
          subjectId,
          grade,
          partNumber: 1,
          title: `Part 1: Methods of Describing Sets & Set-Builder Notation`,
          description: `Barsiisaa Mr. Oda Worku: Video tutorial for Grade 9 Mathematics Unit 1. Learn the Verbal Method, Listing/Roster Method with the Ellipsis (...) rule, and Set-Builder Method (Method of Defining Property) with solved exam questions.`,
          durationMinutes: 24,
          isFreePreview: true,
          videoPoster: GRADE_9_MATH_VIDEO_POSTER,
          videoUrl: GRADE_9_MATH_VIDEO_URL,
          textNotes: `### ODA EDUCATIONAL APP · GRADE 9 MATHEMATICS
#### Chapter 1: Further on Sets — Part 1: Methods of Describing Sets
**Barsiisaa (Instructor):** Mr. Oda Worku | **Grade:** 9 | **Subject:** Mathematics

---

### 1. Maalummaa Tuutaalee (What is a Set?)
- A **Set** (Tuuta) is a well-defined collection of distinct objects or elements.
- The items or entities in a set are known as **elements** or **members**.
  - Notation $\\in$: "is an element of" (Miseensa)
  - Notation $\\notin$: "is not an element of" (Miseensa miti)
- Sets are standardly represented with capital Latin letters ($A, B, C, S, U$).

---

### 2. Maloota Ibsa Tuutaalee Sadaniin (Three Methods of Describing Sets)

#### I. Mala Ibsa Jechaa (Verbal / Statement Method)
- A set described in clear verbal terms explaining the defining criteria.
- **Example:** $A = \\text{The set of all counting numbers strictly less than 10}$.
- **Oromo:** *Tuuta lakkoofsota uumamaa kudhan (10) gadii.*

#### II. Mala Tarreessuu (Listing / Roster Method)
- Listing all elements enclosed between braces $\\{ \\}$, separated by commas.
- **Example:** $A = \\{1, 2, 3, 4, 5, 6, 7, 8, 9\\}$

##### The Ellipsis Rule (...) in Listing Method:
- When a set follows a consistent arithmetic or logical rule, three consecutive dots $(...)$ called an **ellipsis** are used.
- **Critical Exam Rule:** The ellipsis indicates that **"The pattern or elements continue"** in the established order!
- **Infinite example:** $\\mathbb{N} = \\{1, 2, 3, 4, ...\\}$ (Pattern continues infinitely).
- **Finite example:** $E = \\{2, 4, 6, ..., 100\\}$ (Even numbers continuing up to 100).

#### III. Mala Ijaarsa Tuutaa (Set-Builder Method / Method of Defining Property)
- Rather than listing individual members, specify a variable $x$ and the condition $P(x)$ that each element must fulfill.
- **General Form:**
  $$\\{ x \\mid P(x) \\} \\quad \\text{or} \\quad \\{ x : P(x) \\}$$
  *(Read: "The set of all $x$ such that $x$ satisfies property $P(x)$")*
- **Example 1:**
  $$A = \\{ x \\mid x \\in \\mathbb{N} \\text{ and } x < 10 \\}$$
- **Example 2:**
  $$B = \\{ x \\mid x \\in \\mathbb{Z} \\text{ and } -3 \\le x < 6 \\}$$
- **Why is Set-Builder Essential?**
  For continuous sets of real numbers (such as intervals on a number line like $\\{x \\mid x \\in \\mathbb{R}, 0 < x < 1\\}$), elements are uncountable and cannot be listed. The Set-Builder method is the only accurate algebraic notation!

---

### 3. Worked Multiple-Choice Questions (Gaaffilee Qormaataa)

1. **Question (from Video Tutorial):**  
   In the listing or roster method of describing a set, what do three consecutive dots (...) represent?  
   - A. The set has ended  
   - **B. The pattern or elements continue** *(Correct Answer)*  
   - C. There are errors in the set  
   - D. The values are all zero  
   *Explanation:* The ellipsis (...) signifies that the established element pattern continues indefinitely or up to the specified boundary.

2. **Question:**  
   Which of the following is written using the Set-Builder Method (Method of Defining Property)?  
   - **A. $S = \\{x \\mid x \\in \\mathbb{N} \\text{ and } x \\text{ is prime}, x < 20\\}$** *(Correct Answer)*  
   - B. $S = \\{2, 3, 5, 7, 11, 13, 17, 19\\}$  
   - C. $S = \\text{The set of prime numbers less than 20}$  
   - D. $S = (2, 3, 5, ..., 19)$`,
          conceptBreakdown: [
            {
              stepNumber: 1,
              title: 'Mala Ibsa Jechaa (Verbal / Statement Method)',
              description: 'Expressing a set with descriptive linguistic criteria that precisely separates members from non-members.',
              formulaOrExample: 'A = {All natural numbers less than 10}',
              examTip: 'Ensure the statement is unambiguous (well-defined).',
            },
            {
              stepNumber: 2,
              title: 'Mala Tarreessuu & The Ellipsis Rule (...)',
              description: 'Listing elements inside curly brackets. Three dots (...) mean "The pattern or elements continue".',
              formulaOrExample: 'E = {2, 4, 6, ..., 100} or N = {1, 2, 3, ...}',
              examTip: 'Ellipsis requires at least three clear prior elements to establish the pattern.',
            },
            {
              stepNumber: 3,
              title: 'Mala Ijaarsa Tuutaa (Set-Builder Method)',
              description: 'Describing the characteristic rule {x | P(x)}. The vertical bar "|" represents "such that".',
              formulaOrExample: '{x | x ∈ N and x is a multiple of 5}',
              examTip: 'Indispensable for infinite and continuous real number subsets.',
            },
          ],
          downloadables: [
            {
              id: `dl-${subjectId}-${chapterNumber}-1`,
              title: `Grade 9 Mathematics - Chapter 1 Sets Study Notes.pdf`,
              type: 'PDF',
              fileSize: '2.8 MB',
              downloadUrl: '#',
            },
          ],
          examTimeMinutes: 15,
          quizQuestions: [
            {
              id: `q-g9-math-1-1`,
              subjectId,
              chapterId: `chap-${subjectId}-${chapterNumber}`,
              difficulty: 'Easy',
              question: 'In the listing (roster) method of representing a set, what does an ellipsis (...) indicate?',
              options: [
                'The set has ended and contains no more items',
                'The pattern or elements continue',
                'There are errors in the set definition',
                'The values of remaining elements are all zero',
              ],
              correctOptionIndex: 1,
              explanation: 'In mathematical set notation, three dots (...) indicate that the pattern of elements continues following the established rule.',
            },
            {
              id: `q-g9-math-1-2`,
              subjectId,
              chapterId: `chap-${subjectId}-${chapterNumber}`,
              difficulty: 'Medium',
              question: 'Which of the following representations is written using the Set-Builder Method (Method of Defining Property)?',
              options: [
                '{x | x ∈ N and x is a prime number, x < 15}',
                '{2, 3, 5, 7, 11, 13}',
                'The set of prime numbers less than 15',
                'Prime numbers: 2, 3, 5, 7, 11, 13',
              ],
              correctOptionIndex: 0,
              explanation: 'The set-builder method specifies a variable and a defining predicate condition inside braces: {x | condition}.',
            },
            {
              id: `q-g9-math-1-3`,
              subjectId,
              chapterId: `chap-${subjectId}-${chapterNumber}`,
              difficulty: 'Easy',
              question: 'If Set S = {x | x is an odd counting number and 1 ≤ x < 9}, what is the roster/listing form of Set S?',
              options: [
                '{1, 3, 5, 7}',
                '{1, 3, 5, 7, 9}',
                '{2, 4, 6, 8}',
                '{3, 5, 7}',
              ],
              correctOptionIndex: 0,
              explanation: 'Because 1 ≤ x < 9 and x is an odd counting number, the elements are strictly 1, 3, 5, and 7. The number 9 is excluded by the strict inequality (< 9).',
            },
            {
              id: `q-g9-math-1-4`,
              subjectId,
              chapterId: `chap-${subjectId}-${chapterNumber}`,
              difficulty: 'Medium',
              question: 'Why is the Set-Builder Method indispensable when working with continuous intervals of real numbers like {x | x ∈ R, 0 < x < 1}?',
              options: [
                'Because real numbers are dense and uncountable, making it impossible to list them all individually',
                'Because sets of real numbers can only ever contain integers',
                'Because curly braces cannot be used with decimal values',
                'Because the listing method is prohibited in Grade 9',
              ],
              correctOptionIndex: 0,
              explanation: 'Between any two real numbers there are infinitely many real values; hence real number intervals cannot be listed and require set-builder notation.',
            },
          ],
        }
      : {
          id: `les-${subjectId}-${chapterNumber}-t1-p1`,
          topicId: `topic-${subjectId}-${chapterNumber}-1`,
          chapterId: `chap-${subjectId}-${chapterNumber}`,
          subjectId,
          grade,
          partNumber: 1,
          title: `Part 1: Foundations & Core Principles of ${title}`,
          description: `Detailed exploration of core definitions, formulas, and visual demonstrations for ${title}.`,
          durationMinutes: 22,
          isFreePreview: isFreeChapter,
          videoPoster: topic1Cover,
          videoUrl: '', // Clean empty state - only parts uploaded by Mr. Oda have videos
          textNotes: `### Core Study Notes - Chapter ${chapterNumber} (Part 1)\n\nWelcome to Part 1 of ${title}. In this segment, we build foundational definitions, identify variables, and examine mathematical derivations step-by-step.`,
          conceptBreakdown: [
            {
              stepNumber: 1,
              title: 'Master Essential Definitions',
              description: 'Understand the underlying laws and operational equations governing this chapter.',
              formulaOrExample: 'E = mc^2 or lim_{x -> c} f(x) = L',
              examTip: 'Pay attention to units and dimensional homogeneity.',
            },
            {
              stepNumber: 2,
              title: 'Apply Standard Problem-Solving Algorithm',
              description: 'Break down complex exam questions into verifiable sub-steps.',
              examTip: 'Check edge conditions before final evaluation.',
            },
          ],
          downloadables: [
            {
              id: `dl-${subjectId}-${chapterNumber}-1`,
              title: `Chapter ${chapterNumber} Comprehensive Study Guide.pdf`,
              type: 'PDF',
              fileSize: '3.2 MB',
              downloadUrl: '#',
            },
          ],
          examTimeMinutes: 15,
          quizQuestions: [
            {
              id: `q-${subjectId}-${chapterNumber}-1`,
              subjectId,
              chapterId: `chap-${subjectId}-${chapterNumber}`,
              difficulty: 'Easy',
              question: `Which fundamental principle governs the initial study of ${title}?`,
              options: [
                'First Law of conservation and systematic equilibrium',
                'Arbitrary coefficient estimation',
                'Unverified empirical speculation',
                'None of the above',
              ],
              correctOptionIndex: 0,
              explanation: 'Systematic equilibrium and standard conservation laws form the cornerstone of this module.',
            },
            {
              id: `q-${subjectId}-${chapterNumber}-2`,
              subjectId,
              chapterId: `chap-${subjectId}-${chapterNumber}`,
              difficulty: 'Medium',
              question: `What is the most effective approach when solving multi-variable problems in this topic?`,
              options: [
                'Isolate given variables and solve step-by-step',
                'Skip intermediate proofs',
                'Estimate numerical results without verification',
                'Disregard dimensional analysis',
              ],
              correctOptionIndex: 0,
              explanation: 'Isolating variables and applying step-by-step verification prevents common calculation errors.',
            },
          ],
        };

    const part2: LearningPart = isGrade9MathCh1
      ? {
          id: `les-${subjectId}-${chapterNumber}-t1-p2`,
          topicId: `topic-${subjectId}-${chapterNumber}-1`,
          chapterId: `chap-${subjectId}-${chapterNumber}`,
          subjectId,
          grade,
          partNumber: 2,
          title: `Part 2: Set Operations, Subsets & Venn Diagrams`,
          description: `Worked examples, universal sets, empty/null sets, subsets (proper and improper), intersection, and union.`,
          durationMinutes: 28,
          isFreePreview: true,
          videoPoster: GRADE_9_MATH_VIDEO_POSTER,
          videoUrl: GRADE_9_MATH_VIDEO_URL_PART2,
          textNotes: `### Set Operations & Subsets - Chapter 1 (Part 2)\n\nIn Part 2, Mr. Oda Worku expands on operations on sets: Union (∪), Intersection (∩), Difference (\\), Complement ('), and Venn diagram representations.`,
          conceptBreakdown: [
            {
              stepNumber: 1,
              title: 'Subsets & Proper Subsets',
              description: 'A ⊆ B means every element of A is also in B. Number of subsets of a set with n elements is 2^n.',
            },
          ],
          downloadables: [],
          examTimeMinutes: 20,
          quizQuestions: [],
        }
      : {
          id: `les-${subjectId}-${chapterNumber}-t1-p2`,
          topicId: `topic-${subjectId}-${chapterNumber}-1`,
          chapterId: `chap-${subjectId}-${chapterNumber}`,
          subjectId,
          grade,
          partNumber: 2,
          title: `Part 2: Analytical Methods & Problem Solving in ${title}`,
          description: `Worked examples, step-by-step mathematical techniques, and typical examination questions.`,
          durationMinutes: 28,
          isFreePreview: isFreeChapter,
          videoPoster: topic1Cover,
          videoUrl: '', // Clean empty state - only parts uploaded by Mr. Oda have videos
          textNotes: `### Analytical Methods - Chapter ${chapterNumber} (Part 2)\n\nIn Part 2, we tackle analytical calculation techniques, algebraic simplifications, and exam-focused scenarios.`,
          conceptBreakdown: [
            {
              stepNumber: 1,
              title: 'Identify Problem Constraints',
              description: 'Recognize constraints and setup the relevant equation model.',
            },
          ],
          downloadables: [],
          examTimeMinutes: 20,
          quizQuestions: [],
        };

    const part3: LearningPart = {
      id: `les-${subjectId}-${chapterNumber}-t2-p3`,
      topicId: `topic-${subjectId}-${chapterNumber}-2`,
      chapterId: `chap-${subjectId}-${chapterNumber}`,
      subjectId,
      grade,
      partNumber: 3,
      title: `Part 3: Advanced Applications & Exam Strategy for ${title}`,
      description: `Challenging scenarios, common pitfalls, and speed tips for national entrance exams.`,
      durationMinutes: 25,
      isFreePreview: isFreeChapter,
      videoPoster: topic2Cover,
      videoUrl: '', // Clean empty state - only parts uploaded by Mr. Oda have videos
      textNotes: `### Advanced Applications - Chapter ${chapterNumber} (Part 3)\n\nMaster entrance examination patterns and high-difficulty questions with confidence.`,
      conceptBreakdown: [],
      downloadables: [],
      quizQuestions: [],
    };

    const part4: LearningPart = {
      id: `les-${subjectId}-${chapterNumber}-t2-p4`,
      topicId: `topic-${subjectId}-${chapterNumber}-2`,
      chapterId: `chap-${subjectId}-${chapterNumber}`,
      subjectId,
      grade,
      partNumber: 4,
      title: `Part 4: Timed Mock Review & Solved Past Papers of ${title}`,
      description: `Comprehensive review with full timed practice test and downloadable question keys.`,
      durationMinutes: 30,
      isFreePreview: isFreeChapter,
      videoPoster: topic2Cover,
      videoUrl: '', // Clean empty state - only parts uploaded by Mr. Oda have videos
      textNotes: `### Mock Review & Past Paper Walkthrough - Chapter ${chapterNumber} (Part 4)\n\nReview past 5-year entrance exam solutions and test your mastery with timed MCQs.`,
      conceptBreakdown: [],
      downloadables: [
        {
          id: `dl-${subjectId}-${chapterNumber}-4`,
          title: `Chapter ${chapterNumber} Solved Exam Questions.pdf`,
          type: 'Past Paper',
          fileSize: '4.1 MB',
          downloadUrl: '#',
        },
      ],
      quizQuestions: [],
    };

    const topic1: Topic = {
      id: `topic-${subjectId}-${chapterNumber}-1`,
      chapterId: `chap-${subjectId}-${chapterNumber}`,
      subjectId,
      grade,
      topicNumber: 1,
      title: `Topic 1: Fundamental Axioms & Core Formulations`,
      description: `Foundational laws, theoretical frameworks, and core conceptual mechanisms for ${title}.`,
      coverImage: topic1Cover,
      isFree: isFreeChapter,
      parts: [part1, part2],
    };

    const topic2: Topic = {
      id: `topic-${subjectId}-${chapterNumber}-2`,
      chapterId: `chap-${subjectId}-${chapterNumber}`,
      subjectId,
      grade,
      topicNumber: 2,
      title: `Topic 2: Analytical Methods & Exam Practice`,
      description: `Step-by-step problem-solving, advanced application strategies, and exam review tests.`,
      coverImage: topic2Cover,
      isFree: isFreeChapter,
      parts: [part3, part4],
    };

    return {
      id: `chap-${subjectId}-${chapterNumber}`,
      subjectId,
      grade,
      chapterNumber,
      title: `Chapter ${chapterNumber}: ${title}`,
      order: chapterNumber,
      isActive: true,
      coverImage: chapterCover,
      isPremium: isPremiumChapter,
      isFree: isFreeChapter,
      topics: [topic1, topic2],
      lessons: [part1, part2, part3, part4],
    };
  });
};

const INITIAL_CHAPTERS_BASE: Chapter[] = [
  // Grade 12 Math Chapters (1 to 6)
  ...createStandardChaptersForSubject('sub-g12-math', 'Grade 12', 'MATH-12', [
    'Limits, Continuity & Rate of Change',
    'Techniques of Differentiation & Chain Rule',
    'Applications of Derivatives & Optimization',
    'Integral Calculus & Fundamental Theorems',
    'Integration Techniques (Substitution & By Parts)',
    'Three-Dimensional Vectors & National Exam Master Review',
  ]),

  // Grade 12 Physics Chapters (1 to 6)
  ...createStandardChaptersForSubject('sub-g12-phys', 'Grade 12', 'PHYS-12', [
    'Electromagnetic Induction & Faraday’s Laws',
    'Alternating Current Circuits & Reactance',
    'Electromagnetic Waves & Optical Spectra',
    'Atomic Physics & The Photoelectric Effect',
    'Nuclear Physics & Radioactive Decay',
    'Modern Physics & National Exam Preparation',
  ]),

  // Grade 11 Natural Math Chapters
  ...createStandardChaptersForSubject('sub-g11-nat-math', 'Grade 11', 'MATH-11', [
    'Vectors in Two and Three Dimensions',
    'Complex Numbers & Polar Forms',
    'Sequences and Mathematical Series',
    'Introduction to Limits & Continuity',
    'Coordinate Geometry & Conic Sections',
    'Statistical Models & Probability Distributions',
  ]),

  // Grade 11 Natural Physics Chapters
  ...createStandardChaptersForSubject('sub-g11-nat-phys', 'Grade 11', 'PHYS-11', [
    'Two-Dimensional Motion & Projectile Kinematics',
    'Rotational Dynamics & Torque Equations',
    'Universal Gravitation & Planetary Orbits',
    'Periodic Motion & Simple Harmonic Oscillations',
    'Fluid Mechanics & Bernoulli’s Principle',
    'Heat, Thermodynamics & Gas Laws',
  ]),

  // Grade 11 Natural Chemistry Chapters
  ...createStandardChaptersForSubject('sub-g11-nat-chem', 'Grade 11', 'CHEM-11', [
    'Chemical Equilibrium & The Equilibrium Constant (Kc)',
    'Le Chatelier\'s Principle & Equilibrium Shifts',
    'Acid-Base Equilibrium, pH and Buffer Solutions',
    'Reaction Kinetics & Rate Laws',
    'Chemical Thermodynamics & Gibbs Free Energy',
    'Electrochemistry & Galvanic Cells',
  ]),

  // Grade 11 Natural Biology Chapters
  ...createStandardChaptersForSubject('sub-g11-nat-bio', 'Grade 11', 'BIOL-11', [
    'Cellular Ultrastructure & Transport Mechanisms',
    'Enzymes & Biochemical Catalysis',
    'Cellular Respiration & Energy Harvesting',
    'Molecular Genetics, DNA Replication & Transcription',
    'Protein Synthesis & Genetic Code Translation',
    'Mendelian Inheritance & Biotechnology Tools',
  ]),

  // Grade 11 Social History Chapters
  ...createStandardChaptersForSubject('sub-g11-soc-hist', 'Grade 11', 'HIST-11', [
    'The Enlightenment & Age of Revolutions',
    'The Industrial Revolution & Global Impacts',
    'Modern African Colonial Partition & Resistance',
    'Ethiopian State Formation & External Relations',
    'First World War & The League of Nations',
    'Historical Research Methods & Historiography',
  ]),

  // Grade 11 Social Geography Chapters
  ...createStandardChaptersForSubject('sub-g11-soc-geog', 'Grade 11', 'GEOG-11', [
    'Advanced Map Work & Topographic Interpretation',
    'Geomorphology & Dynamic Earth Processes',
    'Global Weather Systems & Climatology',
    'Natural Resources & Sustainable Utilization',
    'Human Population Dynamics & Migration',
    'Economic Geography of Developing Nations',
  ]),

  // Grade 11 Social Economics Chapters
  ...createStandardChaptersForSubject('sub-g11-soc-econ', 'Grade 11', 'ECON-11', [
    'The Nature & Scope of Economics',
    'Theory of Consumer Behavior & Utility',
    'Market Demand, Supply & Elasticity Models',
    'Theory of Production & Cost Functions',
    'Market Structures: Perfect Competition & Monopolies',
    'Introduction to Macroeconomic Indicators',
  ]),

  // Grade 10 Math Chapters
  ...createStandardChaptersForSubject('sub-g10-math', 'Grade 10', 'MATH-10', [
    'Quadratic Equations & Parabolic Functions',
    'Relations, Functions & Inverse Graphs',
    'Trigonometric Ratios & Unit Circle Identities',
    'Circle Theorems & Angle Subtensions',
    'Measurement of Solids & Geometric Mensuration',
    'Data Representation, Probability & Statistics',
  ]),

  // Grade 10 Physics Chapters
  ...createStandardChaptersForSubject('sub-g10-phys', 'Grade 10', 'PHYS-10', [
    'Motion in Two Dimensions & Vector Addition',
    'Work, Energy & Conservation Principles',
    'Internal Energy, Temperature & Heat Transfer',
    'Wave Motion, Sound Waves & Acoustics',
    'Optics: Reflection & Refraction of Light',
    'Electrostatics, Electric Potential & Circuits',
  ]),

  // Grade 9 Math Chapters
  ...createStandardChaptersForSubject('sub-g9-math', 'Grade 9', 'MATH-09', [
    'Further on Sets & Set-Builder Method',
    'Number Systems & Surds',
    'Algebraic Expressions & Factorization of Polynomials',
    'Linear Equations and Inequalities in One Variable',
    'Coordinate Geometry & Linear Equations in Two Variables',
    'Geometric Theorems on Triangles & Polygons',
  ]),

  // Grade 9 Physics Chapters
  ...createStandardChaptersForSubject('sub-g9-phys', 'Grade 9', 'PHYS-09', [
    'Physical Quantities, Units & Measurement',
    'Kinematics: Uniform Motion & Velocity-Time Graphs',
    'Newton’s Laws of Motion & Friction Forces',
    'Work, Mechanical Advantage & Simple Machines',
    'Density, Pressure & Archimedes’ Principle',
    'Heat Energy & Thermal Expansion of Matter',
  ]),

  // Freshman Calculus Chapters
  ...createStandardChaptersForSubject('sub-fresh-calc', 'Freshman University', 'MATH-FRESH', [
    'Vector Spaces, Span & Linear Independence',
    'Matrix Algebra, Determinants & Inverse Matrices',
    'Limits, Epsilon-Delta Rigor & Continuity Theorems',
    'Derivatives & Advanced Applications (Taylor Series)',
    'Riemann Integrals & Multivariable Extensions',
    'Eigenvalues, Eigenvectors & Linear Transformations',
  ]),

  // Freshman Computer Science Chapters
  ...createStandardChaptersForSubject('sub-fresh-cs', 'Freshman University', 'COSC-FRESH', [
    'Computational Thinking & Problem Decomposition',
    'Python Syntax, Control Flow & Iterations',
    'Modular Programming: Functions & Scopes',
    'Data Structures: Lists, Tuples, Dictionaries & Sets',
    'Object-Oriented Programming: Classes & Methods',
    'File I/O, Exception Handling & Algorithmic Complexity',
  ]),
];

// Dynamically generate 6 chapters for any subject not explicitly defined above
const explicitSubjectIds = new Set(INITIAL_CHAPTERS_BASE.map(c => c.subjectId));
const fallbackChapters: Chapter[] = [];
INITIAL_SUBJECTS.forEach(sub => {
  if (!explicitSubjectIds.has(sub.id)) {
    const chapters = createStandardChaptersForSubject(sub.id, sub.grade, sub.code, [
      'Foundations, Core Principles & Formulas',
      'Analytical Mechanics & Problem Solving',
      'Applied Analysis & Practical Cases',
      'Advanced Theoretical Frameworks',
      'Exam Problem-Solving Strategies',
      'National Entrance Examination Mock Review',
    ]);
    fallbackChapters.push(...chapters);
  }
});

export const INITIAL_CHAPTERS: Chapter[] = [...INITIAL_CHAPTERS_BASE, ...fallbackChapters];

export const INITIAL_STUDENTS: StudentProfile[] = [
  {
    id: 'stu-001',
    name: 'Samuel Kebede',
    email: 'samuel.k@example.com',
    phone: '+251 91 184 7291',
    grade: 'Grade 12',
    enrolledSubjectIds: ['sub-g12-math'], // Already approved
    pendingSubjectIds: ['sub-g12-phys'], // Pending admin review
    completedLessonIds: ['les-sub-g12-math-1-p1'],
    registrationDate: '2026-09-12',
    avatarUrl: '',
    quizAttempts: [
      {
        id: 'qa-101',
        quizTitle: 'Chapter 1: Limits & Continuity Diagnostic Exam',
        subjectName: 'Grade 12 Advanced Calculus & Vectors',
        grade: 'Grade 12',
        score: 2,
        totalQuestions: 2,
        percentage: 100,
        passed: true,
        timeSpentSeconds: 240,
        completedAt: '2026-10-14 14:22',
        userAnswers: { 0: 0, 1: 0 },
      },
    ],
  },
  {
    id: 'stu-002',
    name: 'Bethlehem Tadesse',
    email: 'beth.tadesse@example.com',
    phone: '+251 92 344 1928',
    grade: 'Freshman University',
    enrolledSubjectIds: ['sub-fresh-calc', 'sub-fresh-cs'],
    pendingSubjectIds: [],
    completedLessonIds: ['les-sub-fresh-calc-1-p1'],
    registrationDate: '2026-09-18',
    quizAttempts: [
      {
        id: 'qa-102',
        quizTitle: 'Vector Spaces & Linear Independence Quiz',
        subjectName: 'Applied Calculus I & Linear Algebra',
        grade: 'Freshman University',
        score: 2,
        totalQuestions: 2,
        percentage: 100,
        passed: true,
        timeSpentSeconds: 190,
        completedAt: '2026-10-15 09:15',
        userAnswers: { 0: 0, 1: 0 },
      },
    ],
  },
  {
    id: 'stu-003',
    name: 'Natnael Hailu',
    email: 'natnael.h@example.com',
    phone: '+251 93 881 2940',
    grade: 'Grade 11',
    enrolledSubjectIds: ['sub-g11-nat-chem'],
    pendingSubjectIds: [],
    completedLessonIds: [],
    registrationDate: '2026-10-01',
    quizAttempts: [],
  },
];

export const INITIAL_PAYMENTS: PaymentSubmission[] = [
  {
    id: 'pay-req-001',
    studentId: 'stu-001',
    studentName: 'Samuel Kebede',
    studentEmail: 'samuel.k@example.com',
    studentPhone: '+251 91 184 7291',
    purchaseType: 'individual_subjects',
    subjectId: 'sub-g12-phys',
    subjectTitle: 'Physics (Natural Science)',
    grade: 'Grade 12',
    amountETB: 850,
    amountUSD: 16,
    paymentMethod: 'Telebirr',
    referenceNumber: 'TB-9284719283-AET',
    screenshotUrl: PAYMENT_RECEIPT_IMAGE,
    submittedAt: '2026-10-17 17:45',
    status: 'Pending',
    adminNotes: 'Awaiting admin verification of Telebirr transaction confirmation.',
  },
  {
    id: 'pay-req-002',
    studentId: 'stu-001',
    studentName: 'Samuel Kebede',
    studentEmail: 'samuel.k@example.com',
    studentPhone: '+251 91 184 7291',
    purchaseType: 'individual_subjects',
    subjectId: 'sub-g12-math',
    subjectTitle: 'Mathematics (Natural Science - Calculus)',
    grade: 'Grade 12',
    amountETB: 850,
    amountUSD: 16,
    paymentMethod: 'Commercial Bank of Ethiopia (CBE)',
    referenceNumber: 'FT262849182910',
    screenshotUrl: PAYMENT_RECEIPT_IMAGE,
    submittedAt: '2026-10-10 11:20',
    status: 'Approved',
    adminNotes: 'Verified via CBE online mobile portal. Access granted.',
    verifiedAt: '2026-10-10 12:05',
  },
  {
    id: 'pay-req-003',
    studentId: 'stu-002',
    studentName: 'Bethlehem Tadesse',
    studentEmail: 'beth.tadesse@example.com',
    studentPhone: '+251 92 344 1928',
    purchaseType: 'individual_subjects',
    subjectId: 'sub-fresh-calc',
    subjectTitle: 'Applied Calculus I & Linear Algebra (Natural)',
    grade: 'Freshman University',
    amountETB: 1100,
    amountUSD: 20,
    paymentMethod: 'Awash Bank',
    referenceNumber: 'AW-7738192841',
    screenshotUrl: PAYMENT_RECEIPT_IMAGE,
    submittedAt: '2026-10-12 16:30',
    status: 'Approved',
    adminNotes: 'Awash bank slip verified.',
    verifiedAt: '2026-10-12 17:00',
  },
];

export const INITIAL_NOTIFICATIONS: UserNotification[] = [
  {
    id: 'notif-1',
    title: 'New Video Lesson Added: Grade 12 Calculus',
    message: 'Chapter 1 (Part 1) "Limits, Continuity & Rate of Change" is now available for streaming.',
    timestamp: '2 hours ago',
    type: 'lesson',
    isRead: false,
    targetGrade: 'Grade 12',
    linkToLessonId: 'les-sub-g12-math-1-p1',
  },
  {
    id: 'notif-2',
    title: 'Payment Verification Notice',
    message: 'Your payment submission for Grade 12 Advanced Calculus was approved by Admin Mr. Oda.',
    timestamp: '1 day ago',
    type: 'payment',
    isRead: false,
  },
  {
    id: 'notif-3',
    title: 'Upcoming National Mock Examination',
    message: 'The Grade 12 Mathematics timed practice test will be released this Friday with 30-minute exam mode.',
    timestamp: '2 days ago',
    type: 'announcement',
    isRead: true,
  },
];

export const PAYMENT_METHODS_INFO = [
  {
    name: 'Telebirr',
    accountNumber: '+251 91 123 4567',
    accountName: 'Oda Educational Services (Merchant ID: 884920)',
    instructions: 'Open your Telebirr app, select "Pay Merchant" or "Send Money", transfer the exact course amount, take a screenshot of the completed transaction, and submit the reference number below.',
  },
  {
    name: 'Commercial Bank of Ethiopia (CBE)',
    accountNumber: '1000 2938 4729 1',
    accountName: 'Oda Education & Learning Systems',
    instructions: 'Transfer via CBE Birr or CBE Mobile Banking. Upload the digital transfer receipt screenshot with the FT reference number visible.',
  },
  {
    name: 'Awash Bank',
    accountNumber: '0143 8928 4721 00',
    accountName: 'Oda Educational Software Systems',
    instructions: 'Send money using Awash Birr / Mobile Banking and attach the PDF or screenshot of the receipt.',
  },
];
