const Database = require('better-sqlite3');
const db = new Database('database.sqlite');

const brandsList = [
  'سامسونج', 'شاومي', 'هواوي', 'أوبو', 'فيفو', 'إل جي', 'موتورولا', 'نوكيا', 
  'لينوفو', 'سوني', 'HTC', 'أسوس', 'تكنو', 'إنفينيكس', 'Realme', 'ميزو', 
  'Acer', 'هايسنس', 'ألكاتيل', 'إيتل', 'جيوني', 'لافا', 'كاربون', 'مايكروماكس', 
  'بلو', 'إنتكس', 'والتون', 'Symphony', 'موبيسيل', 'ويكو', 'qMobile', 'LYF', 
  'Archos', 'ZTE', 'OnePlus', 'MTK', 'كوالكوم', 'SPD', 'أندرويد'
];

const insertBrand = db.prepare('INSERT OR IGNORE INTO brands (name) VALUES (?)');
brandsList.forEach(b => insertBrand.run(b));

const insertCategory = db.prepare('INSERT OR IGNORE INTO categories (name) VALUES (?)');
['رومات', 'أدوات فلاش', 'تعريفات'].forEach(c => insertCategory.run(c));

const getBrandId = db.prepare('SELECT id FROM brands WHERE name = ?');
const getCatId = db.prepare('SELECT id FROM categories WHERE name = ?');

const romsCatId = getCatId.get('رومات').id;
const toolsCatId = getCatId.get('أدوات فلاش').id;
const driversCatId = getCatId.get('تعريفات').id;

const roms = [
  { name: 'نظام التشغيل الأصلي من أوبو', brand: 'أوبو' },
  { name: 'نظام التشغيل الأصلي من هواوي', brand: 'هواوي' },
  { name: 'نظام التشغيل الأصلي من شاومي', brand: 'شاومي' },
  { name: 'نظام التشغيل الأصلي من سامسونج', brand: 'سامسونج' },
  { name: 'نظام التشغيل الأصلي من إل جي', brand: 'إل جي' },
  { name: 'نظام التشغيل الأصلي من نوكيا', brand: 'نوكيا' },
  { name: 'ذاكرة القراءة فقط الأصلية من موتورولا', brand: 'موتورولا' },
  { name: 'نظام التشغيل الأصلي من فيفو', brand: 'فيفو' },
  { name: 'نظام التشغيل الأصلي من لينوفو', brand: 'لينوفو' },
  { name: 'ستوك روم (Stock ROM) من سوني إكسبريا', brand: 'سوني' },
  { name: 'نظام التشغيل الأصلي من HTC', brand: 'HTC' },
  { name: 'نظام التشغيل الأصلي من أسوس', brand: 'أسوس' },
  { name: 'نظام التشغيل الأصلي من تكنو', brand: 'تكنو' },
  { name: 'نظام التشغيل الأصلي من إنفينيكس', brand: 'إنفينيكس' },
  { name: 'نظام التشغيل الأصلي من Realme', brand: 'Realme' },
  { name: 'نظام التشغيل الأصلي من ميزو', brand: 'ميزو' },
  { name: 'نظام التشغيل الأصلي من Acer', brand: 'Acer' },
  { name: 'روم هايسنس الأصلي', brand: 'هايسنس' },
  { name: 'ذاكرة القراءة فقط الأصلية من ألكاتيل', brand: 'ألكاتيل' },
  { name: 'نظام التشغيل الأصلي من إيتل', brand: 'إيتل' },
  { name: 'روم جيوني الأصلي', brand: 'جيوني' },
  { name: 'روم لافا الأصلي', brand: 'لافا' },
  { name: 'ذاكرة القراءة فقط (ROM) الأصلية من كاربون', brand: 'كاربون' },
  { name: 'نظام التشغيل الأصلي من مايكروماكس', brand: 'مايكروماكس' },
  { name: 'روم بلو ستوك', brand: 'بلو' },
  { name: 'نظام التشغيل الأصلي من إنتكس', brand: 'إنتكس' },
  { name: 'والتون ستوك روم', brand: 'والتون' },
  { name: 'ذاكرة القراءة فقط (ROM) الخاصة بـ Symphony', brand: 'Symphony' },
  { name: 'ذاكرة القراءة فقط الأصلية من موبيسيل', brand: 'موبيسيل' },
  { name: 'نظام التشغيل الأصلي من ويكو', brand: 'ويكو' },
  { name: 'نظام التشغيل الأصلي qMobile', brand: 'qMobile' },
  { name: 'ذاكرة القراءة فقط الأصلية من LYF', brand: 'LYF' },
  { name: 'ذاكرة القراءة فقط الأصلية من ZTE', brand: 'ZTE' },
  { name: 'ROM الأصلي من Archos', brand: 'Archos' },
];

const flashTools = [
  { name: 'أداة فلاش شاومي', brand: 'شاومي' },
  { name: 'أداة QPST للفلاش', brand: 'كوالكوم' },
  { name: 'أداة أودين للفلاش', brand: 'سامسونج' },
  { name: 'أداة SP Flash Tool', brand: 'MTK' },
  { name: 'أداة برمجة فلاش SPD', brand: 'SPD' },
  { name: 'أداة MTK Flash Tool', brand: 'MTK' },
  { name: 'أداة فلاش سامسونج', brand: 'سامسونج' },
  { name: 'أداة فلاش هواوي', brand: 'هواوي' },
  { name: 'أداة فلاش فيفو', brand: 'فيفو' },
  { name: 'أداة فلاش أوبو', brand: 'أوبو' },
  { name: 'أداة فلاش إل جي', brand: 'إل جي' },
  { name: 'أداة فلاش موتورولا', brand: 'موتورولا' },
  { name: 'أداة فلاش OnePlus', brand: 'OnePlus' },
  { name: 'أداة فلاش HTC', brand: 'HTC' },
  { name: 'أداة فلاش أسوس', brand: 'أسوس' },
  { name: 'أداة فلاش نوكيا', brand: 'نوكيا' },
  { name: 'أداة PhoenixSuit', brand: 'أندرويد' },
  { name: 'أداة إزالة رقائق الصخور', brand: 'أندرويد' },
  { name: 'أداة فلاش لينوفو', brand: 'لينوفو' },
  { name: 'أداة فلاش سوني إكسبريا', brand: 'سوني' },
  { name: 'متعددة الاستخدامات لنظام أندرويد', brand: 'أندرويد' },
  { name: 'ADB و Fastboot', brand: 'أندرويد' },
  { name: 'أداة QFlash', brand: 'كوالكوم' }
];

const driversList = [
  { name: 'برنامج تشغيل USB من MTK', brand: 'MTK' },
  { name: 'برنامج تشغيل USB من كوالكوم', brand: 'كوالكوم' },
  { name: 'برنامج تشغيل ADB للتشغيل السريع', brand: 'أندرويد' },
  { name: 'برنامج تثبيت برنامج تشغيل ADB', brand: 'أندرويد' },
  { name: 'برنامج تشغيل USB من هواوي', brand: 'هواوي' },
  { name: 'برنامج تشغيل USB من شاومي', brand: 'شاومي' },
  { name: 'برنامج تشغيل USB من سامسونج', brand: 'سامسونج' },
  { name: 'برنامج تشغيل USB SPD', brand: 'SPD' },
  { name: 'برنامج تشغيل USB من نوكيا', brand: 'نوكيا' },
  { name: 'برنامج تشغيل USB من موتورولا', brand: 'موتورولا' },
  { name: 'برنامج تشغيل USB من Vivo', brand: 'فيفو' },
  { name: 'برنامج تشغيل USB من أوبو', brand: 'أوبو' },
  { name: 'برنامج تشغيل USB من لينوفو', brand: 'لينوفو' },
  { name: 'برنامج تشغيل USB من HTC', brand: 'HTC' },
  { name: 'برنامج تشغيل USB من أسوس', brand: 'أسوس' },
  { name: 'برنامج تشغيل USB من إل جي', brand: 'إل جي' },
  { name: 'برنامج تشغيل USB من مايكروماكس', brand: 'مايكروماكس' },
  { name: 'برنامج تشغيل USB من ألكاتيل', brand: 'ألكاتيل' },
  { name: 'برنامج تشغيل USB من إنفينيكس', brand: 'إنفينيكس' },
  { name: 'برنامج تشغيل USB من OnePlus', brand: 'OnePlus' },
  { name: 'برنامج تشغيل USB من إنتكس', brand: 'إنتكس' },
  { name: 'برنامج تشغيل USB بلو', brand: 'بلو' },
  { name: 'برنامج تشغيل USB من سيمفوني', brand: 'Symphony' }
];

const insertTool = db.prepare('INSERT INTO tools (name, version, brand_id, category_id, download_link, file_size, icon_image, short_description, long_description, required_driver_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');

db.transaction(() => {
  // Clear existing items if any to avoid duplicates
  db.exec('DELETE FROM tools');
  
  // Roms
  for (const item of roms) {
    const brandObj = getBrandId.get(item.brand);
    insertTool.run(item.name, 'أحدث إصدار', brandObj ? brandObj.id : null, romsCatId, 'https://www.flashtool.org/android/firmware/', '', '', 'الروم الرسمي لأجهزة ' + item.brand, 'حمل الروم وقم بتفليشه باستخدام الأداة المخصصة.', null);
  }
  
  // Flash Tools
  for (const item of flashTools) {
    const brandObj = getBrandId.get(item.brand);
    insertTool.run(item.name, 'أحدث إصدار', brandObj ? brandObj.id : null, toolsCatId, 'https://www.flashtool.org/android/tools/', '', '', 'أداة تفليش أجهزة ' + item.brand, 'استخدم الأداة لتفليش الرومات وإصلاح النظام.', null);
  }

  // Drivers (insert into tools so they show up in catalog, but also could be in drivers table)
  // According to schema, tools table has category_id. The user wants them in catalog.
  for (const item of driversList) {
    const brandObj = getBrandId.get(item.brand);
    insertTool.run(item.name, 'أحدث إصدار', brandObj ? brandObj.id : null, driversCatId, 'https://www.flashtool.org/android/drivers/', '', '', 'تعريفات USB لأجهزة ' + item.brand, 'ثبت هذه التعريفات ليتعرف الكمبيوتر على هاتفك.', null);
  }
})();

console.log("Database seeded successfully with items from the image!");
