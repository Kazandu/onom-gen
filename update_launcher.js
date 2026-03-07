const fs = require('fs');
const path = require('path');

// 設定
const TARGET_DIR = __dirname; // スクリプトと同じディレクトリを対象
const INDEX_FILENAME = 'index.html';
const EXCLUDED_FILES = [INDEX_FILENAME, 'template.html', '404.html']; // 除外したいファイル

// メイン処理
try {
    const indexPath = path.join(TARGET_DIR, INDEX_FILENAME);
    
    // 1. ディレクトリ内のHTMLファイルを取得
    const files = fs.readdirSync(TARGET_DIR).filter(file => {
        return file.endsWith('.html') && !EXCLUDED_FILES.includes(file);
    });

    // 2. ファイル名でソート (数値順: sketch2 -> sketch10)
    files.sort((a, b) => {
        return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
    });

    // 3. 各ファイルから情報を抽出してリストアイテムHTMLを生成
    const listItems = files.map(file => {
        const filePath = path.join(TARGET_DIR, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // <title>タグの中身を抽出
        const titleMatch = content.match(/<title>(.*?)<\/title>/i);
        let title = titleMatch ? titleMatch[1] : file;

        // タイトルの整形 (プレフィックス削除など)
        title = title.replace('VJ Material Generator - ', '')
                     .replace('VJ Procedural Generator - ', '')
                     .replace('Sketch - ', '');

        return `        <li><a href="${file}"><span class="title">${title}</span><span class="filename">${file}</span></a></li>`;
    });

    // 4. index.html を読み込んで更新
    if (fs.existsSync(indexPath)) {
        let indexContent = fs.readFileSync(indexPath, 'utf-8');
        
        // <ul>...</ul> の中身を置換
        const ulRegex = /(<ul>)([\s\S]*?)(<\/ul>)/i;
        
        if (ulRegex.test(indexContent)) {
            const newUlContent = `<ul>\n${listItems.join('\n')}\n    </ul>`;
            const updatedContent = indexContent.replace(ulRegex, newUlContent);
            
            fs.writeFileSync(indexPath, updatedContent, 'utf-8');
            console.log(`✅ Success: Added ${files.length} sketches to ${INDEX_FILENAME}`);
        } else {
            console.error(`❌ Error: <ul> tag not found in ${INDEX_FILENAME}`);
        }
    } else {
        console.error(`❌ Error: ${INDEX_FILENAME} not found`);
    }

} catch (err) {
    console.error('❌ An error occurred:', err);
}