import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateSchemaPrompt, DATABASE_SCHEMA } from "../config/dbSchema.js";

class GeminiService {
    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY;
        if (!this.apiKey) {
            console.warn("GEMINI_API_KEY not found in environment variables");
        }
        this.genAI = new GoogleGenerativeAI(this.apiKey);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    }

    /**
     * Generate SQL query from natural language question
     */
    async generateSQLQuery(question) {
        const schemaPrompt = generateSchemaPrompt();
        
        const prompt = `Kamu adalah asisten AI yang ahli dalam membuat SQL query untuk sistem manajemen asset IT.

${schemaPrompt}

ATURAN PENTING:
1. HANYA generate SELECT query, TIDAK BOLEH INSERT, UPDATE, DELETE, DROP, atau operasi modifikasi lainnya
2. JANGAN pernah mengakses kolom: password, refresh_token
3. Gunakan JOIN jika perlu mengakses data dari beberapa tabel
4. Gunakan alias yang jelas untuk kolom
5. Format angka mata uang dalam Rupiah (IDR)
6. Untuk tanggal, gunakan format yang mudah dibaca
7. Batasi hasil maksimal 100 baris dengan LIMIT jika tidak ada limit spesifik
8. Jika pertanyaan tidak bisa dijawab dengan data yang ada, jelaskan alasannya

PERTANYAAN USER: "${question}"

Berikan response dalam format JSON dengan struktur:
{
    "can_answer": true/false,
    "sql_query": "SELECT ... (jika can_answer true)",
    "explanation": "Penjelasan singkat tentang query yang dibuat atau alasan tidak bisa menjawab",
    "expected_result_type": "single_value|list|table|count"
}

HANYA berikan JSON, tanpa markdown code block atau penjelasan tambahan.`;

        try {
            const result = await this.model.generateContent(prompt);
            const response = result.response.text();
            
            // Clean response - remove markdown code blocks if present
            let cleanResponse = response.trim();
            if (cleanResponse.startsWith("```json")) {
                cleanResponse = cleanResponse.slice(7);
            }
            if (cleanResponse.startsWith("```")) {
                cleanResponse = cleanResponse.slice(3);
            }
            if (cleanResponse.endsWith("```")) {
                cleanResponse = cleanResponse.slice(0, -3);
            }
            cleanResponse = cleanResponse.trim();
            
            return JSON.parse(cleanResponse);
        } catch (error) {
            console.error("Gemini generateSQLQuery error:", error);
            throw new Error("Gagal generate SQL query dari pertanyaan");
        }
    }

    /**
     * Format query results into natural language response
     */
    async formatResponse(question, queryResults, queryInfo) {
        const prompt = `Kamu adalah asisten AI yang membantu menjawab pertanyaan tentang data asset IT dalam bahasa Indonesia yang ramah dan informatif.

PERTANYAAN USER: "${question}"

PENJELASAN QUERY: ${queryInfo.explanation}

HASIL QUERY (dalam JSON):
${JSON.stringify(queryResults, null, 2)}

TIPE HASIL: ${queryInfo.expected_result_type}

INSTRUKSI:
1. Berikan jawaban dalam bahasa Indonesia yang natural dan mudah dipahami
2. Format angka mata uang dengan format Rupiah (Rp X.XXX.XXX)
3. Format tanggal dalam bahasa Indonesia (contoh: 15 Januari 2024)
4. Jika hasil berupa list, tampilkan dengan format yang rapi (numbered list)
5. Jika tidak ada data, sampaikan dengan sopan
6. Berikan insight atau informasi tambahan jika relevan
7. Jangan terlalu panjang, maksimal 3-4 paragraf atau 10 item list
8. Gunakan emoji yang sesuai untuk membuat response lebih menarik

Berikan response langsung tanpa markdown code block.`;

        try {
            const result = await this.model.generateContent(prompt);
            return result.response.text();
        } catch (error) {
            console.error("Gemini formatResponse error:", error);
            throw new Error("Gagal memformat response");
        }
    }

    /**
     * Handle general chat without database query
     */
    async generalChat(message) {
        const prompt = `Kamu adalah asisten AI untuk sistem manajemen asset IT. 
Jawab pertanyaan berikut dalam bahasa Indonesia dengan ramah dan informatif.
Jika pertanyaan terkait data asset, sarankan user untuk bertanya spesifik tentang:
- Jumlah atau daftar asset
- Status asset (tersedia, digunakan, maintenance, disposed)
- Kategori, lokasi, atau vendor asset
- Nilai atau harga asset
- Riwayat transaksi atau penggunaan asset

PERTANYAAN: "${message}"

Berikan response yang singkat dan helpful.`;

        try {
            const result = await this.model.generateContent(prompt);
            return result.response.text();
        } catch (error) {
            console.error("Gemini generalChat error:", error);
            throw new Error("Gagal memproses pesan");
        }
    }

    /**
     * Check if the API is properly configured
     */
    isConfigured() {
        return !!this.apiKey;
    }
}

// Singleton instance
const geminiService = new GeminiService();
export default geminiService;
