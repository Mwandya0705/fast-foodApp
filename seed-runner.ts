import seed from "./lib/seed";

(async () => {
  try {
    await seed();
    console.log("✅ Seeding complete!");
  } catch (err) {
    console.error("❌ Seeding failed:", err);
  }
})();