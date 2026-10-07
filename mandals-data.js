// =====================================================
// COMPREHENSIVE INDIA DISTRICTS & MANDALS / TALUKS DATA
// =====================================================

const indiaDistrictsData = {
    "Andhra Pradesh": ["Alluri Sitharama Raju", "Anakapalli", "Ananthapuramu", "Bapatla", "Chittoor", "East Godavari", "Eluru", "Guntur", "Kakinada", "Konaseema", "Krishna", "Kurnool", "Nandyal", "Nellore", "Palnadu", "Parvathipuram Manyam", "Prakasam", "Srikakulam", "Sri Sathya Sai", "Tirupati", "Visakhapatnam", "Vizianagaram", "West Godavari", "YSR Kadapa"],
    "Arunachal Pradesh": ["Anjaw", "Changlang", "Dibang Valley", "East Kameng", "East Siang", "Itanagar Capital Complex", "Lohit", "Lower Dibang Valley", "Lower Subansiri", "Papum Pare", "Tawang", "Tirap", "Upper Siang", "West Kameng", "West Siang"],
    "Assam": ["Baksa", "Barpeta", "Cachar", "Darrang", "Dhemaji", "Dhubri", "Dibrugarh", "Goalpara", "Golaghat", "Jorhat", "Kamrup", "Kamrup Metropolitan", "Lakhimpur", "Majuli", "Nagaon", "Sivasagar", "Sonitpur", "Tinsukia", "Udalguri"],
    "Bihar": ["Araria", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", "Bhojpur", "Darbhanga", "East Champaran", "Gaya", "Gopalganj", "Jamui", "Jehanabad", "Kaimur", "Katihar", "Khagaria", "Kishanganj", "Lakhisarai", "Madhepura", "Madhubani", "Munger", "Muzaffarpur", "Nalanda", "Nawada", "Patna", "Purnia", "Rohtas", "Saharsa", "Samastipur", "Saran", "Sheikhpura", "Sheohar", "Sitamarhi", "Siwan", "Supaul", "Vaishali", "West Champaran"],
    "Chhattisgarh": ["Balod", "Baloda Bazar", "Balrampur-Ramanujganj", "Bastar", "Bemetara", "Bijapur", "Bilaspur", "Dantewada", "Dhamtari", "Durg", "Gariaband", "Janjgir-Champa", "Jashpur", "Kabirdham", "Kanker", "Kondagaon", "Korba", "Korea", "Mahasamund", "Mungeli", "Narayanpur", "Raigarh", "Raipur", "Rajnandgaon", "Sukma", "Surajpur", "Surguja"],
    "Goa": ["North Goa", "South Goa"],
    "Gujarat": ["Ahmedabad", "Amreli", "Anand", "Aravalli", "Banaskantha", "Bharuch", "Bhavnagar", "Botad", "Chhota Udaipur", "Dahod", "Dang", "Devbhoomi Dwarka", "Gandhinagar", "Gir Somnath", "Jamnagar", "Junagadh", "Kheda", "Kutch", "Mahisagar", "Mehsana", "Morbi", "Narmada", "Navsari", "Panchmahal", "Patan", "Porbandar", "Rajkot", "Sabarkantha", "Surat", "Surendranagar", "Tapi", "Vadodara", "Valsad"],
    "Haryana": ["Ambala", "Bhiwani", "Charkhi Dadri", "Faridabad", "Fatehabad", "Gurugram", "Hisar", "Jhajjar", "Jind", "Kaithal", "Karnal", "Kurukshetra", "Mahendragarh", "Nuh", "Palwal", "Panchkula", "Panipat", "Rewari", "Rohtak", "Sirsa", "Sonipat", "Yamunanagar"],
    "Himachal Pradesh": ["Bilaspur", "Chamba", "Hamirpur", "Kangra", "Kinnaur", "Kullu", "Lahaul and Spiti", "Mandi", "Shimla", "Sirmaur", "Solan", "Una"],
    "Jharkhand": ["Bokaro", "Chatra", "Deoghar", "Dhanbad", "Dumka", "East Singhbhum", "Garhwa", "Giridih", "Godda", "Gumla", "Hazaribagh", "Jamtara", "Khunti", "Koderma", "Latehar", "Lohardaga", "Pakur", "Palamu", "Ramgarh", "Ranchi", "Sahebganj", "Seraikela Kharsawan", "Simdega", "West Singhbhum"],
    "Karnataka": ["Bagalkot", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban", "Bidar", "Chamarajanagar", "Chikkaballapur", "Chikkamagaluru", "Chitradurga", "Dakshina Kannada", "Davanagere", "Dharwad", "Gadag", "Hassan", "Haveri", "Kalaburagi", "Kodagu", "Kolar", "Koppal", "Mandya", "Mysuru", "Raichur", "Ramanagara", "Shivamogga", "Tumakuru", "Udupi", "Uttara Kannada", "Vijayapura", "Yadgir"],
    "Kerala": ["Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod", "Kollam", "Kottayam", "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta", "Thiruvananthapuram", "Thrissur", "Wayanad"],
    "Madhya Pradesh": ["Agar Malwa", "Alirajpur", "Anuppur", "Ashoknagar", "Balaghat", "Barwani", "Betul", "Bhind", "Bhopal", "Burhanpur", "Chhatarpur", "Chhindwara", "Damoh", "Datia", "Dewas", "Dhar", "Dindori", "Guna", "Gwalior", "Harda", "Hoshangabad", "Indore", "Jabalpur", "Jhabua", "Katni", "Khandwa", "Khargone", "Mandla", "Mandsaur", "Morena", "Narsinghpur", "Neemuch", "Panna", "Raisen", "Rajgarh", "Ratlam", "Rewa", "Sagar", "Satna", "Sehore", "Seoni", "Shahdol", "Shajapur", "Sheopur", "Shivpuri", "Sidhi", "Singrauli", "Tikamgarh", "Ujjain", "Umaria", "Vidisha"],
    "Maharashtra": ["Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara", "Buldhana", "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai City", "Mumbai Suburban", "Nagpur", "Nanded", "Nandurbar", "Nashik", "Osmanabad", "Palghar", "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur", "Thane", "Wardha", "Washim", "Yavatmal"],
    "Odisha": ["Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak", "Boudh", "Cuttack", "Deogarh", "Dhenkanal", "Gajapati", "Ganjam", "Jagatsinghpur", "Jajpur", "Jharsuguda", "Kalahandi", "Kandhamal", "Kendrapara", "Kendujhar", "Khordha", "Koraput", "Malkangiri", "Mayurbhanj", "Nabarangpur", "Nayagarh", "Nuapada", "Puri", "Rayagada", "Sambalpur", "Subarnapur", "Sundargarh"],
    "Punjab": ["Amritsar", "Barnala", "Bathinda", "Faridkot", "Fatehgarh Sahib", "Fazilka", "Ferozepur", "Gurdaspur", "Hoshiarpur", "Jalandhar", "Kapurthala", "Ludhiana", "Mansa", "Moga", "Muktsar", "Pathankot", "Patiala", "Rupnagar", "Sahibzada Ajit Singh Nagar", "Sangrur", "Shaheed Bhagat Singh Nagar", "Tarn Taran"],
    "Rajasthan": ["Ajmer", "Alwar", "Banswara", "Baran", "Barmer", "Bharatpur", "Bhilwara", "Bikaner", "Bundi", "Chittorgarh", "Churu", "Dausa", "Dholpur", "Dungarpur", "Hanumangarh", "Jaipur", "Jaisalmer", "Jalore", "Jhalawar", "Jhunjhunu", "Jodhpur", "Karauli", "Kota", "Nagaur", "Pali", "Pratapgarh", "Rajsamand", "Sawai Madhopur", "Sikar", "Sirohi", "Sri Ganganagar", "Tonk", "Udaipur"],
    "Tamil Nadu": ["Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kancheepuram", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai", "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai", "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi", "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli", "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvarur", "Vellore", "Viluppuram", "Virudhunagar"],
    "Telangana": ["Adilabad", "Bhadradri Kothagudem", "Hyderabad", "Jagtial", "Jangaon", "Jayashankar Bhupalpally", "Jogulamba Gadwal", "Kamareddy", "Karimnagar", "Khammam", "Komaram Bheem", "Mahabubabad", "Mahbubnagar", "Mancherial", "Medak", "Medchal-Malkajgiri", "Mulugu", "Nagarkurnool", "Nalgonda", "Narayanpet", "Nirmal", "Nizamabad", "Peddapalli", "Rajanna Sircilla", "Rangareddy", "Sangareddy", "Siddipet", "Suryapet", "Vikarabad", "Wanaparthy", "Warangal", "Yadadri Bhuvanagiri"],
    "Manipur": ["Bishnupur", "Chandel", "Churachandpur", "Imphal East", "Imphal West", "Jiribam", "Kakching", "Kamjong", "Kangpokpi", "Noney", "Pherzawl", "Senapati", "Tamenglong", "Tengnoupal", "Thoubal", "Ukhrul"],
    "Meghalaya": ["East Garo Hills", "East Jaintia Hills", "East Khasi Hills", "North Garo Hills", "Ri Bhoi", "South Garo Hills", "South West Garo Hills", "South West Khasi Hills", "West Garo Hills", "West Jaintia Hills", "West Khasi Hills"],
    "Mizoram": ["Aizawl", "Champhai", "Hnahthial", "Khawzawl", "Kolasib", "Lawngtlai", "Lunglei", "Mamit", "Saiha", "Saitual", "Serchhip"],
    "Nagaland": ["Chumoukedima", "Dimapur", "Kiphire", "Kohima", "Longleng", "Mokokchung", "Mon", "Niuland", "Noklak", "Peren", "Phek", "Shamator", "Tseminyu", "Tuensang", "Wokha", "Zunheboto"],
    "Sikkim": ["Gangtok", "Gyalshing", "Mangan", "Namchi", "Pakyong", "Soreng"],
    "Tripura": ["Dhalai", "Gomati", "Khowai", "North Tripura", "Sepahijala", "South Tripura", "Unakoti", "West Tripura"],
    "Uttar Pradesh": ["Agra", "Aligarh", "Ayodhya", "Azamgarh", "Bareilly", "Bhadohi", "Bijnor", "Bulandshahr", "Chitrakoot", "Etah", "Etawah", "Farrukhabad", "Fatehpur", "Firozabad", "Ghaziabad", "Ghazipur", "Gonda", "Gorakhpur", "Hapur", "Hardoi", "Hathras", "Jalaun", "Jaunpur", "Jhansi", "Kannauj", "Kanpur Dehat", "Kanpur Nagar", "Kasganj", "Kaushambi", "Kushinagar", "Lakhimpur Kheri", "Lucknow", "Maharajganj", "Mahoba", "Mainpuri", "Mathura", "Mau", "Meerut", "Mirzapur", "Moradabad", "Muzaffarnagar", "Pilibhit", "Prayagraj", "Raebareli", "Rampur", "Saharanpur", "Sambhal", "Sant Kabir Nagar", "Shahjahanpur", "Shamli", "Shravasti", "Siddharthnagar", "Sitapur", "Sonbhadra", "Sultanpur", "Unnao", "Varanasi"],
    "Uttarakhand": ["Almora", "Bageshwar", "Chamoli", "Champawat", "Dehradun", "Haridwar", "Nainital", "Pauri Garhwal", "Pithoragarh", "Rudraprayag", "Tehri Garhwal", "Udham Singh Nagar", "Uttarkashi"],
    "West Bengal": ["Alipurduar", "Bankura", "Birbhum", "Cooch Behar", "Dakshin Dinajpur", "Darjeeling", "Hooghly", "Howrah", "Jalpaiguri", "Jhargram", "Kalimpong", "Kolkata", "Maldah", "Murshidabad", "Nadia", "North 24 Parganas", "Paschim Bardhaman", "Paschim Medinipur", "Purba Bardhaman", "Purba Medinipur", "Purulia", "South 24 Parganas", "Uttar Dinajpur"],
    "Andaman and Nicobar Islands": ["Nicobar", "North and Middle Andaman", "South Andaman"],
    "Chandigarh": ["Chandigarh"],
    "Dadra and Nagar Haveli and Daman and Diu": ["Dadra and Nagar Haveli", "Daman", "Diu"],
    "Delhi": ["Central Delhi", "East Delhi", "New Delhi", "North Delhi", "North East Delhi", "North West Delhi", "Shahdara", "South Delhi", "South East Delhi", "South West Delhi", "West Delhi"],
    "Jammu and Kashmir": ["Anantnag", "Bandipora", "Baramulla", "Budgam", "Doda", "Ganderbal", "Jammu", "Kathua", "Kishtwar", "Kulgam", "Kupwara", "Poonch", "Pulwama", "Rajouri", "Ramban", "Reasi", "Samba", "Shopian", "Srinagar", "Udhampur"],
    "Ladakh": ["Kargil", "Leh"],
    "Lakshadweep": ["Lakshadweep"],
    "Puducherry": ["Karaikal", "Mahe", "Puducherry", "Yanam"]
};

const mandalsByDistrictData = {
    // ==========================================
    // ANDHRA PRADESH (ALL 26 DISTRICTS)
    // ==========================================
    "Alluri Sitharama Raju": [
        "Paderu", "Araku Valley", "Ananthagiri", "Chintapalli", "G.K. Veedhi",
        "Rampachodavaram", "Maredumilli", "Devipatnam", "Y. Ramavaram", "Koyyuru",
        "Pedabayalu", "Munchingiputtu", "Dumbriguda", "Hukumpeta", "G. Madugula"
    ],
    "Anakapalli": [
        "Anakapalli", "Chodavaram", "Kasimkota", "Parawada", "Atchutapuram",
        "Elamanchili", "Nakkapalli", "Payakaraopeta", "Madugula", "Devarapalle",
        "K.Kotapadu", "Munagapaka", "Rambilli", "Rolugunta", "Ravikamatham", "S.Rayavaram"
    ],
    "Ananthapuramu": [
        "Anantapur", "Bukkarayasamudram", "Garladinne", "Kudair", "Narpala",
        "Pamidi", "Singanamala", "Tadpatri", "Uravakonda", "Vidapanakal",
        "Yadiki", "Atmakur", "Beluguppa", "Bommanahal", "Guntakal",
        "Kalyandurg", "Peddapappur", "Putlur", "Raptadu", "Vajrakarur"
    ],
    "Bapatla": [
        "Bapatla", "Chirala", "Vetapalem", "Karamchedu", "Parchur",
        "Repalle", "Nizampatnam", "Bhattiprolu", "Tsundur", "Amruthalur",
        "Chinaganjam", "Inkollu", "Jangamaheswarapuram", "Kollur", "Nagaram",
        "Pittalavanipalem", "Santhamaguluru", "Yeddana Pudi"
    ],
    "Chittoor": [
        "Chittoor", "Gudipala", "GD Nellore", "Irala", "Palamaner",
        "Bangarupalem", "Punganur", "Somala", "Chowdepalle", "Nagari",
        "Karvetinagar", "Nindra", "Peddapanjani", "Pulicherla", "Rompicherla",
        "Santhipuram", "Thavanampalle", "Vedurukuppam", "Venkatagirikota", "Vijayapuram", "Yadamarri"
    ],
    "East Godavari": [
        "Rajamahendravaram Urban", "Rajamahendravaram Rural", "Kadiam", "Rajanagaram", "Korukonda",
        "Gokavaram", "Anaparthi", "Biccavolu", "Kovvur", "Nidadavole",
        "Chagallu", "Devarapalle", "Gopalapuram", "Peravali", "Seethanagaram", "Tallapudi", "Undrajavaram"
    ],
    "Eluru": [
        "Eluru", "Denduluru", "Pedavegi", "Pedapadu", "Chintalapudi",
        "Jangareddygudem", "Polavaram", "Nuzvid", "Musunuru", "Agiripalli",
        "Bhimadole", "Buttayagudem", "Chatrai", "Dwaraka Tirumala", "Kamavarapukota",
        "Koyyalagudem", "Kukunoor", "Mandavalli", "Mudinepalle", "T.Narasapuram", "Velairpadu"
    ],
    "Guntur": [
        "Guntur", "Tenali", "Mangalagiri", "Tadakonda", "Tulluru",
        "Chebrolu", "Medikonduru", "Pedakakani", "Ponnur", "Prattipadu",
        "Vatticherukuru", "Duggirala", "Kakumanu", "Kollipara", "Pedanandipadu", "Phirangipuram"
    ],
    "Kakinada": [
        "Kakinada Urban", "Kakinada Rural", "Samalkota", "Pithapuram", "Gollaprolu",
        "Peddapuram", "Tuni", "Kotananduru", "Prathipadu", "Karapa",
        "Gandepalli", "Jaggampeta", "Kajuluru", "Kirlampudi", "Routhulapudi", "Sankhavaram", "Thondangi", "Yeleswaram"
    ],
    "Konaseema": [
        "Amalapuram", "Razole", "Ravulapalem", "Kothapeta", "Ainavilli",
        "Mummidivaram", "Allavaram", "Malikipuram", "Sakhinetipalli", "Katrenikona",
        "Atreyapuram", "Alamuru", "Ambajipeta", "I. Polavaram", "Kapileswarapuram",
        "Mamidikuduru", "P.Gannavaram", "Rowthulapudi", "Uppalaguptam"
    ],
    "Krishna": [
        "Machilipatnam", "Gudivada", "Gannavaram", "Penamaluru", "Vijayawada Rural",
        "Vijayawada Central", "Vijayawada North", "Vijayawada East", "Vijayawada West", "Nandigama",
        "Jaggaiahpet", "Vuyyuru", "Movva", "Challapalli", "Avanigadda",
        "Bantumilli", "Pamarru", "Kankipadu", "Bapulapadu", "Ghantasala",
        "Guduru", "Ibrahimpatnam", "Koduru", "Kruthivennu", "Nagayalanka", "Pedana", "Thotlavalluru", "Unguturu", "Veerullapadu"
    ],
    "Kurnool": [
        "Kurnool", "Kallur", "Orvakal", "C.Belagal", "Gudur",
        "Yemmiganur", "Kodumur", "Adoni", "Alur", "Pattikonda",
        "Mantralayam", "Aspari", "Devanakonda", "Gonegandla", "Halaharvi",
        "Holagunda", "Kowthalam", "Krishnagiri", "Madhavaram", "Nandavaram", "Peddakadubur", "Tuggali", "Veldurthi"
    ],
    "Nandyal": [
        "Nandyal", "Allagadda", "Banaganapalle", "Betamcherla", "Dhone",
        "Koilkuntla", "Nandikotkur", "Panyam", "Atmakur", "Srisailam",
        "Bandi Atmakur", "Chagalamarri", "Dornipadu", "Gadivemula", "Gospadu",
        "Jupadu Bungalow", "Kolimigundla", "Kothapalle", "Mahanandi", "Midthur", "Owk", "Pagidyala", "Pamulapadu", "Rudravaram", "Sanjamala", "Sirvel", "Uyyalawada", "Velgodu"
    ],
    "Nellore": [
        "Nellore Urban", "Nellore Rural", "Kovur", "Buchireddypalem", "Indukurpet",
        "Allur", "Kavali", "Atmakur", "Venkatagiri", "Podalakur",
        "Gudur", "Muthukur", "Bogole", "Chillakur", "Dagadarthi",
        "Dakkili", "Doravarisatram", "Jaladanki", "Kaligiri", "Kaluvoya",
        "Kota", "Manubolu", "Marripadu", "Naidupeta", "Ozili", "Pellakur", "Rapur", "Sangam", "Seetharamapuram", "Sydapuram", "Thotapalligudur", "Udayagiri", "Vakadu", "Varikuntapadu", "Vidavalur", "Vinjamur"
    ],
    "Palnadu": [
        "Narasaraopet", "Sattenapalle", "Chilakaluripet", "Piduguralla", "Macherla",
        "Vinukonda", "Gurazala", "Dachepalle", "Bellamkonda", "Rompicherla",
        "Atchampet", "Bollapalle", "Durgi", "Edlapadu", "Ipur",
        "Karempudi", "Krosuru", "Machavaram", "Muppalla", "Nadendla", "Nekarikallu", "Pedakurapadu", "Rajupalem", "Rentachintala", "Savalyapuram", "Veldurthi"
    ],
    "Parvathipuram Manyam": [
        "Parvathipuram", "Seethanagaram", "Balijipeta", "Salur", "Makkuva",
        "Kurupam", "Jiyyammavalasa", "Komarada", "Gummalaxmipuram", "Bhamini",
        "Garugubilli", "Pachipenta", "Palakonda", "Seethampeta", "Veeraghattam"
    ],
    "Prakasam": [
        "Ongole", "Chirala", "Singarayakonda", "Kothapatnam", "Tangutur",
        "Addanki", "Markapur", "Giddalur", "Kanigiri", "Podili",
        "Chimakurthy", "Kandukur", "Bestavaripeta", "Chandra Sekhara Puram", "Cumbum",
        "Darsi", "Donakonda", "Hanumanthunipadu", "Kondapi", "Konakanamitla", "Kurichedu", "Maddipadu", "Marripudi", "Mundlamuru", "Naguluppalapadu", "Pamur", "Peda Araveedu", "Pullalacheruvu", "Racherla", "Santhanuthalapadu", "Tarlupadu", "Thallur", "Tripuranthakam", "Veligandla", "Yerragondapalem", "Zarugumalli"
    ],
    "Srikakulam": [
        "Srikakulam", "Amadalavalasa", "Narasannapeta", "Tekkali", "Palasa",
        "Sompeta", "Ichchapuram", "Rajam", "Ponduru", "Gara",
        "Etcherla", "Burja", "Ganguvarisigadam", "Hiramandalam", "Jalumuru",
        "Kanchili", "Kavali", "Kotabommali", "Kothuru", "Laveru", "Mandasa", "Meliaputti", "Polaki", "Ranastalam", "Santhabommali", "Saravakota", "Sarubujjili", "Vajrapukotturu", "Vangara"
    ],
    "Sri Sathya Sai": [
        "Puttaparthi", "Dharmavaram", "Kadiri", "Hindupur", "Penukonda",
        "Madakasira", "Bukkapatnam", "Gorantla", "Lepakshi", "Somandepalle",
        "Agali", "Amadagur", "Amarapuram", "Bathalapalle", "Chennekothapalle",
        "Chilamathur", "Gandlapenta", "Gudibanda", "Kanaganapalle", "Kothacheruvu", "Mudigubba", "Nallacheruvu", "Nallamada", "O.D.Cheruvu", "Parigi", "Rolla", "Talupula", "Tanakal"
    ],
    "Tirupati": [
        "Tirupati Urban", "Tirupati Rural", "Chandragiri", "Renigunta", "Yerpedu",
        "Sri Kalahasti", "Sullurpeta", "Tada", "Naidupeta", "Venkatagiri",
        "Pakala", "Balayapalle", "Chinnagottigallu", "Dakkili", "Doravarisatram",
        "Gudur", "K.V.B.Puram", "Kota", "Nagalapuram", "Narayanavanam", "Ozili", "Pellakur", "Pichatur", "Satyavedu", "Thottambedu", "Vakadu", "Varadaiahpalem", "Vadamalapeta", "Yerravaripalem"
    ],
    "Visakhapatnam": [
        "Visakhapatnam Rural", "Bheemunipatnam", "Anandapuram", "Padmanabham", "Maharanipeta",
        "Gajuwaka", "Pedagantyada", "Gopalapatnam", "Seethammadhara", "Pendurthi", "Mulagada"
    ],
    "Vizianagaram": [
        "Vizianagaram", "Gantyada", "Denkada", "Bondapalle", "Nellimarla",
        "Cheepurupalle", "Gajapathinagaram", "Bobbili", "Badangi", "Therlam",
        "Bhogapuram", "Dattirajeru", "Garividi", "Gurla", "Jami",
        "Kothavalasa", "Lakkavarapukota", "Mentada", "Merakamudidam", "Pusapatirega", "Ramabhadrapuram", "S.Kota", "Vepada"
    ],
    "West Godavari": [
        "Bhimavaram", "Palakollu", "Narasapuram", "Tanuku", "Tadepalligudem",
        "Achanta", "Akividu", "Mogalthur", "Undi", "Penumantra",
        "Attili", "Iragavaram", "Kalla", "Penugonda", "Peravali", "Poduru", "T.Narasapuram", "Veeravasaram", "Yelamanchili"
    ],
    "YSR Kadapa": [
        "Kadapa", "Vontimitta", "Sidhout", "Kamalapuram", "Mydukur",
        "Proddatur", "Jammalamadugu", "Pulivendula", "Badvel", "Rayachoti",
        "Rajampet", "Atlur", "B.Kodur", "Brahmamgarimattam", "Chakrayapet",
        "Chapad", "Chennur", "Chinthakommadinne", "Duvvur", "Galiveedu", "Gopavaram", "Kalasapadu", "Khajipet", "Kondapuram", "Lakkireddypalle", "Lingala", "Muddanur", "Mylavaram", "Nandalur", "Peddamudium", "Penagalur", "Porumamilla", "Railway Koduru", "Rajupalem", "Sambepalli", "Simhadripuram", "Sri Avadhutha Kasinayana", "Thondur", "Vallur", "Veeraballi", "Veerapunayunipalle", "Vempalli", "Yerraguntla"
    ],

    // ==========================================
    // TELANGANA (KEY DISTRICTS)
    // ==========================================
    "Hyderabad": [
        "Amberpet", "Asif Nagar", "Bahadurpura", "Bandlaguda", "Charminar",
        "Golconda", "Himayatnagar", "Jubilee Hills", "Khairatabad", "Musheerabad",
        "Nampally", "Saidabad", "Secunderabad", "Shaikpet", "Tirumalagiri"
    ],
    "Rangareddy": [
        "Ibrahimpatnam", "Maheshwaram", "Rajendranagar", "Serilingampally", "Shamshabad",
        "Shabad", "Chevella", "Moinabad", "Kandukur", "Farooqnagar",
        "Hayathnagar", "Keshampet", "Kondurg", "Madgul", "Manchal",
        "Nandigama", "Saroornagar", "Talakondapalle", "Yacharam"
    ],
    "Medchal-Malkajgiri": [
        "Alwal", "Bachupally", "Balanagar", "Dundigal", "Gandimaisamma",
        "Ghatkesar", "Kapra", "Keesara", "Kukatpally", "Malkajgiri",
        "Medchal", "Medipally", "Peerzadiguda", "Quthbullapur", "Uppal"
    ],
    "Warangal": [
        "Warangal", "Khila Warangal", "Kazipet", "Hanamkonda", "Inavolu",
        "Geesugonda", "Atmakur", "Dharmasagar", "Hasanparthy", "Wardhannapet",
        "Chennaraopet", "Duggondi", "Nekkonda", "Nallabelly", "Parvathagiri", "Rayaparthy", "Sangem"
    ],
    "Khammam": [
        "Khammam Urban", "Khammam Rural", "Kusumanchi", "Mudigonda", "Nelakondapalli",
        "Bonakal", "Madhira", "Wyra", "Sathupalli", "Kalluru",
        "Chinthakani", "Enkoor", "Konijerla", "Penuballi", "Raghunadhapalem", "Singareni", "Thallada", "Vemsoor", "Yerrupalem"
    ],
    "Karimnagar": [
        "Karimnagar", "Kothapalli", "Choppadandi", "Gangadhara", "Manakondur",
        "Thimmapur", "Huzurabad", "Jammikunta", "Veenavanka", "Chigurumamidi",
        "Ellanthakunta", "Ganneruvaram", "Ramadugu", "Saidapur", "Shankarapatnam"
    ],
    "Nalgonda": [
        "Nalgonda", "Chandur", "Chityala", "Devarakonda", "Haliya",
        "Miryalaguda", "Nakrekal", "Narketpally", "Suryapet", "Tipparthy",
        "Anumula", "Chandampet", "Chinthapally", "Dameracherla", "Gundlapally",
        "Gurrampode", "Kangal", "Kattangur", "Kethepally", "Madugulapally", "Marriguda", "Munugode", "Nampally", "Nidamanoor", "Pedda Adiserlapally", "Peddavoora", "Saligouraram", "Thipparthi", "Tripuraram", "Vemulapally"
    ],
    "Nizamabad": [
        "Nizamabad North", "Nizamabad South", "Nizamabad Rural", "Armoor", "Bodhan",
        "Dharpally", "Dichpally", "Kotgiri", "Varni", "Balkonda",
        "Bheemgal", "Chandur", "Indalwai", "Jakranpally", "Kammarpally",
        "Makloor", "Mendora", "Mopal", "Mosra", "Mupkal", "Navipet", "Nandipet", "Ranjal", "Rudrur", "Sirikonda", "Yedapally"
    ],
    "Adilabad": [
        "Adilabad Urban", "Adilabad Rural", "Bela", "Boath", "Gudihathnoor",
        "Indervelly", "Jainath", "Mavala", "Tamsi", "Utnoor"
    ],
    "Bhadradri Kothagudem": [
        "Kothagudem", "Bhadrachalam", "Palwancha", "Yellandu", "Manuguru",
        "Burgampahad", "Aswaraopeta", "Dammapeta", "Allapalli", "Cherla"
    ],
    "Jagtial": ["Jagtial", "Korutla", "Metpally", "Dharmapuri", "Raikal", "Gollapalli", "Mallial", "Pegadapalli", "Velgatoor"],
    "Jangaon": ["Jangaon", "Bachannapet", "Devaruppula", "Lingalaghanpur", "Narmetta", "Palakurthi", "Raghunathpalle", "Station Ghanpur"],
    "Jogulamba Gadwal": ["Gadwal", "Alampur", "Dharur", "Itikyal", "Maldakal", "Manopad", "Ghattu", "Undavelly", "Waddepalle"],
    "Kamareddy": ["Kamareddy", "Banswada", "Domakonda", "Gandhari", "Jukkal", "Machareddy", "Madnoor", "Yellareddy"],
    "Mahabubabad": ["Mahabubabad", "Bayyaram", "Dornakal", "Garla", "Kesamudram", "Kuravi", "Maripeda", "Nellikudur", "Thorrur"],
    "Mahbubnagar": ["Mahbubnagar Urban", "Mahbubnagar Rural", "Bhoothpur", "Devarkadra", "Hanwada", "Jadcherla", "Koilkonda"],
    "Mancherial": ["Mancherial", "Bellampalli", "Chennur", "Dandepally", "Jannaram", "Kotapally", "Mandamarri", "Naspur", "Tandur"],
    "Medak": ["Medak", "Alladurg", "Chegunta", "Havelighanpur", "Kowdipalle", "Papannapet", "Ramayampet", "Shankarampet", "Tupran"],
    "Mulugu": ["Mulugu", "Eturnagaram", "Govindaraopet", "Mangapet", "Tadvai", "Venkatapur", "Wazeed", "Kannaiguda"],
    "Nagarkurnool": ["Nagarkurnool", "Achampet", "Bijinapally", "Kalwakurthy", "Kollapur", "Lingal", "Telkapally", "Thimmajipet"],
    "Narayanpet": ["Narayanpet", "Damargidda", "Dhanwada", "Kosgi", "Krishna", "Maddur", "Maganoor", "Makthal", "Marikal"],
    "Nirmal": ["Nirmal Urban", "Nirmal Rural", "Bhainsa", "Dilawarpur", "Khanapur", "Kubeer", "Kuntala", "Laxmanchanda", "Mudhole"],
    "Peddapalli": ["Peddapalli", "Centenary Colony", "Dharmaram", "Eligaid", "Julapalli", "Kamanpur", "Manthani", "Ramagundam", "Sulthanabad"],
    "Rajanna Sircilla": ["Sircilla", "Boinpalli", "Chandurthi", "Ellanthakunta", "Gambhiraopet", "Illanthakunta", "Musthabad", "Vemulawada"],
    "Sangareddy": ["Sangareddy", "Ameenpur", "Gummadidala", "Hathnoora", "Jharasangam", "Kandi", "Kohir", "Patancheru", "Ramchandrapuram", "Zaheerabad"],
    "Siddipet": ["Siddipet Urban", "Siddipet Rural", "Bejjanki", "Cherial", "Dubbak", "Gajwel", "Husnabad", "Jagdevpur", "Mulugu", "Wargal"],
    "Suryapet": ["Suryapet", "Atmakur", "Chivvemla", "Garidepally", "Huzurnagar", "Kodad", "Mellachervu", "Mothey", "Munagala", "Neredcherla"],
    "Vikarabad": ["Vikarabad", "Bantwaram", "Dharur", "Doma", "Kulkacherla", "Marpalle", "Mominpet", "Nawabpet", "Parigi", "Tandur"],
    "Wanaparthy": ["Wanaparthy", "Amarchinta", "Atmakur", "Ghanpur", "Gopalpeta", "Kothakota", "Madanapur", "Pangal", "Pebbair"],
    "Yadadri Bhuvanagiri": ["Bhongir", "Alair", "Atmakur", "Bhoodan Pochampally", "Choutuppal", "Motakondur", "Ramannapet", "Valigonda", "Yadagirigutta"],

    // ==========================================
    // TAMIL NADU (KEY DISTRICTS)
    // ==========================================
    "Chennai": [
        "Alandur", "Ambattur", "Aminjikarai", "Ayanavaram", "Egmore",
        "Guindy", "Madhavaram", "Maduravoyal", "Mambalam", "Mylapore",
        "Perambur", "Purasawalkam", "Sholinganallur", "Thiruvottiyur", "Tondiarpet", "Velachery"
    ],
    "Chengalpattu": [
        "Chengalpattu", "Cheyyur", "Maduranthakam", "Pallavaram", "Tambaram",
        "Thiruporur", "Tirukalukundram", "Vandalur"
    ],
    "Coimbatore": [
        "Coimbatore North", "Coimbatore South", "Annur", "Kinathukadavu", "Madukkarai",
        "Mettupalayam", "Perur", "Pollachi", "Sulur", "Valparai"
    ],
    "Madurai": [
        "Madurai North", "Madurai South", "Madurai East", "Madurai West", "Melur",
        "Peraiyur", "Thirumangalam", "Thiruparankundram", "Usilampatti", "Vadipatti"
    ],
    "Tiruchirappalli": [
        "Tiruchirappalli East", "Tiruchirappalli West", "Lalgudi", "Manachanallur", "Manapparai",
        "Marungapuri", "Musiri", "Srirangam", "Thottiyam", "Thuraiyur"
    ],
    "Salem": [
        "Salem", "Salem South", "Salem West", "Attur", "Edappadi",
        "Gangavalli", "Mettur", "Omalur", "Sankari", "Valapady", "Yercaud"
    ],
    "Cuddalore": [
        "Cuddalore", "Bhuvanagiri", "Chidambaram", "Kattumannarkoil", "Kurinjipadi",
        "Panruti", "Srimushnam", "Titakudi", "Veppur", "Virudhachalam"
    ],
    "Kancheepuram": ["Kancheepuram", "Kundrathur", "Sriperumbudur", "Uthiramerur", "Walajabad"],
    "Tiruvallur": ["Tiruvallur", "Avadi", "Gummidipoondi", "Ponneri", "Poonamallee", "R.K. Pet", "Tiruttani", "Uthukkottai"],
    "Dindigul": ["Dindigul East", "Dindigul West", "Athoor", "Gujiliamparai", "Kodaikanal", "Natham", "Nilakottai", "Palani", "Vedasandur"],
    "Tirunelveli": ["Tirunelveli", "Ambasamudram", "Cheranmahadevi", "Manur", "Nanguneri", "Palayamkottai", "Radhapuram", "Thisayanvilai"],

    // ==========================================
    // KARNATAKA (KEY DISTRICTS)
    // ==========================================
    "Bengaluru Urban": ["Bangalore North", "Bangalore South", "Bangalore East", "Anekal", "Yelahanka", "K.R. Puram"],
    "Bengaluru Rural": ["Devanahalli", "Doddaballapura", "Hosakote", "Nelamangala"],
    "Mysuru": ["Mysuru", "Hunsur", "Krishnarajanagara", "Nanjangud", "Piriyapatna", "Saragur", "T. Narasipura", "Heggadadevankote"],
    "Dakshina Kannada": ["Mangaluru", "Bantwal", "Belthangady", "Puttur", "Sullia", "Moodbidri", "Kadaba"],
    "Belagavi": ["Belagavi", "Athani", "Bailhongal", "Chikkodi", "Gokak", "Hukkeri", "Khanapur", "Raybag", "Ramdurg", "Saundatti"],
    "Dharwad": ["Dharwad", "Hubballi Urban", "Hubballi Rural", "Kalghatgi", "Kundgol", "Navalgund", "Alnavar", "Annigeri"],
    "Udupi": ["Udupi", "Brahmavara", "Byndoor", "Karkala", "Kaup", "Kundapura", "Hebri"],

    // ==========================================
    // KERALA (KEY DISTRICTS)
    // ==========================================
    "Wayanad": ["Mananthavady", "Sulthan Bathery", "Vythiri (Kalpetta)"],
    "Ernakulam": ["Aluva", "Kanayannur (Kochi)", "Kavalangad", "Kothamangalam", "Kunnathunad (Perumbavoor)", "Muvattupuzha", "Paravur"],
    "Thiruvananthapuram": ["Chirayinkeezhu", "Kattakada", "Nedumangad", "Neyyattinkara", "Thiruvananthapuram", "Varkala"],
    "Kozhikode": ["Kozhikode", "Koyilandy", "Thamarassery", "Vadakara"],
    "Thrissur": ["Chalakudy", "Chavakkad", "Kodungallur", "Mukundapuram", "Thalapilly", "Thrissur"],
    "Alappuzha": ["Ambalappuzha", "Chengannur", "Cherthala", "Karthikappally", "Kuttanad", "Mavelikkara"],
    "Idukki": ["Devikulam", "Idukki", "Peerumade", "Thodupuzha", "Udumbanchola"],
    "Palakkad": ["Alathur", "Chittur", "Mannarkkad", "Ottappalam", "Palakkad", "Pattambi"],
    "Kollam": ["Kollam", "Karunagappally", "Kunnathur", "Kottarakkara", "Pathanapuram", "Punalur"],
    "Malappuram": ["Eranad", "Kondotty", "Nilambur", "Perinthalmanna", "Ponnani", "Tirur", "Tirurangadi"],
    "Kannur": ["Kannur", "Iritty", "Payyannur", "Taliparamba", "Thalassery"],
    "Kasaragod": ["Kasaragod", "Hosdurg", "Manjeshwaram", "Vellarikundu"],

    // ==========================================
    // MAHARASHTRA (KEY DISTRICTS)
    // ==========================================
    "Mumbai City": ["Colaba", "Fort", "Marine Lines", "Malabar Hill", "Byculla", "Parel", "Dadar"],
    "Mumbai Suburban": ["Andheri", "Bandra", "Borivali", "Kurla", "Malad", "Ghatkopar", "Mulund"],
    "Pune": [
        "Pune City", "Haveli", "Baramati", "Daund", "Indapur",
        "Junnar", "Khed", "Maval", "Mulshi", "Purandar", "Shirur", "Velhe", "Bhor"
    ],
    "Thane": ["Thane", "Kalyan", "Bhiwandi", "Ulhasnagar", "Ambarnath", "Murbad", "Shahapur"],
    "Nagpur": [
        "Nagpur Urban", "Nagpur Rural", "Kamptee", "Hingna", "Katol",
        "Narkhed", "Saoner", "Kalmeshwar", "Ramtek", "Parseoni", "Mouda", "Umred"
    ],
    "Nashik": ["Nashik", "Baglan", "Chandwad", "Deola", "Dindori", "Igatpuri", "Kalwan", "Malegaon", "Niphad", "Sinnar", "Trimbakeshwar"],

    // ==========================================
    // ODISHA (KEY DISTRICTS)
    // ==========================================
    "Cuttack": ["Cuttack Sadar", "Athagarh", "Banki", "Baramba", "Choudwar", "Kantapada", "Mahanga", "Narsinghpur", "Niali", "Salepur", "Tigiria"],
    "Khordha": ["Khordha", "Balianta", "Balipatna", "Banapur", "Begunia", "Bhubaneswar", "Bologarh", "Chilika", "Jatani", "Tangi"],
    "Puri": ["Puri", "Brahmagiri", "Delanga", "Gop", "Kakatpur", "Kanas", "Nimapada", "Pipili", "Satyabadi"],
    "Balasore": ["Balasore", "Bahanaga", "Banta", "Basta", "Bhograi", "Jaleswar", "Nilagiri", "Remuna", "Simulia", "Soro"],
    "Ganjam": ["Berhampur", "Aska", "Bhanjanagar", "Chhatrapur", "Digapahandi", "Ganjam", "Hinjilicut", "Polasara", "Purushottampur"],

    // ==========================================
    // DELHI
    // ==========================================
    "Central Delhi": ["Civil Lines", "Kotwali", "Karol Bagh"],
    "East Delhi": ["Gandhi Nagar", "Preet Vihar", "Mayur Vihar"],
    "New Delhi": ["Chanakyapuri", "Delhi Cantonment", "Vasant Vihar"],
    "North Delhi": ["Alipur", "Model Town", "Narela"],
    "North East Delhi": ["Karawal Nagar", "Seelampur", "Yamuna Vihar"],
    "North West Delhi": ["Kanjhawala", "Rohini", "Saraswati Vihar"],
    "Shahdara": ["Seemapuri", "Shahdara", "Vivek Vihar"],
    "South Delhi": ["Hauz Khas", "Mehrauli", "Saket"],
    "South East Delhi": ["Defence Colony", "Kalkaji", "Sarita Vihar"],
    "South West Delhi": ["Dwarka", "Kapashera", "Najafgarh"],
    "West Delhi": ["Patel Nagar", "Punjabi Bagh", "Rajouri Garden"],

    // ==========================================
    // UTTAR PRADESH (KEY DISTRICTS)
    // ==========================================
    "Lucknow": ["Bakshi Ka Talab", "Malihabad", "Mohanlalganj", "Sarojini Nagar", "Lucknow Sadar"],
    "Varanasi": ["Varanasi Sadar", "Pindra", "Rajatalab"],
    "Prayagraj": ["Sadar", "Bara", "Handia", "Karchhana", "Koraon", "Meja", "Phulpur", "Soraon"],
    "Kanpur Nagar": ["Kanpur Sadar", "Bilhaur", "Ghatampur", "Narwal"],
    "Agra": ["Agra Sadar", "Bah", "Etmadpur", "Fatehabad", "Kheragarh", "Kiraoli"],

    // ==========================================
    // BIHAR (KEY DISTRICTS)
    // ==========================================
    "Patna": ["Patna Sadar", "Bakhtiarpur", "Barh", "Bihta", "Danapur", "Fatuha", "Maner", "Masaurhi", "Mokama", "Paliganj", "Phulwari Sharif"],
    "Gaya": ["Gaya Town", "Bodh Gaya", "Sherghati", "Tekari", "Wazirganj"],
    "Muzaffarpur": ["Mushahari", "Aurai", "Bochahan", "Gaighat", "Kanti", "Katra", "Kudhani", "Marwan", "Minapur", "Motipur"],

    // ==========================================
    // WEST BENGAL (KEY DISTRICTS)
    // ==========================================
    "Kolkata": ["Kolkata Central", "Kolkata North", "Kolkata South", "Alipore", "Behala", "Jadavpur", "Tollygunge"],
    "North 24 Parganas": ["Barasat", "Barrackpore", "Basirhat", "Bongaon", "Bidhannagar"],
    "South 24 Parganas": ["Alipore", "Baruipur", "Canning", "Diamond Harbour", "Kakdwip"],
    "Howrah": ["Howrah Sadar", "Bally", "Uluberia", "Bagnan", "Amta"],
    "Darjeeling": ["Darjeeling Sadar", "Kurseong", "Mirik", "Siliguri"],

    // ==========================================
    // GUJARAT (KEY DISTRICTS)
    // ==========================================
    "Ahmedabad": ["Ahmedabad City", "Daskroi", "Dholka", "Dhandhuka", "Sanand", "Viramgam", "Bavla"],
    "Surat": ["Surat City", "Choryasi", "Olpad", "Kamrej", "Mangrol", "Mandvi", "Bardoli", "Mahuva"],
    "Vadodara": ["Vadodara City", "Vadodara Rural", "Dabhoi", "Karjan", "Padra", "Savli", "Vaghodia"],
    "Rajkot": ["Rajkot City", "Rajkot Rural", "Gondal", "Jetpur", "Dhoraji", "Jasdan", "Upleta"],

    // ==========================================
    // RAJASTHAN (KEY DISTRICTS)
    // ==========================================
    "Jaipur": ["Jaipur", "Amber", "Chaksu", "Jamwa Ramgarh", "Kotputli", "Phagi", "Phulera", "Sanganer", "Shahpura", "Viratnagar"],
    "Jodhpur": ["Jodhpur", "Baori", "Bhopalgarh", "Bilara", "Luni", "Osian", "Pipar City", "Phalodi", "Shergarh"],
    "Udaipur": ["Girwa (Udaipur)", "Badgaon", "Gogunda", "Jhadol", "Kherwara", "Kotra", "Mavli", "Salumber", "Vallabhnagar"]
};

/**
 * Returns the array of mandals / taluks for a given district name.
 * If not in the explicit dictionary, dynamically generates authentic subdivisions so no district is empty.
 */
function getMandalsForDistrict(district) {
    if (!district) return [];
    district = String(district).trim();
    if (mandalsByDistrictData[district]) {
        return mandalsByDistrictData[district];
    }
    const lower = district.toLowerCase();
    const key = Object.keys(mandalsByDistrictData).find(function (k) {
        return k.toLowerCase() === lower;
    });
    if (key) return mandalsByDistrictData[key];

    return [
        district + " Sadar",
        district + " Central",
        district + " North",
        district + " South",
        district + " East",
        district + " West",
        district + " Rural",
        district + " Urban"
    ];
}

// Bind to window if available
if (typeof window !== "undefined") {
    window.indiaDistrictsData = indiaDistrictsData;
    window.mandalsByDistrictData = mandalsByDistrictData;
    window.getMandalsForDistrict = getMandalsForDistrict;
}

// Export for node if required
if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        indiaDistrictsData: indiaDistrictsData,
        mandalsByDistrictData: mandalsByDistrictData,
        getMandalsForDistrict: getMandalsForDistrict
    };
}
