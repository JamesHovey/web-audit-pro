/**
 * Industry-Specific Keyword Database
 * Comprehensive keyword sets organized by business type and service categories
 */

export interface ServiceKeywords {
  primary: string[];           // Direct service keywords
  secondary: string[];         // Related and variation keywords  
  longTail: string[];         // Specific problem/solution keywords
  commercial: string[];       // Buying intent keywords
  informational: string[];    // Research/learning keywords
  local: string[];           // Geographic modifiers
  urgency: string[];         // Time-sensitive keywords
}

export interface IndustryKeywords {
  [subcategory: string]: ServiceKeywords;
}

export const INDUSTRY_KEYWORD_DATABASE: { [industry: string]: IndustryKeywords } = {
  'Legal Services': {
    'Family Law': {
      primary: ['divorce', 'family law', 'family lawyer', 'family solicitor', 'child custody', 'separation', 'matrimonial'],
      secondary: ['divorce proceedings', 'custody arrangements', 'prenuptial agreement', 'postnuptial agreement', 'domestic relations', 'family mediation'],
      longTail: ['how to file for divorce', 'child custody rights', 'divorce settlement agreement', 'spousal support calculation', 'parental responsibility orders'],
      commercial: ['divorce lawyer cost', 'family law consultation', 'hire divorce attorney', 'family law fees', 'divorce legal advice'],
      informational: ['divorce process explained', 'child custody laws', 'divorce rights', 'family law guide', 'separation vs divorce'],
      local: ['family lawyer near me', 'local family solicitor', 'divorce lawyer in', 'family law firm', 'area family court'],
      urgency: ['emergency custody order', 'urgent family law', 'same day legal advice', 'emergency divorce lawyer', 'immediate legal help']
    },
    'Commercial Law': {
      primary: ['commercial law', 'business lawyer', 'corporate solicitor', 'contract law', 'commercial litigation', 'business disputes'],
      secondary: ['commercial contracts', 'business agreements', 'corporate governance', 'merger acquisition', 'partnership agreements', 'commercial property'],
      longTail: ['business contract review', 'commercial lease agreement', 'partnership dispute resolution', 'company formation legal advice', 'intellectual property protection'],
      commercial: ['commercial lawyer fees', 'business law consultation', 'corporate legal services', 'commercial law advice cost', 'business lawyer rates'],
      informational: ['commercial law basics', 'business legal requirements', 'contract law explained', 'corporate compliance guide', 'business dispute resolution'],
      local: ['commercial lawyer near me', 'business solicitor in', 'local corporate lawyer', 'commercial law firm', 'business legal advisor'],
      urgency: ['urgent commercial dispute', 'emergency business lawyer', 'immediate contract review', 'urgent legal injunction', 'emergency corporate advice']
    },
    'Personal Injury': {
      primary: ['personal injury', 'accident lawyer', 'compensation claim', 'injury solicitor', 'accident compensation', 'injury claim'],
      secondary: ['road traffic accident', 'workplace injury', 'medical negligence', 'slip and fall', 'whiplash claim', 'injury damages'],
      longTail: ['car accident compensation claim', 'workplace injury compensation', 'medical malpractice lawsuit', 'slip and fall injury claim', 'whiplash injury settlement'],
      commercial: ['no win no fee', 'personal injury lawyer cost', 'accident claim solicitor', 'injury compensation calculator', 'free injury consultation'],
      informational: ['personal injury law', 'accident claim process', 'injury compensation guide', 'how to claim compensation', 'personal injury rights'],
      local: ['accident lawyer near me', 'personal injury solicitor in', 'local injury lawyer', 'accident claim firm', 'injury compensation specialist'],
      urgency: ['urgent injury claim', 'immediate legal advice', 'emergency accident lawyer', 'urgent compensation claim', 'same day injury consultation']
    },
    'Property Law': {
      primary: ['conveyancing', 'property lawyer', 'property solicitor', 'residential conveyancing', 'commercial conveyancing', 'property law'],
      secondary: ['house purchase', 'property sale', 'lease agreements', 'property disputes', 'landlord tenant', 'property contracts'],
      longTail: ['house buying legal advice', 'property purchase solicitor', 'commercial property lease', 'landlord tenant dispute', 'property boundary disputes'],
      commercial: ['conveyancing quote', 'property lawyer fees', 'conveyancing cost', 'property legal services', 'conveyancing solicitor price'],
      informational: ['conveyancing process', 'property buying guide', 'property law explained', 'lease agreement guide', 'property rights'],
      local: ['conveyancing solicitor near me', 'local property lawyer', 'conveyancing in', 'property solicitor', 'area conveyancing firm'],
      urgency: ['urgent conveyancing', 'fast property sale', 'emergency property advice', 'urgent lease agreement', 'immediate property help']
    }
  },

  'Food Processing & Equipment': {
    'Chocolate Equipment': {
      primary: ['chocolate machines', 'chocolate equipment', 'chocolate tempering', 'chocolate processing', 'chocolate moulds', 'chocolate machinery'],
      secondary: ['tempering machines', 'chocolate melting tanks', 'conching machines', 'chocolate deposits', 'enrobing machines', 'cooling tunnels'],
      longTail: ['commercial chocolate tempering machine', 'chocolate processing equipment supplier', 'industrial chocolate manufacturing equipment', 'chocolate moulding machinery', 'chocolate enrobing line equipment'],
      commercial: ['chocolate equipment price', 'chocolate machine cost', 'tempering machine hire', 'chocolate equipment finance', 'chocolate machinery quotes'],
      informational: ['chocolate tempering process', 'chocolate equipment guide', 'how chocolate machines work', 'chocolate processing methods', 'chocolate manufacturing equipment'],
      local: ['chocolate equipment supplier UK', 'chocolate machines near me', 'UK chocolate processing equipment', 'chocolate machinery suppliers', 'local chocolate equipment'],
      urgency: ['urgent chocolate equipment repair', 'emergency chocolate machine service', 'immediate chocolate equipment', 'same day chocolate machinery', 'chocolate equipment breakdown']
    },
    'Food Processing Equipment': {
      primary: ['food processing equipment', 'food machinery', 'commercial food equipment', 'food manufacturing equipment', 'processing machinery', 'food production equipment'],
      secondary: ['mixing equipment', 'packaging machinery', 'food preparation equipment', 'industrial food processors', 'food handling equipment', 'production line equipment'],
      longTail: ['commercial food processing machinery', 'industrial food manufacturing equipment', 'food production line machinery', 'automated food processing systems', 'food packaging equipment suppliers'],
      commercial: ['food equipment prices', 'machinery costs', 'processing equipment quotes', 'food machinery finance', 'equipment leasing options'],
      informational: ['food processing equipment guide', 'machinery specifications', 'equipment maintenance tips', 'food safety regulations', 'processing technology'],
      local: ['food equipment supplier UK', 'food machinery near me', 'local processing equipment', 'UK food machinery suppliers', 'regional equipment dealers'],
      urgency: ['emergency equipment repair', 'urgent machinery service', 'breakdown support', 'immediate equipment replacement', 'same day machinery repair']
    },
    'Nut Processing Equipment': {
      primary: ['nut butter machines', 'nut processing equipment', 'nut grinders', 'nut butter production', 'nut processing machinery', 'almond butter machines'],
      secondary: ['peanut butter machines', 'tahini machines', 'nut roasting equipment', 'nut packaging machinery', 'nut oil extraction', 'nut grinding systems'],
      longTail: ['commercial nut butter production equipment', 'industrial nut processing machinery', 'nut butter manufacturing systems', 'small batch nut butter machines', 'artisan nut butter equipment'],
      commercial: ['nut butter machine price', 'nut processing equipment cost', 'nut machinery quotes', 'nut equipment finance', 'nut processing machinery hire'],
      informational: ['nut butter production process', 'nut processing equipment guide', 'nut butter machine maintenance', 'nut processing technology', 'nut butter manufacturing'],
      local: ['nut processing equipment UK', 'nut butter machines near me', 'UK nut machinery suppliers', 'local nut processing equipment', 'nut equipment dealers'],
      urgency: ['urgent nut equipment repair', 'emergency nut machine service', 'immediate nut processing equipment', 'nut machinery breakdown', 'same day nut equipment']
    }
  },

  'Food & Hospitality': {
    'Restaurant': {
      primary: ['restaurant', 'dining', 'fine dining', 'casual dining', 'family restaurant', 'cuisine restaurant'],
      secondary: ['table booking', 'restaurant reservation', 'menu', 'chef specials', 'wine list', 'private dining'],
      longTail: ['best restaurant for special occasion', 'family friendly restaurant with kids menu', 'romantic dinner restaurant', 'business lunch venue', 'group dining restaurant'],
      commercial: ['restaurant booking', 'table reservation', 'restaurant menu prices', 'private dining cost', 'restaurant catering services'],
      informational: ['restaurant opening hours', 'restaurant reviews', 'menu options', 'dietary requirements', 'restaurant location'],
      local: ['restaurant near me', 'best restaurant in', 'local dining', 'area restaurants', 'nearby restaurants'],
      urgency: ['same day table booking', 'last minute reservation', 'urgent table booking', 'immediate dining', 'walk in restaurant']
    },
    'Catering': {
      primary: ['catering', 'catering services', 'event catering', 'wedding catering', 'corporate catering', 'catering company'],
      secondary: ['buffet catering', 'canape service', 'party catering', 'office catering', 'conference catering', 'outside catering'],
      longTail: ['wedding reception catering services', 'corporate event catering menu', 'party buffet catering', 'conference lunch catering', 'office meeting catering'],
      commercial: ['catering quote', 'catering prices', 'catering cost per person', 'catering package deals', 'catering service rates'],
      informational: ['catering menu options', 'catering services guide', 'event catering planning', 'catering dietary requirements', 'catering for events'],
      local: ['catering services near me', 'local caterer', 'catering company in', 'area catering services', 'nearby catering'],
      urgency: ['last minute catering', 'urgent catering services', 'emergency catering', 'same day catering', 'immediate catering help']
    },
    'Hotel': {
      primary: ['hotel', 'accommodation', 'hotel booking', 'hotel rooms', 'business hotel', 'boutique hotel'],
      secondary: ['hotel reservation', 'conference facilities', 'wedding venue', 'spa services', 'room service', 'hotel amenities'],
      longTail: ['business hotel with conference rooms', 'wedding venue with accommodation', 'hotel with spa facilities', 'family hotel with connecting rooms', 'pet friendly hotel accommodation'],
      commercial: ['hotel rates', 'room booking prices', 'hotel package deals', 'conference room hire', 'wedding venue cost'],
      informational: ['hotel facilities', 'room types', 'hotel services', 'conference facilities', 'hotel location'],
      local: ['hotel near me', 'local hotel', 'hotel in', 'area accommodation', 'nearby hotels'],
      urgency: ['same day hotel booking', 'last minute accommodation', 'urgent hotel reservation', 'immediate room booking', 'emergency accommodation']
    }
  },

  'Architecture & Design': {
    'Residential Architecture': {
      primary: ['architect', 'residential architect', 'house design', 'home extension', 'house plans', 'architectural design'],
      secondary: ['planning permission', 'building regulations', 'house renovation', 'loft conversion', 'conservatory design', 'kitchen extension'],
      longTail: ['house extension planning permission', 'residential architect for home renovation', 'contemporary house design', 'sustainable home design', 'listed building renovation architect'],
      commercial: ['architect fees', 'architectural design cost', 'house extension price', 'planning permission cost', 'architectural consultation'],
      informational: ['architectural design process', 'planning permission guide', 'building regulations explained', 'house extension ideas', 'architectural styles'],
      local: ['architect near me', 'local residential architect', 'architect in', 'area architectural services', 'local building design'],
      urgency: ['urgent architectural advice', 'emergency building survey', 'urgent planning application', 'immediate architectural help', 'fast track design']
    },
    'Commercial Architecture': {
      primary: ['commercial architect', 'office design', 'retail design', 'commercial building', 'workplace design', 'commercial architecture'],
      secondary: ['office refurbishment', 'retail fit out', 'commercial renovation', 'industrial design', 'hospitality design', 'commercial interiors'],
      longTail: ['office space design and fit out', 'retail store design services', 'commercial building renovation', 'restaurant interior design', 'warehouse conversion architect'],
      commercial: ['commercial architect fees', 'office design cost', 'retail fit out price', 'commercial design consultation', 'architectural project management'],
      informational: ['commercial design process', 'office design trends', 'retail design ideas', 'commercial building regulations', 'workplace design guide'],
      local: ['commercial architect near me', 'local office design', 'commercial designer in', 'area architectural firm', 'business design services'],
      urgency: ['urgent commercial design', 'fast track office fit out', 'emergency building assessment', 'immediate design consultation', 'urgent project delivery']
    }
  },

  'Healthcare & Medical': {
    'General Practice': {
      primary: ['doctor', 'gp', 'general practitioner', 'medical practice', 'family doctor', 'primary care'],
      secondary: ['medical consultation', 'health check', 'prescription', 'medical advice', 'routine examination', 'health screening'],
      longTail: ['gp appointment booking', 'family doctor registration', 'private medical consultation', 'health check up appointment', 'medical prescription consultation'],
      commercial: ['private gp fees', 'medical consultation cost', 'health check price', 'private doctor appointment', 'medical examination cost'],
      informational: ['gp services', 'medical practice information', 'health check guide', 'medical consultation process', 'doctor appointment procedure'],
      local: ['doctor near me', 'local gp', 'medical practice in', 'family doctor', 'nearby medical centre'],
      urgency: ['urgent gp appointment', 'emergency doctor', 'same day medical consultation', 'urgent medical advice', 'immediate healthcare']
    },
    'Dental': {
      primary: ['dentist', 'dental practice', 'dental care', 'dental surgery', 'oral health', 'dental treatment'],
      secondary: ['dental check up', 'teeth cleaning', 'dental hygiene', 'cosmetic dentistry', 'dental implants', 'orthodontics'],
      longTail: ['dental check up and cleaning', 'cosmetic dentistry treatments', 'dental implant consultation', 'orthodontic treatment options', 'emergency dental care'],
      commercial: ['dental fees', 'dental treatment cost', 'dental check up price', 'cosmetic dentistry cost', 'dental implant price'],
      informational: ['dental care guide', 'oral health tips', 'dental treatment options', 'dental hygiene advice', 'dental services'],
      local: ['dentist near me', 'local dental practice', 'dentist in', 'area dental care', 'nearby dental surgery'],
      urgency: ['emergency dentist', 'urgent dental care', 'dental emergency', 'emergency tooth pain', 'immediate dental help']
    }
  },

  'Automotive': {
    'Car Repair': {
      primary: ['car repair', 'auto repair', 'garage', 'mechanic', 'car service', 'vehicle repair'],
      secondary: ['brake repair', 'engine repair', 'transmission repair', 'tyre fitting', 'exhaust repair', 'clutch repair'],
      longTail: ['car brake repair service', 'engine diagnostic and repair', 'automatic transmission repair', 'car tyre fitting service', 'exhaust system repair'],
      commercial: ['car repair cost', 'garage prices', 'auto repair quote', 'car service price', 'mechanic rates'],
      informational: ['car repair guide', 'auto maintenance tips', 'car service schedule', 'vehicle repair advice', 'garage services'],
      local: ['garage near me', 'local car repair', 'auto repair in', 'car mechanic', 'nearby garage'],
      urgency: ['emergency car repair', 'mobile mechanic', 'urgent auto repair', 'breakdown service', 'emergency garage']
    },
    'MOT Testing': {
      primary: ['mot test', 'mot testing', 'mot centre', 'mot inspection', 'vehicle mot', 'annual mot'],
      secondary: ['mot certificate', 'mot failure', 'mot retest', 'pre mot check', 'mot and service', 'mot booking'],
      longTail: ['mot test booking online', 'mot test centre near me', 'what happens in mot test', 'mot test preparation guide', 'mot failure repair service'],
      commercial: ['mot test cost', 'mot testing price', 'mot and service deal', 'mot test booking', 'cheap mot test'],
      informational: ['mot test requirements', 'mot testing process', 'mot test checklist', 'when is mot due', 'mot test explained'],
      local: ['mot test near me', 'local mot centre', 'mot testing in', 'area mot garage', 'nearby mot test'],
      urgency: ['urgent mot test', 'same day mot', 'emergency mot test', 'urgent mot booking', 'immediate mot service']
    }
  },

  'Marketing & Digital': {
    'Digital Marketing': {
      primary: ['digital marketing', 'online marketing', 'internet marketing', 'digital agency', 'marketing services', 'digital strategy'],
      secondary: ['seo services', 'ppc advertising', 'social media marketing', 'content marketing', 'email marketing', 'web analytics'],
      longTail: ['digital marketing strategy development', 'search engine optimization services', 'pay per click advertising management', 'social media marketing campaigns', 'content marketing strategy'],
      commercial: ['digital marketing cost', 'seo service prices', 'ppc management fees', 'marketing agency rates', 'digital marketing consultation'],
      informational: ['digital marketing guide', 'seo best practices', 'social media marketing tips', 'content marketing strategy', 'online marketing trends'],
      local: ['digital marketing agency near me', 'local seo services', 'marketing company in', 'area digital agency', 'nearby marketing services'],
      urgency: ['urgent marketing help', 'immediate seo services', 'emergency marketing support', 'fast track digital strategy', 'urgent website optimization']
    },
    'Web Design': {
      primary: ['web design', 'website design', 'web development', 'website creation', 'responsive design', 'custom website'],
      secondary: ['ecommerce website', 'wordpress design', 'mobile responsive', 'user experience', 'website redesign', 'landing page design'],
      longTail: ['responsive website design services', 'ecommerce website development', 'custom web application development', 'website redesign and optimization', 'mobile friendly website design'],
      commercial: ['website design cost', 'web development price', 'website design quote', 'web design package', 'website creation cost'],
      informational: ['web design process', 'website design trends', 'responsive design guide', 'website development tips', 'web design inspiration'],
      local: ['web designer near me', 'local web development', 'website design in', 'area web design company', 'nearby web services'],
      urgency: ['urgent website repair', 'emergency web development', 'immediate website help', 'fast website creation', 'urgent web design']
    }
  },

  'Construction & Trades': {
    'General Building': {
      primary: ['builder', 'construction', 'building contractor', 'general builder', 'building services', 'construction company'],
      secondary: ['house extension', 'loft conversion', 'kitchen extension', 'garage conversion', 'home renovation', 'building work'],
      longTail: ['house extension builder', 'loft conversion specialist', 'kitchen extension construction', 'home renovation contractor', 'building work contractor'],
      commercial: ['builder quotes', 'construction costs', 'building work prices', 'renovation costs', 'extension prices'],
      informational: ['building regulations', 'construction process', 'building permits', 'renovation guide', 'construction advice'],
      local: ['builder near me', 'local construction', 'building contractor in', 'area builder', 'nearby construction'],
      urgency: ['emergency building repair', 'urgent construction work', 'emergency builder', 'immediate building help', 'urgent structural repair']
    },
    'Electrical': {
      primary: ['electrician', 'electrical services', 'electrical contractor', 'electrical work', 'electrical installation', 'electrical repair'],
      secondary: ['rewiring', 'electrical testing', 'electrical inspection', 'socket installation', 'lighting installation', 'electrical maintenance'],
      longTail: ['house rewiring service', 'electrical safety inspection', 'commercial electrical installation', 'electrical fault finding', 'electrical certificate testing'],
      commercial: ['electrician rates', 'electrical work cost', 'rewiring price', 'electrical installation cost', 'electrical testing fees'],
      informational: ['electrical safety', 'electrical regulations', 'electrical testing requirements', 'electrical installation guide', 'electrical maintenance'],
      local: ['electrician near me', 'local electrical services', 'electrical contractor in', 'area electrician', 'nearby electrical work'],
      urgency: ['emergency electrician', 'urgent electrical repair', '24 hour electrician', 'electrical emergency', 'immediate electrical help']
    },
    'Plumbing & Heating': {
      primary: ['plumber', 'plumbing services', 'heating engineer', 'plumbing and heating', 'boiler repair', 'central heating'],
      secondary: ['boiler installation', 'radiator repair', 'pipe repair', 'bathroom installation', 'heating maintenance', 'plumbing repair'],
      longTail: ['boiler installation and repair', 'central heating system installation', 'bathroom plumbing installation', 'emergency plumbing repair', 'heating system maintenance'],
      commercial: ['plumber rates', 'boiler installation cost', 'heating repair price', 'plumbing work cost', 'boiler service price'],
      informational: ['plumbing maintenance', 'heating system guide', 'boiler servicing', 'plumbing tips', 'heating efficiency'],
      local: ['plumber near me', 'local heating engineer', 'plumbing services in', 'area plumber', 'nearby heating services'],
      urgency: ['emergency plumber', 'urgent heating repair', '24 hour plumber', 'emergency boiler repair', 'immediate plumbing help']
    }
  },

  'Financial Services': {
    'Accountancy': {
      primary: ['accountant', 'accounting services', 'bookkeeping', 'tax advice', 'financial advisor', 'chartered accountant'],
      secondary: ['tax return', 'vat return', 'payroll services', 'company accounts', 'self assessment', 'financial planning'],
      longTail: ['personal tax return preparation', 'small business accounting services', 'company annual accounts', 'vat return filing service', 'payroll management services'],
      commercial: ['accountant fees', 'accounting service cost', 'tax return price', 'bookkeeping rates', 'financial advice cost'],
      informational: ['tax advice guide', 'accounting basics', 'self assessment help', 'vat requirements', 'financial planning tips'],
      local: ['accountant near me', 'local accounting services', 'tax advisor in', 'area accountant', 'nearby financial advisor'],
      urgency: ['urgent tax advice', 'last minute tax return', 'emergency accounting help', 'urgent financial advice', 'immediate tax support']
    },
    'Financial Planning': {
      primary: ['financial advisor', 'financial planning', 'investment advice', 'pension advice', 'wealth management', 'financial consultant'],
      secondary: ['retirement planning', 'investment portfolio', 'pension transfer', 'life insurance', 'savings advice', 'mortgage advice'],
      longTail: ['retirement planning advice', 'investment portfolio management', 'pension transfer advice', 'life insurance planning', 'mortgage broker services'],
      commercial: ['financial advisor fees', 'investment advice cost', 'pension advice fees', 'financial planning cost', 'wealth management fees'],
      informational: ['financial planning guide', 'investment advice', 'pension planning', 'retirement savings', 'wealth building'],
      local: ['financial advisor near me', 'local financial planning', 'investment advisor in', 'area financial consultant', 'nearby pension advice'],
      urgency: ['urgent financial advice', 'emergency financial help', 'immediate investment advice', 'urgent pension advice', 'emergency financial planning']
    },
    'Insurance Services': {
      primary: ['insurance broker', 'commercial insurance', 'business insurance', 'insurance advisory', 'risk management', 'insurance solutions', 'broking services', 'insurance distribution', 'corporate insurance', 'insurance consulting'],
      secondary: ['liability insurance', 'professional indemnity', 'directors insurance', 'cyber insurance', 'property insurance', 'fleet insurance', 'construction insurance', 'healthcare insurance', 'technology insurance', 'financial lines insurance'],
      longTail: ['commercial insurance broker services', 'business risk management solutions', 'corporate insurance advisory services', 'professional indemnity insurance broking', 'commercial property insurance quotes', 'specialist insurance for businesses'],
      commercial: ['insurance quotes', 'insurance broker fees', 'commercial insurance cost', 'business insurance prices', 'insurance advisory rates', 'corporate insurance packages', 'insurance broker commission'],
      informational: ['what is commercial insurance', 'business insurance guide', 'risk management strategies', 'insurance broker benefits', 'commercial insurance explained', 'business risk assessment', 'insurance compliance requirements'],
      local: ['insurance broker near me', 'local commercial insurance', 'UK insurance broker', 'business insurance', 'commercial insurance advisor', 'insurance broking firm'],
      urgency: ['urgent insurance cover', 'immediate business insurance', 'emergency insurance broker', 'fast track insurance', 'same day insurance quotes', 'urgent risk management help']
    }
  },

  'Education & Training': {
    'Private Tuition': {
      primary: ['tutor', 'private tuition', 'tutoring', 'private lessons', 'academic support', 'one to one tuition'],
      secondary: ['maths tutor', 'english tutor', 'science tutor', 'exam preparation', 'gcse tuition', 'a level tuition'],
      longTail: ['private maths tutor for gcse', 'english literature tuition', 'science exam preparation', 'university entrance tutoring', 'special needs tutoring'],
      commercial: ['tutor rates', 'private tuition cost', 'tutoring prices', 'tuition fees', 'private lesson cost'],
      informational: ['tutoring benefits', 'exam preparation tips', 'study skills', 'academic support guide', 'learning techniques'],
      local: ['tutor near me', 'local tutoring', 'private tuition in', 'area tutor', 'nearby tutoring services'],
      urgency: ['urgent tuition help', 'last minute exam prep', 'emergency tutoring', 'immediate academic support', 'urgent exam preparation']
    },
    'Driving School': {
      primary: ['driving lessons', 'driving instructor', 'driving school', 'learn to drive', 'driving tuition', 'driving test'],
      secondary: ['automatic lessons', 'manual lessons', 'intensive course', 'pass plus', 'refresher lessons', 'motorway lessons'],
      longTail: ['automatic driving lessons for beginners', 'intensive driving course', 'driving test preparation', 'manual driving lessons', 'advanced driving instruction'],
      commercial: ['driving lesson cost', 'driving course price', 'driving instructor rates', 'driving test fees', 'lesson package deals'],
      informational: ['driving test guide', 'learning to drive tips', 'driving lesson advice', 'driving test requirements', 'driving skills'],
      local: ['driving instructor near me', 'local driving school', 'driving lessons in', 'area driving instructor', 'nearby driving tuition'],
      urgency: ['urgent driving lessons', 'last minute test preparation', 'emergency driving instruction', 'immediate driving help', 'crash course driving']
    }
  },

  'Beauty & Wellness': {
    'Hair Salon': {
      primary: ['hairdresser', 'hair salon', 'hair stylist', 'hair cut', 'hair colour', 'hair styling'],
      secondary: ['hair treatment', 'hair extensions', 'bridal hair', 'hair highlights', 'hair perm', 'hair straightening'],
      longTail: ['professional hair cut and colour', 'bridal hair styling service', 'hair extension application', 'hair colour correction', 'hair treatment for damaged hair'],
      commercial: ['hairdresser prices', 'hair salon cost', 'hair cut price', 'hair colour cost', 'hair styling rates'],
      informational: ['hair care tips', 'hair styling guide', 'hair colour advice', 'hair treatment options', 'hair maintenance'],
      local: ['hairdresser near me', 'local hair salon', 'hair stylist in', 'area hair salon', 'nearby hairdresser'],
      urgency: ['urgent hair appointment', 'same day hair cut', 'emergency hair colour', 'last minute hair styling', 'immediate hair help']
    },
    'Beauty Therapy': {
      primary: ['beauty therapist', 'beauty salon', 'beauty treatment', 'facial treatment', 'beauty therapy', 'skincare'],
      secondary: ['facial', 'eyebrow threading', 'waxing', 'massage therapy', 'manicure', 'pedicure'],
      longTail: ['professional facial treatment', 'eyebrow shaping and threading', 'full body waxing service', 'relaxing massage therapy', 'gel manicure and pedicure'],
      commercial: ['beauty treatment cost', 'facial price', 'beauty therapy rates', 'massage cost', 'beauty salon prices'],
      informational: ['skincare advice', 'beauty treatment guide', 'facial benefits', 'beauty therapy tips', 'skincare routine'],
      local: ['beauty therapist near me', 'local beauty salon', 'beauty treatment in', 'area beauty therapy', 'nearby beauty services'],
      urgency: ['urgent beauty treatment', 'same day facial', 'last minute beauty appointment', 'emergency beauty help', 'immediate beauty service']
    }
  },

  'Fitness & Sports': {
    'Gym & Fitness': {
      primary: ['gym', 'fitness', 'fitness center', 'health club', 'workout', 'exercise', 'training', 'bodybuilding', 'strength training', 'cardio'],
      secondary: ['gym membership', 'fitness classes', 'personal training', 'group fitness', 'weights', 'cardio equipment', 'fitness studio', 'wellness center', 'athletic training'],
      longTail: ['affordable gym membership', 'no contract gym membership', 'student gym membership', 'corporate gym membership', 'gym with personal training', 'fitness center with classes'],
      commercial: ['gym membership cost', 'fitness class prices', 'personal training rates', 'gym membership deals', 'fitness center fees', 'join gym today'],
      informational: ['gym equipment guide', 'fitness tips', 'workout routines', 'exercise benefits', 'fitness center facilities', 'gym safety guidelines'],
      local: ['gym near me', 'local fitness center', 'fitness classes in', 'gym membership', 'health club in'],
      urgency: ['join gym today', 'start fitness now', 'immediate gym access', 'same day gym membership', 'urgent fitness help']
    },
    'Personal Training': {
      primary: ['personal trainer', 'personal training', 'fitness coach', 'one on one training', 'private trainer', 'fitness instructor'],
      secondary: ['weight loss training', 'strength coach', 'fitness consultation', 'exercise program', 'training sessions', 'fitness goals'],
      longTail: ['certified personal trainer', 'weight loss personal trainer', 'strength training coach', 'fitness trainer for beginners', 'one on one fitness coaching'],
      commercial: ['personal trainer cost', 'personal training rates', 'fitness coach prices', 'hire personal trainer', 'book training session'],
      informational: ['personal training benefits', 'choosing a personal trainer', 'fitness coaching guide', 'personal training tips', 'workout planning'],
      local: ['personal trainer near me', 'local fitness coach', 'personal training in', 'fitness instructor', 'area personal trainer'],
      urgency: ['urgent fitness help', 'immediate personal training', 'start training today', 'emergency fitness coach', 'quick fitness results']
    },
    'Sports Clubs': {
      primary: ['sports club', 'athletic club', 'sports center', 'recreation center', 'sporting activities', 'sports facilities'],
      secondary: ['team sports', 'individual sports', 'sports coaching', 'athletic training', 'sports equipment', 'recreational activities'],
      longTail: ['local sports club membership', 'youth sports programs', 'adult sports leagues', 'competitive sports training', 'recreational sports activities'],
      commercial: ['sports club membership', 'sports coaching fees', 'athletic training cost', 'sports equipment rental', 'sports program prices'],
      informational: ['sports club benefits', 'choosing sports activities', 'sports training guide', 'athletic development', 'sports safety'],
      local: ['sports club near me', 'local athletic center', 'sports facilities in', 'recreation center', 'area sports programs'],
      urgency: ['join sports club today', 'immediate sports training', 'urgent athletic help', 'start sports now', 'quick sports results']
    }
  },

  'Entertainment & Recreation': {
    'Indoor Karting': {
      primary: ['indoor karting', 'go karting', 'karting experience', 'racing venue', 'karting center', 'motorsport venue', 'karting track', 'go kart racing', 'indoor racing', 'karting facility'],
      secondary: ['karting parties', 'corporate karting', 'kids karting', 'family karting', 'group karting', 'karting events', 'racing instruction', 'karting academy', 'professional karting', 'karting training'],
      longTail: ['indoor go karting birthday parties', 'corporate team building karting events', 'kids karting party packages', 'professional karting training courses', 'fastest indoor karting tracks', 'karting experience vouchers'],
      commercial: ['karting prices', 'book karting session', 'karting party packages', 'corporate karting rates', 'karting experience vouchers', 'group karting booking', 'karting gift cards'],
      informational: ['what is indoor karting', 'karting safety guide', 'how fast are go karts', 'karting for beginners', 'corporate karting benefits', 'kids karting age limits', 'karting track layout'],
      local: ['karting near me', 'local karting center', 'indoor karting', 'karting venue', 'go karting track', 'karting facility'],
      urgency: ['book karting today', 'last minute karting booking', 'same day karting session', 'urgent party venue booking', 'immediate karting experience', 'walk in karting sessions']
    },
    'Escape Rooms': {
      primary: ['escape room', 'escape game', 'puzzle room', 'mystery room', 'adventure room', 'immersive experience', 'team challenge', 'escape experience'],
      secondary: ['escape room themes', 'group escape rooms', 'corporate escape rooms', 'birthday escape rooms', 'family escape rooms', 'escape room booking', 'puzzle solving', 'team building escape'],
      longTail: ['escape room birthday party packages', 'corporate team building escape rooms', 'family friendly escape room experiences', 'most challenging escape rooms', 'escape room gift vouchers'],
      commercial: ['escape room prices', 'book escape room', 'escape room packages', 'group escape room rates', 'escape room vouchers', 'escape room gift cards'],
      informational: ['how do escape rooms work', 'escape room tips', 'best escape room strategies', 'escape room difficulty levels', 'what to expect escape room'],
      local: ['escape room near me', 'local escape rooms', 'escape room', 'escape game venue', 'puzzle room'],
      urgency: ['book escape room today', 'last minute escape room', 'same day escape room booking', 'urgent team building activity', 'immediate escape room experience']
    },
    'Entertainment Centers': {
      primary: ['entertainment center', 'family entertainment', 'indoor entertainment', 'activity center', 'fun center', 'recreation venue', 'entertainment venue', 'activity park'],
      secondary: ['birthday parties', 'corporate events', 'group activities', 'family fun', 'kids activities', 'adult entertainment', 'party venues', 'team building activities'],
      longTail: ['indoor family entertainment center', 'birthday party entertainment venues', 'corporate team building entertainment', 'all weather family activities', 'group entertainment packages'],
      commercial: ['entertainment center prices', 'party package deals', 'group booking rates', 'entertainment vouchers', 'corporate event packages', 'birthday party costs'],
      informational: ['what activities are available', 'age restrictions entertainment', 'party planning guide', 'group activity ideas', 'entertainment center facilities'],
      local: ['entertainment center near me', 'local family fun', 'indoor activities', 'entertainment venue', 'activity center'],
      urgency: ['book entertainment today', 'last minute party venue', 'same day activity booking', 'urgent entertainment booking', 'immediate party solution']
    }
  },

  'Scientific Equipment & Instruments': {
    'Particle Science Equipment': {
      primary: ['particle analyzer', 'particle sizing equipment', 'particle characterization', 'particle size analyzer', 'particle counter', 'particle measurement', 'particle distribution analyzer', 'laser diffraction', 'dynamic light scattering', 'particle shape analyzer'],
      secondary: ['particle analysis instruments', 'size distribution measurement', 'particle size distribution', 'particle morphology', 'zeta potential analyzer', 'particle stability testing', 'particle concentration measurement', 'aerosol particle counter'],
      longTail: ['laser diffraction particle size analyzer', 'dynamic light scattering particle analyzer', 'automated particle size distribution analyzer', 'high resolution particle size analyzer', 'pharmaceutical particle size testing equipment'],
      commercial: ['particle analyzer price', 'particle sizing equipment cost', 'particle analyzer quote', 'particle measurement system', 'buy particle analyzer', 'particle sizing equipment supplier'],
      informational: ['particle size analysis methods', 'particle characterization techniques', 'how particle analyzers work', 'particle sizing principles', 'particle measurement guide', 'particle analysis applications'],
      local: ['particle analyzer UK', 'particle sizing equipment UK', 'particle analysis equipment', 'UK particle measurement', 'particle analyzer supplier'],
      urgency: ['urgent particle analysis', 'immediate particle testing', 'fast particle characterization', 'emergency particle measurement', 'same day particle analysis']
    },
    'Laboratory Instruments': {
      primary: ['laboratory instruments', 'lab equipment', 'analytical instruments', 'scientific instruments', 'research equipment', 'laboratory equipment', 'lab instrumentation', 'analytical equipment', 'testing instruments', 'measurement equipment'],
      secondary: ['spectroscopy equipment', 'chromatography systems', 'microscopy equipment', 'laboratory balances', 'pH meters', 'laboratory automation', 'sample preparation equipment', 'laboratory consumables'],
      longTail: ['high precision laboratory instruments', 'automated laboratory equipment systems', 'research grade analytical instruments', 'university laboratory equipment', 'pharmaceutical laboratory instruments'],
      commercial: ['laboratory equipment prices', 'lab instruments cost', 'analytical equipment quote', 'buy laboratory instruments', 'lab equipment supplier', 'laboratory instrument financing'],
      informational: ['laboratory equipment guide', 'analytical instrument selection', 'lab equipment maintenance', 'laboratory instrumentation basics', 'how to choose lab equipment'],
      local: ['laboratory equipment UK', 'lab instruments UK', 'UK laboratory suppliers', 'laboratory equipment distributor', 'lab equipment near me'],
      urgency: ['urgent lab equipment', 'emergency laboratory instruments', 'immediate equipment replacement', 'fast laboratory equipment delivery', 'same day lab equipment']
    },
    'Analytical Equipment': {
      primary: ['analytical equipment', 'analytical instruments', 'testing equipment', 'analysis instruments', 'quality control equipment', 'analytical testing', 'measurement instruments', 'characterization equipment', 'analytical systems', 'testing systems'],
      secondary: ['stability testing equipment', 'dissolution testing', 'chemical analysis equipment', 'materials testing equipment', 'pharmaceutical testing equipment', 'environmental testing equipment', 'food testing equipment'],
      longTail: ['pharmaceutical analytical testing equipment', 'materials characterization equipment', 'environmental analysis instruments', 'food safety testing equipment', 'chemical analysis laboratory equipment'],
      commercial: ['analytical equipment prices', 'testing equipment cost', 'analytical instruments quote', 'quality control equipment supplier', 'buy analytical equipment'],
      informational: ['analytical testing methods', 'quality control procedures', 'analytical equipment selection', 'testing equipment guide', 'analytical instrument calibration'],
      local: ['analytical equipment UK', 'testing equipment UK', 'UK analytical instruments', 'analytical equipment supplier', 'testing equipment distributor'],
      urgency: ['urgent analytical testing', 'emergency equipment calibration', 'immediate testing equipment', 'fast analytical equipment', 'same day equipment service']
    }
  }
};

// Geographic modifiers for local keywords
export const GEOGRAPHIC_MODIFIERS = {
  proximity: ['near me', 'nearby', 'close to me', 'in my area', 'local'],
  cities: ['London', 'Manchester', 'Birmingham', 'Glasgow', 'Liverpool', 'Bristol', 'Sheffield', 'Edinburgh', 'Leeds', 'Cardiff'],
  regions: ['North London', 'South London', 'East London', 'West London', 'Central London', 'Greater Manchester', 'West Midlands', 'South Yorkshire'],
  coverage: ['serving', 'covering', 'throughout', 'across', 'in the', 'around']
};

// Intent-based keyword modifiers
export const INTENT_MODIFIERS = {
  commercial: ['cost', 'price', 'quote', 'rates', 'fees', 'hire', 'book', 'buy', 'order', 'get'],
  informational: ['what is', 'how to', 'guide', 'tips', 'advice', 'help', 'information', 'explained', 'process'],
  urgency: ['urgent', 'emergency', 'immediate', 'same day', 'fast', 'quick', '24 hour', 'asap', 'now'],
  quality: ['best', 'top', 'professional', 'expert', 'specialist', 'experienced', 'qualified', 'certified', 'recommended'],
  comparison: ['vs', 'versus', 'compare', 'difference', 'alternative', 'options', 'choose', 'which']
};

// Service type modifiers
export const SERVICE_MODIFIERS = {
  service_types: ['consultation', 'advice', 'services', 'help', 'support', 'assistance', 'solutions'],
  business_modifiers: ['commercial', 'residential', 'domestic', 'business', 'corporate', 'private', 'personal'],
  quality_indicators: ['professional', 'expert', 'specialist', 'experienced', 'qualified', 'certified', 'licensed', 'insured'],
  price_indicators: ['affordable', 'cheap', 'budget', 'competitive', 'reasonable', 'value', 'low cost', 'free quote']
};