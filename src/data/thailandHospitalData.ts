export interface HospitalLocation {
  id: string;
  name: string;
  nameEn?: string;
  province: string;
  region: 'Central' | 'North' | 'Northeastern' | 'Eastern' | 'Western' | 'South';
  lat: number;
  lng: number;
  aliases?: string[];
  type?: 'University' | 'Public Tertiary' | 'Public General' | 'Private' | 'Specialized';
}

export interface RegionInfo {
  id: 'Central' | 'North' | 'Northeastern' | 'Eastern' | 'Western' | 'South';
  nameTh: string;
  nameEn: string;
  color: string;
  borderCol: string;
  bgBadge: string;
  textBadge: string;
  center: [number, number];
  zoom: number;
}

export const THAILAND_REGIONS: Record<string, RegionInfo> = {
  Central: {
    id: 'Central',
    nameTh: 'ภาคกลาง / กรุงเทพฯ และปริมณฑล',
    nameEn: 'Central & Bangkok',
    color: '#6366f1', // Indigo
    borderCol: '#4f46e5',
    bgBadge: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    textBadge: 'text-indigo-700',
    center: [13.7563, 100.5018],
    zoom: 9
  },
  North: {
    id: 'North',
    nameTh: 'ภาคเหนือ',
    nameEn: 'Northern Thailand',
    color: '#10b981', // Emerald
    borderCol: '#059669',
    bgBadge: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    textBadge: 'text-emerald-700',
    center: [18.7883, 98.9853],
    zoom: 8
  },
  Northeastern: {
    id: 'Northeastern',
    nameTh: 'ภาคตะวันออกเฉียงเหนือ (อีสาน)',
    nameEn: 'Northeastern (Isan)',
    color: '#f59e0b', // Amber
    borderCol: '#d97706',
    bgBadge: 'bg-amber-50 border-amber-200 text-amber-700',
    textBadge: 'text-amber-700',
    center: [16.4322, 102.8236],
    zoom: 7.5
  },
  Eastern: {
    id: 'Eastern',
    nameTh: 'ภาคตะวันออก',
    nameEn: 'Eastern Thailand',
    color: '#ec4899', // Pink / Rose
    borderCol: '#db2777',
    bgBadge: 'bg-pink-50 border-pink-200 text-pink-700',
    textBadge: 'text-pink-700',
    center: [13.1500, 101.4000],
    zoom: 8.5
  },
  Western: {
    id: 'Western',
    nameTh: 'ภาคตะวันตก',
    nameEn: 'Western Thailand',
    color: '#14b8a6', // Teal
    borderCol: '#0d9488',
    bgBadge: 'bg-teal-50 border-teal-200 text-teal-700',
    textBadge: 'text-teal-700',
    center: [13.5386, 99.8167],
    zoom: 8.5
  },
  South: {
    id: 'South',
    nameTh: 'ภาคใต้',
    nameEn: 'Southern Thailand',
    color: '#0284c7', // Sky / Blue
    borderCol: '#0369a1',
    bgBadge: 'bg-sky-50 border-sky-200 text-sky-700',
    textBadge: 'text-sky-700',
    center: [7.8804, 99.5000],
    zoom: 7.5
  }
};

export const THAILAND_HOSPITALS_DATABASE: HospitalLocation[] = [
  // --- Central & Bangkok ---
  {
    id: 'hosp-chula',
    name: 'โรงพยาบาลจุฬาลงกรณ์ สภากาชาดไทย',
    nameEn: 'Chulalongkorn Memorial Hospital',
    province: 'กรุงเทพมหานคร',
    region: 'Central',
    lat: 13.7329,
    lng: 100.5332,
    aliases: ['รพ.จุฬา', 'จุฬาลงกรณ์', 'chulalongkorn', 'chula', 'สภากาชาดไทย'],
    type: 'University'
  },
  {
    id: 'hosp-siriraj',
    name: 'โรงพยาบาลศิริราช',
    nameEn: 'Siriraj Hospital',
    province: 'กรุงเทพมหานคร',
    region: 'Central',
    lat: 13.7579,
    lng: 100.4856,
    aliases: ['รพ.ศิริราช', 'ศิริราช', 'siriraj', 'siriraj hospital', 'ศิริราชปิยมหาราชการุณย์'],
    type: 'University'
  },
  {
    id: 'hosp-ramathibodi',
    name: 'โรงพยาบาลรามาธิบดี',
    nameEn: 'Ramathibodi Hospital',
    province: 'กรุงเทพมหานคร',
    region: 'Central',
    lat: 13.7668,
    lng: 100.5262,
    aliases: ['รพ.รามาธิบดี', 'รามาธิบดี', 'รามา', 'ramathibodi', 'rama'],
    type: 'University'
  },
  {
    id: 'hosp-rajavithi',
    name: 'โรงพยาบาลราชวิถี',
    nameEn: 'Rajavithi Hospital',
    province: 'กรุงเทพมหานคร',
    region: 'Central',
    lat: 13.7656,
    lng: 100.5367,
    aliases: ['รพ.ราชวิถี', 'ราชวิถี', 'rajavithi'],
    type: 'Public Tertiary'
  },
  {
    id: 'hosp-phramongkutklao',
    name: 'โรงพยาบาลพระมงกุฎเกล้า',
    nameEn: 'Phramongkutklao Hospital',
    province: 'กรุงเทพมหานคร',
    region: 'Central',
    lat: 13.7681,
    lng: 100.5358,
    aliases: ['รพ.พระมงกุฎเกล้า', 'พระมงกุฎ', 'phramongkutklao'],
    type: 'Public Tertiary'
  },
  {
    id: 'hosp-bumrungrad',
    name: 'โรงพยาบาลบำรุงราษฎร์ อินเตอร์เนชั่นแนล',
    nameEn: 'Bumrungrad International Hospital',
    province: 'กรุงเทพมหานคร',
    region: 'Central',
    lat: 13.7466,
    lng: 100.5529,
    aliases: ['บำรุงราษฎร์', 'bumrungrad', 'bumrungrad hospital'],
    type: 'Private'
  },
  {
    id: 'hosp-bangkok-hq',
    name: 'โรงพยาบาลกรุงเทพ (สำนักงานใหญ่ ซอยศูนย์วิจัย)',
    nameEn: 'Bangkok Hospital (Headquarters)',
    province: 'กรุงเทพมหานคร',
    region: 'Central',
    lat: 13.7486,
    lng: 100.5833,
    aliases: ['โรงพยาบาลกรุงเทพ', 'กรุงเทพสำนักงานใหญ่', 'bangkok hospital', 'ซอยศูนย์วิจัย'],
    type: 'Private'
  },
  {
    id: 'hosp-samitivej-sukhumvit',
    name: 'โรงพยาบาลสมิติเวช สุขุมวิท',
    nameEn: 'Samitivej Sukhumvit Hospital',
    province: 'กรุงเทพมหานคร',
    region: 'Central',
    lat: 13.7371,
    lng: 100.5779,
    aliases: ['สมิติเวช สุขุมวิท', 'สมิติเวช', 'samitivej'],
    type: 'Private'
  },
  {
    id: 'hosp-thammasat',
    name: 'โรงพยาบาลธรรมศาสตร์เฉลิมพระเกียรติ',
    nameEn: 'Thammasat University Hospital',
    province: 'ปทุมธานี',
    region: 'Central',
    lat: 14.0747,
    lng: 100.6062,
    aliases: ['รพ.ธรรมศาสตร์', 'ธรรมศาสตร์', 'thammasat', 'thammasart', 'tu hospital', 'thammasart university', 'thammasat university'],
    type: 'University'
  },
  {
    id: 'hosp-angthong',
    name: 'โรงพยาบาลอ่างทอง',
    nameEn: 'Angthong Hospital',
    province: 'อ่างทอง',
    region: 'Central',
    lat: 14.5889,
    lng: 100.4578,
    aliases: ['อ่างทอง', 'รพ.อ่างทอง', 'angthong', 'ang thong', 'angthong hospital', 'ang thong hospital'],
    type: 'Public General'
  },
  {
    id: 'hosp-somdet-phutthaloetla',
    name: 'โรงพยาบาลสมเด็จพระพุทธเลิศหล้า',
    nameEn: 'Somdet Phra Phutthaloetla Hospital',
    province: 'สมุทรสงคราม',
    region: 'Central',
    lat: 13.4144,
    lng: 99.9961,
    aliases: ['สมเด็จพระพุทธเลิศหล้า', 'somdetpraputthalertla', 'somdetpraputthalertla hospital', 'รพ.สมเด็จพระพุทธเลิศหล้า', 'somdet phra phutthaloetla', 'somdet phutthaloetla'],
    type: 'Public General'
  },
  {
    id: 'hosp-vajira',
    name: 'โรงพยาบาลวชิรพยาบาล',
    nameEn: 'Vajira Hospital',
    province: 'กรุงเทพมหานคร',
    region: 'Central',
    lat: 13.7788,
    lng: 100.5058,
    aliases: ['วชิรพยาบาล', 'วชิระ', 'vajira'],
    type: 'University'
  },
  {
    id: 'hosp-police',
    name: 'โรงพยาบาลตำรวจ',
    nameEn: 'Police General Hospital',
    province: 'กรุงเทพมหานคร',
    region: 'Central',
    lat: 13.7439,
    lng: 100.5392,
    aliases: ['รพ.ตำรวจ', 'ตำรวจ', 'police general hospital'],
    type: 'Public Tertiary'
  },
  {
    id: 'hosp-medpark',
    name: 'โรงพยาบาลเมดพาร์ค',
    nameEn: 'MedPark Hospital',
    province: 'กรุงเทพมหานคร',
    region: 'Central',
    lat: 13.7197,
    lng: 100.5606,
    aliases: ['เมดพาร์ค', 'medpark'],
    type: 'Private'
  },
  {
    id: 'hosp-praram9',
    name: 'โรงพยาบาลพระรามเก้า',
    nameEn: 'Praram 9 Hospital',
    province: 'กรุงเทพมหานคร',
    region: 'Central',
    lat: 13.7533,
    lng: 100.5750,
    aliases: ['พระรามเก้า', 'praram 9', 'praram9'],
    type: 'Private'
  },
  {
    id: 'hosp-chest',
    name: 'สถาบันโรคทรวงอก',
    nameEn: 'Central Chest Institute of Thailand',
    province: 'นนทบุรี',
    region: 'Central',
    lat: 13.8617,
    lng: 100.5222,
    aliases: ['โรคทรวงอก', 'สถาบันโรคทรวงอก', 'chest institute'],
    type: 'Specialized'
  },
  {
    id: 'hosp-cancer',
    name: 'สถาบันมะเร็งแห่งชาติ',
    nameEn: 'National Cancer Institute',
    province: 'กรุงเทพมหานคร',
    region: 'Central',
    lat: 13.7699,
    lng: 100.5303,
    aliases: ['สถาบันมะเร็ง', 'มะเร็งแห่งชาติ', 'cancer institute', 'nci'],
    type: 'Specialized'
  },
  {
    id: 'hosp-child',
    name: 'สถาบันสุขภาพเด็กแห่งชาติมหาราชินี',
    nameEn: "Queen Sirikit National Institute of Child Health (Children's Hospital)",
    province: 'กรุงเทพมหานคร',
    region: 'Central',
    lat: 13.7663,
    lng: 100.5377,
    aliases: ['รพ.เด็ก', 'สถาบันสุขภาพเด็ก', 'children hospital'],
    type: 'Specialized'
  },
  {
    id: 'hosp-bhumibol',
    name: 'โรงพยาบาลภูมิพลอดุลยเดช กรมแพทย์ทหารอากาศ',
    nameEn: 'Bhumibol Adulyadej Hospital',
    province: 'กรุงเทพมหานคร',
    region: 'Central',
    lat: 13.9108,
    lng: 100.6225,
    aliases: ['ภูมิพล', 'ภูมิพลอดุลยเดช', 'bhumibol'],
    type: 'Public Tertiary'
  },
  {
    id: 'hosp-nopparat',
    name: 'โรงพยาบาลนพรัตนราชธานี',
    nameEn: 'Nopparat Rajathanee Hospital',
    province: 'กรุงเทพมหานคร',
    region: 'Central',
    lat: 13.8219,
    lng: 100.6908,
    aliases: ['นพรัตน', 'นพรัตน์', 'nopparat'],
    type: 'Public Tertiary'
  },
  {
    id: 'hosp-lerdsin',
    name: 'โรงพยาบาลเลิดสิน',
    nameEn: 'Lerdsin Hospital',
    province: 'กรุงเทพมหานคร',
    region: 'Central',
    lat: 13.7208,
    lng: 100.5181,
    aliases: ['เลิดสิน', 'lerdsin'],
    type: 'Public Tertiary'
  },
  {
    id: 'hosp-ayutthaya',
    name: 'โรงพยาบาลพระนครศรีอยุธยา',
    nameEn: 'Phra Nakhon Si Ayutthaya Hospital',
    province: 'พระนครศรีอยุธยา',
    region: 'Central',
    lat: 14.3486,
    lng: 100.5639,
    aliases: ['รพ.อยุธยา', 'อยุธยา', 'ayutthaya hospital', 'พระนครศรีอยุธยา'],
    type: 'Public Tertiary'
  },
  {
    id: 'hosp-saraburi',
    name: 'โรงพยาบาลสระบุรี',
    nameEn: 'Saraburi Hospital',
    province: 'สระบุรี',
    region: 'Central',
    lat: 14.5264,
    lng: 100.9169,
    aliases: ['รพ.สระบุรี', 'สระบุรี', 'saraburi hospital'],
    type: 'Public Tertiary'
  },
  {
    id: 'hosp-lopburi',
    name: 'โรงพยาบาลพระนารายณ์มหาราช',
    nameEn: 'King Narai Hospital (Lopburi)',
    province: 'ลพบุรี',
    region: 'Central',
    lat: 14.8083,
    lng: 100.6653,
    aliases: ['พระนารายณ์มหาราช', 'รพ.ลพบุรี', 'ลพบุรี', 'king narai'],
    type: 'Public Tertiary'
  },
  {
    id: 'hosp-nakhon-sawan',
    name: 'โรงพยาบาลสวรรค์ประชารักษ์',
    nameEn: 'Sawanpracharak Hospital',
    province: 'นครสวรรค์',
    region: 'Central',
    lat: 15.6989,
    lng: 100.1267,
    aliases: ['สวรรค์ประชารักษ์', 'รพ.นครสวรรค์', 'นครสวรรค์', 'sawanpracharak'],
    type: 'Public Tertiary'
  },

  // --- North (ภาคเหนือ) ---
  {
    id: 'hosp-cmu-suandok',
    name: 'โรงพยาบาลมหาราชนครเชียงใหม่ (สวนดอก)',
    nameEn: 'Maharaj Nakorn Chiang Mai Hospital',
    province: 'เชียงใหม่',
    region: 'North',
    lat: 18.7897,
    lng: 98.9744,
    aliases: ['มหาราชนครเชียงใหม่', 'สวนดอก', 'suan dok', 'suandok', 'cmu hospital', 'รพ.สวนดอก'],
    type: 'University'
  },
  {
    id: 'hosp-nakornping',
    name: 'โรงพยาบาลนครพิงค์',
    nameEn: 'Nakornping Hospital',
    province: 'เชียงใหม่',
    region: 'North',
    lat: 18.8475,
    lng: 98.9725,
    aliases: ['นครพิงค์', 'nakornping', 'nakornping hospital'],
    type: 'Public Tertiary'
  },
  {
    id: 'hosp-chiangrai',
    name: 'โรงพยาบาลเชียงรายประชานุเคราะห์',
    nameEn: 'Chiangrai Prachanukroh Hospital',
    province: 'เชียงราย',
    region: 'North',
    lat: 19.9036,
    lng: 99.8322,
    aliases: ['เชียงรายประชานุเคราะห์', 'รพ.เชียงราย', 'เชียงราย', 'chiangrai'],
    type: 'Public Tertiary'
  },
  {
    id: 'hosp-lampang',
    name: 'โรงพยาบาลลำปาง',
    nameEn: 'Lampang Hospital',
    province: 'ลำปาง',
    region: 'North',
    lat: 18.2917,
    lng: 99.5083,
    aliases: ['รพ.ลำปาง', 'ลำปาง', 'lampang hospital'],
    type: 'Public Tertiary'
  },
  {
    id: 'hosp-phitsanulok',
    name: 'โรงพยาบาลพุทธชินราช พิษณุโลก',
    nameEn: 'Buddhachinaraj Hospital',
    province: 'พิษณุโลก',
    region: 'North',
    lat: 16.8156,
    lng: 100.2639,
    aliases: ['พุทธชินราช', 'รพ.พิษณุโลก', 'พิษณุโลก', 'buddhachinaraj'],
    type: 'Public Tertiary'
  },
  {
    id: 'hosp-lamphun',
    name: 'โรงพยาบาลลำพูน',
    nameEn: 'Lamphun Hospital',
    province: 'ลำพูน',
    region: 'North',
    lat: 18.5744,
    lng: 99.0069,
    aliases: ['รพ.ลำพูน', 'ลำพูน', 'lamphun'],
    type: 'Public General'
  },
  {
    id: 'hosp-phrae',
    name: 'โรงพยาบาลแพร่',
    nameEn: 'Phrae Hospital',
    province: 'แพร่',
    region: 'North',
    lat: 18.1436,
    lng: 100.1417,
    aliases: ['รพ.แพร่', 'แพร่', 'phrae'],
    type: 'Public General'
  },
  {
    id: 'hosp-nan',
    name: 'โรงพยาบาลน่าน',
    nameEn: 'Nan Hospital',
    province: 'น่าน',
    region: 'North',
    lat: 18.7850,
    lng: 100.7783,
    aliases: ['รพ.น่าน', 'น่าน', 'nan hospital'],
    type: 'Public General'
  },
  {
    id: 'hosp-phayao',
    name: 'โรงพยาบาลพะเยา',
    nameEn: 'Phayao Hospital',
    province: 'พะเยา',
    region: 'North',
    lat: 19.1678,
    lng: 99.9022,
    aliases: ['รพ.พะเยา', 'พะเยา', 'phayao'],
    type: 'Public General'
  },
  {
    id: 'hosp-overbrook',
    name: 'โรงพยาบาลโอเวอร์บรุ๊ค',
    nameEn: 'Overbrook Hospital',
    province: 'เชียงราย',
    region: 'North',
    lat: 19.9114,
    lng: 99.8327,
    aliases: ['โอเวอร์บรุ๊ค', 'overbrook', 'overbrook hospital', 'รพ.โอเวอร์บรุ๊ค', 'over brook'],
    type: 'Private'
  },
  {
    id: 'hosp-chomthong',
    name: 'โรงพยาบาลจอมทอง',
    nameEn: 'Chomthong Hospital',
    province: 'เชียงใหม่',
    region: 'North',
    lat: 18.4239,
    lng: 98.6811,
    aliases: ['จอมทอง', 'รพ.จอมทอง', 'chomthong', 'chom thong', 'chomthong hospital', 'chom thong hospital'],
    type: 'Public General'
  },
  {
    id: 'hosp-maesot',
    name: 'โรงพยาบาลแม่สอด',
    nameEn: 'Mae Sot Hospital',
    province: 'ตาก',
    region: 'North',
    lat: 16.7167,
    lng: 98.5744,
    aliases: ['แม่สอด', 'รพ.แม่สอด', 'mae sot', 'maesot', 'measot', 'measot hospital', 'maesot hospital', 'mae sot hospital', 'maesod', 'โรงพยาบาลแม่สอด'],
    type: 'Public Tertiary'
  },
  {
    id: 'hosp-tak',
    name: 'โรงพยาบาลสมเด็จพระเจ้าตากสินมหาราช',
    nameEn: 'Somdejphrachao Taksin Maharaj Hospital',
    province: 'ตาก',
    region: 'North',
    lat: 16.8833,
    lng: 99.1239,
    aliases: ['สมเด็จพระเจ้าตากสินมหาราช', 'รพ.ตาก', 'ตาก'],
    type: 'Public General'
  },
  {
    id: 'hosp-uttaradit',
    name: 'โรงพยาบาลอุตรดิตถ์',
    nameEn: 'Uttaradit Hospital',
    province: 'อุตรดิตถ์',
    region: 'North',
    lat: 17.6256,
    lng: 100.0983,
    aliases: ['รพ.อุตรดิตถ์', 'อุตรดิตถ์', 'uttaradit'],
    type: 'Public Tertiary'
  },
  {
    id: 'hosp-sukhothai',
    name: 'โรงพยาบาลสุโขทัย',
    nameEn: 'Sukhothai Hospital',
    province: 'สุโขทัย',
    region: 'North',
    lat: 17.0089,
    lng: 99.8244,
    aliases: ['รพ.สุโขทัย', 'สุโขทัย', 'sukhothai'],
    type: 'Public General'
  },
  {
    id: 'hosp-phetchabun',
    name: 'โรงพยาบาลเพชรบูรณ์',
    nameEn: 'Phetchabun Hospital',
    province: 'เพชรบูรณ์',
    region: 'North',
    lat: 16.4250,
    lng: 101.1583,
    aliases: ['รพ.เพชรบูรณ์', 'เพชรบูรณ์', 'phetchabun'],
    type: 'Public Tertiary'
  },

  // --- Northeastern (ภาคอีสาน) ---
  {
    id: 'hosp-srinagarind',
    name: 'โรงพยาบาลศรีนครินทร์ มหาวิทยาลัยขอนแก่น',
    nameEn: 'Srinagarind Hospital (KKU)',
    province: 'ขอนแก่น',
    region: 'Northeastern',
    lat: 16.4678,
    lng: 102.8278,
    aliases: ['ศรีนครินทร์', 'มข.', 'kku', 'srinagarind hospital', 'ม.ขอนแก่น', 'รพ.ศรีนครินทร์'],
    type: 'University'
  },
  {
    id: 'hosp-khonkaen',
    name: 'โรงพยาบาลขอนแก่น',
    nameEn: 'Khon Kaen Hospital',
    province: 'ขอนแก่น',
    region: 'Northeastern',
    lat: 16.4322,
    lng: 102.8433,
    aliases: ['รพ.ขอนแก่น', 'ขอนแก่น', 'khonkaen hospital', 'khon kaen'],
    type: 'Public Tertiary'
  },
  {
    id: 'hosp-korat-maharat',
    name: 'โรงพยาบาลมหาราชนครราชสีมา',
    nameEn: 'Maharat Nakhon Ratchasima Hospital',
    province: 'นครราชสีมา',
    region: 'Northeastern',
    lat: 14.9819,
    lng: 102.1097,
    aliases: ['มหาราชนครราชสีมา', 'รพ.มหาราชโคราช', 'โคราช', 'นครราชสีมา', 'korat', 'nakhon ratchasima'],
    type: 'Public Tertiary'
  },
  {
    id: 'hosp-ubon',
    name: 'โรงพยาบาลสรรพสิทธิประสงค์ อุบลราชธานี',
    nameEn: 'Sapphasitthiprasong Hospital',
    province: 'อุบลราชธานี',
    region: 'Northeastern',
    lat: 15.2289,
    lng: 104.8583,
    aliases: ['สรรพสิทธิประสงค์', 'รพ.อุบล', 'อุบลราชธานี', 'ubon ratchathani', 'ubon'],
    type: 'Public Tertiary'
  },
  {
    id: 'hosp-kuchinarai',
    name: 'โรงพยาบาลสมเด็จพระยุพราชกุฉินารายณ์',
    nameEn: 'Kuchinarai Crown Prince Hospital',
    province: 'กาฬสินธุ์',
    region: 'Northeastern',
    lat: 16.5361,
    lng: 104.0531,
    aliases: ['กุฉินารายณ์', 'รพ.กุฉินารายณ์', 'kuchinarai', 'kuchinarai crown prince', 'kuchinarai crown prince hospital', 'สมเด็จพระยุพราชกุฉินารายณ์'],
    type: 'Public General'
  },
  {
    id: 'hosp-udorn',
    name: 'โรงพยาบาลอุดรธานี',
    nameEn: 'Udon Thani Hospital',
    province: 'อุดรธานี',
    region: 'Northeastern',
    lat: 17.4103,
    lng: 102.7844,
    aliases: ['รพ.อุดรธานี', 'อุดรธานี', 'udon thani', 'udon'],
    type: 'Public Tertiary'
  },
  {
    id: 'hosp-roiet',
    name: 'โรงพยาบาลร้อยเอ็ด',
    nameEn: 'Roi Et Hospital',
    province: 'ร้อยเอ็ด',
    region: 'Northeastern',
    lat: 16.0536,
    lng: 103.6550,
    aliases: ['รพ.ร้อยเอ็ด', 'ร้อยเอ็ด', 'roi et'],
    type: 'Public Tertiary'
  },
  {
    id: 'hosp-surin',
    name: 'โรงพยาบาลสุรินทร์',
    nameEn: 'Surin Hospital',
    province: 'สุรินทร์',
    region: 'Northeastern',
    lat: 14.8819,
    lng: 103.4936,
    aliases: ['รพ.สุรินทร์', 'สุรินทร์', 'surin hospital'],
    type: 'Public Tertiary'
  },
  {
    id: 'hosp-buriram',
    name: 'โรงพยาบาลบุรีรัมย์',
    nameEn: 'Buriram Hospital',
    province: 'บุรีรัมย์',
    region: 'Northeastern',
    lat: 14.9950,
    lng: 103.1039,
    aliases: ['รพ.บุรีรัมย์', 'บุรีรัมย์', 'buriram'],
    type: 'Public Tertiary'
  },
  {
    id: 'hosp-sakonnakhon',
    name: 'โรงพยาบาลสกลนคร',
    nameEn: 'Sakon Nakhon Hospital',
    province: 'สกลนคร',
    region: 'Northeastern',
    lat: 17.1556,
    lng: 104.1486,
    aliases: ['รพ.สกลนคร', 'สกลนคร', 'sakon nakhon'],
    type: 'Public Tertiary'
  },
  {
    id: 'hosp-nakhonphanom',
    name: 'โรงพยาบาลนครพนม',
    nameEn: 'Nakhon Phanom Hospital',
    province: 'นครพนม',
    region: 'Northeastern',
    lat: 17.3986,
    lng: 104.7833,
    aliases: ['รพ.นครพนม', 'นครพนม', 'nakhon phanom'],
    type: 'Public Tertiary'
  },
  {
    id: 'hosp-chaiyaphum',
    name: 'โรงพยาบาลชัยภูมิ',
    nameEn: 'Chaiyaphum Hospital',
    province: 'ชัยภูมิ',
    region: 'Northeastern',
    lat: 15.8064,
    lng: 102.0317,
    aliases: ['รพ.ชัยภูมิ', 'ชัยภูมิ', 'chaiyaphum'],
    type: 'Public Tertiary'
  },
  {
    id: 'hosp-kalasin',
    name: 'โรงพยาบาลกาฬสินธุ์',
    nameEn: 'Kalasin Hospital',
    province: 'กาฬสินธุ์',
    region: 'Northeastern',
    lat: 16.4328,
    lng: 103.5067,
    aliases: ['รพ.กาฬสินธุ์', 'กาฬสินธุ์', 'kalasin'],
    type: 'Public Tertiary'
  },
  {
    id: 'hosp-mahasarakham',
    name: 'โรงพยาบาลมหาสารคาม',
    nameEn: 'Maha Sarakham Hospital',
    province: 'มหาสารคาม',
    region: 'Northeastern',
    lat: 16.1850,
    lng: 103.3006,
    aliases: ['รพ.มหาสารคาม', 'มหาสารคาม', 'maha sarakham'],
    type: 'Public Tertiary'
  },
  {
    id: 'hosp-nongkhai',
    name: 'โรงพยาบาลหนองคาย',
    nameEn: 'Nong Khai Hospital',
    province: 'หนองคาย',
    region: 'Northeastern',
    lat: 17.8789,
    lng: 102.7417,
    aliases: ['รพ.หนองคาย', 'หนองคาย', 'nong khai'],
    type: 'Public Tertiary'
  },
  {
    id: 'hosp-loei',
    name: 'โรงพยาบาลเลย',
    nameEn: 'Loei Hospital',
    province: 'เลย',
    region: 'Northeastern',
    lat: 17.4864,
    lng: 101.7283,
    aliases: ['รพ.เลย', 'เลย', 'loei'],
    type: 'Public General'
  },
  {
    id: 'hosp-sisaket',
    name: 'โรงพยาบาลศรีสะเกษ',
    nameEn: 'Sisaket Hospital',
    province: 'ศรีสะเกษ',
    region: 'Northeastern',
    lat: 15.1150,
    lng: 104.3256,
    aliases: ['รพ.ศรีสะเกษ', 'ศรีสะเกษ', 'sisaket'],
    type: 'Public Tertiary'
  },

  // --- Eastern (ภาคตะวันออก) ---
  {
    id: 'hosp-chonburi',
    name: 'โรงพยาบาลชลบุรี',
    nameEn: 'Chonburi Hospital',
    province: 'ชลบุรี',
    region: 'Eastern',
    lat: 13.3517,
    lng: 100.9786,
    aliases: ['รพ.ชลบุรี', 'ชลบุรี', 'chonburi'],
    type: 'Public Tertiary'
  },
  {
    id: 'hosp-sriracha-queen',
    name: 'โรงพยาบาลสมเด็จพระบรมราชเทวี ณ ศรีราชา',
    nameEn: 'Queen Savang Vadhana Memorial Hospital (Sriracha)',
    province: 'ชลบุรี',
    region: 'Eastern',
    lat: 13.1678,
    lng: 100.9256,
    aliases: ['สมเด็จ ณ ศรีราชา', 'รพ.สมเด็จศรีราชา', 'ศรีราชา', 'sriracha', 'queen savang', 'queen savang vadhana', 'queen savang vadhana memorial hospital', 'queen savang vadhana memorial', 'savang vadhana'],
    type: 'Public Tertiary'
  },
  {
    id: 'hosp-somdej-sirikit',
    name: 'โรงพยาบาลสมเด็จพระนางเจ้าสิริกิติ์ กรมแพทย์ทหารเรือ',
    nameEn: 'Somdej Phra Nang Chao Sirikit Hospital',
    province: 'ชลบุรี',
    region: 'Eastern',
    lat: 12.6975,
    lng: 100.9986,
    aliases: ['สมเด็จพระนางเจ้าสิริกิติ์', 'somdejpranangchaosirikit', 'somdej sirikit', 'sirikit hospital sattahip', 'สัตหีบ', 'somdejpranangchaosirikit hospital', 'sirikit sattahip', 'somdej phra nang chao sirikit'],
    type: 'Public Tertiary'
  },
  {
    id: 'hosp-rayong',
    name: 'โรงพยาบาลระยอง',
    nameEn: 'Rayong Hospital',
    province: 'ระยอง',
    region: 'Eastern',
    lat: 12.6819,
    lng: 101.2750,
    aliases: ['รพ.ระยอง', 'ระยอง', 'rayong'],
    type: 'Public Tertiary'
  },
  {
    id: 'hosp-chanthaburi',
    name: 'โรงพยาบาลพระปกเกล้า จันทบุรี',
    nameEn: 'Phra Pokklao Hospital',
    province: 'จันทบุรี',
    region: 'Eastern',
    lat: 12.6083,
    lng: 102.1083,
    aliases: ['พระปกเกล้า', 'รพ.จันทบุรี', 'จันทบุรี', 'chanthaburi'],
    type: 'Public Tertiary'
  },
  {
    id: 'hosp-prachinburi',
    name: 'โรงพยาบาลเจ้าพระยาอภัยภูเบศร',
    nameEn: 'Chaophraya Abhaibhubejhr Hospital',
    province: 'ปราจีนบุรี',
    region: 'Eastern',
    lat: 14.0533,
    lng: 101.3739,
    aliases: ['อภัยภูเบศร', 'รพ.ปราจีนบุรี', 'ปราจีนบุรี', 'abhaibhubejhr'],
    type: 'Public Tertiary'
  },
  {
    id: 'hosp-chachoengsao',
    name: 'โรงพยาบาลพุทธโสธร',
    nameEn: 'Buddhasothorn Hospital',
    province: 'ฉะเชิงเทรา',
    region: 'Eastern',
    lat: 13.6869,
    lng: 101.0717,
    aliases: ['พุทธโสธร', 'รพ.ฉะเชิงเทรา', 'ฉะเชิงเทรา', 'แปดริ้ว', 'chachoengsao'],
    type: 'Public Tertiary'
  },
  {
    id: 'hosp-trat',
    name: 'โรงพยาบาลตราด',
    nameEn: 'Trat Hospital',
    province: 'ตราด',
    region: 'Eastern',
    lat: 12.2436,
    lng: 102.5150,
    aliases: ['รพ.ตราด', 'ตราด', 'trat'],
    type: 'Public General'
  },
  {
    id: 'hosp-sakaeo',
    name: 'โรงพยาบาลสมเด็จพระยุพราชสระแก้ว',
    nameEn: 'Somdejphrayupparaj Sa Kaeo Hospital',
    province: 'สระแก้ว',
    region: 'Eastern',
    lat: 13.8183,
    lng: 102.0667,
    aliases: ['สมเด็จพระยุพราชสระแก้ว', 'รพ.สระแก้ว', 'สระแก้ว', 'sa kaeo', 'sakaeo', 'sakaeo crown prince', 'sakaeo crown prince hospital', 'sa kaeo crown prince hospital', 'somdejphrayupparaj sakaeo'],
    type: 'Public General'
  },
  {
    id: 'hosp-pattaya-bangkok',
    name: 'โรงพยาบาลกรุงเทพพัทยา',
    nameEn: 'Bangkok Hospital Pattaya',
    province: 'ชลบุรี',
    region: 'Eastern',
    lat: 12.9519,
    lng: 100.9069,
    aliases: ['กรุงเทพพัทยา', 'bangkok hospital pattaya', 'พัทยา'],
    type: 'Private'
  },

  // --- Western (ภาคตะวันตก) ---
  {
    id: 'hosp-ratchaburi',
    name: 'โรงพยาบาลราชบุรี',
    nameEn: 'Ratchaburi Hospital',
    province: 'ราชบุรี',
    region: 'Western',
    lat: 13.5386,
    lng: 99.8167,
    aliases: ['รพ.ราชบุรี', 'ราชบุรี', 'ratchaburi'],
    type: 'Public Tertiary'
  },
  {
    id: 'hosp-kanchanaburi',
    name: 'โรงพยาบาลพหลพลพยุหเสนา',
    nameEn: 'Phaholpolpayuhasena Hospital',
    province: 'กาญจนบุรี',
    region: 'Western',
    lat: 14.0208,
    lng: 99.5392,
    aliases: ['พหลพลพยุหเสนา', 'รพ.กาญจนบุรี', 'กาญจนบุรี', 'kanchanaburi'],
    type: 'Public Tertiary'
  },
  {
    id: 'hosp-phetchaburi',
    name: 'โรงพยาบาลพระจอมเกล้า จังหวัดเพชรบุรี',
    nameEn: 'Phra Chom Klao Hospital',
    province: 'เพชรบุรี',
    region: 'Western',
    lat: 13.1119,
    lng: 99.9444,
    aliases: ['พระจอมเกล้า', 'รพ.เพชรบุรี', 'เพชรบุรี', 'phetchaburi'],
    type: 'Public Tertiary'
  },
  {
    id: 'hosp-prachuap',
    name: 'โรงพยาบาลประจวบคีรีขันธ์',
    nameEn: 'Prachuap Khiri Khan Hospital',
    province: 'ประจวบคีรีขันธ์',
    region: 'Western',
    lat: 11.8089,
    lng: 99.7967,
    aliases: ['รพ.ประจวบ', 'ประจวบคีรีขันธ์', 'prachuap khiri khan'],
    type: 'Public General'
  },
  {
    id: 'hosp-huahin',
    name: 'โรงพยาบาลหัวหิน',
    nameEn: 'Hua Hin Hospital',
    province: 'ประจวบคีรีขันธ์',
    region: 'Western',
    lat: 12.6108,
    lng: 99.9519,
    aliases: ['รพ.หัวหิน', 'หัวหิน', 'hua hin'],
    type: 'Public Tertiary'
  },
  {
    id: 'hosp-banpong',
    name: 'โรงพยาบาลบ้านโป่ง',
    nameEn: 'Ban Pong Hospital',
    province: 'ราชบุรี',
    region: 'Western',
    lat: 13.8119,
    lng: 99.8778,
    aliases: ['บ้านโป่ง', 'ban pong'],
    type: 'Public General'
  },

  // --- South (ภาคใต้) ---
  {
    id: 'hosp-psu-songkla',
    name: 'โรงพยาบาลสงขลานครินทร์ (มอ.หาดใหญ่)',
    nameEn: 'Songklanagarind Hospital (PSU)',
    province: 'สงขลา',
    region: 'South',
    lat: 7.0086,
    lng: 100.4986,
    aliases: ['สงขลานครินทร์', 'มอ.', 'psu', 'มอ.หาดใหญ่', 'songklanagarind', 'รพ.มอ.'],
    type: 'University'
  },
  {
    id: 'hosp-hatyai',
    name: 'โรงพยาบาลหาดใหญ่',
    nameEn: 'Hat Yai Hospital',
    province: 'สงขลา',
    region: 'South',
    lat: 7.0147,
    lng: 100.4686,
    aliases: ['รพ.หาดใหญ่', 'หาดใหญ่', 'hat yai', 'hatyai'],
    type: 'Public Tertiary'
  },
  {
    id: 'hosp-vachira-phuket',
    name: 'โรงพยาบาลวชิระภูเก็ต',
    nameEn: 'Vachira Phuket Hospital',
    province: 'ภูเก็ต',
    region: 'South',
    lat: 7.8967,
    lng: 98.3844,
    aliases: ['วชิระภูเก็ต', 'รพ.ภูเก็ต', 'ภูเก็ต', 'phuket', 'vachira phuket'],
    type: 'Public Tertiary'
  },
  {
    id: 'hosp-surat-thani',
    name: 'โรงพยาบาลสุราษฎร์ธานี',
    nameEn: 'Surat Thani Hospital',
    province: 'สุราษฎร์ธานี',
    region: 'South',
    lat: 9.1239,
    lng: 99.3197,
    aliases: ['รพ.สุราษฎร์ธานี', 'สุราษฎร์ธานี', 'surat thani', 'surat'],
    type: 'Public Tertiary'
  },
  {
    id: 'hosp-thaksin',
    name: 'โรงพยาบาลทักษิณ',
    nameEn: 'Thaksin Hospital',
    province: 'สุราษฎร์ธานี',
    region: 'South',
    lat: 9.1417,
    lng: 99.3333,
    aliases: ['ทักษิณ', 'รพ.ทักษิณ', 'thaksin', 'thaksin hospital'],
    type: 'Private'
  },
  {
    id: 'hosp-nakhon-si-thammarat',
    name: 'โรงพยาบาลมหาราชนครศรีธรรมราช',
    nameEn: 'Maharaj Nakhon Si Thammarat Hospital',
    province: 'นครศรีธรรมราช',
    region: 'South',
    lat: 8.4117,
    lng: 99.9650,
    aliases: ['มหาราชนครศรีธรรมราช', 'รพ.นครศรีธรรมราช', 'นครศรีธรรมราช', 'nakhon si thammarat'],
    type: 'Public Tertiary'
  },
  {
    id: 'hosp-trang',
    name: 'โรงพยาบาลตรัง',
    nameEn: 'Trang Hospital',
    province: 'ตรัง',
    region: 'South',
    lat: 7.5583,
    lng: 99.6108,
    aliases: ['รพ.ตรัง', 'ตรัง', 'trang'],
    type: 'Public Tertiary'
  },
  {
    id: 'hosp-krabi',
    name: 'โรงพยาบาลกระบี่',
    nameEn: 'Krabi Hospital',
    province: 'กระบี่',
    region: 'South',
    lat: 8.0725,
    lng: 98.9100,
    aliases: ['รพ.กระบี่', 'กระบี่', 'krabi'],
    type: 'Public Tertiary'
  },
  {
    id: 'hosp-chumphon',
    name: 'โรงพยาบาลชุมพรเขตรอุดมศักดิ์',
    nameEn: 'Chumphon Khet Udomsak Hospital',
    province: 'ชุมพร',
    region: 'South',
    lat: 10.4939,
    lng: 99.1764,
    aliases: ['ชุมพรเขตรอุดมศักดิ์', 'รพ.ชุมพร', 'ชุมพร', 'chumphon'],
    type: 'Public Tertiary'
  },
  {
    id: 'hosp-yala',
    name: 'โรงพยาบาลยะลา',
    nameEn: 'Yala Hospital',
    province: 'ยะลา',
    region: 'South',
    lat: 6.5414,
    lng: 101.2828,
    aliases: ['รพ.ยะลา', 'ยะลา', 'yala'],
    type: 'Public Tertiary'
  },
  {
    id: 'hosp-pattani',
    name: 'โรงพยาบาลปัตตานี',
    nameEn: 'Pattani Hospital',
    province: 'ปัตตานี',
    region: 'South',
    lat: 6.8683,
    lng: 101.2508,
    aliases: ['รพ.ปัตตานี', 'ปัตตานี', 'pattani'],
    type: 'Public Tertiary'
  },
  {
    id: 'hosp-narathiwat',
    name: 'โรงพยาบาลนราธิวาสราชนครินทร์',
    nameEn: 'Naradhiwas Rajanagarindra Hospital',
    province: 'นราธิวาส',
    region: 'South',
    lat: 6.4258,
    lng: 101.8239,
    aliases: ['นราธิวาสราชนครินทร์', 'รพ.นราธิวาส', 'นราธิวาส', 'narathiwat'],
    type: 'Public Tertiary'
  },
  {
    id: 'hosp-phatthalung',
    name: 'โรงพยาบาลพัทลุง',
    nameEn: 'Phatthalung Hospital',
    province: 'พัทลุง',
    region: 'South',
    lat: 7.6186,
    lng: 100.0767,
    aliases: ['รพ.พัทลุง', 'พัทลุง', 'phatthalung'],
    type: 'Public General'
  },
  {
    id: 'hosp-satun',
    name: 'โรงพยาบาลสตูล',
    nameEn: 'Satun Hospital',
    province: 'สตูล',
    region: 'South',
    lat: 6.6189,
    lng: 100.0658,
    aliases: ['รพ.สตูล', 'สตูล', 'satun'],
    type: 'Public General'
  },
  {
    id: 'hosp-phangnga',
    name: 'โรงพยาบาลพังงา',
    nameEn: 'Phang Nga Hospital',
    province: 'พังงา',
    region: 'South',
    lat: 8.4489,
    lng: 98.5283,
    aliases: ['รพ.พังงา', 'พังงา', 'phangnga'],
    type: 'Public General'
  },
  {
    id: 'hosp-ranong',
    name: 'โรงพยาบาลระนอง',
    nameEn: 'Ranong Hospital',
    province: 'ระนอง',
    region: 'South',
    lat: 9.9639,
    lng: 98.6367,
    aliases: ['รพ.ระนอง', 'ระนอง', 'ranong'],
    type: 'Public General'
  },
  {
    id: 'hosp-bangkok-phuket',
    name: 'โรงพยาบาลกรุงเทพภูเก็ต',
    nameEn: 'Bangkok Hospital Phuket',
    province: 'ภูเก็ต',
    region: 'South',
    lat: 7.8978,
    lng: 98.3686,
    aliases: ['กรุงเทพภูเก็ต', 'bangkok hospital phuket'],
    type: 'Private'
  },
  {
    id: 'hosp-bangkok-hatyai',
    name: 'โรงพยาบาลกรุงเทพหาดใหญ่',
    nameEn: 'Bangkok Hospital Hat Yai',
    province: 'สงขลา',
    region: 'South',
    lat: 7.0097,
    lng: 100.4853,
    aliases: ['กรุงเทพหาดใหญ่', 'bangkok hospital hatyai'],
    type: 'Private'
  }
];

// Province to standard coordinates & region lookup (Supports Thai, English, and major districts)
export interface ProvinceCoordinateInfo {
  lat: number;
  lng: number;
  region: HospitalLocation['region'];
  provinceTh?: string;
}

export const PROVINCE_COORDINATES: Record<string, ProvinceCoordinateInfo> = {
  // Central & Bangkok Metropolitan
  'กรุงเทพมหานคร': { lat: 13.7563, lng: 100.5018, region: 'Central', provinceTh: 'กรุงเทพมหานคร' },
  'กรุงเทพ': { lat: 13.7563, lng: 100.5018, region: 'Central', provinceTh: 'กรุงเทพมหานคร' },
  'bangkok': { lat: 13.7563, lng: 100.5018, region: 'Central', provinceTh: 'กรุงเทพมหานคร' },
  'bkk': { lat: 13.7563, lng: 100.5018, region: 'Central', provinceTh: 'กรุงเทพมหานคร' },
  'นนทบุรี': { lat: 13.8591, lng: 100.5217, region: 'Central', provinceTh: 'นนทบุรี' },
  'nonthaburi': { lat: 13.8591, lng: 100.5217, region: 'Central', provinceTh: 'นนทบุรี' },
  'ปทุมธานี': { lat: 14.0208, lng: 100.5250, region: 'Central', provinceTh: 'ปทุมธานี' },
  'pathum thani': { lat: 14.0208, lng: 100.5250, region: 'Central', provinceTh: 'ปทุมธานี' },
  'pathumthani': { lat: 14.0208, lng: 100.5250, region: 'Central', provinceTh: 'ปทุมธานี' },
  'รังสิต': { lat: 13.9892, lng: 100.6178, region: 'Central', provinceTh: 'ปทุมธานี' },
  'rangsit': { lat: 13.9892, lng: 100.6178, region: 'Central', provinceTh: 'ปทุมธานี' },
  'สมุทรปราการ': { lat: 13.5991, lng: 100.5967, region: 'Central', provinceTh: 'สมุทรปราการ' },
  'samut prakan': { lat: 13.5991, lng: 100.5967, region: 'Central', provinceTh: 'สมุทรปราการ' },
  'samutprakan': { lat: 13.5991, lng: 100.5967, region: 'Central', provinceTh: 'สมุทรปราการ' },
  'สมุทรสาคร': { lat: 13.5475, lng: 100.2742, region: 'Central', provinceTh: 'สมุทรสาคร' },
  'samut sakhon': { lat: 13.5475, lng: 100.2742, region: 'Central', provinceTh: 'สมุทรสาคร' },
  'samutsakhon': { lat: 13.5475, lng: 100.2742, region: 'Central', provinceTh: 'สมุทรสาคร' },
  'สมุทรสงคราม': { lat: 13.4111, lng: 99.9989, region: 'Central', provinceTh: 'สมุทรสงคราม' },
  'samut songkhram': { lat: 13.4111, lng: 99.9989, region: 'Central', provinceTh: 'สมุทรสงคราม' },
  'samutsongkhram': { lat: 13.4111, lng: 99.9989, region: 'Central', provinceTh: 'สมุทรสงคราม' },
  'นครปฐม': { lat: 13.8196, lng: 100.0601, region: 'Central', provinceTh: 'นครปฐม' },
  'nakhon pathom': { lat: 13.8196, lng: 100.0601, region: 'Central', provinceTh: 'นครปฐม' },
  'nakhonpathom': { lat: 13.8196, lng: 100.0601, region: 'Central', provinceTh: 'นครปฐม' },
  'พระนครศรีอยุธยา': { lat: 14.3532, lng: 100.5684, region: 'Central', provinceTh: 'พระนครศรีอยุธยา' },
  'อยุธยา': { lat: 14.3532, lng: 100.5684, region: 'Central', provinceTh: 'พระนครศรีอยุธยา' },
  'ayutthaya': { lat: 14.3532, lng: 100.5684, region: 'Central', provinceTh: 'พระนครศรีอยุธยา' },
  'อ่างทอง': { lat: 14.5889, lng: 100.4578, region: 'Central', provinceTh: 'อ่างทอง' },
  'ang thong': { lat: 14.5889, lng: 100.4578, region: 'Central', provinceTh: 'อ่างทอง' },
  'angthong': { lat: 14.5889, lng: 100.4578, region: 'Central', provinceTh: 'อ่างทอง' },
  'สิงห์บุรี': { lat: 14.8906, lng: 100.3986, region: 'Central', provinceTh: 'สิงห์บุรี' },
  'sing buri': { lat: 14.8906, lng: 100.3986, region: 'Central', provinceTh: 'สิงห์บุรี' },
  'singburi': { lat: 14.8906, lng: 100.3986, region: 'Central', provinceTh: 'สิงห์บุรี' },
  'ชัยนาท': { lat: 15.1856, lng: 100.1283, region: 'Central', provinceTh: 'ชัยนาท' },
  'chainat': { lat: 15.1856, lng: 100.1283, region: 'Central', provinceTh: 'ชัยนาท' },
  'chai nat': { lat: 15.1856, lng: 100.1283, region: 'Central', provinceTh: 'ชัยนาท' },
  'ลพบุรี': { lat: 14.8083, lng: 100.6653, region: 'Central', provinceTh: 'ลพบุรี' },
  'lopburi': { lat: 14.8083, lng: 100.6653, region: 'Central', provinceTh: 'ลพบุรี' },
  'lop buri': { lat: 14.8083, lng: 100.6653, region: 'Central', provinceTh: 'ลพบุรี' },
  'สระบุรี': { lat: 14.5264, lng: 100.9169, region: 'Central', provinceTh: 'สระบุรี' },
  'saraburi': { lat: 14.5264, lng: 100.9169, region: 'Central', provinceTh: 'สระบุรี' },
  'นครนายก': { lat: 14.2069, lng: 101.2131, region: 'Central', provinceTh: 'นครนายก' },
  'nakhon nayok': { lat: 14.2069, lng: 101.2131, region: 'Central', provinceTh: 'นครนายก' },
  'สุพรรณบุรี': { lat: 14.4744, lng: 100.1178, region: 'Central', provinceTh: 'สุพรรณบุรี' },
  'suphan buri': { lat: 14.4744, lng: 100.1178, region: 'Central', provinceTh: 'สุพรรณบุรี' },
  'suphanburi': { lat: 14.4744, lng: 100.1178, region: 'Central', provinceTh: 'สุพรรณบุรี' },
  'นครสวรรค์': { lat: 15.6989, lng: 100.1267, region: 'Central', provinceTh: 'นครสวรรค์' },
  'nakhon sawan': { lat: 15.6989, lng: 100.1267, region: 'Central', provinceTh: 'นครสวรรค์' },
  'nakhonsawan': { lat: 15.6989, lng: 100.1267, region: 'Central', provinceTh: 'นครสวรรค์' },
  'อุทัยธานี': { lat: 15.3800, lng: 100.0272, region: 'Central', provinceTh: 'อุทัยธานี' },
  'uthai thani': { lat: 15.3800, lng: 100.0272, region: 'Central', provinceTh: 'อุทัยธานี' },

  // North
  'แม่สอด': { lat: 16.7167, lng: 98.5744, region: 'North', provinceTh: 'ตาก' },
  'mae sot': { lat: 16.7167, lng: 98.5744, region: 'North', provinceTh: 'ตาก' },
  'maesot': { lat: 16.7167, lng: 98.5744, region: 'North', provinceTh: 'ตาก' },
  'measot': { lat: 16.7167, lng: 98.5744, region: 'North', provinceTh: 'ตาก' },
  'ตาก': { lat: 16.8833, lng: 99.1239, region: 'North', provinceTh: 'ตาก' },
  'tak': { lat: 16.8833, lng: 99.1239, region: 'North', provinceTh: 'ตาก' },
  'จอมทอง': { lat: 18.4239, lng: 98.6811, region: 'North', provinceTh: 'เชียงใหม่' },
  'chomthong': { lat: 18.4239, lng: 98.6811, region: 'North', provinceTh: 'เชียงใหม่' },
  'chom thong': { lat: 18.4239, lng: 98.6811, region: 'North', provinceTh: 'เชียงใหม่' },
  'เชียงใหม่': { lat: 18.7883, lng: 98.9853, region: 'North', provinceTh: 'เชียงใหม่' },
  'chiang mai': { lat: 18.7883, lng: 98.9853, region: 'North', provinceTh: 'เชียงใหม่' },
  'chiangmai': { lat: 18.7883, lng: 98.9853, region: 'North', provinceTh: 'เชียงใหม่' },
  'เชียงราย': { lat: 19.9105, lng: 99.8406, region: 'North', provinceTh: 'เชียงราย' },
  'chiang rai': { lat: 19.9105, lng: 99.8406, region: 'North', provinceTh: 'เชียงราย' },
  'chiangrai': { lat: 19.9105, lng: 99.8406, region: 'North', provinceTh: 'เชียงราย' },
  'ลำปาง': { lat: 18.2917, lng: 99.5083, region: 'North', provinceTh: 'ลำปาง' },
  'lampang': { lat: 18.2917, lng: 99.5083, region: 'North', provinceTh: 'ลำปาง' },
  'ลำพูน': { lat: 18.5744, lng: 99.0069, region: 'North', provinceTh: 'ลำพูน' },
  'lamphun': { lat: 18.5744, lng: 99.0069, region: 'North', provinceTh: 'ลำพูน' },
  'แม่ฮ่องสอน': { lat: 19.3006, lng: 97.9656, region: 'North', provinceTh: 'แม่ฮ่องสอน' },
  'mae hong son': { lat: 19.3006, lng: 97.9656, region: 'North', provinceTh: 'แม่ฮ่องสอน' },
  'น่าน': { lat: 18.7850, lng: 100.7783, region: 'North', provinceTh: 'น่าน' },
  'nan': { lat: 18.7850, lng: 100.7783, region: 'North', provinceTh: 'น่าน' },
  'พะเยา': { lat: 19.1678, lng: 99.9022, region: 'North', provinceTh: 'พะเยา' },
  'phayao': { lat: 19.1678, lng: 99.9022, region: 'North', provinceTh: 'พะเยา' },
  'แพร่': { lat: 18.1436, lng: 100.1417, region: 'North', provinceTh: 'แพร่' },
  'phrae': { lat: 18.1436, lng: 100.1417, region: 'North', provinceTh: 'แพร่' },
  'อุตรดิตถ์': { lat: 17.6256, lng: 100.0983, region: 'North', provinceTh: 'อุตรดิตถ์' },
  'uttaradit': { lat: 17.6256, lng: 100.0983, region: 'North', provinceTh: 'อุตรดิตถ์' },
  'สุโขทัย': { lat: 17.0089, lng: 99.8244, region: 'North', provinceTh: 'สุโขทัย' },
  'sukhothai': { lat: 17.0089, lng: 99.8244, region: 'North', provinceTh: 'สุโขทัย' },
  'พิษณุโลก': { lat: 16.8156, lng: 100.2639, region: 'North', provinceTh: 'พิษณุโลก' },
  'phitsanulok': { lat: 16.8156, lng: 100.2639, region: 'North', provinceTh: 'พิษณุโลก' },
  'พิจิตร': { lat: 16.4417, lng: 100.3472, region: 'North', provinceTh: 'พิจิตร' },
  'phichit': { lat: 16.4417, lng: 100.3472, region: 'North', provinceTh: 'พิจิตร' },
  'เพชรบูรณ์': { lat: 16.4250, lng: 101.1583, region: 'North', provinceTh: 'เพชรบูรณ์' },
  'phetchabun': { lat: 16.4250, lng: 101.1583, region: 'North', provinceTh: 'เพชรบูรณ์' },

  // Isan (Northeastern)
  'ขอนแก่น': { lat: 16.4322, lng: 102.8236, region: 'Northeastern', provinceTh: 'ขอนแก่น' },
  'khon kaen': { lat: 16.4322, lng: 102.8236, region: 'Northeastern', provinceTh: 'ขอนแก่น' },
  'khonkaen': { lat: 16.4322, lng: 102.8236, region: 'Northeastern', provinceTh: 'ขอนแก่น' },
  'นครราชสีมา': { lat: 14.9799, lng: 102.0978, region: 'Northeastern', provinceTh: 'นครราชสีมา' },
  'โคราช': { lat: 14.9799, lng: 102.0978, region: 'Northeastern', provinceTh: 'นครราชสีมา' },
  'korat': { lat: 14.9799, lng: 102.0978, region: 'Northeastern', provinceTh: 'นครราชสีมา' },
  'nakhon ratchasima': { lat: 14.9799, lng: 102.0978, region: 'Northeastern', provinceTh: 'นครราชสีมา' },
  'อุดรธานี': { lat: 17.4103, lng: 102.7844, region: 'Northeastern', provinceTh: 'อุดรธานี' },
  'udon thani': { lat: 17.4103, lng: 102.7844, region: 'Northeastern', provinceTh: 'อุดรธานี' },
  'udon': { lat: 17.4103, lng: 102.7844, region: 'Northeastern', provinceTh: 'อุดรธานี' },
  'อุบลราชธานี': { lat: 15.2289, lng: 104.8583, region: 'Northeastern', provinceTh: 'อุบลราชธานี' },
  'ubon ratchathani': { lat: 15.2289, lng: 104.8583, region: 'Northeastern', provinceTh: 'อุบลราชธานี' },
  'ubon': { lat: 15.2289, lng: 104.8583, region: 'Northeastern', provinceTh: 'อุบลราชธานี' },
  'ร้อยเอ็ด': { lat: 16.0536, lng: 103.6550, region: 'Northeastern', provinceTh: 'ร้อยเอ็ด' },
  'roi et': { lat: 16.0536, lng: 103.6550, region: 'Northeastern', provinceTh: 'ร้อยเอ็ด' },
  'สุรินทร์': { lat: 14.8819, lng: 103.4936, region: 'Northeastern', provinceTh: 'สุรินทร์' },
  'surin': { lat: 14.8819, lng: 103.4936, region: 'Northeastern', provinceTh: 'สุรินทร์' },
  'บุรีรัมย์': { lat: 14.9950, lng: 103.1039, region: 'Northeastern', provinceTh: 'บุรีรัมย์' },
  'buriram': { lat: 14.9950, lng: 103.1039, region: 'Northeastern', provinceTh: 'บุรีรัมย์' },
  'ศรีสะเกษ': { lat: 15.1150, lng: 104.3256, region: 'Northeastern', provinceTh: 'ศรีสะเกษ' },
  'sisaket': { lat: 15.1150, lng: 104.3256, region: 'Northeastern', provinceTh: 'ศรีสะเกษ' },
  'สกลนคร': { lat: 17.1556, lng: 104.1486, region: 'Northeastern', provinceTh: 'สกลนคร' },
  'sakon nakhon': { lat: 17.1556, lng: 104.1486, region: 'Northeastern', provinceTh: 'สกลนคร' },
  'นครพนม': { lat: 17.3986, lng: 104.7833, region: 'Northeastern', provinceTh: 'นครพนม' },
  'nakhon phanom': { lat: 17.3986, lng: 104.7833, region: 'Northeastern', provinceTh: 'นครพนม' },
  'หนองคาย': { lat: 17.8789, lng: 102.7417, region: 'Northeastern', provinceTh: 'หนองคาย' },
  'nong khai': { lat: 17.8789, lng: 102.7417, region: 'Northeastern', provinceTh: 'หนองคาย' },
  'หนองบัวลำภู': { lat: 17.2036, lng: 102.4411, region: 'Northeastern', provinceTh: 'หนองบัวลำภู' },
  'nong bua lamphu': { lat: 17.2036, lng: 102.4411, region: 'Northeastern', provinceTh: 'หนองบัวลำภู' },
  'เลย': { lat: 17.4864, lng: 101.7283, region: 'Northeastern', provinceTh: 'เลย' },
  'loei': { lat: 17.4864, lng: 101.7283, region: 'Northeastern', provinceTh: 'เลย' },
  'กาฬสินธุ์': { lat: 16.4328, lng: 103.5067, region: 'Northeastern', provinceTh: 'กาฬสินธุ์' },
  'kalasin': { lat: 16.4328, lng: 103.5067, region: 'Northeastern', provinceTh: 'กาฬสินธุ์' },
  'กุฉินารายณ์': { lat: 16.5361, lng: 104.0531, region: 'Northeastern', provinceTh: 'กาฬสินธุ์' },
  'kuchinarai': { lat: 16.5361, lng: 104.0531, region: 'Northeastern', provinceTh: 'กาฬสินธุ์' },
  'มหาสารคาม': { lat: 16.1850, lng: 103.3006, region: 'Northeastern', provinceTh: 'มหาสารคาม' },
  'mahasarakham': { lat: 16.1850, lng: 103.3006, region: 'Northeastern', provinceTh: 'มหาสารคาม' },
  'ชัยภูมิ': { lat: 15.8064, lng: 102.0317, region: 'Northeastern', provinceTh: 'ชัยภูมิ' },
  'chaiyaphum': { lat: 15.8064, lng: 102.0317, region: 'Northeastern', provinceTh: 'ชัยภูมิ' },
  'ยโสธร': { lat: 15.7925, lng: 104.1450, region: 'Northeastern', provinceTh: 'ยโสธร' },
  'yasothon': { lat: 15.7925, lng: 104.1450, region: 'Northeastern', provinceTh: 'ยโสธร' },
  'อำนาจเจริญ': { lat: 15.8589, lng: 104.6297, region: 'Northeastern', provinceTh: 'อำนาจเจริญ' },
  'amnat charoen': { lat: 15.8589, lng: 104.6297, region: 'Northeastern', provinceTh: 'อำนาจเจริญ' },
  'มุกดาหาร': { lat: 16.5433, lng: 104.7233, region: 'Northeastern', provinceTh: 'มุกดาหาร' },
  'mukdahan': { lat: 16.5433, lng: 104.7233, region: 'Northeastern', provinceTh: 'มุกดาหาร' },
  'บึงกาฬ': { lat: 18.3619, lng: 103.6533, region: 'Northeastern', provinceTh: 'บึงกาฬ' },
  'bueng kan': { lat: 18.3619, lng: 103.6533, region: 'Northeastern', provinceTh: 'บึงกาฬ' },

  // Eastern
  'ศรีราชา': { lat: 13.1678, lng: 100.9236, region: 'Eastern', provinceTh: 'ชลบุรี' },
  'sriracha': { lat: 13.1678, lng: 100.9236, region: 'Eastern', provinceTh: 'ชลบุรี' },
  'si racha': { lat: 13.1678, lng: 100.9236, region: 'Eastern', provinceTh: 'ชลบุรี' },
  'สัตหีบ': { lat: 12.6975, lng: 100.9986, region: 'Eastern', provinceTh: 'ชลบุรี' },
  'sattahip': { lat: 12.6975, lng: 100.9986, region: 'Eastern', provinceTh: 'ชลบุรี' },
  'พัทยา': { lat: 12.9276, lng: 100.8771, region: 'Eastern', provinceTh: 'ชลบุรี' },
  'pattaya': { lat: 12.9276, lng: 100.8771, region: 'Eastern', provinceTh: 'ชลบุรี' },
  'ชลบุรี': { lat: 13.3611, lng: 100.9847, region: 'Eastern', provinceTh: 'ชลบุรี' },
  'chonburi': { lat: 13.3611, lng: 100.9847, region: 'Eastern', provinceTh: 'ชลบุรี' },
  'chon buri': { lat: 13.3611, lng: 100.9847, region: 'Eastern', provinceTh: 'ชลบุรี' },
  'ระยอง': { lat: 12.6819, lng: 101.2750, region: 'Eastern', provinceTh: 'ระยอง' },
  'rayong': { lat: 12.6819, lng: 101.2750, region: 'Eastern', provinceTh: 'ระยอง' },
  'จันทบุรี': { lat: 12.6083, lng: 102.1083, region: 'Eastern', provinceTh: 'จันทบุรี' },
  'chanthaburi': { lat: 12.6083, lng: 102.1083, region: 'Eastern', provinceTh: 'จันทบุรี' },
  'ตราด': { lat: 12.2436, lng: 102.5150, region: 'Eastern', provinceTh: 'ตราด' },
  'trat': { lat: 12.2436, lng: 102.5150, region: 'Eastern', provinceTh: 'ตราด' },
  'ฉะเชิงเทรา': { lat: 13.6869, lng: 101.0717, region: 'Eastern', provinceTh: 'ฉะเชิงเทรา' },
  'แปดริ้ว': { lat: 13.6869, lng: 101.0717, region: 'Eastern', provinceTh: 'ฉะเชิงเทรา' },
  'chachoengsao': { lat: 13.6869, lng: 101.0717, region: 'Eastern', provinceTh: 'ฉะเชิงเทรา' },
  'ปราจีนบุรี': { lat: 14.0533, lng: 101.3739, region: 'Eastern', provinceTh: 'ปราจีนบุรี' },
  'prachinburi': { lat: 14.0533, lng: 101.3739, region: 'Eastern', provinceTh: 'ปราจีนบุรี' },
  'สระแก้ว': { lat: 13.8183, lng: 102.0667, region: 'Eastern', provinceTh: 'สระแก้ว' },
  'sakaeo': { lat: 13.8183, lng: 102.0667, region: 'Eastern', provinceTh: 'สระแก้ว' },
  'sa kaeo': { lat: 13.8183, lng: 102.0667, region: 'Eastern', provinceTh: 'สระแก้ว' },

  // Western
  'ราชบุรี': { lat: 13.5386, lng: 99.8167, region: 'Western', provinceTh: 'ราชบุรี' },
  'ratchaburi': { lat: 13.5386, lng: 99.8167, region: 'Western', provinceTh: 'ราชบุรี' },
  'กาญจนบุรี': { lat: 14.0208, lng: 99.5392, region: 'Western', provinceTh: 'กาญจนบุรี' },
  'kanchanaburi': { lat: 14.0208, lng: 99.5392, region: 'Western', provinceTh: 'กาญจนบุรี' },
  'เพชรบุรี': { lat: 13.1119, lng: 99.9444, region: 'Western', provinceTh: 'เพชรบุรี' },
  'phetchaburi': { lat: 13.1119, lng: 99.9444, region: 'Western', provinceTh: 'เพชรบุรี' },
  'ประจวบคีรีขันธ์': { lat: 11.8089, lng: 99.7967, region: 'Western', provinceTh: 'ประจวบคีรีขันธ์' },
  'ประจวบ': { lat: 11.8089, lng: 99.7967, region: 'Western', provinceTh: 'ประจวบคีรีขันธ์' },
  'prachuap': { lat: 11.8089, lng: 99.7967, region: 'Western', provinceTh: 'ประจวบคีรีขันธ์' },
  'หัวหิน': { lat: 12.5684, lng: 99.9576, region: 'Western', provinceTh: 'ประจวบคีรีขันธ์' },
  'hua hin': { lat: 12.5684, lng: 99.9576, region: 'Western', provinceTh: 'ประจวบคีรีขันธ์' },
  'huahin': { lat: 12.5684, lng: 99.9576, region: 'Western', provinceTh: 'ประจวบคีรีขันธ์' },

  // Southern
  'หาดใหญ่': { lat: 7.0083, lng: 100.4767, region: 'South', provinceTh: 'สงขลา' },
  'hat yai': { lat: 7.0083, lng: 100.4767, region: 'South', provinceTh: 'สงขลา' },
  'hatyai': { lat: 7.0083, lng: 100.4767, region: 'South', provinceTh: 'สงขลา' },
  'สงขลา': { lat: 7.1897, lng: 100.5954, region: 'South', provinceTh: 'สงขลา' },
  'songkhla': { lat: 7.1897, lng: 100.5954, region: 'South', provinceTh: 'สงขลา' },
  'ภูเก็ต': { lat: 7.8804, lng: 98.3923, region: 'South', provinceTh: 'ภูเก็ต' },
  'phuket': { lat: 7.8804, lng: 98.3923, region: 'South', provinceTh: 'ภูเก็ต' },
  'สมุย': { lat: 9.5357, lng: 100.0633, region: 'South', provinceTh: 'สุราษฎร์ธานี' },
  'samui': { lat: 9.5357, lng: 100.0633, region: 'South', provinceTh: 'สุราษฎร์ธานี' },
  'สุราษฎร์ธานี': { lat: 9.1239, lng: 99.3197, region: 'South', provinceTh: 'สุราษฎร์ธานี' },
  'surat thani': { lat: 9.1239, lng: 99.3197, region: 'South', provinceTh: 'สุราษฎร์ธานี' },
  'surat': { lat: 9.1239, lng: 99.3197, region: 'South', provinceTh: 'สุราษฎร์ธานี' },
  'นครศรีธรรมราช': { lat: 8.4117, lng: 99.9650, region: 'South', provinceTh: 'นครศรีธรรมราช' },
  'nakhon si thammarat': { lat: 8.4117, lng: 99.9650, region: 'South', provinceTh: 'นครศรีธรรมราช' },
  'ตรัง': { lat: 7.5583, lng: 99.6108, region: 'South', provinceTh: 'ตรัง' },
  'trang': { lat: 7.5583, lng: 99.6108, region: 'South', provinceTh: 'ตรัง' },
  'กระบี่': { lat: 8.0725, lng: 98.9100, region: 'South', provinceTh: 'กระบี่' },
  'krabi': { lat: 8.0725, lng: 98.9100, region: 'South', provinceTh: 'กระบี่' },
  'ชุมพร': { lat: 10.4939, lng: 99.1764, region: 'South', provinceTh: 'ชุมพร' },
  'chumphon': { lat: 10.4939, lng: 99.1764, region: 'South', provinceTh: 'ชุมพร' },
  'พังงา': { lat: 8.4489, lng: 98.5283, region: 'South', provinceTh: 'พังงา' },
  'phang nga': { lat: 8.4489, lng: 98.5283, region: 'South', provinceTh: 'พังงา' },
  'phangnga': { lat: 8.4489, lng: 98.5283, region: 'South', provinceTh: 'พังงา' },
  'ระนอง': { lat: 9.9639, lng: 98.6367, region: 'South', provinceTh: 'ระนอง' },
  'ranong': { lat: 9.9639, lng: 98.6367, region: 'South', provinceTh: 'ระนอง' },
  'พัทลุง': { lat: 7.6186, lng: 100.0767, region: 'South', provinceTh: 'พัทลุง' },
  'phatthalung': { lat: 7.6186, lng: 100.0767, region: 'South', provinceTh: 'พัทลุง' },
  'สตูล': { lat: 6.6189, lng: 100.0658, region: 'South', provinceTh: 'สตูล' },
  'satun': { lat: 6.6189, lng: 100.0658, region: 'South', provinceTh: 'สตูล' },
  'ปัตตานี': { lat: 6.8683, lng: 101.2508, region: 'South', provinceTh: 'ปัตตานี' },
  'pattani': { lat: 6.8683, lng: 101.2508, region: 'South', provinceTh: 'ปัตตานี' },
  'ยะลา': { lat: 6.5414, lng: 101.2828, region: 'South', provinceTh: 'ยะลา' },
  'yala': { lat: 6.5414, lng: 101.2828, region: 'South', provinceTh: 'ยะลา' },
  'นราธิวาส': { lat: 6.4258, lng: 101.8239, region: 'South', provinceTh: 'นราธิวาส' },
  'narathiwat': { lat: 6.4258, lng: 101.8239, region: 'South', provinceTh: 'นราธิวาส' }
};

// Deterministic jitter helper to prevent multiple pins from overlapping exactly
function getHashOffset(str: string): { dLat: number; dLng: number } {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const factorX = ((hash % 100) / 100) - 0.5;
  const factorY = (((hash >> 8) % 100) / 100) - 0.5;
  return {
    dLat: factorX * 0.035, // ~3-4 km spread max
    dLng: factorY * 0.035
  };
}

// Helper to generate guaranteed collision-free unique IDs from hospital names
function generateUniqueHospitalSlug(prefix: string, name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
  }
  const clean = name
    .toLowerCase()
    .replace(/[^a-z0-9\u0E00-\u0E7F]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 45);
  return `${prefix}-${clean || 'hosp'}-${Math.abs(hash).toString(36)}`;
}

/**
 * Phonetic and spelling normalization for Thai hospital names
 */
export function normalizeHospitalSearchText(str: string): string {
  return str
    .toLowerCase()
    .replace(/measot/g, 'maesot')
    .replace(/mae\s*sot/g, 'maesot')
    .replace(/thammasart/g, 'thammasat')
    .replace(/somdej/g, 'somdet')
    .replace(/praputthalertla/g, 'phutthaloetla')
    .replace(/sakaeo/g, 'sakaeo')
    .replace(/crown\s*prince/g, 'yupparaj')
    .replace(/\b(hospital|hosp|centre|center|rph|รพ\.|โรงพยาบาล)\b/gi, '')
    .replace(/[^a-z0-9\u0E00-\u0E7F]/g, '')
    .trim();
}

/**
 * Smart Geocoding Resolver for Thailand Hospitals
 * Resolves hospital name + optional hint region to lat/lng and standard region
 */
export function resolveHospitalLocation(hospitalName: string, hintRegion?: string): HospitalLocation {
  const cleanName = hospitalName.trim();
  const lowerName = cleanName.toLowerCase();
  const normalizedInput = normalizeHospitalSearchText(cleanName);

  // 1. Direct and Alias Match in Database
  for (const h of THAILAND_HOSPITALS_DATABASE) {
    if (h.name.toLowerCase() === lowerName || (h.nameEn && h.nameEn.toLowerCase() === lowerName)) {
      return h;
    }
    if (h.aliases) {
      for (const a of h.aliases) {
        const lowerAlias = a.toLowerCase();
        if (lowerName === lowerAlias || lowerName.includes(lowerAlias) || lowerAlias.includes(lowerName)) {
          return h;
        }
      }
    }
  }

  // 2. Fuzzy / Phonetic Match against Database
  if (normalizedInput.length >= 3) {
    for (const h of THAILAND_HOSPITALS_DATABASE) {
      const normName = normalizeHospitalSearchText(h.name);
      const normEn = h.nameEn ? normalizeHospitalSearchText(h.nameEn) : '';
      if (
        (normName && (normName === normalizedInput || (normName.length >= 4 && (normalizedInput.includes(normName) || normName.includes(normalizedInput))))) ||
        (normEn && (normEn === normalizedInput || (normEn.length >= 4 && (normalizedInput.includes(normEn) || normEn.includes(normalizedInput)))))
      ) {
        return h;
      }
      if (h.aliases) {
        for (const a of h.aliases) {
          const normAlias = normalizeHospitalSearchText(a);
          if (normAlias && normAlias.length >= 4 && (normAlias === normalizedInput || normalizedInput.includes(normAlias) || normAlias.includes(normalizedInput))) {
            return h;
          }
        }
      }
    }
  }

  // 3. Check for province/district name in the hospital string (English or Thai)
  // Sort keys by length descending to match specific districts/towns first (e.g. 'mae sot' before 'tak')
  const sortedProvinceKeys = Object.keys(PROVINCE_COORDINATES).sort((a, b) => b.length - a.length);
  for (const provKey of sortedProvinceKeys) {
    const provLower = provKey.toLowerCase();
    if (lowerName.includes(provLower) || (normalizedInput.length >= 4 && normalizedInput.includes(provLower.replace(/[^a-z0-9\u0E00-\u0E7F]/g, '')))) {
      const info = PROVINCE_COORDINATES[provKey];
      const offset = getHashOffset(cleanName);
      return {
        id: generateUniqueHospitalSlug(`hosp-prov-${info.provinceTh || provKey}`, cleanName),
        name: cleanName,
        province: info.provinceTh || provKey,
        region: (hintRegion as HospitalLocation['region']) || info.region,
        lat: Number((info.lat + offset.dLat).toFixed(5)),
        lng: Number((info.lng + offset.dLng).toFixed(5)),
        type: 'Public General'
      };
    }
  }

  // 4. Fallback using hintRegion (from PM record)
  let regionKey: HospitalLocation['region'] = 'Central';
  if (hintRegion) {
    const norm = hintRegion.toLowerCase().trim();
    if (norm.includes('north') && !norm.includes('east')) regionKey = 'North';
    else if (norm.includes('northeast') || norm.includes('isan') || norm.includes('อีสาน')) regionKey = 'Northeastern';
    else if (norm.includes('south') || norm.includes('ใต้')) regionKey = 'South';
    else if (norm.includes('east') && !norm.includes('north')) regionKey = 'Eastern';
    else if (norm.includes('west') || norm.includes('ตก')) regionKey = 'Western';
    else regionKey = 'Central';
  }

  const regionInfo = THAILAND_REGIONS[regionKey] || THAILAND_REGIONS.Central;
  const offset = getHashOffset(cleanName);

  return {
    id: generateUniqueHospitalSlug('hosp-auto', cleanName),
    name: cleanName,
    province: regionKey === 'Central' ? 'กรุงเทพมหานคร' : regionInfo.nameTh,
    region: regionKey,
    lat: Number((regionInfo.center[0] + offset.dLat * 1.5).toFixed(5)),
    lng: Number((regionInfo.center[1] + offset.dLng * 1.5).toFixed(5)),
    type: 'Public General'
  };
}
