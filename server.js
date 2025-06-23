import express from 'express';
import path from 'path';
import session from 'express-session';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';

dotenv.config();
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'supersecretkey', resave: false, saveUninitialized: true }));

const isAuth = (req, res, next) => {
  if (req.session.user) return next();
  res.status(401).json({ error: 'No autorizado' });
};

app.use(express.static(path.join(__dirname, 'public')));

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin') {
    req.session.user = username;
    return res.redirect('/admin.html');
  }
  res.redirect('/login.html?error=1');
});

app.post('/logout', isAuth, (req, res) => {
  req.session.destroy(() => res.redirect('/login.html'));
});

app.get('/api/products', async (req, res) => {
  let query = supabase.from('products').select('*');
  if (req.query.minPrice) query = query.gte('price', Number(req.query.minPrice));
  if (req.query.maxPrice) query = query.lte('price', Number(req.query.maxPrice));
  if (req.query.name) query = query.ilike('name', `%${req.query.name}%`);
  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/products', isAuth, async (req, res) => {
  const { name, price, description, image } = req.body;
  const { data, error } = await supabase
    .from('products')
    .insert([{ name, price, description, image }], { returning: 'representation' });
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data[0]);
});

app.delete('/api/products/:id', isAuth, async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

export default app;
