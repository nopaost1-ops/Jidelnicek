import fs from 'node:fs';
const file='build-food-images.mjs';
let s=fs.readFileSync(file,'utf8');
s=s.replace("import archiver from 'archiver';","import { ZipArchive } from 'archiver';");
s=s.replace(/archiver\(['\"]zip['\"],\s*\{zlib:\s*\{level:\s*9\}\}\)/g,"new ZipArchive({zlib:{level:9}})");
if(!s.includes("import { ZipArchive } from 'archiver';")||!s.includes('new ZipArchive('))throw new Error('Archiver patch was not applied; inspect build-food-images.mjs');
fs.writeFileSync(file,s);
console.log('build-food-images.mjs updated for archiver 8 ESM');
