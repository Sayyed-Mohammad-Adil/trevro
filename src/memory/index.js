/*
 ≡  ══════════════════════════════════════◈═════════════════════════════════════
 ≡  ooooooooooooo                                                                 
 ≡  8'   888   `8                                                                 
 ≡       888      oooo d8b  .ooooo.  oooo    ooo oooo    ooo oooo d8b  .ooooo.    
 ≡       888      `888""8P d88' `88b  `88.  .8'   `88.  .8'  `888""8P d88' `88b   
 ≡       888       888     888ooo888   `88..8'     `88..8'    888     888   888   
 ≡       888       888     888    .o    `888'       `888'     888     888   888   
 ≡      o888o     d888b    `Y8bod8P'     `8'         .8'     d888b    `Y8bod8P'   
 ≡                                               .o..P'                           
 ≡                                               `Y8P'                            
 ≡  ══════════════════════════════════════◈═════════════════════════════════════
 ≡  ≡≡≡≡≡≡≡≡ ⟦ Author   ⟧  Sayyed Mohammad Adil ≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡ 
 ≡  ≡≡≡≡≡≡≡≡ ⟦ Updated  ⟧  01/04/2025 • 00:00:00 AM ≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡ 
 ≡  ≡≡≡≡≡≡≡≡ ⟦ License  ⟧  Copyright © 2025–2026. All rights reserved. ≡≡≡≡≡≡≡≡≡ 
 ≡  ══════════════════════════════════════◈═════════════════════════════════════
 */

// var memwatch = require('memwatch-next');
// var logger = require('winston');
// memwatch.on('leak', function(info) {
//     logger.warn('MEMORY LEAK: ');
//     logger.warn(info);
// });
//
// var filename = 'memstats.csv';
// var firstLine = true;
//
// memwatch.on("stats", function(stats) {
//     var fs = require("fs"),
//         info = [];
//
//     if(firstLine) {
//         info.push("num_full_gc");
//         info.push("num_inc_gc");
//         info.push("heap_compactions");
//         info.push("usage_trend");
//         info.push("estimated_base");
//         info.push("current_base");
//         info.push("min");
//         info.push("max");
//         fs.appendFileSync(filename, info.join(",") + "\n");
//         info = [];
//         firstLine = false;
//     }
//
//     info.push(stats["num_full_gc"]);
//     info.push(stats["num_inc_gc"]);
//     info.push(stats["heap_compactions"]);
//     info.push(stats["usage_trend"]);
//     info.push(stats["estimated_base"]);
//     info.push(stats["current_base"]);
//     info.push(stats["min"]);
//     info.push(stats["max"]);
//
//     fs.appendFile(filename, info.join(",") + "\n");
// });
