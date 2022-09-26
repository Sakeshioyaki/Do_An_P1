import alonhadat from "./crawl_func/alonhadat.js";
import homedy from "./crawl_func/homedy.js";
import phongtro123 from "./crawl_func/phongtro123.js";

// thu thập dữ liệu từ alonhadat.vn
await alonhadat.alonhadat();

// thu thập dữ liệu từ homedy.vn
await homedy.homedy();

// thu thập dữ liệu từ phongtro123.vn
await phongtro123.phongtro123();
console.log("CRAWL DONE");
