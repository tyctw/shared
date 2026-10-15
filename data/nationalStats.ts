export const NATIONAL_TOTALS = {
    '113': 189168,
    '114': 172481,
    '115': 180180
};

// Percentages are recalculated from aggregated counts, rather than summed rounded subcategories.
export const NATIONAL_STATS = {
    '113': [
        { category: '5A', count: 17569, percentage: 9.29 },
        { category: '4A', count: 10386, percentage: 5.49 }, // 10355 + 31
        { category: '3A', count: 10403, percentage: 5.50 }, // 10313 + 90 + 0
        { category: '2A', count: 13636, percentage: 7.21 }, // 13281 + 338 + 17 + 0
        { category: '1A', count: 23177, percentage: 12.25 }, // 20787 + 2008 + 277 + 62 + 43
        { category: '0A', count: 113997, percentage: 60.26 } // 43042 + 22141 + 15122 + 11531 + 9640 + 12521
    ],
    '114': [
        { category: '5A', count: 16547, percentage: 9.59 },
        { category: '4A', count: 9576, percentage: 5.55 }, // 9553 + 23
        { category: '3A', count: 9991, percentage: 5.79 }, // 9922 + 69 + 0
        { category: '2A', count: 12562, percentage: 7.28 }, // 12237 + 318 + 7 + 0
        { category: '1A', count: 21949, percentage: 12.73 }, // 19528 + 1958 + 293 + 84 + 86
        { category: '0A', count: 101856, percentage: 59.05 } // 38479 + 19710 + 13987 + 10724 + 8957 + 9999
    ],
    '115': [
        { category: '5A', count: 16293, percentage: 9.04 },
        { category: '4A', count: 9832, percentage: 5.46 }, // 9801 + 31
        { category: '3A', count: 10030, percentage: 5.57 }, // 9940 + 89 + 1
        { category: '2A', count: 13063, percentage: 7.25 }, // 12694 + 361 + 6 + 2
        { category: '1A', count: 22869, percentage: 12.69 }, // 20332 + 2010 + 318 + 119 + 90
        { category: '0A', count: 108093, percentage: 59.99 } // 40598 + 20952 + 14524 + 11567 + 9962 + 10490
    ]
};


// These totals count candidates with valid results in all five subjects, not registrations.
export const NATIONAL_SOURCES = {
  '113': 'https://www.fljh.kh.edu.tw/upload/90/101_24789/113年國中教育會考各等級類別暨寫作測驗級分人數百分比統計表.pdf',
  '114': 'https://www.edu.tw/News_Content.aspx?n=9E7AC85F1954DDA8&s=B73FF73E0D38B561',
  '115': 'https://www.moe.gov.tw/News_Content.aspx?n=9E7AC85F1954DDA8&s=71C3D87BE3D56DE0',
} as const;
