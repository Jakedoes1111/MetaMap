import { promises as fs } from "node:fs";
import { test, expect } from "@playwright/test";

const csvContent = `person_id,birth_datetime_local,birth_timezone,system,subsystem,source_tool,source_url_or_ref,data_point,verbatim_text,category,subcategory,direction_cardinal,direction_degrees,timing_window_start,timing_window_end,polarity,strength,confidence,weight_system,privacy,provenance,notes
default-person,1992-09-01T06:03:00,Australia/Sydney,Numerology_Pythagorean,,MetaMap numerology,,Life Path 13/4,UNKNOWN,Personality,,,,,+,1,0.6,1.0,public,internal:numerology,auto
default-person,1992-09-01T06:03:00,Australia/Sydney,Numerology_Chaldean,,MetaMap numerology,,Birth number 1,UNKNOWN,Learning,,,,,+,1,0.6,1.0,public,internal:numerology,auto
`;

test.describe("Import/export round trip", () => {
  test("imports sample CSV and allows export", async ({ page }, testInfo) => {
    const filePath = testInfo.outputPath("sample.csv");
    await fs.writeFile(filePath, csvContent, "utf-8");

    await page.goto("/");
    await expect(page.getByRole("heading", { name: "MetaMap" })).toBeVisible();

    const fileChooserPromise = page.waitForEvent("filechooser");
    await page.click('label:has-text("Drop file or select")');
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(filePath);

    await expect(page.getByText("Imported 2 rows successfully.")).toBeVisible({
      timeout: 10000,
    });

    await page.getByRole("button", { name: /Download CSV/i }).click();

    const download = await page.waitForEvent("download");
    const downloadPath = await download.path();
    expect(downloadPath).toBeTruthy();
    const exported = await fs.readFile(downloadPath!, "utf-8");
    expect(exported.trim().split("\n")).toHaveLength(3);
  });
});
