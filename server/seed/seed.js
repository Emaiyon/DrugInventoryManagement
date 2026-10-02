const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Drug = require('../models/Drug');
const Supplier = require('../models/Supplier');
const Warehouse = require('../models/Warehouse');
const Inventory = require('../models/Inventory');
const Order = require('../models/Order');
const Shipment = require('../models/Shipment');
const Alert = require('../models/Alert');

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/drugtrack';

const seedDatabase = async () => {
  try {
    console.log(`Connecting to MongoDB at: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for seeding.');

    // 1. Clear existing collections
    console.log('Clearing existing database collections...');
    await User.deleteMany({});
    await Drug.deleteMany({});
    await Supplier.deleteMany({});
    await Warehouse.deleteMany({});
    await Inventory.deleteMany({});
    await Order.deleteMany({});
    await Shipment.deleteMany({});
    await Alert.deleteMany({});

    // 2. Seed Users
    console.log('Seeding demo users...');
    const users = await User.create([
      {
        name: 'Alexander Mitchell (Admin)',
        email: 'admin@drugtrack.com',
        password: 'password123',
        role: 'ADMIN',
        organization: 'DrugTrack Global Health Authority',
        phone: '+1 (555) 019-2831',
        status: 'ACTIVE',
      },
      {
        name: 'Dr. Jonathan Miller',
        email: 'supplier@drugtrack.com',
        password: 'password123',
        role: 'SUPPLIER',
        organization: 'Apex BioPharma Distribution',
        phone: '+1 (555) 014-9922',
        status: 'ACTIVE',
      },
      {
        name: 'Marcus Vance',
        email: 'warehouse@drugtrack.com',
        password: 'password123',
        role: 'WAREHOUSE_MANAGER',
        organization: 'East Coast Central Distribution',
        phone: '+1 (555) 018-7711',
        status: 'ACTIVE',
      },
      {
        name: 'Elena Rostova, PharmD',
        email: 'pharmacy@drugtrack.com',
        password: 'password123',
        role: 'PHARMACY_MANAGER',
        organization: 'Metro General Hospital Pharmacy',
        phone: '+1 (555) 012-3344',
        status: 'ACTIVE',
      },
    ]);

    const adminUser = users[0];
    const supplierUser = users[1];
    const warehouseUser = users[2];
    const pharmacyUser = users[3];

    // 3. Seed 25 Drugs
    console.log('Seeding 25 pharmaceutical drugs...');
    const drugData = [
      {
        name: 'Amoxicillin Trihydrate',
        genericName: 'Amoxicillin',
        category: 'Antibiotics',
        manufacturer: 'Pfizer Inc.',
        description: 'Broad-spectrum beta-lactam antibiotic used to treat bacterial infections.',
        dosageForm: 'Capsule',
        strength: '500mg',
        price: 18.5,
        prescriptionRequired: true,
        storageConditions: 'Store at 20-25°C',
        batchNumber: 'AMX-2026-90',
        manufacturingDate: new Date('2025-06-15'),
        expiryDate: new Date('2027-06-15'),
        status: 'ACTIVE',
      },
      {
        name: 'Lipitor (Atorvastatin)',
        genericName: 'Atorvastatin Calcium',
        category: 'Cardiology',
        manufacturer: 'Viatris',
        description: 'HMG-CoA reductase inhibitor for reducing cardiovascular risk and LDL.',
        dosageForm: 'Tablet',
        strength: '20mg',
        price: 34.0,
        prescriptionRequired: true,
        storageConditions: 'Store at 15-30°C',
        batchNumber: 'LIP-2025-11',
        manufacturingDate: new Date('2025-08-01'),
        expiryDate: new Date('2027-08-01'),
        status: 'ACTIVE',
      },
      {
        name: 'Glucophage (Metformin)',
        genericName: 'Metformin Hydrochloride',
        category: 'Antidiabetics',
        manufacturer: 'Merck KGaA',
        description: 'First-line medication for the treatment of type 2 diabetes mellitus.',
        dosageForm: 'Tablet',
        strength: '850mg',
        price: 12.75,
        prescriptionRequired: true,
        storageConditions: 'Store at 20-25°C',
        batchNumber: 'GLU-2026-03',
        manufacturingDate: new Date('2025-04-10'),
        expiryDate: new Date('2027-04-10'),
        status: 'ACTIVE',
      },
      {
        name: 'Prinivil (Lisinopril)',
        genericName: 'Lisinopril',
        category: 'Cardiology',
        manufacturer: 'AstraZeneca',
        description: 'ACE inhibitor used in hypertension and congestive heart failure.',
        dosageForm: 'Tablet',
        strength: '10mg',
        price: 15.2,
        prescriptionRequired: true,
        storageConditions: 'Store at 15-30°C',
        batchNumber: 'LIS-2026-88',
        manufacturingDate: new Date('2025-05-12'),
        expiryDate: new Date('2027-05-12'),
        status: 'ACTIVE',
      },
      {
        name: 'Prilosec (Omeprazole)',
        genericName: 'Omeprazole Delayed-Release',
        category: 'Gastroenterology',
        manufacturer: 'Novartis',
        description: 'Proton pump inhibitor treating GERD and peptic ulcer diseases.',
        dosageForm: 'Capsule',
        strength: '20mg',
        price: 22.4,
        prescriptionRequired: false,
        storageConditions: 'Store at 15-25°C',
        batchNumber: 'OME-2026-51',
        manufacturingDate: new Date('2025-09-01'),
        expiryDate: new Date('2027-09-01'),
        status: 'ACTIVE',
      },
      {
        name: 'Zithromax (Azithromycin)',
        genericName: 'Azithromycin Monohydrate',
        category: 'Antibiotics',
        manufacturer: 'Teva Pharmaceuticals',
        description: 'Macrolide antibiotic for respiratory tract and skin infections.',
        dosageForm: 'Tablet',
        strength: '250mg',
        price: 29.8,
        prescriptionRequired: true,
        storageConditions: 'Store at 20-25°C',
        batchNumber: 'AZI-2025-44',
        manufacturingDate: new Date('2025-03-20'),
        expiryDate: new Date('2026-11-15'), // Expiring soon
        status: 'ACTIVE',
      },
      {
        name: 'Cozaar (Losartan)',
        genericName: 'Losartan Potassium',
        category: 'Cardiology',
        manufacturer: 'Sun Pharma',
        description: 'Angiotensin II receptor antagonist used primarily for hypertension.',
        dosageForm: 'Tablet',
        strength: '50mg',
        price: 19.5,
        prescriptionRequired: true,
        storageConditions: 'Store below 25°C',
        batchNumber: 'LOS-2026-19',
        manufacturingDate: new Date('2025-07-10'),
        expiryDate: new Date('2027-07-10'),
        status: 'ACTIVE',
      },
      {
        name: 'Neurontin (Gabapentin)',
        genericName: 'Gabapentin',
        category: 'Neurology',
        manufacturer: 'Apotex Inc.',
        description: 'Anticonvulsant for neuropathic pain and focal seizures.',
        dosageForm: 'Capsule',
        strength: '300mg',
        price: 26.0,
        prescriptionRequired: true,
        storageConditions: 'Store at 25°C',
        batchNumber: 'GAB-2026-72',
        manufacturingDate: new Date('2025-02-14'),
        expiryDate: new Date('2027-02-14'),
        status: 'ACTIVE',
      },
      {
        name: 'HydroDIURIL (HCTZ)',
        genericName: 'Hydrochlorothiazide',
        category: 'Cardiology',
        manufacturer: 'Sandoz',
        description: 'Thiazide diuretic lowering blood pressure and edema.',
        dosageForm: 'Tablet',
        strength: '25mg',
        price: 11.0,
        prescriptionRequired: true,
        storageConditions: 'Store at 20-25°C',
        batchNumber: 'HCT-2026-33',
        manufacturingDate: new Date('2025-01-05'),
        expiryDate: new Date('2026-10-25'), // Expiring very soon
        status: 'ACTIVE',
      },
      {
        name: 'Zoloft (Sertraline)',
        genericName: 'Sertraline Hydrochloride',
        category: 'Psychiatry',
        manufacturer: 'Pfizer Inc.',
        description: 'SSRI antidepressant for major depressive disorder and anxiety.',
        dosageForm: 'Tablet',
        strength: '50mg',
        price: 31.5,
        prescriptionRequired: true,
        storageConditions: 'Store at 20-25°C',
        batchNumber: 'SER-2026-80',
        manufacturingDate: new Date('2025-09-10'),
        expiryDate: new Date('2027-09-10'),
        status: 'ACTIVE',
      },
      {
        name: 'Advil (Ibuprofen)',
        genericName: 'Ibuprofen',
        category: 'Analgesics',
        manufacturer: 'Abbott Laboratories',
        description: 'Nonsteroidal anti-inflammatory drug (NSAID) for pain and inflammation.',
        dosageForm: 'Tablet',
        strength: '400mg',
        price: 8.5,
        prescriptionRequired: false,
        storageConditions: 'Store at 15-25°C',
        batchNumber: 'IBU-2026-05',
        manufacturingDate: new Date('2025-10-01'),
        expiryDate: new Date('2028-10-01'),
        status: 'ACTIVE',
      },
      {
        name: 'Panadol (Paracetamol)',
        genericName: 'Acetaminophen / Paracetamol',
        category: 'Analgesics',
        manufacturer: 'GlaxoSmithKline',
        description: 'Mild analgesic and antipyretic for aches, fevers, and pains.',
        dosageForm: 'Tablet',
        strength: '500mg',
        price: 6.9,
        prescriptionRequired: false,
        storageConditions: 'Store below 30°C',
        batchNumber: 'PAR-2026-12',
        manufacturingDate: new Date('2025-11-15'),
        expiryDate: new Date('2028-11-15'),
        status: 'ACTIVE',
      },
      {
        name: 'Cipro (Ciprofloxacin)',
        genericName: 'Ciprofloxacin Hydrochloride',
        category: 'Antibiotics',
        manufacturer: 'Bayer HealthCare',
        description: 'Fluoroquinolone antibiotic treating severe urinary and joint infections.',
        dosageForm: 'Tablet',
        strength: '500mg',
        price: 36.2,
        prescriptionRequired: true,
        storageConditions: 'Store at 20-25°C',
        batchNumber: 'CIP-2025-67',
        manufacturingDate: new Date('2025-04-01'),
        expiryDate: new Date('2026-08-30'), // Expired
        status: 'ACTIVE',
      },
      {
        name: 'Synthroid (Levothyroxine)',
        genericName: 'Levothyroxine Sodium',
        category: 'Endocrinology',
        manufacturer: 'AbbVie',
        description: 'Synthetic thyroid hormone replacing deficiency in hypothyroidism.',
        dosageForm: 'Tablet',
        strength: '100mcg',
        price: 24.8,
        prescriptionRequired: true,
        storageConditions: 'Store at 20-25°C, protect from moisture',
        batchNumber: 'LEV-2026-99',
        manufacturingDate: new Date('2025-07-22'),
        expiryDate: new Date('2027-07-22'),
        status: 'ACTIVE',
      },
      {
        name: 'Norvasc (Amlodipine)',
        genericName: 'Amlodipine Besylate',
        category: 'Cardiology',
        manufacturer: 'Pfizer Inc.',
        description: 'Calcium channel blocker for hypertension and coronary artery disease.',
        dosageForm: 'Tablet',
        strength: '5mg',
        price: 17.6,
        prescriptionRequired: true,
        storageConditions: 'Store at 15-30°C',
        batchNumber: 'AML-2026-42',
        manufacturingDate: new Date('2025-06-30'),
        expiryDate: new Date('2027-06-30'),
        status: 'ACTIVE',
      },
      {
        name: 'Zocor (Simvastatin)',
        genericName: 'Simvastatin',
        category: 'Cardiology',
        manufacturer: 'Merck & Co.',
        description: 'Lipid-lowering agent managing dyslipidemia and atherosclerosis.',
        dosageForm: 'Tablet',
        strength: '20mg',
        price: 21.0,
        prescriptionRequired: true,
        storageConditions: 'Store at 20-25°C',
        batchNumber: 'SIM-2026-17',
        manufacturingDate: new Date('2025-05-05'),
        expiryDate: new Date('2027-05-05'),
        status: 'ACTIVE',
      },
      {
        name: 'Singulair (Montelukast)',
        genericName: 'Montelukast Sodium',
        category: 'Respiratory',
        manufacturer: 'Organon',
        description: 'Leukotriene receptor antagonist for asthma maintenance and allergic rhinitis.',
        dosageForm: 'Tablet',
        strength: '10mg',
        price: 28.5,
        prescriptionRequired: true,
        storageConditions: 'Store at 20-25°C',
        batchNumber: 'MON-2026-61',
        manufacturingDate: new Date('2025-08-14'),
        expiryDate: new Date('2027-08-14'),
        status: 'ACTIVE',
      },
      {
        name: 'Protonix (Pantoprazole)',
        genericName: 'Pantoprazole Sodium',
        category: 'Gastroenterology',
        manufacturer: 'Takeda',
        description: 'Proton pump inhibitor healing erosive esophagitis and Zollinger-Ellison.',
        dosageForm: 'Tablet',
        strength: '40mg',
        price: 25.4,
        prescriptionRequired: true,
        storageConditions: 'Store at 20-25°C',
        batchNumber: 'PAN-2026-09',
        manufacturingDate: new Date('2025-09-25'),
        expiryDate: new Date('2027-09-25'),
        status: 'ACTIVE',
      },
      {
        name: 'Vibramycin (Doxycycline)',
        genericName: 'Doxycycline Hyclate',
        category: 'Antibiotics',
        manufacturer: 'Fresenius Kabi',
        description: 'Tetracycline class antimicrobial treating atypical pneumonia and acne.',
        dosageForm: 'Capsule',
        strength: '100mg',
        price: 23.0,
        prescriptionRequired: true,
        storageConditions: 'Protect from light and moisture',
        batchNumber: 'DOX-2026-38',
        manufacturingDate: new Date('2025-04-18'),
        expiryDate: new Date('2027-04-18'),
        status: 'ACTIVE',
      },
      {
        name: 'Ultram (Tramadol)',
        genericName: 'Tramadol Hydrochloride',
        category: 'Analgesics',
        manufacturer: 'Sanofi',
        description: 'Centrally acting synthetic opioid analgesic for moderate to severe pain.',
        dosageForm: 'Tablet',
        strength: '50mg',
        price: 27.5,
        prescriptionRequired: true,
        storageConditions: 'Controlled substance storage, 20-25°C',
        batchNumber: 'TRA-2026-94',
        manufacturingDate: new Date('2025-03-10'),
        expiryDate: new Date('2027-03-10'),
        status: 'ACTIVE',
      },
      {
        name: 'Plavix (Clopidogrel)',
        genericName: 'Clopidogrel Bisulfate',
        category: 'Cardiology',
        manufacturer: 'Sanofi',
        description: 'Antiplatelet medication preventing heart attacks and thrombotic strokes.',
        dosageForm: 'Tablet',
        strength: '75mg',
        price: 38.0,
        prescriptionRequired: true,
        storageConditions: 'Store at 25°C',
        batchNumber: 'PLA-2026-53',
        manufacturingDate: new Date('2025-07-07'),
        expiryDate: new Date('2027-07-07'),
        status: 'ACTIVE',
      },
      {
        name: 'Lantus (Insulin Glargine)',
        genericName: 'Insulin Glargine Recombinant',
        category: 'Antidiabetics',
        manufacturer: 'Sanofi Aventis',
        description: 'Long-acting basal human insulin analog given once daily.',
        dosageForm: 'Injection',
        strength: '100 units/mL',
        price: 85.0,
        prescriptionRequired: true,
        storageConditions: 'Refrigerate at 2-8°C, do not freeze',
        batchNumber: 'LAN-2026-01',
        manufacturingDate: new Date('2025-10-10'),
        expiryDate: new Date('2027-04-10'),
        status: 'ACTIVE',
      },
      {
        name: 'Ventolin HFA (Albuterol)',
        genericName: 'Albuterol Sulfate',
        category: 'Respiratory',
        manufacturer: 'GlaxoSmithKline',
        description: 'Short-acting beta2-adrenergic agonist for acute bronchospasms.',
        dosageForm: 'Inhaler',
        strength: '90mcg/actuation',
        price: 45.0,
        prescriptionRequired: true,
        storageConditions: 'Store at 20-25°C, away from open flame',
        batchNumber: 'ALB-2026-84',
        manufacturingDate: new Date('2025-06-01'),
        expiryDate: new Date('2027-06-01'),
        status: 'ACTIVE',
      },
      {
        name: 'Crestor (Rosuvastatin)',
        genericName: 'Rosuvastatin Calcium',
        category: 'Cardiology',
        manufacturer: 'AstraZeneca',
        description: 'Potent statin medication for familial hypercholesterolemia prevention.',
        dosageForm: 'Tablet',
        strength: '10mg',
        price: 39.5,
        prescriptionRequired: true,
        storageConditions: 'Store at 20-25°C',
        batchNumber: 'ROS-2026-27',
        manufacturingDate: new Date('2025-08-20'),
        expiryDate: new Date('2027-08-20'),
        status: 'ACTIVE',
      },
      {
        name: 'Lasix (Furosemide)',
        genericName: 'Furosemide',
        category: 'Cardiology',
        manufacturer: 'Sanofi',
        description: 'Loop diuretic used to treat fluid build-up due to heart failure and renal disease.',
        dosageForm: 'Tablet',
        strength: '40mg',
        price: 9.8,
        prescriptionRequired: true,
        storageConditions: 'Protect from light, 15-30°C',
        batchNumber: 'FUR-2026-16',
        manufacturingDate: new Date('2025-05-18'),
        expiryDate: new Date('2027-05-18'),
        status: 'ACTIVE',
      },
    ];

    const drugs = await Drug.create(drugData);

    // 4. Seed 11 Suppliers
    console.log('Seeding 11 verified suppliers...');
    const supplierData = [
      {
        companyName: 'Apex BioPharma Distribution',
        contactPerson: 'Dr. Jonathan Miller',
        email: 'supplier@drugtrack.com', // Demo supplier account
        phone: '+1 (555) 014-9922',
        address: '400 Biopharma Way, Suite 500',
        city: 'Cambridge, MA',
        country: 'United States',
        licenseNumber: 'FDA-REG-778291',
        rating: 4.9,
        status: 'ACTIVE',
        products: [drugs[0]._id, drugs[1]._id, drugs[2]._id, drugs[3]._id],
        paymentTerms: 'Net 30 Days',
      },
      {
        companyName: 'MediSupply Global Logistics',
        contactPerson: 'Sarah Jenkins',
        email: 'sjenkins@medisupply-global.com',
        phone: '+1 (555) 015-8833',
        address: '1200 Logistics Blvd',
        city: 'Atlanta, GA',
        country: 'United States',
        licenseNumber: 'FDA-REG-449102',
        rating: 4.8,
        status: 'ACTIVE',
        products: [drugs[4]._id, drugs[5]._id, drugs[6]._id],
        paymentTerms: 'Net 30 Days',
      },
      {
        companyName: 'PharmoChem Innovations',
        contactPerson: 'Michael Chang, RPh',
        email: 'mchang@pharmochem-innov.com',
        phone: '+1 (555) 019-3321',
        address: '850 Innovation Parkway',
        city: 'San Diego, CA',
        country: 'United States',
        licenseNumber: 'FDA-REG-882310',
        rating: 4.7,
        status: 'ACTIVE',
        products: [drugs[7]._id, drugs[8]._id, drugs[9]._id],
        paymentTerms: 'Net 45 Days',
      },
      {
        companyName: 'BioHealth Therapeutics Ltd',
        contactPerson: 'Elena Rostova',
        email: 'contact@biohealth-thera.com',
        phone: '+1 (555) 012-7744',
        address: '77 Medical Center Drive',
        city: 'Philadelphia, PA',
        country: 'United States',
        licenseNumber: 'FDA-REG-109283',
        rating: 4.9,
        status: 'ACTIVE',
        products: [drugs[10]._id, drugs[11]._id, drugs[12]._id],
        paymentTerms: 'Net 30 Days',
      },
      {
        companyName: 'NovaCure Pharmaceuticals',
        contactPerson: 'David Vance',
        email: 'dvance@novacure-pharma.com',
        phone: '+1 (555) 017-5566',
        address: '320 Science Park Lane',
        city: 'Austin, TX',
        country: 'United States',
        licenseNumber: 'FDA-REG-394821',
        rating: 4.6,
        status: 'ACTIVE',
        products: [drugs[13]._id, drugs[14]._id, drugs[15]._id],
        paymentTerms: 'Net 15 Days',
      },
      {
        companyName: 'Vanguard Medical Supplies',
        contactPerson: 'Robert Sterling',
        email: 'rsterling@vanguard-med.com',
        phone: '+1 (555) 011-4455',
        address: '500 Enterprise Way',
        city: 'Chicago, IL',
        country: 'United States',
        licenseNumber: 'FDA-REG-552091',
        rating: 4.8,
        status: 'ACTIVE',
        products: [drugs[16]._id, drugs[17]._id],
        paymentTerms: 'Net 30 Days',
      },
      {
        companyName: 'Sterling Health Imports',
        contactPerson: 'Maria Santos',
        email: 'msantos@sterling-imports.com',
        phone: '+1 (555) 018-6677',
        address: '150 Harbor View Terminal',
        city: 'Miami, FL',
        country: 'United States',
        licenseNumber: 'FDA-REG-993812',
        rating: 4.5,
        status: 'ACTIVE',
        products: [drugs[18]._id, drugs[19]._id],
        paymentTerms: 'Net 60 Days',
      },
      {
        companyName: 'Zenith Pharma Partners',
        contactPerson: 'Kevin O\'Connor',
        email: 'koconnor@zenithpharma.com',
        phone: '+1 (555) 013-2211',
        address: '900 Summit Avenue',
        city: 'Minneapolis, MN',
        country: 'United States',
        licenseNumber: 'FDA-REG-662910',
        rating: 4.7,
        status: 'ACTIVE',
        products: [drugs[20]._id, drugs[21]._id],
        paymentTerms: 'Net 30 Days',
      },
      {
        companyName: 'PrimeRx Distribution Network',
        contactPerson: 'Linda Zhao',
        email: 'lzhao@primerx-dist.com',
        phone: '+1 (555) 016-1188',
        address: '610 Distribution Way',
        city: 'Denver, CO',
        country: 'United States',
        licenseNumber: 'FDA-REG-331094',
        rating: 4.8,
        status: 'ACTIVE',
        products: [drugs[22]._id, drugs[23]._id],
        paymentTerms: 'Net 30 Days',
      },
      {
        companyName: 'CarePharma International',
        contactPerson: 'Carlos Morales',
        email: 'cmorales@carepharma.com',
        phone: '+1 (555) 014-4433',
        address: '220 International Blvd',
        city: 'Houston, TX',
        country: 'United States',
        licenseNumber: 'FDA-REG-881923',
        rating: 4.9,
        status: 'ACTIVE',
        products: [drugs[24]._id],
        paymentTerms: 'Net 30 Days',
      },
      {
        companyName: 'Summit Life Sciences',
        contactPerson: 'Emily Watson',
        email: 'ewatson@summitlifesci.com',
        phone: '+1 (555) 012-8899',
        address: '100 Alpine Way',
        city: 'Seattle, WA',
        country: 'United States',
        licenseNumber: 'FDA-REG-110293',
        rating: 4.6,
        status: 'ACTIVE',
        products: [drugs[0]._id, drugs[5]._id],
        paymentTerms: 'Net 45 Days',
      },
    ];

    const suppliers = await Supplier.create(supplierData);

    // 5. Seed 10 Warehouses
    console.log('Seeding 10 regional warehouses...');
    const warehouseData = [
      {
        name: 'East Coast Central Hub',
        code: 'WH-EAST-01',
        location: { address: '100 Port Street', city: 'Newark', state: 'NJ', country: 'USA', zipCode: '07114' },
        capacity: 100000,
        currentUtilization: 68,
        manager: warehouseUser._id,
        managerName: 'Marcus Vance',
        contactNumber: '+1 (555) 201-9901',
        temperatureControlled: true,
        status: 'ACTIVE',
      },
      {
        name: 'Pacific Northwest Depot',
        code: 'WH-WEST-02',
        location: { address: '450 Harbor Island Way', city: 'Seattle', state: 'WA', country: 'USA', zipCode: '98134' },
        capacity: 75000,
        currentUtilization: 54,
        manager: warehouseUser._id,
        managerName: 'Rachel Adams',
        contactNumber: '+1 (555) 206-8802',
        temperatureControlled: true,
        status: 'ACTIVE',
      },
      {
        name: 'Midwest Distribution Facility',
        code: 'WH-MID-03',
        location: { address: '880 Logistics Lane', city: 'Chicago', state: 'IL', country: 'USA', zipCode: '60609' },
        capacity: 90000,
        currentUtilization: 72,
        manager: warehouseUser._id,
        managerName: 'David Lee',
        contactNumber: '+1 (555) 312-7703',
        temperatureControlled: true,
        status: 'ACTIVE',
      },
      {
        name: 'Gulf Coast Cold Storage Center',
        code: 'WH-SOUTH-04',
        location: { address: '1200 Ship Channel Blvd', city: 'Houston', state: 'TX', country: 'USA', zipCode: '77012' },
        capacity: 85000,
        currentUtilization: 61,
        manager: warehouseUser._id,
        managerName: 'Carlos Gutierrez',
        contactNumber: '+1 (555) 713-6604',
        temperatureControlled: true,
        status: 'ACTIVE',
      },
      {
        name: 'Heartland Pharma Storage',
        code: 'WH-CENT-05',
        location: { address: '300 Freight Way', city: 'Kansas City', state: 'MO', country: 'USA', zipCode: '64120' },
        capacity: 65000,
        currentUtilization: 48,
        manager: warehouseUser._id,
        managerName: 'Jessica Taylor',
        contactNumber: '+1 (555) 816-5505',
        temperatureControlled: true,
        status: 'ACTIVE',
      },
      {
        name: 'Southwest Transit Terminal',
        code: 'WH-SW-06',
        location: { address: '710 Desert Sky Blvd', city: 'Phoenix', state: 'AZ', country: 'USA', zipCode: '85043' },
        capacity: 60000,
        currentUtilization: 42,
        manager: warehouseUser._id,
        managerName: 'Aaron Cooper',
        contactNumber: '+1 (555) 602-4406',
        temperatureControlled: true,
        status: 'ACTIVE',
      },
      {
        name: 'New England Logistics Point',
        code: 'WH-NE-07',
        location: { address: '220 Tech Park Road', city: 'Boston', state: 'MA', country: 'USA', zipCode: '02118' },
        capacity: 55000,
        currentUtilization: 50,
        manager: warehouseUser._id,
        managerName: 'Lauren Hayes',
        contactNumber: '+1 (555) 617-3307',
        temperatureControlled: true,
        status: 'ACTIVE',
      },
      {
        name: 'Southeast Regional Depository',
        code: 'WH-SE-08',
        location: { address: '550 Peachtree Logistics Drive', city: 'Atlanta', state: 'GA', country: 'USA', zipCode: '30344' },
        capacity: 80000,
        currentUtilization: 65,
        manager: warehouseUser._id,
        managerName: 'Derrick Wright',
        contactNumber: '+1 (555) 404-2208',
        temperatureControlled: true,
        status: 'ACTIVE',
      },
      {
        name: 'California Central Warehouse',
        code: 'WH-CAL-09',
        location: { address: '990 Industrial Parkway', city: 'Sacramento', state: 'CA', country: 'USA', zipCode: '95828' },
        capacity: 70000,
        currentUtilization: 58,
        manager: warehouseUser._id,
        managerName: 'Stephanie Fong',
        contactNumber: '+1 (555) 916-1109',
        temperatureControlled: true,
        status: 'ACTIVE',
      },
      {
        name: 'Mountain States Cold Facility',
        code: 'WH-ROCK-10',
        location: { address: '640 Mountain View Way', city: 'Denver', state: 'CO', country: 'USA', zipCode: '80216' },
        capacity: 50000,
        currentUtilization: 39,
        manager: warehouseUser._id,
        managerName: 'Brian Schultz',
        contactNumber: '+1 (555) 303-0010',
        temperatureControlled: true,
        status: 'ACTIVE',
      },
    ];

    const warehouses = await Warehouse.create(warehouseData);

    // 6. Seed 35 Inventory Batches
    console.log('Seeding 35 inventory batches across warehouses...');
    const now = new Date();
    const inventoryData = [
      // In Stock Batches
      { drug: drugs[0]._id, batchNumber: 'AMX-2026-B1', quantity: 2400, unitPrice: 18.5, supplier: suppliers[0]._id, warehouse: warehouses[0]._id, manufacturingDate: new Date('2025-06-15'), expiryDate: new Date('2027-06-15'), minimumStockLevel: 200, location: 'Aisle 1, Rack A' },
      { drug: drugs[1]._id, batchNumber: 'LIP-2026-B2', quantity: 1850, unitPrice: 34.0, supplier: suppliers[0]._id, warehouse: warehouses[0]._id, manufacturingDate: new Date('2025-08-01'), expiryDate: new Date('2027-08-01'), minimumStockLevel: 150, location: 'Aisle 1, Rack B' },
      { drug: drugs[2]._id, batchNumber: 'GLU-2026-B3', quantity: 3200, unitPrice: 12.75, supplier: suppliers[0]._id, warehouse: warehouses[1]._id, manufacturingDate: new Date('2025-04-10'), expiryDate: new Date('2027-04-10'), minimumStockLevel: 300, location: 'Aisle 2, Rack A' },
      { drug: drugs[3]._id, batchNumber: 'LIS-2026-B4', quantity: 1400, unitPrice: 15.2, supplier: suppliers[1]._id, warehouse: warehouses[1]._id, manufacturingDate: new Date('2025-05-12'), expiryDate: new Date('2027-05-12'), minimumStockLevel: 200, location: 'Aisle 2, Rack B' },
      { drug: drugs[4]._id, batchNumber: 'OME-2026-B5', quantity: 950, unitPrice: 22.4, supplier: suppliers[1]._id, warehouse: warehouses[2]._id, manufacturingDate: new Date('2025-09-01'), expiryDate: new Date('2027-09-01'), minimumStockLevel: 150, location: 'Aisle 3, Rack A' },
      { drug: drugs[6]._id, batchNumber: 'LOS-2026-B6', quantity: 1600, unitPrice: 19.5, supplier: suppliers[2]._id, warehouse: warehouses[2]._id, manufacturingDate: new Date('2025-07-10'), expiryDate: new Date('2027-07-10'), minimumStockLevel: 180, location: 'Aisle 3, Rack C' },
      { drug: drugs[7]._id, batchNumber: 'GAB-2026-B7', quantity: 1100, unitPrice: 26.0, supplier: suppliers[2]._id, warehouse: warehouses[3]._id, manufacturingDate: new Date('2025-02-14'), expiryDate: new Date('2027-02-14'), minimumStockLevel: 120, location: 'Aisle 4, Rack A' },
      { drug: drugs[9]._id, batchNumber: 'SER-2026-B8', quantity: 2100, unitPrice: 31.5, supplier: suppliers[3]._id, warehouse: warehouses[3]._id, manufacturingDate: new Date('2025-09-10'), expiryDate: new Date('2027-09-10'), minimumStockLevel: 250, location: 'Aisle 4, Rack B' },
      { drug: drugs[10]._id, batchNumber: 'IBU-2026-B9', quantity: 5000, unitPrice: 8.5, supplier: suppliers[3]._id, warehouse: warehouses[4]._id, manufacturingDate: new Date('2025-10-01'), expiryDate: new Date('2028-10-01'), minimumStockLevel: 500, location: 'Aisle 5, Rack A' },
      { drug: drugs[11]._id, batchNumber: 'PAR-2026-B10', quantity: 6200, unitPrice: 6.9, supplier: suppliers[4]._id, warehouse: warehouses[4]._id, manufacturingDate: new Date('2025-11-15'), expiryDate: new Date('2028-11-15'), minimumStockLevel: 600, location: 'Aisle 5, Rack B' },
      { drug: drugs[13]._id, batchNumber: 'LEV-2026-B11', quantity: 1900, unitPrice: 24.8, supplier: suppliers[4]._id, warehouse: warehouses[5]._id, manufacturingDate: new Date('2025-07-22'), expiryDate: new Date('2027-07-22'), minimumStockLevel: 200, location: 'Aisle 6, Rack A' },
      { drug: drugs[14]._id, batchNumber: 'AML-2026-B12', quantity: 2500, unitPrice: 17.6, supplier: suppliers[5]._id, warehouse: warehouses[5]._id, manufacturingDate: new Date('2025-06-30'), expiryDate: new Date('2027-06-30'), minimumStockLevel: 300, location: 'Aisle 6, Rack B' },
      { drug: drugs[15]._id, batchNumber: 'SIM-2026-B13', quantity: 1750, unitPrice: 21.0, supplier: suppliers[5]._id, warehouse: warehouses[6]._id, manufacturingDate: new Date('2025-05-05'), expiryDate: new Date('2027-05-05'), minimumStockLevel: 150, location: 'Aisle 7, Rack A' },
      { drug: drugs[16]._id, batchNumber: 'MON-2026-B14', quantity: 1300, unitPrice: 28.5, supplier: suppliers[6]._id, warehouse: warehouses[6]._id, manufacturingDate: new Date('2025-08-14'), expiryDate: new Date('2027-08-14'), minimumStockLevel: 140, location: 'Aisle 7, Rack B' },
      { drug: drugs[17]._id, batchNumber: 'PAN-2026-B15', quantity: 2200, unitPrice: 25.4, supplier: suppliers[6]._id, warehouse: warehouses[7]._id, manufacturingDate: new Date('2025-09-25'), expiryDate: new Date('2027-09-25'), minimumStockLevel: 250, location: 'Aisle 8, Rack A' },
      { drug: drugs[18]._id, batchNumber: 'DOX-2026-B16', quantity: 980, unitPrice: 23.0, supplier: suppliers[7]._id, warehouse: warehouses[7]._id, manufacturingDate: new Date('2025-04-18'), expiryDate: new Date('2027-04-18'), minimumStockLevel: 100, location: 'Aisle 8, Rack B' },
      { drug: drugs[19]._id, batchNumber: 'TRA-2026-B17', quantity: 820, unitPrice: 27.5, supplier: suppliers[7]._id, warehouse: warehouses[8]._id, manufacturingDate: new Date('2025-03-10'), expiryDate: new Date('2027-03-10'), minimumStockLevel: 100, location: 'Vault 1, Safe B' },
      { drug: drugs[20]._id, batchNumber: 'PLA-2026-B18', quantity: 1450, unitPrice: 38.0, supplier: suppliers[8]._id, warehouse: warehouses[8]._id, manufacturingDate: new Date('2025-07-07'), expiryDate: new Date('2027-07-07'), minimumStockLevel: 150, location: 'Aisle 9, Rack A' },
      { drug: drugs[21]._id, batchNumber: 'LAN-2026-B19', quantity: 650, unitPrice: 85.0, supplier: suppliers[8]._id, warehouse: warehouses[9]._id, manufacturingDate: new Date('2025-10-10'), expiryDate: new Date('2027-04-10'), minimumStockLevel: 80, location: 'Cold Vault 2, Tier A' },
      { drug: drugs[22]._id, batchNumber: 'ALB-2026-B20', quantity: 1800, unitPrice: 45.0, supplier: suppliers[9]._id, warehouse: warehouses[9]._id, manufacturingDate: new Date('2025-06-01'), expiryDate: new Date('2027-06-01'), minimumStockLevel: 200, location: 'Aisle 10, Rack A' },
      { drug: drugs[23]._id, batchNumber: 'ROS-2026-B21', quantity: 1550, unitPrice: 39.5, supplier: suppliers[9]._id, warehouse: warehouses[0]._id, manufacturingDate: new Date('2025-08-20'), expiryDate: new Date('2027-08-20'), minimumStockLevel: 180, location: 'Aisle 1, Rack C' },
      { drug: drugs[24]._id, batchNumber: 'FUR-2026-B22', quantity: 2300, unitPrice: 9.8, supplier: suppliers[10]._id, warehouse: warehouses[1]._id, manufacturingDate: new Date('2025-05-18'), expiryDate: new Date('2027-05-18'), minimumStockLevel: 300, location: 'Aisle 2, Rack C' },

      // Low Stock Batches
      { drug: drugs[5]._id, batchNumber: 'AZI-2026-LOW1', quantity: 28, unitPrice: 29.8, supplier: suppliers[1]._id, warehouse: warehouses[0]._id, manufacturingDate: new Date('2025-03-20'), expiryDate: new Date('2027-03-20'), minimumStockLevel: 100, location: 'Aisle 3, Rack B' },
      { drug: drugs[8]._id, batchNumber: 'HCT-2026-LOW2', quantity: 18, unitPrice: 11.0, supplier: suppliers[2]._id, warehouse: warehouses[1]._id, manufacturingDate: new Date('2025-01-05'), expiryDate: new Date('2027-01-05'), minimumStockLevel: 80, location: 'Aisle 4, Rack C' },
      { drug: drugs[21]._id, batchNumber: 'LAN-2026-LOW3', quantity: 14, unitPrice: 85.0, supplier: suppliers[8]._id, warehouse: warehouses[3]._id, manufacturingDate: new Date('2025-08-10'), expiryDate: new Date('2027-02-10'), minimumStockLevel: 50, location: 'Cold Vault 1' },
      { drug: drugs[18]._id, batchNumber: 'DOX-2026-LOW4', quantity: 22, unitPrice: 23.0, supplier: suppliers[7]._id, warehouse: warehouses[4]._id, manufacturingDate: new Date('2025-04-18'), expiryDate: new Date('2027-04-18'), minimumStockLevel: 100, location: 'Aisle 8, Rack C' },
      { drug: drugs[1]._id, batchNumber: 'LIP-2026-LOW5', quantity: 35, unitPrice: 34.0, supplier: suppliers[0]._id, warehouse: warehouses[6]._id, manufacturingDate: new Date('2025-06-01'), expiryDate: new Date('2027-06-01'), minimumStockLevel: 150, location: 'Aisle 7, Rack C' },

      // Out of Stock Batches
      { drug: drugs[12]._id, batchNumber: 'CIP-2026-OUT1', quantity: 0, unitPrice: 36.2, supplier: suppliers[3]._id, warehouse: warehouses[2]._id, manufacturingDate: new Date('2025-01-10'), expiryDate: new Date('2027-01-10'), minimumStockLevel: 100, location: 'Aisle 5, Rack C' },
      { drug: drugs[2]._id, batchNumber: 'GLU-2026-OUT2', quantity: 0, unitPrice: 12.75, supplier: suppliers[0]._id, warehouse: warehouses[7]._id, manufacturingDate: new Date('2025-02-01'), expiryDate: new Date('2027-02-01'), minimumStockLevel: 200, location: 'Aisle 2, Rack D' },

      // Expiring Soon Batches (expiry within next 30 to 75 days)
      { drug: drugs[5]._id, batchNumber: 'AZI-2026-EXP1', quantity: 340, unitPrice: 29.8, supplier: suppliers[1]._id, warehouse: warehouses[3]._id, manufacturingDate: new Date('2024-11-01'), expiryDate: new Date(now.getTime() + 42 * 24 * 60 * 60 * 1000), minimumStockLevel: 50, location: 'Aisle 3, Rack D' },
      { drug: drugs[8]._id, batchNumber: 'HCT-2026-EXP2', quantity: 210, unitPrice: 11.0, supplier: suppliers[2]._id, warehouse: warehouses[4]._id, manufacturingDate: new Date('2024-10-15'), expiryDate: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000), minimumStockLevel: 50, location: 'Aisle 4, Rack D' },
      { drug: drugs[14]._id, batchNumber: 'AML-2026-EXP3', quantity: 180, unitPrice: 17.6, supplier: suppliers[5]._id, warehouse: warehouses[5]._id, manufacturingDate: new Date('2024-12-05'), expiryDate: new Date(now.getTime() + 65 * 24 * 60 * 60 * 1000), minimumStockLevel: 50, location: 'Aisle 6, Rack D' },

      // Expired Batches (already past expiry)
      { drug: drugs[12]._id, batchNumber: 'CIP-2025-EXPD1', quantity: 45, unitPrice: 36.2, supplier: suppliers[3]._id, warehouse: warehouses[0]._id, manufacturingDate: new Date('2024-03-01'), expiryDate: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000), minimumStockLevel: 50, location: 'Quarantine Bay A' },
      { drug: drugs[0]._id, batchNumber: 'AMX-2025-EXPD2', quantity: 60, unitPrice: 18.5, supplier: suppliers[0]._id, warehouse: warehouses[1]._id, manufacturingDate: new Date('2024-02-15'), expiryDate: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000), minimumStockLevel: 50, location: 'Quarantine Bay B' },
      { drug: drugs[3]._id, batchNumber: 'LIS-2025-EXPD3', quantity: 30, unitPrice: 15.2, supplier: suppliers[1]._id, warehouse: warehouses[2]._id, manufacturingDate: new Date('2024-01-20'), expiryDate: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000), minimumStockLevel: 50, location: 'Quarantine Bay C' },
    ];

    const inventoryRecords = [];
    for (const item of inventoryData) {
      const inv = new Inventory(item);
      inv.status = inv.calculateStatus();
      await inv.save();
      inventoryRecords.push(inv);
    }

    // 7. Seed 22 Orders
    console.log('Seeding 22 pharmaceutical orders...');
    const orderStatuses = ['DELIVERED', 'SHIPPED', 'PROCESSING', 'CONFIRMED', 'PENDING', 'CANCELLED'];
    const paymentStatuses = ['PAID', 'PAID', 'PAID', 'PENDING', 'PENDING', 'REFUNDED'];

    const orders = [];
    for (let i = 1; i <= 22; i++) {
      const supplier = suppliers[i % suppliers.length];
      const statusIdx = i % orderStatuses.length;
      const orderStatus = orderStatuses[statusIdx];
      const paymentStatus = paymentStatuses[statusIdx];

      const item1 = drugs[(i * 2) % drugs.length];
      const item2 = drugs[(i * 3 + 1) % drugs.length];
      const qty1 = 50 + (i * 15);
      const qty2 = 40 + (i * 10);
      const subtotal1 = qty1 * item1.price;
      const subtotal2 = qty2 * item2.price;
      const totalAmount = subtotal1 + subtotal2;

      const orderDaysAgo = 30 - i;
      const orderDate = new Date(now.getTime() - orderDaysAgo * 24 * 60 * 60 * 1000);
      const expectedDelivery = new Date(orderDate.getTime() + 6 * 24 * 60 * 60 * 1000);

      const ord = await Order.create({
        orderId: `ORD-2026-${String(100 + i).padStart(4, '0')}`,
        supplier: supplier._id,
        customer: pharmacyUser._id,
        items: [
          { drug: item1._id, drugName: item1.name, quantity: qty1, unitPrice: item1.price, subtotal: subtotal1 },
          { drug: item2._id, drugName: item2.name, quantity: qty2, unitPrice: item2.price, subtotal: subtotal2 },
        ],
        totalQuantity: qty1 + qty2,
        totalAmount: Math.round(totalAmount),
        orderDate,
        expectedDelivery,
        paymentStatus,
        orderStatus,
        shippingAddress: 'Metro General Hospital Pharmacy, Central Depot, Wing B',
        notes: `Clinical supply replenishment order ref #DT-${i}`,
      });
      orders.push(ord);
    }

    // 8. Seed 16 Shipments with comprehensive timelines
    console.log('Seeding 16 tracked shipments with stage checkpoints...');
    const shipmentStatuses = ['DELIVERED', 'OUT_FOR_DELIVERY', 'IN_TRANSIT', 'SHIPPED', 'PROCESSING', 'ORDER_PLACED'];
    const carriers = ['PharmaExpress Direct', 'MedEx Global LifeSciences', 'DHL Medical Courier', 'FedEx HealthCare SafeTemp'];

    const shipments = [];
    for (let i = 0; i < 16; i++) {
      const order = orders[i];
      const status = shipmentStatuses[i % shipmentStatuses.length];
      const carrier = carriers[i % carriers.length];
      const warehouse = warehouses[i % warehouses.length];

      // Build timeline based on status
      const timeline = [];
      const baseTime = new Date(order.orderDate);

      timeline.push({
        status: 'ORDER_PLACED',
        timestamp: new Date(baseTime.getTime() + 1 * 60 * 60 * 1000),
        location: `${warehouse.name}, Order Dispatch`,
        note: `Order verification verified against batch standards.`,
      });

      if (['PROCESSING', 'SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(status)) {
        timeline.push({
          status: 'PROCESSING',
          timestamp: new Date(baseTime.getTime() + 6 * 60 * 60 * 1000),
          location: `${warehouse.name}, Packing Terminal 3`,
          note: `Packed in temperature-controlled ISO refrigerated containers.`,
        });
      }

      if (['SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(status)) {
        timeline.push({
          status: 'SHIPPED',
          timestamp: new Date(baseTime.getTime() + 18 * 60 * 60 * 1000),
          location: `${warehouse.location.city} Logistics Hub`,
          note: `Departed origin warehouse with driver ID #DRV-8492.`,
        });
      }

      if (['IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(status)) {
        timeline.push({
          status: 'IN_TRANSIT',
          timestamp: new Date(baseTime.getTime() + 36 * 60 * 60 * 1000),
          location: `Interstate Corridor Junction #4`,
          note: `Telemetry check passed: Container temperature maintained at 3.9°C.`,
        });
      }

      if (['OUT_FOR_DELIVERY', 'DELIVERED'].includes(status)) {
        timeline.push({
          status: 'OUT_FOR_DELIVERY',
          timestamp: new Date(baseTime.getTime() + 52 * 60 * 60 * 1000),
          location: `Metro Regional Delivery Hub`,
          note: `Out for morning priority hospital delivery.`,
        });
      }

      if (status === 'DELIVERED') {
        timeline.push({
          status: 'DELIVERED',
          timestamp: new Date(baseTime.getTime() + 58 * 60 * 60 * 1000),
          location: `Metro General Hospital Pharmacy`,
          note: `Signed and verified by Pharmacist on duty. Cold chain integrity intact.`,
        });
      }

      const shp = await Shipment.create({
        shipmentId: `SHP-2026-${String(200 + i).padStart(4, '0')}`,
        order: order._id,
        trackingNumber: `TRK-984${String(i).padStart(3, '0')}-${Math.floor(1000 + Math.random() * 9000)}`,
        carrier,
        originWarehouse: warehouse._id,
        destination: order.shippingAddress,
        currentLocation: status === 'DELIVERED' ? 'Delivered to Destination' : status === 'IN_TRANSIT' ? 'Midwest Transit Corridor' : `${warehouse.name}`,
        temperatureReading: '4.1°C (Optimal)',
        status,
        estimatedDelivery: order.expectedDelivery,
        actualDelivery: status === 'DELIVERED' ? timeline[timeline.length - 1].timestamp : null,
        timeline,
      });
      shipments.push(shp);
    }

    // 9. Seed System Alerts
    console.log('Seeding real-time alerts...');
    const alertData = [
      {
        title: 'Depleted Stock Alert',
        message: 'Batch CIP-2026-OUT1 (Ciprofloxacin 500mg) is completely out of stock in East Coast Hub.',
        type: 'OUT_OF_STOCK',
        severity: 'CRITICAL',
        isRead: false,
        relatedItem: { modelName: 'Inventory', itemId: inventoryRecords[27]._id },
      },
      {
        title: 'Batch Expired Warning',
        message: 'Batch CIP-2025-EXPD1 expired. Immediate quarantine and disposal documentation required.',
        type: 'EXPIRED',
        severity: 'CRITICAL',
        isRead: false,
        relatedItem: { modelName: 'Inventory', itemId: inventoryRecords[32]._id },
      },
      {
        title: 'Low Stock Threshold Warning',
        message: 'Batch AZI-2026-LOW1 (Azithromycin 250mg) stock fell below safe limit (28 units remaining).',
        type: 'LOW_STOCK',
        severity: 'WARNING',
        isRead: false,
        relatedItem: { modelName: 'Inventory', itemId: inventoryRecords[22]._id },
      },
      {
        title: 'Expiring Drug Batch Alert',
        message: 'Batch HCT-2026-EXP2 (Hydrochlorothiazide) reaches expiration within 25 days.',
        type: 'EXPIRING_SOON',
        severity: 'WARNING',
        isRead: false,
        relatedItem: { modelName: 'Inventory', itemId: inventoryRecords[30]._id },
      },
      {
        title: 'Priority Delivery En Route',
        message: 'Shipment SHP-2026-0201 is Out for Delivery to Metro General Hospital Pharmacy.',
        type: 'SYSTEM',
        severity: 'INFO',
        isRead: false,
        relatedItem: { modelName: 'Shipment', itemId: shipments[1]._id },
      },
      {
        title: 'New Procurement Order Received',
        message: 'Order ORD-2026-0104 confirmed by Metro General Hospital for $4,120.',
        type: 'PENDING_ORDER',
        severity: 'INFO',
        isRead: true,
        relatedItem: { modelName: 'Order', itemId: orders[3]._id },
      },
    ];

    await Alert.create(alertData);

    console.log('========================================================');
    console.log('  DRUGTRACK DATABASE SEEDING COMPLETED SUCCESSFULLY!   ');
    console.log('========================================================');
    console.log(`  Users seeded:       ${users.length}`);
    console.log(`  Drugs seeded:       ${drugs.length}`);
    console.log(`  Suppliers seeded:   ${suppliers.length}`);
    console.log(`  Warehouses seeded:  ${warehouses.length}`);
    console.log(`  Inventory batches:  ${inventoryRecords.length}`);
    console.log(`  Orders seeded:      ${orders.length}`);
    console.log(`  Shipments seeded:   ${shipments.length}`);
    console.log(`  Alerts seeded:      ${alertData.length}`);
    console.log('--------------------------------------------------------');
    console.log('  DEMO ACCOUNTS (Password for all: password123):');
    console.log('  • Admin:             admin@drugtrack.com');
    console.log('  • Supplier:          supplier@drugtrack.com');
    console.log('  • Warehouse Manager: warehouse@drugtrack.com');
    console.log('  • Pharmacy Manager:  pharmacy@drugtrack.com');
    console.log('========================================================');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Fatal error during database seeding:', error);
    process.exit(1);
  }
};

seedDatabase();
