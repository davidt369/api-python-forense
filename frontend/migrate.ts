import { createClient } from "@libsql/client";
import * as fs from "fs";
import "dotenv/config";

async function main() {
  const url = process.env.TURSO_DATABASE_URL!;
  const authToken = process.env.TURSO_AUTH_TOKEN!;

  const client = createClient({
    url,
    authToken,
  });

  console.log("Conectado a Turso...");

  // Borrar tablas existentes (si existen)
  const tables = ["Certificate", "AnalysisResult", "Evidence", "User"];
  for (const table of tables) {
    try {
      await client.execute(`DROP TABLE IF EXISTS "${table}"`);
      console.log(`Tabla ${table} eliminada.`);
    } catch (e: any) {
      console.log(`Error al eliminar ${table}:`, e.message);
    }
  }

  console.log("Ejecutando migration.sql...");
  let sql = fs.readFileSync("migration.sql", "utf16le");
  if (sql.charCodeAt(0) === 0xFEFF) {
    sql = sql.slice(1);
  }
  
  try {
    await client.executeMultiple(sql);
    console.log("✅ Tablas creadas con éxito.");
  } catch (e) {
    console.error("❌ Error al crear tablas:", e);
  }

}

main().catch(console.error);
