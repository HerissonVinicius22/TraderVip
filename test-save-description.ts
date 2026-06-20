import { updateRowById, selectRows } from './supabaseHelpers.js';

async function main() {
  try {
    console.log("Trying to update lesson 'les_1_1' with a description...");
    await updateRowById("lessons", "les_1_1", {
      description: "Test description: https://google.com"
    });
    console.log("✅ Successfully updated description!");
    
    // Select it to verify
    const lessons = await selectRows<any>("lessons");
    const updated = lessons.find(l => l.id === "les_1_1");
    console.log("Updated lesson in database:", updated);
  } catch (err: any) {
    console.error("❌ Failed to update description!");
    console.error("Error details:", err);
  }
}

main();
