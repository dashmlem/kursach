const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Pool } = require("pg");

const PORT = process.env.PORT || 5000;
const DB_USER = process.env.PGUSER;
const DB_HOST = process.env.PGHOST;
const DB_NAME = process.env.PGDATABASE;
const DB_PASSWORD = process.env.PGPASSWORD;
const DB_PORT = process.env.PGPORT;

const app = express();

// PostgreSQL подключение
const pool = new Pool({
    user: DB_USER,
    host: DB_HOST,
    database: DB_NAME,
    password: DB_PASSWORD,
    port: DB_PORT,
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Создание рекламной кампании
app.post("/api/campaigns", async (req, res) => {
    const { name, budget } = req.body;
    try {
        const result = await pool.query(
            "INSERT INTO campaigns (name, budget) VALUES ($1, $2) RETURNING *",
            [name, budget]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Ошибка при создании кампании" });
    }
});

// Получение всех кампаний
app.get("/api/campaigns", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM campaigns ORDER BY created_at DESC");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Ошибка при получении кампаний" });
    }
});

// Удаление кампании
app.delete("/api/campaigns/:id", async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query("DELETE FROM campaigns WHERE id = $1", [id]);
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: "Ошибка при удалении кампании" });
    }
});

// Получение аналитики по кампании
app.get("/api/campaigns/:id/analytics", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            "SELECT * FROM analytics WHERE campaign_id = $1",
            [id]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Ошибка при получении аналитики" });
    }
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
