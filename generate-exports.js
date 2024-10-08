const fs = require('fs');
const path = require('path');

function getFilesRecursively(src, dest) {
    let files = [];
    const items = fs.readdirSync(src);
    const destFileName = path.basename(dest);

    for (const item of items) {
        const itemPath = path.join(src, item);
        const stat = fs.statSync(itemPath);

        if (stat.isDirectory()) {
            files = files.concat(getFilesRecursively(itemPath, dest));
        } else if (item !== destFileName) {
            files.push(itemPath);
        }
    }

    return files;
}

function generateExports(src, dest) {
    const files = getFilesRecursively(src, dest);
    const exports = files
        .map(file => {
            const relativePath = path.relative(path.dirname(dest), file).replace(/\\/g, '/').replace(/\.ts$/, '');
            return `export * from './${relativePath}';`;
        });

    fs.writeFileSync(dest, exports.join('\n'), 'utf-8');
}

const args = process.argv.slice(2);
const srcDir = path.resolve(args[0]);
const destFile = path.resolve(args[1]);

generateExports(srcDir, destFile);