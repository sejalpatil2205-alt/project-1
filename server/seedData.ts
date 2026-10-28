import type { ButtonColorVariant, DailyMenu } from '../src/types.ts';

export interface SeedMessRecord {
  slug: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  name: string;
  category: string;
  monthlyPrice: number;
  halfMonthlyPrice: number;
  singlePlatePrice: number;
  rating: number;
  reviewCount: number;
  availableSeats: number;
  totalSeats: number;
  location: string;
  area: string;
  dietType: 'Pure Veg' | 'Veg & Non-Veg';
  tiffinDelivery: boolean;
  speciality: string;
  tags: string[];
  lunchTiming: string;
  dinnerTiming: string;
  buttonColor: ButtonColorVariant;
  imageKey: string;
  description: string;
  hygieneHighlights: string[];
  weeklyMenu: DailyMenu[];
  initialReviews: {
    studentName: string;
    rating: number;
    foodQualityRating: number;
    hygieneRating: number;
    comment: string;
    daysAgo: number;
  }[];
}

export const INITIAL_MESSES: SeedMessRecord[] = [
  {
    slug: 'annapurna-mess',
    ownerName: 'Smt. Sunita Kulkarni',
    ownerEmail: 'annapurna@messowner.in',
    ownerPhone: '9823011201',
    name: 'Annapurna Mess',
    category: 'POPULAR',
    monthlyPrice: 2800,
    halfMonthlyPrice: 1550,
    singlePlatePrice: 70,
    rating: 4.5,
    reviewCount: 86,
    availableSeats: 22,
    totalSeats: 60,
    location: 'Kawde Galli, Near Datta Mandir, Kasba Bawda, Kolhapur',
    area: 'Kasba Bawda',
    dietType: 'Pure Veg',
    tiffinDelivery: true,
    speciality: 'Bhakri, Pithla, Bharli Vangi, Rice',
    tags: ['Bharli Vangi', 'Traditional', 'Maharashtrian'],
    lunchTiming: '1:00 PM – 3:00 PM',
    dinnerTiming: '7:30 PM – 9:30 PM',
    buttonColor: 'orange',
    imageKey: 'pithla_bhakri',
    description:
      'Family-run Maharashtrian home mess loved by engineering and polytechnic students in Kasba Bawda. Known for hot hand-patted Jowar Bhakri, authentic Bharli Vangi with groundnut masala, and freshly tempered Pithla.',
    hygieneHighlights: ['RO Filtered Drinking Water', 'Freshly Ground Gharghuti Masala', 'Stainless Steel Thali Sterilization'],
    weeklyMenu: [
      { day: 'Monday', lunch: '3 Chapati, Bharli Vangi, Varan Bhat, Thecha, Salad', dinner: '2 Jowar Bhakri, Pithla, Jeera Rice, Papad' },
      { day: 'Tuesday', lunch: '3 Chapati, Matki Usal, Amti, Indrayani Rice, Pickle', dinner: '3 Chapati, Batata Rassa, Dal Tadka, Steamed Rice' },
      { day: 'Wednesday', lunch: '2 Bhakri / 3 Chapati, Zunka, Shengdana Chutney, Varan Bhat', dinner: '3 Chapati, Mix Veg Kurma, Masala Bhat, Taak' },
      { day: 'Thursday', lunch: '3 Chapati, Chavali Usal, Kadhi, Steamed Rice, Papad', dinner: '2 Jowar Bhakri, Baingan Bharta, Moong Dal, Rice' },
      { day: 'Friday', lunch: '3 Chapati,Paneer Peas Masala, Dal Fry, Jeera Rice', dinner: '3 Chapati, Cabbage Foogath, Amti, Rice, Koshimbir' },
      { day: 'Saturday', lunch: '2 Bhakri, Bharli Vangi, Pithla, Indrayani Rice, Thecha', dinner: 'Khichdi Kadhi, Batata Kaap, Roasted Papad, Sheera' },
      { day: 'Sunday', lunch: 'Special Feast: Masale Bhat, Puri / Chapati, Kurma, Gulab Jamun', dinner: 'Sunday Evening Holiday (Tiffin on prior notice)', special: 'Gulab Jamun & Masale Bhat' }
    ],
    initialReviews: [
      {
        studentName: 'Rohit Deshmukh (DYPCET CSE)',
        rating: 5,
        foodQualityRating: 5,
        hygieneRating: 5,
        comment: 'Their Saturday and Monday Bharli Vangi with hot Jowar Bhakri legitimately tastes like my mother’s kitchen. Zero stomach issues in 8 months.',
        daysAgo: 4
      },
      {
        studentName: 'Snehal Jadhav (B.Pharm)',
        rating: 4,
        foodQualityRating: 5,
        hygieneRating: 4,
        comment: 'Very clean dining hall right near Datta Mandir. Pithla and green chilli thecha are unbeatable at ₹2,800/month.',
        daysAgo: 11
      }
    ]
  },
  {
    slug: 'randive-mess',
    ownerName: 'Shri. Prakash Randive',
    ownerEmail: 'randive@messowner.in',
    ownerPhone: '9823011202',
    name: 'Randive Mess',
    category: 'BEST RATED',
    monthlyPrice: 3000,
    halfMonthlyPrice: 1650,
    singlePlatePrice: 80,
    rating: 4.5,
    reviewCount: 83,
    availableSeats: 24,
    totalSeats: 65,
    location: 'Randive Galli, Backside of College, Kasba Bawda, Kolhapur',
    area: 'Kasba Bawda',
    dietType: 'Veg & Non-Veg',
    tiffinDelivery: true,
    speciality: 'Kolhapuri Rassa, Chapati, Masala Bhat, Solkadhi',
    tags: ['Kolhapuri Rassa', 'Solkadhi', 'Maharashtrian'],
    lunchTiming: '12:30 PM – 2:45 PM',
    dinnerTiming: '7:30 PM – 9:30 PM',
    buttonColor: 'blue',
    imageKey: 'kolhapuri_thali',
    description:
      'Located right behind the college campus in Randive Galli so students can walk over during their lunch break in 3 minutes. Famous for authentic Kolhapuri kat-rassa, aromatic Masala Bhat, and cooling kokum Solkadhi.',
    hygieneHighlights: ['Separate Pure Veg & Non-Veg Utensils', '3-Minute Walk from Campus Backgate', 'RO Water & Ventilated Hall'],
    weeklyMenu: [
      { day: 'Monday', lunch: '3 Chapati, Veg Kolhapuri Rassa, Sukhi Bhaji, Rice, Solkadhi', dinner: '3 Chapati, Dal Tadka, Aloo Gobi, Jeera Rice' },
      { day: 'Tuesday', lunch: '3 Chapati, Black Chana Rassa, Beetroot Koshimbir, Varan Bhat', dinner: '2 Bhakri / 3 Chapati, Methi Besan, Amti, Rice' },
      { day: 'Wednesday', lunch: '3 Chapati, Veg Kurma / Optional Egg Thali, Masala Bhat, Solkadhi', dinner: '3 Chapati, Akkha Masoor, Onion Lemon Salad, Rice' },
      { day: 'Thursday', lunch: '3 Chapati, Green Moong Usal, Dahi Kadhi, Steamed Rice, Papad', dinner: '3 Chapati, Dodka Bhaji, Dal Fry, Indrayani Rice' },
      { day: 'Friday', lunch: '3 Chapati, Shev Bhaji, Koshimbir, Amti, Steamed Rice', dinner: '3 Chapati, Soyabean Masala, Jeera Rice, Taak' },
      { day: 'Saturday', lunch: '3 Chapati, Bharli Simla Mirchi, Varan Bhat, Roasted Papad', dinner: '2 Bhakri, Pithla, Masala Khichdi, Pickle' },
      { day: 'Sunday', lunch: 'Special Kolhapuri Feast: Chapati, Rassa, Masala Bhat, Solkadhi & Shrikhand', dinner: 'Light Dinner: Dal Khichdi & Papad (7:30 PM – 8:45 PM)', special: 'Shrikhand & Solkadhi' }
    ],
    initialReviews: [
      {
        studentName: 'Omkar Patil (Mech Final Yr)',
        rating: 5,
        foodQualityRating: 5,
        hygieneRating: 4,
        comment: 'Best location right behind college! You can finish your 1 PM lecture, eat hot chapatis and masala bhat, and make it back before 2 PM lab.',
        daysAgo: 3
      },
      {
        studentName: 'Prachi More (Civil Engg)',
        rating: 4,
        foodQualityRating: 5,
        hygieneRating: 5,
        comment: 'Separate veg counters are strictly maintained and their kokum solkadhi after lunch is super refreshing.',
        daysAgo: 9
      }
    ]
  },
  {
    slug: 'mahalaxmi-home-mess',
    ownerName: 'Smt.Vandana Chavan',
    ownerEmail: 'mahalaxmi@messowner.in',
    ownerPhone: '9823011203',
    name: 'Mahalaxmi Home Mess',
    category: 'BUDGET PICK',
    monthlyPrice: 2300,
    halfMonthlyPrice: 1250,
    singlePlatePrice: 60,
    rating: 4.1,
    reviewCount: 64,
    availableSeats: 18,
    totalSeats: 45,
    location: 'Line Bazaar, Near College Main Gate, Kasba Bawda, Kolhapur',
    area: 'Line Bazaar',
    dietType: 'Pure Veg',
    tiffinDelivery: false,
    speciality: 'Chapati, Dal Tadka, Batata Bhaji, Jeera Rice',
    tags: ['Budget Friendly', 'Gharghuti', 'Pure Veg'],
    lunchTiming: '12:30 PM – 2:30 PM',
    dinnerTiming: '7:30 PM – 9:15 PM',
    buttonColor: 'green',
    imageKey: 'varan_bhat',
    description:
      'The most pocket-friendly monthly mess near Kasba Bawda & Line Bazaar starting at ₹2,300/month. Light oil, balanced spices, and unlimited steamed rice for students living on a strict hostel budget.',
    hygieneHighlights: ['Low-Oil Homestyle Cooking', 'Unlimited Rice & Dal Refills', 'Monthly Rebate for Exam Holidays'],
    weeklyMenu: [
      { day: 'Monday', lunch: '3 Phulka Chapati, Batata Bhaji, Dal Tadka, Rice', dinner: '3 Chapati, Matki Rassa, Steamed Rice, Pickle' },
      { day: 'Tuesday', lunch: '3 Chapati, Cabbage Peas Bhaji, Varan Bhat, Papad', dinner: '3 Chapati, Chana Dal Tadka, Jeera Rice' },
      { day: 'Wednesday', lunch: '3 Chapati, Flower Tomato Sabzi, Amti, Rice', dinner: '2 Bhakri, Zunka, Varan Bhat, Onion' },
      { day: 'Thursday', lunch: '3 Chapati, Chavali Usal, Kadhi, Steamed Rice', dinner: '3 Chapati, Bhindi Fry, Moong Dal, Rice' },
      { day: 'Friday', lunch: '3 Chapati, Aloo Matar, Dal Fry, Jeera Rice', dinner: '3 Chapati, Mix Sprouts Usal, Steamed Rice' },
      { day: 'Saturday', lunch: '3 Chapati, Gawar Bhaji, Amti, Rice, Chutney', dinner: 'Moong Dal Khichdi, Kadhi, Batata Wafers' },
      { day: 'Sunday', lunch: 'Sunday Lunch: Puri Bhaji, Pulav, Boondi Raita, Pineapple Sheera', dinner: 'Sunday Evening Closed', special: 'Puri Bhaji & Sheera' }
    ],
    initialReviews: [
      {
        studentName: 'Sanket Kumbhar (FY Polytechnic)',
        rating: 4,
        foodQualityRating: 4,
        hygieneRating: 4,
        comment: 'At ₹2,300 a month for both lunch and dinner, nothing beats Mahalaxmi Mess. Simple, non-oily food every day.',
        daysAgo: 6
      }
    ]
  },
  {
    slug: 'sahyadri-bhojanalay',
    ownerName: 'Shri. Tanaji Sawant',
    ownerEmail: 'sahyadri@messowner.in',
    ownerPhone: '9823011204',
    name: 'Sahyadri Bhojanalay',
    category: 'HOMESTYLE',
    monthlyPrice: 2600,
    halfMonthlyPrice: 1450,
    singlePlatePrice: 65,
    rating: 4.3,
    reviewCount: 72,
    availableSeats: 15,
    totalSeats: 50,
    location: 'Shahu Market Road, Near Hanuman Mandir, Kasba Bawda, Kolhapur',
    area: 'Shahu Market Rd',
    dietType: 'Pure Veg',
    tiffinDelivery: true,
    speciality: 'Jowar Bhakri, Zunka, Matki Usal, Indrayani Rice',
    tags: ['Indrayani Rice', 'Jowar Bhakri', 'Homestyle'],
    lunchTiming: '1:00 PM – 3:00 PM',
    dinnerTiming: '8:00 PM – 9:45 PM',
    buttonColor: 'orange',
    imageKey: 'pithla_bhakri',
    description:
      'Authentic Western Maharashtra rural flavours featuring fragrant local Indrayani rice, sprouted Matki Usal, and crisp Jowar/Bajra Bhakri made live on the tawa during meal hours.',
    hygieneHighlights: ['Local Organic Indrayani Rice', 'Live Hot Bhakri Counter', 'Free Hostel Gate Dabba Drop'],
    weeklyMenu: [
      { day: 'Monday', lunch: '2 Jowar Bhakri, Matki Usal, Amti, Indrayani Rice', dinner: '3 Chapati, Zunka, Dal Fry, Rice' },
      { day: 'Tuesday', lunch: '3 Chapati, Bharli Vangi, Varan, Indrayani Rice, Thecha', dinner: '2 Bajra Bhakri, Shevga Rassa, Steamed Rice' },
      { day: 'Wednesday', lunch: '3 Chapati, Kala Vatana Usal, Kadhi, Indrayani Rice', dinner: '3 Chapati, Patodi Rassa, Jeera Rice' },
      { day: 'Thursday', lunch: '2 Jowar Bhakri, Pithla, Shengdana Chutney, Varan Bhat', dinner: '3 Chapati, Aloo Palak, Amti, Rice' },
      { day: 'Friday', lunch: '3 Chapati, Veg Maratha, Dal Tadka, Indrayani Rice', dinner: '3 Chapati, Methi Bhaji, Varan Bhat, Taak' },
      { day: 'Saturday', lunch: '2 Bhakri, Masoor Usal, Amti, Indrayani Rice, Papad', dinner: 'Masale Bhat, Dahi Koshimbir, Papad' },
      { day: 'Sunday', lunch: 'Special: Puran Poli, Katachi Amti, Kurdai, Indrayani Bhat', dinner: 'Sunday Evening Closed', special: 'Puran Poli & Katachi Amti' }
    ],
    initialReviews: [
      {
        studentName: 'rutuja_nalawade (Agri College)',
        rating: 5,
        foodQualityRating: 5,
        hygieneRating: 4,
        comment: 'They actually serve real sticky fragrant Indrayani rice instead of cheap ration rice! Sunday Puran Poli is amazing.',
        daysAgo: 8
      }
    ]
  },
  {
    slug: 'mauli-gharghuti-mess',
    ownerName: 'Smt. Ashwini Joshi',
    ownerEmail: 'mauli@messowner.in',
    ownerPhone: '9823011205',
    name: 'Mauli Gharghuti Mess',
    category: 'PURE VEG',
    monthlyPrice: 2500,
    halfMonthlyPrice: 1400,
    singlePlatePrice: 65,
    rating: 4.2,
    reviewCount: 59,
    availableSeats: 20,
    totalSeats: 40,
    location: 'Main Road, Near Govt Polytechnic Hostel, Kasba Bawda, Kolhapur',
    area: 'Polytechnic Area',
    dietType: 'Pure Veg',
    tiffinDelivery: true,
    speciality: 'Poli, Varan Bhat with Ghee, Kothimbir Vadi, Amti',
    tags: ['Pure Veg', 'Ghee Varan', 'Hygienic'],
    lunchTiming: '12:45 PM – 2:45 PM',
    dinnerTiming: '7:30 PM – 9:30 PM',
    buttonColor: 'green',
    imageKey: 'varan_bhat',
    description:
      'Spotlessly clean Brahmani-Gharghuti style pure vegetarian mess popular among hostel students seeking comforting Varan Bhat with pure tup (ghee), soft 3-layer polis, and crispy Kothimbir Vadi.',
    hygieneHighlights: ['100% Pure Vegetarian Kitchen', 'Homemade Tup on Varan Bhat', 'Small Batch Fresh Cooking'],
    weeklyMenu: [
      { day: 'Monday', lunch: '3 Soft Poli, Batata Kachrya, Tup Varan Bhat, Amti, Lonche', dinner: '3 Poli, Tomato Omelette (Besan), Dal, Rice' },
      { day: 'Tuesday', lunch: '3 Poli, Tendli Bhaji, Chinchechi Amti, Varan Bhat', dinner: '3 Poli, Moong Usal, Steamed Rice, Taak' },
      { day: 'Wednesday', lunch: '3 Poli, Kothimbir Vadi, Matki Usal, Tup Varan Bhat', dinner: '3 Poli, Dudhi Chana Dal, Jeera Rice' },
      { day: 'Thursday', lunch: '3 Poli, Pitla, Koshimbir, Amti, Steamed Rice', dinner: '3 Poli, Flower Vatana, Varan Bhat' },
      { day: 'Friday', lunch: '3 Poli, Aluchi Patal Bhaji, Tup Varan Bhat, Kurdai', dinner: '3 Poli,Paneer Bhurji Veg, Dal Fry, Rice' },
      { day: 'Saturday', lunch: '3 Poli, Bharli ढोबळी Mirchi, Amti, Varan Bhat', dinner: 'Sabudana Khichdi / Dal Khichdi, Dahi, Papad' },
      { day: 'Sunday', lunch: 'Special: Thalipeeth with Loni, Amti, Masale Bhat, Semiya Kheer', dinner: 'Sunday Evening Holiday', special: 'Kothimbir Vadi & Kheer' }
    ],
    initialReviews: [
      {
        studentName: 'Aditya Gokhale (ENTC SY)',
        rating: 4,
        foodQualityRating: 4,
        hygieneRating: 5,
        comment: 'Super hygienic kitchen—you can literally see how clean the cooking counter is. Their Wednesday Kothimbir Vadi is always a full house.',
        daysAgo: 5
      }
    ]
  },
  {
    slug: 'kolhapuri-tadka-mess',
    ownerName: 'Shri. Sangram Bhosale',
    ownerEmail: 'tadka@messowner.in',
    ownerPhone: '9823011206',
    name: 'Kolhapuri Tadka Mess',
    category: 'SPICY SPECIAL',
    monthlyPrice: 3200,
    halfMonthlyPrice: 1750,
    singlePlatePrice: 85,
    rating: 4.4,
    reviewCount: 91,
    availableSeats: 12,
    totalSeats: 55,
    location: 'Sugar Mill Corner, Bawda Main Road, Kasba Bawda, Kolhapur',
    area: 'Sugar Mill Corner',
    dietType: 'Veg & Non-Veg',
    tiffinDelivery: true,
    speciality: 'Akkha Masoor, Butter Chapati, Jeera Rice, Spiced Taak',
    tags: ['Akkha Masoor', 'Kolhapuri', 'Sunday Feast'],
    lunchTiming: '1:00 PM – 3:15 PM',
    dinnerTiming: '7:45 PM – 10:00 PM',
    buttonColor: 'blue',
    imageKey: 'akkha_masoor',
    description:
      'Known across Bawda Main Road for Friday night dhaba-style Akkha Masoor, smoky Kolhapuri Kandlasun Masala curries, and chilled masala Taak included with every afternoon meal.',
    hygieneHighlights: ['Daily Chilled Masala Taak Included', 'Late Dinner Timing till 10:00 PM', 'Authentic Kanda-Lasun Masala'],
    weeklyMenu: [
      { day: 'Monday', lunch: '3 Chapati, Veg Kolhapuri, Dal Fry, Jeera Rice, Taak', dinner: '3 Chapati, Soyabean Sukka, Rassa, Rice' },
      { day: 'Tuesday', lunch: '3 Chapati, Shev Tomato, Amti, Steamed Rice, Taak', dinner: '2 Bhakri, Lasooni Methi, Dal Tadka, Rice' },
      { day: 'Wednesday', lunch: '3 Chapati, Veg Tambada-Pandhara Rassa / Egg Curry, Masala Bhat', dinner: '3 Chapati, Kaju Matar Masala, Jeera Rice' },
      { day: 'Thursday', lunch: '3 Chapati, Chana Masala, Kadhi, Steamed Rice, Taak', dinner: '3 Chapati, Baingan Masala, Dal Fry, Rice' },
      { day: 'Friday', lunch: '3 Chapati, Mix Sprouts Kolhapuri, Varan Bhat, Taak', dinner: 'Special: Butter Chapati, Signature Akkha Masoor, Jeera Rice' },
      { day: 'Saturday', lunch: '3 Chapati, Alooawang Rassa, Dal, Steamed Rice, Taak', dinner: '3 Chapati, Paneer Kolhapuri, Pulav' },
      { day: 'Sunday', lunch: 'Grand Feast: Chapati, Special Thali, Solkadhi, Moong Dal Halwa', dinner: '8:00 PM – 9:30 PM: Veg Biryani & Raita', special: 'Friday Akkha Masoor & Sunday Biryani' }
    ],
    initialReviews: [
      {
        studentName: 'Nikhil Shinde (B.Tech AI/DS)',
        rating: 5,
        foodQualityRating: 5,
        hygieneRating: 4,
        comment: 'Open till 10 PM which is a lifesaver after coding club or gym. Friday night Akkha Masoor beats restaurant food easily.',
        daysAgo: 2
      }
    ]
  },
  {
    slug: 'rajaram-student-mess',
    ownerName: 'Shri. Mahesh Nikam',
    ownerEmail: 'rajaram@messowner.in',
    ownerPhone: '9823011207',
    name: 'Rajaram Student Mess',
    category: 'STUDENT FAV',
    monthlyPrice: 2400,
    halfMonthlyPrice: 1300,
    singlePlatePrice: 60,
    rating: 3.9,
    reviewCount: 47,
    availableSeats: 28,
    totalSeats: 70,
    location: 'Hostel Chowk, Rajarampuri Link Road, Kasba Bawda, Kolhapur',
    area: 'Hostel Chowk',
    dietType: 'Pure Veg',
    tiffinDelivery: false,
    speciality: 'Chapati, Chole Masala, Steamed Rice, Roasted Papad',
    tags: ['Unlimited Rice', 'Near Hostel', 'Affordable'],
    lunchTiming: '12:30 PM – 3:00 PM',
    dinnerTiming: '7:30 PM – 9:30 PM',
    buttonColor: 'orange',
    imageKey: 'akkha_masoor',
    description:
      'Spacious 70-seater student mess hall at Hostel Chowk with fast service, zero waiting lines, flexible guest coupons, and generous portions tailored for college athletes and hostellers.',
    hygieneHighlights: ['Spacious 70-Seat Ventilated Hall', 'Flexible 5-Day Leave Carryforward', 'Fast Counter Service'],
    weeklyMenu: [
      { day: 'Monday', lunch: '3 Chapati, Chole Masala, Dal Fry, Steamed Rice, Papad', dinner: '3 Chapati, Aloo Matar, Varan Bhat' },
      { day: 'Tuesday', lunch: '3 Chapati, Rajma Masala, Jeera Rice, Salad', dinner: '3 Chapati, Cabbage Sabzi, Dal Tadka, Rice' },
      { day: 'Wednesday', lunch: '3 Chapati, Matki Rassa, Sukhi Bhaji, Rice, Papad', dinner: '2 Bhakri, Pithla, Steamed Rice, Onion' },
      { day: 'Thursday', lunch: '3 Chapati, Kadhi Pakoda, Aloo Fry, Steamed Rice', dinner: '3 Chapati, Green Peas Masala, Dal, Rice' },
      { day: 'Friday', lunch: '3 Chapati, Soyabean Curry, Varan Bhat, Papad', dinner: '3 Chapati, Akkha Masoor, Jeera Rice' },
      { day: 'Saturday', lunch: '3 Chapati, Baingan Aloo, Amti, Steamed Rice', dinner: 'Veg Tawa Pulav, Raita, Roasted Papad' },
      { day: 'Sunday', lunch: 'Special: Chole Bhature / Chapati, Jeera Rice, Boondi Ladoo', dinner: 'Sunday Evening Closed', special: 'Chole Masala & Ladoo' }
    ],
    initialReviews: [
      {
        studentName: 'Tejas Mane (Hostel Block B)',
        rating: 4,
        foodQualityRating: 4,
        hygieneRating: 4,
        comment: 'Big hall with plenty of seats so our whole group of 8 friends can sit together. Good value at ₹2,400.',
        daysAgo: 14
      }
    ]
  },
  {
    slug: 'swad-gharcha-mess',
    ownerName: 'Smt. Madhuri Pawar',
    ownerEmail: 'swad@messowner.in',
    ownerPhone: '9823011208',
    name: 'Swad Gharcha Mess',
    category: 'HYGIENIC',
    monthlyPrice: 2700,
    halfMonthlyPrice: 1500,
    singlePlatePrice: 70,
    rating: 4.2,
    reviewCount: 54,
    availableSeats: 16,
    totalSeats: 45,
    location: 'Bhagwa Chowk, Behind Engineering College, Kasba Bawda, Kolhapur',
    area: 'Bhagwa Chowk',
    dietType: 'Pure Veg',
    tiffinDelivery: true,
    speciality: 'Bajra Bhakri, Shev Bhaji, Dahi Koshimbir, Masale Bhat',
    tags: ['Shev Bhaji', 'Clean Dining', 'Maharashtrian'],
    lunchTiming: '1:00 PM – 2:45 PM',
    dinnerTiming: '7:30 PM – 9:15 PM',
    buttonColor: 'blue',
    imageKey: 'sunday_feast',
    description:
      'Run by Smt. Madhuri Pawar and women’s self-help group near Bhagwa Chowk. Prized for fresh peanut-curd Dahi Koshimbir, spicy Khandeshi-Kolhapuri Shev Bhaji, and spotless tabletops.',
    hygieneHighlights: ['Women Self-Help Group Operated', 'Hairnet & Apron Kitchen Protocol', 'Fresh Curd Koshimbir Daily'],
    weeklyMenu: [
      { day: 'Monday', lunch: '3 Chapati, Shev Bhaji, Dahi Koshimbir, Varan Bhat', dinner: '2 Bajra Bhakri, Vangi Batata, Amti, Rice' },
      { day: 'Tuesday', lunch: '3 Chapati, Moong Sprouts Usal, Kadhi, Masale Bhat', dinner: '3 Chapati, Methi Pithla, Steamed Rice' },
      { day: 'Wednesday', lunch: '2 Bhakri, Bharli Mirchi, Dal Tadka, Rice, Koshimbir', dinner: '3 Chapati, Mix Veg Rassa, Jeera Rice' },
      { day: 'Thursday', lunch: '3 Chapati, Chavali Batata, Amti, Varan Bhat, Papad', dinner: '3 Chapati, Simla Besan, Moong Dal, Rice' },
      { day: 'Friday', lunch: '3 Chapati, Shev Bhaji, Dahi Koshimbir, Indrayani Rice', dinner: '2 Bajra Bhakri, Zunka, Masale Bhat' },
      { day: 'Saturday', lunch: '3 Chapati, Kala Chana Rassa, Varan Bhat, Chutney', dinner: 'Dal Khichdi with Tup, Roasted Papad, Pickle' },
      { day: 'Sunday', lunch: 'Sunday Feast: Thalipeeth, Shev Bhaji, Masale Bhat, Gulab Jamun', dinner: 'Sunday Evening Closed', special: 'Thalipeeth & Gulab Jamun' }
    ],
    initialReviews: [
      {
        studentName: 'Vaishnavi Kulkarni (CSE TY)',
        rating: 4,
        foodQualityRating: 4,
        hygieneRating: 5,
        comment: 'Most hygienic mess near Bhagwa Chowk! Their Dahi Koshimbir with crushed roasted peanuts makes every meal better.',
        daysAgo: 7
      }
    ]
  },
  {
    slug: 'shivneri-tiffin-mess',
    ownerName: 'Shri. Ganesh Gaikwad',
    ownerEmail: 'shivneri@messowner.in',
    ownerPhone: '9823011209',
    name: 'Shivneri Tiffin & Mess',
    category: 'TIFFIN + DINE',
    monthlyPrice: 2500,
    halfMonthlyPrice: 1350,
    singlePlatePrice: 65,
    rating: 4.0,
    reviewCount: 42,
    availableSeats: 19,
    totalSeats: 40,
    location: 'Ramanmala Road, Near Bus Stop, Kasba Bawda, Kolhapur',
    area: 'Ramanmala',
    dietType: 'Pure Veg',
    tiffinDelivery: true,
    speciality: 'Soft Phulka, Moong Dal, Cabbage Peas Bhaji, Curd Rice',
    tags: ['Dabba Delivery', 'Light Oil', 'Daily Tiffin'],
    lunchTiming: '12:15 PM – 2:30 PM',
    dinnerTiming: '7:15 PM – 9:15 PM',
    buttonColor: 'green',
    imageKey: 'varan_bhat',
    description:
      'Dual dine-in and insulated 4-compartment stainless steel dabba delivery across Ramanmala and Kasba Bawda rooms. Ideal during exam prep when students prefer eating in their study rooms.',
    hygieneHighlights: ['4-Tier Insulated Steel Dabba Service', 'On-Time 12:30 PM Room Delivery', 'Zero Soda or Artificial Colour'],
    weeklyMenu: [
      { day: 'Monday', lunch: '4 Soft Phulka, Cabbage Peas Bhaji, Moong Dal, Rice', dinner: '4 Phulka, Aloo Tomato Rassa, Curd Rice' },
      { day: 'Tuesday', lunch: '4 Phulka, Matki Usal, Amti, Steamed Rice, Salad', dinner: '4 Phulka, Bhindi Masala, Dal Fry, Rice' },
      { day: 'Wednesday', lunch: '4 Phulka, Paneer Matar, Varan Bhat, Papad', dinner: '4 Phulka, Lauki Chana Dal, Jeera Rice' },
      { day: 'Thursday', lunch: '4 Phulka, Chana Usal, Dahi Kadhi, Steamed Rice', dinner: '4 Phulka, Mix Veg Dry, Moong Dal, Curd Rice' },
      { day: 'Friday', lunch: '4 Phulka, Batata Rassa, Dal Tadka, Jeera Rice', dinner: '4 Phulka, Methi Aloo, Varan Bhat' },
      { day: 'Saturday', lunch: '4 Phulka, Gawar Sabzi, Amti, Steamed Rice', dinner: 'Vegetable Pulav, Boondi Raita, Papad' },
      { day: 'Sunday', lunch: 'Sunday Special: Puri, Aloo Kurma, Masala Rice, Fruit Custard', dinner: 'Sunday Evening Closed', special: 'Fruit Custard & Kurma' }
    ],
    initialReviews: [
      {
        studentName: 'Kiran Salunkhe (M.Tech)',
        rating: 4,
        foodQualityRating: 4,
        hygieneRating: 4,
        comment: 'Reliable tiffin delivery to Ramanmala rooms right on time at 12:30 PM. Phulkas stay soft even in the dabba.',
        daysAgo: 12
      }
    ]
  },
  {
    slug: 'panchganga-mess',
    ownerName: 'Shri. Dattatray Patil',
    ownerEmail: 'panchganga@messowner.in',
    ownerPhone: '9823011210',
    name: 'Panchganga Mess',
    category: 'SUNDAY FEAST',
    monthlyPrice: 2900,
    halfMonthlyPrice: 1600,
    singlePlatePrice: 75,
    rating: 3.9,
    reviewCount: 51,
    availableSeats: 14,
    totalSeats: 50,
    location: 'Panchganga Ghat Road, Near Bawda Naka, Kasba Bawda, Kolhapur',
    area: 'Bawda Naka',
    dietType: 'Pure Veg',
    tiffinDelivery: false,
    speciality: 'Thalipeeth, White Butter, Veg Rassa, Sunday Gulab Jamun',
    tags: ['Thalipeeth', 'Sweet Included', 'Traditional'],
    lunchTiming: '1:00 PM – 3:00 PM',
    dinnerTiming: '8:00 PM – 9:45 PM',
    buttonColor: 'orange',
    imageKey: 'sunday_feast',
    description:
      'Traditional Kolhapuri mess near Bawda Naka renowned for multigrain Bhajani Thalipeeth topped with homemade lonche & white butter (loni), plus two weekly sweet dishes included in the monthly pass.',
    hygieneHighlights: ['Homemade Multigrain Bhajani Flour', 'Fresh White Butter (Loni) Served', 'Twice-Weekly Sweet Dish'],
    weeklyMenu: [
      { day: 'Monday', lunch: '3 Chapati, Veg Rassa, Dry Batata, Varan Bhat', dinner: '2 Bhakri, Zunka, Amti, Steamed Rice' },
      { day: 'Tuesday', lunch: '3 Chapati, Kala Vatana Rassa, Jeera Rice, Papad', dinner: '3 Chapati, Flower Peas, Dal Fry, Rice' },
      { day: 'Wednesday', lunch: 'Special Midweek: 2 Bhajani Thalipeeth with Loni, Dahi, Pulav, Sheera', dinner: '3 Chapati, Matki Masala, Varan Bhat' },
      { day: 'Thursday', lunch: '3 Chapati, Bharli Vangi, Kadhi, Steamed Rice', dinner: '3 Chapati, Aloo Palak, Dal Tadka, Rice' },
      { day: 'Friday', lunch: '3 Chapati, Veg Kurma, Amti, Indrayani Rice, Salad', dinner: '2 Bhakri, Shev Bhaji, Steamed Rice' },
      { day: 'Saturday', lunch: '3 Chapati, Chavali Rassa, Varan Bhat, Roasted Papad', dinner: 'Moong Dal Khichdi, Papad, Koshimbir' },
      { day: 'Sunday', lunch: 'Grand Feast: Bhajani Thalipeeth, Loni, Veg Rassa, Rice & 2 Hot Gulab Jamuns', dinner: 'Sunday Evening Closed', special: 'Bhajani Thalipeeth & Gulab Jamun' }
    ],
    initialReviews: [
      {
        studentName: 'Saurabh Chougule (Architecture)',
        rating: 4,
        foodQualityRating: 4,
        hygieneRating: 4,
        comment: 'Wednesday and Sunday Bhajani Thalipeeth with fresh white loni is pure heaven. Totally worth subscribing.',
        daysAgo: 10
      }
    ]
  }
];
