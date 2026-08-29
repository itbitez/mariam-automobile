import { q, exec } from "@/lib/db";
import { ok, guard, readBody, str, num, bit } from "@/lib/api";
import { toMysqlDate } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** GET — every car, for the admin list. */
export const GET = guard(async () => {
  const rows = await q("SELECT * FROM cars ORDER BY featured DESC, year DESC");
  return ok({ cars: rows });
});

/** POST — create or update one car (the admin form saves the whole record). */
export const POST = guard(async (req) => {
  const c = await readBody(req);
  const id = str(c.id, 191);
  if (!id) return ok({ error: "Missing id" });

  const photos = Array.isArray(c.photos) ? c.photos.filter(Boolean).map((p) => String(p).slice(0, 500)) : [];
  const features = Array.isArray(c.features) ? c.features.filter(Boolean).map((f) => String(f).slice(0, 255)) : [];

  await exec(
    `INSERT INTO cars
       (id,title,brand,model,grade,year,body,fuel,transmission,drive,engine,mileage,seats,color,
        \`condition\`,auction,reg,price,featured,status,show_home,photos,tagline,about,features,updated_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
     ON DUPLICATE KEY UPDATE
       title=VALUES(title), brand=VALUES(brand), model=VALUES(model), grade=VALUES(grade),
       year=VALUES(year), body=VALUES(body), fuel=VALUES(fuel), transmission=VALUES(transmission),
       drive=VALUES(drive), engine=VALUES(engine), mileage=VALUES(mileage), seats=VALUES(seats),
       color=VALUES(color), \`condition\`=VALUES(\`condition\`), auction=VALUES(auction), reg=VALUES(reg),
       price=VALUES(price), featured=VALUES(featured), status=VALUES(status), show_home=VALUES(show_home),
       photos=VALUES(photos), tagline=VALUES(tagline), about=VALUES(about), features=VALUES(features),
       updated_at=VALUES(updated_at)`,
    [
      id, str(c.title, 255), str(c.brand, 120), str(c.model, 120), str(c.grade, 120),
      num(c.year), str(c.body, 60) || "SUV", str(c.fuel, 60) || "Hybrid",
      str(c.transmission, 60) || "Automatic", str(c.drive, 60) || "2WD",
      str(c.engine, 120), str(c.mileage, 120), num(c.seats, 5), str(c.color, 120),
      str(c.condition, 60) || "Recondition", str(c.auction, 120), str(c.reg, 120),
      num(c.price), bit(c.featured), str(c.status, 30) || "available",
      bit(c.showHome ?? c.show_home),
      JSON.stringify(photos), str(c.tagline, 255), str(c.about, 20000),
      JSON.stringify(features), toMysqlDate(),
    ]
  );

  const rows = await q("SELECT * FROM cars WHERE id = ?", [id]);
  return ok({ car: rows[0] || null });
});
