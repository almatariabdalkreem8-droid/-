import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = 3000;
app.use(express.json());

// Initialize Gemini
let ai: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!ai) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not defined. Please add it to your environment variables.");
    }
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
    });
  }
  return ai;
}

// Initialize SQLite Database
const db = new Database('database.sqlite');
db.pragma('journal_mode = WAL');

// Setup Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS brands (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  );
  
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  );
  
  CREATE TABLE IF NOT EXISTS drivers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    version TEXT,
    brand_id INTEGER,
    download_link TEXT,
    silent_install_switch TEXT,
    FOREIGN KEY(brand_id) REFERENCES brands(id)
  );

  CREATE TABLE IF NOT EXISTS tools (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    version TEXT,
    brand_id INTEGER,
    category_id INTEGER,
    download_link TEXT,
    file_size TEXT,
    icon_image TEXT,
    short_description TEXT,
    long_description TEXT,
    required_driver_id INTEGER,
    FOREIGN KEY(brand_id) REFERENCES brands(id),
    FOREIGN KEY(category_id) REFERENCES categories(id),
    FOREIGN KEY(required_driver_id) REFERENCES drivers(id)
  );
`);

// Seed Data (if empty)
const seedCount = db.prepare('SELECT COUNT(*) as count FROM brands').get() as { count: number };
if (seedCount.count === 0) {
  const insertBrand = db.prepare('INSERT INTO brands (name) VALUES (?)');
  const samsungId = insertBrand.run('Samsung').lastInsertRowid;
  const mtkId = insertBrand.run('MediaTek').lastInsertRowid;
  const qualcommId = insertBrand.run('Qualcomm').lastInsertRowid;
  const xiaomiId = insertBrand.run('Xiaomi').lastInsertRowid;

  const insertCategory = db.prepare('INSERT INTO categories (name) VALUES (?)');
  const flashToolsId = insertCategory.run('أدوات فلاش').lastInsertRowid;
  const driversId = insertCategory.run('تعريفات').lastInsertRowid;
  const programsId = insertCategory.run('البرامج').lastInsertRowid;
  const romsId = insertCategory.run('رومات').lastInsertRowid;

  const insertDriver = db.prepare('INSERT INTO drivers (name, version, brand_id, download_link, silent_install_switch) VALUES (?, ?, ?, ?, ?)');
  const samsungDriverId = insertDriver.run('Samsung USB Driver', 'v1.7.61.0', samsungId, 'https://developer.samsung.com/android-usb-driver', '/S').lastInsertRowid;
  const mtkDriverId = insertDriver.run('MTK USB All Drivers', 'v1.0.8', mtkId, '#', '/quiet').lastInsertRowid;
  const qualcommDriverId = insertDriver.run('Qualcomm QDLoader USB Driver', 'v1.0', qualcommId, '#', '/S').lastInsertRowid;

  const insertTool = db.prepare('INSERT INTO tools (name, version, brand_id, category_id, download_link, file_size, icon_image, short_description, long_description, required_driver_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  insertTool.run('Odin3', 'v3.14.4', samsungId, flashToolsId, 'https://samsungodin.com/', '3 MB', 'https://upload.wikimedia.org/wikipedia/commons/b/b4/Samsung_Wordmark.svg', 'أداة التفليش الرسمية لهواتف سامسونج.', '1. افتح الأداة.\n2. قم بتوصيل الهاتف في وضع Download Mode.\n3. أضف ملفات الروم واضغط Start.', samsungDriverId);
  insertTool.run('SP Flash Tool', 'v5.2124', mtkId, flashToolsId, 'https://spflashtools.com/', '60 MB', 'https://spflashtools.com/wp-content/uploads/sp-flash-tool.png', 'أداة تفليش هواتف ذات معالج ميدياتك.', '1. اختر ملف Scatter.\n2. اضغط Download.\n3. قم بتوصيل الهاتف وهو مغلق.', mtkDriverId);
  insertTool.run('QFIL (Qualcomm Flash Image Loader)', 'v2.0.3.5', qualcommId, flashToolsId, '#', '10 MB', '', 'أداة تفليش أجهزة كوالكوم في وضع EDL.', '1. اختر Flat Build.\n2. حدد ملف المبرمج Programmer.\n3. حدد ملفات XML واضغط Download.', qualcommDriverId);
  insertTool.run('Samsung Smart Switch', 'v4.3', samsungId, programsId, '#', '45 MB', 'https://upload.wikimedia.org/wikipedia/commons/b/b4/Samsung_Wordmark.svg', 'برنامج إدارة هواتف سامسونج ونقل البيانات وإجراء النسخ الاحتياطي.', '1. افتح البرنامج.\n2. قم بتوصيل الهاتف.\n3. اختر النسخ الاحتياطي أو التحديث.', samsungDriverId);
  insertTool.run('3uTools', 'v3.0', xiaomiId, programsId, '#', '115 MB', '', 'برنامج متكامل لإدارة أجهزة ابل وعمل الجيلبريك وتفليش الرومات.', '1. قم بتوصيل الهاتف.\n2. اختر القائمة العلوية لتفليش الروم أو إدارة الملفات.', null);
}

// API Routes
app.get('/api/brands', (req, res) => {
  res.json(db.prepare('SELECT * FROM brands').all());
});

app.get('/api/categories', (req, res) => {
  res.json(db.prepare('SELECT * FROM categories').all());
});

app.get('/api/tools', (req, res) => {
  const tools = db.prepare(`
    SELECT tools.*, 
           brands.name as brand_name, 
           categories.name as category_name,
           drivers.name as required_driver_name
    FROM tools
    LEFT JOIN brands ON tools.brand_id = brands.id
    LEFT JOIN categories ON tools.category_id = categories.id
    LEFT JOIN drivers ON tools.required_driver_id = drivers.id
  `).all();
  res.json(tools);
});

app.get('/api/tools/:id', (req, res) => {
  const tool = db.prepare(`
    SELECT tools.*, 
           brands.name as brand_name, 
           categories.name as category_name,
           drivers.name as required_driver_name
    FROM tools
    LEFT JOIN brands ON tools.brand_id = brands.id
    LEFT JOIN categories ON tools.category_id = categories.id
    LEFT JOIN drivers ON tools.required_driver_id = drivers.id
    WHERE tools.id = ?
  `).get(req.params.id);
  
  if (tool) res.json(tool);
  else res.status(404).json({ error: 'Tool not found' });
});

app.get('/api/drivers', (req, res) => {
  const drivers = db.prepare(`
    SELECT drivers.*, brands.name as brand_name
    FROM drivers
    LEFT JOIN brands ON drivers.brand_id = brands.id
  `).all();
  res.json(drivers);
});

// Admin Routes for modifications
app.post('/api/tools/import', (req, res) => {
  try {
    const items = req.body.items;
    
    const checkCat = db.prepare('SELECT id FROM categories WHERE name = ?');
    const insertCat = db.prepare('INSERT INTO categories (name) VALUES (?)');
    
    const checkTool = db.prepare('SELECT id FROM tools WHERE name = ?');
    const updateTool = db.prepare('UPDATE tools SET download_link = ? WHERE id = ?');
    const insertTool = db.prepare('INSERT INTO tools (name, download_link, category_id, version, brand_id, file_size, icon_image, short_description, long_description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    
    let updated = 0;
    let inserted = 0;

    const transaction = db.transaction((items) => {
      for (const item of items) {
        if (!item.name || !item.download_link) continue;

        let catId = null;
        if (item.category_name) {
          let cat = checkCat.get(item.category_name) as { id: number } | undefined;
          if (!cat) {
            const info = insertCat.run(item.category_name);
            catId = info.lastInsertRowid;
          } else {
            catId = cat.id;
          }
        }

        const tool = checkTool.get(item.name) as { id: number } | undefined;
        if (tool) {
          updateTool.run(item.download_link, tool.id);
          updated++;
        } else {
          insertTool.run(
            item.name, 
            item.download_link, 
            catId, 
            '', // version
            null, // brand_id
            '', // file_size
            '', // icon_image
            'تم استيرادها تلقائيا', // short_description
            '' // long_description
          );
          inserted++;
        }
      }
    });

    transaction(items);
    res.json({ success: true, updated, inserted });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/tools', (req, res) => {
  try {
    const { name, version, brand_id, category_id, download_link, file_size, icon_image, short_description, long_description, required_driver_id } = req.body;
    const stmt = db.prepare('INSERT INTO tools (name, version, brand_id, category_id, download_link, file_size, icon_image, short_description, long_description, required_driver_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    const info = stmt.run(name, version, brand_id, category_id, download_link, file_size, icon_image, short_description, long_description, required_driver_id);
    res.json({ id: info.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.put('/api/tools/:id', (req, res) => {
  try {
    const { name, version, brand_id, category_id, download_link, file_size, icon_image, short_description, long_description, required_driver_id } = req.body;
    const stmt = db.prepare('UPDATE tools SET name=?, version=?, brand_id=?, category_id=?, download_link=?, file_size=?, icon_image=?, short_description=?, long_description=?, required_driver_id=? WHERE id=?');
    stmt.run(name, version, brand_id, category_id, download_link, file_size, icon_image, short_description, long_description, required_driver_id, req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.delete('/api/tools/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM tools WHERE id=?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Brand routes
app.post('/api/brands', (req, res) => {
  try {
    const info = db.prepare('INSERT INTO brands (name) VALUES (?)').run(req.body.name);
    res.json({ id: info.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.delete('/api/brands/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM brands WHERE id=?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Driver routes
app.post('/api/drivers', (req, res) => {
  try {
    const { name, version, brand_id, download_link, silent_install_switch } = req.body;
    const info = db.prepare('INSERT INTO drivers (name, version, brand_id, download_link, silent_install_switch) VALUES (?, ?, ?, ?, ?)').run(name, version, brand_id, download_link, silent_install_switch);
    res.json({ id: info.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.delete('/api/drivers/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM drivers WHERE id=?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// AI Explanation endpoint
app.post('/api/explain-tool', async (req, res) => {
  try {
    const { toolName } = req.body;
    
    if (!toolName) {
      return res.status(400).json({ error: "Tool name is required." });
    }

    const aiClient = getGeminiClient();
    
    const systemInstruction = `أنت خبير في صيانة هواتف الأندرويد.
اشرح للمستخدمين ما هي هذه الأداة (${toolName}) وفي ماذا تستخدم بالتحديد، وما هي فوائدها، وأهم النصائح قبل استخدامها. 
اكتب الشرح بأسلوب واضح ومبسط ومباشر باللغة العربية، في فقرتين أو ثلاث فقرات.`;

    const response = await aiClient.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `اشرح لي أداة ${toolName}`,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    res.json({ explanation: response.text });
  } catch (err) {
    console.error("AI Explanation Error:", err);
    res.status(500).json({ error: "حدث خطأ أثناء جلب الشرح الذكي." });
  }
});

// AI Assistant endpoint
app.post('/api/ask-ai', async (req, res) => {
  try {
    const { message, toolName, toolDescription } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    const aiClient = getGeminiClient();
    
    const systemInstruction = `أنت مساعد ذكاء اصطناعي خبير في صيانة وبرمجة هواتف الأندرويد.
مهمتك هي مساعدة المستخدم في فهم كيفية استخدام الأداة الحالية.
معلومات الأداة:
- اسم الأداة: ${toolName || 'غير محدد'}
- وصف الأداة: ${toolDescription || 'غير محدد'}

أجب بإيجاز، بطريقة احترافية وباللغة العربية. ركز على تقديم خطوات عملية ونصائح لتجنب الأخطاء الشائعة (مثل فقدان البيانات أو تعطل الهاتف).`;

    const response = await aiClient.models.generateContent({
      model: "gemini-3.5-flash",
      contents: message,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    res.json({ reply: response.text });
  } catch (err) {
    console.error("AI Error:", err);
    res.status(500).json({ error: "حدث خطأ أثناء الاتصال بالذكاء الاصطناعي." });
  }
});

async function startServer() {
  app.all('/api/*', (req, res) => res.status(404).json({ error: 'API route not found' }));

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
